"""
🧠 SMART TABLE ALLOCATION SERVICE
================================
Optimized table allocation algorithm that:
1. Matches guest count to optimal table capacity (no 6-seater for 4 guests if 4-seater available)
2. Considers time slots and existing reservations
3. Maximizes table turnover efficiency
4. Handles special requirements (wheelchair, window, etc.)
5. Supports table combinations for large groups
"""

from datetime import datetime, date, timedelta
from typing import List, Optional, Tuple
from app.models.table import (
    Table, TableReservation, TableStatus, TableLocation,
    ReservationStatus, SmartAllocationRequest, SmartAllocationResult,
    TableAvailabilitySlot
)
from app.models.restaurant import Branch


class SmartTableAllocator:
    """
    Intelligent table allocation system that optimizes:
    - Capacity utilization (no wasted seats)
    - Time slot management
    - Guest preferences
    - Table turnover efficiency
    """
    
    # Efficiency thresholds
    MIN_EFFICIENCY = 0.5  # Minimum 50% capacity utilization
    IDEAL_EFFICIENCY = 0.75  # 75%+ is ideal
    BUFFER_TIME_MINUTES = 15  # Buffer between reservations
    
    @staticmethod
    def calculate_efficiency(guest_count: int, table_capacity: int) -> float:
        """
        Calculate efficiency score (0-100)
        Higher score = better table utilization
        
        Example:
        - 4 guests on 4-seater = 100% efficiency
        - 4 guests on 6-seater = 66% efficiency (wasteful)
        - 3 guests on 4-seater = 75% efficiency (acceptable)
        """
        if table_capacity == 0:
            return 0
        return (guest_count / table_capacity) * 100
    
    @staticmethod
    def is_table_suitable(table: Table, guest_count: int) -> bool:
        """
        Check if table is suitable for the guest count
        
        Rules:
        - Guest count must be >= table's minimum capacity
        - Guest count must be <= table's maximum capacity
        """
        return table.min_capacity <= guest_count <= table.capacity
    
    @staticmethod
    async def get_table_reservations_for_date(
        branch_id: str,
        target_date: date
    ) -> List[TableReservation]:
        """Get all reservations for a branch on a specific date"""
        reservations = await TableReservation.find(
            TableReservation.branch_id == branch_id,
            TableReservation.reservation_date == target_date
        ).to_list()
        
        # Filter by status
        return [r for r in reservations if r.status in [
            ReservationStatus.PENDING,
            ReservationStatus.CONFIRMED,
            ReservationStatus.SEATED
        ]]
    
    @staticmethod
    def parse_time(time_str: str) -> datetime:
        """Parse HH:MM time string to datetime"""
        hours, minutes = map(int, time_str.split(':'))
        return datetime.now().replace(hour=hours, minute=minutes, second=0, microsecond=0)
    
    @staticmethod
    def is_time_slot_available(
        table_id: str,
        start_time: str,
        duration_minutes: int,
        existing_reservations: List[TableReservation],
        buffer_minutes: int = 15
    ) -> bool:
        """
        Check if a time slot is available for a table
        
        Considers:
        - Existing reservations
        - Buffer time between reservations
        """
        req_start = SmartTableAllocator.parse_time(start_time)
        req_end = req_start + timedelta(minutes=duration_minutes)
        
        for reservation in existing_reservations:
            if reservation.table_id != table_id:
                continue
            
            res_start = SmartTableAllocator.parse_time(reservation.reservation_time)
            res_end = SmartTableAllocator.parse_time(reservation.end_time)
            
            # Add buffer
            res_start_with_buffer = res_start - timedelta(minutes=buffer_minutes)
            res_end_with_buffer = res_end + timedelta(minutes=buffer_minutes)
            
            # Check overlap
            if not (req_end <= res_start_with_buffer or req_start >= res_end_with_buffer):
                return False
        
        return True
    
    @staticmethod
    def score_table(
        table: Table,
        guest_count: int,
        preferences: Optional[List[TableLocation]] = None,
        special_requirements: Optional[List[str]] = None
    ) -> Tuple[float, str]:
        """
        Score a table based on multiple factors
        
        Returns: (score, reasoning)
        
        Scoring factors:
        1. Capacity efficiency (40% weight)
        2. Location preference match (20% weight)
        3. Special requirements match (20% weight)
        4. Historical performance (20% weight)
        """
        score = 0.0
        reasons = []
        
        # 1. Capacity Efficiency (40%)
        efficiency = SmartTableAllocator.calculate_efficiency(guest_count, table.capacity)
        efficiency_score = efficiency * 0.4
        score += efficiency_score
        
        if efficiency >= 80:
            reasons.append(f"Excellent capacity match ({efficiency:.0f}%)")
        elif efficiency >= 60:
            reasons.append(f"Good capacity match ({efficiency:.0f}%)")
        else:
            reasons.append(f"Suboptimal capacity ({efficiency:.0f}%)")
        
        # 2. Location Preference (20%)
        if preferences:
            if table.location in preferences:
                score += 20
                reasons.append(f"Matches preferred location: {table.location.value}")
            else:
                reasons.append("Location preference not matched")
        else:
            score += 10  # Neutral score if no preference
        
        # 3. Special Requirements (20%)
        req_score = 0
        req_matched = []
        if special_requirements:
            for req in special_requirements:
                if req == "wheelchair" and table.is_wheelchair_accessible:
                    req_score += 10
                    req_matched.append("wheelchair accessible")
                elif req == "window" and table.has_window_view:
                    req_score += 10
                    req_matched.append("window view")
                elif req == "power" and table.has_power_outlet:
                    req_score += 5
                    req_matched.append("power outlet")
            
            if req_matched:
                reasons.append(f"Requirements met: {', '.join(req_matched)}")
            score += min(req_score, 20)
        else:
            score += 10  # Neutral score if no requirements
        
        # 4. Historical Performance (20%)
        # Tables with good turnover history get bonus
        if table.total_reservations > 0:
            turnover_score = min(table.total_reservations / 100, 1) * 20
            score += turnover_score
        else:
            score += 10  # New table gets neutral score
        
        reasoning = " | ".join(reasons)
        return score, reasoning
    
    @classmethod
    async def allocate_table(
        cls,
        request: SmartAllocationRequest
    ) -> SmartAllocationResult:
        """
        🎯 MAIN ALLOCATION ALGORITHM
        
        Steps:
        1. Get all tables for the branch
        2. Filter by capacity suitability
        3. Filter by time slot availability
        4. Score and rank remaining tables
        5. Return best match with alternatives
        """
        
        # Step 1: Get all active tables for the branch
        all_tables = await Table.find(
            Table.branch_id == request.branch_id,
            Table.is_active == True
        ).to_list()
        
        # Filter by status
        all_tables = [t for t in all_tables if t.status in [TableStatus.AVAILABLE, TableStatus.RESERVED]]
        
        if not all_tables:
            raise ValueError("No tables available at this branch")
        
        # Step 2: Get existing reservations for the date
        existing_reservations = await cls.get_table_reservations_for_date(
            request.branch_id,
            request.reservation_date
        )
        
        # Step 3: Filter and score tables
        scored_tables = []
        
        for table in all_tables:
            # Check capacity suitability
            if not cls.is_table_suitable(table, request.guest_count):
                continue
            
            # Check time slot availability
            if not cls.is_time_slot_available(
                str(table.id),
                request.reservation_time,
                request.duration_minutes,
                existing_reservations,
                cls.BUFFER_TIME_MINUTES
            ):
                continue
            
            # Score the table
            score, reasoning = cls.score_table(
                table,
                request.guest_count,
                request.preferences,
                request.special_requirements
            )
            
            efficiency = cls.calculate_efficiency(request.guest_count, table.capacity)
            
            scored_tables.append({
                "table": table,
                "score": score,
                "efficiency": efficiency,
                "reasoning": reasoning
            })
        
        if not scored_tables:
            # Try to find combinable tables for large groups
            combined = await cls.find_combinable_tables(
                request.branch_id,
                request.guest_count,
                request.reservation_date,
                request.reservation_time,
                request.duration_minutes,
                existing_reservations
            )
            if combined:
                scored_tables = combined
            else:
                raise ValueError(
                    f"No suitable tables available for {request.guest_count} guests "
                    f"at {request.reservation_time} on {request.reservation_date}"
                )
        
        # Step 4: Sort by score (highest first)
        scored_tables.sort(key=lambda x: x["score"], reverse=True)
        
        # Step 5: Prepare result
        best_table = scored_tables[0]
        alternatives = [
            {
                "table_id": str(t["table"].id),
                "table_number": t["table"].table_number,
                "capacity": t["table"].capacity,
                "score": t["score"],
                "location": t["table"].location.value
            }
            for t in scored_tables[1:4]  # Top 3 alternatives
        ]
        
        return SmartAllocationResult(
            recommended_table_id=str(best_table["table"].id),
            table_number=best_table["table"].table_number,
            capacity=best_table["table"].capacity,
            efficiency_score=best_table["efficiency"],
            location=best_table["table"].location,
            alternative_tables=alternatives,
            reasoning=best_table["reasoning"]
        )
    
    @classmethod
    async def find_combinable_tables(
        cls,
        branch_id: str,
        guest_count: int,
        target_date: date,
        target_time: str,
        duration_minutes: int,
        existing_reservations: List[TableReservation]
    ) -> List[dict]:
        """
        Find tables that can be combined for large groups
        """
        # Get all combinable tables
        combinable_tables = await Table.find(
            Table.branch_id == branch_id,
            Table.is_active == True,
            Table.is_combinable == True
        ).to_list()
        
        # Build adjacency map
        table_map = {str(t.id): t for t in combinable_tables}
        
        # Try to find combinations
        for table in combinable_tables:
            if not cls.is_time_slot_available(
                str(table.id), target_time, duration_minutes,
                existing_reservations, cls.BUFFER_TIME_MINUTES
            ):
                continue
            
            combined_capacity = table.capacity
            combined_tables = [table]
            
            for adj_id in table.adjacent_tables:
                if adj_id in table_map:
                    adj_table = table_map[adj_id]
                    if cls.is_time_slot_available(
                        adj_id, target_time, duration_minutes,
                        existing_reservations, cls.BUFFER_TIME_MINUTES
                    ):
                        combined_capacity += adj_table.capacity
                        combined_tables.append(adj_table)
                        
                        if combined_capacity >= guest_count:
                            efficiency = cls.calculate_efficiency(guest_count, combined_capacity)
                            return [{
                                "table": table,  # Primary table
                                "combined_tables": combined_tables,
                                "score": efficiency * 0.8,  # Slight penalty for combination
                                "efficiency": efficiency,
                                "reasoning": f"Combined {len(combined_tables)} tables for {combined_capacity} seats"
                            }]
        
        return []
    
    @classmethod
    async def get_availability_slots(
        cls,
        branch_id: str,
        target_date: date,
        guest_count: int,
        slot_duration_minutes: int = 90,
        start_hour: int = 11,
        end_hour: int = 22
    ) -> List[TableAvailabilitySlot]:
        """
        Get available time slots for a branch on a specific date
        
        Returns slots in 30-minute intervals with available tables
        """
        slots = []
        existing_reservations = await cls.get_table_reservations_for_date(branch_id, target_date)
        
        all_tables = await Table.find(
            Table.branch_id == branch_id,
            Table.is_active == True
        ).to_list()
        
        suitable_tables = [t for t in all_tables if cls.is_table_suitable(t, guest_count)]
        
        current_time = datetime.now().replace(hour=start_hour, minute=0, second=0)
        end_time = datetime.now().replace(hour=end_hour, minute=0, second=0)
        
        while current_time < end_time:
            time_str = current_time.strftime("%H:%M")
            available_table_ids = []
            
            for table in suitable_tables:
                if cls.is_time_slot_available(
                    str(table.id),
                    time_str,
                    slot_duration_minutes,
                    existing_reservations,
                    cls.BUFFER_TIME_MINUTES
                ):
                    available_table_ids.append(str(table.id))
            
            slots.append(TableAvailabilitySlot(
                time=time_str,
                is_available=len(available_table_ids) > 0,
                available_tables=available_table_ids
            ))
            
            current_time += timedelta(minutes=30)
        
        return slots
    
    @classmethod
    async def get_branch_occupancy_stats(cls, branch_id: str) -> dict:
        """Get real-time occupancy statistics for a branch"""
        total_tables = await Table.find(
            Table.branch_id == branch_id,
            Table.is_active == True
        ).count()
        
        occupied = await Table.find(
            Table.branch_id == branch_id,
            Table.is_active == True,
            Table.status == TableStatus.OCCUPIED
        ).count()
        
        reserved = await Table.find(
            Table.branch_id == branch_id,
            Table.is_active == True,
            Table.status == TableStatus.RESERVED
        ).count()
        
        available = await Table.find(
            Table.branch_id == branch_id,
            Table.is_active == True,
            Table.status == TableStatus.AVAILABLE
        ).count()
        
        # Get total seating capacity
        tables = await Table.find(
            Table.branch_id == branch_id,
            Table.is_active == True
        ).to_list()
        
        total_capacity = sum(t.capacity for t in tables)
        occupied_tables = [t for t in tables if t.status == TableStatus.OCCUPIED]
        current_guests = sum(t.capacity for t in occupied_tables)  # Estimated
        
        return {
            "total_tables": total_tables,
            "occupied": occupied,
            "reserved": reserved,
            "available": available,
            "occupancy_rate": (occupied / total_tables * 100) if total_tables > 0 else 0,
            "total_seating_capacity": total_capacity,
            "estimated_current_guests": current_guests
        }
