# CRM Pembiayaan Emas & Penagihan Angsuran - Raja Emas Indonesia

Sistem CRM Mandiri untuk Konsorsium Mitra Pembiayaan Emas (BPRS, Bank Syariah, Koperasi Syariah) dan PT Emas Murni Asli (Raja Emas Indonesia).

Proyek ini dibangun secara independen dengan arsitektur modern berbasis React + TypeScript + Vite, mendukung penuh antarmuka responsif mobile, dan siap di-deploy langsung ke Vercel atau hosting produksi lainnya.

---

## Fitur Utama Sistem

### 1. Database & Profil Nasabah Lengkap
- **CRUD Lengkap Nasabah**: Pendaftaran nasabah baru, pengeditan profil lengkap (Nama, Umur, Kontak WhatsApp, Email, NIK, Pekerjaan, Penghasilan Bulanan, Status, Credit Grade, Alamat), dan penghapusan data dengan proteksi dialog konfirmasi.
- **Sinkronisasi Data Otomatis**: Perubahan profil nasabah otomatis menyinkronkan data nama dan kontak pada seluruh berkas akad yang terhubung.
- **Dossier & Riwayat Akad**: Rangkuman portofolio gramasi aktif, jumlah akad berjalan, dan riwayat fasilitas pembiayaan per nasabah.

### 2. Akad Pembiayaan Cicilan Emas Syariah
- **Simulasi Otomatis Murabahah**: Perhitungan otomatis Uang Muka (DP), Margin Syariah proporsional (% p.a), Biaya Administrasi & Khazanah Brankas, Nilai Pokok Pembiayaan, dan Angsuran Bulanan.
- **CRUD Akad Pembiayaan**:
  - Penerbitan akad pembiayaan baru dengan kalkulasi real-time.
  - Pengeditan akad (gramasi emas, tenor bulan, nominal DP, angsuran per bulan, tanggal jatuh tempo, margin syariah, dan status akad: *Aktif, Lunas, Menunggak, Dibatalkan*).
  - Penghapusan akad dengan konfirmasi yang otomatis memperbarui akumulasi gramasi nasabah.
- **Pencetakan Surat Akad Digital**: Preview dan cetak Surat Kontrak Akad Pembiayaan Emas SNI 999.9 resmi berformat standar hukum syariah.

### 3. Monitoring & Otomasi Jatuh Tempo Angsuran
- **Tampilan Kalender & Jadwal Penagihan**: Pelacakan tanggal jatuh tempo angsuran per bulan, sisa hari menuju jatuh tempo, dan status tagihan (*Lancar, Mendekati Jatuh Tempo, Menunggak*).
- **Pengingat WhatsApp Terintegrasi**: Pemicu pengiriman notifikasi pengingat pembayaran angsuran langsung ke nomor WhatsApp nasabah dan tembusan ke admin internal.

### 4. Integrasi WhatsApp Gateway Terpadu
- **Mekari Qontak (Official Meta WhatsApp Business API - Disarankan)**:
  - Jalur resmi Meta WhatsApp Cloud API via BSP Mekari Qontak.
  - Bebas risiko banned nomor dan tanpa pembatasan rate limit sesi Baileys.
  - Pengiriman pesan berbasis template pesan resmi Meta (*HSM*).
- **Kirimi.id & Fonnte Gateway (QR Scan Session)**:
  - Dukungan fallback pengiriman pesan otomatis dan manual pairing via scan QR code.
- **Modal WhatsApp Gateway**: Panel terpusat di header untuk mengecek status koneksi, pairing QR, dan pengujian pesan langsung (*direct test*) ke nomor target.

### 5. Stock Opname & Khazanah Brankas (Vault)
- **Rekonsiliasi Fisik vs Sistem**: Audit berkala kepingan emas per denominasi (0.1 gram s/d 1000 gram).
- **Alokasi Fidusia**: Pemisahan stok fisik antara emas yang terikat jaminan akad fidusia aktif vs stok bebas siap transaksi.
- **Berita Acara Digital**: Pencatatan riwayat audit fisik brankas khazanah.

### 6. Desain Antarmuka Audime & Responsif Mobile
- **Gaya Desain Modern**: Mengadopsi standar *Audime style* (rounded-3xl cards, soft pill badges, mikro-interaksi dinamis).
- **100% Mobile Friendly**: Optimal diakses melalui smartphone, tablet, maupun desktop lengkap dengan navigasi laci drawer mobile.
- **Tema Gelap & Terang**: Toggle Dark/Light mode tersimpan otomatis di preferensi browser.
- **Kustomisasi Logo & Identitas Brand**: Fitur upload logo kustom, pilihan monogram, dan tema warna aksen instansi mitra.

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
├── panduantesting.md                 # Panduan pengujian sistem menyeluruh
└── src/
    ├── main.tsx                      # Entry point React
    ├── CrmApp.tsx                    # Komponen utama & router CRM
    ├── types.ts                      # Definisi TypeScript interfaces
    ├── index.css                     # Konfigurasi Tailwind CSS
    ├── components/
    │   ├── AudimeDashboardView.tsx   # Dashboard analitik & ringkasan portofolio
    │   ├── CustomerProfileView.tsx   # Direktori & manajemen profil nasabah (CRUD)
    │   ├── InstallmentContractView.tsx # Manajemen akad cicilan emas (CRUD)
    │   ├── DuePaymentAutomationView.tsx # Monitoring jatuh tempo & reminder WA
    │   ├── StockOpnameView.tsx       # Audit stok brankas khazanah
    │   ├── WhatsAppTestModal.tsx     # Pengaturan & uji coba WhatsApp Gateway
    │   ├── ImportMitraModal.tsx      # Import data transaksi mitra
    │   ├── AddManualTransactionModal.tsx # Input transaksi pembiayaan mandiri
    │   ├── BrandLogoEditorModal.tsx  # Pengaturan logo & brand
    │   ├── AkadContractModal.tsx     # Dokumen cetak surat perjanjian akad
    │   └── CrmLoginPage.tsx          # Autentikasi sesi mitra
    ├── data/
    │   └── mockCrmData.ts            # Data inisialisasi awal
    ├── services/
    │   ├── crmService.ts             # Logika kalkulasi cicilan & persistensi data
    │   ├── qontakService.ts          # Integrasi resmi Mekari Qontak Meta WABA
    │   ├── kirimiService.ts          # Integrasi WhatsApp Kirimi.id API
    │   └── fonnteService.ts          # Integrasi fallback Fonnte WhatsApp API
    └── utils/
        └── formatters.ts             # Formatter nominal Rupiah, gramasi, & tanggal
```

---

## Menjalankan di Komputer Lokal (Development)

### Prasyarat
- Node.js versi 18 atau lebih baru
- npm / pnpm / yarn

```bash
# Masuk ke folder proyek
cd crm-raja-emas

# Install seluruh dependensi
npm install

# Jalankan development server
npm run dev
```

Aplikasi dapat diakses melalui browser pada alamat default:
```text
http://localhost:5173
```

---

## Build untuk Produksi

Untuk menghasilkan bundle statis yang telah dioptimasi:

```bash
npm run build
```

Hasil kompilasi akan tersimpan di dalam folder `dist/` dan siap dipublikasikan ke server web (Vercel, Netlify, Nginx, Apache).

---

## Konfigurasi Environment Variables (.env)

Buat file `.env` di dalam folder `crm-raja-emas/` dengan rujukan berikut:

```env
# Mekari Qontak (Official Meta WhatsApp Business API)
VITE_QONTAK_BASE_URL=https://service-chat.qontak.com/api/open/v1
VITE_QONTAK_ACCESS_TOKEN=your_qontak_bearer_token
VITE_QONTAK_CHANNEL_ID=your_channel_integration_id
VITE_QONTAK_TEMPLATE_ID_AKAD=your_approved_template_id_akad
VITE_QONTAK_TEMPLATE_ID_REMINDER=your_approved_template_id_reminder

# Kirimi.id WhatsApp API (Gateway QR Baileys)
VITE_KIRIMI_USER_CODE=KMXZRL1126
VITE_KIRIMI_SECRET_KEY=0344a651a64d16194ec78d979157c9f2e24e173af6927eaec9587437aa0acffa
VITE_KIRIMI_DEVICE_ID=D-TRJ97
VITE_KIRIMI_API_URL=https://api.kirimi.id/v1/send-message

# Nomor WhatsApp Admin Internal
VITE_ADMIN_WA_MARKETING=6281802180003
VITE_ADMIN_WA_IT=628151612592
```

---

## Panduan Pengujian (Testing)

Dokumentasi skenario pengujian komprehensif dari seluruh alur modul sistem telah disusun pada file terpisah:
👉 **[panduantesting.md](./panduantesting.md)**

---

© 2026 PT Emas Murni Asli - Raja Emas Indonesia. Seluruh hak cipta dilindungi undang-undang.
