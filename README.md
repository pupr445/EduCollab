# Tandem — Platform Kolaborasi Kelompok

Aplikasi web untuk memfasilitasi kerja kolaboratif secara digital: manajemen kelompok/kelas,
sinkronisasi real-time antar anggota, dan bank materi/dokumen terpusat.

Implementasi awal berfokus pada sektor pendidikan (tingkat SMP, mis. SMP Negeri 8 Kupang),
untuk materi dengan diskusi dinamis dan interaksi sosial tinggi (contoh: Perubahan Sosial
Budaya). Nama dan arsitektur produk (Tandem) dirancang agar dapat diperluas ke sektor lain
di luar pendidikan — lihat bagian "Rencana Perluasan Sektor" di bawah.

## Tech Stack

- **Frontend**: Next.js (App Router) + TypeScript + Tailwind CSS
- **Backend & Database**: Supabase (Auth, PostgreSQL, Realtime, Storage)
- **Version Control**: GitHub
- **Hosting**: Cloudflare Pages (auto-deploy dari GitHub)

## Struktur Proyek

```
app/
  page.tsx                     Beranda
  login/page.tsx               Login guru & siswa (Supabase Auth)
  dashboard/guru/page.tsx       Dasbor guru: daftar kelas & skenario
  dashboard/siswa/page.tsx      Dasbor siswa: kelas & kelompok yang diikuti
  kelas/[id]/aktivitas/page.tsx Live collaboration (Gallery Walk / Numbered Heads Together)
  materi/page.tsx               Bank Materi & RPP
lib/supabase/
  client.ts                    Supabase client untuk Client Components
  server.ts                    Supabase client untuk Server Components
supabase/
  schema.sql                   Skema tabel + Row Level Security + Realtime
```

## Langkah Inisiasi (Tahap 1)

1. **Instalasi prasyarat** — pasang [Node.js](https://nodejs.org) dan
   [VS Code](https://code.visualstudio.com) di komputer pengembang.
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Konfigurasi basis data**:
   - Buat proyek baru di [dashboard Supabase](https://supabase.com/dashboard).
   - Jalankan isi `supabase/schema.sql` di SQL Editor Supabase untuk membuat tabel
     `profiles`, `classes`, `class_members`, `materials`, `activities`, `activity_posts`.
   - Buat bucket Storage bernama `materials` untuk berkas RPP/PDF.
4. **Salin environment variable**:
   ```bash
   cp .env.example .env.local
   # isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```
5. **Jalankan secara lokal**:
   ```bash
   npm run dev
   ```
   Buka http://localhost:3000
6. **Integrasi hosting**:
   - Push proyek ke repositori GitHub.
   - Hubungkan repositori tersebut ke [Cloudflare Pages](https://pages.cloudflare.com)
     untuk auto-deploy setiap ada pembaruan kode.

## Peran Pengguna

- **Guru**: membuat kelas, merancang skenario pembelajaran, mengunggah RPP/materi.
- **Siswa**: bergabung ke kelas via kode gabung, berpartisipasi dalam aktivitas kelompok.

## Status

Ini adalah kerangka awal (scaffold) sesuai Tahap 1 rencana proyek. Fitur autentikasi,
manajemen kelas penuh (create/edit/delete), dan unggah berkas ke Storage masih perlu
dilengkapi pada tahap pengembangan berikutnya.
