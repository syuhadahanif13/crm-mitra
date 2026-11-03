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
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/30 text-amber-200 text-xs font-semibold mb-2">
            <Bell className="w-3.5 h-3.5 text-amber-300" />
            Jadwal Jatuh Tempo
          </div>
          <h2 className="text-2xl font-bold">Pengingat Tagihan & WhatsApp</h2>
          <p className="text-amber-100 text-sm mt-1 max-w-2xl">
            Kirim pengingat tagihan angsuran pembiayaan emas langsung ke WhatsApp nasabah.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/20">
          <Bell className="w-6 h-6 text-amber-300" />
          <div>
            <div className="text-xs text-amber-200">Total Tagihan Aktif</div>
            <div className="text-lg font-bold">{totalDueCount} Nasabah</div>
          </div>
        </div>
      </div>

      {/* Due Highlight Card: Ibu Aini 10 Oktober */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-400/60 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-amber-500 text-white rounded-xl shadow-md">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900 dark:text-white text-base">
                  Tagihan Jatuh Tempo: Ibu Aini (42 Tahun) - 10 Oktober 2026
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-500 text-white">
                  Jatuh Tempo Hari Ini
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                Cicilan 10 Gram Emas LM SNI 999.9 (Akad 1 Tahun) • Angsuran ke-5 dari 12 Bulan • Mitra BPRS Harta Insan Karimah
              </p>
              <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-700 dark:text-gray-300">
                <span className="flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-300">
                  <CreditCard className="w-3.5 h-3.5" /> Tagihan: {formatRupiah(1859375)}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> 0812-9876-5432
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> 10 Oktober 2026
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {allInstallments.find((i) => i.customerName.includes('Aini') && i.dueDate === '2026-10-10') && (
              <>
                <button
                  onClick={() => {
                    const ainiItem = allInstallments.find(
                      (i) => i.customerName.includes('Aini') && i.dueDate === '2026-10-10'
                    );
                    if (ainiItem) handleSendReminder(ainiItem);
                  }}
                  disabled={sendingId === `${allInstallments.find((i) => i.customerName.includes('Aini'))?.contractId}-5`}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  {sendingId?.includes('5') ? 'Mengirim WhatsApp...' : 'Kirim Reminder WA Otomatis'}
                </button>

                <a
                  href={getWhatsAppDirectUrl({
                    phone: '081298765432',
                    message: `Yth. Ibu Aini (42 th), pengingat angsuran cicilan emas 10g Raja Emas Indonesia ke-5 jatuh tempo 10 Oktober 2026 senilai Rp 1.859.375. Rekening BCA: 8694991111 A.N PT EMAS MURNI ASLI. Terima kasih.`,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl text-xs font-medium flex items-center gap-1.5 border border-gray-300 dark:border-gray-600"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Buka Web WA
                </a>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-xl text-sm font-medium flex items-center justify-between shadow-md ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-300 dark:bg-rose-950/60 dark:text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600" />
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

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Jatuh Tempo Hari Ini/Bulan Ini</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{totalDueCount} Tagihan</div>
          <div className="text-xs text-gray-400 mt-1">Perlu pengingat WhatsApp</div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Menunggak (Overdue)</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-600 mt-1">{totalOverdueCount} Tagihan</div>
          <div className="text-xs text-gray-400 mt-1">Perlu eskalasi penagihan</div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Sudah Terbayar Lunas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{totalPaidCount} Tagihan</div>
          <div className="text-xs text-gray-400 mt-1">Tercatat di sistem</div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Total Tagihan Terpilih</span>
            <CreditCard className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">
            {formatRupiah(totalAmountDueMonth)}
          </div>
          <div className="text-xs text-gray-400 mt-1">Filter bulan aktif</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-xl shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama nasabah, nomor akad, no HP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 p-0.5 bg-gray-100 dark:bg-gray-800 text-xs">
            {(['All', 'Jatuh Tempo', 'Menunggak', 'Mendatang', 'Lunas'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  statusFilter === tab
                    ? 'bg-white dark:bg-gray-900 text-amber-600 dark:text-amber-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="bg-gray-50 dark:bg-gray-800/60 text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="py-3.5 px-4">Nasabah & Kontak</th>
                <th className="py-3.5 px-4">No. Akad & Mitra</th>
                <th className="py-3.5 px-4">Angsuran Ke</th>
                <th className="py-3.5 px-4">Jatuh Tempo</th>
                <th className="py-3.5 px-4">Nominal</th>
                <th className="py-3.5 px-4">Status & Pengingat</th>
                <th className="py-3.5 px-4 text-center">Aksi Otomasi WA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {filteredInstallments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
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
                      className={`hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors ${
                        item.status === 'Jatuh Tempo'
                          ? 'bg-amber-50/40 dark:bg-amber-950/20'
                          : item.status === 'Menunggak'
                          ? 'bg-rose-50/40 dark:bg-rose-950/20'
                          : ''
                      }`}
                    >
                      {/* Customer Info */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                          {item.customerName}
                          <span className="text-xs text-gray-400 font-normal">({item.customerAge} th)</span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" /> {item.customerPhone}
                        </div>
                      </td>

                      {/* Contract & Partner */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-xs font-semibold text-amber-600 dark:text-amber-400">
                          {item.contractNumber}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3" /> {item.partnerName} ({formatGrams(item.goldWeightGrams)})
                        </div>
                      </td>

                      {/* Installment Number */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                          Bulan ke-{item.installmentNumber} / {item.totalInstallments}
                        </span>
                      </td>

                      {/* Due Date */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-900 dark:text-white text-sm">
                          {item.dueDate}
                        </div>
                        {item.paidDate && (
                          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                            Dibayar: {item.paidDate}
                          </div>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-gray-900 dark:text-white">
                          {formatRupiah(item.amount)}
                        </div>
                        <div className="text-[11px] text-gray-400">
                          Pokok: {formatRupiah(item.principalAmount)}
                        </div>
                      </td>

                      {/* Status & Reminder Badge */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              item.status === 'Lunas'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                                : item.status === 'Jatuh Tempo'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                                : item.status === 'Menunggak'
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300 border border-rose-300 dark:border-rose-700'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                            }`}
                          >
                            {item.status}
                          </span>

                          {item.reminderSent && (
                            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" />
                              WA Terkirim {item.reminderSentAt ? item.reminderSentAt.split('T')[0] : ''}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-2">
                          {item.status !== 'Lunas' ? (
                            <>
                              <button
                                onClick={() => handleSendReminder(item)}
                                disabled={isSending}
                                title="Kirim Otomatis via API Fonnte WhatsApp"
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-medium flex items-center gap-1 shadow-sm transition-all"
                              >
                                <Send className="w-3 h-3" />
                                {isSending ? 'Mengirim...' : 'Kirim WA'}
                              </button>

                              <a
                                href={getWhatsAppDirectUrl({
                                  phone: item.customerPhone,
                                  message: `Yth. ${item.customerName}, pengingat cicilan emas ${item.goldWeightGrams}g angsuran ke-${item.installmentNumber}/${item.totalInstallments} jatuh tempo ${item.dueDate} sebesar ${formatRupiah(item.amount)}. Rekening BCA: 8694991111 A.N PT EMAS MURNI ASLI.`,
                                })}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Kirim via Web WhatsApp Manual"
                                className="p-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs border border-gray-300 dark:border-gray-600 transition-colors"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>

                              <button
                                onClick={() => handleMarkAsPaid(item)}
                                title="Tandai Sudah Dibayar"
                                className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 rounded-lg text-xs font-medium border border-blue-200 dark:border-blue-800 transition-colors"
                              >
                                Catat Lunas
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
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
