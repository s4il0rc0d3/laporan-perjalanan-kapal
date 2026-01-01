# Laporan Perjalanan Kapal (LPK)
**Sistem Manajemen Laporan Operasional Kapal Penumpang PELNI**

<div align="center">
  <img src="assets/PELNI.png" alt="Logo PELNI" width="500" height="auto">
  <br>
  <br>
  <p>
    <b>Digitalisasi Arsip • Pencarian Cepat • Laporan Akurat</b>
  </p>
</div>

---

## 📖 Tentang Aplikasi

Aplikasi **Laporan Perjalanan Kapal** ini dirancang khusus untuk memenuhi kebutuhan operasional kapal penumpang, mengikuti standar **PELNI (Pelayaran Nasional Indonesia)**.

Aplikasi ini bertujuan untuk mengatasi masalah manajemen data konvensional yang seringkali berantakan, sulit dilacak, dan rentan hilang. Dengan sistem ini, seluruh data perjalanan kapal tersimpan dalam database lokal komputer yang aman, terstruktur, dan mudah diakses kembali untuk kebutuhan pelaporan atau audit.

### 🔥 Fitur Utama
* **Input Data Terstandar:** Form input digital yang disesuaikan dengan logbook harian kapal.
* **Database Lokal (Offline):** Penyimpanan data mandiri di komputer tanpa ketergantungan internet.
* **Smart Search:** Mencari arsip laporan lama dalam hitungan detik berdasarkan Voyage.
* **Export & Print:** Kemudahan mencetak laporan fisik yang rapi dari data digital.
* **Manajemen Arsip:** Menghilangkan risiko penumpukan dokumen fisik yang tidak teratur.

---

## 📸 Tampilan Aplikasi (Screenshots)

Berikut adalah antarmuka aplikasi saat digunakan:

### 1. Dashboard & Input Laporan
![Input Data](assets/Screenshot%202026-01-02%20at%2006.03.03.png)
*Antarmuka input data yang bersih memudahkan perwira jaga memasukkan data operasional.*

### 2. Arsip Laporan (Pop-up)
![Arsip Laporan Kosong](assets/Screenshot%202026-01-02%20at%2006.03.21.png)
*Tampilan modal arsip saat belum ada laporan yang disimpan.*

---

## 🚀 Cara Menggunakan Aplikasi

1.  **Buka Aplikasi:** Jalankan aplikasi melalui shortcut desktop.
2.  **Input Laporan:**
    * Masuk ke menu Input.
    * Isi data voyage, posisi, dan status kapal.
    * Klik **Simpan**. Data otomatis tersimpan di LocalStorage.
3.  **Mencari Laporan:**
    * Buka menu Arsip.
    * Ketik kata kunci di kolom pencarian.
4.  **Cetak/Download:**
    * Pilih laporan yang diinginkan, lalu klik tombol Print untuk kebutuhan administrasi.

---

## 🛠️ Teknologi yang Digunakan

Aplikasi ini dibangun dengan *Tech Stack* modern untuk menjamin performa yang cepat, ringan, dan dapat berjalan secara offline di atas kapal:

### 💻 Core & Desktop Engine
* **Electron:** Mengemas aplikasi web menjadi *software desktop native* yang dapat diinstal di komputer kapal.
* **TypeScript (.ts, .tsx):** Bahasa pemrograman utama yang menjamin keamanan tipe data (*type-safety*) untuk meminimalisir *bug* saat operasional.

### 🎨 User Interface (Frontend)
* **React + Vite:** Membangun antarmuka yang responsif dengan performa *loading* super cepat.
* **Tailwind CSS:** Framework styling untuk menciptakan tampilan modern dan konsisten.

### 💾 Data Persistence (Penyimpanan Data)
* **LocalStorage API:**
  * Menggunakan sistem penyimpanan lokal berbasis *browser-storage* yang ringan.
  * **Zero-Config:** Tidak memerlukan instalasi database server (SQL) yang rumit.
  * **Offline-First:** Data tersimpan aman di komputer lokal pengguna, sangat cocok untuk kondisi kapal yang minim sinyal internet.

---

<div align="center">
  <small>Dikembangkan untuk efisiensi operasional laut Indonesia.</small><br>
  <small>SailorCode</small>
</div>
