/**
 * Kirimi.id WhatsApp API Service
 * Menangani pengiriman notifikasi akad pembiayaan emas dan pengingat jatuh tempo
 * User Code: KMXZRL1126
 * Secret Key: 0344a651a64d16194ec78d979157c9f2e24e173af6927eaec9587437aa0acffa
 */

const KIRIMI_USER_CODE =
  (import.meta as any).env?.VITE_KIRIMI_USER_CODE || 'KMXZRL1126';
const KIRIMI_SECRET_KEY =
  (import.meta as any).env?.VITE_KIRIMI_SECRET_KEY ||
  '0344a651a64d16194ec78d979157c9f2e24e173af6927eaec9587437aa0acffa';
const DEFAULT_DEVICE_ID =
  (import.meta as any).env?.VITE_KIRIMI_DEVICE_ID || 'D-TRJ97';
const KIRIMI_API_URL =
  (import.meta as any).env?.VITE_KIRIMI_API_URL || 'https://api.kirimi.id/v1/send-message';

// Nomor tujuan notifikasi internal REI & BPRS
export const WHATSAPP_TARGETS: string[] = [
  (import.meta as any).env?.VITE_ADMIN_WA_MARKETING || '6281802180003', // Marketing REI
  (import.meta as any).env?.VITE_ADMIN_WA_IT || '628151612592',         // IT REI
];

let activeDeviceId: string | null = null;

/**
 * Format nomor telepon Indonesia ke standar internasional (628xxx)
 */
export function formatPhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.startsWith('0')) {
    return '62' + digits.substring(1);
  }
  if (digits.startsWith('62')) {
    return digits;
  }
  return '62' + digits;
}

/**
 * Mengambil device_id yang aktif dan terhubung dari akun Kirimi
 */
export async function getActiveDeviceId(): Promise<string> {
  if (activeDeviceId) return activeDeviceId;

  try {
    const res = await fetch('https://api.kirimi.id/v1/list-devices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_code: KIRIMI_USER_CODE,
        secret: KIRIMI_SECRET_KEY,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data?.devices?.length > 0) {
        // Cari device yang connected
        const connected = data.data.devices.find(
          (d: any) => d.status === 'connected' || d.is_connected === true
        );
        if (connected) {
          activeDeviceId = connected.device_id;
          return connected.device_id;
        }
        activeDeviceId = data.data.devices[0].device_id;
        return activeDeviceId!;
      }
    }
  } catch (err) {
    console.warn('Kirimi getActiveDeviceId warning:', err);
  }

  activeDeviceId = DEFAULT_DEVICE_ID;
  return DEFAULT_DEVICE_ID;
}

/**
 * Mengirim pesan WhatsApp via Kirimi.id API
 */
export async function sendWhatsAppMessage(target: string, message: string): Promise<boolean> {
  const receiver = formatPhoneForWhatsApp(target);

  try {
    const deviceId = await getActiveDeviceId();

    const payload = {
      user_code: KIRIMI_USER_CODE,
      secret: KIRIMI_SECRET_KEY,
      device_id: deviceId,
      receiver,
      message,
    };

    const response = await fetch(KIRIMI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => null);

    if (response.ok && data?.success) {
      console.log('Kirimi WhatsApp sent successfully to:', receiver, data);
      return true;
    }

    // Jika device lama disconnect, coba refresh device list sekali lagi
    if (data?.message?.toLowerCase().includes('device') || !response.ok) {
      activeDeviceId = null;
      const newDeviceId = await getActiveDeviceId();
      if (newDeviceId && newDeviceId !== deviceId) {
        payload.device_id = newDeviceId;
        const retryRes = await fetch(KIRIMI_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const retryData = await retryRes.json().catch(() => null);
        if (retryRes.ok && retryData?.success) {
          return true;
        }
      }
    }

    console.warn('Kirimi API response:', response.status, data);
    return false;
  } catch (error) {
    console.error('Error sending WhatsApp message via Kirimi:', error);
    return false;
  }
}

/**
 * Cek status device Kirimi saat ini
 */
export async function checkKirimiDeviceStatus(): Promise<{
  success: boolean;
  status: string;
  isConnected: boolean;
  deviceId: string;
  waNumber?: string;
  message: string;
}> {
  try {
    const res = await fetch('https://api.kirimi.id/v1/list-devices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_code: KIRIMI_USER_CODE,
        secret: KIRIMI_SECRET_KEY,
      }),
    });
    const data = await res.json().catch(() => null);

    if (data?.success && data.data?.devices?.length > 0) {
      const dev = data.data.devices[0];
      const isConn = dev.status === 'connected' || dev.is_connected === true;
      activeDeviceId = dev.device_id;
      return {
        success: true,
        status: dev.status || 'unknown',
        isConnected: isConn,
        deviceId: dev.device_id,
        waNumber: dev.wa_number,
        message: data.message || 'Status device berhasil diambil',
      };
    }

    return {
      success: false,
      status: 'not_found',
      isConnected: false,
      deviceId: DEFAULT_DEVICE_ID,
      message: data?.message || 'Device tidak ditemukan',
    };
  } catch (err: any) {
    return {
      success: false,
      status: 'error',
      isConnected: false,
      deviceId: DEFAULT_DEVICE_ID,
      message: err.message || 'Gagal menghubungi server Kirimi.id',
    };
  }
}

/**
 * Mengambil QR code pairing dari Kirimi
 */
export async function getKirimiQrCode(): Promise<{
  success: boolean;
  qrBase64?: string;
  status?: string;
  message: string;
}> {
  try {
    const res = await fetch('https://api.kirimi.id/v1/connect-device', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_code: KIRIMI_USER_CODE,
        secret: KIRIMI_SECRET_KEY,
        device_id: activeDeviceId || DEFAULT_DEVICE_ID,
      }),
    });
    const data = await res.json().catch(() => null);

    if (data?.success && data.data?.qr_code?.qrBase64) {
      return {
        success: true,
        qrBase64: data.data.qr_code.qrBase64,
        status: data.data.status,
        message: data.data.message || 'QR code berhasil dibuat',
      };
    }

    return {
      success: false,
      message: data?.message || 'Gagal membuat QR code dari Kirimi',
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Gagal memuat QR code',
    };
  }
}

/**
 * Kirim pesan uji coba lengkap dengan respons status
 */
export async function sendKirimiTestMessage(
  target: string,
  message: string
): Promise<{
  success: boolean;
  status: number;
  message: string;
  data?: any;
}> {
  const receiver = formatPhoneForWhatsApp(target);

  try {
    const deviceId = await getActiveDeviceId();

    const payload = {
      user_code: KIRIMI_USER_CODE,
      secret: KIRIMI_SECRET_KEY,
      device_id: deviceId,
      receiver,
      message,
    };

    const response = await fetch(KIRIMI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => null);

    return {
      success: response.ok && data?.success,
      status: response.status,
      message: data?.message || (response.ok ? 'Pesan terkirim' : 'Gagal mengirim pesan'),
      data,
    };
  } catch (err: any) {
    return {
      success: false,
      status: 500,
      message: err.message || 'Terjadi kesalahan jaringan',
    };
  }
}
