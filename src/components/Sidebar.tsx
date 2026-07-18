import React from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  CreditCard, 
  Receipt, 
  BarChart3, 
  LifeBuoy, 
  Sliders, 
  User, 
  LogOut,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  adminName: string;
  adminEmail: string;
}

export default function Sidebar({ activeTab, setActiveTab, onLogout, adminName, adminEmail }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'restaurants', label: 'Restaurants', icon: UtensilsCrossed },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
    { id: 'payments', label: 'Payments', icon: Receipt },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'support', label: 'Support Queue', icon: LifeBuoy },
    { id: 'settings', label: 'Global Settings', icon: Sliders },
    { id: 'profile', label: 'Admin Profile', icon: User },
  ];

  return (
    <div className="w-64 bg-[#0f172a] text-slate-300 flex flex-col h-screen border-r border-slate-800 shrink-0 z-20">
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
          WR
        </div>
        <span className="text-white font-semibold tracking-tight text-lg">
          WebRajya <span className="text-indigo-400">POS</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto scrollbar-none">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              id={`sidebar-tab-${item.id}`}
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-sm font-medium transition-all relative group ${
                isActive 
                  ? 'text-white bg-indigo-600/10' 
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'text-slate-400 opacity-60 group-hover:text-indigo-400'}`} />
                <span>{item.label}</span>
              </div>

              {isActive && (
                <ChevronRight className="w-4 h-4 text-indigo-400" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Profile & Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center space-x-3 mb-4 px-2">
          <img 
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&q=80" 
            alt="Admin Avatar" 
            className="w-10 h-10 rounded-full ring-2 ring-indigo-500/20 object-cover"
          />
          <div className="overflow-hidden">
            <p className="font-semibold text-xs text-slate-100 truncate">{adminName}</p>
            <p className="text-[10px] text-slate-500 truncate">{adminEmail}</p>
          </div>
        </div>
        
        <button
          id="btn-sidebar-logout"
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="w-4.5 h-4.5" />
          <span>Sign Out Portal</span>
        </button>
      </div>
    </div>
  );
}
