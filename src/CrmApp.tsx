import React, { useState, useEffect } from 'react';
import {
  Users,
  Coins,
  Bell,
  Boxes,
  ShieldCheck,
  Moon,
  Sun,
  Building2,
  ChevronDown,
  Sparkles,
  ExternalLink,
  MessageSquare,
  CheckCircle2,
  X
} from 'lucide-react';
import { CustomerProfile, GoldInstallmentContract, StockOpnameRecord, UserSession } from './types';
import {
  loadCrmCustomers,
  saveCrmCustomers,
  loadCrmContracts,
  saveCrmContracts,
  loadCrmStockOpnames,
  saveCrmStockOpnames,
  loadCrmNotifications,
} from './services/crmService';
import { CustomerProfileView } from './components/CustomerProfileView';
import { InstallmentContractView } from './components/InstallmentContractView';
import { DuePaymentAutomationView } from './components/DuePaymentAutomationView';
import { StockOpnameView } from './components/StockOpnameView';
import { AkadContractModal } from './components/AkadContractModal';

const PARTNER_OPTIONS: UserSession[] = [
  {
    role: 'bprs',
    partnerId: 'partner-bprs-himbarsi-01',
    partnerName: 'BPRS Harta Insan Karimah (HIK)',
    partnerCategory: 'BPRS',
    name: 'Ahmad Fauzi, S.E.',
    email: 'pembiayaan@bprshik.co.id',
    discountBalance: 12500000,
    pointsBalance: 420,
  },
  {
    role: 'bank',
    partnerId: 'partner-bank-dki-syariah',
    partnerName: 'Bank DKI Unit Usaha Syariah',
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
    name: 'Super Admin Konsorsium REI',
    email: 'konsorsium@rajaemas.co.id',
    discountBalance: 50000000,
    pointsBalance: 2500,
  },
];

export const CrmApp: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('crm_dark_mode') === 'true';
  });

  const [activeTab, setActiveTab] = useState<'due' | 'customers' | 'contracts' | 'opname'>('due');
  const [currentUser, setCurrentUser] = useState<UserSession>(PARTNER_OPTIONS[0]);

  // Data States with LocalStorage
  const [customers, setCustomers] = useState<CustomerProfile[]>(() => loadCrmCustomers());
  const [contracts, setContracts] = useState<GoldInstallmentContract[]>(() => loadCrmContracts());
  const [stockOpnames, setStockOpnames] = useState<StockOpnameRecord[]>(() => loadCrmStockOpnames());
  const [notifications] = useState(() => loadCrmNotifications());

  // Modal states
  const [viewingContract, setViewingContract] = useState<GoldInstallmentContract | null>(null);
  const [selectedCustomerForAkad, setSelectedCustomerForAkad] = useState<CustomerProfile | null>(null);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Sync dark mode class on documentElement
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('crm_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('crm_dark_mode', 'false');
    }
  }, [darkMode]);

  // Save changes to storage
  const handleUpdateContract = (updated: GoldInstallmentContract) => {
    const next = contracts.map((c) => (c.id === updated.id ? updated : c));
    setContracts(next);
    saveCrmContracts(next);
  };

  const handleAddContract = (newContract: GoldInstallmentContract) => {
    const next = [newContract, ...contracts];
    setContracts(next);
    saveCrmContracts(next);

    // Also update customer stats
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

  const handleCustomerAkadClick = (customer: CustomerProfile) => {
    setSelectedCustomerForAkad(customer);
    setActiveTab('contracts');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col font-sans antialiased">
      {/* Top Universal Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Logo & Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-600 to-yellow-500 flex items-center justify-center shadow-md shadow-amber-500/20 text-white font-black text-xl">
                RE
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base tracking-tight text-gray-900 dark:text-white">
                    RAJA EMAS CRM
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                    KONSORSIUM MITRA
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Sistem Pembiayaan Emas, Akad & Otomasi Tagihan
                </p>
              </div>
            </div>

            {/* Quick Case Jumping Pills */}
            <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/40 rounded-full border border-amber-200 dark:border-amber-800 text-xs">
              <span className="font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Uji 5 Kasus:
              </span>
              <button
                onClick={() => setActiveTab('customers')}
                className={`px-2 py-0.5 rounded-full font-medium ${
                  activeTab === 'customers' ? 'bg-amber-600 text-white' : 'text-amber-800 dark:text-amber-200 hover:bg-amber-200/50'
                }`}
              >
                1. Aini 42th
              </button>
              <button
                onClick={() => setActiveTab('contracts')}
                className={`px-2 py-0.5 rounded-full font-medium ${
                  activeTab === 'contracts' ? 'bg-amber-600 text-white' : 'text-amber-800 dark:text-amber-200 hover:bg-amber-200/50'
                }`}
              >
                2 & 3. Akad 10g
              </button>
              <button
                onClick={() => setActiveTab('due')}
                className={`px-2 py-0.5 rounded-full font-medium ${
                  activeTab === 'due' ? 'bg-amber-600 text-white' : 'text-amber-800 dark:text-amber-200 hover:bg-amber-200/50'
                }`}
              >
                4. Jatuh Tempo 10 Okt
              </button>
              <button
                onClick={() => setActiveTab('opname')}
                className={`px-2 py-0.5 rounded-full font-medium ${
                  activeTab === 'opname' ? 'bg-amber-600 text-white' : 'text-amber-800 dark:text-amber-200 hover:bg-amber-200/50'
                }`}
              >
                5. Stock Opname
              </button>
            </div>

            {/* Partner Switcher & Actions */}
            <div className="flex items-center gap-3">
              {/* Institution Switcher */}
              <div className="relative">
                <select
                  value={currentUser.partnerId}
                  onChange={(e) => {
                    const match = PARTNER_OPTIONS.find((p) => p.partnerId === e.target.value);
                    if (match) setCurrentUser(match);
                  }}
                  className="pl-8 pr-7 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer appearance-none transition-colors"
                >
                  {PARTNER_OPTIONS.map((p) => (
                    <option key={p.partnerId} value={p.partnerId}>
                      {p.partnerName} ({p.partnerCategory})
                    </option>
                  ))}
                </select>
                <Building2 className="w-3.5 h-3.5 text-amber-600 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <ChevronDown className="w-3 h-3 text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Notification Bell */}
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Notifikasi Sistem & WhatsApp"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-white dark:ring-gray-900 animate-pulse" />
              </button>

              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Ganti Tema (Dark / Light)"
              >
                {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-gray-700" />}
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 sm:space-x-4 border-t border-gray-100 dark:border-gray-800 pt-2 pb-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('due')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'due'
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Otomasi Jatuh Tempo</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-bold">
                10 Okt
              </span>
            </button>

            <button
              onClick={() => setActiveTab('customers')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'customers'
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Profil Nasabah</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                {customers.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('contracts')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'contracts'
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Coins className="w-4 h-4" />
              <span>Akad & Cicilan Emas</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                {contracts.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('opname')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'opname'
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Boxes className="w-4 h-4" />
              <span>Stock Opname Brankas</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                100% Match
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
            onSelectCustomerAkad={handleCustomerAkadClick}
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

      {/* Contract Detail & Print Modal */}
      {viewingContract && (
        <AkadContractModal
          contract={viewingContract}
          isOpen={!!viewingContract}
          onClose={() => setViewingContract(null)}
          darkMode={darkMode}
        />
      )}

      {/* Notifications Drawer */}
      {isNotifOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 h-full shadow-2xl p-6 flex flex-col border-l border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-base text-gray-900 dark:text-white">
                  Notifikasi Sistem & WhatsApp
                </h3>
              </div>
              <button
                onClick={() => setIsNotifOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 hover:border-amber-400 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      {notif.channel}
                    </span>
                    <span className="text-[10px] text-gray-400">{notif.timestamp}</span>
                  </div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white mt-1.5">
                    {notif.title}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                    {notif.message}
                  </p>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1 font-medium">
                    <MessageSquare className="w-3 h-3 text-emerald-500" />
                    Penerima: {notif.recipientName} ({notif.recipientPhone})
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setIsNotifOpen(false)}
              className="w-full py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs font-semibold rounded-xl text-gray-700 dark:text-gray-300 transition-colors"
            >
              Tutup Panel Notifikasi
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-4 text-xs text-center text-gray-500 dark:text-gray-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © 2026 PT EMAS MURNI ASLI & KONSORSIUM MITRA • RAJA EMAS INDONESIA CRM
          </span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Terstandarisasi Logam Mulia SNI & Syariah Murabahah
          </span>
        </div>
      </footer>
    </div>
  );
};
export default CrmApp;
