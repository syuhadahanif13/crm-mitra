const FONNTE_TOKEN = 'gkmNVWdLWCfuwXMZFqzN';
const FONNTE_API_URL = 'https://api.fonnte.com/send';

// Nomor tujuan notifikasi internal REI & BPRS
export const WHATSAPP_TARGETS: string[] = [
  '6281802180003', // Aini Marketing REI
  '628151612592',  // Hanif IT
];

export async function sendWhatsAppMessage(target: string, message: string): Promise<boolean> {
  try {
    const form = new FormData();
    form.append('target', target);
    form.append('message', message);
    form.append('countryCode', '62');

    const response = await fetch(FONNTE_API_URL, {
      method: 'POST',
      headers: {
        Authorization: FONNTE_TOKEN,
      },
      body: form,
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Fonnte send failed:', response.status, text);
      return false;
    }

    const data = await response.json();
    if (data.status === true || data.status === 'true') {
      return true;
    }
    console.error('Fonnte response error:', data);
    return false;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return false;
  }
}
