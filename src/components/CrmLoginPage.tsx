import React, { useState } from 'react';
import {
  Lock,
  Mail,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { UserSession, CrmBrandConfig } from '../types';
import { authenticateCrmUser } from '../services/crmService';

interface CrmLoginPageProps {
  brandConfig: CrmBrandConfig;
  onLoginSuccess: (session: UserSession) => void;
  darkMode?: boolean;
}

export const CrmLoginPage: React.FC<CrmLoginPageProps> = ({
  brandConfig,
  onLoginSuccess,
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
        setError('Email atau password salah. Silakan periksa kembali.');
        return;
      }
      onLoginSuccess(session);
    } catch {
      setError('Terjadi kendala saat memproses login. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const logoSrc = brandConfig.logoUrl || 'https://rajaemasindonesia.co.id/wp-content/uploads/2025/01/2-Photoroom.png';

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-100 dark:bg-gray-950 text-slate-800 dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      <div className="w-full max-w-md">
        {/* Card Box */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-slate-200/80 dark:border-gray-800 p-6 sm:p-8 transition-all">
          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <img
              src={logoSrc}
              alt="Raja Emas Indonesia"
              className="h-12 w-auto object-contain mb-3"
            />

            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Masuk ke Akun
            </h1>
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
              Silakan masukkan email dan password untuk melanjutkan
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1.5">
                Email
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
              <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
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
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-[0.99] cursor-pointer mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <span>Masuk</span>
              )}
            </button>
          </form>

          {/* Footer Info */}
          <div className="mt-6 text-center text-xs text-slate-400 dark:text-gray-500">
            Gunakan akun yang telah terdaftar di Dasbor Mitra.
          </div>
        </div>

        <div className="text-center text-xs text-slate-400 dark:text-gray-600 mt-4">
          PT Emas Murni Asli • Raja Emas Indonesia
        </div>
      </div>
    </div>
  );
};
