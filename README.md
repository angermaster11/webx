<div align="center">

<img src="https://img.shields.io/badge/DineFlow-Restaurant%20SaaS-f59e0b?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2Y1OWUwYiIgZD0iTTExIDJ2Mmgtdi4xODVBNyA3IDAgMCAwIDUgOXY2bC0yIDJ2MWgxOHYtMWwtMi0yVjlhNyA3IDAgMCAwLTYtNS44MTVWMmgtMnptMSAxOGE0IDQgMCAwIDAgNC00SDhhNCA0IDAgMCAwIDQgNHoiLz48L3N2Zz4=" alt="DineFlow" />

# 🍽️ DineFlow

### Production-Grade Restaurant SaaS Platform

*Full-stack web application for multi-restaurant management — orders, reservations, menus, KDS & smart table allocation*

<br/>

[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.x-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

<br/>

</div>

---

## 📸 Overview

DineFlow is a **multi-tenant restaurant SaaS** platform that lets super admins, restaurant owners, and customers interact through a unified system — from browsing menus and placing orders, to smart table reservations and live kitchen dashboards.

---

## ✨ Features

| Module | Features |
|---|---|
| 🔐 **Auth** | JWT login/register, OTP verification, role-based access (super\_admin / restaurant\_admin / customer) |
| 🏪 **Restaurants** | Multi-restaurant, multi-branch support, slugs, featured listing, commission management |
| 🍕 **Menu** | Categories + items, variants & addons, discount pricing, veg/non-veg/vegan tags, availability toggle |
| 📦 **Orders** | Full order lifecycle (placed → confirmed → preparing → ready → delivered), KDS view, live stats |
| 🪑 **Tables** | Smart auto-allocation engine, combinable tables, availability slots, reservation lifecycle |
| 📊 **Admin** | Super admin dashboard, revenue analytics, user management, restaurant oversight |
| 🔔 **Notifications** | In-app notification system for orders, reservations, and promotions |
| ⭐ **Reviews** | Verified purchase reviews with food/service/ambience/value rating breakdown |

---

## 🏗️ Architecture

```
web/
├── backend-node/          # Node.js + Express + MongoDB API
│   ├── src/
│   │   ├── config/        # env, db, cors
│   │   ├── controllers/   # auth, admin, restaurant, menu, orders, tables
│   │   ├── middleware/     # auth (JWT + RBAC), validate (Joi), errorHandler, asyncHandler
│   │   ├── models/        # 11 Mongoose schemas (User, Restaurant, Branch, Menu, Table, Order, ...)
│   │   ├── routes/        # 6 route groups under /api/v1
│   │   ├── services/      # Smart Table Allocator
│   │   ├── utils/         # helpers (JWT, bcrypt, OTP, slugs)
│   │   └── validators/    # Joi schemas
│   └── package.json
│
└── frontend/              # React 18 + TypeScript + Vite
    ├── src/
    │   ├── components/    # Reusable UI (Navbar, Footer, Spinner)
    │   ├── pages/         # LandingPage, Restaurants, Cart, Checkout, Admin, Dashboard...
    │   ├── services/      # axios API client
    │   ├── store/         # Zustand (auth, cart)
    │   └── types/         # TypeScript interfaces
    └── package.json
```

---

## 🧠 Smart Table Allocator

The table allocation engine scores each available table using a weighted algorithm:

| Factor | Weight | Description |
|---|---|---|
| Capacity fit | **40%** | Prefers the tightest fit (avoids oversized tables) |
| Location preference | **20%** | Matches customer's preferred seating (window, terrace, etc.) |
| Special features | **20%** | Wheelchair access, power outlet, high chair, view |
| Booking history | **20%** | Prefers tables with better avg dining experience |

If no single table fits, the engine automatically combines adjacent **combinable** tables with a 15-minute buffer overlap check.

---

## 🚀 Getting Started

### Prerequisites

- Node.js `>= 18`
- MongoDB running locally on `27017`
- pnpm / npm / yarn

---

### 1. Clone & Install

```bash
git clone https://github.com/angermaster11/webx.git
cd webx

# Backend
cd backend-node && npm install

# Frontend
cd ../frontend && npm install
```

---

### 2. Configure Environment

```bash
cp backend-node/.env.example backend-node/.env
```

Edit `backend-node/.env`:

```env
PORT=8001
MONGODB_URI=mongodb://localhost:27017/restaurant_saas
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRES_IN_MINUTES=1440
FRONTEND_URL=http://localhost:5173
DEBUG_MODE=false
```

---

### 3. Seed the Database

```bash
cd backend-node
npm run seed
```

This creates **5 restaurants**, **15 branches**, **75+ tables**, **100+ menu items**, sample users and reviews.

---

### 4. Run Development Servers

```bash
# Terminal 1 — Backend (http://localhost:8001)
cd backend-node && npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd frontend && npm run dev
```

---

## 🔑 Default Credentials

| Role | Email | Password |
|---|---|---|
| Super Admin | `admin@dineflow.com` | `Admin@123` |
| Restaurant Admin | `spice@dineflow.com` | `Admin@123` |
| Customer | `customer@example.com` | `Customer@123` |

---

## 📡 API Reference

Base URL: `http://localhost:8001/api/v1`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | ─ | Register new user |
| `POST` | `/auth/login` | ─ | Login, get JWT token |
| `GET` | `/auth/me` | 🔐 | Get current user profile |
| `GET` | `/restaurants` | ─ | List all restaurants |
| `GET` | `/restaurants/featured` | ─ | Featured restaurants |
| `GET` | `/restaurants/:slug` | ─ | Restaurant detail |
| `GET` | `/menu/items/:restaurantId` | ─ | Menu items |
| `POST` | `/orders` | 🔐 | Place an order |
| `GET` | `/orders/my-orders` | 🔐 | Customer's orders |
| `POST` | `/tables/reserve` | 🔐 | Create reservation |
| `POST` | `/tables/smart-allocation` | 🔐 | Find best table |
| `GET` | `/admin/dashboard` | 👑 | Super admin stats |

> Full API documentation: [`/health`](http://localhost:8001/health) returns server status.

---

## 🛠️ Tech Stack

### Backend
| Package | Version | Purpose |
|---|---|---|
| `express` | 4.x | HTTP framework |
| `mongoose` | 8.x | MongoDB ODM |
| `jsonwebtoken` | 9.x | JWT auth |
| `bcryptjs` | 2.x | Password hashing |
| `joi` | 17.x | Request validation |
| `helmet` | 7.x | HTTP security headers |
| `express-rate-limit` | 7.x | Rate limiting |
| `compression` | 1.x | Gzip compression |
| `morgan` | 1.x | HTTP request logging |
| `multer` | 1.x | File uploads |

### Frontend
| Package | Version | Purpose |
|---|---|---|
| `react` | 18.x | UI framework |
| `typescript` | 5.x | Type safety |
| `vite` | 5.x | Build tool |
| `tailwindcss` | 3.x | Utility-first CSS |
| `zustand` | 4.x | State management |
| `@tanstack/react-query` | 5.x | Server state / caching |
| `axios` | 1.x | HTTP client |
| `framer-motion` | 10.x | Animations |
| `react-hook-form` + `zod` | — | Form validation |
| `react-hot-toast` | 2.x | Toast notifications |

---

## 📁 Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `8001` | API server port |
| `MONGODB_URI` | `mongodb://localhost:27017/restaurant_saas` | MongoDB connection string |
| `JWT_SECRET` | *(required)* | Secret for signing JWTs |
| `JWT_EXPIRES_IN_MINUTES` | `1440` | Token expiry (24h) |
| `FRONTEND_URL` | `http://localhost:5173` | CORS allowed origin |
| `DEBUG_MODE` | `false` | Verbose logging |
| `UPLOAD_DIR` | `uploads/` | File upload directory |
| `MAX_FILE_SIZE` | `5242880` | Max upload size (5MB) |

---

## 🗂️ Project Status

- [x] Backend scaffold & config
- [x] All 11 Mongoose models
- [x] JWT auth with role-based access control
- [x] Auth routes & controller
- [x] Admin dashboard & management
- [x] Restaurant & branch management
- [x] Menu (categories + items) CRUD
- [x] Full order lifecycle with KDS
- [x] Smart Table Allocator service
- [x] Table & reservation management
- [x] Database seed script
- [ ] WebSocket real-time order updates
- [ ] Email / SMS notifications
- [ ] File upload for menu images
- [ ] Payment gateway integration
- [ ] Mobile app (React Native)

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch — `git checkout -b feature/amazing-feature`
3. Commit your changes — `git commit -m 'feat: add amazing feature'`
4. Push to branch — `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT © [angermaster11](https://github.com/angermaster11)

---

<div align="center">
  <sub>Built with ❤️ and ☕ — DineFlow v1.0.0</sub>
</div>
