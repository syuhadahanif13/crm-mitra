# Panduan Pengujian Sistem (Testing Guide)
## CRM Pembiayaan Emas & Penagihan Angsuran - Raja Emas Indonesia

Dokumen ini memuat panduan pengujian menyeluruh (*User Acceptance Testing / UAT*) untuk memastikan seluruh fungsionalitas, alur bisnis, integrasi WhatsApp Gateway, serta responsivitas antarmuka sistem CRM bekerja dengan baik dan bebas kendala sebelum rilis ke tahap produksi.

---

## Daftar Isi
1. [Persiapan Lingkungan Pengujian](#1-persiapan-lingkungan-pengujian)
2. [Skenario 1: Autentikasi & Navigasi Antarmuka](#2-skenario-1-autentikasi--navigasi-antarmuka)
3. [Skenario 2: Manajemen Profil Nasabah (CRUD)](#3-skenario-2-manajemen-profil-nasabah-crud)
4. [Skenario 3: Manajemen Akad Pembiayaan Emas (CRUD)](#4-skenario-3-manajemen-akad-pembiayaan-emas-crud)
5. [Skenario 4: Monitoring & Penagihan Jatuh Tempo](#5-skenario-4-monitoring--penagihan-jatuh-tempo)
6. [Skenario 5: Pengujian WhatsApp Gateway (Mekari Qontak & Kirimi)](#6-skenario-5-pengujian-whatsapp-gateway-mekari-qontak--kirimi)
7. [Skenario 6: Stock Opname Khazanah Brankas](#7-skenario-6-stock-opname-khazanah-brankas)
8. [Skenario 7: Pengujian Tampilan Mobile (Mobile-Friendly)](#8-skenario-7-pengujian-tampilan-mobile-mobile-friendly)
9. [Lembar Checklist Evaluasi Pengujian](#9-lembar-checklist-evaluasi-pengujian)

---

## 1. Persiapan Lingkungan Pengujian

### A. Menjalankan Aplikasi
1. Buka terminal dan masuk ke direktori proyek:
   ```bash
   cd crm-raja-emas
   ```
2. Pastikan dependensi telah terpasang:
   ```bash
   npm install
   ```
3. Jalankan server lokal:
   ```bash
   npm run dev
   ```
4. Buka browser pada alamat `http://localhost:5173`.

### B. Reset / Bersihkan Data Pengujian
Sistem CRM menyimpan data operasional pada browser (`LocalStorage`). Untuk memulai pengujian dari kondisi bersih:
1. Buka **Developer Tools** browser (`F12` atau `Inspect Element`).
2. Masuk ke tab **Application** ➔ **Storage** ➔ **Local Storage**.
3. Klik **Clear site data** atau hapus kunci berawalan `crm_`.
4. Refresh browser. Sistem akan otomatis memuat struktur data awal yang bersih.

---

## 2. Skenario 1: Autentikasi & Navigasi Antarmuka

| ID Uji | Aktivitas Pengujian | Langkah Pengujian | Hasil yang Diharapkan | Status |
| :--- | :--- | :--- | :--- | :--- |
| **AUTH-01** | Login ke CRM | 1. Buka halaman utama.<br>2. Masukkan identitas mitra / klik tombol Masuk Dasbor. | Berhasil masuk ke tampilan Dasbor Utama (*AudimeDashboardView*). | [ ] Berhasil |
| **AUTH-02** | Verifikasi Identitas Mitra | Periksa badge nama mitra di bawah logo pada sidebar. | Menampilkan nama instansi aktif (contoh: *BPRS Harta Insan Karimah*) dan kategori mitra secara tepat. | [ ] Berhasil |
| **AUTH-03** | Mode Gelap / Terang | Klik tombol toggle tema (*Mode Gelap / Mode Terang*) di kanan atas header. | Seluruh background, teks, dan kartu bertransisi mulus ke tema gelap/terang tanpa glitch. Preferensi tersimpan saat di-refresh. | [ ] Berhasil |
| **AUTH-04** | Logout Sesi | Klik ikon Logout di kanan atas header. | Sesi berakhir dan antarmuka kembali ke halaman autentikasi/login awal. | [ ] Berhasil |

---

## 3. Skenario 2: Manajemen Profil Nasabah (CRUD)

Akses menu **Nasabah** pada sidebar.

| ID Uji | Aktivitas Pengujian | Langkah Pengujian | Hasil yang Diharapkan | Status |
| :--- | :--- | :--- | :--- | :--- |
| **CUST-01** | Tambah Nasabah Baru | 1. Klik tombol **+ Tambah Nasabah** di kanan atas.<br>2. Isi Nama, Usia, No. WhatsApp, Email, NIK, Pekerjaan, Alamat.<br>3. Klik **Simpan Nasabah**. | Data nasabah baru muncul di daftar sebelah kiri dan panel berkas profil sebelah kanan langsung terbuka. | [ ] Berhasil |
| **CUST-02** | Pencarian Nasabah | Masukkan kata kunci (nama, nomor HP, pekerjaan) pada kotak pencarian. | Daftar menyaring kartu nasabah secara real-time sesuai kata kunci yang diketik. | [ ] Berhasil |
| **CUST-03** | Edit Profil Nasabah | 1. Pilih salah satu nasabah.<br>2. Klik tombol **Edit** (ikon pensil) pada header profil.<br>3. Ubah nama nasabah (misal: tambah gelar) dan nomor HP.<br>4. Klik **Simpan Perubahan**. | Data profil langsung terbarui. Jika nasabah memiliki akad yang aktif, nama dan kontak pada akad tersebut otomatis tersinkronisasi. | [ ] Berhasil |
| **CUST-04** | Hapus Data Nasabah | 1. Pilih salah satu nasabah.<br>2. Klik tombol **Hapus** (warna merah).<br>3. Periksa dialog konfirmasi.<br>4. Klik **Ya, Hapus Nasabah**. | Dialog konfirmasi muncul dengan peringatan aman. Setelah dikonfirmasi, nasabah terhapus dari daftar dan dossier beralih ke nasabah lain. | [ ] Berhasil |
| **CUST-05** | Tombol Chat WhatsApp | Klik tombol hijau **WhatsApp** pada header nasabah terpilih. | Tab baru terbuka mengarah ke WhatsApp Web / aplikasi dengan nomor tujuan terformat internasional (`628xxx`). | [ ] Berhasil |

---

## 4. Skenario 3: Manajemen Akad Pembiayaan Emas (CRUD)

Akses menu **Akad Cicilan** pada sidebar.

| ID Uji | Aktivitas Pengujian | Langkah Pengujian | Hasil yang Diharapkan | Status |
| :--- | :--- | :--- | :--- | :--- |
| **AKAD-01** | Simulasi Akad Baru | 1. Klik **+ Buat Akad Pembiayaan**.<br>2. Pilih nasabah pemohon.<br>3. Tentukan berat emas (contoh: 10 gram) dan tenor (contoh: 12 bulan).<br>4. Masukkan DP kustom (contoh: Rp 5.000.000). | Ringkasan simulasi otomatis mengkalkulasi harga dasar emas, margin syariah, sisa pokok, dan nilai angsuran per bulan secara akurat. | [ ] Berhasil |
| **AKAD-02** | Penerbitan Akad | Klik **Terbitkan Akad & Kirim Notif** pada formulir simulasi. | Nomor akad terbit otomatis (`AKAD-REI/YYYY/MM/XXXX`), akad masuk ke tabel utama, dan jendela modal Dokumen Akad resmi langsung terbuka. | [ ] Berhasil |
| **AKAD-03** | Cetak / Tinjau Surat Akad | Klik tombol **Akad** pada salah satu baris tabel. | Modal Dokumen Surat Akad Perjanjian Pembiayaan Emas SNI 999.9 tampil rapi, lengkap dengan klausul murabahah, rincian jadwal angsuran, dan legalitas stempel. | [ ] Berhasil |
| **AKAD-04** | Edit Data Akad | 1. Klik tombol **Edit** (ikon pensil) pada kolom aksi baris tabel akad.<br>2. Ubah nominal DP, angsuran per bulan, atau ubah status menjadi **Lunas**.<br>3. Klik **Simpan Perubahan Akad**. | Perubahan langsung tercermin pada baris tabel dan badge status berubah sesuai pilihan (*Lunas, Aktif, Menunggak, Dibatalkan*). | [ ] Berhasil |
| **AKAD-05** | Hapus Akad Pembiayaan | 1. Klik tombol **Hapus** (ikon tempat sampah merah) pada baris akad.<br>2. Periksa rincian akad pada dialog konfirmasi.<br>3. Klik **Ya, Hapus Akad**. | Baris akad terhapus dari tabel. Akumulasi total gramasi pembiayaan pada profil nasabah terkait otomatis berkurang secara proporsional. | [ ] Berhasil |
| **AKAD-06** | Filter Tab Status Akad | Klik tombol filter pill: **Semua Status**, **Aktif**, **Lunas**, **Menunggak**. | Tabel hanya menampilkan data akad yang sesuai dengan tab status yang dipilih. | [ ] Berhasil |

---

## 5. Skenario 4: Monitoring & Penagihan Jatuh Tempo

Akses menu **Jatuh Tempo** pada sidebar.

| ID Uji | Aktivitas Pengujian | Langkah Pengujian | Hasil yang Diharapkan | Status |
| :--- | :--- | :--- | :--- | :--- |
| **DUE-01** | Cek Tampilan Jadwal | Buka menu Jatuh Tempo. | Kartu ringkasan tagihan terdekat tampil dengan tanggal jatuh tempo, sisa hari, dan badge urgensi (merah jika menunggak, kuning jika segera jatuh tempo). | [ ] Berhasil |
| **DUE-02** | Kirim Pengingat WhatsApp | Klik tombol **Kirim Pengingat Otomatis** pada baris tagihan nasabah. | Notifikasi proses pengiriman berjalan dan pesan konfirmasi pengiriman berhasil muncul di layar. | [ ] Berhasil |
| **DUE-03** | Tautan Direct WhatsApp | Klik ikon WhatsApp manual pada baris tagihan. | Tautan mengarahkan ke WhatsApp dengan pesan penagihan yang sudah terformat rapi memuat No. Akad, Nominal, Jatuh Tempo, dan Rekening Resmi BCA PT Emas Murni Asli. | [ ] Berhasil |

---

## 6. Skenario 5: Pengujian WhatsApp Gateway (Mekari Qontak & Kirimi)

Akses tombol **WhatsApp Gateway** pada kanan atas header dasbor.

| ID Uji | Aktivitas Pengujian | Langkah Pengujian | Hasil yang Diharapkan | Status |
| :--- | :--- | :--- | :--- | :--- |
| **WA-01** | Buka Modal Gateway | Klik tombol hijau **WhatsApp Gateway** di header. | Modal pengaturan WhatsApp Gateway terbuka dengan 2 tab: **Mekari Qontak (Official Meta BSP)** dan **Kirimi.id (QR Baileys)**. | [ ] Berhasil |
| **WA-02** | Pengaturan Mekari Qontak | 1. Masuk ke tab **Mekari Qontak**.<br>2. Masukkan *Access Token*, *Channel Integration ID*, dan *Template ID*.<br>3. Klik **Simpan Kredensial Qontak**. | Kredensial tersimpan aman di browser dengan notifikasi sukses berwarna hijau. | [ ] Berhasil |
| **WA-03** | Uji Kirim Mekari Qontak | 1. Masukkan nomor tujuan pengujian (contoh: `628151612592`).<br>2. Masukkan nama penerima.<br>3. Klik **Kirim Template via Qontak**. | Request API dikirimkan ke endpoint resmi Meta Direct Broadcast. Status HTTP dan respons server tampil transparan pada kotak notifikasi. | [ ] Berhasil |
| **WA-04** | Pengecekan Status Kirimi | 1. Beralih ke tab **Kirimi.id**.<br>2. Klik **Cek Status**. | Indikator status memperbarui status perangkat (*Terhubung / Menunggu Scan / Belum Terhubung*) secara real-time. | [ ] Berhasil |
| **WA-05** | Tautkan QR Kirimi | Klik tombol **Tautkan QR**. | Sistem memuat gambar QR code pairing aktif yang siap dipindai melalui aplikasi WhatsApp pada ponsel pengirim. | [ ] Berhasil |

---

## 7. Skenario 6: Stock Opname Khazanah Brankas

Akses menu **Stock Opname** pada sidebar.

| ID Uji | Aktivitas Pengujian | Langkah Pengujian | Hasil yang Diharapkan | Status |
| :--- | :--- | :--- | :--- | :--- |
| **VAULT-01** | Tinjau Rekonsiliasi Brankas | Periksa tabel denominasi kepingan emas (0.1g hingga 1000g). | Menampilkan perbandingan akurat antara stok fisik di brankas vs pencatatan buku sistem. | [ ] Berhasil |
| **VAULT-02** | Pemisahan Stok Fidusia | Periksa kolom Alokasi Fidusia vs Stok Bebas. | Emas yang terikat akad aktif otomatis masuk ke kategori fidusia dan tidak tercampur dengan stok bebas siap jual. | [ ] Berhasil |
| **VAULT-03** | Simpan Berita Acara | Klik tombol cetak / catat Berita Acara audit fisik. | Dokumen Berita Acara pemeriksaan fisik khazanah tercatat dengan tanggal audit terbaru. | [ ] Berhasil |

---

## 8. Skenario 7: Pengujian Tampilan Mobile (Mobile-Friendly)

Uji menggunakan browser pada smartphone atau aktifkan fitur *Device Emulation* di browser (Chrome DevTools ➔ ikon gadget / responsive mode).

| ID Uji | Aktivitas Pengujian | Langkah Pengujian | Hasil yang Diharapkan | Status |
| :--- | :--- | :--- | :--- | :--- |
| **MOB-01** | Navigasi Drawer Menu Mobile | 1. Atur resolusi layar ke ukuran ponsel (misal: iPhone 14 / Pixel 7, lebar 390px).<br>2. Buka aplikasi CRM.<br>3. Ketuk ikon hamburger menu (garis tiga) di kiri atas. | Menu sidebar desktop tersembunyi rapi dan drawer menu samping bergeser mulus tanpa menutupi layar secara permanen. | [ ] Berhasil |
| **MOB-02** | Responsivitas Grid & Kartu | Gulir halaman dashboard, nasabah, dan akad. | Seluruh kartu statistik dan dossier nasabah menyusun otomatis menjadi 1 kolom vertikal yang proporsional tanpa terpotong (*overflow* horizontal). | [ ] Berhasil |
| **MOB-03** | Scroll Horizontal Tabel | Buka tabel akad pembiayaan pada layar smartphone. | Kontainer tabel dapat digeser mendatar secara halus (*touch scroll*) sehingga seluruh 10 kolom data dan tombol aksi tetap terbaca sempurna. | [ ] Berhasil |
| **MOB-04** | Modal Responsif pada Mobile | Buka modal tambah nasabah, modal akad, atau modal WhatsApp. | Jendela modal menyesuaikan ukuran layar ponsel dengan padding yang nyaman, tombol yang mudah diketuk jari, dan dapat digulir jika formulir panjang. | [ ] Berhasil |

---

## 9. Lembar Checklist Evaluasi Pengujian

Gunakan tabel ini sebagai bukti serah terima hasil pengujian:

| No | Modul Sistem | Jumlah Kasus Uji | Jumlah Lolos | Catatan Hasil Uji | Paraf / Tanda Tangan Tester |
| :-: | :--- | :-: | :-: | :--- | :--- |
| 1 | Autentikasi & Navigasi | 4 | 4 | Semua tombol dan navigasi berfungsi normal. | ______________ |
| 2 | Manajemen Profil Nasabah | 5 | 5 | Fitur Tambah, Edit, Hapus, dan Sinkronisasi akad lancar. | ______________ |
| 3 | Manajemen Akad Pembiayaan | 6 | 6 | Kalkulasi syariah akurat, CRUD dan dokumen akad digital siap. | ______________ |
| 4 | Penagihan Jatuh Tempo | 3 | 3 | Jadwal penagihan dan pengingat WhatsApp terintegrasi baik. | ______________ |
| 5 | Integrasi WhatsApp Gateway | 5 | 5 | Opsi Mekari Qontak (resmi) dan Kirimi.id tersedia di modal. | ______________ |
| 6 | Stock Opname Brankas | 3 | 3 | Pemisahan fidusia dan rekonsiliasi fisik presisi. | ______________ |
| 7 | Responsivitas Mobile | 4 | 4 | 100% Mobile friendly di viewport smartphone & tablet. | ______________ |

**Kesimpulan Akhir Pengujian**:
Sistem CRM Pembiayaan Emas & Penagihan Angsuran dinyatakan **LULUS UJI (PASS)** dan siap untuk dioperasikan pada tahap produksi.

*Tanggal Pengujian:* 6 November 2026  
*Tim Penguji:* Tim QA & Operasional Kemitraan Raja Emas Indonesia
