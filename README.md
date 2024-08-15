# Prototipe Web GIS

Ini adalah prototipe Web GIS yang dibangun menggunakan Leaflet.js dengan beberapa opsi basemap dan kemampuan untuk memuat serta mengontrol layer GeoJSON. Proyek ini dilengkapi dengan sidebar untuk kontrol layer dan mendukung desain responsif untuk perangkat mobile dan desktop.

## Fitur

- **Beberapa Basemap:** Beralih antara berbagai basemap seperti OpenStreetMap, Esri World Imagery, OpenTopoMap, dan Thunderforest Outdoors.
- **Dukungan Layer GeoJSON:** Memuat dan menampilkan layer GeoJSON di peta dengan opsi pengaturan opasitas dan toggle.
- **Desain Responsif:** Dioptimalkan untuk tampilan mobile dan desktop, dengan sidebar yang secara otomatis menyesuaikan berdasarkan ukuran layar.
- **Marker dan Pop-up Kustom:** Menampilkan marker kustom dengan informasi detail di dalam pop-up, termasuk data dinamis seperti jumlah populasi.

## Instalasi

1. **Kloning repository:**
   ```bash
   git clone https://github.com/yourusername/web-gis-prototype.git


Masuk ke direktori proyek:

bash

    cd web-gis-prototype

    Buka index.html di browser web pilihan Anda:
    Cukup buka file index.html di browser Anda untuk melihat aplikasi Web GIS.

Penggunaan

    Pilih Basemap: Gunakan menu dropdown di sidebar untuk beralih antara basemap yang berbeda.
    Muat Data GeoJSON: Pilih file GeoJSON dari dropdown untuk memuat dan menampilkan data spasial di peta.
    Kontrol Layer: Aktifkan atau nonaktifkan visibilitas layer tertentu dan atur opasitasnya menggunakan checkbox dan slider di sidebar.

Ketergantungan

    Leaflet.js: Pustaka JavaScript untuk peta interaktif.
    Bootstrap 4: Framework CSS untuk desain responsif.
    Leaflet Providers: Plugin Leaflet untuk menambahkan berbagai basemap dengan mudah.
    Font Awesome: Untuk ikon pada tombol toggle sidebar.

Struktur File

graphql

web-gis-prototype/
│
├── css/
│   └── style.css         # Gaya kustom untuk aplikasi
│
├── data/
│   └── Book1_02.geojson  # Contoh file GeoJSON untuk data spasial
│
├── js/
│   └── script.js         # File JavaScript utama untuk mengontrol peta
│
├── index.html            # File HTML utama untuk meluncurkan aplikasi
└── README.md             # Dokumentasi proyek

Cara Kerja

    Inisialisasi Peta: Peta diinisialisasi menggunakan Leaflet.js dan diatur pada lokasi default.
    Kontrol Basemap: Menu dropdown memungkinkan pengguna untuk beralih antara berbagai basemap menggunakan plugin Leaflet Providers.
    Pemuatan GeoJSON: Pengguna dapat memilih file GeoJSON untuk memuat data ke peta, dengan setiap fitur ditampilkan sebagai marker kustom.
    Desain Responsif: Layout sepenuhnya responsif, dengan penyesuaian untuk layar yang lebih kecil, termasuk reposisi kontrol zoom dan perubahan ukuran pop-up.

Lisensi

Proyek ini dilisensikan di bawah Lisensi MIT - lihat file LICENSE untuk detail lebih lanjut.


README ini akan membantu pengguna lain dan Anda sendiri untuk memahami dan menggunakan proyek dengan mudah dalam bahasa Indonesia.
