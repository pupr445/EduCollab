-- ============================================================
-- Tandem — Migrasi: Panel Masukan Istilah untuk Operator Tandem
-- Jalankan SETELAH migration_jenis_konten.sql.
--
-- Menambahkan peran "staf Tandem" (bukan admin organisasi — ini peran
-- di level aplikasi/operator produk) supaya masukan istilah dari
-- sector_label_feedback bisa dilihat lewat halaman di aplikasi,
-- bukan hanya lewat Supabase Table Editor secara manual.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Tandai akun sebagai staf Tandem
-- ------------------------------------------------------------
alter table profiles
  add column is_tandem_staff boolean not null default false;

-- ------------------------------------------------------------
-- 2. Jadikan akun ANDA sebagai staf pertama.
--    GANTI email di bawah dengan email akun Anda sebelum menjalankan,
--    lalu jalankan baris ini SENDIRIAN setelah migrasi ini selesai.
-- ------------------------------------------------------------
-- update profiles set is_tandem_staff = true
--   where id = (select id from auth.users where email = 'email_anda@contoh.com');

-- ------------------------------------------------------------
-- 3. Staf boleh membaca SELURUH umpan balik istilah (lintas organisasi)
-- ------------------------------------------------------------
create policy "staf tandem bisa membaca seluruh umpan balik istilah"
  on sector_label_feedback for select
  to authenticated
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.is_tandem_staff = true
    )
  );

-- ============================================================
-- Selesai. Setelah menjalankan baris UPDATE pada langkah 2 (dengan email
-- Anda), buka /staf/masukan-istilah di aplikasi untuk melihat seluruh
-- masukan yang masuk dari admin organisasi mana pun.
-- ============================================================
