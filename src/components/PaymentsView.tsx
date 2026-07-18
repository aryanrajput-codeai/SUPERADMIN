import React, { useState } from 'react';
import { 
  DollarSign, 
  CheckCircle, 
  Clock, 
  ShieldAlert, 
  Search, 
  ArrowUpRight,
  User,
  Activity,
  Coins
} from 'lucide-react';
import { Payment, PaymentStatus } from '../types';

interface PaymentsViewProps {
  payments: Payment[];
  onRefundPayment: (id: string) => void;
}

export default function PaymentsView({ payments, onRefundPayment }: PaymentsViewProps) {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchVal, setSearchVal] = useState<string>('');

  // Calculations
  const successfulPayments = payments.filter(p => p.status === 'successful');
  const pendingPayments = payments.filter(p => p.status === 'pending');
  const refundedPayments = payments.filter(p => p.status === 'refunded');

  const totalSuccessfulAmt = successfulPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalPendingAmt = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalRefundAmt = refundedPayments.reduce((sum, p) => sum + p.amount, 0);

  // Filters
  const filteredPayments = payments.filter(pay => {
    const matchesSearch = 
      pay.restaurant_name.toLowerCase().includes(searchVal.toLowerCase()) ||
      pay.invoice_number.toLowerCase().includes(searchVal.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || pay.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Total Collected */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center space-x-4 shadow-sm">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Successful Collected</span>
            <span className="text-xl font-extrabold text-slate-900 font-mono">₹{totalSuccessfulAmt.toLocaleString()}</span>
            <span className="text-[9px] text-emerald-500 block font-medium">₹{successfulPayments.length} payments cleared</span>
          </div>
        </div>

        {/* Total Pending */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center space-x-4 shadow-sm">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg animate-pulse">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Pending Escrows</span>
            <span className="text-xl font-extrabold text-slate-900 font-mono">₹{totalPendingAmt.toLocaleString()}</span>
            <span className="text-[9px] text-amber-500 block font-medium">₹{pendingPayments.length} bank handshakes active</span>
          </div>
        </div>

        {/* Total Refunded */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center space-x-4 shadow-sm">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Refunded Dispersals</span>
            <span className="text-xl font-extrabold text-slate-900 font-mono">₹{totalRefundAmt.toLocaleString()}</span>
            <span className="text-[9px] text-rose-500 block font-medium">₹{refundedPayments.length} chargebacks reversed</span>
          </div>
        </div>

      </div>

      {/* List Search & Controls */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Filter controls bar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
          <div className="relative w-64">
            <input
              id="payment-search-input"
              type="text"
              placeholder="Search invoices..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase">State:</span>
            <select
              id="payment-status-filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg p-1.5 bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
            >
              <option value="all">All Transactions</option>
              <option value="successful">Successful</option>
              <option value="pending">Pending</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>

        {/* Ledger table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-4 pl-6">Invoice Number</th>
                <th className="p-4">Business Domain</th>
                <th className="p-4">Paid Amount</th>
                <th className="p-4">Plan License</th>
                <th className="p-4">Payment Method</th>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredPayments.map((pay) => (
                <tr key={pay.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 pl-6 font-mono font-bold text-slate-800">{pay.invoice_number}</td>
                  <td className="p-4 font-semibold text-slate-900">{pay.restaurant_name}</td>
                  <td className="p-4 font-mono font-bold text-slate-900">₹{pay.amount.toLocaleString()}</td>
                  <td className="p-4 uppercase text-[10px] tracking-wider text-slate-500 font-bold">{pay.plan}</td>
                  <td className="p-4 text-slate-400">{pay.payment_method}</td>
                  <td className="p-4 text-slate-400 font-mono">{new Date(pay.created_at).toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full font-semibold text-[9px] uppercase tracking-wider ${
                      pay.status === 'successful' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                      pay.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                      'bg-rose-50 text-rose-700 border border-rose-100'
                    }`}>
                      {pay.status}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    {pay.status === 'successful' ? (
                      <button
                        id={`btn-refund-${pay.id}`}
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to reverse payment invoice ${pay.invoice_number} (₹${pay.amount.toLocaleString()} INR)? This will revoke paid license status.`)) {
                            onRefundPayment(pay.id);
                          }
                        }}
                        className="text-[10px] bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 px-2 py-1 rounded-sm font-bold transition-all cursor-pointer"
                      >
                        Refund Payment
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-300 font-mono">No actions</span>
                    )}
                  </td>
                </tr>
              ))}

              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    No matching transactions discovered.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
