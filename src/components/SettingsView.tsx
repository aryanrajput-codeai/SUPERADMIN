import React, { useState } from 'react';
import { 
  Sliders, 
  Database, 
  Coins, 
  Receipt, 
  SlidersHorizontal,
  CheckCircle,
  HelpCircle,
  AppWindow,
  Percent,
  Settings,
  Trash2,
  AlertTriangle,
  X
} from 'lucide-react';
import { GlobalSettings, SubscriptionPlan } from '../types';

interface SettingsViewProps {
  settings: GlobalSettings;
  onUpdateSettings: (newSettings: Partial<GlobalSettings>) => void;
  onClearAllData?: () => void;
}

export default function SettingsView({ settings, onUpdateSettings, onClearAllData }: SettingsViewProps) {
  const [showConfirmPurge, setShowConfirmPurge] = useState(false);
  const [purgeSuccess, setPurgeSuccess] = useState(false);

  const [formData, setFormData] = useState({
    application_name: settings.application_name,
    logo: settings.logo,
    currency: settings.currency,
    cgst: settings.gst_defaults.cgst,
    sgst: settings.gst_defaults.sgst,
    igst: settings.gst_defaults.igst,
    prefix: settings.invoice_defaults.prefix,
    terms: settings.invoice_defaults.terms,
    footer: settings.invoice_defaults.footer,
    system_mode: settings.system_mode,
    allow_self_signup: settings.allow_self_signup
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      application_name: formData.application_name,
      logo: formData.logo,
      currency: formData.currency,
      gst_defaults: {
        cgst: Number(formData.cgst),
        sgst: Number(formData.sgst),
        igst: Number(formData.igst)
      },
      invoice_defaults: {
        prefix: formData.prefix,
        terms: formData.terms,
        footer: formData.footer
      },
      system_mode: formData.system_mode as any,
      allow_self_signup: formData.allow_self_signup
    });
    alert('Global POS settings updated successfully! Handshake configuration updated in database cache.');
  };

  return (
    <div className="space-y-6 font-sans pb-12">
      <div className="mb-2">
        <h3 className="text-sm font-bold text-slate-800 leading-none">Global System Configurations</h3>
        <p className="text-[10px] text-slate-400 mt-1">Configure default behaviors across all registered tenant POS instances</p>
      </div>

      <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Panel 1: Core Portal details */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center">
            <AppWindow className="w-4 h-4 mr-1.5 text-slate-400" /> WebRajya SaaS Info
          </h4>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Application Brand Name</label>
            <input
              id="input-settings-app-name"
              type="text"
              name="application_name"
              value={formData.application_name}
              onChange={handleInputChange}
              className="w-full text-xs p-2 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Logo Character Placeholder</label>
            <input
              id="input-settings-logo"
              type="text"
              name="logo"
              value={formData.logo}
              onChange={handleInputChange}
              className="w-full text-xs p-2 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Global System currency</label>
            <select
              id="select-settings-currency"
              name="currency"
              value={formData.currency}
              onChange={handleInputChange}
              className="w-full text-xs p-2 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Application Sandbox Mode</label>
            <select
              id="select-settings-mode"
              name="system_mode"
              value={formData.system_mode}
              onChange={handleInputChange}
              className="w-full text-xs p-2 border border-slate-200 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
            >
              <option value="production">Active Production</option>
              <option value="maintenance">Maintenance Override</option>
              <option value="sandbox">Developer Sandbox Testing</option>
            </select>
          </div>

          <label className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg text-xs">
            <div>
              <span className="font-semibold block text-slate-700">Allow Tenant Self-Signup</span>
              <span className="text-[10px] text-slate-400">Enables billing gateway checkout screens</span>
            </div>
            <input 
              id="input-settings-signup"
              type="checkbox" 
              name="allow_self_signup"
              checked={formData.allow_self_signup}
              onChange={handleCheckboxChange}
              className="w-4.5 h-4.5 accent-indigo-600" 
            />
          </label>
        </div>

        {/* Panel 2: Default Taxes CGST/SGST/IGST */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center">
            <Percent className="w-4 h-4 mr-1.5 text-slate-400" /> Default GST Tax Defaults
          </h4>
          <p className="text-[10px] text-slate-400 leading-normal">
            New restaurants will automatically inherit these settings inside their menu configuration schemas.
          </p>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Central GST (CGST %)</label>
            <input
              id="input-settings-cgst"
              type="number"
              step="0.01"
              name="cgst"
              value={formData.cgst}
              onChange={handleInputChange}
              className="w-full text-xs p-2 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">State GST (SGST %)</label>
            <input
              id="input-settings-sgst"
              type="number"
              step="0.01"
              name="sgst"
              value={formData.sgst}
              onChange={handleInputChange}
              className="w-full text-xs p-2 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Integrated GST (IGST %)</label>
            <input
              id="input-settings-igst"
              type="number"
              step="0.01"
              name="igst"
              value={formData.igst}
              onChange={handleInputChange}
              className="w-full text-xs p-2 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Panel 3: Invoices PDF Templates Defaults */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center">
              <Receipt className="w-4 h-4 mr-1.5 text-slate-400" /> Invoice Defaults
            </h4>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Default Invoice Prefix</label>
              <input
                id="input-settings-prefix"
                type="text"
                name="prefix"
                value={formData.prefix}
                onChange={handleInputChange}
                className="w-full text-xs p-2 border border-slate-200 rounded-lg text-slate-800 font-mono focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Terms & Conditions Agreement</label>
              <textarea
                id="textarea-settings-terms"
                name="terms"
                value={formData.terms}
                onChange={handleInputChange}
                rows={3}
                className="w-full text-xs p-2 border border-slate-200 rounded-lg text-slate-800 leading-normal focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Invoice Footer Note</label>
              <input
                id="input-settings-footer"
                type="text"
                name="footer"
                value={formData.footer}
                onChange={handleInputChange}
                className="w-full text-xs p-2 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-50">
            <button
              id="btn-settings-submit"
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 rounded-lg cursor-pointer shadow-xs transition-all flex items-center justify-center space-x-1"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Apply Global Cache Rules</span>
            </button>
          </div>
        </div>

      </form>

      {/* Danger Zone Section */}
      <div className="mt-8 bg-rose-50/50 rounded-2xl border border-rose-100 p-6 space-y-4">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-rose-100 text-rose-600 rounded-xl">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-rose-900">Danger Zone</h4>
            <p className="text-xs text-rose-600 mt-1">
              Actions in this section are highly sensitive. Be extremely careful.
            </p>
          </div>
        </div>

        <div className="border-t border-rose-100 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h5 className="text-xs font-bold text-slate-800">Wipe Platform Data</h5>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Permanently purge all restaurants, payment histories, support tickets, and activity logs.
            </p>
          </div>
          <button
            id="btn-purge-all-data"
            type="button"
            onClick={() => setShowConfirmPurge(true)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-rose-600/10 cursor-pointer flex items-center justify-center space-x-1.5 transition-all shrink-0"
          >
            <Trash2 className="w-4 h-4" />
            <span>Purge All Data</span>
          </button>
        </div>
      </div>

      {/* Purge Success Banner */}
      {purgeSuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-slate-800 flex items-center space-x-3 text-xs font-medium animate-slide-up">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>All platform database records successfully purged.</span>
          <button onClick={() => setPurgeSuccess(false)} className="text-slate-400 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmPurge && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl border border-slate-100 animate-scale-in text-left">
            <div className="flex items-start space-x-3">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-800">Wipe Platform Database?</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  This will completely clear all local/simulated tenant databases, active restaurants, past invoice receipts, support queue items, and branches. This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                id="btn-confirm-purge-cancel"
                type="button"
                onClick={() => setShowConfirmPurge(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-purge-proceed"
                type="button"
                onClick={() => {
                  if (onClearAllData) {
                    onClearAllData();
                  }
                  setShowConfirmPurge(false);
                  setPurgeSuccess(true);
                  setTimeout(() => setPurgeSuccess(false), 5000);
                }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs shadow-rose-600/10 transition-all cursor-pointer"
              >
                Yes, Purge Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
