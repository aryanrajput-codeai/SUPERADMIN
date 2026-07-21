import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock,
  ShieldCheck,
  Mail,
  ArrowRight,
  User,
  AlertTriangle,
  Sparkles,
  Building
} from 'lucide-react';

// Components
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import DashboardView from './components/DashboardView';
import RestaurantsView from './components/RestaurantsView';
import RestaurantDetailsView from './components/RestaurantDetailsView';
import AddRestaurantWizard from './components/AddRestaurantWizard';
import SubscriptionsView from './components/SubscriptionsView';
import PaymentsView from './components/PaymentsView';
import AnalyticsView from './components/AnalyticsView';
import SupportView from './components/SupportView';
import SettingsView from './components/SettingsView';
import ProfileView from './components/ProfileView';

// Services & Store
import { dbStore } from './utils/mockData';
import { supabaseService, isSupabaseConfigured } from './supabase';
import { Restaurant, RestaurantStatus, SubscriptionPlanTier, TicketStatus, GlobalSettings } from './types';

export default function App() {
  // Session Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('wr_is_logged_in') === 'true';
  });
  const [authEmail, setAuthEmail] = useState<string>('');
  const [authPassword, setAuthPassword] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [adminUser, setAdminUser] = useState(() => {
    const saved = localStorage.getItem('wr_admin_user');
    return saved ? JSON.parse(saved) : { name: 'Aryan Rajput', email: 'aiaryanrajput@gmail.com' };
  });

  // Global POS SaaS database states
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [payments, setPayments] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [branches, setBranches] = useState([]);
  const [logs, setLogs] = useState([]);
  const [settings, setSettings] = useState<GlobalSettings | null>(null);

  // Tab Selection State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);

  // Utilities UI State
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Layout Navigation State
  const [isExpanded, setIsExpanded] = useState<boolean>(() => {
    const saved = localStorage.getItem('wr_sidebar_expanded');
    return saved ? JSON.parse(saved) : false;
  });
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  const toggleSidebar = () => {
    if (window.innerWidth >= 1024) {
      setIsExpanded(prev => {
        const next = !prev;
        localStorage.setItem('wr_sidebar_expanded', JSON.stringify(next));
        return next;
      });
    } else {
      setIsMobileOpen(prev => !prev);
    }
  };

  // Load from database store on start
  useEffect(() => {
    setRestaurants([...dbStore.restaurants]);
    setPayments([...dbStore.payments as any]);
    setTickets([...dbStore.tickets as any]);
    setBranches([...dbStore.branches as any]);
    setLogs([...dbStore.logs as any]);
    setSettings({ ...dbStore.settings });
  }, []);

  // Update localStorage session helpers
  const saveSession = (loggedIn: boolean, user: any) => {
    setIsLoggedIn(loggedIn);
    localStorage.setItem('wr_is_logged_in', String(loggedIn));
    localStorage.setItem('wr_admin_user', JSON.stringify(user));
  };

  // Auth Submit handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!authEmail) {
      setAuthError('Please specify an authorized email address.');
      return;
    }

    try {
      const res = await supabaseService.login(authEmail);
      if (res.success) {
        const userObj = {
          name: res.adminData?.full_name || 'Aryan Rajput',
          email: res.adminData?.email || authEmail
        };
        setAdminUser(userObj);
        saveSession(true, userObj);
      } else {
        setAuthError(res.error || 'Access Denied: Not a super admin.');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication handshaking failed.');
    }
  };

  const handleLogout = () => {
    saveSession(false, { name: '', email: '' });
    setActiveTab('dashboard');
    setSelectedRestaurantId(null);
  };

  // HANDLERS FOR CASCAED DATABASE MUTATIONS (Pushed into dbStore)
  const handleCreateRestaurant = (data: any) => {
    const res = dbStore.createRestaurantTransaction(data);
    if (res.success && res.restaurant) {
      // Refresh React State from store
      setRestaurants([...dbStore.restaurants]);
      setBranches([...dbStore.branches as any]);
      setPayments([...dbStore.payments as any]);
      setLogs([...dbStore.logs as any]);
    }
    return res;
  };

  const handleUpdateStatus = (id: string, status: RestaurantStatus) => {
    dbStore.updateRestaurantStatus(id, status);
    setRestaurants([...dbStore.restaurants]);
    setLogs([...dbStore.logs as any]);
  };

  const handleRenewSubscription = (id: string, plan: 'starter' | 'premium' | 'enterprise', months: number) => {
    dbStore.renewSubscription(id, plan, months);
    setRestaurants([...dbStore.restaurants]);
    setPayments([...dbStore.payments as any]);
    setLogs([...dbStore.logs as any]);
  };

  const handleResetPassword = (id: string) => {
    const pass = dbStore.resetPassword(id);
    setLogs([...dbStore.logs as any]);
    return pass;
  };

  const handleDeleteRestaurant = (id: string) => {
    dbStore.deleteRestaurant(id);
    setRestaurants([...dbStore.restaurants]);
    setBranches([...dbStore.branches as any]);
    setLogs([...dbStore.logs as any]);
    if (selectedRestaurantId === id) {
      setSelectedRestaurantId(null);
    }
  };

  const handleEditRestaurant = (rest: Restaurant) => {
    // Local store updates automatically via object mutation in the restaurants view modal,
    // we save changes and update our React view.
    dbStore.save();
    setRestaurants([...dbStore.restaurants]);
  };

  const handleReplyTicket = (id: string, text: string) => {
    dbStore.replyTicket(id, text);
    setTickets([...dbStore.tickets as any]);
  };

  const handleUpdateTicketStatus = (id: string, status: TicketStatus, assignee?: string) => {
    dbStore.updateTicketStatus(id, status, assignee);
    setTickets([...dbStore.tickets as any]);
  };

  const handleUpdateSettings = (newSettings: Partial<GlobalSettings>) => {
    dbStore.updateGlobalSettings(newSettings);
    setSettings({ ...dbStore.settings });
  };

  const handleClearAllData = () => {
    dbStore.clearAllData();
    setRestaurants([]);
    setPayments([]);
    setTickets([]);
    setBranches([]);
    setLogs([]);
  };

  // Helper navigation switch
  const handleNavigateToTab = (tab: string) => {
    setActiveTab(tab);
    setSelectedRestaurantId(null);
  };

  const handleSelectRestaurant = (id: string) => {
    setSelectedRestaurantId(id);
    setActiveTab('restaurants');
  };

  // RENDER APP
  return (
    <div className={`min-h-screen font-sans flex text-slate-900 transition-colors duration-300 ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-[#f8fafc]'}`}>

      {/* 1. AUTHENTICATION LOGIN OVERLAY */}
      <AnimatePresence>
        {!isLoggedIn && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden bg-slate-50">
            {/* Background elements */}
            <div className="absolute inset-0 bg-slate-50 -z-10 overflow-hidden">
              {/* Radial gradient overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/40 via-slate-50 to-white" />

              {/* Dotted Grid lines */}
              <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-80" />

              {/* Subtle light blobs */}
              <div className="absolute top-1/4 right-1/4 w-[450px] h-[450px] bg-indigo-500/10 rounded-full blur-[110px] animate-pulse" style={{ animationDuration: '6s' }} />
              <div className="absolute bottom-1/4 left-1/3 w-[350px] h-[350px] bg-violet-500/5 rounded-full blur-[90px] animate-pulse" style={{ animationDuration: '9s' }} />

              {/* Decorative premium vector circles */}
              <div className="absolute top-10 left-10 w-96 h-96 border border-indigo-200/20 rounded-full" />
              <div className="absolute top-5 left-5 w-[600px] h-[600px] border border-indigo-200/20 rounded-full" />
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(79,70,229,0.07)] border border-slate-200/80 max-w-md w-full p-10 space-y-8 text-left relative overflow-hidden"
            >
              {/* Card top decorative accent line */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500" />

              {/* Brand Branding */}
              <div className="text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center font-extrabold text-2xl text-white mx-auto shadow-xl shadow-indigo-600/20">
                  WR
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">WebRajya POS</h2>
                  <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">Super Admin Gateway</p>
                </div>
              </div>

              {/* Warnings / Error notifications */}
              {authError && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-800 text-xs flex items-start space-x-2.5 animate-shake">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                  <span className="font-semibold leading-relaxed">{authError}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-5 text-xs text-slate-600">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">Super Admin Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                    <input
                      id="input-login-email"
                      type="email"
                      required
                      placeholder="aiaryanrajput@gmail.com"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white text-slate-900 placeholder-slate-400 font-medium transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">Super Admin Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                    <input
                      id="input-login-password"
                      type="password"
                      required
                      placeholder="••••••••"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white text-slate-900 placeholder-slate-400 font-medium transition-all"
                    />
                  </div>
                </div>

                <button
                  id="btn-login-submit"
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-indigo-600/15 hover:shadow-indigo-600/25 cursor-pointer flex items-center justify-center space-x-2 text-sm mt-2"
                >
                  <span>Authenticate Session</span>
                  <ArrowRight className="w-4.5 h-4.5" />
                </button>
              </form>

              {/* Info panel */}
              <div className="p-4 bg-indigo-50/50 border border-indigo-100/50 rounded-2xl flex items-start space-x-3 text-[10px] text-indigo-700 leading-normal">
                <ShieldCheck className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-indigo-950 block font-bold mb-0.5">Restricted Access Portal</strong>
                  Only authorized members in the super_admins database can authenticate. Demo Account: <span className="font-mono font-bold text-indigo-600 select-all">aiaryanrajput@gmail.com</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. SUPER ADMIN CONTROL CENTER LAYOUT */}
      {isLoggedIn && settings && (
        <>
          {/* Mobile Backdrop Overlay */}
          {isMobileOpen && (
            <div
              className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-30 lg:hidden cursor-pointer"
              onClick={() => setIsMobileOpen(false)}
            />
          )}

          {/* Main Sidebar */}
          <Sidebar
            activeTab={activeTab}
            setActiveTab={handleNavigateToTab}
            onLogout={handleLogout}
            adminName={adminUser.name}
            adminEmail={adminUser.email}
            isExpanded={isExpanded}
            isMobileOpen={isMobileOpen}
            onCloseMobile={() => setIsMobileOpen(false)}
          />

          {/* Core Content Container */}
          <div className="flex-1 flex flex-col h-screen overflow-hidden">
            {/* Global Topbar */}
            <Topbar
              activeTab={activeTab}
              adminName={adminUser.name}
              onSearchChange={setSearchValue}
              searchValue={searchValue}
              isDarkMode={isDarkMode}
              setIsDarkMode={setIsDarkMode}
              onOpenWizard={() => setIsWizardOpen(true)}
              onToggleSidebar={toggleSidebar}
            />

            {/* Scrollable Workspace */}
            <main className="flex-1 overflow-y-auto p-8">

              {/* Conditional view rendering */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedRestaurantId ? `details-${selectedRestaurantId}` : activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.15 }}
                >
                  {selectedRestaurantId ? (
                    <RestaurantDetailsView
                      restaurantId={selectedRestaurantId}
                      restaurants={restaurants}
                      payments={payments}
                      logs={logs}
                      branches={branches}
                      onBack={() => setSelectedRestaurantId(null)}
                    />
                  ) : (
                    <>
                      {activeTab === 'dashboard' && (
                        <DashboardView
                          restaurants={restaurants}
                          payments={payments}
                          logs={logs}
                          onSelectRestaurant={handleSelectRestaurant}
                          onNavigateToTab={handleNavigateToTab}
                        />
                      )}

                      {activeTab === 'restaurants' && (
                        <RestaurantsView
                          restaurants={restaurants}
                          onSelectRestaurant={handleSelectRestaurant}
                          onUpdateStatus={handleUpdateStatus}
                          onRenewSubscription={handleRenewSubscription}
                          onResetPassword={handleResetPassword}
                          onDeleteRestaurant={handleDeleteRestaurant}
                          onEditRestaurant={handleEditRestaurant}
                          searchValue={searchValue}
                        />
                      )}

                      {activeTab === 'subscriptions' && (
                        <SubscriptionsView
                          plans={settings.plans}
                          payments={payments}
                        />
                      )}

                      {activeTab === 'payments' && (
                        <PaymentsView
                          payments={payments}
                          onRefundPayment={(id) => {
                            dbStore.updateRestaurantStatus(id, 'suspended'); // Suspend on refund
                            setPayments([...dbStore.payments as any]);
                            setRestaurants([...dbStore.restaurants]);
                          }}
                        />
                      )}

                      {activeTab === 'analytics' && (
                        <AnalyticsView
                          restaurants={restaurants}
                          payments={payments}
                        />
                      )}

                      {activeTab === 'support' && (
                        <SupportView
                          tickets={tickets}
                          onReplyTicket={handleReplyTicket}
                          onUpdateTicketStatus={handleUpdateTicketStatus}
                        />
                      )}

                      {activeTab === 'settings' && (
                        <SettingsView
                          settings={settings}
                          onUpdateSettings={handleUpdateSettings}
                          onClearAllData={handleClearAllData}
                        />
                      )}

                      {activeTab === 'profile' && (
                        <ProfileView
                          adminName={adminUser.name}
                          adminEmail={adminUser.email}
                          onUpdateName={(name) => {
                            const updated = { ...adminUser, name };
                            setAdminUser(updated);
                            localStorage.setItem('wr_admin_user', JSON.stringify(updated));
                          }}
                        />
                      )}
                    </>
                  )}
                </motion.div>
              </AnimatePresence>

            </main>
          </div>

          {/* 3. MULTI-STEP CREATOR WIZARD OVERLAY */}
          <AnimatePresence>
            {isWizardOpen && (
              <AddRestaurantWizard
                onClose={() => setIsWizardOpen(false)}
                onSubmit={handleCreateRestaurant}
              />
            )}
          </AnimatePresence>
        </>
      )}

    </div>
  );
}
