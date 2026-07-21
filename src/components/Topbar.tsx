import React, { useState } from 'react';
import {
  Bell,
  Search,
  Sun,
  Moon,
  Settings,
  ShieldAlert,
  ChevronDown,
  CheckCircle2,
  Clock,
  HelpCircle,
  Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TopbarProps {
  activeTab: string;
  adminName: string;
  onSearchChange?: (val: string) => void;
  searchValue?: string;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  onOpenWizard: () => void;
  onToggleSidebar: () => void;
}

export default function Topbar({
  activeTab,
  adminName,
  onSearchChange,
  searchValue = '',
  isDarkMode,
  setIsDarkMode,
  onOpenWizard,
  onToggleSidebar
}: TopbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifications = [
    { id: 1, text: "New support ticket: 'Upgrade subscription limits for branches' from Tikka & More.", type: 'critical', time: '5 mins ago', read: false },
    { id: 2, text: "Payment Successful: Received ₹14,999 from The Golden Saffron.", type: 'success', time: '1 hour ago', read: true },
    { id: 3, text: "System Alert: Maintenance mode sandbox testing complete.", type: 'info', time: '3 hours ago', read: true },
    { id: 4, text: "Subscription Renewal: Bake & Brew Cafe upgraded to Starter Plan.", type: 'success', time: '1 day ago', read: true }
  ];

  const getBreadcrumbLabel = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard Overview';
      case 'restaurants': return 'Tenant Restaurants Directory';
      case 'subscriptions': return 'SaaS Subscription Plans';
      case 'payments': return 'Payments & Revenue Audit';
      case 'analytics': return 'Enterprise Analytics';
      case 'support': return 'Support Desk Queue';
      case 'settings': return 'Global System Settings';
      case 'profile': return 'Admin User Profile';
      default: return 'Control Panel';
    }
  };

  return (
    <div className="h-16 border-b border-slate-200 bg-white px-4 md:px-8 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      {/* Breadcrumb section */}
      <div className="flex items-center gap-2 md:gap-3 text-sm font-medium text-slate-500">
        <button
          id="btn-toggle-sidebar"
          onClick={onToggleSidebar}
          className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-950 transition-colors mr-1 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
          aria-label="Toggle Sidebar Menu"
        >
          <Menu className="w-5 h-5 text-slate-600" />
        </button>

        <span className="hidden sm:inline text-slate-400">WebRajya Portal</span>
        <svg className="w-3 h-3 text-slate-300 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
        </svg>
        <span className="text-slate-900 font-semibold">{getBreadcrumbLabel()}</span>
      </div>

      {/* Utilities */}
      <div className="flex items-center space-x-6">
        {/* Global Search (Active when on restaurants) */}
        {activeTab === 'restaurants' && onSearchChange && (
          <div className="relative w-64">
            <input
              id="global-search-input"
              type="text"
              placeholder="Search restaurants..."
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-sm border border-slate-200 rounded-lg w-64 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          </div>
        )}

        {/* Quick Add Button */}
        <button
          id="btn-quick-add-restaurant"
          onClick={onOpenWizard}
          className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition-all cursor-pointer"
        >
          + Add Restaurant
        </button>

        {/* Dark Mode Mock Toggle */}
        <button
          id="btn-toggle-theme"
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-950 transition-colors"
          title="Toggle Simulation Mode"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            id="btn-notification-bell"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-950 transition-colors relative"
          >
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
          </button>

          {/* Notifications Dropdown */}
          <AnimatePresence>
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setShowNotifications(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-100 z-30 p-1"
                >
                  <div className="p-3 border-b border-slate-50 flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-800">Alerts & System Notifications</span>
                    <span className="text-[10px] text-indigo-600 font-medium bg-indigo-50 px-1.5 py-0.5 rounded-sm">1 New</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                    {notifications.map((notif) => (
                      <div key={notif.id} className="p-3 hover:bg-slate-50/50 transition-colors">
                        <div className="flex space-x-2">
                          {notif.type === 'critical' ? (
                            <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          ) : notif.type === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          ) : (
                            <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <p className="text-[11px] text-slate-700 leading-normal font-medium">{notif.text}</p>
                            <span className="text-[9px] text-slate-400 mt-1 block">{notif.time}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            id="btn-profile-dropdown"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-2 focus:outline-hidden cursor-pointer"
          >
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&q=80"
              alt="Admin Profile"
              className="w-8 h-8 rounded-full border border-slate-200 object-cover"
            />
            <span className="text-xs font-semibold text-slate-700 hidden md:block">{adminName}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <AnimatePresence>
            {showProfileMenu && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setShowProfileMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-slate-100 z-30 p-1 font-sans"
                >
                  <div className="px-3 py-2 border-b border-slate-50">
                    <p className="text-xs font-semibold text-slate-800">{adminName}</p>
                    <p className="text-[10px] text-slate-400">Owner Access</p>
                  </div>
                  <button
                    onClick={() => { setShowProfileMenu(false); }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    <span>User Settings</span>
                  </button>
                  <button
                    onClick={() => { setShowProfileMenu(false); }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                    <span>Documentation</span>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
