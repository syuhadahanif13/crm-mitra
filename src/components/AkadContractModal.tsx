import React from 'react';
import { 
  X, 
  Printer, 
  ShieldCheck, 
  Coins, 
  Calendar, 
  User, 
  Building2, 
  CheckCircle2, 
  MessageCircle
} from 'lucide-react';
import { GoldInstallmentContract } from '../types';
import { formatRupiah, formatGrams } from '../utils/formatters';
import { getWhatsAppDirectUrl } from '../services/crmService';

interface AkadContractModalProps {
  contract: GoldInstallmentContract;
  isOpen: boolean;
  onClose: () => void;
  darkMode?: boolean;
}

export const AkadContractModal: React.FC<AkadContractModalProps> = ({
  contract,
  isOpen,
  onClose,
  darkMode = false,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const waMessage = [
    `Halo ${contract.customerName}, berikut salinan Surat Akad Pembiayaan Cicilan Emas Anda:`,
    `No. Akad: ${contract.contractNumber}`,
    `Emas: ${contract.goldWeightGrams} Gram Logam Mulia SNI 999.9`,
    `Tenor: ${contract.tenorMonths} Bulan`,
    `DP: ${formatRupiah(contract.downPayment)}`,
    `Angsuran: ${formatRupiah(contract.monthlyInstallment)} / bulan (Jatuh tempo tgl ${contract.dueDateDay})`,
    `Emas fisik diamankan di brankas resmi PT EMAS MURNI ASLI hingga lunas. Terima kasih!`
  ].join('\n');

  const waUrl = getWhatsAppDirectUrl({
    phone: contract.customerPhone,
    message: waMessage,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white">
      <div className="relative w-full max-w-4xl bg-white text-gray-900 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[95vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 print:max-w-none print:border-none print:shadow-none">

        {/* Top Action Bar (Hidden in Print) */}
        <div className="p-4 bg-slate-50 border-b border-gray-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 rounded-full shadow-sm flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
              Akad Pembiayaan Murabahah Emas
            </span>
            <span className="text-xs text-gray-700 font-mono font-bold">
              {contract.contractNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
              title="Kirim Salinan Akad ke WhatsApp Nasabah"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kirim ke WA Nasabah</span>
            </a>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-gray-100 text-gray-700 font-semibold text-xs flex items-center gap-1.5 border border-gray-300 shadow-sm transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Dokumen</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 border border-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Contract Document Sheet */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-white text-gray-800 print:p-0 print:text-black">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start pb-6 border-b-2 border-purple-900 gap-4">
            <div className="flex items-center gap-3">
              <img
                src="https://down-id.img.susercontent.com/file/id-11134233-8224r-mgbnv1ee3e2zea"
                alt="PT Emas Murni Asli"
                className="w-14 h-14 rounded-2xl object-cover shadow border border-gray-200"
              />
              <div>
                <h1 className="text-xl font-black text-purple-950 tracking-tight">
                  PT EMAS MURNI ASLI
                </h1>
                <div className="text-xs font-semibold text-amber-600">
                  Konsorsium Pembiayaan Logam Mulia Syariah BPRS x Raja Emas Indonesia
                </div>
                <div className="text-[11px] text-gray-500 mt-1">
                  Ruko Sedayu Square Blok H-08, Jl. Kamal Raya, Jakarta Barat · Izin Dagang: 912030991823
                </div>
              </div>
            </div>

            <div className="sm:text-right">
              <div className="inline-block px-3 py-1 rounded-xl bg-purple-900 text-white font-extrabold text-xs uppercase tracking-wider mb-1.5 shadow-sm">
                SURAT AKAD CICILAN EMAS
              </div>
              <div className="text-xs font-mono font-bold text-gray-900">
                {contract.contractNumber}
              </div>
              <div className="text-[11px] text-gray-600">
                Tanggal Akad: <strong className="text-gray-900">{contract.contractDate}</strong>
              </div>
              <div className="text-[11px] text-emerald-700 font-bold flex items-center justify-end gap-1 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Status: {contract.status}
              </div>
            </div>
          </div>

          {/* Partner & Customer Identity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-5 p-4 rounded-2xl bg-purple-50/50 border border-purple-100 text-xs">
            <div>
              <span className="font-bold text-purple-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 mb-1">
                <Building2 className="w-3.5 h-3.5 text-purple-700" />
                Pihak Pertama (Mitra Penyelenggara):
              </span>
              <div className="text-sm font-black text-gray-900">{contract.partnerName}</div>
              <div className="text-gray-600 mt-0.5">Kategori: <strong>{contract.partnerCategory}</strong></div>
              <div className="text-gray-600">Penyedia Emas: <strong>PT Emas Murni Asli (Raja Emas Indonesia)</strong></div>
              <div className="text-gray-600">Pengawas: <strong>{contract.verifiedBy}</strong></div>
            </div>

            <div>
              <span className="font-bold text-purple-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 mb-1">
                <User className="w-3.5 h-3.5 text-purple-700" />
                Pihak Kedua (Nasabah Penerima Fasilitas):
              </span>
              <div className="text-sm font-black text-gray-900">
                {contract.customerName} ({contract.customerAge} Tahun)
              </div>
              <div className="text-gray-600 mt-0.5">No. Telepon / WhatsApp: <strong>{contract.customerPhone}</strong></div>
              <div className="text-gray-600">Email: {contract.customerEmail}</div>
              <div className="text-gray-600">Jatuh Tempo Bulanan: <strong>Setiap Tanggal {contract.dueDateDay}</strong></div>
            </div>
          </div>

          {/* Spesifikasi Pembiayaan & Perhitungan Finansial */}
          <div className="my-5 p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
            <h3 className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <Coins className="w-4 h-4 text-amber-700" />
              Spesifikasi Fisik Emas & Struktur Finansial Cicilan
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-4">
              <div className="p-3 bg-white rounded-xl border border-amber-200/80 shadow-sm">
                <span className="text-[10px] text-gray-500 block">Gramasi Emas</span>
                <span className="text-base font-black text-amber-700">{formatGrams(contract.goldWeightGrams)}</span>
                <span className="text-[9px] text-gray-500 block mt-0.5">{contract.goldPurity}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-amber-200/80 shadow-sm">
                <span className="text-[10px] text-gray-500 block">Tenor Pembiayaan</span>
                <span className="text-base font-black text-purple-900">{contract.tenorMonths} Bulan</span>
                <span className="text-[9px] text-gray-500 block mt-0.5">({contract.tenorMonths / 12} Tahun)</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-amber-200/80 shadow-sm">
                <span className="text-[10px] text-gray-500 block">Margin Syariah (Bunga)</span>
                <span className="text-base font-black text-emerald-700">{contract.marginRateAnnualPercent}% p.a</span>
                <span className="text-[9px] text-gray-500 block mt-0.5">{formatRupiah(contract.totalMarginAmount)}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-amber-200/80 shadow-sm">
                <span className="text-[10px] text-gray-500 block">Angsuran per Bulan</span>
                <span className="text-base font-black text-purple-950">{formatRupiah(contract.monthlyInstallment)}</span>
                <span className="text-[9px] text-gray-500 block mt-0.5">Tgl {contract.dueDateDay} tiap bulan</span>
              </div>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-amber-200 space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Harga Dasar Logam Mulia ({formatGrams(contract.goldWeightGrams)}):</span>
                <span className="font-bold text-gray-900">{formatRupiah(contract.goldBasePrice)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Margin Keuntungan Pembiayaan Murabahah ({contract.marginRateAnnualPercent}%):</span>
                <span className="font-bold text-gray-900">+{formatRupiah(contract.totalMarginAmount)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Biaya Administrasi & Brankas Safe-Vault:</span>
                <span className="font-bold text-gray-900">+{formatRupiah(contract.adminAndVaultFee)}</span>
              </div>
              <div className="flex justify-between font-bold text-purple-950 pt-1.5 border-t border-gray-100">
                <span>Total Nilai Kontrak Pembiayaan:</span>
                <span>{formatRupiah(contract.totalContractValue)}</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-700">
                <span>Uang Muka (DP) Dibayarkan di Awal:</span>
                <span>-{formatRupiah(contract.downPayment)}</span>
              </div>
              <div className="flex justify-between font-black text-purple-900 pt-1.5 border-t-2 border-purple-200 text-sm">
                <span>Sisa Pokok Pembiayaan yang Diangsur:</span>
                <span>{formatRupiah(contract.financedPrincipal)}</span>
              </div>
            </div>
          </div>

          {/* Status Brankas & Jaminan */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-gray-200 text-xs flex items-center justify-between gap-3 my-4">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-purple-700 shrink-0" />
              <div>
                <div className="font-bold text-gray-900">Status Penyimpanan Jaminan Emas Fisik:</div>
                <div className="text-gray-600 text-[11px]">{contract.goldVaultStatus}</div>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
              SNI 999.9 Terkunci
            </span>
          </div>

          {/* Jadwal Angsuran Bulanan */}
          <div className="my-5">
            <h4 className="text-xs font-black text-purple-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-purple-700" />
              Tabel Jadwal Angsuran & Tanggal Jatuh Tempo
            </h4>
            <div className="overflow-x-auto rounded-2xl border border-gray-200 overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-purple-900 text-white font-bold text-[11px]">
                    <th className="py-2 px-3 text-center">Bulan Ke</th>
                    <th className="py-2 px-3">Tanggal Jatuh Tempo</th>
                    <th className="py-2 px-3 text-right">Pokok</th>
                    <th className="py-2 px-3 text-right">Margin</th>
                    <th className="py-2 px-3 text-right">Total Angsuran</th>
                    <th className="py-2 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-[11px]">
                  {contract.schedule.map((item) => (
                    <tr key={item.installmentNumber} className={item.status === 'Jatuh Tempo' ? 'bg-amber-50/80 font-bold' : ''}>
                      <td className="py-2 px-3 text-center font-bold text-gray-600">
                        Ke-{item.installmentNumber}
                      </td>
                      <td className="py-2 px-3 font-semibold text-gray-900">
                        {item.dueDate}
                        {item.dueDate.includes('10-10') && (
                          <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] bg-amber-200 text-amber-900">
                            Jatuh Tempo 10 Okt
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right text-gray-600">{formatRupiah(item.principalAmount)}</td>
                      <td className="py-2 px-3 text-right text-gray-600">{formatRupiah(item.marginAmount)}</td>
                      <td className="py-2 px-3 text-right font-bold text-purple-950">{formatRupiah(item.amount)}</td>
                      <td className="py-2 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            item.status === 'Lunas'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : item.status === 'Jatuh Tempo'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-gray-100 text-gray-600 border border-gray-200'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tanda Tangan Akad */}
          <div className="grid grid-cols-2 gap-8 pt-8 mt-6 border-t border-gray-200 text-center text-xs">
            <div>
              <div className="text-gray-500 mb-14">Pihak Pertama (Mitra & Khazanah Emas)</div>
              <div className="font-black text-gray-900">{contract.partnerName}</div>
              <div className="text-[10px] text-gray-500">PT EMAS MURNI ASLI Pusat</div>
            </div>
            <div>
              <div className="text-gray-500 mb-14">Pihak Kedua (Nasabah Pemohon)</div>
              <div className="font-black text-gray-900">{contract.customerName}</div>
              <div className="text-[10px] text-gray-500">NIK: Terverifikasi di Sistem CRM</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
