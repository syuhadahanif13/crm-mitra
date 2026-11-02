import React, { useState } from 'react';
import {
  X,
  Plus,
  Coins,
  Calculator,
  Calendar,
  Send,
  Building2,
  FileCheck2,
  CheckCircle2
} from 'lucide-react';
import { CustomerProfile, GoldInstallmentContract, UserSession } from '../types';
import { formatRupiah, formatGrams } from '../utils/formatters';
import {
  calculateInstallmentSimulation,
  generateContractSchedule,
  sendAkadWhatsAppNotification,
} from '../services/crmService';

interface AddManualTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserSession;
  customers: CustomerProfile[];
  onAddContract: (contract: GoldInstallmentContract) => void;
  onAddCustomer: (customer: CustomerProfile) => void;
}

export const AddManualTransactionModal: React.FC<AddManualTransactionModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  customers,
  onAddContract,
  onAddCustomer,
}) => {
  const [transactionType, setTransactionType] = useState<'cicilan' | 'tunai'>('cicilan');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('new');

  // Customer Form State
  const [custName, setCustName] = useState('');
  const [custAge, setCustAge] = useState<number>(42);
  const [custPhone, setCustPhone] = useState('081298765432');
  const [custEmail, setCustEmail] = useState('');
  const [custAddress, setCustAddress] = useState('Jakarta');

  // Installment Form State
  const [goldWeight, setGoldWeight] = useState<number>(10); // Default to Case 2: 10 gram
  const [tenorMonths, setTenorMonths] = useState<number>(12); // Default to Case 2: 1 tahun
  const [goldPricePerGram, setGoldPricePerGram] = useState<number>(2562500);
  const [marginRatePercent, setMarginRatePercent] = useState<number>(6.0);
  const [dpPercent, setDpPercent] = useState<number>(20);
  const [customDp, setCustomDp] = useState<number>(5000000);
  const [dueDateDay, setDueDateDay] = useState<number>(10); // Default 10th of each month (Case 4)
  const [sendWaNotif, setSendWaNotif] = useState<boolean>(true); // Case 3: sehabis akad ada notif transaksi

  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  // Real-time calculation
  const totalBasePrice = goldWeight * goldPricePerGram;
  const simulation = calculateInstallmentSimulation({
    goldWeightGrams: goldWeight,
    goldBasePrice: totalBasePrice,
    tenorMonths: tenorMonths,
    downPaymentPercent: dpPercent,
    customDownPayment: customDp > 0 ? customDp : undefined,
    marginRateAnnualPercent: marginRatePercent,
    adminAndVaultFee: 150000,
  });

  const handleCustomerSelect = (id: string) => {
    setSelectedCustomerId(id);
    if (id !== 'new') {
      const match = customers.find((c) => c.id === id);
      if (match) {
        setCustName(match.name);
        setCustAge(match.age);
        setCustPhone(match.phone);
        setCustEmail(match.email);
        setCustAddress(match.address);
      }
    } else {
      setCustName('');
      setCustAge(42);
      setCustPhone('081298765432');
      setCustEmail('');
      setCustAddress('Jakarta');
    }
  };

  const handleSaveTransaction = async () => {
    const finalCustomerName = custName.trim() || 'Ibu Aini';
    const contractId = `contract-man-${Date.now()}`;
    const contractNumber = `AKAD-REI/${new Date().getFullYear()}/${String(
      new Date().getMonth() + 1
    ).padStart(2, '0')}/${Math.floor(1000 + Math.random() * 9000)}`;

    let finalCustomerId = selectedCustomerId;

    // 1. If new customer, create profile
    if (selectedCustomerId === 'new') {
      finalCustomerId = `cust-man-${Date.now()}`;
      const newCust: CustomerProfile = {
        id: finalCustomerId,
        partnerId: currentUser.partnerId || 'partner-bprs-himbarsi-01',
        partnerName: currentUser.partnerName,
        partnerCategory: currentUser.partnerCategory,
        name: finalCustomerName,
        age: Number(custAge) || 42,
        phone: custPhone || '081298765432',
        email: custEmail || `${finalCustomerName.toLowerCase().replace(/[^a-z]/g, '')}@gmail.com`,
        nik: '3171012345670001',
        address: custAddress,
        occupation: 'Wiraswasta / Profesional',
        status: 'Aktif',
        creditGrade: 'A (Sangat Lancar)',
        joinedDate: new Date().toISOString().split('T')[0],
        totalGramsFinanced: goldWeight,
        activeContractsCount: 1,
        completedContractsCount: 0,
        notes: 'Didaftarkan melalui Transaksi Mandiri CRM Konsorsium.',
      };
      onAddCustomer(newCust);
    }

    // 2. Generate Schedule
    const todayStr = new Date().toISOString().split('T')[0];
    const schedule = generateContractSchedule(
      todayStr,
      tenorMonths,
      simulation.monthlyInstallment,
      dueDateDay,
      Math.round(simulation.financedPrincipal / tenorMonths),
      Math.round(simulation.totalMarginAmount / tenorMonths)
    );

    // 3. Create Contract
    const newContract: GoldInstallmentContract = {
      id: contractId,
      contractNumber: contractNumber,
      customerId: finalCustomerId,
      customerName: finalCustomerName,
      customerAge: Number(custAge) || 42,
      customerPhone: custPhone || '081298765432',
      customerEmail: custEmail || `${finalCustomerName.toLowerCase().replace(/[^a-z]/g, '')}@gmail.com`,
      partnerId: currentUser.partnerId || 'partner-bprs-himbarsi-01',
      partnerName: currentUser.partnerName,
      partnerCategory: currentUser.partnerCategory,
      goldWeightGrams: goldWeight,
      goldPurity: '999.9 (24 Karat) SNI',
      goldBrand: 'Raja Emas Indonesia',
      goldBasePrice: simulation.goldBasePrice,
      tenorMonths: tenorMonths,
      marginRateAnnualPercent: marginRatePercent,
      totalMarginAmount: simulation.totalMarginAmount,
      adminAndVaultFee: simulation.adminAndVaultFee,
      totalContractValue: simulation.totalContractValue,
      downPayment: simulation.downPayment,
      financedPrincipal: simulation.financedPrincipal,
      monthlyInstallment: simulation.monthlyInstallment,
      contractDate: todayStr,
      dueDateDay: dueDateDay,
      status: 'Aktif',
      installmentsPaid: 0,
      totalInstallments: tenorMonths,
      totalPaidAmount: simulation.downPayment,
      remainingFinancedAmount: simulation.financedPrincipal,
      nextDueDate: schedule[0]?.dueDate || '2026-10-10',
      goldVaultStatus: 'Tersimpan di Brankas (Jaminan Fidusia)',
      schedule: schedule,
      akadNotes: `Akad pembiayaan emas mandiri tenor ${tenorMonths} bulan dengan jaminan fidusia emas fisik di brankas.`,
      verifiedBy: `${currentUser.name} (${currentUser.partnerName})`,
    };

    onAddContract(newContract);

    // 4. Send WhatsApp Notification if toggled (Case 3)
    if (sendWaNotif) {
      try {
        await sendAkadWhatsAppNotification(newContract);
      } catch (err) {
        console.error('Failed to trigger WhatsApp akad notification:', err);
      }
    }

    setFeedback(`Transaksi Akad ${contractNumber} (${finalCustomerName} - ${goldWeight}g) berhasil dibuat & dicatat di CRM!`);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md">
              <Plus className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Tambah Transaksi Mandiri di CRM</h3>
              <p className="text-xs text-indigo-200">
                Pencatatan langsung akad pembiayaan emas batangan SNI tanpa bergantung dasbor mitra
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

        {/* Feedback message */}
        {feedback && (
          <div className="p-3 bg-emerald-50 text-emerald-800 border-b border-emerald-200 text-xs font-bold flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-emerald-600" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Transaction Type Pill */}
          <div className="flex p-1 bg-slate-100 dark:bg-gray-800 rounded-2xl text-xs font-bold text-slate-600 dark:text-gray-300">
            <button
              onClick={() => setTransactionType('cicilan')}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                transactionType === 'cicilan'
                  ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'hover:text-slate-900'
              }`}
            >
              <Coins className="w-4 h-4" />
              <span>Akad Cicilan Emas (10g 1 Tahun, d.l.l)</span>
            </button>
            <button
              onClick={() => setTransactionType('tunai')}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                transactionType === 'tunai'
                  ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Pembelian Tunai / Titip Brankas</span>
            </button>
          </div>

          {/* Section 1: Customer Profile */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-gray-800/40 border border-slate-200 dark:border-gray-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300">
                1. Data Nasabah
              </h4>
              <select
                value={selectedCustomerId}
                onChange={(e) => handleCustomerSelect(e.target.value)}
                className="text-xs font-semibold px-2.5 py-1 bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-lg text-slate-800 dark:text-gray-200"
              >
                <option value="new">+ Input Nasabah Baru</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    Pilih: {c.name} ({c.phone})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-500 font-medium mb-1">Nama Nasabah (Misal: Ibu Aini):</label>
                <input
                  type="text"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  placeholder="Ibu Aini"
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Umur (Tahun):</label>
                <input
                  type="number"
                  value={custAge}
                  onChange={(e) => setCustAge(parseInt(e.target.value) || 0)}
                  placeholder="42"
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">No. WhatsApp (Untuk Pengingat Fonnte):</label>
                <input
                  type="text"
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  placeholder="081298765432"
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Email:</label>
                <input
                  type="email"
                  value={custEmail}
                  onChange={(e) => setCustEmail(e.target.value)}
                  placeholder="aini@gmail.com"
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Gold Spec & Installment Parameters */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-gray-800/40 border border-slate-200 dark:border-gray-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300">
              2. Parameter Pembiayaan Emas
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-slate-500 font-medium mb-1">Gramatur:</label>
                <select
                  value={goldWeight}
                  onChange={(e) => setGoldWeight(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl font-bold text-indigo-600 dark:text-indigo-400"
                >
                  <option value={1}>1 Gram</option>
                  <option value={2}>2 Gram</option>
                  <option value={5}>5 Gram</option>
                  <option value={10}>10 Gram</option>
                  <option value={25}>25 Gram</option>
                  <option value={50}>50 Gram</option>
                  <option value={100}>100 Gram</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Tenor (Bulan):</label>
                <select
                  value={tenorMonths}
                  onChange={(e) => setTenorMonths(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl font-bold text-indigo-600 dark:text-indigo-400"
                >
                  <option value={3}>3 Bulan</option>
                  <option value={6}>6 Bulan</option>
                  <option value={12}>12 Bulan (1 Tahun)</option>
                  <option value={24}>24 Bulan (2 Tahun)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Margin Bunga p.a:</label>
                <input
                  type="number"
                  step="0.1"
                  value={marginRatePercent}
                  onChange={(e) => setMarginRatePercent(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl font-medium text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Tgl Jatuh Tempo:</label>
                <select
                  value={dueDateDay}
                  onChange={(e) => setDueDateDay(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl font-bold text-amber-600"
                >
                  <option value={5}>Tanggal 5</option>
                  <option value={10}>Tanggal 10</option>
                  <option value={15}>Tanggal 15</option>
                  <option value={20}>Tanggal 20</option>
                  <option value={25}>Tanggal 25</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div>
                <label className="block text-slate-500 font-medium mb-1">Uang Muka / DP (Rp):</label>
                <input
                  type="number"
                  value={customDp}
                  onChange={(e) => setCustomDp(parseInt(e.target.value) || 0)}
                  placeholder="5000000"
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Harga Dasar Emas / Gram:</label>
                <input
                  type="number"
                  value={goldPricePerGram}
                  onChange={(e) => setGoldPricePerGram(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl font-medium text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Live Calculation Summary Box (Matching Case 2) */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-200 dark:border-indigo-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-indigo-900 dark:text-indigo-300">
              <span className="flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-indigo-600" />
                Hasil Simulasi Akad Murabahah Emas
              </span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-200/60 dark:bg-indigo-900 text-[10px]">
                {formatGrams(goldWeight)} • {tenorMonths} Bulan
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white/80 dark:bg-gray-900/80 border border-indigo-100 dark:border-gray-800">
                <div className="text-[10px] text-slate-500">Harga Emas Fisik</div>
                <div className="font-bold text-slate-900 dark:text-white">
                  {formatRupiah(simulation.goldBasePrice)}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/80 dark:bg-gray-900/80 border border-indigo-100 dark:border-gray-800">
                <div className="text-[10px] text-slate-500">Margin ({marginRatePercent}%)</div>
                <div className="font-bold text-amber-600">
                  {formatRupiah(simulation.totalMarginAmount)}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/80 dark:bg-gray-900/80 border border-indigo-100 dark:border-gray-800">
                <div className="text-[10px] text-slate-500">Uang Muka (DP)</div>
                <div className="font-bold text-slate-900 dark:text-white">
                  {formatRupiah(simulation.downPayment)}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/80 dark:bg-gray-900/80 border border-indigo-100 dark:border-gray-800">
                <div className="text-[10px] text-indigo-600 font-bold">Angsuran / Bulan</div>
                <div className="font-black text-indigo-600 dark:text-indigo-400 text-sm">
                  {formatRupiah(simulation.monthlyInstallment)}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: WhatsApp Notification Toggle (Case 3) */}
          <label className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 cursor-pointer">
            <input
              type="checkbox"
              checked={sendWaNotif}
              onChange={(e) => setSendWaNotif(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
            <div className="text-xs">
              <span className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-emerald-600" />
                Kirim Notifikasi Rincian Akad ke WhatsApp Nasabah
              </span>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                Mengirim detail akad langsung ke WhatsApp nasabah & admin via Fonnte Gateway.
              </p>
            </div>
          </label>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-gray-800/60 border-t border-slate-200 dark:border-gray-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full text-xs font-bold text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-700 transition-colors"
          >
            Batal
          </button>

          <button
            onClick={handleSaveTransaction}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full text-xs font-bold shadow-md shadow-indigo-500/25 flex items-center gap-1.5 transition-all active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Simpan Akad Pembiayaan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
