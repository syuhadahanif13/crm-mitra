import React, { useState, useEffect } from 'react';
import { 
  X, 
  MessageCircle, 
  Send, 
  RefreshCw, 
  QrCode, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink,
  Smartphone,
  ShieldCheck,
  Radio
} from 'lucide-react';
import { 
  checkKirimiDeviceStatus, 
  getKirimiQrCode, 
  sendKirimiTestMessage,
  formatPhoneForWhatsApp 
} from '../services/kirimiService';

interface WhatsAppTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPhone?: string;
}

export const WhatsAppTestModal: React.FC<WhatsAppTestModalProps> = ({
  isOpen,
  onClose,
  defaultPhone = '628151612592',
}) => {
  const [targetPhone, setTargetPhone] = useState(defaultPhone);
  const [messageText, setMessageText] = useState(
    `🔔 *UJI COBA WHATSAPP CRM RAJA EMAS INDONESIA*\n\nYth. Tim IT / Operasional,\nIni adalah pesan uji coba integrasi WhatsApp Gateway (Kirimi.id) dari CRM Kemitraan Raja Emas Indonesia & BPRS Harta Insan Karimah.\n\nWaktu Pengujian: ${new Date().toLocaleString('id-ID')}\nGateway Provider: Kirimi.id API\nDevice ID: D-TRJ97\nStatus: Sistem Aktif & Siap Digunakan`
  );

  const [deviceInfo, setDeviceInfo] = useState<{
    status: string;
    isConnected: boolean;
    deviceId: string;
    waNumber?: string;
  }>({
    status: 'checking',
    isConnected: false,
    deviceId: 'D-TRJ97',
    waNumber: '6287775904478',
  });

  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);
  const [isLoadingQr, setIsLoadingQr] = useState(false);
  const [sendResult, setSendResult] = useState<{
    attempted: boolean;
    success: boolean;
    status: number;
    message: string;
    data?: any;
  } | null>(null);

  const loadStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const res = await checkKirimiDeviceStatus();
      setDeviceInfo({
        status: res.status,
        isConnected: res.isConnected,
        deviceId: res.deviceId,
        waNumber: res.waNumber || '6287775904478',
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const loadQrCode = async () => {
    setIsLoadingQr(true);
    setSendResult(null);
    try {
      const res = await getKirimiQrCode();
      if (res.success && res.qrBase64) {
        setQrCodeBase64(res.qrBase64);
        setDeviceInfo((prev) => ({ ...prev, status: 'connecting' }));
      } else {
        alert(res.message || 'Gagal memuat QR code');
      }
    } catch (err: any) {
      alert('Error saat memuat QR: ' + err.message);
    } finally {
      setIsLoadingQr(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadStatus();
      setSendResult(null);
      setQrCodeBase64(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPhone) return;

    setIsSending(true);
    setSendResult(null);

    try {
      const result = await sendKirimiTestMessage(targetPhone, messageText);
      setSendResult({
        attempted: true,
        success: result.success,
        status: result.status,
        message: result.message,
        data: result.data,
      });

      // Jika pesan gagal karena device belum connect, otomatis tawarkan QR
      if (!result.success && result.message?.toLowerCase().includes('connect')) {
        loadStatus();
      }
    } catch (err: any) {
      setSendResult({
        attempted: true,
        success: false,
        status: 500,
        message: err.message || 'Gagal mengirim pesan',
      });
    } finally {
      setIsSending(false);
    }
  };

  const directWhatsAppUrl = `https://wa.me/${formatPhoneForWhatsApp(targetPhone)}?text=${encodeURIComponent(messageText)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-900 dark:text-white space-y-5 animate-in zoom-in-95 duration-200 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                Uji Coba WhatsApp Gateway
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  Kirimi.id API
                </span>
              </h3>
              <p className="text-xs text-slate-400 dark:text-gray-500">
                Layanan pengiriman otomatis akad pembiayaan & pengingat jatuh tempo nasabah
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Device Status Banner */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-gray-800/40 border border-slate-100 dark:border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-slate-500" />
              <span className="font-bold text-slate-900 dark:text-white">
                Device ID: <span className="font-mono text-indigo-600 dark:text-indigo-400">{deviceInfo.deviceId}</span>
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                  deviceInfo.isConnected
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : deviceInfo.status === 'connecting'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                }`}
              >
                <Radio className="w-2.5 h-2.5 animate-pulse" />
                <span>
                  {deviceInfo.isConnected
                    ? 'Terhubung (Online)'
                    : deviceInfo.status === 'connecting'
                    ? 'Menunggu Scan QR'
                    : 'Belum Terhubung'}
                </span>
              </span>
            </div>
            <div className="text-[11px] text-slate-400 dark:text-gray-500 flex items-center gap-2">
              <span>Nomor Pengirim: <strong>+{deviceInfo.waNumber}</strong></span>
              <span>•</span>
              <span>User Code: <strong className="font-mono">KMXZRL1126</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={loadStatus}
              disabled={isLoadingStatus}
              className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-300 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStatus ? 'animate-spin' : ''}`} />
              <span>Cek Status</span>
            </button>

            {!deviceInfo.isConnected && (
              <button
                onClick={loadQrCode}
                disabled={isLoadingQr}
                className="px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-all shadow-sm"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>{isLoadingQr ? 'Memuat QR...' : 'Tautkan QR'}</span>
              </button>
            )}
          </div>
        </div>

        {/* QR Code Container if requested */}
        {qrCodeBase64 && !deviceInfo.isConnected && (
          <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 text-center space-y-3 animate-in fade-in">
            <div className="font-bold text-xs text-indigo-950 dark:text-indigo-200">
              Scan QR Code ini menggunakan aplikasi WhatsApp di HP Anda
            </div>
            <div className="inline-block p-3 bg-white rounded-2xl shadow-md border border-slate-200">
              <img src={qrCodeBase64} alt="Kirimi WhatsApp QR Code" className="w-48 h-48 mx-auto" />
            </div>
            <div className="text-[11px] text-slate-500 dark:text-gray-400 space-y-0.5">
              <p>1. Buka <strong>WhatsApp</strong> di HP pengirim (<strong>+{deviceInfo.waNumber}</strong>)</p>
              <p>2. Ketuk ikon titik tiga (Android) atau Pengaturan (iPhone) &gt; <strong>Perangkat Tertaut</strong></p>
              <p>3. Pilih <strong>Tautkan Perangkat</strong> lalu arahkan kamera ke QR di atas</p>
            </div>
            <button
              onClick={loadStatus}
              className="px-4 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Sudah Scan? Perbarui Status</span>
            </button>
          </div>
        )}

        {/* Response Notification Alert */}
        {sendResult && (
          <div
            className={`p-4 rounded-2xl border text-xs font-semibold flex items-start gap-3 animate-in fade-in ${
              sendResult.success
                ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
            }`}
          >
            {sendResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1 flex-1">
              <div className="font-bold">
                {sendResult.success
                  ? 'Berhasil Mengirim Pesan WhatsApp!'
                  : `Gagal Mengirim: ${sendResult.message}`}
              </div>
              <div className="text-[11px] opacity-90 font-normal">
                {sendResult.success ? (
                  <span>Pesan terkirim via Kirimi API ke <strong>{targetPhone}</strong>. Silakan periksa WhatsApp penerima.</span>
                ) : (
                  <span>
                    Server Kirimi merespons status <strong>{sendResult.status}</strong>. Device WhatsApp belum terhubung ke sesi aktif. Silakan klik tombol <strong>Tautkan QR</strong> di atas untuk menghubungkan WhatsApp.
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Form Pengiriman Pesan */}
        <form onSubmit={handleSendTest} className="space-y-3.5 text-xs">
          <div>
            <label className="font-semibold text-slate-600 dark:text-gray-400 block mb-1">
              Nomor WhatsApp Tujuan:
            </label>
            <input
              type="text"
              required
              value={targetPhone}
              onChange={(e) => setTargetPhone(e.target.value)}
              placeholder="Contoh: 628151612592"
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none font-mono font-bold focus:ring-2 focus:ring-indigo-500/20"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Format internasional diawali dengan 628... (Target IT REI: 628151612592)
            </span>
          </div>

          <div>
            <label className="font-semibold text-slate-600 dark:text-gray-400 block mb-1">
              Isi Pesan WhatsApp:
            </label>
            <textarea
              rows={5}
              required
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none font-sans focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-gray-800">
            <a
              href={directWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-200 dark:border-gray-700"
              title="Kirim pesan langsung via WhatsApp Web atau aplikasi WA"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
              <span>Buka Chat Langsung (Direct Link)</span>
            </a>

            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 font-semibold cursor-pointer transition-colors"
              >
                Tutup
              </button>

              <button
                type="submit"
                disabled={isSending}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSending ? 'Mengirim via Kirimi...' : 'Kirim Test WhatsApp (API)'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
