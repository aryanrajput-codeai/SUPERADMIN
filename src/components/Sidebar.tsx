import React from 'react';
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

// Navigation configuration array
export const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'restaurants', label: 'Restaurants', icon: UtensilsCrossed },
  { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
  { id: 'payments', label: 'Payments', icon: Receipt },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'support', label: 'Support Queue', icon: LifeBuoy },
  { id: 'settings', label: 'Global Settings', icon: Sliders },
  { id: 'profile', label: 'Admin Profile', icon: User },
];

interface NavItemProps {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  isExpanded: boolean;
  onClick: () => void;
}

// Reusable NavItem component with ARIA labels, focus states, and tooltips
function NavItem({ id, label, icon: Icon, isActive, isExpanded, onClick }: NavItemProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <button
      id={`sidebar-tab-${id}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={`w-full flex items-center rounded-xl text-sm font-medium transition-all relative group h-11 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-indigo-500/40 focus:ring-offset-2 focus:ring-offset-slate-900 ${isExpanded
          ? 'px-3 py-2.5 justify-start gap-3'
          : 'lg:justify-center lg:px-0 px-3 py-2.5 justify-start gap-3'
        } ${isActive
          ? 'text-white bg-indigo-600/15 border border-indigo-500/10 shadow-sm'
          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
        }`}
      aria-label={label}
      aria-current={isActive ? 'page' : undefined}
    >
      <div className={`flex items-center ${isExpanded ? 'space-x-3' : 'lg:space-x-0 space-x-3'}`}>
        <Icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-105 duration-200 ${isActive ? 'text-indigo-400' : 'text-slate-400 opacity-70 group-hover:text-indigo-400'}`} />
        <span className={`transition-all duration-200 origin-left whitespace-nowrap ${isExpanded ? 'opacity-100 scale-100' : 'lg:opacity-0 lg:scale-95 lg:hidden opacity-100 scale-100'}`}>
          {label}
        </span>
      </div>

      {isActive && isExpanded && (
        <ChevronRight className="ml-auto w-4 h-4 text-indigo-400 shrink-0" />
      )}

      {/* Hover Tooltip when collapsed */}
      {!isExpanded && (
        <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-950 text-slate-200 text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 group-hover:translate-x-1 pointer-events-none transition-all duration-150 z-50 whitespace-nowrap shadow-xl border border-slate-800 hidden lg:block">
          {label}
        </span>
      )}
    </button>
  );
}

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  adminName: string;
  adminEmail: string;
  isExpanded: boolean;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  onLogout,
  adminName,
  adminEmail,
  isExpanded,
  isMobileOpen,
  onCloseMobile
}: SidebarProps) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex flex-col h-screen bg-[#0f172a] text-slate-300 border-r border-slate-800 transition-[width,transform] duration-200 ease-in-out ${isMobileOpen ? 'translate-x-0 shadow-[5px_0_30px_rgba(0,0,0,0.4)]' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:flex ${isExpanded ? 'w-[260px]' : 'lg:w-[72px] w-[260px]'
        }`}
    >
      {/* Brand Header */}
      <div className={`p-6 flex items-center gap-3 border-b border-slate-800/40 h-16 shrink-0 ${isExpanded ? 'justify-start' : 'lg:justify-center justify-start'}`}>
        <div className="w-8 h-8 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center text-white font-extrabold shadow-md shadow-indigo-600/20 shrink-0">
          WR
        </div>
        <span className={`text-white font-semibold tracking-tight text-lg transition-all duration-200 whitespace-nowrap ${isExpanded ? 'opacity-100 scale-100' : 'lg:opacity-0 lg:scale-95 lg:hidden opacity-100 scale-100'}`}>
          WebRajya <span className="text-indigo-400 font-bold">POS</span>
        </span>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto scrollbar-none">
        {MENU_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <NavItem
              key={item.id}
              id={item.id}
              label={item.label}
              icon={item.icon}
              isActive={isActive}
              isExpanded={isExpanded}
              onClick={() => {
                setActiveTab(item.id);
                onCloseMobile();
              }}
            />
          );
        })}
      </nav>

      {/* Profile & Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/30 flex flex-col gap-4 shrink-0">
        <div className={`flex items-center space-x-3 px-2 ${isExpanded ? 'justify-start' : 'lg:justify-center justify-start'}`}>
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&q=80"
            alt="Admin Avatar"
            className="w-10 h-10 rounded-full ring-2 ring-indigo-500/20 object-cover shrink-0"
          />
          <div className={`overflow-hidden transition-all duration-200 ${isExpanded ? 'opacity-100 w-auto' : 'lg:opacity-0 lg:w-0 lg:hidden opacity-100'}`}>
            <p className="font-semibold text-xs text-slate-100 truncate">{adminName}</p>
            <p className="text-[10px] text-slate-500 truncate">{adminEmail}</p>
          </div>
        </div>

        <button
          id="btn-sidebar-logout"
          onClick={onLogout}
          className={`w-full flex items-center rounded-xl text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer h-11 focus:outline-hidden focus:ring-2 focus:ring-rose-500/40 ${isExpanded ? 'px-3.5 py-2.5 justify-start space-x-3' : 'lg:justify-center lg:space-x-0 lg:px-0 px-3.5 py-2.5 justify-start space-x-3'
            }`}
          aria-label="Sign Out Portal"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span className={`transition-all duration-200 whitespace-nowrap ${isExpanded ? 'opacity-100 scale-100' : 'lg:opacity-0 lg:scale-95 lg:hidden opacity-100 scale-100'}`}>
            Sign Out Portal
          </span>
        </button>
      </div>
    </aside>
  );
}
