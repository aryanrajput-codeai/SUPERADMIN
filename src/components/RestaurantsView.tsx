import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  MoreVertical, 
  Eye, 
  Edit2, 
  ShieldAlert, 
  CheckCircle, 
  RefreshCcw, 
  Key, 
  Trash2, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Sparkles,
  ArrowUpDown,
  Building
} from 'lucide-react';
import { Restaurant, RestaurantStatus, SubscriptionPlanTier } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface RestaurantsViewProps {
  restaurants: Restaurant[];
  onSelectRestaurant: (id: string) => void;
  onUpdateStatus: (id: string, status: RestaurantStatus) => void;
  onRenewSubscription: (id: string, plan: SubscriptionPlanTier, months: number) => void;
  onResetPassword: (id: string) => string;
  onDeleteRestaurant: (id: string) => void;
  onEditRestaurant: (restaurant: Restaurant) => void;
  searchValue: string;
}

export default function RestaurantsView({
  restaurants,
  onSelectRestaurant,
  onUpdateStatus,
  onRenewSubscription,
  onResetPassword,
  onDeleteRestaurant,
  onEditRestaurant,
  searchValue
}: RestaurantsViewProps) {
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  
  // Sorting
  const [sortField, setSortField] = useState<'name' | 'created_at' | 'expiry_date'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  // Active Dropdowns or Action Modals State
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  
  // Action state management
  const [renewTarget, setRenewTarget] = useState<Restaurant | null>(null);
  const [renewPlan, setRenewPlan] = useState<SubscriptionPlanTier>('premium');
  const [renewMonths, setRenewMonths] = useState<number>(12);

  const [editTarget, setEditTarget] = useState<Restaurant | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Restaurant | null>(null);

  const [passwordResetSecret, setPasswordResetSecret] = useState<{ name: string; secret: string } | null>(null);

  // Filter & Search Logic
  const filteredRestaurants = restaurants.filter(rest => {
    const matchesSearch = 
      rest.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      rest.owner_name.toLowerCase().includes(searchValue.toLowerCase()) ||
      rest.email.toLowerCase().includes(searchValue.toLowerCase()) ||
      rest.city.toLowerCase().includes(searchValue.toLowerCase());

    const matchesStatus = statusFilter === 'all' || rest.status === statusFilter;
    const matchesPlan = planFilter === 'all' || rest.plan === planFilter;

    return matchesSearch && matchesStatus && matchesPlan;
  });

  // Sorting Logic
  const sortedRestaurants = [...filteredRestaurants].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortField === 'created_at') {
      comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    } else if (sortField === 'expiry_date') {
      comparison = new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime();
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Pagination Logic
  const totalItems = sortedRestaurants.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRestaurants = sortedRestaurants.slice(startIndex, startIndex + itemsPerPage);

  // Export CSV Functionality
  const handleExportCSV = () => {
    const headers = ['ID', 'Restaurant Name', 'Owner', 'Email', 'Phone', 'Plan', 'Status', 'Registered Date', 'Expiry Date', 'Branches', 'GST Number', 'City', 'State'];
    const rows = restaurants.map(r => [
      r.id,
      `"${r.name.replace(/"/g, '""')}"`,
      `"${r.owner_name.replace(/"/g, '""')}"`,
      r.email,
      r.phone,
      r.plan,
      r.status,
      r.created_at,
      r.expiry_date,
      r.branches_count,
      r.gst_number,
      r.city,
      r.state
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `wr_restaurants_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleSort = (field: 'name' | 'created_at' | 'expiry_date') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Login As Restaurant Simulation
  const handleLoginAsRestaurant = (rest: Restaurant) => {
    const alertBox = document.createElement('div');
    alertBox.className = "fixed bottom-5 right-5 bg-slate-900 border border-slate-800 shadow-2xl p-4 rounded-xl max-w-sm text-slate-100 z-50 flex flex-col space-y-2 animate-bounce";
    alertBox.innerHTML = `
      <div class="flex items-center space-x-2">
        <span class="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping"></span>
        <strong class="text-xs font-semibold">Injecting Secure Session Token</strong>
      </div>
      <p class="text-[11px] text-slate-400">Authorized super_admin privilege transfer. Spoofing token for <strong>${rest.name}</strong>...</p>
      <div class="bg-indigo-950/50 p-2 rounded-lg font-mono text-[9px] text-indigo-300">
        curl -X POST -H "Authorization: Bearer sa_temp_token" \\
        https://api.webrajya.com/v1/auth/impersonate \\
        -d '{"tenant_id": "${rest.id}"}'
      </div>
      <span class="text-[9px] text-slate-500 text-right">Done! POS system will open with simulated tenant rights.</span>
    `;
    document.body.appendChild(alertBox);
    setTimeout(() => {
      document.body.removeChild(alertBox);
    }, 5500);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header and Exporter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-2">
          <Building className="w-5 h-5 text-indigo-600" />
          <div>
            <h3 className="text-sm font-bold text-slate-800 leading-tight">Tenant Directory Overview</h3>
            <p className="text-[10px] text-slate-400">Manage {restaurants.length} active business domains</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Plan Filter */}
          <div className="flex items-center space-x-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Plan:</span>
            <select
              id="filter-plan-select"
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg p-1.5 text-slate-700 bg-white focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
            >
              <option value="all">All Plans</option>
              <option value="starter">Starter</option>
              <option value="premium">Premium</option>
              <option value="enterprise">Enterprise</option>
              <option value="trial">Trial</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Status:</span>
            <select
              id="filter-status-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg p-1.5 text-slate-700 bg-white focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
            >
              <option value="all">All States</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="trial">Trial</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          {/* Export CSV Button */}
          <button
            id="btn-export-restaurants-csv"
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Primary Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-4 px-6">Domain / Restaurant</th>
                <th className="py-4 px-4 cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => toggleSort('name')}>
                  <div className="flex items-center space-x-1">
                    <span>Owner Info</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-4 px-4">Branches</th>
                <th className="py-4 px-4">Plan Code</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4 cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => toggleSort('created_at')}>
                  <div className="flex items-center space-x-1">
                    <span>Registered Date</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-4 px-4 cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => toggleSort('expiry_date')}>
                  <div className="flex items-center space-x-1">
                    <span>Subscription Expiry</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedRestaurants.map((rest) => (
                <tr key={rest.id} className="hover:bg-slate-50/30 transition-colors">
                  
                  {/* Logo and Restaurant Name */}
                  <td className="py-4 px-6 flex items-center space-x-3">
                    <img 
                      src={rest.logo} 
                      alt={rest.name} 
                      className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0" 
                    />
                    <div>
                      <div className="font-bold text-slate-850 flex items-center space-x-1.5">
                        <span>{rest.name}</span>
                        <span className="text-[9px] text-slate-400 font-mono bg-slate-100 px-1.5 py-0.2 rounded-sm shrink-0 uppercase">{rest.id}</span>
                      </div>
                      <div className="flex items-center text-[10px] text-slate-400 mt-0.5">
                        <MapPin className="w-3 h-3 mr-0.5 text-slate-400 shrink-0" />
                        <span>{rest.city}, {rest.state}</span>
                      </div>
                    </div>
                  </td>

                  {/* Owner Info */}
                  <td className="py-4 px-4">
                    <p className="font-semibold text-slate-800">{rest.owner_name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{rest.email}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{rest.phone}</p>
                  </td>

                  {/* Branches Count */}
                  <td className="py-4 px-4 text-center">
                    <span className="font-bold font-mono text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                      {rest.branches_count}
                    </span>
                  </td>

                  {/* Subscription Plan Badge */}
                  <td className="py-4 px-4">
                    <span className={`px-2 py-0.5 rounded-full font-semibold uppercase text-[9px] tracking-wider ${
                      rest.plan === 'enterprise' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                      rest.plan === 'premium' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                      rest.plan === 'starter' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                      'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {rest.plan}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-semibold text-[9px] uppercase tracking-wider ${
                      rest.status === 'active' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' :
                      rest.status === 'suspended' ? 'bg-rose-50 text-rose-800 border border-rose-100' :
                      rest.status === 'trial' ? 'bg-amber-50 text-amber-800 border border-amber-100' :
                      'bg-slate-50 text-slate-800 border border-slate-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        rest.status === 'active' ? 'bg-emerald-500' :
                        rest.status === 'suspended' ? 'bg-rose-500' :
                        rest.status === 'trial' ? 'bg-amber-500' : 'bg-slate-500'
                      }`} />
                      {rest.status}
                    </span>
                  </td>

                  {/* Created Date */}
                  <td className="py-4 px-4 font-mono text-[11px] text-slate-500">
                    {new Date(rest.created_at).toLocaleDateString()}
                  </td>

                  {/* Expiry Date */}
                  <td className="py-4 px-4">
                    <p className="font-mono text-[11px] text-slate-700 font-semibold">{new Date(rest.expiry_date).toLocaleDateString()}</p>
                    {new Date(rest.expiry_date).getTime() < new Date().getTime() ? (
                      <span className="text-[8px] font-bold uppercase text-rose-500">Expired license</span>
                    ) : (
                      <span className="text-[8px] font-bold uppercase text-emerald-500">License Healthy</span>
                    )}
                  </td>

                  {/* Action Dropdown Menu */}
                  <td className="py-4 px-6 text-right relative">
                    <button
                      id={`btn-actions-trigger-${rest.id}`}
                      onClick={() => setActiveMenuId(activeMenuId === rest.id ? null : rest.id)}
                      className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Popover actions panel */}
                    <AnimatePresence>
                      {activeMenuId === rest.id && (
                        <>
                          <div className="fixed inset-0 z-20" onClick={() => setActiveMenuId(null)} />
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute right-6 mt-1 w-52 bg-white rounded-xl shadow-lg border border-slate-200 z-30 p-1 text-left font-medium"
                          >
                            {/* View */}
                            <button
                              id={`action-view-${rest.id}`}
                              onClick={() => { onSelectRestaurant(rest.id); setActiveMenuId(null); }}
                              className="w-full px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center space-x-2 transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-400" />
                              <span>View Deep Details</span>
                            </button>

                            {/* Edit */}
                            <button
                              id={`action-edit-${rest.id}`}
                              onClick={() => { setEditTarget(rest); setActiveMenuId(null); }}
                              className="w-full px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center space-x-2 transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                              <span>Edit Configuration</span>
                            </button>

                            {/* Activate / Suspend */}
                            {rest.status === 'active' ? (
                              <button
                                id={`action-suspend-${rest.id}`}
                                onClick={() => { onUpdateStatus(rest.id, 'suspended'); setActiveMenuId(null); }}
                                className="w-full px-3 py-2 text-xs text-amber-600 hover:bg-amber-50 rounded-lg flex items-center space-x-2 transition-colors cursor-pointer"
                              >
                                <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                                <span>Suspend Outlet</span>
                              </button>
                            ) : (
                              <button
                                id={`action-activate-${rest.id}`}
                                onClick={() => { onUpdateStatus(rest.id, 'active'); setActiveMenuId(null); }}
                                className="w-full px-3 py-2 text-xs text-emerald-600 hover:bg-emerald-50 rounded-lg flex items-center space-x-2 transition-colors cursor-pointer"
                              >
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                <span>Activate Outlet</span>
                              </button>
                            )}

                            {/* Renew Subscription */}
                            <button
                              id={`action-renew-${rest.id}`}
                              onClick={() => { setRenewTarget(rest); setRenewPlan(rest.plan); setActiveMenuId(null); }}
                              className="w-full px-3 py-2 text-xs text-indigo-600 hover:bg-indigo-50 rounded-lg flex items-center space-x-2 transition-colors cursor-pointer"
                            >
                              <RefreshCcw className="w-3.5 h-3.5 text-indigo-500" />
                              <span>Renew Subscription</span>
                            </button>

                            {/* Reset Password */}
                            <button
                              id={`action-reset-${rest.id}`}
                              onClick={() => { 
                                const pass = onResetPassword(rest.id);
                                setPasswordResetSecret({ name: rest.name, secret: pass });
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center space-x-2 transition-colors cursor-pointer"
                            >
                              <Key className="w-3.5 h-3.5 text-slate-400" />
                              <span>Reset POS Password</span>
                            </button>

                            {/* Impersonate / Login As */}
                            <button
                              id={`action-impersonate-${rest.id}`}
                              onClick={() => { handleLoginAsRestaurant(rest); setActiveMenuId(null); }}
                              className="w-full px-3 py-2 text-xs text-indigo-600 hover:bg-indigo-50 rounded-lg flex items-center space-x-2 transition-colors font-semibold cursor-pointer"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-indigo-500" />
                              <span>Login As POS Owner</span>
                            </button>

                            {/* Delete */}
                            <div className="border-t border-slate-100 my-1"></div>
                            <button
                              id={`action-delete-${rest.id}`}
                              onClick={() => { setDeleteTarget(rest); setActiveMenuId(null); }}
                              className="w-full px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg flex items-center space-x-2 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                              <span>Delete Restaurant</span>
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </td>

                </tr>
              ))}

              {paginatedRestaurants.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No restaurants matched your filters or search terms.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-150 flex items-center justify-between bg-slate-50/20">
          <span className="text-xs text-slate-400 font-medium">
            Showing <strong className="text-slate-800">{startIndex + 1}</strong> to <strong className="text-slate-800">{Math.min(startIndex + itemsPerPage, totalItems)}</strong> of <strong className="text-slate-800">{totalItems}</strong> domains
          </span>
          <div className="flex items-center space-x-2">
            <button
              id="btn-pagination-prev"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 border border-slate-200 rounded-lg disabled:opacity-40 enabled:hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <span className="text-xs font-semibold text-slate-700">Page {currentPage} of {totalPages}</span>
            <button
              id="btn-pagination-next"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-slate-200 rounded-lg disabled:opacity-40 enabled:hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>
      </div>

      {/* RENEW SUBSCRIPTION MODAL */}
      <AnimatePresence>
        {renewTarget && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 p-6 space-y-4"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <h4 className="font-bold text-sm text-slate-800">Renew Plan license - {renewTarget.name}</h4>
                <button onClick={() => setRenewTarget(null)} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Select Tier Plan</label>
                <select
                  id="renew-tier-select"
                  value={renewPlan}
                  onChange={(e) => setRenewPlan(e.target.value as SubscriptionPlanTier)}
                  className="w-full text-xs p-2 border border-slate-200 bg-white rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
                >
                  <option value="starter">Starter Plan (₹5,999/mo)</option>
                  <option value="premium">Premium Plan (₹14,999/mo)</option>
                  <option value="enterprise">Enterprise Plan (₹49,999/mo)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Duration</label>
                <select
                  id="renew-months-select"
                  value={renewMonths}
                  onChange={(e) => setRenewMonths(Number(e.target.value))}
                  className="w-full text-xs p-2 border border-slate-200 bg-white rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
                >
                  <option value={1}>1 Month</option>
                  <option value={3}>3 Months (Save 5%)</option>
                  <option value={6}>6 Months (Save 10%)</option>
                  <option value={12}>12 Months (Save 20%)</option>
                </select>
              </div>

              {/* Price Calculation Box */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex justify-between items-center text-xs">
                <div>
                  <span className="text-slate-500 block">Total Renewal Charge</span>
                  <span className="text-[10px] text-indigo-500 font-semibold font-mono">GST 18% inclusive invoice created</span>
                </div>
                <div className="text-right font-extrabold text-slate-900 text-sm">
                  ₹{((renewPlan === 'starter' ? 5999 : renewPlan === 'premium' ? 14999 : 49999) * renewMonths).toLocaleString()}
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => setRenewTarget(null)}
                  className="flex-1 border border-slate-200 text-xs py-2 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="btn-confirm-renew-subscription"
                  onClick={() => {
                    onRenewSubscription(renewTarget.id, renewPlan, renewMonths);
                    setRenewTarget(null);
                  }}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs py-2 rounded-lg font-bold transition-all cursor-pointer"
                >
                  Process Transaction
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT CONFIGURATION DRAWER (Simulated as dynamic modal) */}
      <AnimatePresence>
        {editTarget && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-slate-200 p-6 space-y-4"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <h4 className="font-bold text-sm text-slate-800">Edit Outlet Settings - {editTarget.name}</h4>
                <button onClick={() => setEditTarget(null)} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Restaurant Name</label>
                  <input
                    id="edit-restaurant-name"
                    type="text"
                    defaultValue={editTarget.name}
                    onChange={(e) => { editTarget.name = e.target.value; }}
                    className="w-full text-xs p-2.5 border border-slate-200 bg-white rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Owner Fullname</label>
                  <input
                    id="edit-restaurant-owner"
                    type="text"
                    defaultValue={editTarget.owner_name}
                    onChange={(e) => { editTarget.owner_name = e.target.value; }}
                    className="w-full text-xs p-2.5 border border-slate-200 bg-white rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Email Address</label>
                  <input
                    id="edit-restaurant-email"
                    type="email"
                    defaultValue={editTarget.email}
                    onChange={(e) => { editTarget.email = e.target.value; }}
                    className="w-full text-xs p-2.5 border border-slate-200 bg-white rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Phone Outlets</label>
                  <input
                    id="edit-restaurant-phone"
                    type="text"
                    defaultValue={editTarget.phone}
                    onChange={(e) => { editTarget.phone = e.target.value; }}
                    className="w-full text-xs p-2.5 border border-slate-200 bg-white rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">GST Registration</label>
                  <input
                    id="edit-restaurant-gst"
                    type="text"
                    defaultValue={editTarget.gst_number}
                    onChange={(e) => { editTarget.gst_number = e.target.value; }}
                    className="w-full text-xs p-2.5 border border-slate-200 bg-white rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Invoice Prefix</label>
                  <input
                    id="edit-restaurant-prefix"
                    type="text"
                    defaultValue={editTarget.invoice_prefix}
                    onChange={(e) => { editTarget.invoice_prefix = e.target.value; }}
                    className="w-full text-xs p-2.5 border border-slate-200 bg-white rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden text-slate-800"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => setEditTarget(null)}
                  className="flex-1 border border-slate-200 text-xs py-2 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Dismiss
                </button>
                <button
                  id="btn-confirm-edit-restaurant"
                  onClick={() => {
                    onEditRestaurant(editTarget);
                    setEditTarget(null);
                  }}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs py-2 rounded-lg font-bold transition-all cursor-pointer"
                >
                  Save Configuration
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION DIALOG */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-sm w-full border border-slate-200 p-6 space-y-4"
            >
              <div className="flex items-center space-x-3 text-rose-500">
                <Trash2 className="w-6 h-6 shrink-0" />
                <h4 className="font-bold text-sm text-slate-850">Cascade Deletion Request</h4>
              </div>

              <p className="text-xs text-slate-500 leading-normal">
                You are about to delete restaurant <strong>{deleteTarget.name}</strong>. This is irreversible and will delete all menu items, orders, tables, branches, staff, payment logs, and configuration settings inside WebRajya POS.
              </p>

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 border border-slate-200 text-xs py-2 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="btn-confirm-delete-restaurant"
                  onClick={() => {
                    onDeleteRestaurant(deleteTarget.id);
                    setDeleteTarget(null);
                  }}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-xs py-2 rounded-lg font-bold transition-all cursor-pointer"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PASSWORD RESET SECRET NOTICE */}
      <AnimatePresence>
        {passwordResetSecret && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-sm w-full border border-amber-200 p-6 space-y-4"
            >
              <div className="flex items-center space-x-3 text-amber-500">
                <Sparkles className="w-6 h-6 shrink-0" />
                <h4 className="font-bold text-sm text-slate-800">New Password Generated</h4>
              </div>

              <p className="text-xs text-slate-500 leading-normal">
                A temporary password was generated for owner of <strong>{passwordResetSecret.name}</strong>. Copy this securely to send to the owner:
              </p>

              <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg text-center font-mono text-base font-bold text-slate-850 select-all">
                {passwordResetSecret.secret}
              </div>

              <button
                onClick={() => setPasswordResetSecret(null)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs py-2 rounded-lg font-bold transition-all cursor-pointer"
              >
                Copy & Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
