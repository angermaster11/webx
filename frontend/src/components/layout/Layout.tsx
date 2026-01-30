import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

interface LayoutProps {
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
}

export default function Layout({ isAdmin, isSuperAdmin }: LayoutProps) {
  // For admin layouts, we might want different navigation
  if (isAdmin || isSuperAdmin) {
    return (
      <div className="min-h-screen bg-dark-bg">
        <Navbar />
        <main className="pt-4">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
