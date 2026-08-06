-- ============================================================
-- Tandem — Migrasi Multi-Sektor
-- Menambahkan lapisan "organisasi" + kamus istilah per sektor,
-- sesuai Konsep Fitur Dropdown Registrasi v4 (disetujui).
-- Jalankan SETELAH schema.sql dan tambahan_rls.sql.
-- ============================================================

-- ------------------------------------------------------------
-- 1. sector_dictionaries — kamus istilah baku per sektor
-- ------------------------------------------------------------
create table sector_dictionaries (
  sector_key       text primary key,
  cluster_key      text not null,
  cluster_label    text not null,
  sector_label     text not null,
  leader_label     text not null,   -- label referensi (boleh mengandung "/")
  member_label     text not null,
  group_label      text not null,
  content_label    text not null,
  leader_ui_label  text not null,   -- label bersih untuk kalimat UI (tanpa "/")
  member_ui_label  text not null,
  group_ui_label   text not null,
  content_ui_label text not null,
  created_at       timestamptz not null default now()
);

alter table sector_dictionaries enable row level security;

create policy "sector_dictionaries bisa dibaca semua pengguna login"
  on sector_dictionaries for select
  to authenticated using (true);

-- Formulir registrasi menampilkan dropdown sektor SEBELUM pengguna login,
-- jadi peran anon juga perlu bisa membaca (data ini murni referensi publik,
-- tidak berisi apa pun yang sensitif).
create policy "sector_dictionaries bisa dibaca publik (dipakai di form registrasi)"
  on sector_dictionaries for select
  to anon using (true);

-- ------------------------------------------------------------
-- 2. organizations — wadah/tenant di atas kelas/grup
-- ------------------------------------------------------------
create table organizations (
  id                   uuid primary key default gen_random_uuid(),
  name                 text not null,
  sector_key           text references sector_dictionaries(sector_key),
  sector_status        text not null default 'pending'
                         check (sector_status in ('pending', 'confirmed')),
  focus_kegiatan       text,
  invite_code          text unique not null,
  -- Override label (berlaku untuk semua sektor, termasuk 'custom' — keputusan 2.1 pada v4)
  custom_leader_label  text,
  custom_member_label  text,
  custom_group_label   text,
  custom_content_label text,
  created_by           uuid references profiles(id),
  created_at           timestamptz not null default now()
);

alter table organizations enable row level security;

-- ------------------------------------------------------------
-- 3. org_memberships — satu akun bisa tergabung di banyak organisasi
-- ------------------------------------------------------------
create table org_memberships (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles(id) on delete cascade,
  org_id     uuid not null references organizations(id) on delete cascade,
  org_role   text not null check (org_role in ('admin', 'member')),
  joined_at  timestamptz not null default now(),
  unique (user_id, org_id)
);

alter table org_memberships enable row level security;

-- ------------------------------------------------------------
-- 4. Hubungkan classes ke organizations (opsional — kelas lama tetap valid)
-- ------------------------------------------------------------
alter table classes
  add column org_id uuid references organizations(id) on delete set null;

-- ------------------------------------------------------------
-- 5. RLS: organizations & org_memberships
-- ------------------------------------------------------------

-- Anggota organisasi (admin & member) boleh melihat organisasinya sendiri
create policy "organisasi bisa dilihat anggotanya"
  on organizations for select
  to authenticated
  using (
    exists (
      select 1 from org_memberships m
      where m.org_id = organizations.id and m.user_id = auth.uid()
    )
  );

-- Siapa pun yang login boleh membuat organisasi baru (jadi admin-nya)
create policy "pengguna login bisa membuat organisasi"
  on organizations for insert
  to authenticated
  with check (created_by = auth.uid());

-- Hanya admin organisasi terkait yang boleh mengubah sektor/label
create policy "hanya admin organisasi yang boleh mengubah pengaturan"
  on organizations for update
  to authenticated
  using (
    exists (
      select 1 from org_memberships m
      where m.org_id = organizations.id
        and m.user_id = auth.uid()
        and m.org_role = 'admin'
    )
  );

-- Pengguna boleh melihat keanggotaannya sendiri
create policy "pengguna bisa melihat keanggotaan organisasinya"
  on org_memberships for select
  to authenticated
  using (user_id = auth.uid());

-- Pengguna boleh menambahkan dirinya sendiri sebagai anggota
-- (dipakai saat membuat organisasi baru sebagai admin, atau join lewat invite_code sebagai member)
create policy "pengguna bisa mendaftarkan dirinya ke organisasi"
  on org_memberships for insert
  to authenticated
  with check (user_id = auth.uid());

-- ------------------------------------------------------------
-- 6. Seed data — 32 sektor baku (mengikuti Daftar_Sektor_Tandem v4)
-- ------------------------------------------------------------
insert into sector_dictionaries
  (sector_key, cluster_key, cluster_label, sector_label, leader_label, member_label, group_label, content_label, leader_ui_label, member_ui_label, group_ui_label, content_ui_label)
values
  -- A. Pendidikan & Pengembangan Kompetensi
  ('edukasi_smp_sma', 'pendidikan_pengembangan', 'Pendidikan & Pengembangan Kompetensi', 'Pendidikan (SMP/SMA)', 'Guru', 'Siswa', 'Kelas', 'Materi/RPP', 'Guru', 'Siswa', 'Kelas', 'Materi'),
  ('pendidikan_tinggi', 'pendidikan_pengembangan', 'Pendidikan & Pengembangan Kompetensi', 'Universitas / Pendidikan Tinggi', 'Dosen', 'Mahasiswa', 'Kelas/Lab', 'Bahan Kuliah', 'Dosen', 'Mahasiswa', 'Kelas', 'Bahan Kuliah'),
  ('bootcamp_kursus', 'pendidikan_pengembangan', 'Pendidikan & Pengembangan Kompetensi', 'Bootcamp / Kursus Non-formal', 'Mentor', 'Peserta', 'Kelas', 'Materi', 'Mentor', 'Peserta', 'Kelas', 'Materi'),
  ('pelatihan_korporat', 'pendidikan_pengembangan', 'Pendidikan & Pengembangan Kompetensi', 'Pelatihan Korporat', 'Trainer', 'Peserta', 'Batch', 'Modul', 'Trainer', 'Peserta', 'Batch', 'Modul'),
  ('mentoring_karier', 'pendidikan_pengembangan', 'Pendidikan & Pengembangan Kompetensi', 'Mentoring / Bimbingan Karier', 'Mentor', 'Mentee', 'Kohort', 'Resource', 'Mentor', 'Mentee', 'Kohort', 'Resource'),
  ('sertifikasi_profesi', 'pendidikan_pengembangan', 'Pendidikan & Pengembangan Kompetensi', 'Pelatihan Sertifikasi Profesi', 'Fasilitator', 'Peserta', 'Sesi', 'Materi', 'Fasilitator', 'Peserta', 'Sesi', 'Materi'),

  -- B. Komunitas & Organisasi Non-Formal
  ('komunitas_nonprofit', 'komunitas_nonformal', 'Komunitas & Organisasi Non-Formal', 'Komunitas / Organisasi Non-profit', 'Koordinator', 'Anggota', 'Divisi', 'Panduan', 'Koordinator', 'Anggota', 'Divisi', 'Panduan'),
  ('klub_olahraga_hobi', 'komunitas_nonformal', 'Komunitas & Organisasi Non-Formal', 'Klub Olahraga / Hobi', 'Pelatih/Ketua', 'Anggota', 'Tim', 'Dokumen', 'Pelatih', 'Anggota', 'Tim', 'Dokumen'),
  ('organisasi_keagamaan', 'komunitas_nonformal', 'Komunitas & Organisasi Non-Formal', 'Organisasi Keagamaan', 'Pembina', 'Jemaat', 'Kelompok', 'Bahan Ajar', 'Pembina', 'Jemaat', 'Kelompok', 'Bahan Ajar'),
  ('pramuka_kepanduan', 'komunitas_nonformal', 'Komunitas & Organisasi Non-Formal', 'Pramuka / Kepanduan', 'Pembina', 'Anggota', 'Regu', 'Materi Kecakapan', 'Pembina', 'Anggota', 'Regu', 'Materi Kecakapan'),
  ('karang_taruna', 'komunitas_nonformal', 'Komunitas & Organisasi Non-Formal', 'Karang Taruna / Organisasi Pemuda Desa', 'Ketua', 'Anggota', 'Kelompok Kegiatan', 'Panduan', 'Ketua', 'Anggota', 'Kelompok Kegiatan', 'Panduan'),
  ('ikatan_alumni', 'komunitas_nonformal', 'Komunitas & Organisasi Non-Formal', 'Ikatan Alumni', 'Pengurus', 'Anggota Alumni', 'Angkatan', 'Dokumen', 'Pengurus', 'Anggota Alumni', 'Angkatan', 'Dokumen'),
  ('sanggar_kesenian', 'komunitas_nonformal', 'Komunitas & Organisasi Non-Formal', 'Sanggar Kesenian', 'Pelatih', 'Anggota Sanggar', 'Kelompok Latihan', 'Materi Latihan', 'Pelatih', 'Anggota Sanggar', 'Kelompok Latihan', 'Materi Latihan'),
  ('komunitas_kreator', 'komunitas_nonformal', 'Komunitas & Organisasi Non-Formal', 'Komunitas Kreator / Freelancer', 'Koordinator Proyek', 'Kolaborator', 'Tim Proyek', 'Aset/Berkas', 'Koordinator Proyek', 'Kolaborator', 'Tim Proyek', 'Berkas'),
  ('esports_gim', 'komunitas_nonformal', 'Komunitas & Organisasi Non-Formal', 'E-sports / Komunitas Gim', 'Coach/Kapten', 'Pemain', 'Squad', 'Strategi/Playbook', 'Coach', 'Pemain', 'Squad', 'Playbook'),

  -- C. Bisnis, Industri & Profesional
  ('tim_internal', 'bisnis_industri', 'Bisnis, Industri & Profesional', 'Tim Proyek / Kerja Internal', 'Lead', 'Anggota Tim', 'Proyek', 'Dokumen', 'Lead', 'Anggota Tim', 'Proyek', 'Dokumen'),
  ('umkm_koperasi', 'bisnis_industri', 'Bisnis, Industri & Profesional', 'UMKM / Koperasi', 'Pembina', 'Anggota Koperasi', 'Kelompok Usaha', 'Panduan', 'Pembina', 'Anggota Koperasi', 'Kelompok Usaha', 'Panduan'),
  ('perbankan_keuangan', 'bisnis_industri', 'Bisnis, Industri & Profesional', 'Perbankan / Keuangan', 'Trainer Cabang', 'Staf', 'Batch Pelatihan', 'SOP/Modul', 'Trainer Cabang', 'Staf', 'Batch Pelatihan', 'Modul'),
  ('asuransi', 'bisnis_industri', 'Bisnis, Industri & Profesional', 'Asuransi', 'Manajer Agensi', 'Agen', 'Tim Agen', 'Materi Produk', 'Manajer Agensi', 'Agen', 'Tim Agen', 'Materi Produk'),
  ('retail_waralaba', 'bisnis_industri', 'Bisnis, Industri & Profesional', 'Retail / Waralaba (Franchise)', 'Area Manager', 'Staf Toko', 'Cabang', 'SOP', 'Area Manager', 'Staf Toko', 'Cabang', 'SOP'),
  ('perhotelan_pariwisata', 'bisnis_industri', 'Bisnis, Industri & Profesional', 'Perhotelan / Pariwisata', 'Supervisor', 'Staf', 'Tim Shift', 'Panduan Layanan', 'Supervisor', 'Staf', 'Tim Shift', 'Panduan Layanan'),
  ('konstruksi', 'bisnis_industri', 'Bisnis, Industri & Profesional', 'Konstruksi / Proyek Bangunan', 'Manajer Proyek', 'Pekerja/Kontraktor', 'Tim Proyek', 'Dokumen Teknis', 'Manajer Proyek', 'Kontraktor', 'Tim Proyek', 'Dokumen Teknis'),
  ('teknologi_agile', 'bisnis_industri', 'Bisnis, Industri & Profesional', 'Teknologi / Tim Pengembang (Agile)', 'Product/Tech Lead', 'Developer', 'Sprint/Squad', 'Dokumentasi Teknis', 'Tech Lead', 'Developer', 'Sprint', 'Dokumentasi Teknis'),
  ('penerbangan', 'bisnis_industri', 'Bisnis, Industri & Profesional', 'Penerbangan / Maskapai', 'Instruktur', 'Kru', 'Batch Pelatihan', 'Manual/SOP', 'Instruktur', 'Kru', 'Batch Pelatihan', 'Manual'),
  ('hukum', 'bisnis_industri', 'Bisnis, Industri & Profesional', 'Hukum', 'Partner/Lead', 'Associate', 'Tim Kasus', 'Berkas Perkara', 'Partner', 'Associate', 'Tim Kasus', 'Berkas Perkara'),
  ('media_jurnalistik', 'bisnis_industri', 'Bisnis, Industri & Profesional', 'Media / Jurnalistik', 'Redaktur', 'Reporter', 'Tim Liputan', 'Draf/Naskah', 'Redaktur', 'Reporter', 'Tim Liputan', 'Naskah'),

  -- D. Pemerintahan, Kesehatan & Sektor Publik
  ('pemerintahan_publik', 'publik_kesehatan', 'Pemerintahan, Kesehatan & Sektor Publik', 'Pemerintahan / Instansi Publik', 'Widyaiswara/Fasilitator', 'Peserta Diklat', 'Angkatan', 'Materi Diklat', 'Fasilitator', 'Peserta Diklat', 'Angkatan', 'Materi Diklat'),
  ('kesehatan_rs', 'publik_kesehatan', 'Pemerintahan, Kesehatan & Sektor Publik', 'Kesehatan / Rumah Sakit', 'Kepala Unit', 'Tenaga Medis', 'Tim Jaga', 'SOP/Protokol', 'Kepala Unit', 'Tenaga Medis', 'Tim Jaga', 'Protokol'),
  ('pertanian_penyuluhan', 'publik_kesehatan', 'Pemerintahan, Kesehatan & Sektor Publik', 'Pertanian / Penyuluhan', 'Penyuluh', 'Petani', 'Kelompok Tani', 'Materi Penyuluhan', 'Penyuluh', 'Petani', 'Kelompok Tani', 'Materi Penyuluhan'),
  ('perikanan_kelautan', 'publik_kesehatan', 'Pemerintahan, Kesehatan & Sektor Publik', 'Perikanan / Kelautan', 'Penyuluh/Ketua Kelompok', 'Nelayan', 'Kelompok Nelayan', 'Materi Teknis', 'Penyuluh', 'Nelayan', 'Kelompok Nelayan', 'Materi Teknis'),
  ('militer_kepolisian', 'publik_kesehatan', 'Pemerintahan, Kesehatan & Sektor Publik', 'Militer / Kepolisian', 'Pelatih/Komandan', 'Anggota', 'Satuan/Unit', 'Modul Latihan', 'Komandan', 'Anggota', 'Unit', 'Modul Latihan'),
  ('politik_kepartaian', 'publik_kesehatan', 'Pemerintahan, Kesehatan & Sektor Publik', 'Politik / Kepartaian', 'Koordinator Kader', 'Kader/Relawan', 'Tim Wilayah', 'Materi Kaderisasi', 'Koordinator Kader', 'Kader', 'Tim Wilayah', 'Materi Kaderisasi');

-- ------------------------------------------------------------
-- 7. Fungsi bantu — generate invite_code unik 6 karakter
-- ------------------------------------------------------------
create or replace function generate_invite_code() returns text as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- tanpa 0/O/1/I agar tidak tertukar
  result text := '';
  i int;
begin
  for i in 1..6 loop
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  end loop;
  return result;
end;
$$ language plpgsql;

alter table organizations alter column invite_code set default generate_invite_code();

-- ------------------------------------------------------------
-- 8. Fungsi bantu — cari organisasi lewat kode undangan (untuk alur "Gabung")
-- Dibuat SECURITY DEFINER supaya pengguna yang belum jadi anggota tetap bisa
-- menemukan 1 baris organisasi lewat kodenya, TANPA membuka akses baca ke
-- seluruh tabel organizations (kebijakan RLS utama tetap ketat: hanya
-- anggota yang boleh SELECT langsung dari tabel organizations).
-- ------------------------------------------------------------
create or replace function find_organization_by_invite_code(code text)
returns table (id uuid, name text, sector_label text)
language sql
security definer
set search_path = public
as $$
  select o.id, o.name, sd.sector_label
  from organizations o
  left join sector_dictionaries sd on sd.sector_key = o.sector_key
  where o.invite_code = upper(trim(code))
  limit 1;
$$;

grant execute on function find_organization_by_invite_code(text) to authenticated;

-- ============================================================
-- Selesai. Setelah migrasi ini berjalan, organisasi lama (jika ada)
-- akan otomatis memakai istilah default sistem sampai admin melengkapi
-- sector_key lewat halaman Pengaturan Organisasi (sector_status = 'pending').
-- ============================================================
