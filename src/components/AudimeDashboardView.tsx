import React, { useState } from 'react';
import {
  Clock,
  Calendar,
  Send,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Plus,
  Download,
  CheckCircle2,
  AlertTriangle,
  Building2,
  ExternalLink,
  ChevronRight as ChevronRightIcon,
  Bell
} from 'lucide-react';
import { CustomerProfile, GoldInstallmentContract, UserSession } from '../types';
import { formatRupiah, formatGrams } from '../utils/formatters';
import { sendDueDateReminderWhatsApp, getWhatsAppDirectUrl } from '../services/crmService';

interface AudimeDashboardViewProps {
  currentUser: UserSession;
  customers: CustomerProfile[];
  contracts: GoldInstallmentContract[];
  onOpenAddTransaction: () => void;
  onOpenImportMitra: () => void;
  onNavigateTab: (tab: 'dashboard' | 'due' | 'customers' | 'contracts' | 'opname' | 'import' | 'settings') => void;
  onSelectCustomer: (customer: CustomerProfile) => void;
  onSelectContract: (contract: GoldInstallmentContract) => void;
  onUpdateContract: (contract: GoldInstallmentContract) => void;
}

export const AudimeDashboardView: React.FC<AudimeDashboardViewProps> = ({
  currentUser,
  customers,
  contracts,
  onOpenAddTransaction,
  onOpenImportMitra,
  onNavigateTab,
  onSelectCustomer,
  onSelectContract,
  onUpdateContract,
}) => {
  const [periodTab, setPeriodTab] = useState<'Day' | 'Week' | 'Month'>('Month');
  const [currentMonth] = useState('Oktober 2026');
  const [viewStatBy, setViewStatBy] = useState<'By Tenor' | 'By Mitra'>('By Tenor');
  const [activeSegmentTooltip, setActiveSegmentTooltip] = useState<string | null>(
    'Akad Ibu Aini: 10g (1 Tahun) • Angsuran Rp 1.859.375/bln • Jatuh Tempo 10 Okt'
  );
  const [sendingWaId, setSendingWaId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Calculate totals
  const totalGramsFinanced = contracts.reduce((sum, c) => sum + c.goldWeightGrams, 0);
  const activeContracts = contracts.filter((c) => c.status === 'Aktif');

  // Find due payments (especially Case 4: Ibu Aini 10 Oktober)
  const dueInstallments = contracts.flatMap((contract) =>
    contract.schedule
      .filter((s) => s.status === 'Jatuh Tempo' || s.status === 'Menunggak' || s.dueDate.startsWith('2026-10'))
      .map((item) => ({
        ...item,
        contractId: contract.id,
        contractNumber: contract.contractNumber,
        customerName: contract.customerName,
        customerAge: contract.customerAge,
        customerPhone: contract.customerPhone,
        goldGrams: contract.goldWeightGrams,
        partnerName: contract.partnerName,
        totalInstallments: contract.totalInstallments,
        rawContract: contract,
      }))
  );

  // Send WhatsApp reminder
  const handleQuickSendWa = async (item: typeof dueInstallments[0]) => {
    setSendingWaId(`${item.contractId}-${item.installmentNumber}`);
    try {
      const res = await sendDueDateReminderWhatsApp({
        customerName: item.customerName,
        customerPhone: item.customerPhone,
        contractNumber: item.contractNumber,
        installmentNumber: item.installmentNumber,
        totalInstallments: item.totalInstallments,
        amount: item.amount,
        dueDate: item.dueDate,
        goldGrams: item.goldGrams,
        partnerName: item.partnerName,
      });

      // Update schedule item status
      const updatedSchedule = item.rawContract.schedule.map((s) => {
        if (s.installmentNumber === item.installmentNumber) {
          return {
            ...s,
            reminderSent: true,
            reminderSentAt: new Date().toISOString(),
          };
        }
        return s;
      });

      onUpdateContract({
        ...item.rawContract,
        schedule: updatedSchedule,
      });

      setActionFeedback(res.message);
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (e: any) {
      setActionFeedback(`Gagal: ${e.message}`);
      setTimeout(() => setActionFeedback(null), 4000);
    } finally {
      setSendingWaId(null);
    }
  };

  // Days simulation for bar chart
  const daysInMonth = Array.from({ length: 16 }, (_, i) => ({
    dayLabel: `Okt ${i * 2 + 1}`,
    dayNum: i * 2 + 1,
    heights: [
      (i * 13 + 12) % 35 + 10,
      (i * 17 + 8) % 25 + 5,
      (i * 19 + 5) % 20 + 5,
    ],
    isDueDay: i * 2 + 1 === 10 || i * 2 + 1 === 15,
  }));

  return (
    <div className="space-y-6">
      {/* Top Filter & Breadcrumb Bar (Matching Audime Header) */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-4 sm:p-5 border border-slate-100 dark:border-gray-800 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.04)] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Breadcrumbs */}
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-medium text-slate-400 dark:text-gray-500">
            Konsorsium CRM
          </span>
          <span className="text-slate-300 dark:text-gray-700">/</span>
          <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            {currentUser.partnerName}
          </span>
        </div>

        {/* Center: Period Navigator */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Day / Week / Month Pill */}
          <div className="flex p-1 bg-slate-100 dark:bg-gray-800 rounded-full text-xs font-semibold text-slate-600 dark:text-gray-300">
            {(['Day', 'Week', 'Month'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setPeriodTab(tab)}
                className={`px-3 py-1 rounded-full transition-all ${
                  periodTab === tab
                    ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Month Selector with Arrows */}
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-gray-800/60 px-2 py-1 rounded-full border border-slate-200/80 dark:border-gray-700 text-xs font-bold text-slate-700 dark:text-gray-200">
            <button className="p-1 hover:bg-slate-200 dark:hover:bg-gray-700 rounded-full transition-colors">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2">{currentMonth}</span>
            <button className="p-1 hover:bg-slate-200 dark:hover:bg-gray-700 rounded-full transition-colors">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => {}}
            className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Kembali ke bulan ini
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenImportMitra}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-200 rounded-full text-xs font-semibold border border-slate-200 dark:border-gray-700 flex items-center gap-1.5 transition-all shadow-sm"
            title="Import Transaksi dari Dasbor Mitra"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Import Mitra</span>
          </button>

          <button
            onClick={onOpenAddTransaction}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-500/25 transition-all active:scale-95"
            title="Tambah Transaksi / Akad Mandiri"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Transaksi Mandiri</span>
          </button>
        </div>
      </div>

      {actionFeedback && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-medium flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Row 1: Charts Section (Logged Time Summary + Time Summary Stats) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Card: Ringkasan Pembiayaan Emas (Donut / Radial Chart) */}
        <div className="lg:col-span-5 bg-white dark:bg-gray-900 rounded-3xl p-6 border border-slate-100 dark:border-gray-800 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.04)] flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Ringkasan Pembiayaan Emas
              </h3>
              <p className="text-xs text-slate-400 dark:text-gray-500 mt-0.5">
                Total portofolio emas SNI 999.9 aktif
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
              {activeContracts.length} Akad Aktif
            </span>
          </div>

          {/* Radial Donut Visualization */}
          <div className="relative flex items-center justify-center my-6">
            <svg className="w-52 h-52 transform -rotate-90" viewBox="0 0 120 120">
              {/* Background Ring */}
              <circle
                cx="60"
                cy="60"
                r="45"
                stroke="currentColor"
                strokeWidth="14"
                className="text-slate-100 dark:text-gray-800"
                fill="none"
              />
              {/* Segment 1: Ibu Aini 10g (Case 2) */}
              <circle
                cx="60"
                cy="60"
                r="45"
                stroke="url(#gradient-indigo)"
                strokeWidth="14"
                strokeDasharray="283"
                strokeDashoffset="170"
                strokeLinecap="round"
                fill="none"
                className="cursor-pointer hover:stroke-width-[16] transition-all"
                onClick={() =>
                  setActiveSegmentTooltip(
                    'Akad Ibu Aini: 10g (1 Tahun) • Angsuran Rp 1.859.375/bln • Jatuh Tempo 10 Okt'
                  )
                }
              />
              {/* Segment 2: Bambang 5g */}
              <circle
                cx="60"
                cy="60"
                r="45"
                stroke="url(#gradient-amber)"
                strokeWidth="14"
                strokeDasharray="283"
                strokeDashoffset="240"
                strokeLinecap="round"
                fill="none"
                className="cursor-pointer hover:stroke-width-[16] transition-all"
                onClick={() =>
                  setActiveSegmentTooltip('Akad Bpk. Bambang Pamungkas: 5g (6 Bulan) • Angsuran Rp 1.721.938/bln')
                }
              />
              {/* Segment 3: Siti Khodijah 25g */}
              <circle
                cx="60"
                cy="60"
                r="45"
                stroke="url(#gradient-emerald)"
                strokeWidth="14"
                strokeDasharray="283"
                strokeDashoffset="265"
                strokeLinecap="round"
                fill="none"
                className="cursor-pointer hover:stroke-width-[16] transition-all"
                onClick={() =>
                  setActiveSegmentTooltip('Akad Ibu Siti Khodijah: 25g (2 Tahun) • Angsuran Rp 3.025.000/bln')
                }
              />

              {/* Gradients */}
              <defs>
                <linearGradient id="gradient-indigo" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
                <linearGradient id="gradient-amber" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#fbbf24" />
                </linearGradient>
                <linearGradient id="gradient-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
              </defs>
            </svg>

            {/* Center Donut Text (Like Audime: 20:43hr 9 Projects) */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {totalGramsFinanced} g
              </span>
              <span className="text-xs font-semibold text-slate-400 dark:text-gray-500 mt-0.5">
                {activeContracts.length} Akad Pembiayaan
              </span>
            </div>

            {/* Floating Audime Tooltip */}
            {activeSegmentTooltip && (
              <div className="absolute -bottom-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[11px] font-medium py-1.5 px-3 rounded-xl shadow-lg border border-white/20 animate-in fade-in duration-200 max-w-[280px] text-center">
                {activeSegmentTooltip}
              </div>
            )}
          </div>

          {/* Legend row */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 dark:border-gray-800 text-center">
            <div>
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span>10g Aini</span>
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">10 Gram</div>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>5g Bambang</span>
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">5 Gram</div>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Lainnya</span>
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">
                {Math.max(0, totalGramsFinanced - 15)} Gram
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Statistik Tagihan & Angsuran (Time Summary Stats) */}
        <div className="lg:col-span-7 bg-white dark:bg-gray-900 rounded-3xl p-6 border border-slate-100 dark:border-gray-800 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Statistik Tagihan & Angsuran
              </h3>
              <p className="text-xs text-slate-400 dark:text-gray-500 mt-0.5">
                Jadwal jatuh tempo per tanggal di bulan {currentMonth}
              </p>
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-gray-800 rounded-full text-xs font-semibold text-slate-600 dark:text-gray-300 self-start sm:self-auto">
              <button
                onClick={() => setViewStatBy('By Tenor')}
                className={`px-3 py-1 rounded-full transition-all ${
                  viewStatBy === 'By Tenor'
                    ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                By Tenor
              </button>
              <button
                onClick={() => setViewStatBy('By Mitra')}
                className={`px-3 py-1 rounded-full transition-all ${
                  viewStatBy === 'By Mitra'
                    ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                By Mitra
              </button>
            </div>
          </div>

          {/* Segmented Timeline Bar Chart (Audime Style) */}
          <div className="flex items-end justify-between gap-1.5 h-48 pt-6 pb-2 px-2 border-b border-slate-100 dark:border-gray-800 overflow-x-auto">
            {daysInMonth.map((day, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1.5 flex-1 min-w-[20px] group">
                {/* Stacked Colored Bars */}
                <div className="w-full max-w-[16px] flex flex-col gap-1 items-center">
                  {/* Top Bar (Lavender/Pink) */}
                  <div
                    style={{ height: `${day.heights[2]}px` }}
                    className="w-full rounded-md bg-gradient-to-t from-pink-400 to-rose-300 group-hover:opacity-80 transition-opacity"
                  />
                  {/* Middle Bar (Teal/Emerald) */}
                  <div
                    style={{ height: `${day.heights[1]}px` }}
                    className="w-full rounded-md bg-gradient-to-t from-emerald-400 to-teal-300 group-hover:opacity-80 transition-opacity"
                  />
                  {/* Bottom Bar (Indigo/Blue or Amber if due) */}
                  <div
                    style={{ height: `${day.heights[0]}px` }}
                    className={`w-full rounded-md transition-opacity ${
                      day.isDueDay
                        ? 'bg-gradient-to-t from-amber-500 to-yellow-400 shadow-sm shadow-amber-500/50 ring-2 ring-amber-300'
                        : 'bg-gradient-to-t from-indigo-500 to-blue-400'
                    }`}
                  />
                </div>
                {/* Label */}
                <span
                  className={`text-[9px] font-semibold tracking-tighter ${
                    day.isDueDay
                      ? 'text-amber-600 dark:text-amber-400 font-bold'
                      : 'text-slate-400 dark:text-gray-500'
                  }`}
                >
                  {day.dayNum}
                </span>
              </div>
            ))}
          </div>

          {/* Bottom Indicators */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-4 text-xs">
            <div className="flex items-center gap-4 text-slate-500 dark:text-gray-400 text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-indigo-500" /> Angsuran Pokok
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-emerald-400" /> Margin Syariah
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-pink-400" /> Biaya Brankas
              </span>
              <span className="flex items-center gap-1.5 font-bold text-amber-600">
                <span className="w-2.5 h-2.5 rounded bg-amber-500 ring-1 ring-amber-300" /> 10 Okt (Aini)
              </span>
            </div>

            <button
              onClick={() => onNavigateTab('due')}
              className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1"
            >
              Kelola Semua Tagihan <ChevronRightIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: Customer Cards Grid (Totals By Person) & Upcoming Due (Members Leaves) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Totals By Person (Nasabah Pembiayaan) */}
        <div className="lg:col-span-8 bg-white dark:bg-gray-900 rounded-3xl p-6 border border-slate-100 dark:border-gray-800 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Daftar Nasabah Pembiayaan Emas
              </h3>
              <p className="text-xs text-slate-400 dark:text-gray-500 mt-0.5">
                Ringkasan angsuran dan status per nasabah
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('customers')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              Lihat Semua ({customers.length}) <ChevronRightIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Cards Grid (Audime Style) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {customers.slice(0, 6).map((cust) => {
              const contract = contracts.find((c) => c.customerId === cust.id);
              const isAiniCase = cust.name.includes('Aini');
              const paidCount = contract?.installmentsPaid || 0;
              const totalCount = contract?.totalInstallments || 12;
              const percent = Math.min(100, Math.round((paidCount / totalCount) * 100));

              return (
                <div
                  key={cust.id}
                  onClick={() => {
                    onSelectCustomer(cust);
                    if (contract) onSelectContract(contract);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative group ${
                    isAiniCase
                      ? 'border-indigo-300 dark:border-indigo-700 bg-indigo-50/30 dark:bg-indigo-950/20 shadow-sm'
                      : 'border-slate-100 dark:border-gray-800 hover:border-slate-200 dark:hover:border-gray-700 bg-white dark:bg-gray-900/60'
                  }`}
                >
                  {/* Avatar & Status Pill */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold flex items-center justify-center text-sm shadow-sm ring-2 ring-white dark:ring-gray-900">
                      {cust.name.substring(0, 2).toUpperCase()}
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isAiniCase
                          ? 'bg-amber-500 text-white animate-pulse'
                          : cust.status === 'Aktif'
                          ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-gray-800 dark:text-gray-300'
                      }`}
                    >
                      {isAiniCase ? 'Jatuh Tempo 10 Okt' : cust.status}
                    </span>
                  </div>

                  {/* Name & Age */}
                  <div className="font-bold text-slate-900 dark:text-white text-sm tracking-tight truncate">
                    {cust.name}
                  </div>
                  <div className="text-[11px] text-slate-400 dark:text-gray-500 mt-0.5">
                    {cust.age} th • {cust.occupation}
                  </div>

                  {/* Gold grams & tenor */}
                  <div className="mt-2.5 flex items-center justify-between text-xs font-semibold">
                    <span className="text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {contract ? `${contract.goldWeightGrams}g (${contract.tenorMonths} bln)` : `${cust.totalGramsFinanced}g`}
                    </span>
                    <span className="text-slate-600 dark:text-gray-400">
                      {paidCount}/{totalCount} bln
                    </span>
                  </div>

                  {/* Audime-style Colorful Progress Bar */}
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-gray-800 rounded-full mt-2 overflow-hidden">
                    <div
                      style={{ width: `${Math.max(10, percent)}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${
                        isAiniCase
                          ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400'
                          : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Members Leaves Style (Jatuh Tempo Terdekat & Pengingat WA) */}
        <div className="lg:col-span-4 bg-white dark:bg-gray-900 rounded-3xl p-6 border border-slate-100 dark:border-gray-800 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Jatuh Tempo Terdekat
                </h3>
                <p className="text-xs text-slate-400 dark:text-gray-500 mt-0.5">
                  Pengingat tagihan bulan {currentMonth}
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('due')}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                See All
              </button>
            </div>

            {/* List of Due Reminders */}
            <div className="space-y-3">
              {dueInstallments.slice(0, 5).map((item) => {
                const isAini = item.customerName.includes('Aini') && item.dueDate === '2026-10-10';
                const key = `${item.contractId}-${item.installmentNumber}`;
                const isSending = sendingWaId === key;

                return (
                  <div
                    key={key}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isAini
                        ? 'bg-amber-50/50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800/80 shadow-sm'
                        : 'bg-slate-50/60 dark:bg-gray-800/40 border-slate-100 dark:border-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          isAini
                            ? 'bg-amber-500 text-white ring-2 ring-amber-200'
                            : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                        }`}
                      >
                        {item.customerName.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          {item.customerName}
                          {isAini && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500 text-white">
                              Hari Ini
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-gray-400">
                          {item.goldGrams}g • {formatRupiah(item.amount)}
                        </div>
                        <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Jatuh Tempo: {item.dueDate}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleQuickSendWa(item)}
                        disabled={isSending}
                        title="Kirim Pengingat Otomatis via WhatsApp Fonnte"
                        className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white transition-all shadow-sm"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>

                      <a
                        href={getWhatsAppDirectUrl({
                          phone: item.customerPhone,
                          message: `Yth. ${item.customerName}, pengingat cicilan emas ${item.goldGrams}g jatuh tempo ${item.dueDate} sebesar ${formatRupiah(item.amount)}. Rekening BCA: 8694991111 A.N PT EMAS MURNI ASLI.`,
                        })}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Buka Web WhatsApp Manual"
                        className="p-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-slate-700 dark:text-gray-200 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Manage All Due Dates CTA */}
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-gray-800">
            <button
              onClick={() => onNavigateTab('due')}
              className="w-full py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Buka Seluruh Jadwal Jatuh Tempo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
