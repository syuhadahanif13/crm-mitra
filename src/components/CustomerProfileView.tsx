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
  X
} from 'lucide-react';
import { CustomerProfile, GoldInstallmentContract } from '../types';
import { formatRupiah } from '../utils/formatters';
import { getWhatsAppDirectUrl } from '../services/crmService';

interface CustomerProfileViewProps {
  customers: CustomerProfile[];
  contracts: GoldInstallmentContract[];
  onAddCustomer: (customer: CustomerProfile) => void;
  onSelectCustomerAkad: (customer: CustomerProfile) => void;
  onViewContract: (contract: GoldInstallmentContract) => void;
  darkMode?: boolean;
}

export const CustomerProfileView: React.FC<CustomerProfileViewProps> = ({
  customers,
  contracts,
  onAddCustomer,
  onSelectCustomerAkad,
  onViewContract,
  darkMode = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(customers[0] || null);
  const [showAddModal, setShowAddModal] = useState(false);

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
      notes: 'Nasabah baru terdaftar via CRM Konsorsium Raja Emas.',
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
      {/* Top Banner & Action */}
      <div className={`p-6 rounded-3xl border shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
        darkMode ? 'bg-[#1a1525] border-purple-800/40 text-gray-100' : 'bg-white border-purple-100 text-gray-900'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white shadow-md shadow-purple-600/30">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight">Database Profil Nasabah (CRM Emas)</h2>
            <p className="text-xs text-gray-500">Kelola identitas nasabah, verifikasi profil, histori akad, & otomasi kontak.</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-700 to-purple-800 hover:from-purple-600 hover:to-purple-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-700/25 transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Nasabah Baru</span>
        </button>
      </div>

      {/* Main Grid: List on Left, Detail on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Customer Directory */}
        <div className="lg:col-span-5 space-y-4">
          {/* Search Box */}
          <div className={`p-3 rounded-2xl border shadow-sm flex items-center gap-2.5 ${
            darkMode ? 'bg-[#1a1525] border-purple-800/40' : 'bg-white border-purple-100'
          }`}>
            <Search className="w-4 h-4 text-purple-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama (misal: Aini), no HP, pekerjaan..."
              className="w-full text-xs bg-transparent outline-none placeholder:text-gray-400"
            />
          </div>

          {/* Customer Cards List */}
          <div className="space-y-3">
            {filteredCustomers.map((c) => {
              const isSelected = selectedCustomer?.id === c.id;
              const customerContracts = getContractsForCustomer(c.id);

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCustomer(c)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? darkMode
                        ? 'bg-purple-950/60 border-purple-500 shadow-md shadow-purple-950/40'
                        : 'bg-purple-50/70 border-purple-400 shadow-md shadow-purple-100'
                      : darkMode
                      ? 'bg-[#1a1525] border-purple-800/30 hover:border-purple-700'
                      : 'bg-white border-purple-100 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-gray-900 dark:text-gray-100">
                          {c.name}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                          {c.age} Tahun
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-2">
                        <span>{c.occupation}</span>
                        <span>·</span>
                        <span>{c.phone}</span>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {c.creditGrade.split(' ')[0]}
                    </span>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-purple-100 dark:border-purple-900/40 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
                      <Coins className="w-3.5 h-3.5" />
                      <span>{c.totalGramsFinanced} Gram Cicilan</span>
                    </div>
                    <div className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <span>{customerContracts.length} Akad</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Customer Dossier */}
        <div className="lg:col-span-7">
          {selectedCustomer ? (
            <div className={`p-6 rounded-3xl border shadow-sm space-y-6 ${
              darkMode ? 'bg-[#1a1525] border-purple-800/40 text-gray-100' : 'bg-white border-purple-100 text-gray-900'
            }`}>
              {/* Header Profile */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-5 border-b border-purple-100 dark:border-purple-900/40">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-md">
                    {selectedCustomer.name.replace(/^(Ibu|Bpk\.)\s*/, '').substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-lg font-black text-gray-900 dark:text-gray-100">{selectedCustomer.name}</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300">
                        {selectedCustomer.age} Tahun
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                      <span>NIK: {selectedCustomer.nik}</span>
                      <span>·</span>
                      <span className="font-semibold text-emerald-600">{selectedCustomer.status}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={getWhatsAppDirectUrl({
                      phone: selectedCustomer.phone,
                      message: `Halo ${selectedCustomer.name}, kami dari Tim Layanan CRM Raja Emas Indonesia & ${selectedCustomer.partnerName}...`,
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>

                  <button
                    onClick={() => onSelectCustomerAkad(selectedCustomer)}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-700/20 cursor-pointer"
                  >
                    <Coins className="w-3.5 h-3.5" />
                    <span>Buat Akad Cicilan</span>
                  </button>
                </div>
              </div>

              {/* Data Identitas & Kontak */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/30 space-y-1">
                  <span className="text-[11px] text-gray-500 block flex items-center gap-1.5 font-semibold">
                    <Phone className="w-3.5 h-3.5 text-purple-600" />
                    Nomor WhatsApp / HP:
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100 font-mono">
                    {selectedCustomer.phone}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/30 space-y-1">
                  <span className="text-[11px] text-gray-500 block flex items-center gap-1.5 font-semibold">
                    <Mail className="w-3.5 h-3.5 text-purple-600" />
                    Email Resmi:
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate block">
                    {selectedCustomer.email}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/30 space-y-1">
                  <span className="text-[11px] text-gray-500 block flex items-center gap-1.5 font-semibold">
                    <Briefcase className="w-3.5 h-3.5 text-purple-600" />
                    Pekerjaan / Penghasilan:
                  </span>
                  <span className="text-xs font-bold text-gray-900 dark:text-gray-100">
                    {selectedCustomer.occupation} ({formatRupiah(selectedCustomer.monthlyIncome || 0)}/bln)
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/30 space-y-1">
                  <span className="text-[11px] text-gray-500 block flex items-center gap-1.5 font-semibold">
                    <CreditCard className="w-3.5 h-3.5 text-purple-600" />
                    Mitra Penyelenggara:
                  </span>
                  <span className="text-xs font-bold text-purple-900 dark:text-purple-300">
                    {selectedCustomer.partnerName}
                  </span>
                </div>
              </div>

              {/* Alamat Lengkap */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-purple-950/20 border border-gray-200 dark:border-purple-900/30 text-xs">
                <span className="text-[11px] text-gray-500 font-semibold flex items-center gap-1.5 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-purple-600" />
                  Alamat Tempat Tinggal / KTP:
                </span>
                <span className="text-gray-800 dark:text-gray-200">{selectedCustomer.address}</span>
              </div>

              {/* Riwayat Akad Cicilan Emas Nasabah */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-purple-950 dark:text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-purple-600" />
                    Riwayat Fasilitas Akad Cicilan Emas
                  </h4>
                  <span className="text-xs font-bold text-amber-600">
                    Total: {getContractsForCustomer(selectedCustomer.id).length} Akad
                  </span>
                </div>

                <div className="space-y-2.5">
                  {getContractsForCustomer(selectedCustomer.id).map((ct) => (
                    <div
                      key={ct.id}
                      className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-gray-900 dark:text-gray-100">
                            {ct.contractNumber}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                            {ct.goldWeightGrams} gr · {ct.tenorMonths} Bulan (1 Thn)
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-300 mt-1 space-x-2">
                          <span>DP: <strong>{formatRupiah(ct.downPayment)}</strong></span>
                          <span>·</span>
                          <span>Angsuran: <strong>{formatRupiah(ct.monthlyInstallment)}/bln</strong></span>
                          <span>·</span>
                          <span className="text-purple-700 dark:text-purple-400">Jatuh Tempo: tgl {ct.dueDateDay}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => onViewContract(ct)}
                        className="px-3 py-1.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Lihat Dokumen Akad</span>
                      </button>
                    </div>
                  ))}

                  {getContractsForCustomer(selectedCustomer.id).length === 0 && (
                    <div className="p-6 text-center text-xs text-gray-400 border border-dashed rounded-2xl">
                      Belum ada akad cicilan aktif. Klik 'Buat Akad Cicilan' di atas untuk memulai simulasi.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-gray-400">
              Pilih nasabah dari daftar sebelah kiri.
            </div>
          )}
        </div>

      </div>

      {/* Modal Tambah Nasabah Baru */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-lg rounded-3xl p-6 shadow-2xl border space-y-4 animate-in zoom-in-95 duration-200 ${
            darkMode ? 'bg-[#1a1525] border-purple-800 text-gray-100' : 'bg-white border-purple-100 text-gray-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-purple-100 dark:border-purple-800/40">
              <h3 className="font-black text-base flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-600" />
                Registrasi Nasabah Baru (CRM)
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Nama Lengkap Nasabah:</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Ibu Aini"
                    className="w-full p-2.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-purple-950/40 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Usia (Tahun):</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Contoh: 42"
                    className="w-full p-2.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-purple-950/40 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Nomor WhatsApp / HP:</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="081802180003"
                    className="w-full p-2.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-purple-950/40 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Email:</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="aini.nasabah@gmail.com"
                    className="w-full p-2.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-purple-950/40 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Pekerjaan:</label>
                  <input
                    type="text"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    placeholder="Wiraswasta / Karyawan"
                    className="w-full p-2.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-purple-950/40 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Mitra BPRS / Penyelenggara:</label>
                  <input
                    type="text"
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-purple-950/40 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Alamat Tempat Tinggal:</label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Jl. Surya Kencana No. 42, Kebon Jeruk, Jakarta Barat"
                  className="w-full p-2.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-purple-950/40 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-purple-100 dark:border-purple-800/40">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-purple-900/40 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-bold shadow-md shadow-purple-700/20 cursor-pointer"
                >
                  Simpan Profil Nasabah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
