import React, { useState } from 'react';
import {
  Lock,
  Mail,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  Building2,
  Crown,
  Gem,
  CircleDot,
  Coins,
  Shield
} from 'lucide-react';
import { UserSession, CrmBrandConfig } from '../types';
import { authenticateCrmUser, PARTNER_CREDENTIALS } from '../services/crmService';

interface CrmLoginPageProps {
  brandConfig: CrmBrandConfig;
  onLoginSuccess: (session: UserSession) => void;
  darkMode?: boolean;
}

export const CrmLoginPage: React.FC<CrmLoginPageProps> = ({
  brandConfig,
  onLoginSuccess,
  darkMode = false,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const session = await authenticateCrmUser(email, password);
      if (!session) {
        setError('Email atau password tidak sesuai dengan akun Dasbor Mitra terdaftar.');
        return;
      }
      onLoginSuccess(session);
    } catch {
      setError('Terjadi kendala saat memverifikasi akun. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (presetEmail: string, presetPass: string) => {
    setEmail(presetEmail);
    setPassword(presetPass);
    setError('');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-100 dark:bg-gray-950 text-slate-800 dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      <div className="w-full max-w-md">
        {/* Card Box */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-slate-200/80 dark:border-gray-800 p-6 sm:p-8 transition-all">
          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-black text-2xl mb-3 overflow-hidden ring-4 ring-indigo-50 dark:ring-indigo-950">
              {brandConfig.logoType === 'image' && brandConfig.logoUrl ? (
                <img src={brandConfig.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : brandConfig.presetIcon === 'crown' ? (
                <Crown className="w-7 h-7 text-amber-300" />
              ) : brandConfig.presetIcon === 'gem' ? (
                <Gem className="w-7 h-7 text-pink-300" />
              ) : brandConfig.presetIcon === 'shield' ? (
                <Shield className="w-7 h-7 text-emerald-300" />
              ) : brandConfig.presetIcon === 'coins' ? (
                <Coins className="w-7 h-7 text-amber-300" />
              ) : (
                <CircleDot className="w-7 h-7 text-amber-300" />
              )}
            </div>

            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              {brandConfig.brandName}
            </h1>
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 max-w-xs">
              {brandConfig.tagline}
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold mt-2 border border-indigo-200 dark:border-indigo-800">
              <Building2 className="w-3.5 h-3.5" />
              Kredensial Resmi Dasbor Mitra
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                Email Akun Mitra
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@perusahaan.co.id"
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-gray-700 bg-slate-50/50 dark:bg-gray-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password..."
                  className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-gray-700 bg-slate-50/50 dark:bg-gray-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-[0.99] cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Memverifikasi Akun...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Masuk ke Sistem CRM</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Credential Presets */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-gray-800">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500 mb-2.5 text-center">
              Pilihan Akun Mitra Terdaftar:
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {PARTNER_CREDENTIALS.map((cred) => (
                <button
                  key={cred.email}
                  type="button"
                  onClick={() => handleQuickFill(cred.email, cred.passwords[0])}
                  className="p-2 text-left rounded-xl border border-slate-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500 bg-slate-50/60 dark:bg-gray-800/40 hover:bg-indigo-50/30 transition-all group"
                >
                  <div className="font-bold text-slate-800 dark:text-white truncate group-hover:text-indigo-600">
                    {cred.session.partnerName}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {cred.email}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-5 text-center text-[11px] text-slate-400 dark:text-gray-500">
            Kredensial sama dengan akun resmi di Dasbor Mitra Raja Emas Indonesia.
          </div>
        </div>

        <div className="text-center text-xs text-slate-400 dark:text-gray-600 mt-4">
          PT Emas Murni Asli • Raja Emas Indonesia Konsorsium
        </div>
      </div>
    </div>
  );
};
