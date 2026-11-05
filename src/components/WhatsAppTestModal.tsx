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
  Radio, 
  Key, 
  Layers, 
  FileCode,
  BookOpen
} from 'lucide-react';
import { 
  checkKirimiDeviceStatus, 
  getKirimiQrCode, 
  sendKirimiTestMessage, 
  formatPhoneForWhatsApp 
} from '../services/kirimiService';
import {
  getQontakConfig,
  saveQontakConfig,
  sendQontakWhatsAppDirect,
} from '../services/qontakService';

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
  const [activeProvider, setActiveProvider] = useState<'qontak' | 'kirimi'>('qontak');
  const [targetPhone, setTargetPhone] = useState(defaultPhone);

  // --- Qontak States ---
  const [qontakToken, setQontakToken] = useState('');
  const [qontakChannelId, setQontakChannelId] = useState('');
  const [qontakTemplateId, setQontakTemplateId] = useState('');
  const [qontakCustomerName, setQontakCustomerName] = useState('Tim IT REI');
  const [isSavingQontak, setIsSavingQontak] = useState(false);
  const [isSendingQontak, setIsSendingQontak] = useState(false);

  // --- Kirimi States ---
  const [messageText, setMessageText] = useState(
    `🔔 *UJI COBA WHATSAPP CRM RAJA EMAS INDONESIA*\n\nYth. Tim IT / Operasional,\nIni adalah pesan uji coba integrasi WhatsApp Gateway dari CRM Kemitraan Raja Emas Indonesia & BPRS Harta Insan Karimah.\n\nWaktu Pengujian: ${new Date().toLocaleString('id-ID')}\nStatus: Sistem Aktif & Siap Digunakan`
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
  const [isSendingKirimi, setIsSendingKirimi] = useState(false);
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);
  const [isLoadingQr, setIsLoadingQr] = useState(false);

  // Common Result State
  const [sendResult, setSendResult] = useState<{
    attempted: boolean;
    success: boolean;
    status: number;
    message: string;
    data?: any;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const cfg = getQontakConfig();
      setQontakToken(cfg.accessToken);
      setQontakChannelId(cfg.channelIntegrationId);
      setQontakTemplateId(cfg.templateIdAkad || cfg.templateIdReminder);

      loadKirimiStatus();
      setSendResult(null);
      setQrCodeBase64(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const loadKirimiStatus = async () => {
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

  const loadKirimiQr = async () => {
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

  const handleSaveQontakSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingQontak(true);
    saveQontakConfig({
      accessToken: qontakToken,
      channelIntegrationId: qontakChannelId,
      templateIdAkad: qontakTemplateId,
    });
    setTimeout(() => {
      setIsSavingQontak(false);
      setSendResult({
        attempted: true,
        success: true,
        status: 200,
        message: 'Kredensial Mekari Qontak berhasil disimpan di browser CRM.',
      });
    }, 400);
  };

  const handleSendQontakTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPhone) return;

    setIsSendingQontak(true);
    setSendResult(null);

    try {
      const result = await sendQontakWhatsAppDirect({
        toNumber: targetPhone,
        toName: qontakCustomerName || 'Nasabah',
        templateId: qontakTemplateId,
        bodyParameters: [
          { key: '1', value: qontakCustomerName || 'Nasabah' },
          { key: '2', value: 'BPRS Harta Insan Karimah' },
          { key: '3', value: 'AKAD-REI/2026/11/0001' },
          { key: '4', value: '10' },
          { key: '5', value: '12' },
          { key: '6', value: '1.850.000' },
          { key: '7', value: '10' },
        ],
      });

      setSendResult({
        attempted: true,
        success: result.success,
        status: result.status,
        message: result.message,
        data: result.data,
      });
    } catch (err: any) {
      setSendResult({
        attempted: true,
        success: false,
        status: 500,
        message: err.message || 'Gagal mengirim pesan via Mekari Qontak',
      });
    } finally {
      setIsSendingQontak(false);
    }
  };

  const handleSendKirimiTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPhone) return;

    setIsSendingKirimi(true);
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
    } catch (err: any) {
      setSendResult({
        attempted: true,
        success: false,
        status: 500,
        message: err.message || 'Gagal mengirim pesan',
      });
    } finally {
      setIsSendingKirimi(false);
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
                WhatsApp Gateway CRM
              </h3>
              <p className="text-xs text-slate-400 dark:text-gray-500">
                Pilih penyedia WhatsApp Business API resmi atau gateway QR
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

        {/* Provider Switcher Tabs */}
        <div className="flex p-1 bg-slate-100 dark:bg-gray-800/80 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setActiveProvider('qontak');
              setSendResult(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeProvider === 'qontak'
                ? 'bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-300 shadow-sm'
                : 'text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Mekari Qontak (Official Meta BSP)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold">
              Disarankan
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveProvider('kirimi');
              setSendResult(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeProvider === 'kirimi'
                ? 'bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-300 shadow-sm'
                : 'text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4 text-amber-500" />
            <span>Kirimi.id (QR Baileys)</span>
          </button>
        </div>

        {/* Result Banner */}
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
                {sendResult.success ? 'Berhasil Terkirim / Tersimpan' : 'Pengiriman Tidak Berhasil'}
              </div>
              <div className="text-[11px] opacity-90 font-normal">
                {sendResult.message}
                {sendResult.data?.code && (
                  <span className="block mt-0.5 font-mono text-[10px] text-rose-700 dark:text-rose-300">
                    Kode Server: {sendResult.data.code}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: MEKARI QONTAK */}
        {activeProvider === 'qontak' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60 text-xs space-y-1.5">
              <div className="font-bold text-indigo-950 dark:text-indigo-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Mekari Qontak: Official WhatsApp Cloud API
                </span>
                <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-300 px-2 py-0.5 rounded-full font-bold">
                  Bebas Banned & Rate Limit
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-gray-300 leading-relaxed">
                Pesan dikirim langsung via server resmi Meta WhatsApp. Memerlukan <strong>Access Token</strong>, <strong>Channel Integration ID</strong>, dan <strong>Approved Template ID</strong> dari dashboard Mekari Qontak.
              </p>
            </div>

            <form onSubmit={handleSaveQontakSettings} className="space-y-3 text-xs p-4 rounded-2xl bg-slate-50 dark:bg-gray-800/40 border border-slate-100 dark:border-gray-800">
              <div className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-500" />
                <span>Pengaturan Kredensial Mekari Qontak:</span>
              </div>

              <div>
                <label className="font-semibold text-slate-600 dark:text-gray-400 block mb-1">
                  Access Token (Bearer):
                </label>
                <input
                  type="password"
                  value={qontakToken}
                  onChange={(e) => setQontakToken(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-slate-900 dark:text-white outline-none font-mono focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600 dark:text-gray-400 block mb-1">
                    Channel Integration ID:
                  </label>
                  <input
                    type="text"
                    value={qontakChannelId}
                    onChange={(e) => setQontakChannelId(e.target.value)}
                    placeholder="Contoh: 41e9bca2-f831-4a11-xxxx"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-slate-900 dark:text-white outline-none font-mono focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 dark:text-gray-400 block mb-1">
                    Template ID (Approved):
                  </label>
                  <input
                    type="text"
                    value={qontakTemplateId}
                    onChange={(e) => setQontakTemplateId(e.target.value)}
                    placeholder="Contoh: 97e68cfb-60f2-45e0-xxxx"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-slate-900 dark:text-white outline-none font-mono focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={isSavingQontak}
                  className="px-4 py-1.5 rounded-full bg-slate-800 hover:bg-slate-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-bold text-xs cursor-pointer transition-colors shadow-sm"
                >
                  {isSavingQontak ? 'Menyimpan...' : 'Simpan Kredensial Qontak'}
                </button>
              </div>
            </form>

            {/* Test Send Form */}
            <form onSubmit={handleSendQontakTest} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600 dark:text-gray-400 block mb-1">
                    Nomor Tujuan Uji Coba:
                  </label>
                  <input
                    type="text"
                    required
                    value={targetPhone}
                    onChange={(e) => setTargetPhone(e.target.value)}
                    placeholder="628151612592"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none font-mono font-bold focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 dark:text-gray-400 block mb-1">
                    Nama Penerima:
                  </label>
                  <input
                    type="text"
                    value={qontakCustomerName}
                    onChange={(e) => setQontakCustomerName(e.target.value)}
                    placeholder="Nama Penerima"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <a
                  href={directWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-300 font-bold text-[11px] flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3 text-emerald-600" />
                  <span>Buka Chat Langsung WA</span>
                </a>

                <button
                  type="submit"
                  disabled={isSendingQontak || !qontakToken}
                  className="px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSendingQontak ? 'Mengirim via Qontak...' : 'Kirim Template via Qontak'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: KIRIMI.ID */}
        {activeProvider === 'kirimi' && (
          <div className="space-y-4">
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
                  type="button"
                  onClick={loadKirimiStatus}
                  disabled={isLoadingStatus}
                  className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-300 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStatus ? 'animate-spin' : ''}`} />
                  <span>Cek Status</span>
                </button>

                {!deviceInfo.isConnected && (
                  <button
                    type="button"
                    onClick={loadKirimiQr}
                    disabled={isLoadingQr}
                    className="px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>{isLoadingQr ? 'Memuat QR...' : 'Tautkan QR'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* QR Code Container */}
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
                  <p>2. Ketuk ikon titik tiga &gt; <strong>Perangkat Tertaut</strong> &gt; <strong>Tautkan Perangkat</strong></p>
                </div>
                <button
                  type="button"
                  onClick={loadKirimiStatus}
                  className="px-4 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Sudah Scan? Perbarui Status</span>
                </button>
              </div>
            )}

            {/* Form Kirimi */}
            <form onSubmit={handleSendKirimiTest} className="space-y-3.5 text-xs">
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
              </div>

              <div>
                <label className="font-semibold text-slate-600 dark:text-gray-400 block mb-1">
                  Isi Pesan WhatsApp:
                </label>
                <textarea
                  rows={4}
                  required
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white outline-none font-sans focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <a
                  href={directWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-300 font-bold text-[11px] flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3 text-emerald-600" />
                  <span>Buka Chat Langsung</span>
                </a>

                <button
                  type="submit"
                  disabled={isSendingKirimi}
                  className="px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSendingKirimi ? 'Mengirim via Kirimi...' : 'Kirim via Kirimi API'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
