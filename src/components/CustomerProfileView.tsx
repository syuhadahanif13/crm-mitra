import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  Briefcase, 
  CreditCard, 
  Coins, 
  FileText, 
  MessageCircle,
  ChevronRight,
  X,
  Edit2,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { CustomerProfile, GoldInstallmentContract } from '../types';
import { formatRupiah } from '../utils/formatters';
import { getWhatsAppDirectUrl } from '../services/crmService';

interface CustomerProfileViewProps {
  customers: CustomerProfile[];
  contracts: GoldInstallmentContract[];
  onAddCustomer: (customer: CustomerProfile) => void;
  onUpdateCustomer?: (customer: CustomerProfile) => void;
  onDeleteCustomer?: (customerId: string) => void;
  onSelectCustomerAkad: (customer: CustomerProfile) => void;
  onViewContract: (contract: GoldInstallmentContract) => void;
  darkMode?: boolean;
}

export const CustomerProfileView: React.FC<CustomerProfileViewProps> = ({
  customers,
  contracts,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
  onSelectCustomerAkad,
  onViewContract,
  darkMode = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(customers[0] || null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerProfile | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<CustomerProfile | null>(null);

  // Keep selectedCustomer in sync with customers list
  React.useEffect(() => {
    if (selectedCustomer) {
      const exists = customers.find((c) => c.id === selectedCustomer.id);
      if (exists) {
        setSelectedCustomer(exists);
      } else {
        setSelectedCustomer(customers[0] || null);
      }
    } else if (customers.length > 0) {
      setSelectedCustomer(customers[0]);
    }
  }, [customers]);

  const handleConfirmDelete = () => {
    if (!deletingCustomer) return;
    onDeleteCustomer?.(deletingCustomer.id);
    if (selectedCustomer?.id === deletingCustomer.id) {
      const remaining = customers.filter((c) => c.id !== deletingCustomer.id);
      setSelectedCustomer(remaining[0] || null);
    }
    setDeletingCustomer(null);
  };

  const handleSaveEditCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer || !editingCustomer.name || !editingCustomer.phone) return;
    onUpdateCustomer?.(editingCustomer);
    setSelectedCustomer(editingCustomer);
    setEditingCustomer(null);
  };

  // Form states
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | ''>(42);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [nik, setNik] = useState('');
  const [address, setAddress] = useState('');
  const [occupation, setOccupation] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState<number | ''>(25000000);
  const [partnerName, setPartnerName] = useState('BPRS Harta Insan Karimah (HIK)');

  const filteredCustomers = customers.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      c.phone.includes(term) ||
      c.email.toLowerCase().includes(term) ||
      c.occupation.toLowerCase().includes(term)
    );
  });

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    const newCust: CustomerProfile = {
      id: `cust-${Date.now()}`,
      partnerId: 'partner-bprs-himbarsi-01',
      partnerName: partnerName,
      partnerCategory: 'BPRS',
      name,
      age: Number(age) || 35,
      phone,
      email: email || `${name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      nik: nik || `317409${Date.now()}`,
      address: address || 'Jakarta',
      occupation: occupation || 'Wiraswasta',
      monthlyIncome: Number(monthlyIncome) || 15000000,
      status: 'Aktif',
      creditGrade: 'A (Sangat Lancar)',
      joinedDate: new Date().toISOString().split('T')[0],
      totalGramsFinanced: 0,
      activeContractsCount: 0,
      completedContractsCount: 0,
      notes: 'Nasabah baru terdaftar via CRM Raja Emas.',
    };

    onAddCustomer(newCust);
    setSelectedCustomer(newCust);
    setShowAddModal(false);
    // Reset
    setName('');
    setAge(42);
    setPhone('');
    setEmail('');
    setNik('');
    setAddress('');
    setOccupation('');
  };

  const getContractsForCustomer = (customerId: string) => {
    return contracts.filter((ct) => ct.customerId === customerId);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Action (Audime Style) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Database Profil Nasabah
          </h2>
          <p className="text-xs text-slate-400 dark:text-gray-500 mt-0.5">
            Kelola data nasabah pembiayaan, verifikasi profil, histori akad, dan otomasi kontak
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs rounded-full flex items-center gap-1.5 shadow-md shadow-indigo-500/25 transition-all cursor-pointer active:scale-95 shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Tambah Nasabah</span>
        </button>
      </div>

      {/* Main Grid: Directory on Left, Detailed Dossier on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Customer Directory */}
        <div className="lg:col-span-5 space-y-3">
          {/* Search Box Pill */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama nasabah, no HP, pekerjaan..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-gray-900 border border-slate-200/80 dark:border-gray-800 rounded-full text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
            />
          </div>

          {/* Customer Cards List */}
          <div className="space-y-2.5">
            {filteredCustomers.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 dark:text-gray-500 border border-dashed border-slate-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900">
                Belum ada data nasabah. Klik tombol "+ Tambah Nasabah" di atas untuk menambahkan nasabah baru.
              </div>
            ) : (
              filteredCustomers.map((c) => {
                const isSelected = selectedCustomer?.id === c.id;
                const customerContracts = getContractsForCustomer(c.id);

                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedCustomer(c);
                      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                        document.getElementById('customer-dossier')?.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-400 dark:border-indigo-600 shadow-sm ring-1 ring-indigo-400/30'
                        : 'bg-white dark:bg-gray-900 border-slate-100 dark:border-gray-800 hover:border-slate-200 dark:hover:border-gray-700 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold flex items-center justify-center text-xs shadow-sm ring-2 ring-white dark:ring-gray-900 shrink-0">
                          {c.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-slate-900 dark:text-white">
                              {c.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">({c.age} th)</span>
                          </div>
                          <div className="text-[11px] text-slate-400 dark:text-gray-500 mt-0.5">
                            {c.occupation} · {c.phone}
                          </div>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300">
                        {c.creditGrade.split(' ')[0]}
                      </span>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-gray-800 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
                        <Coins className="w-3.5 h-3.5" />
                        <span>{c.totalGramsFinanced} Gram Pembiayaan</span>
                      </div>
                      <div className="text-slate-400 dark:text-gray-500 flex items-center gap-1 font-medium">
                        <span>{customerContracts.length} Akad</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detailed Customer Dossier (Audime Rounded-3xl Card) */}
        <div id="customer-dossier" className="lg:col-span-7 scroll-mt-20">
          {selectedCustomer ? (
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-slate-100 dark:border-gray-800 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.04)] space-y-6">
              {/* Header Profile */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-5 border-b border-slate-100 dark:border-gray-800">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-black text-lg flex items-center justify-center shadow-md ring-2 ring-white dark:ring-gray-800 shrink-0">
                    {selectedCustomer.name.replace(/^(Ibu|Bpk\.)\s*/, '').substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{selectedCustomer.name}</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                        {selectedCustomer.age} Tahun
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 dark:text-gray-500 mt-0.5 flex items-center gap-2">
                      <span>NIK: {selectedCustomer.nik}</span>
                      <span>·</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedCustomer.status}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={getWhatsAppDirectUrl({
                      phone: selectedCustomer.phone,
                      message: `Halo ${selectedCustomer.name}, kami dari Tim Layanan CRM Raja Emas Indonesia & ${selectedCustomer.partnerName}...`,
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 transition-all"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>

                  <button
                    onClick={() => setEditingCustomer({ ...selectedCustomer })}
                    className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-200 font-bold text-xs flex items-center gap-1.5 border border-slate-200 dark:border-gray-700 transition-colors cursor-pointer"
                    title="Edit Profil Nasabah"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => setDeletingCustomer(selectedCustomer)}
                    className="px-3 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center gap-1.5 border border-rose-200/60 dark:border-rose-800/60 transition-colors cursor-pointer"
                    title="Hapus Data Nasabah"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>

                  <button
                    onClick={() => onSelectCustomerAkad(selectedCustomer)}
                    className="px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
                  >
                    <Coins className="w-3.5 h-3.5" />
                    <span>+ Buat Akad</span>
                  </button>
                </div>
              </div>

              {/* Data Identitas & Kontak (Audime Soft Tiles) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-gray-800/40 border border-slate-100 dark:border-gray-800 space-y-1">
                  <span className="text-[11px] text-slate-400 dark:text-gray-500 block flex items-center gap-1.5 font-medium">
                    <Phone className="w-3.5 h-3.5 text-indigo-500" />
                    Nomor WhatsApp / HP:
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                    {selectedCustomer.phone}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-gray-800/40 border border-slate-100 dark:border-gray-800 space-y-1">
                  <span className="text-[11px] text-slate-400 dark:text-gray-500 block flex items-center gap-1.5 font-medium">
                    <Mail className="w-3.5 h-3.5 text-indigo-500" />
                    Email Resmi:
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
                    {selectedCustomer.email}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-gray-800/40 border border-slate-100 dark:border-gray-800 space-y-1">
                  <span className="text-[11px] text-slate-400 dark:text-gray-500 block flex items-center gap-1.5 font-medium">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                    Pekerjaan / Penghasilan:
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {selectedCustomer.occupation} ({formatRupiah(selectedCustomer.monthlyIncome || 0)}/bln)
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-gray-800/40 border border-slate-100 dark:border-gray-800 space-y-1">
                  <span className="text-[11px] text-slate-400 dark:text-gray-500 block flex items-center gap-1.5 font-medium">
                    <CreditCard className="w-3.5 h-3.5 text-indigo-500" />
                    Mitra Penyelenggara:
                  </span>
                  <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                    {selectedCustomer.partnerName}
                  </span>
                </div>
              </div>

              {/* Alamat Lengkap */}
              <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-gray-800/40 border border-slate-100 dark:border-gray-800 text-xs">
                <span className="text-[11px] text-slate-400 dark:text-gray-500 font-medium flex items-center gap-1.5 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                  Alamat Tempat Tinggal / KTP:
                </span>
                <span className="text-slate-800 dark:text-slate-200">{selectedCustomer.address}</span>
              </div>

              {/* Riwayat Akad Cicilan Emas Nasabah */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-indigo-500" />
                    Riwayat Fasilitas Akad Cicilan Emas
                  </h4>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    Total: {getContractsForCustomer(selectedCustomer.id).length} Akad
                  </span>
                </div>

                <div className="space-y-2.5">
                  {getContractsForCustomer(selectedCustomer.id).map((ct) => (
                    <div
                      key={ct.id}
                      className="p-4 rounded-2xl bg-slate-50/60 dark:bg-gray-800/40 border border-slate-100 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-colors hover:border-slate-200 dark:hover:border-gray-700"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                            {ct.contractNumber}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                            {ct.goldWeightGrams} gr · {ct.tenorMonths} Bulan (1 Thn)
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-gray-400 mt-1 space-x-2">
                          <span>DP: <strong>{formatRupiah(ct.downPayment)}</strong></span>
                          <span>·</span>
                          <span>Angsuran: <strong>{formatRupiah(ct.monthlyInstallment)}/bln</strong></span>
                          <span>·</span>
                          <span className="text-slate-700 dark:text-slate-300 font-semibold">Jatuh Tempo: tgl {ct.dueDateDay}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => onViewContract(ct)}
                        className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-slate-800 dark:text-gray-200 font-bold text-xs flex items-center gap-1.5 border border-slate-200 dark:border-gray-700 cursor-pointer transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Dokumen Akad</span>
                      </button>
                    </div>
                  ))}

                  {getContractsForCustomer(selectedCustomer.id).length === 0 && (
                    <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-gray-800 rounded-2xl">
                      Belum ada akad cicilan aktif. Klik '+ Buat Akad' di atas untuk memulai simulasi.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs bg-white dark:bg-gray-900 rounded-3xl border border-slate-100 dark:border-gray-800">
              {customers.length === 0
                ? 'Belum ada nasabah terdaftar. Tambahkan nasabah untuk melihat berkas profil lengkap.'
                : 'Pilih nasabah dari direktori sebelah kiri.'}
            </div>
          )}
        </div>

      </div>

      {/* Modal Tambah Nasabah Baru (Audime Rounded-3xl Card) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-900 dark:text-white space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-gray-800">
              <h3 className="font-bold text-base flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                Registrasi Nasabah Baru
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600 dark:text-gray-400 block mb-1">Nama Lengkap Nasabah:</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Nama Nasabah"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 dark:text-gray-400 block mb-1">Usia (Tahun):</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Contoh: 42"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600 dark:text-gray-400 block mb-1">Nomor WhatsApp / HP:</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="081802180003"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none font-mono focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 dark:text-gray-400 block mb-1">Email:</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="aini.nasabah@gmail.com"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600 dark:text-gray-400 block mb-1">Pekerjaan:</label>
                  <input
                    type="text"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    placeholder="Wiraswasta / Karyawan"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 dark:text-gray-400 block mb-1">Mitra BPRS / Lembaga:</label>
                  <input
                    type="text"
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-600 dark:text-gray-400 block mb-1">Alamat Tempat Tinggal:</label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Jl. Surya Kencana No. 42, Kebon Jeruk, Jakarta Barat"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-full text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 font-semibold cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold shadow-md shadow-indigo-500/20 cursor-pointer transition-all active:scale-95"
                >
                  Simpan Nasabah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Nasabah (Audime Rounded-3xl Card) */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-900 dark:text-white space-y-4 animate-in zoom-in-95 duration-200 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-gray-800">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-indigo-600" />
                Edit Profil Nasabah
              </h3>
              <button
                onClick={() => setEditingCustomer(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditCustomer} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600 dark:text-gray-400 block mb-1">Nama Lengkap:</label>
                  <input
                    type="text"
                    required
                    value={editingCustomer.name}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 dark:text-gray-400 block mb-1">Usia (Tahun):</label>
                  <input
                    type="number"
                    value={editingCustomer.age}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, age: Number(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600 dark:text-gray-400 block mb-1">Nomor WhatsApp / HP:</label>
                  <input
                    type="text"
                    required
                    value={editingCustomer.phone}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none font-mono focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 dark:text-gray-400 block mb-1">Email:</label>
                  <input
                    type="email"
                    value={editingCustomer.email}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600 dark:text-gray-400 block mb-1">NIK KTP:</label>
                  <input
                    type="text"
                    value={editingCustomer.nik}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, nik: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none font-mono focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 dark:text-gray-400 block mb-1">Pekerjaan:</label>
                  <input
                    type="text"
                    value={editingCustomer.occupation}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, occupation: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600 dark:text-gray-400 block mb-1">Penghasilan Bulanan (Rp):</label>
                  <input
                    type="number"
                    value={editingCustomer.monthlyIncome}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, monthlyIncome: Number(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 dark:text-gray-400 block mb-1">Mitra BPRS / Lembaga:</label>
                  <input
                    type="text"
                    value={editingCustomer.partnerName}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, partnerName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600 dark:text-gray-400 block mb-1">Status Nasabah:</label>
                  <select
                    value={editingCustomer.status}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, status: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Prospek">Prospek</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Perhatian Khusus">Perhatian Khusus</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-600 dark:text-gray-400 block mb-1">Grade Kredit:</label>
                  <select
                    value={editingCustomer.creditGrade}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, creditGrade: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="A (Sangat Lancar)">A (Sangat Lancar)</option>
                    <option value="B (Lancar)">B (Lancar)</option>
                    <option value="C (Kurang Lancar)">C (Kurang Lancar)</option>
                    <option value="D (Macet)">D (Macet)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-600 dark:text-gray-400 block mb-1">Alamat Tempat Tinggal:</label>
                <textarea
                  rows={2}
                  value={editingCustomer.address}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, address: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="px-4 py-2 rounded-full text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 font-semibold cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold shadow-md shadow-indigo-500/20 cursor-pointer transition-all active:scale-95"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dialog Konfirmasi Hapus Nasabah (Audime Rounded-3xl Card) */}
      {deletingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-900 dark:text-white space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <h3 className="font-bold text-base">Hapus Data Nasabah</h3>
                <p className="text-xs text-slate-400 dark:text-gray-500">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
              Apakah Anda yakin ingin menghapus data nasabah <strong className="text-slate-900 dark:text-white">{deletingCustomer.name}</strong> ({deletingCustomer.phone})?
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setDeletingCustomer(null)}
                className="px-4 py-2 rounded-full text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 font-semibold cursor-pointer transition-colors text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 cursor-pointer transition-all active:scale-95"
              >
                Ya, Hapus Nasabah
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
