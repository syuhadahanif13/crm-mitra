import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Clock,
  Users,
  Coins,
  Boxes,
  Download,
  Settings,
  Bell,
  Sun,
  Moon,
  Building2,
  ChevronDown,
  Edit3,
  X,
  MessageSquare,
  Plus,
  ShieldCheck,
  Crown,
  Gem,
  CircleDot,
  Shield,
  LogOut
} from 'lucide-react';
import {
  CustomerProfile,
  GoldInstallmentContract,
  StockOpnameRecord,
  UserSession,
  CrmBrandConfig,
} from './types';
import {
  loadCrmCustomers,
  saveCrmCustomers,
  loadCrmContracts,
  saveCrmContracts,
  loadCrmStockOpnames,
  saveCrmStockOpnames,
  loadCrmNotifications,
  loadCrmBrandConfig,
  saveCrmBrandConfig,
  loadCrmSession,
  saveCrmSession,
  clearCrmSession,
} from './services/crmService';
import { CrmLoginPage } from './components/CrmLoginPage';
import { AudimeDashboardView } from './components/AudimeDashboardView';
import { CustomerProfileView } from './components/CustomerProfileView';
import { InstallmentContractView } from './components/InstallmentContractView';
import { DuePaymentAutomationView } from './components/DuePaymentAutomationView';
import { StockOpnameView } from './components/StockOpnameView';
import { AkadContractModal } from './components/AkadContractModal';
import { ImportMitraModal } from './components/ImportMitraModal';
import { AddManualTransactionModal } from './components/AddManualTransactionModal';
import { BrandLogoEditorModal } from './components/BrandLogoEditorModal';

const PARTNER_OPTIONS: UserSession[] = [
  {
    role: 'bprs',
    partnerId: 'partner-bprs-himbarsi-01',
    partnerName: 'BPRS Harta Insan Karimah',
    partnerCategory: 'BPRS',
    name: 'Ahmad Fauzi, S.E.',
    email: 'pembiayaan@bprshik.co.id',
    discountBalance: 12500000,
    pointsBalance: 420,
  },
  {
    role: 'bank',
    partnerId: 'partner-bank-dki-syariah',
    partnerName: 'Bank DKI Syariah',
    partnerCategory: 'Bank',
    name: 'Irfan Hakim, M.M.',
    email: 'gold.financing@bankdki.co.id',
    discountBalance: 28000000,
    pointsBalance: 980,
  },
  {
    role: 'koperasi',
    partnerId: 'partner-kop-syariah-212',
    partnerName: 'Koperasi Syariah 212',
    partnerCategory: 'Koperasi Syariah',
    name: 'Siti Aminah, S.Sy.',
    email: 'koperasi212@emas.co.id',
    discountBalance: 7500000,
    pointsBalance: 310,
  },
  {
    role: 'admin',
    partnerId: 'rei-hq-admin',
    partnerName: 'PT Emas Murni Asli (HQ)',
    partnerCategory: 'Bank',
    name: 'Super Admin REI',
    email: 'konsorsium@rajaemas.co.id',
    discountBalance: 50000000,
    pointsBalance: 2500,
  },
];

export const CrmApp: React.FC = () => {
  // Default to Light Mode
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('crm_theme') === 'dark';
  });

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'due' | 'customers' | 'contracts' | 'opname' | 'import' | 'settings'
  >('dashboard');

  // User Authentication Session
  const [userSession, setUserSession] = useState<UserSession | null>(() => loadCrmSession());

  const [currentUser, setCurrentUser] = useState<UserSession>(() => {
    return loadCrmSession() || PARTNER_OPTIONS[0];
  });

  const handleLogout = () => {
    clearCrmSession();
    setUserSession(null);
  };

  // Brand config
  const [brandConfig, setBrandConfig] = useState<CrmBrandConfig>(() => loadCrmBrandConfig());

  // Data States
  const [customers, setCustomers] = useState<CustomerProfile[]>(() => loadCrmCustomers());
  const [contracts, setContracts] = useState<GoldInstallmentContract[]>(() => loadCrmContracts());
  const [stockOpnames, setStockOpnames] = useState<StockOpnameRecord[]>(() => loadCrmStockOpnames());
  const [notifications] = useState(() => loadCrmNotifications());

  // Modals
  const [viewingContract, setViewingContract] = useState<GoldInstallmentContract | null>(null);
  const [selectedCustomerForAkad, setSelectedCustomerForAkad] = useState<CustomerProfile | null>(null);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);
  const [isBrandLogoModalOpen, setIsBrandLogoModalOpen] = useState(false);

  // Sync dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('crm_theme', 'dark');
      localStorage.setItem('crm_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('crm_theme', 'light');
      localStorage.setItem('crm_dark_mode', 'false');
    }
  }, [darkMode]);

  const handleSaveBrand = (newConfig: CrmBrandConfig) => {
    setBrandConfig(newConfig);
    saveCrmBrandConfig(newConfig);
  };

  const handleUpdateContract = (updated: GoldInstallmentContract) => {
    const next = contracts.map((c) => (c.id === updated.id ? updated : c));
    setContracts(next);
    saveCrmContracts(next);
  };

  const handleAddContract = (newContract: GoldInstallmentContract) => {
    const next = [newContract, ...contracts];
    setContracts(next);
    saveCrmContracts(next);

    // Update customer financed total
    const cust = customers.find((c) => c.id === newContract.customerId);
    if (cust) {
      const nextCusts = customers.map((c) =>
        c.id === cust.id
          ? {
              ...c,
              totalGramsFinanced: c.totalGramsFinanced + newContract.goldWeightGrams,
              activeContractsCount: c.activeContractsCount + 1,
            }
          : c
      );
      setCustomers(nextCusts);
      saveCrmCustomers(nextCusts);
    }
  };

  const handleAddCustomer = (newCustomer: CustomerProfile) => {
    const next = [newCustomer, ...customers];
    setCustomers(next);
    saveCrmCustomers(next);
  };

  const handleUpdateStockOpname = (updated: StockOpnameRecord) => {
    const next = stockOpnames.map((r) => (r.id === updated.id ? updated : r));
    setStockOpnames(next);
    saveCrmStockOpnames(next);
  };

  const handleAddStockOpname = (newRecord: StockOpnameRecord) => {
    const next = [newRecord, ...stockOpnames];
    setStockOpnames(next);
    saveCrmStockOpnames(next);
  };

  // Nav items definition (Audime style)
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'due',
      label: 'Jatuh Tempo',
      icon: Clock,
      badge: '10 Okt',
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'customers',
      label: 'Nasabah',
      icon: Users,
      badge: customers.length,
      badgeColor: 'bg-slate-200 dark:bg-gray-800 text-slate-700 dark:text-gray-300',
    },
    {
      id: 'contracts',
      label: 'Akad Cicilan',
      icon: Coins,
      badge: contracts.length,
      badgeColor: 'bg-slate-200 dark:bg-gray-800 text-slate-700 dark:text-gray-300',
    },
    {
      id: 'opname',
      label: 'Stock Opname',
      icon: Boxes,
      badge: 'Match',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    },
    {
      id: 'import',
      label: 'Import Mitra',
      icon: Download,
      badge: 'Baru',
      badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
    },
    {
      id: 'settings',
      label: 'Logo & Brand',
      icon: Settings,
      badge: null,
    },
  ] as const;

  // Active theme gradient class
  const activeGradient =
    brandConfig.accentTheme === 'amber-gold'
      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 shadow-amber-500/30'
      : brandConfig.accentTheme === 'emerald-teal'
      ? 'bg-gradient-to-r from-emerald-600 to-teal-500 shadow-emerald-500/30'
      : brandConfig.accentTheme === 'blue-cyan'
      ? 'bg-gradient-to-r from-blue-600 to-cyan-500 shadow-blue-500/30'
      : 'bg-gradient-to-r from-indigo-600 to-purple-600 shadow-indigo-500/30';

  // If user is not authenticated, render Login Page
  if (!userSession) {
    return (
      <CrmLoginPage
        brandConfig={brandConfig}
        onLoginSuccess={(session) => {
          setUserSession(session);
          setCurrentUser(session);
          saveCrmSession(session);
        }}
        darkMode={darkMode}
      />
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-gray-950 font-sans antialiased text-slate-800 dark:text-slate-100 flex flex-col md:flex-row selection:bg-indigo-500 selection:text-white">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* LEFT SIDEBAR (Full Height Edge-to-Edge)                       */}
      {/* ───────────────────────────────────────────────────────────── */}
      <aside className="w-full md:w-64 bg-white dark:bg-gray-900 border-r border-slate-200/80 dark:border-gray-800 p-5 flex flex-col justify-between shrink-0 md:min-h-screen md:sticky md:top-0 md:h-screen overflow-y-auto">
            <div className="space-y-6">
              {/* Brand Logo & Name (With Live Edit Trigger) */}
              <div
                onClick={() => setIsBrandLogoModalOpen(true)}
                className="flex items-center justify-between p-2 rounded-2xl hover:bg-white dark:hover:bg-gray-800 transition-colors cursor-pointer group border border-transparent hover:border-slate-200 dark:hover:border-gray-700"
                title="Klik untuk mengubah logo dan identitas CRM"
              >
                <div className="flex items-center gap-3">
                  {/* Dynamic Logo */}
                  <div className="w-10 h-10 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm text-white font-black text-xl shrink-0 overflow-hidden ring-1 ring-slate-200 dark:ring-gray-700 p-1">
                    {brandConfig.logoType === 'image' && brandConfig.logoUrl ? (
                      <img src={brandConfig.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center">
                        {brandConfig.presetIcon === 'crown' ? (
                          <Crown className="w-5 h-5 text-amber-300" />
                        ) : brandConfig.presetIcon === 'gem' ? (
                          <Gem className="w-5 h-5 text-pink-300" />
                        ) : brandConfig.presetIcon === 'shield' ? (
                          <Shield className="w-5 h-5 text-emerald-300" />
                        ) : brandConfig.presetIcon === 'coins' ? (
                          <Coins className="w-5 h-5 text-amber-300" />
                        ) : (
                          <CircleDot className="w-5 h-5 text-amber-300" />
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>{brandConfig.brandName}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-gray-400 truncate max-w-[120px]">
                      {brandConfig.tagline}
                    </div>
                  </div>
                </div>

                <div className="p-1 rounded-lg text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 dark:group-hover:bg-gray-700 transition-colors">
                  <Edit3 className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Organization / Tenant Pill Selector */}
              <div className="relative">
                <div className="flex items-center justify-between p-2.5 px-3 bg-white dark:bg-gray-800/60 rounded-2xl border border-slate-200 dark:border-gray-700 hover:border-indigo-400 transition-all cursor-pointer shadow-sm">
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <Building2 className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-white truncate">
                      {currentUser.partnerName}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </div>

                <select
                  value={currentUser.partnerId}
                  onChange={(e) => {
                    const match = PARTNER_OPTIONS.find((p) => p.partnerId === e.target.value);
                    if (match) setCurrentUser(match);
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full"
                >
                  {PARTNER_OPTIONS.map((p) => (
                    <option key={p.partnerId} value={p.partnerId}>
                      {p.partnerName} ({p.partnerCategory})
                    </option>
                  ))}
                </select>
              </div>

              {/* Navigation Menu */}
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const isActive = activeTab === item.id;
                  const IconComp = item.icon;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (item.id === 'import') {
                          setIsImportModalOpen(true);
                        } else if (item.id === 'settings') {
                          setIsBrandLogoModalOpen(true);
                        } else {
                          setActiveTab(item.id);
                        }
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                        isActive
                          ? `${activeGradient} text-white shadow-md`
                          : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <IconComp className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>

                      {item.badge !== null && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isActive ? 'bg-white/20 text-white' : item.badgeColor
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Sidebar Bottom: Quick Actions & Status */}
            <div className="pt-4 border-t border-slate-200/80 dark:border-gray-800 space-y-3">
              <button
                onClick={() => setIsAddTransactionModalOpen(true)}
                className="w-full py-2.5 px-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center justify-center gap-1.5 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>+ Transaksi Mandiri</span>
              </button>

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1">
                <span>Raja Emas CRM</span>
                <span className="flex items-center gap-1 text-slate-400 dark:text-slate-500 font-medium">
                  Logam Mulia 24K
                </span>
              </div>
            </div>
          </aside>

          {/* ───────────────────────────────────────────────────────────── */}
          {/* MAIN CONTENT AREA                                              */}
          {/* ───────────────────────────────────────────────────────────── */}
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50 dark:bg-gray-950">
            {/* Top Minimal Bar */}
            <header className="px-6 py-3.5 bg-white dark:bg-gray-900 border-b border-slate-200/80 dark:border-gray-800 flex items-center justify-between gap-4">
              {/* Header Title & Breadcrumb */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-500 dark:text-gray-400">
                  Dasbor Pembiayaan Emas
                </span>
                <span className="text-slate-300 dark:text-gray-700">•</span>
                <span className="text-xs font-bold text-slate-800 dark:text-white">
                  {currentUser.partnerName}
                </span>
              </div>

              {/* Right Utilities */}
              <div className="flex items-center gap-2.5 shrink-0">
                {/* Notification Bell */}
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="relative p-2 rounded-2xl text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
                  title="Notifikasi Sistem & WhatsApp"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full" />
                </button>

                {/* Theme mode toggle pill */}
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                  title={darkMode ? 'Beralih ke Mode Terang (Default)' : 'Beralih ke Mode Gelap'}
                >
                  {darkMode ? (
                    <>
                      <Moon className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Mode Gelap</span>
                    </>
                  ) : (
                    <>
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      <span>Mode Terang</span>
                    </>
                  )}
                </button>

                {/* User Avatar & Logout */}
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-gray-800">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold flex items-center justify-center text-xs shadow-sm ring-2 ring-white dark:ring-gray-900">
                    {currentUser.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-bold text-slate-900 dark:text-white leading-none">
                      {currentUser.name}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-none mt-1">
                      {currentUser.partnerCategory}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors ml-1 cursor-pointer"
                    title="Keluar / Logout Akun CRM"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </header>

            {/* Main Tab Router */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
              {activeTab === 'dashboard' && (
                <AudimeDashboardView
                  currentUser={currentUser}
                  customers={customers}
                  contracts={contracts}
                  onOpenAddTransaction={() => setIsAddTransactionModalOpen(true)}
                  onOpenImportMitra={() => setIsImportModalOpen(true)}
                  onNavigateTab={(tab) => {
                    if (tab === 'import') setIsImportModalOpen(true);
                    else if (tab === 'settings') setIsBrandLogoModalOpen(true);
                    else setActiveTab(tab);
                  }}
                  onSelectCustomer={(c) => {
                    setSelectedCustomerForAkad(c);
                    setActiveTab('customers');
                  }}
                  onSelectContract={(c) => setViewingContract(c)}
                  onUpdateContract={handleUpdateContract}
                />
              )}

              {activeTab === 'due' && (
                <DuePaymentAutomationView
                  contracts={contracts}
                  onUpdateContract={handleUpdateContract}
                />
              )}

              {activeTab === 'customers' && (
                <CustomerProfileView
                  customers={customers}
                  contracts={contracts}
                  onAddCustomer={handleAddCustomer}
                  onSelectCustomerAkad={(c) => {
                    setSelectedCustomerForAkad(c);
                    setActiveTab('contracts');
                  }}
                  onViewContract={(c) => setViewingContract(c)}
                  darkMode={darkMode}
                />
              )}

              {activeTab === 'contracts' && (
                <InstallmentContractView
                  contracts={contracts}
                  customers={customers}
                  onAddContract={handleAddContract}
                  onViewContractModal={(c) => setViewingContract(c)}
                  selectedCustomerForAkad={selectedCustomerForAkad}
                  darkMode={darkMode}
                />
              )}

              {activeTab === 'opname' && (
                <StockOpnameView
                  records={stockOpnames}
                  onAddRecord={handleAddStockOpname}
                  onUpdateRecord={handleUpdateStockOpname}
                />
              )}
            </main>
          </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODALS & OVERLAYS                                             */}
      {/* ───────────────────────────────────────────────────────────── */}

      {/* 1. Import dari Dasbor Mitra Modal */}
      <ImportMitraModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportContract={handleAddContract}
        onImportCustomer={handleAddCustomer}
      />

      {/* 2. Tambah Transaksi Mandiri Modal */}
      <AddManualTransactionModal
        isOpen={isAddTransactionModalOpen}
        onClose={() => setIsAddTransactionModalOpen(false)}
        currentUser={currentUser}
        customers={customers}
        onAddContract={handleAddContract}
        onAddCustomer={handleAddCustomer}
      />

      {/* 3. Kustomisasi Logo & Brand Modal */}
      <BrandLogoEditorModal
        isOpen={isBrandLogoModalOpen}
        onClose={() => setIsBrandLogoModalOpen(false)}
        brandConfig={brandConfig}
        onSaveBrandConfig={handleSaveBrand}
      />

      {/* 4. Akad Contract Print/Detail Modal */}
      {viewingContract && (
        <AkadContractModal
          contract={viewingContract}
          isOpen={!!viewingContract}
          onClose={() => setViewingContract(null)}
          darkMode={darkMode}
        />
      )}

      {/* 5. Notifications Drawer */}
      {isNotifOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 h-full shadow-2xl p-6 flex flex-col border-l border-slate-200 dark:border-gray-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Notifikasi Sistem & WhatsApp
                </h3>
              </div>
              <button
                onClick={() => setIsNotifOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="p-3.5 rounded-2xl border border-slate-200 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-800/40 hover:border-indigo-400 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                      {notif.channel}
                    </span>
                    <span className="text-[10px] text-slate-400">{notif.timestamp}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1.5">
                    {notif.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-gray-300 mt-1 leading-relaxed">
                    {notif.message}
                  </p>
                  <div className="text-[11px] text-slate-500 dark:text-gray-400 mt-2 flex items-center gap-1 font-medium">
                    <MessageSquare className="w-3 h-3 text-emerald-500" />
                    Penerima: {notif.recipientName} ({notif.recipientPhone})
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setIsNotifOpen(false)}
              className="w-full py-2.5 bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 text-xs font-bold rounded-2xl text-slate-700 dark:text-gray-300 transition-colors"
            >
              Tutup Panel Notifikasi
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrmApp;
