import React, { useState } from 'react';
import {
  X,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  Coins,
  Building2,
  Calendar,
  ArrowRight,
  RefreshCw,
  UploadCloud
} from 'lucide-react';
import { CustomerProfile, GoldInstallmentContract, MitraDashboardTransaction } from '../types';
import { formatRupiah, formatGrams } from '../utils/formatters';
import {
  INITIAL_MITRA_TRANSACTIONS,
  calculateInstallmentSimulation,
  generateContractSchedule,
} from '../services/crmService';

interface ImportMitraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportContract: (contract: GoldInstallmentContract) => void;
  onImportCustomer: (customer: CustomerProfile) => void;
}

export const ImportMitraModal: React.FC<ImportMitraModalProps> = ({
  isOpen,
  onClose,
  onImportContract,
  onImportCustomer,
}) => {
  const [activeTab, setActiveTab] = useState<'preset' | 'localStorage' | 'json'>('preset');
  const [localTrxList, setLocalTrxList] = useState<MitraDashboardTransaction[]>([]);
  const [jsonInput, setJsonInput] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [importedIds, setImportedIds] = useState<string[]>([]);

  if (!isOpen) return null;

  // Scan localStorage for partner dashboard transactions
  const handleScanLocalStorage = () => {
    try {
      const keys = ['transaksi_mitra', 'mitra_transactions', 'transactions', 'orders'];
      let found: any[] = [];
      for (const k of keys) {
        const raw = localStorage.getItem(k);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            found = parsed;
            break;
          }
        }
      }

      if (found.length > 0) {
        // Map to MitraDashboardTransaction
        const mapped: MitraDashboardTransaction[] = found.map((t, idx) => ({
          id: t.id || `trx-local-${idx}`,
          invoiceNumber: t.invoiceNumber || `INV-LOCAL/${idx + 1}`,
          date: t.date || new Date().toISOString().split('T')[0],
          partnerId: t.partnerId || 'partner-bprs-himbarsi-01',
          partnerName: t.partnerName || 'BPRS Harta Insan Karimah (HIK)',
          partnerCategory: t.partnerCategory || 'BPRS',
          customerName: t.customerName || t.recipientName || 'Nasabah Mitra',
          customerPhone: t.customerPhone || t.phone || '081298765432',
          customerAddress: t.customerAddress || t.shippingAddress || 'Alamat Mitra',
          goldWeightGrams: t.totalWeightGrams || (t.items?.[0]?.weight) || 10,
          totalPrice: t.totalAmount || t.goldSubtotal || 25000000,
          paymentMethod: 'Transfer / Akad Mitra',
          status: 'Completed',
          source: 'Dasbor Mitra Raja Emas',
        }));
        setLocalTrxList(mapped);
        setFeedback(`Ditemukan ${mapped.length} transaksi dari penyimpanan Dasbor Mitra!`);
      } else {
        setLocalTrxList(INITIAL_MITRA_TRANSACTIONS);
        setFeedback('Tidak ada transaksi lokal baru di browser ini. Menampilkan data sinkronisasi Dasbor Mitra.');
      }
    } catch (e: any) {
      setLocalTrxList(INITIAL_MITRA_TRANSACTIONS);
      setFeedback('Menggunakan transaksi konsorsium mitra terintegrasi.');
    }
  };

  // Convert a transaction to an installment contract
  const handleConvertToContract = (trx: MitraDashboardTransaction) => {
    const tenorMonths = trx.goldWeightGrams >= 10 ? 12 : 6;
    const sim = calculateInstallmentSimulation({
      goldWeightGrams: trx.goldWeightGrams,
      goldBasePrice: trx.totalPrice,
      tenorMonths: tenorMonths,
      downPaymentPercent: 20,
      marginRateAnnualPercent: 6,
      adminAndVaultFee: 150000,
    });

    const newCustomerId = `cust-import-${Date.now()}`;
    const newContractId = `akad-${Date.now()}`;

    // 1. Create Customer
    const newCustomer: CustomerProfile = {
      id: newCustomerId,
      partnerId: trx.partnerId,
      partnerName: trx.partnerName,
      partnerCategory: trx.partnerCategory,
      name: trx.customerName,
      age: 42,
      phone: trx.customerPhone || '081298765432',
      email: `${trx.customerName.toLowerCase().replace(/[^a-z]/g, '')}@gmail.com`,
      nik: '3171012345670001',
      address: trx.customerAddress || 'Alamat Nasabah Mitra',
      occupation: 'Wiraswasta / Profesional',
      status: 'Aktif',
      creditGrade: 'A (Sangat Lancar)',
      joinedDate: trx.date,
      totalGramsFinanced: trx.goldWeightGrams,
      activeContractsCount: 1,
      completedContractsCount: 0,
      notes: `Diimport dari transaksi Dasbor Mitra No. ${trx.invoiceNumber}`,
    };

    // 2. Generate Schedule
    const schedule = generateContractSchedule(
      trx.date,
      tenorMonths,
      sim.monthlyInstallment,
      10, // Default 10th of each month (Case 4)
      Math.round(sim.financedPrincipal / tenorMonths),
      Math.round(sim.totalMarginAmount / tenorMonths)
    );

    // 3. Create Contract
    const newContract: GoldInstallmentContract = {
      id: newContractId,
      contractNumber: `AKAD-REI/${trx.invoiceNumber.replace(/[^0-9]/g, '').slice(-6) || '2026/01'}`,
      customerId: newCustomerId,
      customerName: trx.customerName,
      customerAge: 42,
      customerPhone: trx.customerPhone || '081298765432',
      customerEmail: newCustomer.email,
      partnerId: trx.partnerId,
      partnerName: trx.partnerName,
      partnerCategory: trx.partnerCategory,
      goldWeightGrams: trx.goldWeightGrams,
      goldPurity: '999.9 (24 Karat) SNI',
      goldBrand: 'Raja Emas Indonesia',
      goldBasePrice: sim.goldBasePrice,
      tenorMonths: tenorMonths,
      marginRateAnnualPercent: 6,
      totalMarginAmount: sim.totalMarginAmount,
      adminAndVaultFee: sim.adminAndVaultFee,
      totalContractValue: sim.totalContractValue,
      downPayment: sim.downPayment,
      financedPrincipal: sim.financedPrincipal,
      monthlyInstallment: sim.monthlyInstallment,
      contractDate: trx.date,
      dueDateDay: 10,
      status: 'Aktif',
      installmentsPaid: 0,
      totalInstallments: tenorMonths,
      totalPaidAmount: sim.downPayment,
      remainingFinancedAmount: sim.financedPrincipal,
      nextDueDate: schedule[0]?.dueDate || '2026-10-10',
      goldVaultStatus: 'Tersimpan di Brankas (Jaminan Fidusia)',
      schedule: schedule,
      akadNotes: `Hasil import otomatis dari transaksi mitra No: ${trx.invoiceNumber}`,
      verifiedBy: 'Tim Verifikasi Mitra',
    };

    onImportCustomer(newCustomer);
    onImportContract(newContract);
    setImportedIds((prev) => [...prev, trx.id]);
    setFeedback(`Berhasil! Transaksi ${trx.invoiceNumber} (${trx.customerName}) diimpor menjadi Akad Cicilan Emas & Profil Nasabah baru!`);
  };

  // Handle JSON manual import
  const handleImportJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      items.forEach((item) => {
        handleConvertToContract({
          id: item.id || `json-${Date.now()}`,
          invoiceNumber: item.invoiceNumber || `INV-JSON/${Date.now()}`,
          date: item.date || new Date().toISOString().split('T')[0],
          partnerId: item.partnerId || 'partner-bprs-himbarsi-01',
          partnerName: item.partnerName || 'BPRS Harta Insan Karimah',
          partnerCategory: item.partnerCategory || 'BPRS',
          customerName: item.customerName || 'Nasabah Mitra',
          customerPhone: item.customerPhone || '081298765432',
          customerAddress: item.customerAddress || 'Jakarta',
          goldWeightGrams: Number(item.goldWeightGrams || item.totalWeightGrams || 10),
          totalPrice: Number(item.totalPrice || item.totalAmount || 25000000),
          paymentMethod: 'Import JSON',
          status: 'Completed',
          source: 'Dasbor Mitra Raja Emas',
        });
      });
      setJsonInput('');
      setFeedback(`Berhasil mengimpor ${items.length} transaksi dari data JSON!`);
    } catch (e: any) {
      setFeedback(`Format JSON tidak valid: ${e.message}`);
    }
  };

  const listToRender = activeTab === 'localStorage' && localTrxList.length > 0 ? localTrxList : INITIAL_MITRA_TRANSACTIONS;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md">
              <Download className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Import Transaksi Mitra</h3>
              <p className="text-xs text-indigo-200">
                Tarik data transaksi dari Dasbor Mitra ke dalam sistem CRM
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

        {/* Tab selection */}
        <div className="flex border-b border-slate-200 dark:border-gray-800 px-4 sm:px-6 pt-3 bg-slate-50 dark:bg-gray-800/40 gap-3 text-xs font-bold overflow-x-auto whitespace-nowrap">
          <button
            onClick={() => setActiveTab('preset')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'preset'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Daftar Pesanan Mitra ({INITIAL_MITRA_TRANSACTIONS.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('localStorage');
              handleScanLocalStorage();
            }}
            className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'localStorage'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Scan LocalStorage Browser</span>
          </button>

          <button
            onClick={() => setActiveTab('json')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'json'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Paste / File JSON</span>
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 font-medium flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              <span>{feedback}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="text-[11px] underline">
              Tutup
            </button>
          </div>
        )}

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab !== 'json' ? (
            <div className="space-y-3">
              {listToRender.map((trx) => {
                const isImported = importedIds.includes(trx.id);
                return (
                  <div
                    key={trx.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isImported
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                        : 'bg-white dark:bg-gray-800/40 border-slate-200 dark:border-gray-800 hover:border-indigo-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          {trx.invoiceNumber}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {trx.date}
                        </span>
                        <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-gray-700 dark:text-gray-300">
                          {trx.source}
                        </span>
                      </div>

                      <div className="font-bold text-slate-900 dark:text-white text-sm mt-1">
                        {trx.customerName}{' '}
                        <span className="text-xs font-normal text-slate-500">
                          ({trx.customerPhone || '081298765432'})
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 dark:text-gray-300 mt-1 flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-1 font-semibold text-amber-600">
                          <Coins className="w-3.5 h-3.5" /> {formatGrams(trx.goldWeightGrams)} Logam Mulia
                        </span>
                        <span>•</span>
                        <span className="font-medium">{formatRupiah(trx.totalPrice)}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <Building2 className="w-3.5 h-3.5" /> {trx.partnerName}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {isImported ? (
                        <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Terimpor
                        </span>
                      ) : (
                        <button
                          onClick={() => handleConvertToContract(trx)}
                          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center gap-1.5 transition-all active:scale-95 whitespace-nowrap"
                        >
                          <span>Jadikan Akad Cicilan</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                  Tempelkan (Paste) JSON Transaksi Dasbor Mitra:
                </label>
                <textarea
                  rows={8}
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder={`[\n  {\n    "invoiceNumber": "INV-REI/2026/10/0099",\n    "customerName": "Ibu Rahmawati",\n    "customerPhone": "081298765432",\n    "goldWeightGrams": 10,\n    "totalPrice": 25625000\n  }\n]`}
                  className="w-full p-3 font-mono text-xs bg-slate-50 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                onClick={handleImportJson}
                disabled={!jsonInput.trim()}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Proses & Impor JSON ke CRM</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-gray-800/60 border-t border-slate-200 dark:border-gray-800 flex items-center justify-between">
          <div className="text-xs text-slate-500 dark:text-gray-400">
            Transaksi yang diimpor akan langsung menghasilkan jadwal cicilan & profil nasabah CRM resmi.
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-slate-800 dark:text-white rounded-full text-xs font-bold transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
