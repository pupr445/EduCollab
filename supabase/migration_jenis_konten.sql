-- ============================================================
-- Tandem — Migrasi: Jenis Konten Mengikuti Kelompok Sektor
-- Jalankan SETELAH migration_rilis_bertahap.sql.
--
-- Sebelumnya, dropdown "Jenis" di Bank Konten terkunci ke 3 pilihan
-- pendidikan (RPP / Materi Presentasi / Portofolio Siswa) lewat CHECK
-- constraint di kolom materials.kind. Migrasi ini melepas kuncian itu
-- dan menggantinya dengan daftar pilihan yang mengikuti Kelompok Sektor
-- organisasi (Konsep Fitur Dropdown Registrasi v4).
--
-- Data lama (kind = 'rpp'/'materi'/'portofolio') TETAP tampil normal —
-- MaterialItem sudah punya fallback nama, jadi tidak perlu migrasi data.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Lepas kuncian lama pada materials.kind
-- ------------------------------------------------------------
do $$
declare
  nama_constraint text;
begin
  select conname into nama_constraint
  from pg_constraint
  where conrelid = 'materials'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) ilike '%kind%';

  if nama_constraint is not null then
    execute format('alter table materials drop constraint %I', nama_constraint);
  end if;
end $$;

-- ------------------------------------------------------------
-- 2. content_type_options — pilihan "Jenis" per Kelompok Sektor
-- ------------------------------------------------------------
create table content_type_options (
  id          uuid primary key default gen_random_uuid(),
  cluster_key text,              -- null = pilihan universal (fallback)
  label       text not null,
  sort_order  int not null default 0
);

alter table content_type_options enable row level security;

create policy "content_type_options bisa dibaca semua pengguna login"
  on content_type_options for select
  to authenticated using (true);

insert into content_type_options (cluster_key, label, sort_order) values
  -- A. Pendidikan & Pengembangan Kompetensi (nama sama seperti sebelumnya, supaya konsisten)
  ('pendidikan_pengembangan', 'RPP', 1),
  ('pendidikan_pengembangan', 'Materi Presentasi', 2),
  ('pendidikan_pengembangan', 'Portofolio Peserta', 3),

  -- B. Komunitas & Organisasi Non-Formal
  ('komunitas_nonformal', 'Panduan Kegiatan', 1),
  ('komunitas_nonformal', 'Dokumentasi', 2),
  ('komunitas_nonformal', 'Laporan Kegiatan', 3),

  -- C. Bisnis, Industri & Profesional
  ('bisnis_industri', 'Dokumen Kerja', 1),
  ('bisnis_industri', 'SOP / Panduan', 2),
  ('bisnis_industri', 'Laporan Proyek', 3),

  -- D. Pemerintahan, Kesehatan & Sektor Publik
  ('publik_kesehatan', 'Materi / Modul', 1),
  ('publik_kesehatan', 'SOP / Protokol', 2),
  ('publik_kesehatan', 'Laporan', 3),

  -- Universal (dipakai bila organisasi belum pilih sektor, atau pilih "Lainnya")
  (null, 'Dokumen', 1),
  (null, 'Panduan', 2),
  (null, 'Laporan', 3);

-- ============================================================
-- Selesai. Dropdown "Jenis" di Bank Konten sekarang mengikuti Kelompok
-- Sektor organisasi aktif. Menambah pilihan baru cukup lewat insert baris
-- di content_type_options, tanpa perlu ubah kode atau deploy ulang.
-- ============================================================
