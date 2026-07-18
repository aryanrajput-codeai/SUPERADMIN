import React, { useState } from 'react';
import { 
  Building, 
  User, 
  CreditCard, 
  Layers, 
  DollarSign, 
  GitCommit, 
  SlidersHorizontal,
  ChevronLeft,
  Mail,
  Phone,
  Calendar,
  Globe,
  Receipt,
  CheckCircle,
  MapPin,
  FileSpreadsheet,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { Restaurant, Payment, ActivityLog, Branch } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface RestaurantDetailsViewProps {
  restaurantId: string;
  restaurants: Restaurant[];
  payments: Payment[];
  logs: ActivityLog[];
  branches: Branch[];
  onBack: () => void;
}

export default function RestaurantDetailsView({
  restaurantId,
  restaurants,
  payments,
  logs,
  branches,
  onBack
}: RestaurantDetailsViewProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'branches' | 'payments' | 'logs' | 'settings'>('info');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const restaurant = restaurants.find(r => r.id === restaurantId);

  if (!restaurant) {
    return (
      <div className="p-8 text-center bg-white border border-slate-200 rounded-xl space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-sm font-bold text-slate-800">Tenant Domain Not Found</h3>
        <p className="text-xs text-slate-400">The requested restaurant ID could not be matched with our database.</p>
        <button onClick={onBack} className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-4 py-2 rounded-lg font-bold">
          Return to directory
        </button>
      </div>
    );
  }

  // Filter lists based on selected tenant
  const tenantPayments = payments.filter(p => p.restaurant_id === restaurantId);
  const tenantLogs = logs.filter(l => l.restaurant_id === restaurantId);
  const tenantBranches = branches.filter(b => b.restaurant_id === restaurantId);

  // High fidelity calculations
  const totalSpent = tenantPayments
    .filter(p => p.status === 'successful')
    .reduce((sum, p) => sum + p.amount, 0);

  const stats = {
    totalStaff: restaurant.plan === 'enterprise' ? 62 : restaurant.plan === 'premium' ? 12 : 4,
    maxStaff: restaurant.plan === 'enterprise' ? 100 : restaurant.plan === 'premium' ? 15 : 5,
    totalMenuItems: restaurant.plan === 'enterprise' ? 412 : restaurant.plan === 'premium' ? 164 : 45,
    maxMenuItems: restaurant.plan === 'enterprise' ? 2000 : restaurant.plan === 'premium' ? 500 : 100,
  };

  return (
    <div className="space-y-6 font-sans pb-12 relative">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 bg-slate-900 text-white text-xs py-3 px-5 rounded-xl shadow-xl border border-slate-800 flex items-center space-x-2.5 max-w-sm"
          >
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back to list controller */}
      <button
        id="btn-back-to-directory"
        onClick={onBack}
        className="flex items-center space-x-1.5 text-xs text-slate-500 hover:text-indigo-600 font-bold transition-colors cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Return to Restaurants Directory</span>
      </button>

      {/* Hero Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <img 
            src={restaurant.logo} 
            alt={restaurant.name} 
            className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-200 shadow-sm shrink-0" 
          />
          <div>
            <div className="flex items-center space-x-3 flex-wrap">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">{restaurant.name}</h2>
              <span className="text-xs bg-slate-100 font-mono text-slate-500 px-2 py-0.5 rounded-sm uppercase tracking-wider font-semibold">{restaurant.id}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                restaurant.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
              }`}>
                {restaurant.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1.5 flex items-center">
              <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
              <span>{restaurant.address}, {restaurant.city}, {restaurant.state}, {restaurant.country}</span>
            </p>
          </div>
        </div>

        {/* Hero Revenue Stat */}
        <div className="bg-slate-50/50 px-5 py-3 rounded-xl border border-slate-200 text-right shrink-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Life-time Collected Revenue</span>
          <span className="text-2xl font-extrabold text-slate-900 font-mono">₹{totalSpent.toLocaleString()}</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">INR (All invoices paid)</span>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-slate-200">
        {[
          { id: 'info', label: 'Tenant Information', icon: Building },
          { id: 'branches', label: 'Branches & POS Outlets', icon: Layers },
          { id: 'payments', label: 'Subscription Ledger', icon: CreditCard },
          { id: 'logs', label: 'System Audit Logs', icon: GitCommit },
          { id: 'settings', label: 'Platform Overrides', icon: SlidersHorizontal }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              id={`details-tab-trigger-${tab.id}`}
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-3 px-6 text-xs font-bold transition-all relative border-b-2 cursor-pointer ${
                isActive 
                  ? 'border-indigo-600 text-indigo-600 font-extrabold' 
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tabs Content */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Column 1: Core Details */}
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center">
                  <Building className="w-3.5 h-3.5 mr-1.5 text-slate-400" /> Core Restaurant Metadata
                </h4>
                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-400">Business Registry Name:</span>
                    <strong className="text-slate-700">{restaurant.name}</strong>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-400">Primary Domain / ID:</span>
                    <strong className="text-slate-700 font-mono">{restaurant.id}</strong>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-400">Local Timezone:</span>
                    <strong className="text-slate-700 font-mono">{restaurant.timezone}</strong>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-400">Currency Settings:</span>
                    <strong className="text-slate-700 font-mono">{restaurant.currency} (INR)</strong>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-400">GST Identification:</span>
                    <strong className="text-slate-700 font-mono">{restaurant.gst_number || 'N/A'}</strong>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center">
                  <User className="w-3.5 h-3.5 mr-1.5 text-slate-400" /> Account Ownership Details
                </h4>
                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-400">Owner Fullname:</span>
                    <strong className="text-slate-700">{restaurant.owner_name}</strong>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-400">Primary Email:</span>
                    <span className="text-indigo-600 font-mono font-bold flex items-center">
                      <Mail className="w-3 h-3 mr-1" /> {restaurant.email}
                    </span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-400">Contact Number:</span>
                    <span className="text-slate-700 font-mono flex items-center">
                      <Phone className="w-3 h-3 mr-1" /> {restaurant.phone}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Subscription plan info */}
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center">
                  <CreditCard className="w-3.5 h-3.5 mr-1.5 text-slate-400" /> Subscription State
                </h4>
                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-400">Current License:</span>
                    <strong className="text-indigo-600 uppercase font-extrabold">{restaurant.plan} Tier</strong>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-400">Subscription Status:</span>
                    <strong className="text-emerald-600 uppercase font-extrabold flex items-center">
                      <CheckCircle className="w-3 h-3 mr-1" /> {restaurant.status}
                    </strong>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-400">Registered Date:</span>
                    <strong className="text-slate-700 font-mono flex items-center">
                      <Calendar className="w-3 h-3 mr-1 text-slate-400" /> {new Date(restaurant.created_at).toLocaleDateString()}
                    </strong>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-400">License Expiry Date:</span>
                    <strong className="text-slate-700 font-mono flex items-center">
                      <Calendar className="w-3 h-3 mr-1 text-slate-400" /> {new Date(restaurant.expiry_date).toLocaleDateString()}
                    </strong>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-400">Invoice Prefix:</span>
                    <strong className="text-slate-700 font-mono">{restaurant.invoice_prefix}-XXX</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 3: Platform Metrics & Usage meters */}
            <div className="space-y-6 bg-slate-50/50 p-5 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                Tenant Resource Allocations
              </h4>
              
              {/* Metric 1: Branches Meter */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-medium">Outlets registered</span>
                  <span className="text-slate-700 font-bold font-mono">{tenantBranches.length} / {restaurant.plan === 'enterprise' ? 15 : restaurant.plan === 'premium' ? 3 : 1}</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 rounded-full" 
                    style={{ width: `${(tenantBranches.length / (restaurant.plan === 'enterprise' ? 15 : restaurant.plan === 'premium' ? 3 : 1)) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 block">Outlets configured in POS db</span>
              </div>

              {/* Metric 2: Staff Meter */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-medium">Staff users configured</span>
                  <span className="text-slate-700 font-bold font-mono">{stats.totalStaff} / {stats.maxStaff}</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full" 
                    style={{ width: `${(stats.totalStaff / stats.maxStaff) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 block">Cashiers, Waiters, Managers in POS db</span>
              </div>

              {/* Metric 3: Menu Items */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-medium">Menu database items</span>
                  <span className="text-slate-700 font-bold font-mono">{stats.totalMenuItems} / {stats.maxMenuItems}</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full" 
                    style={{ width: `${(stats.totalMenuItems / stats.maxMenuItems) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 block">Active SKUs / categories in POS db</span>
              </div>

            </div>

          </div>
        )}

        {/* Tab 2: Branches Outlets List */}
        {activeTab === 'branches' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-sm font-bold text-slate-800">POS Outlets ({tenantBranches.length})</h4>
                <p className="text-[10px] text-slate-400">Outlets that connect to the core WebRajya POS engine</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tenantBranches.map((br) => (
                <div key={br.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50/30 flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-mono text-indigo-500 font-bold uppercase block mb-1">BRANCH ID: {br.id}</span>
                    <h5 className="font-bold text-xs text-slate-850">{br.name}</h5>
                    <p className="text-[10px] text-slate-400 mt-1 flex items-center">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" /> {br.address}, {br.city}, {br.state}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5 flex items-center">
                      <Phone className="w-3.5 h-3.5 mr-1 text-slate-400" /> {br.phone}
                    </p>
                  </div>
                  <span className="text-[9px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    {br.status}
                  </span>
                </div>
              ))}
              
              {tenantBranches.length === 0 && (
                <div className="col-span-2 text-center py-8 text-slate-400 border border-slate-200 border-dashed rounded-xl">
                  No branches found for this restaurant.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Payments Ledger */}
        {activeTab === 'payments' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <h4 className="text-sm font-bold text-slate-800">Billing History Ledger</h4>
              <span className="text-xs font-mono text-slate-400">GST invoices</span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-[9px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/75 p-2">
                    <th className="p-3">Invoice Number</th>
                    <th className="p-3">Renewal Plan</th>
                    <th className="p-3">Amount Charged</th>
                    <th className="p-3">Payment Method</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Invoice Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {tenantPayments.map((pay) => (
                    <tr key={pay.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-850">{pay.invoice_number}</td>
                      <td className="p-3">
                        <span className="px-1.5 py-0.5 text-[9px] bg-slate-100 text-slate-700 rounded-sm font-bold uppercase tracking-wide border border-slate-200">
                          {pay.plan}
                        </span>
                      </td>
                      <td className="p-3 font-semibold font-mono text-slate-850">₹{pay.amount.toLocaleString()}</td>
                      <td className="p-3 text-slate-500">{pay.payment_method}</td>
                      <td className="p-3 text-slate-500 font-mono">{new Date(pay.created_at).toLocaleDateString()}</td>
                      <td className="p-3">
                        <button
                          id={`btn-download-invoice-${pay.id}`}
                          onClick={() => {
                            triggerToast(`Mock Action: Downloading Invoice PDF for receipt ${pay.invoice_number} (₹${pay.amount.toLocaleString()} INR).`);
                          }}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center space-x-1 cursor-pointer"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>PDF receipt</span>
                        </button>
                      </td>
                    </tr>
                  ))}

                  {tenantPayments.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        No billing transactions logged.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: System Audit Logs */}
        {activeTab === 'logs' && (
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-800">SaaS Platform Audit Trails</h4>
            
            <div className="space-y-4">
              {tenantLogs.map((log) => (
                <div key={log.id} className="flex space-x-3 text-xs p-3 hover:bg-slate-50 rounded-lg transition-colors border-l-2 border-indigo-600 bg-slate-50/30 border border-slate-200/50">
                  <div className="flex-1">
                    <div className="flex justify-between items-baseline mb-1">
                      <strong className="text-slate-850">{log.action}</strong>
                      <span className="text-[10px] text-slate-400 font-mono">{new Date(log.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-500 leading-relaxed">{log.description}</p>
                    <div className="flex items-center space-x-4 text-[10px] text-slate-400 mt-2 font-mono">
                      <span>Operator: {log.user_name}</span>
                      <span>IP Address: {log.ip_address}</span>
                    </div>
                  </div>
                </div>
              ))}

              {tenantLogs.length === 0 && (
                <div className="text-center py-8 text-slate-400 border border-slate-200 border-dashed rounded-xl">
                  No activity logs registered for this restaurant.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 5: Tenant settings & overrides */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-bold text-slate-800 mb-1">Platform Control Overrides</h4>
              <p className="text-[10px] text-slate-400">Super admin controls that directly override this tenant's local POS configurations</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700">
              
              {/* Feature Toggles */}
              <div className="p-4 border border-slate-200 rounded-xl space-y-4">
                <h5 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-2">Enabled Features</h5>
                
                <label className="flex items-center justify-between p-2 hover:bg-slate-50/50 rounded-lg cursor-pointer">
                  <div>
                    <span className="font-semibold block text-slate-800">Aggregator Integrations</span>
                    <span className="text-[10px] text-slate-400">Allows connecting to Zomato, Swiggy, and Magicpin endpoints</span>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4.5 h-4.5 accent-indigo-600 rounded-sm" />
                </label>

                <label className="flex items-center justify-between p-2 hover:bg-slate-50/50 rounded-lg cursor-pointer">
                  <div>
                    <span className="font-semibold block text-slate-800">WhatsApp Custom Billing Notifications</span>
                    <span className="text-[10px] text-slate-400">Dispatches automated invoices directly to client cell numbers</span>
                  </div>
                  <input type="checkbox" defaultChecked={restaurant.plan !== 'starter'} className="w-4.5 h-4.5 accent-indigo-600 rounded-sm" />
                </label>

                <label className="flex items-center justify-between p-2 hover:bg-slate-50/50 rounded-lg cursor-pointer">
                  <div>
                    <span className="font-semibold block text-slate-800">Advanced Kitchen Display (KDS) Channels</span>
                    <span className="text-[10px] text-slate-400">Supports multi-station screens in back kitchens</span>
                  </div>
                  <input type="checkbox" defaultChecked={restaurant.plan === 'enterprise'} className="w-4.5 h-4.5 accent-indigo-600 rounded-sm" />
                </label>
              </div>

              {/* Advanced Limits Overrides */}
              <div className="p-4 border border-slate-200 rounded-xl space-y-4">
                <h5 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-2">Hard limits override (SaaS)</h5>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Custom Extra Branches Limit (+)</label>
                    <input 
                      type="number" 
                      defaultValue={0} 
                      className="w-full p-2.5 border border-slate-200 bg-white rounded-lg text-xs focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
                      placeholder="e.g. 2 additional outlets" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Override Invoice PDF Layout Template</label>
                    <select className="w-full p-2.5 border border-slate-200 bg-white rounded-lg text-xs focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden">
                      <option>Standard thermal 80mm</option>
                      <option>Government compliant tax split format</option>
                      <option>Premium corporate A4 format</option>
                    </select>
                  </div>
                </div>
              </div>

            </div>

            <div className="flex justify-end pt-4 border-t border-slate-200">
              <button
                id="btn-save-override-settings"
                onClick={() => {
                  triggerToast('Success: Platform overrides saved. Database transaction pushed. POS terminals will pull modifications on next handshake.');
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-lg cursor-pointer transition-all shadow-sm"
              >
                Push Overrides to Tenant
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
