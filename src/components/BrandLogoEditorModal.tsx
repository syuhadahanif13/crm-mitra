import React, { useState } from 'react';
import {
  X,
  Palette,
  Upload,
  Sparkles,
  Check,
  RotateCcw,
  Crown,
  Shield,
  Coins,
  Gem,
  CircleDot
} from 'lucide-react';
import { CrmBrandConfig } from '../types';
import { DEFAULT_BRAND_CONFIG } from '../services/crmService';

interface BrandLogoEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandConfig: CrmBrandConfig;
  onSaveBrandConfig: (config: CrmBrandConfig) => void;
}

export const BrandLogoEditorModal: React.FC<BrandLogoEditorModalProps> = ({
  isOpen,
  onClose,
  brandConfig,
  onSaveBrandConfig,
}) => {
  const [brandName, setBrandName] = useState(brandConfig.brandName);
  const [tagline, setTagline] = useState(brandConfig.tagline);
  const [logoType, setLogoType] = useState<'image' | 'preset'>(brandConfig.logoType);
  const [logoUrl, setLogoUrl] = useState(brandConfig.logoUrl || '');
  const [presetIcon, setPresetIcon] = useState(brandConfig.presetIcon);
  const [accentTheme, setAccentTheme] = useState(brandConfig.accentTheme);

  if (!isOpen) return null;

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
        setLogoType('image');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSaveBrandConfig({
      brandName: brandName.trim() || 'Raja Emas CRM',
      tagline: tagline.trim() || 'Sistem Pembiayaan & Cicilan Emas',
      logoType,
      logoUrl: logoType === 'image' ? logoUrl : undefined,
      presetIcon,
      accentTheme,
    });
    onClose();
  };

  const handleReset = () => {
    setBrandName(DEFAULT_BRAND_CONFIG.brandName);
    setTagline(DEFAULT_BRAND_CONFIG.tagline);
    setLogoType(DEFAULT_BRAND_CONFIG.logoType);
    setLogoUrl('');
    setPresetIcon(DEFAULT_BRAND_CONFIG.presetIcon);
    setAccentTheme(DEFAULT_BRAND_CONFIG.accentTheme);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-gray-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md">
              <Palette className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Kustomisasi Logo & Brand CRM</h3>
              <p className="text-xs text-indigo-200">
                Ubah logo, nama brand, dan nuansa warna aplikasi CRM Anda
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Live Preview Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-gray-800/40 border border-slate-200 dark:border-gray-700 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-700 flex items-center justify-center shadow-md text-white font-black text-xl shrink-0 overflow-hidden">
              {logoType === 'image' && logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : presetIcon === 'crown' ? (
                <Crown className="w-7 h-7 text-amber-300" />
              ) : presetIcon === 'gem' ? (
                <Gem className="w-7 h-7 text-pink-300" />
              ) : presetIcon === 'shield' ? (
                <Shield className="w-7 h-7 text-emerald-300" />
              ) : presetIcon === 'coins' ? (
                <Coins className="w-7 h-7 text-amber-300" />
              ) : (
                <CircleDot className="w-7 h-7 text-amber-300" />
              )}
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Pratinjau Tampilan Header:</div>
              <div className="text-base font-extrabold text-slate-900 dark:text-white">
                {brandName || 'Raja Emas CRM'}
              </div>
              <div className="text-xs text-slate-500 dark:text-gray-400">
                {tagline || 'Konsorsium Pembiayaan Emas'}
              </div>
            </div>
          </div>

          {/* Form fields */}
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-gray-300 font-bold mb-1">
                Nama Brand CRM:
              </label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Raja Emas CRM"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-gray-300 font-bold mb-1">
                Tagline / Subjudul:
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Sistem Pembiayaan & Cicilan Emas"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Logo Choice */}
            <div>
              <label className="block text-slate-700 dark:text-gray-300 font-bold mb-2">
                Pilih Tipe Logo:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLogoType('preset')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    logoType === 'preset'
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 shadow-sm'
                      : 'border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-400'
                  }`}
                >
                  Gunakan Ikon Logo Modern
                </button>
                <button
                  type="button"
                  onClick={() => setLogoType('image')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    logoType === 'image'
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 shadow-sm'
                      : 'border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-400'
                  }`}
                >
                  Upload File Gambar / URL
                </button>
              </div>
            </div>

            {logoType === 'preset' ? (
              <div>
                <label className="block text-slate-600 dark:text-gray-400 font-medium mb-1.5">
                  Pilih Ikon Lambang:
                </label>
                <div className="flex gap-2">
                  {[
                    { id: 'gold-ring', icon: CircleDot, label: 'Emas SNI' },
                    { id: 'crown', icon: Crown, label: 'Mahkota' },
                    { id: 'coins', icon: Coins, label: 'Koin' },
                    { id: 'gem', icon: Gem, label: 'Permata' },
                    { id: 'shield', icon: Shield, label: 'Fidusia' },
                  ].map((item) => {
                    const IconComp = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setPresetIcon(item.id as any)}
                        className={`flex-1 p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                          presetIcon === item.id
                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/30'
                            : 'border-slate-200 dark:border-gray-700 text-slate-500'
                        }`}
                      >
                        <IconComp className="w-5 h-5" />
                        <span className="text-[10px] font-semibold">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div>
                  <label className="block text-slate-600 dark:text-gray-400 font-medium mb-1">
                    Upload Gambar Logo (PNG / JPG / SVG):
                  </label>
                  <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-300 dark:border-gray-700 rounded-xl cursor-pointer hover:border-indigo-500 transition-colors">
                    <Upload className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-semibold text-slate-600 dark:text-gray-300">
                      Pilih file gambar dari komputer...
                    </span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-gray-400 font-medium mb-1">
                    Atau Masukkan URL Gambar:
                  </label>
                  <input
                    type="url"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://contoh.com/logo-raja-emas.png"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            {/* Accent Theme */}
            <div>
              <label className="block text-slate-700 dark:text-gray-300 font-bold mb-1.5">
                Tema Warna Navigasi & Aksen:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'purple-indigo', label: 'Audime (Purple/Indigo)', gradient: 'from-indigo-600 to-purple-600' },
                  { id: 'amber-gold', label: 'Gold Royal (Amber/Gold)', gradient: 'from-amber-600 to-yellow-500' },
                  { id: 'emerald-teal', label: 'Syariah (Emerald/Teal)', gradient: 'from-emerald-600 to-teal-500' },
                  { id: 'blue-cyan', label: 'Corporate (Blue/Cyan)', gradient: 'from-blue-600 to-cyan-500' },
                ].map((th) => (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => setAccentTheme(th.id as any)}
                    className={`p-2 rounded-xl border text-[11px] font-bold text-left transition-all ${
                      accentTheme === th.id
                        ? 'border-indigo-600 ring-2 ring-indigo-500/30 shadow-sm'
                        : 'border-slate-200 dark:border-gray-700'
                    }`}
                  >
                    <div className={`w-full h-3 rounded-md bg-gradient-to-r ${th.gradient} mb-1.5`} />
                    <span className="text-slate-800 dark:text-gray-200 truncate block">{th.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-gray-800/60 border-t border-slate-200 dark:border-gray-800 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Default</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-bold text-slate-600 dark:text-gray-300 hover:bg-slate-200 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full text-xs font-bold shadow-md shadow-indigo-500/25 flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Logo & Brand</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
