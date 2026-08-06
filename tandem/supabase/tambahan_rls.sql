-- ============================================================
-- Tandem — Tambahan Kebijakan RLS (Prioritas Tinggi + Menengah)
-- Jalankan SELURUH isi file ini sekali jalan di:
-- Supabase Dashboard -> SQL Editor -> New query -> Run
-- ============================================================


-- ------------------------------------------------------------
-- BAGIAN 1 — untuk fitur Prioritas Tinggi
-- (Register, Buat Kelas, Gabung Kelas, Buat/Mulai Aktivitas, Unggah Materi)
-- ------------------------------------------------------------

-- profiles: izinkan user baru membuat profilnya sendiri saat daftar
create policy "Pengguna bisa buat profil sendiri saat daftar" on profiles
  for insert with check (id = auth.uid());

-- class_members: siswa bisa lihat & tambah keanggotaan dirinya sendiri
create policy "Siswa bisa lihat keanggotaan kelasnya" on class_members
  for select using (
    student_id = auth.uid()
    or class_id in (select id from classes where owner_id = auth.uid())
  );

create policy "Siswa bisa gabung kelas dengan kode" on class_members
  for insert with check (student_id = auth.uid());

-- activities: guru kelola aktivitas kelasnya; anggota kelas bisa melihat
create policy "Anggota kelas bisa lihat aktivitas" on activities
  for select using (
    class_id in (
      select id from classes where owner_id = auth.uid()
      union
      select class_id from class_members where student_id = auth.uid()
    )
  );

create policy "Guru bisa buat aktivitas kelasnya" on activities
  for insert with check (
    class_id in (select id from classes where owner_id = auth.uid())
  );

create policy "Guru bisa ubah status aktivitas kelasnya" on activities
  for update using (
    class_id in (select id from classes where owner_id = auth.uid())
  );

-- materials: guru bisa unggah materi ke kelasnya sendiri
create policy "Guru bisa unggah materi ke kelasnya" on materials
  for insert with check (
    uploaded_by = auth.uid()
    and class_id in (select id from classes where owner_id = auth.uid())
  );

-- Storage bucket "materials": izinkan pengguna login mengunggah & melihat berkas
create policy "Pengguna login bisa unggah ke bucket materials"
on storage.objects for insert
with check (bucket_id = 'materials' and auth.role() = 'authenticated');

create policy "Pengguna login bisa lihat berkas di bucket materials"
on storage.objects for select
using (bucket_id = 'materials' and auth.role() = 'authenticated');


-- ------------------------------------------------------------
-- BAGIAN 2 — untuk fitur Prioritas Menengah
-- (Kelola Kelompok Siswa)
-- ------------------------------------------------------------

-- Catatan: kebijakan "Edit & Hapus Kelas" oleh guru pemilik SUDAH otomatis
-- tercakup oleh kebijakan bawaan skema awal ("Guru pemilik bisa kelola
-- kelas" for all), begitu juga kebijakan "Lihat profil pengguna lain"
-- (untuk halaman Kelola Anggota) sudah tercakup kebijakan profiles select
-- bawaan skema awal. Jadi hanya 1 kebijakan baru yang perlu ditambahkan
-- di bagian ini:

create policy "Guru bisa ubah kelompok anggota kelasnya" on class_members
  for update using (
    class_id in (select id from classes where owner_id = auth.uid())
  );
