import React, { useState } from 'react';
import { 
  FileText, 
  PlusCircle, 
  Coins, 
  Search, 
  Eye, 
  BellRing,
  X
} from 'lucide-react';
import { GoldInstallmentContract, CustomerProfile } from '../types';
import { formatRupiah, formatGrams } from '../utils/formatters';
import { 
  calculateInstallmentSimulation, 
  generateContractSchedule, 
  sendAkadWhatsAppNotification 
} from '../services/crmService';

interface InstallmentContractViewProps {
  contracts: GoldInstallmentContract[];
  customers: CustomerProfile[];
  onAddContract: (contract: GoldInstallmentContract) => void;
  onViewContractModal: (contract: GoldInstallmentContract) => void;
  selectedCustomerForAkad?: CustomerProfile | null;
  darkMode?: boolean;
}

export const InstallmentContractView: React.FC<InstallmentContractViewProps> = ({
  contracts,
  customers,
  onAddContract,
  onViewContractModal,
  selectedCustomerForAkad,
  darkMode = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [showSimulateModal, setShowSimulateModal] = useState(!!selectedCustomerForAkad);

  // Form states untuk pembuatan akad baru
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    selectedCustomerForAkad?.id || customers[0]?.id || ''
  );
  // Default sesuai case 2: 10 gram, 1 tahun (12 bulan)
  const [goldWeightGrams, setGoldWeightGrams] = useState<number>(10);
  const [tenorMonths, setTenorMonths] = useState<number>(12);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [customDownPayment, setCustomDownPayment] = useState<number | ''>(5000000); // DP 5 jt
  const [marginRateAnnualPercent, setMarginRateAnnualPercent] = useState<number>(6.0); // 6% p.a
  const [dueDateDay, setDueDateDay] = useState<number>(10); // Jatuh tempo tanggal 10
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccessNotice, setActionSuccessNotice] = useState<string | null>(null);

  const getGoldPriceEstimate = (weight: number) => {
    const basePerGram = 2562500;
    return weight * basePerGram;
  };

  const goldBasePrice = getGoldPriceEstimate(goldWeightGrams);

  const simulation = calculateInstallmentSimulation({
    goldWeightGrams,
    goldBasePrice,
    tenorMonths,
    downPaymentPercent,
    customDownPayment: customDownPayment === '' ? undefined : Number(customDownPayment),
    marginRateAnnualPercent,
    adminAndVaultFee: 150000,
  });

  const selectedCust = customers.find((c) => c.id === selectedCustomerId) || customers[0];

  const handleCreateAkad = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCust) return;

    setIsSubmitting(true);
    const contractNum = `AKAD-REI/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(contracts.length + 1).padStart(4, '0')}`;
    const today = new Date().toISOString().split('T')[0];

    const schedule = generateContractSchedule(
      today,
      tenorMonths,
      simulation.monthlyInstallment,
      dueDateDay,
      Math.round(simulation.financedPrincipal / tenorMonths),
      Math.round(simulation.totalMarginAmount / tenorMonths)
    );

    const newContract: GoldInstallmentContract = {
      id: `contract-${Date.now()}`,
      contractNumber: contractNum,
      customerId: selectedCust.id,
      customerName: selectedCust.name,
      customerAge: selectedCust.age,
      customerPhone: selectedCust.phone,
      customerEmail: selectedCust.email,
      partnerId: selectedCust.partnerId,
      partnerName: selectedCust.partnerName,
      partnerCategory: selectedCust.partnerCategory,
      goldWeightGrams,
      goldPurity: '999.9 (24 Karat) SNI',
      goldBrand: 'Raja Emas Indonesia',
      goldBasePrice: simulation.goldBasePrice,
      tenorMonths,
      marginRateAnnualPercent,
      totalMarginAmount: simulation.totalMarginAmount,
      adminAndVaultFee: simulation.adminAndVaultFee,
      totalContractValue: simulation.totalContractValue,
      downPayment: simulation.downPayment,
      financedPrincipal: simulation.financedPrincipal,
      monthlyInstallment: simulation.monthlyInstallment,
      contractDate: today,
      dueDateDay,
      status: 'Aktif',
      installmentsPaid: 0,
      totalInstallments: tenorMonths,
      totalPaidAmount: simulation.downPayment,
      remainingFinancedAmount: simulation.financedPrincipal,
      nextDueDate: schedule[0]?.dueDate || today,
      goldVaultStatus: 'Tersimpan di Brankas (Jaminan Fidusia)',
      schedule,
      akadNotes: `Akad Murabahah Emas ${goldWeightGrams} Gram SNI tenor ${tenorMonths} bulan. DP ${formatRupiah(simulation.downPayment)} telah diterima di awal.`,
      verifiedBy: 'Tim Verifikasi Mitra',
    };

    onAddContract(newContract);

    try {
      await sendAkadWhatsAppNotification(newContract);
      setActionSuccessNotice(
        `Akad ${contractNum} berhasil diterbitkan. Notifikasi WhatsApp dikirim ke ${selectedCust.name} (${selectedCust.phone}).`
      );
    } catch (err) {
      setActionSuccessNotice(`Akad ${contractNum} berhasil diterbitkan.`);
    }

    setIsSubmitting(false);
    setShowSimulateModal(false);

    setTimeout(() => {
      onViewContractModal(newContract);
    }, 400);
  };

  const filteredContracts = contracts.filter((ct) => {
    const term = searchTerm.toLowerCase();
    const matchSearch =
      ct.contractNumber.toLowerCase().includes(term) ||
      ct.customerName.toLowerCase().includes(term) ||
      ct.partnerName.toLowerCase().includes(term);
    const matchStatus = filterStatus === 'ALL' || ct.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {actionSuccessNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <BellRing className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessNotice}</span>
          </div>
          <button
            onClick={() => setActionSuccessNotice(null)}
            className="p-1 rounded-full text-emerald-700 hover:text-emerald-950 dark:hover:text-white font-bold cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header & Actions (Audime Style) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Akad Cicilan Emas (Murabahah)
          </h2>
          <p className="text-xs text-slate-400 dark:text-gray-500 mt-0.5">
            Pengelolaan pembiayaan emas fisik, catatan DP, tenor cicilan, margin syariah, dan otomatisasi akad
          </p>
        </div>

        <button
          onClick={() => setShowSimulateModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs rounded-full flex items-center gap-1.5 shadow-md shadow-indigo-500/25 transition-all cursor-pointer active:scale-95 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Buat Akad Baru</span>
        </button>
      </div>

      {/* Highlight Box: Cicilan 1 Tahun 10 Gram (Audime Highlight Card) */}
      <div className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-indigo-200 dark:border-indigo-900/60 shadow-[0_4px_25px_-5px_rgba(99,102,241,0.06)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Coins className="w-5 h-5" />
          </div>
          <div className="text-xs">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 dark:text-white">Akad Murabahah 10 Gram: Ibu Aini (42 th)</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300">
                1 Tahun
              </span>
            </div>
            <p className="text-slate-500 dark:text-gray-400 mt-0.5">
              Emas LM SNI 999.9 • DP Rp 5.000.000 • Margin syariah 6% • Angsuran Rp 1.859.375/bln (Jatuh tempo tgl 10)
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            const ainiContract = contracts.find((c) => c.customerName.includes('Aini'));
            if (ainiContract) onViewContractModal(ainiContract);
          }}
          className="px-4 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-slate-800 dark:text-gray-200 font-bold text-xs flex items-center gap-1.5 border border-slate-200 dark:border-gray-700 shrink-0 cursor-pointer transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Lihat Dokumen Akad</span>
        </button>
      </div>

      {/* Main Table Card (Audime Style) */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-slate-100 dark:border-gray-800 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.04)] overflow-hidden">
        {/* Table Top Controls */}
        <div className="p-5 border-b border-slate-100 dark:border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nomor akad, nasabah, mitra..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-white dark:bg-gray-900 border border-slate-200/80 dark:border-gray-800 rounded-full text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
            />
          </div>

          {/* Filter Pills (Audime Style) */}
          <div className="flex p-1 bg-slate-100 dark:bg-gray-800 rounded-full text-xs font-semibold text-slate-600 dark:text-gray-300">
            {(['ALL', 'Aktif', 'Lunas', 'Menunggak'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterStatus(tab)}
                className={`px-3 py-1 rounded-full transition-all ${
                  filterStatus === tab
                    ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab === 'ALL' ? 'Semua Status' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-gray-300">
            <thead className="bg-slate-50/70 dark:bg-gray-800/50 text-[11px] uppercase font-bold text-slate-500 dark:text-gray-400 border-b border-slate-100 dark:border-gray-800">
              <tr>
                <th className="py-3.5 px-5">No. Akad & Tanggal</th>
                <th className="py-3.5 px-4">Nasabah & Kontak</th>
                <th className="py-3.5 px-4 text-center">Gramasi</th>
                <th className="py-3.5 px-4 text-center">Tenor</th>
                <th className="py-3.5 px-4 text-right">DP (Uang Muka)</th>
                <th className="py-3.5 px-4 text-right">Angsuran / Bln</th>
                <th className="py-3.5 px-4 text-center">Margin</th>
                <th className="py-3.5 px-4 text-center">Jatuh Tempo</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-gray-800/80">
              {filteredContracts.map((ct) => (
                <tr
                  key={ct.id}
                  className={`hover:bg-slate-50/60 dark:hover:bg-gray-800/40 transition-colors ${
                    ct.customerName.includes('Aini') ? 'bg-amber-50/30 dark:bg-amber-950/10' : ''
                  }`}
                >
                  <td className="py-3.5 px-5">
                    <div className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{ct.contractNumber}</div>
                    <div className="text-[10px] text-slate-400">{ct.contractDate}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 dark:text-white">{ct.customerName}</div>
                    <div className="text-[11px] text-slate-400 dark:text-gray-500">{ct.customerAge} Th · {ct.customerPhone}</div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="font-extrabold text-amber-600 dark:text-amber-400 text-xs">
                      {formatGrams(ct.goldWeightGrams)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-700 dark:text-slate-300">
                    {ct.tenorMonths} Bln
                    <span className="block text-[10px] text-slate-400 font-normal">({ct.tenorMonths / 12} Thn)</span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatRupiah(ct.downPayment)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-black text-slate-900 dark:text-white">
                    {formatRupiah(ct.monthlyInstallment)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      {ct.marginRateAnnualPercent}% p.a
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      Tgl {ct.dueDateDay}
                    </span>
                    <span className="block text-[10px] text-slate-400">Next: {ct.nextDueDate}</span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      {ct.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-center">
                    <button
                      onClick={() => onViewContractModal(ct)}
                      className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-200 font-bold text-[11px] flex items-center gap-1 mx-auto transition-colors cursor-pointer border border-slate-200 dark:border-gray-700"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Akad</span>
                    </button>
                  </td>
                </tr>
              ))}

              {filteredContracts.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 text-xs">
                    Tidak ada data akad cicilan yang sesuai.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Simulasi & Pembuatan Akad Baru (Audime Rounded-3xl Card) */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-3xl rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-900 dark:text-white space-y-5 animate-in zoom-in-95 duration-200 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base">
                  Simulasi & Penerbitan Akad Cicilan Emas
                </h3>
              </div>
              <button
                onClick={() => setShowSimulateModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAkad} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-600 dark:text-gray-400 block mb-1">Pilih Nasabah CRM:</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none font-bold focus:ring-2 focus:ring-indigo-500/20"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.age} th) — {c.phone} — {c.occupation}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-600 dark:text-gray-400 block mb-1">
                    Gramasi Emas (SNI 999.9):
                  </label>
                  <select
                    value={goldWeightGrams}
                    onChange={(e) => setGoldWeightGrams(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none font-bold text-amber-600 focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value={1}>1 Gram Logam Mulia</option>
                    <option value={2}>2 Gram Logam Mulia</option>
                    <option value={5}>5 Gram Logam Mulia</option>
                    <option value={10}>10 Gram Logam Mulia (Standar)</option>
                    <option value={20}>20 Gram Logam Mulia</option>
                    <option value={25}>25 Gram Logam Mulia</option>
                    <option value={50}>50 Gram Logam Mulia</option>
                    <option value={100}>100 Gram Logam Mulia</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-600 dark:text-gray-400 block mb-1">
                    Tenor Pembiayaan:
                  </label>
                  <select
                    value={tenorMonths}
                    onChange={(e) => setTenorMonths(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none font-bold focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value={3}>3 Bulan (Triwulan)</option>
                    <option value={6}>6 Bulan (Semester)</option>
                    <option value={12}>12 Bulan (1 Tahun - Kasus Standar)</option>
                    <option value={24}>24 Bulan (2 Tahun)</option>
                    <option value={36}>36 Bulan (3 Tahun)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-600 dark:text-gray-400 block mb-1">
                    Tanggal Jatuh Tempo Bulanan:
                  </label>
                  <select
                    value={dueDateDay}
                    onChange={(e) => setDueDateDay(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none font-bold focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value={5}>Tanggal 5 tiap bulan</option>
                    <option value={10}>Tanggal 10 tiap bulan (Kasus Aini)</option>
                    <option value={15}>Tanggal 15 tiap bulan</option>
                    <option value={20}>Tanggal 20 tiap bulan</option>
                    <option value={25}>Tanggal 25 tiap bulan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600 dark:text-gray-400 block mb-1">
                    Uang Muka (DP) yang Dibayar:
                  </label>
                  <input
                    type="number"
                    value={customDownPayment}
                    onChange={(e) => setCustomDownPayment(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Contoh: 5000000"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 outline-none font-bold text-emerald-600 focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    DP Minimal 15-20% ({formatRupiah(simulation.goldBasePrice * 0.2)})
                  </span>
                </div>

                <div>
                  <label className="font-semibold text-slate-600 dark:text-gray-400 block mb-1">
                    Margin Keuntungan / Bunga Syariah (% p.a):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={marginRateAnnualPercent}
                    onChange={(e) => setMarginRateAnnualPercent(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none font-bold focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Margin proporsional syariah murabahah per tahun.
                  </span>
                </div>
              </div>

              {/* Rangkuman (Audime Soft Card) */}
              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-gray-800/40 border border-slate-100 dark:border-gray-800 space-y-2">
                <div className="font-bold text-slate-900 dark:text-white text-xs flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-gray-700">
                  <span>RANGKUMAN CATATAN AKAD CICILAN:</span>
                  <span className="text-indigo-600 dark:text-indigo-400">{formatGrams(goldWeightGrams)} Emas SNI 999.9</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                  <div className="p-2.5 bg-white dark:bg-gray-900 rounded-xl border border-slate-100 dark:border-gray-800 shadow-sm">
                    <span className="text-[10px] text-slate-400 block">Harga Dasar Emas:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatRupiah(simulation.goldBasePrice)}</span>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-gray-900 rounded-xl border border-slate-100 dark:border-gray-800 shadow-sm">
                    <span className="text-[10px] text-slate-400 block">Margin Syariah:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">+{formatRupiah(simulation.totalMarginAmount)}</span>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-gray-900 rounded-xl border border-slate-100 dark:border-gray-800 shadow-sm">
                    <span className="text-[10px] text-slate-400 block">DP Diterima:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">-{formatRupiah(simulation.downPayment)}</span>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-gray-900 rounded-xl border border-slate-100 dark:border-gray-800 shadow-sm">
                    <span className="text-[10px] text-slate-400 block">Cicilan / Bulan:</span>
                    <span className="font-black text-indigo-600 dark:text-indigo-400 text-xs">
                      {formatRupiah(simulation.monthlyInstallment)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowSimulateModal(false)}
                  className="px-4 py-2 rounded-full text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 font-semibold cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold shadow-md shadow-indigo-500/20 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <Coins className="w-4 h-4" />
                  <span>{isSubmitting ? 'Menerbitkan Akad...' : 'Terbitkan Akad & Kirim Notif'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
