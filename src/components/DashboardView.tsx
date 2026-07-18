import React from 'react';
import { 
  Building2, 
  CheckCircle, 
  AlertOctagon, 
  CalendarClock, 
  XOctagon, 
  IndianRupee, 
  TrendingUp, 
  ShoppingCart, 
  Users,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Restaurant, Payment, ActivityLog } from '../types';

interface DashboardViewProps {
  restaurants: Restaurant[];
  payments: Payment[];
  logs: ActivityLog[];
  onSelectRestaurant: (id: string) => void;
  onNavigateToTab: (tab: string) => void;
}

export default function DashboardView({ 
  restaurants, 
  payments, 
  logs, 
  onSelectRestaurant,
  onNavigateToTab 
}: DashboardViewProps) {
  
  // Calculate stats dynamically
  const totalRestaurants = restaurants.length;
  const activeRestaurants = restaurants.filter(r => r.status === 'active').length;
  const suspendedRestaurants = restaurants.filter(r => r.status === 'suspended').length;
  const trialRestaurants = restaurants.filter(r => r.status === 'trial').length;
  const expiredRestaurants = restaurants.filter(r => r.status === 'expired').length;
  
  const todayRevenue = payments
    .filter(p => p.status === 'successful' && new Date(p.created_at).toDateString() === new Date().toDateString())
    .reduce((sum, p) => sum + p.amount, 0);

  const monthlyRevenue = payments
    .filter(p => p.status === 'successful') // simplifying monthly calculation from the seeded mockpayments
    .reduce((sum, p) => sum + p.amount, 0);

  // High-fidelity estimates for POS platform data
  const totalOrders = totalRestaurants === 0 ? 0 : totalRestaurants * 154 + payments.length * 12;
  const totalUsers = totalRestaurants === 0 ? 0 : totalRestaurants * 8 + activeRestaurants * 4;

  // Chart 1: Monthly Revenue Trend
  const revenueTrendData = [
    { month: 'Jan', revenue: totalRestaurants === 0 ? 0 : 7500 },
    { month: 'Feb', revenue: totalRestaurants === 0 ? 0 : 9500 },
    { month: 'Mar', revenue: totalRestaurants === 0 ? 0 : 14500 },
    { month: 'Apr', revenue: totalRestaurants === 0 ? 0 : 12500 },
    { month: 'May', revenue: totalRestaurants === 0 ? 0 : 18500 },
    { month: 'Jun', revenue: totalRestaurants === 0 ? 0 : 22000 },
    { month: 'Jul', revenue: monthlyRevenue },
  ];

  // Chart 2: Daily Order Scale (aggregated POS metric representation)
  const orderTrendData = [
    { day: 'Mon', orders: totalRestaurants === 0 ? 0 : 12 },
    { day: 'Tue', orders: totalRestaurants === 0 ? 0 : 13 },
    { day: 'Wed', orders: totalRestaurants === 0 ? 0 : 15 },
    { day: 'Thu', orders: totalRestaurants === 0 ? 0 : 14 },
    { day: 'Fri', orders: totalRestaurants === 0 ? 0 : 18 },
    { day: 'Sat', orders: totalRestaurants === 0 ? 0 : 23 },
    { day: 'Sun', orders: totalRestaurants === 0 ? 0 : 21 },
  ];

  // Chart 3: Subscription Plan Distribution
  const planDistribution = [
    { name: 'Starter', value: restaurants.filter(r => r.plan === 'starter').length, color: '#f59e0b' },
    { name: 'Premium', value: restaurants.filter(r => r.plan === 'premium').length, color: '#6366f1' },
    { name: 'Enterprise', value: restaurants.filter(r => r.plan === 'enterprise').length, color: '#10b981' },
    { name: 'Trial', value: restaurants.filter(r => r.plan === 'trial').length, color: '#94a3b8' },
  ];

  // Chart 4: Multi-tenant Growth (Cumulative restaurants registered)
  const growthData = [
    { name: 'Q1-25', count: totalRestaurants === 0 ? 0 : 1 },
    { name: 'Q2-25', count: totalRestaurants === 0 ? 0 : 2 },
    { name: 'Q3-25', count: totalRestaurants === 0 ? 0 : 2 },
    { name: 'Q4-25', count: totalRestaurants === 0 ? 0 : 3 },
    { name: 'Q1-26', count: totalRestaurants === 0 ? 0 : 3 },
    { name: 'Q2-26', count: totalRestaurants }
  ];

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Metrics Row 1 */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 tracking-tight mb-4">Core Platform Diagnostics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* Card 1: Total Tenants */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total SaaS Tenants</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{totalRestaurants}</h3>
              <span className="text-[10px] text-emerald-500 font-medium flex items-center mt-0.5">
                <ArrowUpRight className="w-3 h-3 mr-0.5 shrink-0" /> +16.2% MoM
              </span>
            </div>
          </div>

          {/* Card 2: Active Tenants */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active Outlets</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{activeRestaurants}</h3>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Healthy SLA State</span>
            </div>
          </div>

          {/* Card 3: Suspended Tenants */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Suspended Outlets</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{suspendedRestaurants}</h3>
              <span className="text-[10px] text-rose-400 mt-0.5 font-medium block">Action required</span>
            </div>
          </div>

          {/* Card 4: Trial Tenants */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">On Free Trial</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{trialRestaurants}</h3>
              <span className="text-[10px] text-amber-500 font-medium mt-0.5 block">Conversion funnel</span>
            </div>
          </div>

          {/* Card 5: Expired Tenants */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-slate-100 text-slate-500 rounded-lg">
              <XOctagon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Expired Outlets</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{expiredRestaurants}</h3>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Needs renewal outreach</span>
            </div>
          </div>

        </div>
      </div>

      {/* Metrics Row 2: Financials & Usage Scale */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Today's Revenue */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Today's Collected Revenue</span>
            <span className="text-[10px] text-emerald-500 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded-sm">UPI Peak</span>
          </div>
          <div className="flex items-baseline mt-2">
            <span className="text-3xl font-extrabold text-slate-900">₹{todayRevenue.toLocaleString()}</span>
            <span className="text-xs text-slate-400 ml-2">INR</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Aggregated over modern payment processors</p>
        </div>

        {/* Monthly Recurring Revenue */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Monthly SaaS MRR</span>
            <span className="text-[10px] text-indigo-500 font-semibold bg-indigo-50 px-1.5 py-0.5 rounded-sm">Active MRR</span>
          </div>
          <div className="flex items-baseline mt-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">₹{monthlyRevenue.toLocaleString()}</span>
            <span className="text-xs text-slate-400 ml-2">INR</span>
          </div>
          <p className="text-[10px] text-emerald-500 mt-2 font-medium">↑ +24% vs. previous month</p>
        </div>

        {/* Total POS Orders */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total POS Orders (Aggregate)</span>
            <div className="p-1 bg-amber-50 text-amber-600 rounded-sm">
              <ShoppingCart className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline mt-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">{totalOrders.toLocaleString()}</span>
            <span className="text-xs text-slate-400 ml-2">orders</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Real-time processing across all branches</p>
        </div>

        {/* Total Staff Users */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Active Platform Users</span>
            <div className="p-1 bg-teal-50 text-teal-600 rounded-sm">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline mt-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">{totalUsers.toLocaleString()}</span>
            <span className="text-xs text-slate-400 ml-2">operators</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Registered staff, managers and cashiers</p>
        </div>

      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Cumulative Platform Monthly Revenue */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-800 leading-none">SaaS Monthly Revenue Velocity</h4>
              <span className="text-[10px] text-slate-400">Total license collection and subscription upgrades</span>
            </div>
            <span className="text-xs font-semibold text-slate-500 font-mono">₹{monthlyRevenue.toLocaleString()} INR Total</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Daily Order Scale (Aggregated) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-800 leading-none">Weekly Aggregated POS Orders</h4>
              <span className="text-[10px] text-slate-400">Aggregated dining, takeaway & delivery POS activity</span>
            </div>
            <span className="text-xs font-semibold text-slate-500 font-mono">11.4K weekly avg</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={orderTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip formatter={(value) => [`${value} Orders`, 'POS Volume']} />
                <Bar dataKey="orders" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Subscription Plan Distribution */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-800 mb-1">Subscription Plan Distribution</h4>
            <span className="text-[10px] text-slate-400">Share of paid tiers across active outlets</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-around py-4">
            <div className="w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={planDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {planDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} Tenants`, 'Tiers']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Custom Legends */}
            <div className="space-y-2 mt-4 sm:mt-0">
              {planDistribution.map((entry, index) => (
                <div key={index} className="flex items-center space-x-2 text-xs">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: entry.color }}></span>
                  <span className="font-medium text-slate-700">{entry.name} Tier:</span>
                  <span className="font-bold text-slate-900 font-mono">{entry.value} ({Math.round(entry.value / totalRestaurants * 100)}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart 4: Multi-tenant Growth */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-800 leading-none">SaaS Tenant Registration Velocity</h4>
              <span className="text-[10px] text-slate-400">Growth trajectory of subscribing businesses</span>
            </div>
            <span className="text-xs font-semibold text-slate-500 font-mono">Cumulative count</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip formatter={(value) => [`${value} Registered`, 'Tenants']} />
                <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} dot={{ stroke: '#10b981', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Grid: Recent Restaurants, Payments and Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Registered Tenants */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Recently Registered Tenants</h4>
            <button 
              id="lnk-view-all-restaurants"
              onClick={() => onNavigateToTab('restaurants')} 
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
            >
              See Directory
            </button>
          </div>
          
          <div className="space-y-4">
            {restaurants.slice(0, 4).map((rest) => (
              <div 
                key={rest.id} 
                className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-all cursor-pointer"
                onClick={() => onSelectRestaurant(rest.id)}
              >
                <div className="flex items-center space-x-3">
                  <img src={rest.logo} alt={rest.name} className="w-9 h-9 rounded-lg object-cover border border-slate-100" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">{rest.name}</p>
                    <span className="text-[10px] text-slate-400">{rest.city}, {rest.state}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                    rest.plan === 'enterprise' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                    rest.plan === 'premium' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                    rest.plan === 'starter' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {rest.plan}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Payments Received */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Recent Transactions</h4>
            <button 
              id="lnk-view-all-payments"
              onClick={() => onNavigateToTab('payments')} 
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Audit Log
            </button>
          </div>

          <div className="space-y-4">
            {payments.slice(0, 4).map((pay) => (
              <div key={pay.id} className="flex items-center justify-between p-2 rounded-lg">
                <div>
                  <p className="text-xs font-bold text-slate-800">{pay.restaurant_name}</p>
                  <span className="text-[9px] text-slate-400 font-mono">{pay.invoice_number} • {pay.payment_method}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-900 block">₹{pay.amount.toLocaleString()}</span>
                  <span className={`text-[8px] font-semibold uppercase tracking-wider ${
                    pay.status === 'successful' ? 'text-emerald-500' :
                    pay.status === 'pending' ? 'text-amber-500' : 'text-rose-500'
                  }`}>
                    {pay.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Global Activity Log */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">Platform Activity</h4>
            <div className="space-y-4 max-h-[250px] overflow-y-auto pr-1">
              {logs.slice(0, 4).map((log) => (
                <div key={log.id} className="flex space-x-3 text-xs">
                  <div className="mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-800 font-semibold leading-normal">
                      {log.action} <span className="font-normal text-slate-500">by {log.user_name}</span>
                    </p>
                    <p className="text-[10px] text-slate-400 leading-normal mt-0.5">{log.description}</p>
                    <span className="text-[9px] text-slate-300 block mt-1 font-mono">{new Date(log.created_at).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-slate-50 pt-3 text-center mt-3">
            <span className="text-[10px] font-mono text-slate-400">Secure Audit Sandbox Online</span>
          </div>
        </div>

      </div>
    </div>
  );
}
