import { 
  CustomerProfile, 
  GoldInstallmentContract, 
  InstallmentScheduleItem, 
  StockOpnameRecord, 
  CrmNotification,
  CrmBrandConfig,
  MitraDashboardTransaction 
} from '../types';
import { INITIAL_CUSTOMERS, INITIAL_CONTRACTS, INITIAL_STOCK_OPNAME_RECORDS, INITIAL_CRM_NOTIFICATIONS } from '../data/mockCrmData';
import { sendWhatsAppMessage, WHATSAPP_TARGETS } from './fonnteService';

const STORAGE_KEYS = {
  CUSTOMERS: 'crm_standalone_customers_v1',
  CONTRACTS: 'crm_standalone_contracts_v1',
  STOCK_OPNAME: 'crm_standalone_stock_opname_v1',
  NOTIFICATIONS: 'crm_standalone_notifications_v1',
  BRAND_CONFIG: 'crm_custom_branding_v1',
  IMPORTED_TRANSACTIONS: 'crm_imported_mitra_transactions_v1',
};

export const DEFAULT_BRAND_CONFIG: CrmBrandConfig = {
  brandName: 'Raja Emas CRM',
  tagline: 'Sistem Pembiayaan & Cicilan Emas',
  logoType: 'preset',
  presetIcon: 'gold-ring',
  accentTheme: 'purple-indigo',
};

export const INITIAL_MITRA_TRANSACTIONS: MitraDashboardTransaction[] = [
  {
    id: 'trx-mitra-001',
    invoiceNumber: 'INV-REI/2026/10/0042',
    date: '2026-10-01',
    partnerId: 'partner-bprs-himbarsi-01',
    partnerName: 'BPRS Harta Insan Karimah (HIK)',
    partnerCategory: 'BPRS',
    customerName: 'Ibu Aini',
    customerPhone: '081298765432',
    customerAddress: 'Jl. Melati No. 42, RT 03/RW 05, Kebayoran Baru, Jakarta Selatan',
    goldWeightGrams: 10,
    totalPrice: 25625000,
    paymentMethod: 'Pembiayaan Akad Cicilan 1 Tahun',
    status: 'Completed',
    source: 'Dasbor Mitra Raja Emas',
  },
  {
    id: 'trx-mitra-002',
    invoiceNumber: 'INV-REI/2026/09/0088',
    date: '2026-09-25',
    partnerId: 'partner-bprs-himbarsi-01',
    partnerName: 'BPRS Harta Insan Karimah (HIK)',
    partnerCategory: 'BPRS',
    customerName: 'Bpk. Bambang Pamungkas',
    customerPhone: '081288991234',
    customerAddress: 'Jl. Mawar No. 15, Menteng, Jakarta Pusat',
    goldWeightGrams: 5,
    totalPrice: 12877500,
    paymentMethod: 'Pembiayaan Akad Cicilan 6 Bulan',
    status: 'Completed',
    source: 'Dasbor Mitra Raja Emas',
  },
  {
    id: 'trx-mitra-003',
    invoiceNumber: 'INV-REI/2026/10/0105',
    date: '2026-10-02',
    partnerId: 'partner-bank-dki-syariah',
    partnerName: 'Bank DKI Unit Usaha Syariah',
    partnerCategory: 'Bank',
    customerName: 'Ibu Siti Khodijah',
    customerPhone: '081377889900',
    customerAddress: 'Jl. Anggrek No. 8, Cilandak, Jakarta Selatan',
    goldWeightGrams: 25,
    totalPrice: 63937500,
    paymentMethod: 'Pembiayaan Akad Cicilan 2 Tahun',
    status: 'Completed',
    source: 'Dasbor Mitra Raja Emas',
  },
  {
    id: 'trx-mitra-004',
    invoiceNumber: 'INV-REI/2026/10/0112',
    date: '2026-10-03',
    partnerId: 'partner-kop-syariah-212',
    partnerName: 'Koperasi Syariah 212',
    partnerCategory: 'Koperasi Syariah',
    customerName: 'Bpk. Hendra Wijaya',
    customerPhone: '081122334455',
    customerAddress: 'Jl. Dahlia No. 12, Kelapa Gading, Jakarta Utara',
    goldWeightGrams: 2,
    totalPrice: 5171000,
    paymentMethod: 'Transfer Virtual Account BSI',
    status: 'Completed',
    source: 'Dasbor Mitra Raja Emas',
  },
];

export const loadCrmBrandConfig = (): CrmBrandConfig => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BRAND_CONFIG);
    if (!raw) return DEFAULT_BRAND_CONFIG;
    return { ...DEFAULT_BRAND_CONFIG, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_BRAND_CONFIG;
  }
};

export const saveCrmBrandConfig = (config: CrmBrandConfig): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.BRAND_CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save CRM brand config:', e);
  }
};

export const loadMitraImportedTransactions = (): MitraDashboardTransaction[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.IMPORTED_TRANSACTIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.IMPORTED_TRANSACTIONS, JSON.stringify(INITIAL_MITRA_TRANSACTIONS));
      return INITIAL_MITRA_TRANSACTIONS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_MITRA_TRANSACTIONS;
  }
};

export const saveMitraImportedTransactions = (trxs: MitraDashboardTransaction[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.IMPORTED_TRANSACTIONS, JSON.stringify(trxs));
  } catch (e) {
    console.error('Failed to save imported mitra transactions:', e);
  }
};


// ─────────────────────────────────────────────────────────────
// LOCAL STORAGE PERSISTENCE
// ─────────────────────────────────────────────────────────────
export const loadCrmCustomers = (): CustomerProfile[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
      return INITIAL_CUSTOMERS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load CRM customers from storage:', e);
    return INITIAL_CUSTOMERS;
  }
};

export const saveCrmCustomers = (customers: CustomerProfile[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  } catch (e) {
    console.error('Failed to save CRM customers to storage:', e);
  }
};

export const loadCrmContracts = (): GoldInstallmentContract[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONTRACTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(INITIAL_CONTRACTS));
      return INITIAL_CONTRACTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load CRM contracts from storage:', e);
    return INITIAL_CONTRACTS;
  }
};

export const saveCrmContracts = (contracts: GoldInstallmentContract[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(contracts));
  } catch (e) {
    console.error('Failed to save CRM contracts to storage:', e);
  }
};

export const loadCrmStockOpnames = (): StockOpnameRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STOCK_OPNAME);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.STOCK_OPNAME, JSON.stringify(INITIAL_STOCK_OPNAME_RECORDS));
      return INITIAL_STOCK_OPNAME_RECORDS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load stock opname records:', e);
    return INITIAL_STOCK_OPNAME_RECORDS;
  }
};

export const saveCrmStockOpnames = (records: StockOpnameRecord[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.STOCK_OPNAME, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save stock opname records:', e);
  }
};

export const loadCrmNotifications = (): CrmNotification[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_CRM_NOTIFICATIONS));
      return INITIAL_CRM_NOTIFICATIONS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load CRM notifications:', e);
    return INITIAL_CRM_NOTIFICATIONS;
  }
};

export const saveCrmNotifications = (notifs: CrmNotification[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  } catch (e) {
    console.error('Failed to save CRM notifications:', e);
  }
};

// ─────────────────────────────────────────────────────────────
// KALKULATOR SIMULASI AKAD CICILAN EMAS
// ─────────────────────────────────────────────────────────────
export interface InstallmentSimulationInput {
  goldWeightGrams: number;
  goldBasePrice: number;
  tenorMonths: number;
  downPaymentPercent: number; // misal: 20%
  customDownPayment?: number;
  marginRateAnnualPercent: number; // misal: 6% per tahun
  adminAndVaultFee?: number;
}

export interface InstallmentSimulationResult {
  goldBasePrice: number;
  totalMarginAmount: number;
  adminAndVaultFee: number;
  totalContractValue: number;
  downPayment: number;
  financedPrincipal: number;
  monthlyInstallment: number;
  schedule: Array<{
    month: number;
    amount: number;
    principal: number;
    margin: number;
  }>;
}

export const calculateInstallmentSimulation = (
  input: InstallmentSimulationInput
): InstallmentSimulationResult => {
  const {
    goldBasePrice,
    tenorMonths,
    downPaymentPercent,
    customDownPayment,
    marginRateAnnualPercent,
    adminAndVaultFee = 150000,
  } = input;

  const tenorYears = tenorMonths / 12;
  const totalMarginAmount = Math.round(goldBasePrice * (marginRateAnnualPercent / 100) * tenorYears);
  const totalContractValue = goldBasePrice + totalMarginAmount + adminAndVaultFee;

  const defaultDp = Math.round(totalContractValue * (downPaymentPercent / 100));
  const downPayment = customDownPayment !== undefined && customDownPayment > 0 ? customDownPayment : defaultDp;

  const financedPrincipal = Math.max(0, totalContractValue - downPayment);
  const monthlyInstallment = tenorMonths > 0 ? Math.round(financedPrincipal / tenorMonths) : 0;

  const schedule = [];
  const principalPerMonth = Math.round((goldBasePrice - (downPayment - adminAndVaultFee)) / tenorMonths);
  const marginPerMonth = Math.round(totalMarginAmount / tenorMonths);

  for (let i = 1; i <= tenorMonths; i++) {
    schedule.push({
      month: i,
      amount: monthlyInstallment,
      principal: principalPerMonth,
      margin: marginPerMonth,
    });
  }

  return {
    goldBasePrice,
    totalMarginAmount,
    adminAndVaultFee,
    totalContractValue,
    downPayment,
    financedPrincipal,
    monthlyInstallment,
    schedule,
  };
};

export const generateContractSchedule = (
  startDate: string,
  tenorMonths: number,
  monthlyInstallment: number,
  dueDateDay: number = 10,
  principalPerMonth: number = 0,
  marginPerMonth: number = 0
): InstallmentScheduleItem[] => {
  const items: InstallmentScheduleItem[] = [];
  const start = new Date(startDate);

  for (let i = 1; i <= tenorMonths; i++) {
    const d = new Date(start.getFullYear(), start.getMonth() + (i - 1), dueDateDay);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const dueDateStr = `${yyyy}-${mm}-${dd}`;

    items.push({
      installmentNumber: i,
      dueDate: dueDateStr,
      amount: monthlyInstallment,
      principalAmount: principalPerMonth || Math.round(monthlyInstallment * 0.9),
      marginAmount: marginPerMonth || Math.round(monthlyInstallment * 0.1),
      status: 'Mendatang',
      reminderSent: false,
    });
  }
  return items;
};

// ─────────────────────────────────────────────────────────────
// WHATSAPP AUTOMATION & NOTIFIKASI
// ─────────────────────────────────────────────────────────────
export const formatPhoneTo62 = (phone: string): string => {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  } else if (!cleaned.startsWith('62')) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
};

export const sendAkadWhatsAppNotification = async (
  contract: GoldInstallmentContract
): Promise<{ success: boolean; message: string }> => {
  const targetPhone = formatPhoneTo62(contract.customerPhone);
  const lines = [
    '*PEMBERITAHUAN AKAD PEMBIAYAAN EMAS*',
    'PT EMAS MURNI ASLI x RAJA EMAS INDONESIA',
    '------------------------------------------------',
    `*Nomor Akad:* ${contract.contractNumber}`,
    `*Nama Nasabah:* ${contract.customerName} (${contract.customerAge} th)`,
    `*Mitra:* ${contract.partnerName} (${contract.partnerCategory})`,
    '',
    `*Spesifikasi Emas:* ${contract.goldWeightGrams} Gram Logam Mulia SNI 999.9`,
    `*Tenor Pembiayaan:* ${contract.tenorMonths} Bulan`,
    `*Uang Muka (DP):* Rp ${contract.downPayment.toLocaleString('id-ID')}`,
    `*Margin Syariah:* Rp ${contract.totalMarginAmount.toLocaleString('id-ID')} (${contract.marginRateAnnualPercent}% p.a)`,
    `*Angsuran per Bulan:* Rp ${contract.monthlyInstallment.toLocaleString('id-ID')}`,
    `*Tanggal Jatuh Tempo:* Setiap Tanggal ${contract.dueDateDay} per bulan`,
    '',
    `*Jaminan Brankas:* Emas fisik ${contract.goldWeightGrams}g disimpan di Khazanah Brankas Konsorsium & diserahkan saat pelunasan.`,
    '------------------------------------------------',
    'Transaksi akad pembiayaan emas Anda telah disetujui dan tercatat pada sistem konsorsium mitra.',
    '',
    'Layanan Nasabah & Konfirmasi: (021) 5299-8800',
  ].join('\n');

  try {
    let sentToCustomer = false;
    if (targetPhone) {
      sentToCustomer = await sendWhatsAppMessage(targetPhone, lines);
    }
    for (const adminTarget of WHATSAPP_TARGETS) {
      if (adminTarget !== targetPhone) {
        await sendWhatsAppMessage(adminTarget, `[SALINAN AKAD MITRA]\n${lines}`);
      }
    }
    return {
      success: true,
      message: sentToCustomer
        ? `Notifikasi akad berhasil dikirim ke WhatsApp nasabah (${targetPhone}) dan Admin.`
        : `Pesan akad berhasil disiapkan.`,
    };
  } catch (err: any) {
    console.error('sendAkadWhatsAppNotification error:', err);
    return { success: false, message: err.message || 'Gagal mengirim pesan WhatsApp' };
  }
};

export const sendDueDateReminderWhatsApp = async (params: {
  customerName: string;
  customerPhone: string;
  contractNumber: string;
  installmentNumber: number;
  totalInstallments: number;
  amount: number;
  dueDate: string; // misal: 2026-10-10
  goldGrams: number;
  partnerName: string;
}): Promise<{ success: boolean; message: string }> => {
  const targetPhone = formatPhoneTo62(params.customerPhone);
  const lines = [
    '*PENGINGAT JATUH TEMPO ANGSURAN EMAS*',
    'PT EMAS MURNI ASLI x RAJA EMAS INDONESIA',
    '------------------------------------------------',
    `Yth. *${params.customerName}*,`,
    '',
    `Kami menginformasikan bahwa jadwal angsuran pembiayaan emas *${params.goldGrams} Gram* Anda telah memasuki tanggal jatuh tempo:`,
    '',
    `*No. Akad:* ${params.contractNumber}`,
    `*Angsuran:* Bulan ke-${params.installmentNumber} dari ${params.totalInstallments} Bulan`,
    `*Tanggal Jatuh Tempo:* ${params.dueDate}`,
    `*Nominal Tagihan:* *Rp ${params.amount.toLocaleString('id-ID')}*`,
    `*Mitra Pembiayaan:* ${params.partnerName}`,
    '',
    '*Rekening Pembayaran:*',
    'Bank BCA: *8694991111*',
    'A.N: *PT EMAS MURNI ASLI*',
    '',
    'Mohon melakukan pembayaran sebelum tanggal jatuh tempo agar status pembiayaan tetap lancar.',
    'Abaikan pesan ini apabila Anda telah menyelesaikan pembayaran.',
    '------------------------------------------------',
    'Konfirmasi pembayaran ke WhatsApp Layanan: +62 812-1212-9533',
  ].join('\n');

  try {
    let sent = false;
    if (targetPhone) {
      sent = await sendWhatsAppMessage(targetPhone, lines);
    }
    for (const adminTarget of WHATSAPP_TARGETS) {
      if (adminTarget !== targetPhone) {
        await sendWhatsAppMessage(adminTarget, `[REMINDER JATUH TEMPO DIKIRIM]\n${lines}`);
      }
    }
    return {
      success: true,
      message: sent
        ? `Reminder WhatsApp berhasil dikirim ke ${params.customerName} (${targetPhone})!`
        : `Reminder WhatsApp disiapkan untuk ${params.customerName}.`,
    };
  } catch (err: any) {
    console.error('sendDueDateReminderWhatsApp error:', err);
    return { success: false, message: err.message || 'Gagal mengirim pesan WhatsApp' };
  }
};

export const getWhatsAppDirectUrl = (params: {
  phone: string;
  message: string;
}): string => {
  const targetPhone = formatPhoneTo62(params.phone);
  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(params.message)}`;
};
