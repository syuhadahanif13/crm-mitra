import React, { useState } from 'react';
import {
  Bell,
  Send,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  Search,
  MessageSquare,
  Phone,
  CreditCard,
  Building2,
  FileText
} from 'lucide-react';
import { GoldInstallmentContract } from '../types';
import { formatRupiah, formatGrams } from '../utils/formatters';
import { sendDueDateReminderWhatsApp, getWhatsAppDirectUrl } from '../services/crmService';

interface DuePaymentAutomationViewProps {
  contracts: GoldInstallmentContract[];
  onUpdateContract: (updated: GoldInstallmentContract) => void;
}

export const DuePaymentAutomationView: React.FC<DuePaymentAutomationViewProps> = ({
  contracts,
  onUpdateContract,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Jatuh Tempo' | 'Menunggak' | 'Mendatang' | 'Lunas'>('All');
  const [selectedMonth, setSelectedMonth] = useState('2026-10'); // Default to Case 4: Oktober 2026
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Flatten installments from contracts with customer & contract metadata
  const allInstallments = contracts.flatMap((contract) =>
    contract.schedule.map((item) => ({
      ...item,
      contractId: contract.id,
      contractNumber: contract.contractNumber,
      customerName: contract.customerName,
      customerAge: contract.customerAge,
      customerPhone: contract.customerPhone,
      customerEmail: contract.customerEmail,
      goldWeightGrams: contract.goldWeightGrams,
      partnerName: contract.partnerName,
      partnerCategory: contract.partnerCategory,
      totalInstallments: contract.totalInstallments,
      rawContract: contract,
    }))
  );

  // Filter items
  const filteredInstallments = allInstallments.filter((item) => {
    const matchesSearch =
      item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.customerPhone.includes(searchTerm);

    const matchesStatus =
      statusFilter === 'All'
        ? true
        : statusFilter === 'Jatuh Tempo'
        ? item.status === 'Jatuh Tempo'
        : statusFilter === 'Menunggak'
        ? item.status === 'Menunggak'
        : statusFilter === 'Mendatang'
        ? item.status === 'Mendatang'
        : item.status === 'Lunas';

    const matchesMonth = selectedMonth ? item.dueDate.startsWith(selectedMonth) : true;

    return matchesSearch && matchesStatus && matchesMonth;
  });

  // Calculate statistics
  const totalDueCount = allInstallments.filter((i) => i.status === 'Jatuh Tempo').length;
  const totalOverdueCount = allInstallments.filter((i) => i.status === 'Menunggak').length;
  const totalPaidCount = allInstallments.filter((i) => i.status === 'Lunas').length;
  const totalAmountDueMonth = filteredInstallments.reduce((acc, curr) => acc + curr.amount, 0);

  // Trigger Fonnte WhatsApp reminder
  const handleSendReminder = async (item: typeof allInstallments[0]) => {
    const key = `${item.contractId}-${item.installmentNumber}`;
    setSendingId(key);
    setFeedbackMsg(null);

    try {
      const res = await sendDueDateReminderWhatsApp({
        customerName: item.customerName,
        customerPhone: item.customerPhone,
        contractNumber: item.contractNumber,
        installmentNumber: item.installmentNumber,
        totalInstallments: item.totalInstallments,
        amount: item.amount,
        dueDate: item.dueDate,
        goldGrams: item.goldWeightGrams,
        partnerName: item.partnerName,
      });

      // Update schedule item reminderSent status in state
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

      const updatedContract: GoldInstallmentContract = {
        ...item.rawContract,
        schedule: updatedSchedule,
      };

      onUpdateContract(updatedContract);
      setFeedbackMsg({
        text: res.message || `Reminder WhatsApp terkirim ke ${item.customerName}!`,
        type: res.success ? 'success' : 'error',
      });
    } catch (err: any) {
      setFeedbackMsg({
        text: `Gagal mengirim WhatsApp: ${err.message || 'Koneksi error'}`,
        type: 'error',
      });
    } finally {
      setSendingId(null);
    }
  };

  // Mark installment as paid
  const handleMarkAsPaid = (item: typeof allInstallments[0]) => {
    const nowStr = new Date().toISOString().split('T')[0];
    const updatedSchedule = item.rawContract.schedule.map((s) => {
      if (s.installmentNumber === item.installmentNumber) {
        return {
          ...s,
          status: 'Lunas' as const,
          paidDate: nowStr,
          paymentMethod: 'Transfer BCA Rekening PT Emas Murni Asli',
        };
      }
      return s;
    });

    const newPaidCount = updatedSchedule.filter((s) => s.status === 'Lunas').length;
    const newPaidAmount = updatedSchedule
      .filter((s) => s.status === 'Lunas')
      .reduce((sum, s) => sum + s.amount, 0);
    const newRemaining = Math.max(0, item.rawContract.financedPrincipal - newPaidAmount);

    const nextUpcoming = updatedSchedule.find((s) => s.status !== 'Lunas');

    const updatedContract: GoldInstallmentContract = {
      ...item.rawContract,
      schedule: updatedSchedule,
      installmentsPaid: newPaidCount,
      totalPaidAmount: newPaidAmount,
      remainingFinancedAmount: newRemaining,
      nextDueDate: nextUpcoming ? nextUpcoming.dueDate : 'LUNAS',
      status: newPaidCount === item.rawContract.totalInstallments ? 'Lunas' : 'Aktif',
    };

    onUpdateContract(updatedContract);
    setFeedbackMsg({
      text: `Angsuran ke-${item.installmentNumber} nasabah ${item.customerName} berhasil ditandai LUNAS!`,
      type: 'success',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Control Bar (Audime Style) */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Jatuh Tempo & Otomasi Tagihan
          </h2>
          <p className="text-xs text-slate-400 dark:text-gray-500 mt-0.5">
            Monitoring jadwal angsuran emas, kirim pengingat otomatis ke WhatsApp nasabah
          </p>
        </div>

        {/* Month & Search Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Month Selector Pill */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-gray-900 px-3 py-1.5 rounded-full border border-slate-200/80 dark:border-gray-800 text-xs font-bold text-slate-700 dark:text-gray-200 shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent border-none text-xs font-bold text-slate-700 dark:text-gray-200 focus:outline-none cursor-pointer"
            />
          </div>

          {/* Search Box Pill */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nasabah, no akad, HP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-white dark:bg-gray-900 border border-slate-200/80 dark:border-gray-800 rounded-full text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* KPI Stats Cards (Audime 4-Column Layout) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-slate-100 dark:border-gray-800 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 dark:text-gray-500">Jatuh Tempo Bulan Ini</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">
            {totalDueCount} <span className="text-xs font-semibold text-slate-400">Tagihan</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-gray-500 mt-1">Perlu pengingat WhatsApp</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-slate-100 dark:border-gray-800 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 dark:text-gray-500">Menunggak (Overdue)</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-2">
            {totalOverdueCount} <span className="text-xs font-semibold text-slate-400">Tagihan</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-gray-500 mt-1">Perlu eskalasi penagihan</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-slate-100 dark:border-gray-800 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 dark:text-gray-500">Sudah Lunas</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {totalPaidCount} <span className="text-xs font-semibold text-slate-400">Tagihan</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-gray-500 mt-1">Tercatat aman di sistem</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-slate-100 dark:border-gray-800 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 dark:text-gray-500">Total Nilai Tagihan</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-2 truncate">
            {formatRupiah(totalAmountDueMonth)}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-gray-500 mt-1">Filter bulan aktif</p>
        </div>
      </div>

      {/* Due Highlight Card: Priority Alert */}
      {(() => {
        const urgentDueItem = allInstallments.find((i) => i.status === 'Jatuh Tempo' || i.status === 'Menunggak') || allInstallments[0];
        if (!urgentDueItem) {
          return (
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-slate-100 dark:border-gray-800 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.04)] flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  Semua Pembayaran Tertib & Lancar
                </h3>
                <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                  Tidak ada tagihan yang tertunggak atau melewati jatuh tempo saat ini.
                </p>
              </div>
            </div>
          );
        }

        return (
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border-2 border-amber-300 dark:border-amber-700/60 shadow-[0_4px_25px_-5px_rgba(245,158,11,0.08)]">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-white flex items-center justify-center shadow-md shadow-amber-500/30 shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-extrabold text-slate-900 dark:text-white text-base">
                      {urgentDueItem.customerName} — Tagihan Angsuran #{urgentDueItem.installmentNumber}
                    </span>
                    <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                      urgentDueItem.status === 'Menunggak'
                        ? 'bg-rose-500 text-white'
                        : 'bg-amber-500 text-white'
                    } shadow-sm`}>
                      {urgentDueItem.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                    Cicilan {urgentDueItem.goldGrams}g Emas LM • Angsuran ke-{urgentDueItem.installmentNumber} dari {urgentDueItem.totalInstallments} Bulan • Mitra {urgentDueItem.partnerName}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 mt-2.5 text-xs text-slate-600 dark:text-gray-300">
                    <span className="font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5" /> Tagihan: {formatRupiah(urgentDueItem.amount)}
                    </span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <Phone className="w-3.5 h-3.5" /> {urgentDueItem.customerPhone}
                    </span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <Calendar className="w-3.5 h-3.5" /> {urgentDueItem.dueDate}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={() => handleSendReminder(urgentDueItem)}
                  disabled={sendingId === `${urgentDueItem.contractId}-${urgentDueItem.installmentNumber}`}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white rounded-full text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{sendingId === `${urgentDueItem.contractId}-${urgentDueItem.installmentNumber}` ? 'Mengirim WhatsApp...' : 'Kirim Reminder WA Otomatis'}</span>
                </button>

                <a
                  href={getWhatsAppDirectUrl({
                    phone: urgentDueItem.customerPhone,
                    message: `Yth. ${urgentDueItem.customerName}, pengingat cicilan emas ${urgentDueItem.goldGrams}g jatuh tempo ${urgentDueItem.dueDate} sebesar ${formatRupiah(urgentDueItem.amount)}. Rekening BCA: 8694991111 A.N PT EMAS MURNI ASLI. Terima kasih.`,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-200 rounded-full text-xs font-semibold border border-slate-200 dark:border-gray-700 flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka Web WA</span>
                </a>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Feedback Toast */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl text-xs font-medium flex items-center justify-between shadow-sm ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="text-xs underline hover:opacity-80"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Main Table Card (Audime Rounded-3xl Card) */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-slate-100 dark:border-gray-800 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.04)] overflow-hidden">
        {/* Table Top Controls & Filter Tabs */}
        <div className="p-5 border-b border-slate-100 dark:border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Daftar Jadwal Angsuran & Penagihan
            </h3>
            <p className="text-xs text-slate-400 dark:text-gray-500 mt-0.5">
              Menampilkan {filteredInstallments.length} tagihan sesuai filter status
            </p>
          </div>

          {/* Filter Pills (Audime Style) */}
          <div className="flex p-1 bg-slate-100 dark:bg-gray-800 rounded-full text-xs font-semibold text-slate-600 dark:text-gray-300 overflow-x-auto max-w-full">
            {(['All', 'Jatuh Tempo', 'Menunggak', 'Mendatang', 'Lunas'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1 rounded-full transition-all whitespace-nowrap ${
                  statusFilter === tab
                    ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-gray-300">
            <thead className="bg-slate-50/70 dark:bg-gray-800/50 text-[11px] uppercase font-bold text-slate-500 dark:text-gray-400 border-b border-slate-100 dark:border-gray-800">
              <tr>
                <th className="py-3.5 px-5">Nasabah & Kontak</th>
                <th className="py-3.5 px-4">No. Akad & Mitra</th>
                <th className="py-3.5 px-4">Angsuran Ke</th>
                <th className="py-3.5 px-4">Jatuh Tempo</th>
                <th className="py-3.5 px-4">Nominal Tagihan</th>
                <th className="py-3.5 px-4">Status & Pengingat</th>
                <th className="py-3.5 px-5 text-center">Aksi Otomasi WA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-gray-800/80">
              {filteredInstallments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    Tidak ada jadwal tagihan yang cocok dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredInstallments.map((item) => {
                  const key = `${item.contractId}-${item.installmentNumber}`;
                  const isSending = sendingId === key;

                  return (
                    <tr
                      key={key}
                      className={`hover:bg-slate-50/60 dark:hover:bg-gray-800/40 transition-colors ${
                        item.status === 'Jatuh Tempo'
                          ? 'bg-amber-50/30 dark:bg-amber-950/10'
                          : item.status === 'Menunggak'
                          ? 'bg-rose-50/30 dark:bg-rose-950/10'
                          : ''
                      }`}
                    >
                      {/* Customer Info */}
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          {item.customerName}
                          <span className="text-[11px] text-slate-400 font-normal">({item.customerAge} th)</span>
                        </div>
                        <div className="text-[11px] text-slate-400 dark:text-gray-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" /> {item.customerPhone}
                        </div>
                      </td>

                      {/* Contract & Partner */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          {item.contractNumber}
                        </div>
                        <div className="text-[11px] text-slate-400 dark:text-gray-500 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3" /> {item.partnerName} ({formatGrams(item.goldWeightGrams)})
                        </div>
                      </td>

                      {/* Installment Number */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-300">
                          Bulan {item.installmentNumber}/{item.totalInstallments}
                        </span>
                      </td>

                      {/* Due Date */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {item.dueDate}
                        </div>
                        {item.paidDate && (
                          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                            Dibayar: {item.paidDate}
                          </div>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900 dark:text-white">
                          {formatRupiah(item.amount)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Pokok: {formatRupiah(item.principalAmount)}
                        </div>
                      </td>

                      {/* Status & Reminder Badge */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              item.status === 'Lunas'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : item.status === 'Jatuh Tempo'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300/60'
                                : item.status === 'Menunggak'
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300/60'
                                : 'bg-slate-100 text-slate-700 dark:bg-gray-800 dark:text-gray-300'
                            }`}
                          >
                            {item.status}
                          </span>

                          {item.reminderSent && (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                              <MessageSquare className="w-3 h-3" />
                              WA Terkirim {item.reminderSentAt ? item.reminderSentAt.split('T')[0] : ''}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center justify-center gap-1.5">
                          {item.status !== 'Lunas' ? (
                            <>
                              <button
                                onClick={() => handleSendReminder(item)}
                                disabled={isSending}
                                title="Kirim Pengingat Otomatis via API WhatsApp"
                                className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white rounded-full text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
                              >
                                <Send className="w-3 h-3" />
                                <span>{isSending ? 'Mengirim...' : 'Kirim WA'}</span>
                              </button>

                              <a
                                href={getWhatsAppDirectUrl({
                                  phone: item.customerPhone,
                                  message: `Yth. ${item.customerName}, pengingat cicilan emas ${item.goldWeightGrams}g angsuran ke-${item.installmentNumber}/${item.totalInstallments} jatuh tempo ${item.dueDate} sebesar ${formatRupiah(item.amount)}. Rekening BCA: 8694991111 A.N PT EMAS MURNI ASLI.`,
                                })}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Kirim via Web WhatsApp Manual"
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-300 rounded-full border border-slate-200 dark:border-gray-700 transition-colors"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>

                              <button
                                onClick={() => handleMarkAsPaid(item)}
                                title="Tandai Sudah Dibayar"
                                className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 rounded-full text-xs font-bold border border-indigo-200/60 dark:border-indigo-800 transition-colors"
                              >
                                Catat Lunas
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold">
                              <CheckCircle2 className="w-4 h-4" /> Lunas
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
