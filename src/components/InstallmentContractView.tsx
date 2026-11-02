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
      verifiedBy: 'Dewan Pengawas Syariah & Khazanah Konsorsium',
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
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <BellRing className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{actionSuccessNotice}</span>
          </div>
          <button
            onClick={() => setActionSuccessNotice(null)}
            className="p-1 rounded text-emerald-700 hover:text-emerald-950 font-bold cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Top Card */}
      <div className={`p-6 rounded-3xl border shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
        darkMode ? 'bg-[#1a1525] border-purple-800/40 text-gray-100' : 'bg-white border-purple-100 text-gray-900'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-md shadow-amber-500/20">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight">Akad Fasilitas Cicilan Emas (Murabahah)</h2>
            <p className="text-xs text-gray-500">
              Pengelolaan pembiayaan emas fisik, catatan DP, tenor cicilan 1 tahun, bunga/margin, dan otomatisasi akad.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowSimulateModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Buat Akad Cicilan Baru</span>
        </button>
      </div>

      {/* Highlight Box: Cicilan 1 Tahun 10 Gram */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 text-white border border-purple-700/50 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs shrink-0">
            AKAD RESMI
          </div>
          <div className="text-xs">
            <span className="font-bold text-amber-300">Akad Murabahah 10 Gram: </span>
            <span>Ibu Aini (42 th) — Pembiayaan 1 Tahun Logam Mulia SNI 999.9. Terverifikasi DP Rp 5.000.000, margin syariah 6%, angsuran Rp 1.859.375/bln, jatuh tempo tgl 10.</span>
          </div>
        </div>

        <button
          onClick={() => {
            const ainiContract = contracts.find((c) => c.customerName.includes('Aini'));
            if (ainiContract) onViewContractModal(ainiContract);
          }}
          className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 border border-white/20 shrink-0 cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Buka Akad Ibu Aini</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className={`p-4 rounded-2xl border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 ${
        darkMode ? 'bg-[#1a1525] border-purple-800/40' : 'bg-white border-purple-100'
      }`}>
        <div className="flex items-center gap-2 w-full sm:w-80">
          <Search className="w-4 h-4 text-purple-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nomor akad, nama nasabah, mitra..."
            className="w-full text-xs bg-transparent outline-none placeholder:text-gray-400"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-gray-500 font-semibold">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`text-xs py-1.5 px-3 rounded-xl border outline-none ${
              darkMode ? 'bg-[#151022] border-purple-800 text-gray-100' : 'bg-white border-purple-200 text-gray-800'
            }`}
          >
            <option value="ALL">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Lunas">Lunas</option>
            <option value="Menunggak">Menunggak</option>
          </select>
        </div>
      </div>

      {/* Table of Contracts */}
      <div className={`rounded-3xl border shadow-sm overflow-hidden ${
        darkMode ? 'bg-[#1a1525] border-purple-800/40 text-gray-100' : 'bg-white border-purple-100 text-gray-900'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`border-b text-[11px] font-bold ${
                darkMode ? 'bg-purple-950/40 border-purple-800/40 text-purple-200' : 'bg-purple-50/70 border-purple-100 text-purple-950'
              }`}>
                <th className="py-3 px-4">No. Akad & Tanggal</th>
                <th className="py-3 px-4">Nasabah & Usia</th>
                <th className="py-3 px-4 text-center">Gramasi</th>
                <th className="py-3 px-4 text-center">Tenor</th>
                <th className="py-3 px-4 text-right">DP (Uang Muka)</th>
                <th className="py-3 px-4 text-right">Angsuran / Bln</th>
                <th className="py-3 px-4 text-center">Bunga / Margin</th>
                <th className="py-3 px-4 text-center">Jatuh Tempo</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-purple-900/30">
              {filteredContracts.map((ct) => (
                <tr
                  key={ct.id}
                  className={`hover:bg-purple-50/30 dark:hover:bg-purple-950/20 transition-colors ${
                    ct.customerName.includes('Aini') ? 'bg-amber-50/30 dark:bg-amber-950/10' : ''
                  }`}
                >
                  <td className="py-3 px-4">
                    <div className="font-mono font-bold text-gray-900 dark:text-gray-100">{ct.contractNumber}</div>
                    <div className="text-[10px] text-gray-500">{ct.contractDate}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-extrabold text-gray-900 dark:text-gray-100">{ct.customerName}</div>
                    <div className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">{ct.customerAge} Th · {ct.customerPhone}</div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-black text-amber-600 dark:text-amber-400 text-xs">
                      {formatGrams(ct.goldWeightGrams)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-gray-700 dark:text-gray-300">
                    {ct.tenorMonths} Bln
                    <span className="block text-[9px] text-gray-400 font-normal">({ct.tenorMonths / 12} Thn)</span>
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatRupiah(ct.downPayment)}
                  </td>
                  <td className="py-3 px-4 text-right font-black text-purple-950 dark:text-purple-300">
                    {formatRupiah(ct.monthlyInstallment)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300">
                      {ct.marginRateAnnualPercent}% p.a
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-bold text-gray-800 dark:text-gray-200 text-[11px]">
                      Tgl {ct.dueDateDay}
                    </span>
                    <span className="block text-[9px] text-gray-400">Next: {ct.nextDueDate}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {ct.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => onViewContractModal(ct)}
                      className="px-3 py-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/60 dark:hover:bg-purple-800 text-purple-900 dark:text-purple-200 font-bold text-[11px] flex items-center gap-1 mx-auto transition-all cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Akad</span>
                    </button>
                  </td>
                </tr>
              ))}

              {filteredContracts.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-gray-400 text-xs">
                    Tidak ada data akad cicilan yang sesuai.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Simulasi & Pembuatan Akad Baru */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className={`w-full max-w-3xl rounded-3xl p-6 shadow-2xl border space-y-5 animate-in zoom-in-95 duration-200 my-auto ${
            darkMode ? 'bg-[#1a1525] border-purple-800 text-gray-100' : 'bg-white border-purple-100 text-gray-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-purple-100 dark:border-purple-800/40">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-500" />
                <h3 className="font-black text-base">
                  Simulasi & Penerbitan Akad Cicilan Emas
                </h3>
              </div>
              <button
                onClick={() => setShowSimulateModal(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAkad} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Pilih Nasabah CRM:</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-purple-950/40 outline-none font-bold"
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
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Gramasi Emas (SNI 999.9):
                  </label>
                  <select
                    value={goldWeightGrams}
                    onChange={(e) => setGoldWeightGrams(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-purple-950/40 outline-none font-extrabold text-amber-600"
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
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Tenor Pembiayaan:
                  </label>
                  <select
                    value={tenorMonths}
                    onChange={(e) => setTenorMonths(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-purple-950/40 outline-none font-bold text-purple-900 dark:text-purple-300"
                  >
                    <option value={3}>3 Bulan (Triwulan)</option>
                    <option value={6}>6 Bulan (Semester)</option>
                    <option value={12}>12 Bulan (1 Tahun - Kasus Standar)</option>
                    <option value={24}>24 Bulan (2 Tahun)</option>
                    <option value={36}>36 Bulan (3 Tahun)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Tanggal Jatuh Tempo Bulanan:
                  </label>
                  <select
                    value={dueDateDay}
                    onChange={(e) => setDueDateDay(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-purple-950/40 outline-none font-bold"
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
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Uang Muka (DP) yang Dibayar:
                  </label>
                  <input
                    type="number"
                    value={customDownPayment}
                    onChange={(e) => setCustomDownPayment(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Contoh: 5000000"
                    className="w-full p-2.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-purple-950/40 outline-none font-bold text-emerald-600"
                  />
                  <span className="text-[10px] text-gray-500 mt-0.5 block">
                    DP Minimal 15-20% ({formatRupiah(simulation.goldBasePrice * 0.2)})
                  </span>
                </div>

                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Margin Keuntungan / Bunga Syariah (% p.a):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={marginRateAnnualPercent}
                    onChange={(e) => setMarginRateAnnualPercent(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-purple-950/40 outline-none font-bold"
                  />
                  <span className="text-[10px] text-gray-500 mt-0.5 block">
                    Margin proporsional syariah murabahah per tahun.
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 space-y-2">
                <div className="font-black text-amber-950 dark:text-amber-300 text-xs flex items-center justify-between pb-2 border-b border-amber-200 dark:border-amber-800/40">
                  <span>RANGKUMAN CATATAN AKAD CICILAN:</span>
                  <span className="text-amber-700 dark:text-amber-400">{formatGrams(goldWeightGrams)} Emas SNI 999.9</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                  <div className="p-2.5 bg-white dark:bg-[#1a1525] rounded-xl border border-amber-200/60 dark:border-amber-900/40 shadow-sm">
                    <span className="text-[10px] text-gray-500 block">Harga Dasar Emas:</span>
                    <span className="font-bold text-gray-900 dark:text-gray-100">{formatRupiah(simulation.goldBasePrice)}</span>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-[#1a1525] rounded-xl border border-amber-200/60 dark:border-amber-900/40 shadow-sm">
                    <span className="text-[10px] text-gray-500 block">Margin Syariah (Bunga):</span>
                    <span className="font-bold text-emerald-600">+{formatRupiah(simulation.totalMarginAmount)}</span>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-[#1a1525] rounded-xl border border-amber-200/60 dark:border-amber-900/40 shadow-sm">
                    <span className="text-[10px] text-gray-500 block">DP Diterima:</span>
                    <span className="font-bold text-emerald-600">-{formatRupiah(simulation.downPayment)}</span>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-[#1a1525] rounded-xl border border-amber-200/60 dark:border-amber-900/40 shadow-sm">
                    <span className="text-[10px] text-gray-500 block">Cicilan / Bulan:</span>
                    <span className="font-black text-purple-900 dark:text-purple-300 text-xs">
                      {formatRupiah(simulation.monthlyInstallment)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-purple-100 dark:border-purple-800/40">
                <button
                  type="button"
                  onClick={() => setShowSimulateModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-purple-900/40 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
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
