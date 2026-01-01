# Laporan Perjalanan Kapal ( LPK )
**Sistem Manajemen Laporan Operasional Kapal Penumpang PELNI**

<div align="center">
  <img src="path/to/your/logo.png" alt="Logo Perusahaan" width="200" height="auto">
  <br>
  <br>
  <p>
    <b>Digitalisasi Arsip • Pencarian Cepat • Laporan Akurat</b>
  </p>
</div>

---

## 📖 Tentang Aplikasi

Aplikasi **Laporan Perjalanan Kapal** ini dirancang khusus untuk memenuhi kebutuhan operasional kapal penumpang, khususnya standar **PELNI (Pelayaran Nasional Indonesia)**.

Aplikasi ini bertujuan untuk mengatasi masalah manajemen data konvensional (file manual) yang seringkali berantakan, sulit dilacak, dan rentan hilang. Dengan sistem ini, seluruh data perjalanan kapal tersimpan dalam database lokal komputer yang aman, terstruktur, dan mudah diakses kembali.

### 🔥 Fitur Utama
* **Input Data Terpusat:** Form input yang disesuaikan dengan standar laporan perjalanan laut.
* **Database Lokal:** Penyimpanan data yang aman di komputer (tidak memerlukan internet terus-menerus).
* **Pencarian Cepat (Smart Search):** Mencari arsip laporan lama hanya dengan kata kunci (tanggal, nama pelabuhan, atau nomor voyage).
* **Export & Print:** Kemudahan mengubah data menjadi format siap cetak atau PDF untuk kebutuhan administrasi pelabuhan.
* **Manajemen Arsip:** Mencegah penumpukan file manual yang tidak teratur.

---

## 📸 Tampilan Aplikasi (Screenshots)

Berikut adalah antarmuka aplikasi saat digunakan:

### 1. Halaman Dashboard & Input Data
![Tampilan Input Data](assets/screenshot_input.png)
*Tampilan form input yang user-friendly untuk perwira kapal.*

### 2. Halaman Arsip & Pencarian
![Tampilan Pencarian](assets/screenshot_search.png)
*Fitur pencarian arsip laporan berdasarkan tanggal dan voyage.*

---

## 🚀 Cara Menggunakan Aplikasi

Ikuti langkah berikut untuk memulai pencatatan laporan:

1.  **Buka Aplikasi:** Jalankan aplikasi di komputer (Desktop/Web Local).
2.  **Input Laporan Baru:**
    * Klik menu **"Buat Laporan Baru"**.
    * Isi data perjalanan (Posisi, Cuaca, Status Mesin, Penumpang).
    * Klik **"Simpan ke Database"**.
4.  **Mencari & Cetak Laporan:**
    * Masuk ke menu **"Arsip Laporan"**.
    * Ketik nomor voyage atau tanggal di kolom pencarian.
    * Klik tombol **"Print"** atau **"Download PDF"**.

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
  * **JSON Handling:** Manipulasi data menggunakan format JSON standar industri.
<div align="center">
  <small>Dikembangkan untuk efisiensi operasional laut Indonesia.</small>
</div>
