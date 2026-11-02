import React, { useState } from 'react';
import {
  Boxes,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Calendar,
  Building,
  UserCheck,
  Printer,
  Sparkles,
  Lock,
  Plus,
  RefreshCw,
  Search,
  Check,
  X
} from 'lucide-react';
import { StockOpnameRecord, StockOpnameItem } from '../types';
import { formatGrams, formatNumber } from '../utils/formatters';

interface StockOpnameViewProps {
  records: StockOpnameRecord[];
  onAddRecord: (record: StockOpnameRecord) => void;
  onUpdateRecord: (record: StockOpnameRecord) => void;
}

export const StockOpnameView: React.FC<StockOpnameViewProps> = ({
  records,
  onAddRecord,
  onUpdateRecord,
}) => {
  const [selectedRecordId, setSelectedRecordId] = useState<string>(
    records[0]?.id || 'so-2026-10-001'
  );
  const [isAuditing, setIsAuditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const activeRecord = records.find((r) => r.id === selectedRecordId) || records[0];

  // Editable items state for audit mode
  const [auditItems, setAuditItems] = useState<StockOpnameItem[]>(
    activeRecord ? [...activeRecord.items] : []
  );

  // Sync audit items when active record changes
  React.useEffect(() => {
    if (activeRecord) {
      setAuditItems([...activeRecord.items]);
    }
  }, [selectedRecordId, activeRecord]);

  const handlePhysicalChange = (index: number, newPhysical: number) => {
    const updated = [...auditItems];
    const item = { ...updated[index] };
    item.physicalStockPcs = Math.max(0, newPhysical);
    item.differencePcs = item.physicalStockPcs - item.systemStockPcs;
    item.differenceGrams = item.differencePcs * item.weightGrams;
    item.availablePcs = Math.max(0, item.physicalStockPcs - item.allocatedInstallmentPcs);
    item.status = item.differencePcs === 0 ? 'Match' : item.differencePcs > 0 ? 'Surplus' : 'Deficit';
    updated[index] = item;
    setAuditItems(updated);
  };

  const handleSaveAudit = () => {
    if (!activeRecord) return;

    const totalSystemGrams = auditItems.reduce(
      (sum, item) => sum + item.systemStockPcs * item.weightGrams,
      0
    );
    const totalPhysicalGrams = auditItems.reduce(
      (sum, item) => sum + item.physicalStockPcs * item.weightGrams,
      0
    );
    const totalAllocatedGrams = auditItems.reduce(
      (sum, item) => sum + item.allocatedInstallmentPcs * item.weightGrams,
      0
    );
    const totalDifferenceGrams = totalPhysicalGrams - totalSystemGrams;

    const hasDifference = auditItems.some((i) => i.differencePcs !== 0);

    const updatedRecord: StockOpnameRecord = {
      ...activeRecord,
      items: auditItems,
      totalSystemGrams,
      totalPhysicalGrams,
      totalAllocatedGrams,
      totalDifferenceGrams,
      status: hasDifference ? 'Ada Selisih' : 'Selesai',
      verifiedAt: new Date().toISOString(),
      summaryNote: hasDifference
        ? `Audit selesai dengan selisih ${totalDifferenceGrams > 0 ? '+' : ''}${totalDifferenceGrams.toFixed(2)} gram. Memerlukan investigasi fisik.`
        : 'Seluruh fisik emas batangan SNI di brankas khazanah 100% cocok dengan saldo pembukuan sistem.',
    };

    onUpdateRecord(updatedRecord);
    setIsAuditing(false);
    setFeedback('Hasil Stock Opname berhasil disimpan dan diverifikasi!');
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleCreateNewAudit = () => {
    const newId = `so-${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];
    const initialItems: StockOpnameItem[] = activeRecord
      ? activeRecord.items.map((i) => ({ ...i, differencePcs: 0, differenceGrams: 0, status: 'Match' }))
      : [];

    const newRecord: StockOpnameRecord = {
      id: newId,
      opnameNumber: `SO-REI/${today.replace(/-/g, '/')}/00${records.length + 1}`,
      date: today,
      vaultLocation: 'Khazanah Brankas Sentral Konsorsium PT Emas Murni Asli - Jakarta',
      auditorName: 'Tim Audit Internal & Petugas Khazanah Brankas',
      auditorRole: 'Kepala Operasional Khazanah & Dewan Syariah',
      status: 'Menunggu Verifikasi',
      items: initialItems,
      totalSystemGrams: activeRecord?.totalSystemGrams || 0,
      totalPhysicalGrams: activeRecord?.totalPhysicalGrams || 0,
      totalAllocatedGrams: activeRecord?.totalAllocatedGrams || 0,
      totalDifferenceGrams: 0,
      summaryNote: `Pemeriksaan fisik berkala tanggal ${today}`,
    };

    onAddRecord(newRecord);
    setSelectedRecordId(newId);
    setIsAuditing(true);
    setFeedback(`Sesi Audit Stock Opname baru (${newRecord.opnameNumber}) dibuka.`);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handlePrintOpname = () => {
    window.print();
  };

  const filteredItems = (isAuditing ? auditItems : activeRecord?.items || []).filter(
    (item) =>
      item.weightGrams.toString().includes(searchTerm) ||
      item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-amber-950 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/30 text-amber-200 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            CASE 5: AUDIT STOCK OPNAME BRANKAS
          </div>
          <h2 className="text-2xl font-bold">Stock Opname & Rekonsiliasi Emas Brankas</h2>
          <p className="text-amber-100 text-sm mt-1 max-w-2xl">
            Pencocokan fisik emas batangan SNI 999.9 di khazanah brankas konsorsium dengan saldo buku sistem,
            termasuk alokasi jaminan fidusia akad cicilan aktif (misal 10g Ibu Aini).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePrintOpname}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-sm border border-white/20 flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4" /> Cetak Berita Acara
          </button>
          {!isAuditing ? (
            <button
              onClick={() => setIsAuditing(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Mulai Audit Fisik
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveAudit}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5 transition-colors"
              >
                <Check className="w-4 h-4" /> Simpan Hasil Audit
              </button>
              <button
                onClick={() => {
                  setIsAuditing(false);
                  if (activeRecord) setAuditItems([...activeRecord.items]);
                }}
                className="px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                <X className="w-4 h-4" /> Batal
              </button>
            </div>
          )}
        </div>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl text-sm font-medium bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Audit Session Selector & Details */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4 mb-4">
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Pilih Dokumen Opname:
            </label>
            <select
              value={selectedRecordId}
              onChange={(e) => setSelectedRecordId(e.target.value)}
              disabled={isAuditing}
              className="px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-amber-500"
            >
              {records.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.opnameNumber} ({r.date}) - Status: {r.status}
                </option>
              ))}
            </select>

            <button
              onClick={handleCreateNewAudit}
              disabled={isAuditing}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium flex items-center gap-1 border border-gray-300 dark:border-gray-600"
            >
              <Plus className="w-3.5 h-3.5" /> Buka Audit Baru
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                activeRecord?.status === 'Selesai'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                  : activeRecord?.status === 'Ada Selisih'
                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
              }`}
            >
              {activeRecord?.status === 'Selesai' ? (
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              )}
              Status: {activeRecord?.status}
            </span>
          </div>
        </div>

        {/* Audit Meta Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <span className="text-gray-400 block">Lokasi Brankas Khazanah:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {activeRecord?.vaultLocation}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <span className="text-gray-400 block">Auditor / Verifikator:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {activeRecord?.auditorName} ({activeRecord?.auditorRole})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <span className="text-gray-400 block">Tanggal & Waktu Verifikasi:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {activeRecord?.date} • {activeRecord?.verifiedAt || 'Selesai Terverifikasi'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Total Stok Sistem</span>
            <Boxes className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {formatGrams(activeRecord?.totalSystemGrams || 0)}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">Saldo pembukuan</div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Total Fisik Brankas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {formatGrams(activeRecord?.totalPhysicalGrams || 0)}
          </div>
          <div className="text-xs text-emerald-600/80 mt-0.5">Hasil hitung fisik</div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Alokasi Cicilan Aktif</span>
            <Lock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-1">
            {formatGrams(activeRecord?.totalAllocatedGrams || 0)}
          </div>
          <div className="text-xs text-amber-600/80 mt-0.5">Jaminan fidusia akad</div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Status Selisih (Varian)</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div
            className={`text-2xl font-bold mt-1 ${
              (activeRecord?.totalDifferenceGrams || 0) === 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {(activeRecord?.totalDifferenceGrams || 0) === 0
              ? '0 Gram (Cocok)'
              : `${activeRecord?.totalDifferenceGrams} Gram`}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">
            {(activeRecord?.totalDifferenceGrams || 0) === 0 ? '100% Akurat' : 'Perlu Investigasi'}
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base">
              Rincian Keping Emas Batangan SNI per Pecahan (0.1g s/d 1000g)
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {isAuditing
                ? 'Mode Audit Aktif: Silakan ubah angka di kolom "Fisik Brankas" sesuai hasil hitung di khazanah.'
                : 'Pecahan 10 gram mencakup 1 keping jaminan fidusia akad Ibu Aini (AKAD-REI/2026/08/0010).'}
            </p>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari pecahan / catatan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="bg-gray-50 dark:bg-gray-800/60 text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="py-3.5 px-4">Gramatur</th>
                <th className="py-3.5 px-4">Merek & Standar</th>
                <th className="py-3.5 px-4 text-right">Stok Sistem</th>
                <th className="py-3.5 px-4 text-right bg-amber-50/50 dark:bg-amber-950/20">Fisik Brankas</th>
                <th className="py-3.5 px-4 text-right">Alokasi Cicilan</th>
                <th className="py-3.5 px-4 text-right">Stok Bebas</th>
                <th className="py-3.5 px-4 text-center">Selisih</th>
                <th className="py-3.5 px-4">Status & Catatan Tray Brankas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {filteredItems.map((item, idx) => {
                const isTenGramCase = item.weightGrams === 10;
                return (
                  <tr
                    key={item.weightGrams}
                    className={`hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors ${
                      isTenGramCase ? 'bg-amber-50/30 dark:bg-amber-950/20 font-medium' : ''
                    }`}
                  >
                    {/* Weight */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                        <span className="p-1 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 text-xs">
                          {formatGrams(item.weightGrams)}
                        </span>
                        {isTenGramCase && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500 text-white">
                            Case 2 & 5 (Aini)
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Brand */}
                    <td className="py-3.5 px-4">
                      <div className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                        {item.brand}
                      </div>
                      <div className="text-[11px] text-gray-400">Kadar 999.9 (24K) SNI</div>
                    </td>

                    {/* System Stock */}
                    <td className="py-3.5 px-4 text-right font-medium">
                      {formatNumber(item.systemStockPcs)} pcs
                      <div className="text-[10px] text-gray-400">
                        {(item.systemStockPcs * item.weightGrams).toLocaleString('id-ID')} g
                      </div>
                    </td>

                    {/* Physical Stock */}
                    <td className="py-3.5 px-4 text-right bg-amber-50/50 dark:bg-amber-950/20">
                      {isAuditing ? (
                        <input
                          type="number"
                          min="0"
                          value={item.physicalStockPcs}
                          onChange={(e) => handlePhysicalChange(idx, parseInt(e.target.value) || 0)}
                          className="w-20 px-2 py-1 text-right text-xs bg-white dark:bg-gray-800 border-2 border-amber-400 rounded-lg text-gray-900 dark:text-white font-bold focus:outline-none"
                        />
                      ) : (
                        <div className="font-bold text-gray-900 dark:text-white">
                          {formatNumber(item.physicalStockPcs)} pcs
                          <div className="text-[10px] text-emerald-600 dark:text-emerald-400">
                            {(item.physicalStockPcs * item.weightGrams).toLocaleString('id-ID')} g
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Allocated Installment */}
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-400 text-xs">
                        <Lock className="w-3 h-3" />
                        {item.allocatedInstallmentPcs} pcs
                      </span>
                      <div className="text-[10px] text-gray-400">
                        {(item.allocatedInstallmentPcs * item.weightGrams).toLocaleString('id-ID')} g
                      </div>
                    </td>

                    {/* Available Stock */}
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-semibold text-blue-600 dark:text-blue-400 text-xs">
                        {item.availablePcs} pcs
                      </span>
                      <div className="text-[10px] text-gray-400">
                        {(item.availablePcs * item.weightGrams).toLocaleString('id-ID')} g
                      </div>
                    </td>

                    {/* Difference */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                          item.differencePcs === 0
                            ? 'text-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'text-rose-700 bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}
                      >
                        {item.differencePcs === 0
                          ? '0'
                          : `${item.differencePcs > 0 ? '+' : ''}${item.differencePcs} pcs`}
                      </span>
                    </td>

                    {/* Notes & Tray */}
                    <td className="py-3.5 px-4">
                      <div className="text-xs text-gray-700 dark:text-gray-300">{item.notes}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
