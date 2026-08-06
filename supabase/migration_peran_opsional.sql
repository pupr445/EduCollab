-- ============================================================
-- Tandem — Migrasi: Peran (profiles.role) Tidak Lagi Wajib
-- Jalankan SETELAH migration_multi_sektor.sql.
--
-- Alasan: kolom profiles.role ('guru'/'siswa') adalah sisa skema
-- sebelum ada organisasi. Sejak Konsep Fitur Dropdown Registrasi v4,
-- peran admin/anggota ditentukan dari org_memberships.org_role
-- (otomatis dari cara mendaftar: "Buat organisasi" vs "Gabung dengan
-- kode"), bukan dipilih manual sebagai "Guru"/"Siswa" saat registrasi
-- — supaya tidak memaksa istilah pendidikan ke sektor lain.
--
-- profiles.role TIDAK dihapus (supaya tidak menghapus data lama),
-- hanya tidak lagi wajib diisi saat registrasi.
-- ============================================================

alter table profiles alter column role drop not null;
alter table profiles alter column role drop default;
