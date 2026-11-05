/**
 * Mekari Qontak WhatsApp Business API Service (Official Meta BSP)
 * Dokumentasi: https://documenter.getpostman.com/view/10507272/SzYW2L6h
 */

export interface QontakParameter {
  key: string;
  value_text: string;
  value: string;
}

export interface QontakBroadcastPayload {
  to_number: string;
  to_name: string;
  message_template_id: string;
  channel_integration_id: string;
  language: {
    code: string; // e.g. "id"
  };
  parameters: {
    body: QontakParameter[];
  };
}

export interface QontakConfig {
  baseUrl: string;
  accessToken: string;
  channelIntegrationId: string;
  templateIdAkad: string;
  templateIdReminder: string;
}

// Load config from environment or localStorage
export function getQontakConfig(): QontakConfig {
  return {
    baseUrl:
      (import.meta as any).env?.VITE_QONTAK_BASE_URL ||
      localStorage.getItem('qontak_base_url') ||
      'https://service-chat.qontak.com/api/open/v1',
    accessToken:
      (import.meta as any).env?.VITE_QONTAK_ACCESS_TOKEN ||
      localStorage.getItem('qontak_access_token') ||
      '',
    channelIntegrationId:
      (import.meta as any).env?.VITE_QONTAK_CHANNEL_ID ||
      localStorage.getItem('qontak_channel_id') ||
      '',
    templateIdAkad:
      (import.meta as any).env?.VITE_QONTAK_TEMPLATE_ID_AKAD ||
      localStorage.getItem('qontak_template_akad') ||
      '',
    templateIdReminder:
      (import.meta as any).env?.VITE_QONTAK_TEMPLATE_ID_REMINDER ||
      localStorage.getItem('qontak_template_reminder') ||
      '',
  };
}

export function saveQontakConfig(config: Partial<QontakConfig>) {
  if (config.baseUrl) localStorage.setItem('qontak_base_url', config.baseUrl);
  if (config.accessToken) localStorage.setItem('qontak_access_token', config.accessToken);
  if (config.channelIntegrationId)
    localStorage.setItem('qontak_channel_id', config.channelIntegrationId);
  if (config.templateIdAkad) localStorage.setItem('qontak_template_akad', config.templateIdAkad);
  if (config.templateIdReminder)
    localStorage.setItem('qontak_template_reminder', config.templateIdReminder);
}

/**
 * Format nomor HP ke 628xxx
 */
export function formatPhoneForQontak(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.startsWith('0')) return '62' + digits.substring(1);
  if (digits.startsWith('62')) return digits;
  return '62' + digits;
}

/**
 * Kirim WhatsApp Template via Mekari Qontak Official API
 */
export async function sendQontakWhatsAppDirect(payload: {
  toNumber: string;
  toName: string;
  templateId: string;
  bodyParameters: { key: string; value: string }[];
}): Promise<{
  success: boolean;
  status: number;
  message: string;
  data?: any;
}> {
  const config = getQontakConfig();

  if (!config.accessToken) {
    return {
      success: false,
      status: 401,
      message: 'Mekari Qontak Access Token belum diatur.',
    };
  }

  const endpoint = `${config.baseUrl}/broadcasts/whatsapp/direct`;

  const requestBody: QontakBroadcastPayload = {
    to_number: formatPhoneForQontak(payload.toNumber),
    to_name: payload.toName || 'Nasabah',
    message_template_id: payload.templateId || config.templateIdAkad,
    channel_integration_id: config.channelIntegrationId,
    language: {
      code: 'id',
    },
    parameters: {
      body: payload.bodyParameters.map((p) => ({
        key: p.key,
        value_text: p.value,
        value: p.value.toLowerCase().replace(/[^a-z0-9_]/g, '_').substring(0, 30),
      })),
    },
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.accessToken}`,
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json().catch(() => null);

    return {
      success: response.ok && (data?.status === 'success' || data?.data?.id),
      status: response.status,
      message: data?.message || (response.ok ? 'Pesan berhasil dikirim via Mekari Qontak' : 'Gagal mengirim pesan'),
      data,
    };
  } catch (err: any) {
    return {
      success: false,
      status: 500,
      message: err.message || 'Gagal menghubungi server Mekari Qontak',
    };
  }
}
