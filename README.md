# CRM Pembiayaan Cicilan Emas & Otomasi Tagihan - Raja Emas Indonesia

Sistem CRM Mandiri (*Standalone*) untuk Konsorsium Mitra Pembiayaan Emas (BPRS, Bank Syariah, Koperasi Syariah) dan PT Emas Murni Asli (Raja Emas Indonesia).

Proyek ini dirancang **100% independen**, memiliki repositori git sendiri, dan siap di-deploy langsung ke **Vercel** dengan 0 konfigurasi rumit.

---

## 🌟 Fitur Utama (Sesuai 5 Kebutuhan Kasus)

1. **Profil Nasabah Lengkap (Case 1)**
   - Profil terperinci: Nama (*Ibu Aini*), Umur (*42 tahun*), No HP (*WhatsApp*), Email, NIK, Pekerjaan, Grade Kelancaran, dan Riwayat Akad.
2. **Akad Cicilan Emas 1 Tahun 10 Gram (Case 2)**
   - Perhitungan otomatis DP (Uang Muka), Margin Syariah / Bunga Murabahah, Biaya Brankas, Nilai Kontrak, dan Angsuran Bulanan.
   - Jadwal pembayaran 12 bulan rapi dengan status per angsuran.
3. **Notifikasi Transaksi Sehabis Akad (Case 3)**
   - Notifikasi otomatis via Fonnte WhatsApp API langsung ke WhatsApp nasabah dan admin begitu akad disetujui.
   - Cetak Surat Akad Resmi Pembiayaan Emas SNI 999.9.
4. **Otomasi Pengingat Jatuh Tempo WhatsApp (Case 4)**
   - Pengingat khusus: *Ibu Aini jatuh tempo 10 Oktober 2026* (Angsuran Rp 1.859.375).
   - Pengiriman otomatis via Fonnte API + link Web WhatsApp cadangan (`wa.me`).
5. **Stock Opname Brankas Khazanah (Case 5)**
   - Rekonsiliasi fisik vs pembukuan sistem per keping (0.1g hingga 1000g).
   - Pencatatan alokasi emas fidusia jaminan akad aktif (termasuk 10g Ibu Aini) vs stok bebas siap jual.
   - Fitur Berita Acara & simulasi audit fisik langsung.

---

## 🚀 Panduan Push ke GitHub Baru & Deploy ke Vercel

Folder `crm-raja-emas` ini sudah memiliki struktur lengkap: `package.json`, `vite.config.ts`, `vercel.json`, dan kode sumber di `src/`.

### Langkah 1: Buat Repositori Baru di GitHub
1. Buka [GitHub.com](https://github.com/new).
2. Buat repositori baru bernama misal: `crm-raja-emas-indonesia`.
3. Biarkan repositori kosong (jangan centang Add README / .gitignore).

### Langkah 2: Masuk ke Folder CRM & Inisialisasi Git
Jalankan perintah berikut di terminal Anda:

```bash
# 1. Pindah ke folder CRM
cd crm-raja-emas

# 2. Inisialisasi git lokal
git init

# 3. Tambahkan semua file
git add .

# 4. Commit pertama
git commit -m "feat: initial commit CRM Raja Emas Indonesia standalone"

# 5. Ganti branch utama ke main
git branch -M main

# 6. Hubungkan dengan URL repositori GitHub baru Anda
git remote add origin https://github.com/USERNAME_ANDA/crm-raja-emas-indonesia.git

# 7. Push ke GitHub
git push -u origin main
```

*(Ganti `USERNAME_ANDA` dengan username GitHub Anda).*

---

### Langkah 3: Deploy ke Vercel
1. Buka [Vercel Dashboard](https://vercel.com/dashboard).
2. Klik tombol **"Add New..."** lalu pilih **"Project"**.
3. Cari repositori GitHub Anda: `crm-raja-emas-indonesia` lalu klik **"Import"**.
4. Vercel akan otomatis mengenali project sebagai **Vite**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Klik **"Deploy"**.
6. Dalam waktu ~1 menit, aplikasi CRM Anda telah aktif dengan URL misal: `https://crm-raja-emas-indonesia.vercel.app`! 🎉

---

## 💻 Menjalankan di Komputer Lokal (Development)

Jika ingin menjalankan atau mengembangkan di komputer lokal:

```bash
cd crm-raja-emas

# Install dependensi
npm install

# Jalankan server development
npm run dev
```

Buka browser di `http://localhost:5173`.

---

## ⚙️ Konfigurasi API WhatsApp (Fonnte)

Konfigurasi token Fonnte WhatsApp API terletak di:
`src/services/fonnteService.ts`

```typescript
export const FONNTE_API_TOKEN = 'gkmNVWdLWCfuwXMZFqzN';
```

Anda dapat mengganti token tersebut dengan token Fonnte milik Anda jika diperlukan.

---

## 📁 Struktur Folder

```text
crm-raja-emas/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vercel.json
├── .gitignore
├── README.md
└── src/
    ├── main.tsx
    ├── CrmApp.tsx
    ├── types.ts
    ├── index.css
    ├── components/
    │   ├── CustomerProfileView.tsx      # Case 1: Profil Nasabah Ibu Aini (42 th)
    │   ├── InstallmentContractView.tsx  # Case 2 & 3: Akad 10g 1th & Notif WA
    │   ├── DuePaymentAutomationView.tsx # Case 4: Otomasi Tagihan 10 Okt (Aini)
    │   ├── StockOpnameView.tsx          # Case 5: Audit Brankas & Jaminan Fidusia
    │   └── AkadContractModal.tsx        # Surat Kontrak Akad Cetak
    ├── data/
    │   └── mockCrmData.ts               # Data Awal Nasabah, Akad, Stok Opname
    ├── services/
    │   ├── crmService.ts                # Logika Hitung Cicilan & Helper Notifikasi
    │   └── fonnteService.ts             # Integrasi WhatsApp Fonnte API
    └── utils/
        └── formatters.ts                # Format Rupiah & Gramatur
```

---

© 2026 PT Emas Murni Asli • Raja Emas Indonesia
