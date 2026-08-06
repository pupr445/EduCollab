-- ============================================================
-- Tandem — Skema Database Awal (Supabase / PostgreSQL)
-- Sesuai Rencana Proyek bagian 3 (Backend & Database) & 4 (Konfigurasi Basis Data)
-- ============================================================

-- Peran pengguna: guru atau siswa. Terhubung ke auth.users bawaan Supabase Auth.
create type user_role as enum ('guru', 'siswa');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role user_role not null default 'siswa',
  created_at timestamptz not null default now()
);

-- Kelas yang dibuat oleh guru.
create table classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,                    -- contoh: "VIII-A IPS"
  topic text,                            -- contoh: "Perubahan Sosial Budaya"
  owner_id uuid not null references profiles(id) on delete cascade,
  join_code text unique not null,        -- kode untuk siswa bergabung
  created_at timestamptz not null default now()
);

-- Keanggotaan siswa dalam sebuah kelas.
create table class_members (
  class_id uuid references classes(id) on delete cascade,
  student_id uuid references profiles(id) on delete cascade,
  group_no int,                          -- nomor kelompok, untuk Numbered Heads Together / Gallery Walk
  primary key (class_id, student_id)
);

-- Bank Materi & RPP: dokumen yang diunggah guru (disimpan di Supabase Storage, baris ini metadatanya).
create table materials (
  id uuid primary key default gen_random_uuid(),
  class_id uuid references classes(id) on delete cascade,
  title text not null,
  kind text not null check (kind in ('rpp', 'materi', 'portofolio')),
  storage_path text not null,            -- path berkas di Supabase Storage bucket "materials"
  uploaded_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

-- Skenario/aktivitas pembelajaran (Gallery Walk, Numbered Heads Together, dst).
create table activities (
  id uuid primary key default gen_random_uuid(),
  class_id uuid references classes(id) on delete cascade,
  title text not null,
  method text not null check (method in ('gallery_walk', 'numbered_heads', 'diskusi_bebas')),
  status text not null default 'draft' check (status in ('draft', 'berlangsung', 'selesai')),
  created_at timestamptz not null default now()
);

-- Postingan/hasil kerja kelompok yang tayang real-time (live collaboration).
create table activity_posts (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid references activities(id) on delete cascade,
  group_no int not null,
  content text not null,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

-- ============================================================
-- Row Level Security (RLS) — aktifkan & batasi akses dasar
-- ============================================================
alter table profiles enable row level security;
alter table classes enable row level security;
alter table class_members enable row level security;
alter table materials enable row level security;
alter table activities enable row level security;
alter table activity_posts enable row level security;

create policy "Profil bisa dilihat semua pengguna login" on profiles
  for select using (auth.role() = 'authenticated');

create policy "Anggota kelas bisa melihat kelasnya" on classes
  for select using (
    owner_id = auth.uid()
    or id in (select class_id from class_members where student_id = auth.uid())
  );

create policy "Guru pemilik bisa kelola kelas" on classes
  for all using (owner_id = auth.uid());

create policy "Anggota kelas bisa melihat materi" on materials
  for select using (
    class_id in (
      select id from classes where owner_id = auth.uid()
      union
      select class_id from class_members where student_id = auth.uid()
    )
  );

create policy "Anggota aktivitas bisa lihat & kirim post" on activity_posts
  for all using (
    activity_id in (
      select a.id from activities a
      join classes c on c.id = a.class_id
      where c.owner_id = auth.uid()
         or c.id in (select class_id from class_members where student_id = auth.uid())
    )
  );

-- Aktifkan Realtime untuk tabel yang butuh sinkronisasi langsung.
alter publication supabase_realtime add table activity_posts;
alter publication supabase_realtime add table activities;
