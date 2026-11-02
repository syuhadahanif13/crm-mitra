# CRM Pembiayaan Emas & Penagihan Angsuran - Raja Emas Indonesia

Sistem CRM Mandiri untuk Konsorsium Mitra Pembiayaan Emas (BPRS, Bank Syariah, Koperasi Syariah) dan PT Emas Murni Asli (Raja Emas Indonesia).

Proyek ini dirancang independen, memiliki repositori git sendiri, dan siap di-deploy langsung ke Vercel.

---

## Fitur Utama

1. **Profil Nasabah Lengkap**
   - Data nasabah: Nama (Ibu Aini), Umur (42 tahun), Nomor WhatsApp, Email, NIK, Pekerjaan, Grade Kelancaran, dan Riwayat Akad.
2. **Akad Pembiayaan Emas 10 Gram**
   - Perhitungan otomatis DP (Uang Muka), Margin Syariah / Bunga Murabahah, Biaya Khazanah Brankas, Nilai Kontrak, dan Angsuran Bulanan.
   - Jadwal pembayaran angsuran dengan pencatatan status pelunasan.
3. **Notifikasi Transaksi Pasca-Akad**
   - Pengiriman otomatis rincian akad via Fonnte WhatsApp Gateway ke nasabah dan admin.
   - Format cetak Surat Akad Resmi Pembiayaan Emas SNI 999.9.
4. **Pengingat Jatuh Tempo WhatsApp**
   - Penjadwalan jatuh tempo angsuran (Ibu Aini - 10 Oktober 2026, tagihan Rp 1.859.375).
   - Pengiriman pengingat via WhatsApp Gateway Fonnte dan tautan langsung Web WhatsApp.
5. **Stock Opname Khazanah Brankas**
   - Rekonsiliasi fisik vs pembukuan sistem per keping (0.1g hingga 1000g).
   - Pencatatan alokasi emas fidusia jaminan akad aktif vs stok bebas siap jual.
   - Berita Acara pemeriksaan fisik berkala.
6. **Kustomisasi Logo & Identitas Brand**
   - Upload file logo kustom atau pilih dari ikon monogram.
   - Penyesuaian nama brand dan tema warna navigasi.
7. **Integrasi & Transaksi Mandiri**
   - Import transaksi dari Dasbor Mitra (Auto-Scan LocalStorage, Preset, atau File JSON).
   - Penambahan transaksi dan akad pembiayaan langsung di dalam sistem CRM.

---

## Panduan Push ke GitHub & Deploy ke Vercel

Folder `crm-raja-emas` telah terkonfigurasi dengan `package.json`, `vite.config.ts`, `vercel.json`, dan kode sumber di `src/`.

### Langkah 1: Repositori GitHub
1. Buat repositori baru di GitHub (misal: `crm-mitra`).
2. Hubungkan remote repository:

```bash
cd crm-raja-emas
git remote set-url origin https://github.com/USERNAME_ANDA/crm-mitra.git
git push -u origin main
```

---

### Langkah 2: Deploy ke Vercel
1. Buka Vercel Dashboard.
2. Pilih **Add New Project** lalu import repositori `crm-mitra`.
3. Parameter konfigurasi Vite otomatis terdeteksi:
   - Framework Preset: Vite
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Masukkan Environment Variables (jika diperlukan) pada Project Settings.
5. Klik **Deploy**.

---

## Menjalankan di Komputer Lokal (Development)

```bash
cd crm-raja-emas

# Install dependensi
npm install

# Menjalankan server development
npm run dev
```

Server lokal berjalan pada port default `http://localhost:5173`.

---

## Konfigurasi WhatsApp Gateway (Fonnte)

Konfigurasi token Fonnte WhatsApp Gateway dapat diatur melalui file `.env`:

```env
VITE_FONNTE_TOKEN=gkmNVWdLWCfuwXMZFqzN
VITE_FONNTE_API_URL=https://api.fonnte.com/send
VITE_ADMIN_WA_MARKETING=6281802180003
VITE_ADMIN_WA_IT=628151612592
```

---

## Struktur Direktori

```text
crm-raja-emas/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vercel.json
├── .gitignore
├── .env.example
├── README.md
└── src/
    ├── main.tsx
    ├── CrmApp.tsx
    ├── types.ts
    ├── index.css
    ├── components/
    │   ├── AudimeDashboardView.tsx       # Tampilan Dashboard Utama
    │   ├── CustomerProfileView.tsx       # Manajemen Profil Nasabah
    │   ├── InstallmentContractView.tsx   # Pengelolaan Akad Cicilan Emas
    │   ├── DuePaymentAutomationView.tsx  # Jadwal Penagihan & Pengingat WA
    │   ├── StockOpnameView.tsx           # Audit & Rekonsiliasi Brankas
    │   ├── ImportMitraModal.tsx          # Import Transaksi Dasbor Mitra
    │   ├── AddManualTransactionModal.tsx # Pencatatan Transaksi Mandiri
    │   ├── BrandLogoEditorModal.tsx      # Pengaturan Logo & Identitas Brand
    │   └── AkadContractModal.tsx         # Cetak Surat Kontrak Akad
    ├── data/
    │   └── mockCrmData.ts                # Data Awal Nasabah, Akad, dan Stok
    ├── services/
    │   ├── crmService.ts                 # Logika Hitung Cicilan & Persistensi
    │   └── fonnteService.ts              # Integrasi WhatsApp Fonnte Gateway
    └── utils/
        └── formatters.ts                 # Format Rupiah & Gramatur
```

---

PT Emas Murni Asli - Raja Emas Indonesia
