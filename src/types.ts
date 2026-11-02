export type PartnerCategory = 'BPRS' | 'Bank' | 'Koperasi Syariah';

export interface UserSession {
  role: 'admin' | 'bprs' | 'bank' | 'koperasi';
  partnerId?: string;
  partnerName: string;
  partnerCategory: PartnerCategory;
  name: string;
  email: string;
  discountBalance: number;
  pointsBalance: number;
}

export interface CustomerProfile {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerCategory: PartnerCategory;
  name: string;
  age: number;
  phone: string;
  email: string;
  nik: string;
  address: string;
  occupation: string;
  monthlyIncome?: number;
  status: 'Aktif' | 'Prospek' | 'Selesai' | 'Perhatian Khusus';
  creditGrade: 'A (Sangat Lancar)' | 'B (Lancar)' | 'C (Dalam Pengawasan)' | 'D (Macet)';
  joinedDate: string;
  notes?: string;
  totalGramsFinanced: number;
  activeContractsCount: number;
  completedContractsCount: number;
}

export interface InstallmentScheduleItem {
  installmentNumber: number;
  dueDate: string; // YYYY-MM-DD (misal: 2026-10-10)
  amount: number;
  principalAmount: number;
  marginAmount: number;
  status: 'Lunas' | 'Jatuh Tempo' | 'Menunggak' | 'Mendatang';
  paidDate?: string;
  paymentMethod?: string;
  reminderSent: boolean;
  reminderSentAt?: string;
  notes?: string;
}

export interface GoldInstallmentContract {
  id: string;
  contractNumber: string; // misal: AKAD-REI/2026/10/0042
  customerId: string;
  customerName: string;
  customerAge: number;
  customerPhone: string;
  customerEmail: string;
  partnerId: string;
  partnerName: string;
  partnerCategory: PartnerCategory;
  goldWeightGrams: number; // misal: 10 gram
  goldPurity: string; // 999.9 (24 Karat) SNI
  goldBrand: string; // Raja Emas Indonesia
  goldBasePrice: number; // Harga dasar emas saat akad (misal: 25.625.000)
  tenorMonths: number; // misal: 12 (1 tahun)
  marginRateAnnualPercent: number; // misal: 6%
  totalMarginAmount: number; // Keuntungan/bunga syariah murabahah
  adminAndVaultFee: number; // Biaya admin & brankas
  totalContractValue: number; // Total harga jual akad (Emas + Margin + Admin)
  downPayment: number; // Uang Muka (DP)
  financedPrincipal: number; // Sisa pokok pembiayaan yang diangsur
  monthlyInstallment: number; // Angsuran per bulan
  contractDate: string; // Tanggal akad disepakati
  dueDateDay: number; // Tanggal jatuh tempo per bulan (misal: tanggal 10)
  status: 'Aktif' | 'Lunas' | 'Menunggak' | 'Dibatalkan';
  installmentsPaid: number;
  totalInstallments: number;
  totalPaidAmount: number;
  remainingFinancedAmount: number;
  nextDueDate: string;
  goldVaultStatus: 'Tersimpan di Brankas (Jaminan Fidusia)' | 'Diserahkan ke Nasabah' | 'Siap Diambil';
  schedule: InstallmentScheduleItem[];
  akadNotes?: string;
  verifiedBy: string;
}

export interface StockOpnameItem {
  weightGrams: number;
  brand: string;
  systemStockPcs: number; // Stok tercatat di sistem
  physicalStockPcs: number; // Stok fisik hasil hitungan di brankas
  allocatedInstallmentPcs: number; // Stok yang dialokasikan sebagai jaminan cicilan akad aktif
  availablePcs: number; // Stok bebas yang siap dijual/diorder
  differencePcs: number; // physicalStockPcs - systemStockPcs
  differenceGrams: number;
  status: 'Match' | 'Surplus' | 'Deficit';
  notes?: string;
}

export interface StockOpnameRecord {
  id: string;
  opnameNumber: string; // SO-REI/2026/10/001
  date: string;
  vaultLocation: string; // misal: Brankas Sentral Khazanah PT Emas Murni Asli - Jakarta
  auditorName: string;
  auditorRole: string;
  status: 'Selesai' | 'Menunggu Verifikasi' | 'Ada Selisih';
  items: StockOpnameItem[];
  totalSystemGrams: number;
  totalPhysicalGrams: number;
  totalAllocatedGrams: number;
  totalDifferenceGrams: number;
  summaryNote: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface CrmNotification {
  id: string;
  type: 'akad_baru' | 'jatuh_tempo' | 'pembayaran_angsuran' | 'stock_opname' | 'wa_reminder';
  title: string;
  message: string;
  timestamp: string;
  recipientName: string;
  recipientPhone: string;
  relatedContractId?: string;
  relatedCustomerId?: string;
  read: boolean;
  channel: 'WhatsApp Fonnte' | 'Sistem CRM' | 'Email';
}
