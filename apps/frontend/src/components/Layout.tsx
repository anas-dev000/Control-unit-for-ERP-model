import React, { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  FileText, 
  CreditCard, 
  Settings, 
  LogOut, 
  Menu,
  X,
  Building2,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { useState } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const SidebarLink = ({ to, icon: Icon, label, collapsed }: { to: string, icon: any, label: string, collapsed: boolean }) => (
  <NavLink
    to={to}
    className={({ isActive }) => cn(
      'flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group relative',
      isActive 
        ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' 
        : 'text-slate-500 hover:bg-slate-50 hover:text-primary-600'
    )}
  >
    <Icon className={cn('w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110')} />
    {!collapsed && (
      <span className="font-semibold whitespace-nowrap overflow-hidden transition-all text-sm">{label}</span>
    )}
    {!collapsed && (
      <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
    )}
    {collapsed && (
      <div className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all whitespace-nowrap z-50">
        {label}
      </div>
    )}
  </NavLink>
);

export default function Layout({ children }: LayoutProps) {
  const { user, tenant, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on desktop resize
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { to: '/', icon: BarChart3, label: 'Dashboard' },
    { to: '/customers', icon: Users, label: 'Customers' },
    { to: '/invoices', icon: FileText, label: 'Invoices' },
    { to: '/payments', icon: CreditCard, label: 'Payments' },
    { to: '/reports', icon: BarChart3, label: 'Reports' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Sidebar - Desktop */}
      <aside 
        className={cn(
          'fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-100 transition-all duration-500 ease-in-out hidden lg:flex flex-col',
          collapsed ? 'w-24' : 'w-72'
        )}
      >
        <div className="h-20 flex items-center px-6 mb-4">
          <div className="p-2.5 bg-primary-600 rounded-xl shadow-lg shadow-primary-100">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <span className="ml-3 font-extrabold text-xl text-slate-900 tracking-tight">AccounFlow</span>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => (
            <SidebarLink key={item.to} {...item} collapsed={collapsed} />
          ))}
        </nav>

        <div className="p-4 border-t border-slate-50">
          <div 
            className={cn(
              'bg-slate-50 rounded-2xl p-4 transition-all duration-300',
              collapsed ? 'items-center overflow-hidden' : 'flex items-center gap-3'
            )}
          >
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 font-bold shrink-0 shadow-inner">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{user?.firstName} {user?.lastName}</p>
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 truncate">{tenant?.name}</p>
              </div>
            )}
          </div>
          
          <button 
            onClick={logout}
            className={cn(
              'mt-2 w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 transition-colors group',
              collapsed && 'justify-center'
            )}
          >
            <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            {!collapsed && <span className="font-semibold text-sm">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main 
        className={cn(
          'flex-1 transition-all duration-500 min-h-screen flex flex-col',
          'lg:ml-72',
          collapsed && 'lg:ml-24'
        )}
      >
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors hidden lg:block"
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            <button 
              onClick={() => setMobileOpen(true)}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors lg:hidden"
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            <div className="h-8 w-[1px] bg-slate-100 hidden sm:block mx-2" />
            <h2 className="font-bold text-slate-800 text-lg hidden sm:block">
              {tenant?.name} <span className="text-slate-400 font-medium mx-2">/</span> Overview
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end mr-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Logged in as</span>
              <span className="text-sm font-bold text-slate-700">{user?.role}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <section className="p-4 sm:p-8 flex-1">
          {children}
        </section>
      </main>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 lg:hidden animate-in fade-in duration-300"
          onClick={() => setMobileOpen(false)}
        >
          <div 
            className="w-72 h-full bg-white p-6 animate-in slide-in-from-left duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center">
                <div className="p-2 bg-primary-600 rounded-xl">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <span className="ml-3 font-extrabold text-xl text-slate-900 tracking-tight">AccounFlow</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-2 hover:bg-slate-50 rounded-xl">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            <nav className="space-y-4">
              {menuItems.map((item) => (
                <SidebarLink key={item.to} {...item} collapsed={false} />
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
