# Paket File Lengkap — Prioritas Tinggi + Menengah — EduCollab

Paket ini SUDAH DIGABUNG: berisi semua file untuk kelima fitur Prioritas
Tinggi SEKALIGUS kelima fitur Prioritas Menengah. Kamu tidak perlu lagi
memakai zip-zip sebelumnya -- cukup pakai paket ini saja dari awal.

## Daftar fitur yang tercakup

Prioritas Tinggi:
1. Halaman Daftar (Register)
2. Buat Kelas Baru (Guru)
3. Gabung Kelas dengan Kode (Siswa)
4. Buat & Mulai Aktivitas Pembelajaran (Guru)
5. Unggah Materi & RPP (Guru)

Prioritas Menengah:
6. Tombol Logout
7. Manajemen Kelompok Siswa (guru atur nomor kelompok)
8. Edit & Hapus Kelas
9. Lihat / Unduh File Materi
10. Pesan Error Berbahasa Indonesia (di semua form)

## Urutan penerapan

1. **Jalankan SQL**
   Buka Supabase Dashboard -> SQL Editor -> New query -> paste SELURUH isi
   file `supabase/tambahan_rls.sql` -> Run.
   (File ini sudah mencakup kebijakan untuk fitur Prioritas Tinggi MAUPUN
   Menengah sekaligus, urut dan diberi komentar per bagian.)

2. **Matikan verifikasi email (disarankan untuk tahap testing)**
   Supabase Dashboard -> Authentication -> Providers -> Email ->
   matikan toggle "Confirm email" -> Save.

3. **Upload file ke GitHub**
   Struktur folder di zip ini SAMA PERSIS dengan struktur folder `app/`
   di repo GitHub kamu (`github.com/pupr445/EduCollab`). Karena kamu
   BELUM pernah upload file-file ini sebelumnya, semuanya berstatus BARU
   di repo kamu -- cukup drag folder `app`, `lib`, dan `components` dari
   hasil ekstrak zip ini langsung ke GitHub uploader:

   - Buka repo di GitHub -> Add file -> Upload files
   - Drag folder `app`, `lib`, `components` (dari hasil ekstrak zip ini)
     ke area upload
   - Commit changes

   Daftar lengkap file yang akan ditambahkan:
   - app/register/page.tsx
   - app/login/page.tsx
   - app/dashboard/guru/page.tsx
   - app/dashboard/guru/CreateClassForm.tsx
   - app/dashboard/guru/ClassCard.tsx
   - app/dashboard/siswa/page.tsx
   - app/dashboard/siswa/JoinClassForm.tsx
   - app/kelas/[id]/aktivitas/page.tsx
   - app/kelas/[id]/anggota/page.tsx
   - app/kelas/[id]/anggota/MemberRow.tsx
   - app/materi/page.tsx
   - app/materi/UploadMaterialForm.tsx
   - app/materi/MaterialItem.tsx
   - components/LogoutButton.tsx
   - lib/errorMessages.ts

4. **Tunggu Cloudflare build ulang otomatis** (tab Deployments).

## Uji alur lengkap setelah deploy sukses

1. Daftar akun guru -> login
2. Di Dasbor Guru, klik "Keluar" untuk uji Logout, lalu login lagi
3. Buat Kelas Baru -> catat kode gabung
4. Klik "Edit" pada kelas tsb, ubah topik, Simpan
5. Daftar akun siswa (browser lain / mode incognito) -> login
6. Gabung Kelas pakai kode dari langkah 3
7. Login lagi sebagai guru -> klik "Kelola Anggota" pada kelas tsb ->
   atur nomor kelompok siswa yang baru gabung -> Simpan
8. Klik "Lihat Aktivitas" -> Mulai Aktivitas baru
9. Login sebagai siswa -> buka kelas yang sama -> kirim postingan,
   lihat apakah tayang real-time
10. Login sebagai guru -> buka Bank Materi -> Unggah Materi -> setelah
    berhasil, klik tombol "Unduh" pada materi tsb untuk menguji unduhan
11. Coba login dengan password salah untuk menguji pesan error
    berbahasa Indonesia

Kalau ada error saat build atau saat mencoba fitur di atas, screenshot
pesan errornya dan kirim ke Claude untuk dibantu debug.
