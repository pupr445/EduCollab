-- ============================================================
-- Tandem — Migrasi: Rilis Bertahap & Umpan Balik Istilah
-- Jalankan SETELAH migration_multi_sektor.sql dan migration_peran_opsional.sql.
--
-- Mewujudkan keputusan #5 & #9 pada Konsep Fitur Dropdown Registrasi v4:
--  - Kluster A (Pendidikan) sudah diuji lewat pengguna nyata (SMP Negeri 8
--    Kupang) -> ditandai 'penuh'.
--  - Kluster B, C, D belum divalidasi pengguna asli -> ditandai 'beta'.
--    TIDAK dibatasi/dikunci (admin tetap bebas memilihnya — daftar sektor
--    di halaman utama sudah terlanjur mengiklankan ke-32 sektor), hanya
--    diberi label transparan + jalur umpan balik supaya istilah bisa terus
--    disempurnakan lewat data, bukan tebakan.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Tahap rilis per sektor
-- ------------------------------------------------------------
alter table sector_dictionaries
  add column rollout_stage text not null default 'beta'
    check (rollout_stage in ('penuh', 'beta'));

update sector_dictionaries set rollout_stage = 'penuh'
  where cluster_key = 'pendidikan_pengembangan';
-- Kluster B, C, D tetap 'beta' (nilai default kolom di atas).

-- ------------------------------------------------------------
-- 2. sector_label_feedback — umpan balik admin atas istilah sektor beta
-- ------------------------------------------------------------
create table sector_label_feedback (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid references organizations(id) on delete set null,
  sector_key   text references sector_dictionaries(sector_key),
  field        text check (field in ('leader', 'member', 'group', 'content', 'umum')),
  comment      text not null,
  created_by   uuid references profiles(id),
  created_at   timestamptz not null default now()
);

alter table sector_label_feedback enable row level security;

-- Admin organisasi boleh mengirim umpan balik untuk organisasinya sendiri
create policy "admin organisasi bisa mengirim umpan balik istilah"
  on sector_label_feedback for insert
  to authenticated
  with check (
    created_by = auth.uid()
    and (
      org_id is null
      or exists (
        select 1 from org_memberships m
        where m.org_id = sector_label_feedback.org_id
          and m.user_id = auth.uid()
          and m.org_role = 'admin'
      )
    )
  );

-- Pengirim boleh melihat kembali umpan balik yang ia kirim sendiri
create policy "pengguna bisa melihat umpan balik yang ia kirim"
  on sector_label_feedback for select
  to authenticated
  using (created_by = auth.uid());

-- ============================================================
-- Selesai. Setelah migrasi ini, dropdown sektor akan menampilkan tanda
-- "(Beta)" untuk sektor di luar Kluster A, dan admin bisa mengirim
-- masukan singkat kapan saja lewat halaman Pengaturan Organisasi.
-- ============================================================
