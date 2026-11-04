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
        : 'Seluruh fisik emas batangan di brankas cocok dengan saldo pembukuan sistem.',
    };

    onUpdateRecord(updatedRecord);
    setIsAuditing(false);
    setFeedback('Hasil Stock Opname berhasil disimpan dan diverifikasi.');
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
      vaultLocation: 'Brankas Sentral PT Emas Murni Asli - Jakarta',
      auditorName: 'Tim Audit Internal & Petugas Brankas',
      auditorRole: 'Operasional Brankas',
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
      {/* Header Bar - Audime Benchmark */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Stock Opname & Rekonsiliasi Emas
          </h2>
          <p className="text-xs text-slate-400 dark:text-gray-500 mt-0.5">
            Pencocokan fisik emas batangan di brankas dengan saldo sistem & alokasi akad cicilan
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePrintOpname}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-200 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Berita Acara</span>
          </button>

          {!isAuditing ? (
            <button
              onClick={() => setIsAuditing(true)}
              className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full text-xs font-bold shadow-md shadow-indigo-500/25 flex items-center gap-1.5 transition-all active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Mulai Audit Fisik</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveAudit}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold shadow-md shadow-emerald-600/25 flex items-center gap-1.5 transition-all active:scale-95"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Simpan Hasil Audit</span>
              </button>
              <button
                onClick={() => {
                  setIsAuditing(false);
                  if (activeRecord) setAuditItems([...activeRecord.items]);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-200 rounded-full text-xs font-semibold transition-all"
              >
                <X className="w-3.5 h-3.5" />
                <span>Batal</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {feedback && (
        <div className="p-4 rounded-2xl text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Audit Session Selector & Details Card */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-slate-100 dark:border-gray-800 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-gray-800 pb-5 mb-5">
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-xs font-bold text-slate-500 dark:text-gray-400">
              Dokumen Opname:
            </label>
            <select
              value={selectedRecordId}
              onChange={(e) => setSelectedRecordId(e.target.value)}
              disabled={isAuditing}
              className="px-4 py-2 text-xs bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-full text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {records.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.opnameNumber} ({r.date}) — {r.status}
                </option>
              ))}
            </select>

            <button
              onClick={handleCreateNewAudit}
              disabled={isAuditing}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-300 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Buka Audit Baru</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                activeRecord?.status === 'Selesai'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                  : activeRecord?.status === 'Ada Selisih'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                  : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
              }`}
            >
              {activeRecord?.status === 'Selesai' ? (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              )}
              <span>Status: {activeRecord?.status}</span>
            </span>
          </div>
        </div>

        {/* Audit Meta Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50/70 dark:bg-gray-800/40 border border-slate-100 dark:border-gray-800">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 dark:text-gray-500 block">Lokasi Khazanah</span>
              <span className="font-semibold text-slate-800 dark:text-gray-200">
                {activeRecord?.vaultLocation}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50/70 dark:bg-gray-800/40 border border-slate-100 dark:border-gray-800">
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 dark:text-gray-500 block">Auditor / Verifikator</span>
              <span className="font-semibold text-slate-800 dark:text-gray-200">
                {activeRecord?.auditorName} ({activeRecord?.auditorRole})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50/70 dark:bg-gray-800/40 border border-slate-100 dark:border-gray-800">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 dark:text-gray-500 block">Tanggal & Waktu</span>
              <span className="font-semibold text-slate-800 dark:text-gray-200">
                {activeRecord?.date} • {activeRecord?.verifiedAt ? 'Terverifikasi' : 'Dalam Proses'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Metric Tiles - Matching Audime Design */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-slate-100 dark:border-gray-800 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.04)] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 dark:text-gray-500 uppercase tracking-wider block">
              Stok Sistem
            </span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
              {formatGrams(activeRecord?.totalSystemGrams || 0)}
            </div>
            <span className="text-[11px] text-slate-400 dark:text-gray-500">Saldo pembukuan</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Boxes className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-slate-100 dark:border-gray-800 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.04)] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 dark:text-gray-500 uppercase tracking-wider block">
              Fisik Brankas
            </span>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {formatGrams(activeRecord?.totalPhysicalGrams || 0)}
            </div>
            <span className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80">Hasil hitung fisik</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-slate-100 dark:border-gray-800 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.04)] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 dark:text-gray-500 uppercase tracking-wider block">
              Alokasi Akad
            </span>
            <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {formatGrams(activeRecord?.totalAllocatedGrams || 0)}
            </div>
            <span className="text-[11px] text-amber-600/80 dark:text-amber-400/80">Jaminan fidusia</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-slate-100 dark:border-gray-800 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.04)] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 dark:text-gray-500 uppercase tracking-wider block">
              Selisih Fisik
            </span>
            <div
              className={`text-xl sm:text-2xl font-black mt-1 ${
                (activeRecord?.totalDifferenceGrams || 0) === 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {(activeRecord?.totalDifferenceGrams || 0) === 0
                ? '0 Gram'
                : `${activeRecord?.totalDifferenceGrams} Gram`}
            </div>
            <span className="text-[11px] text-slate-400 dark:text-gray-500">
              {(activeRecord?.totalDifferenceGrams || 0) === 0 ? '100% Akurat' : 'Perlu Investigasi'}
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-slate-100 dark:border-gray-800 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-gray-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Rincian Keping Emas Batangan SNI per Pecahan
            </h3>
            <p className="text-xs text-slate-400 dark:text-gray-500 mt-0.5">
              {isAuditing
                ? 'Mode Audit Aktif: Ubah angka di kolom "Fisik Brankas" sesuai hasil hitung fisik di khazanah.'
                : 'Pecahan 10 gram mencakup 1 keping jaminan fidusia akad Ibu Aini (AKAD-REI/2026/08/0010).'}
            </p>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari pecahan / catatan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50/50 dark:bg-gray-800/50 border border-slate-200/80 dark:border-gray-800 rounded-full text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-gray-300">
            <thead className="bg-slate-50/70 dark:bg-gray-800/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-gray-800">
              <tr>
                <th className="py-3.5 px-5">Gramatur</th>
                <th className="py-3.5 px-4">Merek & Standar</th>
                <th className="py-3.5 px-4 text-right">Stok Sistem</th>
                <th className="py-3.5 px-4 text-right bg-indigo-50/30 dark:bg-indigo-950/20">Fisik Brankas</th>
                <th className="py-3.5 px-4 text-right">Alokasi Akad</th>
                <th className="py-3.5 px-4 text-right">Stok Bebas</th>
                <th className="py-3.5 px-4 text-center">Selisih</th>
                <th className="py-3.5 px-5">Catatan Tray Brankas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-gray-800/60">
              {filteredItems.map((item, idx) => {
                const isTenGramCase = item.weightGrams === 10;
                return (
                  <tr
                    key={item.weightGrams}
                    className={`hover:bg-slate-50/60 dark:hover:bg-gray-800/40 transition-colors ${
                      isTenGramCase ? 'bg-amber-50/20 dark:bg-amber-950/10' : ''
                    }`}
                  >
                    {/* Weight */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                          {formatGrams(item.weightGrams)}
                        </span>
                        {isTenGramCase && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                            Fidusia
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Brand */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 dark:text-gray-200">
                        {item.brand}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-gray-500">Kadar 999.9 (24K) SNI</div>
                    </td>

                    {/* System Stock */}
                    <td className="py-3.5 px-4 text-right font-medium">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatNumber(item.systemStockPcs)} pcs
                      </span>
                      <div className="text-[10px] text-slate-400 dark:text-gray-500">
                        {(item.systemStockPcs * item.weightGrams).toLocaleString('id-ID')} g
                      </div>
                    </td>

                    {/* Physical Stock */}
                    <td className="py-3.5 px-4 text-right bg-indigo-50/30 dark:bg-indigo-950/20">
                      {isAuditing ? (
                        <input
                          type="number"
                          min="0"
                          value={item.physicalStockPcs}
                          onChange={(e) => handlePhysicalChange(idx, parseInt(e.target.value) || 0)}
                          className="w-20 px-2.5 py-1 text-right text-xs bg-white dark:bg-gray-800 border-2 border-indigo-500 rounded-xl text-slate-900 dark:text-white font-bold focus:outline-none"
                        />
                      ) : (
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">
                            {formatNumber(item.physicalStockPcs)} pcs
                          </div>
                          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                            {(item.physicalStockPcs * item.weightGrams).toLocaleString('id-ID')} g
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Allocated Installment */}
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                        <Lock className="w-3 h-3" />
                        {item.allocatedInstallmentPcs} pcs
                      </span>
                      <div className="text-[10px] text-slate-400 dark:text-gray-500">
                        {(item.allocatedInstallmentPcs * item.weightGrams).toLocaleString('id-ID')} g
                      </div>
                    </td>

                    {/* Available Stock */}
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        {item.availablePcs} pcs
                      </span>
                      <div className="text-[10px] text-slate-400 dark:text-gray-500">
                        {(item.availablePcs * item.weightGrams).toLocaleString('id-ID')} g
                      </div>
                    </td>

                    {/* Difference */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          item.differencePcs === 0
                            ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'text-rose-700 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}
                      >
                        {item.differencePcs === 0
                          ? '0'
                          : `${item.differencePcs > 0 ? '+' : ''}${item.differencePcs} pcs`}
                      </span>
                    </td>

                    {/* Notes & Tray */}
                    <td className="py-3.5 px-5">
                      <div className="text-slate-600 dark:text-gray-400">{item.notes}</div>
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
