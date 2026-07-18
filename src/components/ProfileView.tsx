import React, { useState } from 'react';
import { 
  User, 
  ShieldCheck, 
  Key, 
  QrCode, 
  Smartphone,
  Lock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface ProfileViewProps {
  adminName: string;
  adminEmail: string;
  onUpdateName: (val: string) => void;
}

export default function ProfileView({ adminName, adminEmail, onUpdateName }: ProfileViewProps) {
  const [fullname, setFullname] = useState(adminName);
  const [passwordForm, setPasswordForm] = useState({ old: '', newPass: '', confirm: '' });
  const [show2faMock, setShow2faMock] = useState(false);
  const [is2faEnabled, setIs2faEnabled] = useState(false);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateName(fullname);
    alert('Super Admin Profile Updated Successfully.');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.old || !passwordForm.newPass || !passwordForm.confirm) {
      alert('Please fill out all fields in the password editor.');
      return;
    }
    if (passwordForm.newPass !== passwordForm.confirm) {
      alert('New password confirmation does not match.');
      return;
    }
    alert('Super Admin credentials successfully updated. Session refreshed.');
    setPasswordForm({ old: '', newPass: '', confirm: '' });
  };

  return (
    <div className="space-y-6 font-sans pb-12">
      <div className="mb-2">
        <h3 className="text-sm font-bold text-slate-800 leading-none">Super Admin Accounts Desk</h3>
        <p className="text-[10px] text-slate-400 mt-1">Configure profile details, secure credentials, and Multi-Factor Authentication</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Profile Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-3 mb-2">
            <User className="w-5 h-5 text-indigo-600" />
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Account Credentials</h4>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Super Admin Name</label>
              <input
                id="input-profile-name"
                type="text"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Authorized Email Address</label>
              <input
                id="input-profile-email"
                type="email"
                value={adminEmail}
                disabled
                className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-400 font-mono cursor-not-allowed"
                title="Super Admin email domain belongs to secure environment credentials"
              />
            </div>

            <button
              id="btn-profile-submit"
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-6 rounded-lg cursor-pointer shadow-sm transition-colors"
            >
              Update Account Details
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-3 mb-2">
            <Key className="w-5 h-5 text-indigo-600" />
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Update Security Passphrase</h4>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs text-slate-700">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Current Passphrase</label>
              <input
                id="input-password-old"
                type="password"
                placeholder="••••••••"
                value={passwordForm.old}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, old: e.target.value }))}
                className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">New Passphrase</label>
                <input
                  id="input-password-new"
                  type="password"
                  placeholder="••••••••"
                  value={passwordForm.newPass}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPass: e.target.value }))}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Confirm New Passphrase</label>
                <input
                  id="input-password-confirm"
                  type="password"
                  placeholder="••••••••"
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm: e.target.value }))}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
                />
              </div>
            </div>

            <button
              id="btn-password-submit"
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 px-6 rounded-lg cursor-pointer transition-colors shadow-sm"
            >
              Secure Account password
            </button>
          </form>
        </div>

        {/* 2FA Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Multi-Factor Authentication (2FA)</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Enforce hardware/authenticator app prompts to confirm admin transactions</p>
              </div>
            </div>
            
            <button
              id="btn-toggle-2fa"
              onClick={() => {
                if (is2faEnabled) {
                  setIs2faEnabled(false);
                  setShow2faMock(false);
                } else {
                  setShow2faMock(true);
                }
              }}
              className={`text-xs px-4 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                is2faEnabled 
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-xs' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
              }`}
            >
              {is2faEnabled ? '2FA Enabled ✔' : 'Setup 2FA'}
            </button>
          </div>

          {show2faMock && !is2faEnabled && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-6 items-center animate-fade-in text-xs text-slate-600 leading-normal">
              
              <div className="flex flex-col items-center space-y-2 p-2 bg-white rounded-lg border border-slate-200 shadow-xs shrink-0 mx-auto">
                {/* Visual QRCode display */}
                <div className="w-24 h-24 bg-slate-950 flex items-center justify-center text-white relative">
                  <QrCode className="w-20 h-20 text-slate-300" />
                  <div className="absolute inset-0 border-2 border-indigo-500 rounded-sm animate-pulse" />
                </div>
                <span className="text-[8px] text-slate-400 font-mono">Secret Key: WEBRAJYA_2FA_SECRET</span>
              </div>

              <div className="space-y-2 col-span-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Authenticator App Handshake</span>
                <p className="text-slate-500 leading-normal">
                  Scan this barcode using Google Authenticator, Microsoft Authenticator, or 1Password. Scan, then input the six-digit verification code below to confirm hardware possession.
                </p>
                <div className="flex items-center space-x-2 pt-2">
                  <input
                    id="input-2fa-token"
                    type="text"
                    maxLength={6}
                    placeholder="e.g. 123456"
                    className="w-24 p-2 border border-slate-200 rounded-lg text-center font-mono font-bold text-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <button
                    id="btn-confirm-2fa"
                    onClick={() => {
                      setIs2faEnabled(true);
                      setShow2faMock(false);
                      alert('2FA successfully enabled! All future super admin sessions will require auth token validation.');
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg cursor-pointer shadow-sm text-xs"
                  >
                    Confirm & Enable
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
