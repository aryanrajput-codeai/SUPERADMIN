import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, 
  ShieldCheck, 
  Mail, 
  ArrowRight, 
  AlertTriangle,
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

// Supabase Services
import { supabaseService } from './supabase';
import {
  fetchRestaurants,
  fetchBranches,
  fetchPayments,
  fetchActivityLogs,
  updateRestaurantStatus,
  updateRestaurantPlan,
  deleteRestaurant,
  updateRestaurant,
  onboardRestaurantTransaction,
  type OnboardingData,
} from './supabaseDb';

// Local Store & Types
import { dbStore } from './utils/mockData';
import { Restaurant, RestaurantStatus, SubscriptionPlanTier, TicketStatus, GlobalSettings } from './types';

export default function App() {
  // ─── Session State ────────────────────────────────────────
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() =>
    localStorage.getItem('wr_is_logged_in') === 'true'
  );
  const [authEmail, setAuthEmail] = useState<string>('');
  const [authPassword, setAuthPassword] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [adminUser, setAdminUser] = useState(() => {
    const saved = localStorage.getItem('wr_admin_user');
    return saved ? JSON.parse(saved) : { name: 'Aryan Rajput', email: 'aiaryanrajput@gmail.com' };
  });

  // ─── Global Data States ───────────────────────────────────
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(false);

  // ─── UI State ─────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // ─── Load all data from Supabase ─────────────────────────
  const loadAllData = useCallback(async () => {
    setIsDataLoading(true);
    try {
      const [rests, pays, branchesList, logsList] = await Promise.all([
        fetchRestaurants(),
        fetchPayments(),
        fetchBranches(),
        fetchActivityLogs(),
      ]);
      setRestaurants(rests);
      setPayments(pays);
      setBranches(branchesList);
      setLogs(logsList);
      setTickets([...dbStore.tickets]);
      setSettings({ ...dbStore.settings });
    } catch (err: any) {
      console.error('[App] Failed to load data from Supabase:', err.message);
      // Fallback to local store
      setRestaurants([...dbStore.restaurants]);
      setPayments([...dbStore.payments as any]);
      setBranches([...dbStore.branches as any]);
      setLogs([...dbStore.logs as any]);
      setTickets([...dbStore.tickets as any]);
      setSettings({ ...dbStore.settings });
    } finally {
      setIsDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      loadAllData();
    }
  }, [isLoggedIn, loadAllData]);

  // ─── Session helpers ──────────────────────────────────────
  const saveSession = (loggedIn: boolean, user: any) => {
    setIsLoggedIn(loggedIn);
    localStorage.setItem('wr_is_logged_in', String(loggedIn));
    localStorage.setItem('wr_admin_user', JSON.stringify(user));
  };

  // ─── Auth Handler ─────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsAuthLoading(true);

    if (!authEmail) {
      setAuthError('Please specify an authorized email address.');
      setIsAuthLoading(false);
      return;
    }

    try {
      const res = await supabaseService.login(authEmail, authPassword);
      if (res.success) {
        const userObj = {
          name: res.adminData?.full_name || authEmail.split('@')[0],
          email: res.adminData?.email || authEmail,
        };
        setAdminUser(userObj);
        saveSession(true, userObj);
      } else {
        setAuthError(res.error || 'Access Denied: Not a super admin.');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = () => {
    saveSession(false, { name: '', email: '' });
    setActiveTab('dashboard');
    setSelectedRestaurantId(null);
  };

  // ─── Restaurant Handlers ──────────────────────────────────
  const handleCreateRestaurant = async (data: any) => {
    const result = await onboardRestaurantTransaction(data);
    if (result.success) {
      await loadAllData(); // Refresh from Supabase
    }
    return result;
  };

  const handleUpdateStatus = async (id: string, status: RestaurantStatus) => {
    await updateRestaurantStatus(id, status);
    await loadAllData();
  };

  const handleRenewSubscription = async (id: string, plan: 'starter' | 'premium' | 'enterprise', months: number) => {
    const r = restaurants.find(x => x.id === id);
    if (!r) return;
    const expiry = new Date(r.expiry_date);
    expiry.setMonth(expiry.getMonth() + months);
    await updateRestaurantPlan(id, plan as SubscriptionPlanTier, expiry.toISOString());
    // Also update local logs/payments via dbStore
    dbStore.renewSubscription(id, plan, months);
    await loadAllData();
  };

  const handleResetPassword = (id: string) => {
    return dbStore.resetPassword(id);
  };

  const handleDeleteRestaurant = async (id: string) => {
    await deleteRestaurant(id);
    if (selectedRestaurantId === id) setSelectedRestaurantId(null);
    await loadAllData();
  };

  const handleEditRestaurant = async (rest: Restaurant) => {
    await updateRestaurant(rest.id, rest);
    await loadAllData();
  };

  // ─── Ticket Handlers ──────────────────────────────────────
  const handleReplyTicket = (id: string, text: string) => {
    dbStore.replyTicket(id, text);
    setTickets([...dbStore.tickets as any]);
  };

  const handleUpdateTicketStatus = (id: string, status: TicketStatus, assignee?: string) => {
    dbStore.updateTicketStatus(id, status, assignee);
    setTickets([...dbStore.tickets as any]);
  };

  // ─── Settings Handlers ────────────────────────────────────
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

  // ─── Navigation ───────────────────────────────────────────
  const handleNavigateToTab = (tab: string) => {
    setActiveTab(tab);
    setSelectedRestaurantId(null);
  };

  const handleSelectRestaurant = (id: string) => {
    setSelectedRestaurantId(id);
    setActiveTab('restaurants');
  };

  // ─── RENDER ───────────────────────────────────────────────
  return (
    <div className={`min-h-screen font-sans flex text-slate-900 ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-[#f8fafc]'}`}>
      
      {/* 1. AUTHENTICATION LOGIN OVERLAY */}
      <AnimatePresence>
        {!isLoggedIn && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 p-4 relative overflow-hidden">
            {/* Gradient background */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/30 via-slate-900 to-slate-950 -z-10" />
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full p-8 space-y-6 text-left"
            >
              {/* Brand */}
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center font-extrabold text-xl text-white mx-auto shadow-xl shadow-indigo-500/20">
                  WR
                </div>
                <h2 className="text-lg font-bold text-slate-800 tracking-tight">WebRajya POS</h2>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Super Admin Gateway</p>
              </div>

              {/* Error */}
              {authError && (
                <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="font-semibold">{authError}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4 text-xs text-slate-700">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Super Admin Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      id="input-login-email"
                      type="email"
                      required
                      placeholder="aiaryanrajput@gmail.com"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white text-slate-800 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Super Admin Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      id="input-login-password"
                      type="password"
                      required
                      placeholder="••••••••"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white text-slate-800"
                    />
                  </div>
                </div>

                <button
                  id="btn-login-submit"
                  type="submit"
                  disabled={isAuthLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl transition-all shadow-sm shadow-indigo-500/15 cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  {isAuthLoading ? (
                    <span>Authenticating...</span>
                  ) : (
                    <>
                      <span>Authenticate Session</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Info panel */}
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-start space-x-2 text-[10px] text-slate-500 leading-normal">
                <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-700 block">Restricted Access Portal</strong>
                  Only authorized super admin accounts can authenticate. Demo: <span className="font-mono font-semibold text-indigo-600">aiaryanrajput@gmail.com</span> / <span className="font-mono font-semibold text-indigo-600">admin123</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. SUPER ADMIN CONTROL CENTER */}
      {isLoggedIn && settings && (
        <>
          <Sidebar
            activeTab={activeTab}
            setActiveTab={handleNavigateToTab}
            onLogout={handleLogout}
            adminName={adminUser.name}
            adminEmail={adminUser.email}
          />

          <div className="flex-1 flex flex-col h-screen overflow-hidden">
            <Topbar
              activeTab={activeTab}
              adminName={adminUser.name}
              onSearchChange={setSearchValue}
              searchValue={searchValue}
              isDarkMode={isDarkMode}
              setIsDarkMode={setIsDarkMode}
              onOpenWizard={() => setIsWizardOpen(true)}
            />

            <main className="flex-1 overflow-y-auto p-8">
              {/* Loading overlay */}
              {isDataLoading && (
                <div className="fixed inset-0 z-30 bg-white/50 flex items-center justify-center pointer-events-none">
                  <div className="flex items-center gap-2 bg-white rounded-xl shadow-lg px-5 py-3 border border-slate-100">
                    <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-medium text-slate-600">Loading from Supabase...</span>
                  </div>
                </div>
              )}

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
                            dbStore.updateRestaurantStatus(id, 'suspended');
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
                          onUpdateName={(name: string) => {
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

          {/* 3. ADD RESTAURANT WIZARD */}
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
