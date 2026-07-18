import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  LineChart as LineIcon, 
  PieChart as PieIcon,
  Zap,
  DollarSign,
  TrendingDown,
  Activity
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { Restaurant, Payment } from '../types';

interface AnalyticsViewProps {
  restaurants: Restaurant[];
  payments: Payment[];
}

export default function AnalyticsView({ restaurants, payments }: AnalyticsViewProps) {
  
  const successfulPayments = payments.filter(p => p.status === 'successful');
  const totalRevenue = successfulPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalOutlets = restaurants.length;
  
  // ARPU: Average Revenue Per Tenant
  const arpu = totalOutlets > 0 ? Math.round(totalRevenue / totalOutlets) : 0;

  // Growth cohorts
  const cityDistribution = [
    { name: 'Mumbai', value: restaurants.filter(r => r.city === 'Mumbai').length, color: '#4f46e5' },
    { name: 'Kolkata', value: restaurants.filter(r => r.city === 'Kolkata').length, color: '#0ea5e9' },
    { name: 'Noida', value: restaurants.filter(r => r.city === 'Noida').length, color: '#10b981' },
    { name: 'Bengaluru', value: restaurants.filter(r => r.city === 'Bengaluru').length, color: '#f59e0b' },
    { name: 'Other', value: restaurants.filter(r => !['Mumbai', 'Kolkata', 'Noida', 'Bengaluru'].includes(r.city)).length, color: '#94a3b8' }
  ];

  const quarterlyPerformanceData = [
    { name: 'Q3-25', starters: 2, premium: 3, enterprise: 1 },
    { name: 'Q4-25', starters: 3, premium: 4, enterprise: 1 },
    { name: 'Q1-26', starters: 4, premium: 5, enterprise: 2 },
    { name: 'Q2-26', starters: 6, premium: 8, enterprise: 3 }
  ];

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Metrics breakdown header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* ARPU */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Average Revenue Per Tenant (ARPU)</span>
          <div className="flex items-baseline mt-1.5">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">₹{arpu.toLocaleString()}</span>
            <span className="text-xs text-slate-400 ml-1">LTV avg</span>
          </div>
          <span className="text-[10px] text-emerald-500 font-medium block mt-1">↑ +8% vs. Q1 target</span>
        </div>

        {/* Aggregate ARR run-rate */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Annualized Run Rate (ARR)</span>
          <div className="flex items-baseline mt-1.5">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">₹{(totalRevenue * 1.5).toLocaleString()}</span>
            <span className="text-xs text-slate-400 ml-1">projected</span>
          </div>
          <span className="text-[10px] text-indigo-500 font-medium block mt-1">Estimated on active renewals</span>
        </div>

        {/* Churn Rate (Simulated POS platform metrics) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Tenant Retention Rate</span>
          <div className="flex items-baseline mt-1.5">
            <span className="text-2xl font-extrabold text-slate-900">94.2%</span>
            <span className="text-xs text-slate-400 ml-1">healthy</span>
          </div>
          <span className="text-[10px] text-emerald-500 font-medium block mt-1">SLA target exceeded</span>
        </div>

        {/* API response velocity */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Avg Handshake latency</span>
          <div className="flex items-baseline mt-1.5">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">24ms</span>
            <span className="text-xs text-slate-400 ml-1">sync speed</span>
          </div>
          <span className="text-[10px] text-indigo-500 font-medium block mt-1">Supabase Edge Gateway active</span>
        </div>

      </div>

      {/* Detail Analytics charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Plan upgrade trends */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="mb-4">
            <h4 className="text-sm font-bold text-slate-800">Quarterly License Cohorts Growth</h4>
            <span className="text-[10px] text-slate-400">Total subscribed licenses segmented by plan tiers</span>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={quarterlyPerformanceData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip />
                <Bar dataKey="starters" stackId="a" fill="#f59e0b" name="Starter Plan" />
                <Bar dataKey="premium" stackId="a" fill="#4f46e5" name="Premium Plan" />
                <Bar dataKey="enterprise" stackId="a" fill="#10b981" name="Enterprise Plan" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Regional density share */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-800">Geographical Tenant density</h4>
            <span className="text-[10px] text-slate-400">Regional share of POS software adoption</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around py-4">
            <div className="w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={cityDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {cityDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} domains`, 'Density']} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1.5 mt-4 sm:mt-0 text-xs text-slate-600">
              {cityDistribution.map((city, idx) => (
                <div key={idx} className="flex items-center justify-between space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: city.color }}></span>
                    <span className="font-medium text-slate-700">{city.name}</span>
                  </div>
                  <strong className="text-slate-900 font-mono">{city.value} ({Math.round(city.value / totalOutlets * 100)}%)</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
