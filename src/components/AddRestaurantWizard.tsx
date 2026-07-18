import React, { useState } from 'react';
import { 
  Sparkles, 
  User, 
  MapPin, 
  CreditCard, 
  CheckCircle, 
  Database, 
  ChevronRight, 
  ChevronLeft,
  X,
  AlertTriangle,
  Code2
} from 'lucide-react';
import { SubscriptionPlanTier } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface AddRestaurantWizardProps {
  onClose: () => void;
  onSubmit: (data: any) => { success: boolean; error?: string } | Promise<{ success: boolean; error?: string; restaurant?: any }>;
}

export default function AddRestaurantWizard({ onClose, onSubmit }: AddRestaurantWizardProps) {
  const [step, setStep] = useState<number>(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Custom testing mode: Force SQL rollback
  const [forceSqlFailure, setForceSqlFailure] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Basic
    name: '',
    ownerName: '',
    email: '',
    phone: '',
    password: '',
    // Step 2: Address
    address: '',
    city: '',
    state: '',
    country: 'India',
    gstNumber: '',
    logo: '',
    // Step 3: Subscription & POS
    plan: 'premium' as SubscriptionPlanTier,
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    invoicePrefix: '',
    branchName: 'Main Outlet'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNextStep = () => {
    setErrorMsg(null);
    if (step === 1) {
      if (!formData.name || !formData.ownerName || !formData.email || !formData.phone || !formData.password) {
        setErrorMsg('Please populate all fields to complete Step 1.');
        return;
      }
    } else if (step === 2) {
      if (!formData.address || !formData.city || !formData.state || !formData.gstNumber) {
        setErrorMsg('Please complete Address and valid GST Registration to maintain Indian tax compliance.');
        return;
      }
    } else if (step === 3) {
      if (!formData.branchName) {
        setErrorMsg('Please specify a default POS branch name.');
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const handleBackStep = () => {
    setErrorMsg(null);
    setStep(prev => prev - 1);
  };

  const handleCreateTenantTransaction = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    // Short delay for UX realism, then await the async onSubmit
    setTimeout(async () => {
      if (forceSqlFailure) {
        setErrorMsg('TRANSACTIONAL EXCEPTION: INSERT INTO "restaurant_users" failed (foreign_key_violation). Automatically rolling back: Purged user auth session, dropped uncommitted rows from "restaurants", deleted cascading branches. Workspace clean.');
        setIsSubmitting(false);
        return;
      }

      try {
        const submissionData = {
          ...formData,
          ownerPassword: formData.password, // Map to the field expected by onboardRestaurantTransaction
        };
        const res = await Promise.resolve(onSubmit(submissionData));
        if (res.success) {
          setSuccessMsg(true);
        } else {
          setErrorMsg(res.error || 'Registration Transaction Failed.');
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'An unexpected error occurred.');
      }
      setIsSubmitting(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 15 }}
        className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
            <div>
              <h3 className="text-sm font-bold text-slate-800">SaaS Multi-Tenant Registration Wizard</h3>
              <p className="text-[10px] text-slate-400 font-medium">Provision new isolated database workspace instantly</p>
            </div>
          </div>
          <button 
            id="btn-close-wizard"
            onClick={onClose} 
            className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Wizard Step Progression Indicator */}
        <div className="px-8 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between text-xs text-slate-400 font-semibold select-none">
          {[
            { num: 1, label: 'Owner Details', icon: User },
            { num: 2, label: 'Address & GST', icon: MapPin },
            { num: 3, label: 'SaaS Config', icon: CreditCard },
            { num: 4, label: 'Provision Tenant', icon: Database }
          ].map((item) => (
            <div 
              key={item.num} 
              className={`flex items-center space-x-2 pb-1 ${
                step === item.num 
                  ? 'text-indigo-600 border-b-2 border-indigo-600 font-bold' 
                  : step > item.num ? 'text-slate-800 font-bold' : 'text-slate-400'
              }`}
            >
              <item.icon className="w-3.5 h-3.5" />
              <span>{item.num}. {item.label}</span>
            </div>
          ))}
        </div>

        {/* Wizard Form Area */}
        <div className="flex-1 p-8 overflow-y-auto space-y-6">
          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex space-x-2 items-start animate-shake">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold block">Transactional Error Encountered</span>
                <p className="mt-0.5 text-[11px] leading-relaxed">{errorMsg}</p>
              </div>
            </div>
          )}

          {successMsg ? (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-12 text-center space-y-4 max-w-md mx-auto"
            >
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">Tenant Workspace Provisioned Successfully</h4>
                <p className="text-xs text-slate-400 leading-normal mt-2">
                  Transactional commit confirmed. Registered core credentials into Supabase Auth, seeded tenant configurations, branches, and GST defaults. Handshake terminal is ready!
                </p>
              </div>
              <button
                id="btn-close-wizard-success"
                onClick={onClose}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-6 rounded-lg transition-all shadow-sm cursor-pointer"
              >
                Close & Refresh Dashboard
              </button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              
              {/* STEP 1: Owner Info */}
              {step === 1 && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Restaurant Business Name</label>
                    <input 
                      id="input-wizard-rest-name"
                      type="text"
                      name="name"
                      placeholder="e.g. Samosa Palace"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Owner Full Name</label>
                    <input 
                      id="input-wizard-owner-name"
                      type="text"
                      name="ownerName"
                      placeholder="e.g. Aryan Rajput"
                      value={formData.ownerName}
                      onChange={handleInputChange}
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Primary Email Address</label>
                    <input 
                      id="input-wizard-email"
                      type="email"
                      name="email"
                      placeholder="e.g. owner@samosapalace.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Contact Phone Number</label>
                    <input 
                      id="input-wizard-phone"
                      type="text"
                      name="phone"
                      placeholder="e.g. +91 9988776655"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Terminal Admin Password</label>
                    <input 
                      id="input-wizard-password"
                      type="password"
                      name="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: Address & GST Info */}
              {step === 2 && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Registered Address</label>
                    <input 
                      id="input-wizard-address"
                      type="text"
                      name="address"
                      placeholder="e.g. Shop 45, MG Road, Indira Nagar"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">City</label>
                    <input 
                      id="input-wizard-city"
                      type="text"
                      name="city"
                      placeholder="e.g. Bengaluru"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">State / Region</label>
                    <input 
                      id="input-wizard-state"
                      type="text"
                      name="state"
                      placeholder="e.g. Karnataka"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">GSTIN (Indian Tax Identifier)</label>
                    <input 
                      id="input-wizard-gst"
                      type="text"
                      name="gstNumber"
                      placeholder="e.g. 29AAAAA1111A1Z1"
                      value={formData.gstNumber}
                      onChange={handleInputChange}
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-lg text-slate-800 font-mono focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Logo URL (Optional)</label>
                    <input 
                      id="input-wizard-logo"
                      type="text"
                      name="logo"
                      placeholder="e.g. https://images.unsplash.com/..."
                      value={formData.logo}
                      onChange={handleInputChange}
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: Config & Plan Selection */}
              {step === 3 && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">SaaS Subscription Plan</label>
                    <select
                      id="select-wizard-plan"
                      name="plan"
                      value={formData.plan}
                      onChange={handleInputChange}
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
                    >
                      <option value="starter">Starter Plan (₹5,999/mo)</option>
                      <option value="premium">Premium Plan (₹14,999/mo)</option>
                      <option value="enterprise">Enterprise Plan (₹49,999/mo)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Plan Expiry Date</label>
                    <input 
                      id="input-wizard-expiry"
                      type="date"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Local Timezone</label>
                    <select
                      id="select-wizard-timezone"
                      name="timezone"
                      value={formData.timezone}
                      onChange={handleInputChange}
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-lg text-slate-850 focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                      <option value="UTC">UTC Standard</option>
                      <option value="America/New_York">America/New_York (EST)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Currency</label>
                    <select
                      id="select-wizard-currency"
                      name="currency"
                      value={formData.currency}
                      onChange={handleInputChange}
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Custom Invoice Prefix</label>
                    <input 
                      id="input-wizard-prefix"
                      type="text"
                      name="invoicePrefix"
                      placeholder="e.g. SGG"
                      value={formData.invoicePrefix}
                      onChange={handleInputChange}
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-lg text-slate-800 font-mono focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">First Default Branch Outlet Name</label>
                    <input 
                      id="input-wizard-branch"
                      type="text"
                      name="branchName"
                      placeholder="e.g. Indira Nagar Main Outlet"
                      value={formData.branchName}
                      onChange={handleInputChange}
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
                    />
                  </div>
                </div>
              )}

              {/* STEP 4: Review and SQL Code Blueprint View */}
              {step === 4 && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-900 text-slate-100 rounded-xl space-y-3 font-sans">
                    <span className="text-[10px] text-indigo-400 font-extrabold uppercase flex items-center tracking-wider">
                      <Code2 className="w-3.5 h-3.5 mr-1 text-indigo-400" /> Transactional Execution Blueprint
                    </span>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      The system is compiling <strong>8 isolated SQL tables/auth injections</strong> into a single transaction query blocks inside PostgreSQL. If any insert triggers constraints errors, uncommitted changes roll back immediately.
                    </p>

                    <div className="bg-slate-950 p-3 rounded-lg font-mono text-[9px] text-emerald-400 space-y-1 select-all max-h-40 overflow-y-auto">
                      <p>BEGIN TRANSACTION;</p>
                      <p className="text-slate-500">-- 1. Create Supabase Auth User</p>
                      <p>const auth = await supabase.auth.signUp({ '{' } email: "{formData.email}", password: "..." { '}' });</p>
                      <p className="text-slate-500">-- 2. Create Restaurant Record</p>
                      <p>INSERT INTO restaurants (id, name, logo, gst_number) VALUES ('new_id', "{formData.name}", ...);</p>
                      <p className="text-slate-500">-- 3. Create Owner Link</p>
                      <p>INSERT INTO restaurant_users (user_id, restaurant_id, role) VALUES (auth.user.id, 'new_id', 'owner');</p>
                      <p className="text-slate-500">-- 4. Seed Settings defaults (printer, tax split, WhatsApp alerts)</p>
                      <p>INSERT INTO restaurant_settings (restaurant_id, currency, timezone) VALUES ('new_id', ...);</p>
                      <p className="text-slate-500">-- 5. Create Default Branch Outlet</p>
                      <p>INSERT INTO branches (restaurant_id, name, status) VALUES ('new_id', "{formData.branchName}", 'active');</p>
                      <p className="text-slate-500">-- 6. Seed counters, payment_methods, and default GST rates (CGST/SGST)</p>
                      <p>INSERT INTO restaurant_counters (restaurant_id) VALUES ('new_id');</p>
                      <p>COMMIT;</p>
                    </div>
                  </div>

                  {/* Force Failure Toggle for Rollback Demo */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-amber-800 block">Demonstration: Force Transaction Exception</span>
                      <span className="text-[10px] text-amber-600">Simulate a failure in database seeding to test cascading rollbacks</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        id="toggle-wizard-force-failure"
                        type="checkbox" 
                        checked={forceSqlFailure} 
                        onChange={(e) => setForceSqlFailure(e.target.checked)} 
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                  </div>
                </div>
              )}

              {/* Controls */}
              <div className="flex justify-between pt-6 border-t border-slate-200">
                {step > 1 ? (
                  <button
                    id="btn-wizard-back"
                    onClick={handleBackStep}
                    className="flex items-center space-x-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold py-2 px-4 rounded-lg transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                ) : (
                  <div></div>
                )}

                {step < 4 ? (
                  <button
                    id="btn-wizard-next"
                    onClick={handleNextStep}
                    className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 px-5 rounded-lg transition-all cursor-pointer shadow-sm"
                  >
                    <span>Proceed Step</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    id="btn-wizard-submit"
                    onClick={handleCreateTenantTransaction}
                    disabled={isSubmitting}
                    className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-extrabold py-2 px-6 rounded-lg transition-all shadow-sm shadow-indigo-500/15 cursor-pointer"
                  >
                    <span>{isSubmitting ? 'Provisioning Isolated Sandbox...' : 'Commit Transaction & Create'}</span>
                    <CheckCircle className="w-4 h-4" />
                  </button>
                )}
              </div>

            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
