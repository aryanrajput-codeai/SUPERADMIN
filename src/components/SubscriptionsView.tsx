import React from 'react';
import { 
  CreditCard, 
  Check, 
  ArrowUpRight, 
  Clock, 
  TrendingUp, 
  Receipt,
  Download
} from 'lucide-react';
import { SubscriptionPlan, Payment } from '../types';

interface SubscriptionsViewProps {
  plans: SubscriptionPlan[];
  payments: Payment[];
}

export default function SubscriptionsView({ plans, payments }: SubscriptionsViewProps) {
  
  // High-fidelity active list of invoices (successful ones)
  const invoices = payments.filter(p => p.status === 'successful');

  const getPlanStyle = (code: string) => {
    switch(code) {
      case 'enterprise': return 'border-emerald-500 bg-emerald-50/20 text-emerald-800';
      case 'premium': return 'border-indigo-500 bg-indigo-50/20 text-indigo-800';
      default: return 'border-slate-200 bg-slate-50/20 text-slate-700';
    }
  };

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Plans Catalog */}
      <div>
        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-800 leading-tight">License Plans Configuration</h3>
          <p className="text-[10px] text-slate-400">Available billing schemas for WebRajya POS SaaS</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div 
              key={plan.id} 
              className={`border-2 rounded-2xl p-6 flex flex-col justify-between space-y-6 bg-white relative ${getPlanStyle(plan.code)}`}
            >
              {plan.code === 'premium' && (
                <span className="absolute -top-3 right-6 bg-indigo-600 text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider">
                  Popular choice
                </span>
              )}

              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider font-mono">Plan ID: {plan.id}</span>
                  <h4 className="text-base font-extrabold text-slate-900 mt-1">{plan.name}</h4>
                  <p className="text-[10px] text-slate-400 leading-normal">Best for scaling outlets with moderate loads</p>
                </div>

                <div className="flex items-baseline">
                  <span className="text-3xl font-extrabold text-slate-900">₹{plan.price.toLocaleString()}</span>
                  <span className="text-xs text-slate-400 ml-1">/ {plan.interval}</span>
                </div>

                <div className="text-xs space-y-2.5 pt-4 border-t border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Max POS Outlets:</span>
                    <strong className="text-slate-700 font-bold">{plan.max_branches} branch(es)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Included Cashiers:</span>
                    <strong className="text-slate-700 font-bold">{plan.max_staff} operator(s)</strong>
                  </div>
                </div>

                <ul className="space-y-2 pt-4">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center text-xs text-slate-600">
                      <Check className="w-4 h-4 text-emerald-500 mr-2 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                id={`btn-manage-tier-${plan.code}`}
                onClick={() => alert(`Mock Action: Triggering pricing updates for plan '${plan.name}'.`)}
                className="w-full text-center text-xs bg-slate-900 text-white py-2 rounded-lg font-bold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Configure Schema
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Global Invoice Ledger */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Historical Platform Invoice receipts</h4>
            <p className="text-[9px] text-slate-400">Audit trail of recurring collections for taxation purposes</p>
          </div>
          <button
            id="btn-export-invoices-csv"
            onClick={() => alert('Mock Action: Exporting Invoice CSV dataset for financial accountants.')}
            className="flex items-center space-x-1.5 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold py-1.5 px-3 rounded-lg cursor-pointer shadow-xs"
          >
            <Receipt className="w-4 h-4" />
            <span>Export Invoices</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                <th className="p-4 pl-6">Invoice Number</th>
                <th className="p-4">Customer Domain</th>
                <th className="p-4">Billing Plan</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Payment Date</th>
                <th className="p-4">Gateway</th>
                <th className="p-4 pr-6 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/50">
                  <td className="p-4 pl-6 font-mono font-bold text-slate-800">{inv.invoice_number}</td>
                  <td className="p-4 font-semibold text-slate-900">{inv.restaurant_name}</td>
                  <td className="p-4">
                    <span className="px-1.5 py-0.5 text-[9px] bg-indigo-50 text-indigo-700 rounded-sm font-bold uppercase tracking-wider">
                      {inv.plan}
                    </span>
                  </td>
                  <td className="p-4 font-mono font-bold text-slate-950">₹{inv.amount.toLocaleString()}</td>
                  <td className="p-4 text-slate-500 font-mono">{new Date(inv.created_at).toLocaleDateString()}</td>
                  <td className="p-4 text-slate-400">{inv.payment_method}</td>
                  <td className="p-4 pr-6 text-right">
                    <button
                      id={`btn-download-historical-invoice-${inv.id}`}
                      onClick={() => alert(`Mock Action: Fetching Invoice receipt PDF ${inv.invoice_number} from cloud CDN.`)}
                      className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline inline-flex items-center space-x-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
