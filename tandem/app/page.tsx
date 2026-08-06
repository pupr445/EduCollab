import type { CSSProperties } from "react";
import Link from "next/link";
import {
  Languages,
  SlidersHorizontal,
  Repeat,
  KeyRound,
  Radio,
  ArrowRight,
} from "lucide-react";

// Empat kelompok sektor & sampel sektor spesifik (mengikuti sector_dictionaries).
// Warna tiap kelompok dipakai konsisten di seluruh halaman ini.
const CLUSTERS = [
  {
    letter: "A",
    name: "Pendidikan & Pengembangan Kompetensi",
    color: "sector-edu",
    sectors: [
      "Pendidikan (SMP/SMA)",
      "Universitas / Pendidikan Tinggi",
      "Bootcamp / Kursus Non-formal",
      "Pelatihan Korporat",
      "Mentoring / Bimbingan Karier",
      "Pelatihan Sertifikasi Profesi",
    ],
  },
  {
    letter: "B",
    name: "Komunitas & Organisasi Non-Formal",
    color: "sector-community",
    sectors: [
      "Komunitas / Organisasi Non-profit",
      "Klub Olahraga / Hobi",
      "Organisasi Keagamaan",
      "Pramuka / Kepanduan",
      "Karang Taruna",
      "Ikatan Alumni",
      "Sanggar Kesenian",
      "Komunitas Kreator / Freelancer",
      "E-sports / Komunitas Gim",
    ],
  },
  {
    letter: "C",
    name: "Bisnis, Industri & Profesional",
    color: "sector-business",
    sectors: [
      "Tim Proyek / Kerja Internal",
      "UMKM / Koperasi",
      "Perbankan / Keuangan",
      "Asuransi",
      "Retail / Waralaba",
      "Perhotelan / Pariwisata",
      "Konstruksi",
      "Teknologi (Agile)",
      "Penerbangan",
      "Hukum",
      "Media / Jurnalistik",
    ],
  },
  {
    letter: "D",
    name: "Pemerintahan, Kesehatan & Sektor Publik",
    color: "sector-public",
    sectors: [
      "Pemerintahan / Instansi Publik",
      "Kesehatan / Rumah Sakit",
      "Pertanian / Penyuluhan",
      "Perikanan / Kelautan",
      "Militer / Kepolisian",
      "Politik / Kepartaian",
    ],
  },
] as const;

// PENTING: Tailwind memindai class name sebagai string literal utuh saat build.
// Class yang dibangun dari template string seperti `bg-${warna}` tidak akan
// terdeteksi. Peta di bawah menjaga setiap nama class tetap utuh di source.
const COLOR_STYLES: Record<
  (typeof CLUSTERS)[number]["color"],
  { dot: string; badgeBg: string; badgeText: string; chipBorder: string; chipBg: string }
> = {
  "sector-edu": {
    dot: "bg-sector-edu",
    badgeBg: "bg-sector-edu-soft",
    badgeText: "text-sector-edu",
    chipBorder: "border-sector-edu/25",
    chipBg: "bg-sector-edu-soft/60",
  },
  "sector-community": {
    dot: "bg-sector-community",
    badgeBg: "bg-sector-community-soft",
    badgeText: "text-sector-community",
    chipBorder: "border-sector-community/25",
    chipBg: "bg-sector-community-soft/60",
  },
  "sector-business": {
    dot: "bg-sector-business",
    badgeBg: "bg-sector-business-soft",
    badgeText: "text-sector-business",
    chipBorder: "border-sector-business/25",
    chipBg: "bg-sector-business-soft/60",
  },
  "sector-public": {
    dot: "bg-sector-public",
    badgeBg: "bg-sector-public-soft",
    badgeText: "text-sector-public",
    chipBorder: "border-sector-public/25",
    chipBg: "bg-sector-public-soft/60",
  },
};

// Empat "makna" dari satu kata yang sama — inti dari kartu entri kamus di hero.
const SENSES = [
  {
    color: "sector-edu",
    cluster: "Pendidikan",
    term: "Kelas",
    example: "Guru dan Siswa merancang kegiatan bersama.",
  },
  {
    color: "sector-community",
    cluster: "Komunitas",
    term: "Kelompok Kegiatan",
    example: "Ketua dan Anggota menjalankan program bersama.",
  },
  {
    color: "sector-business",
    cluster: "Bisnis",
    term: "Tim Proyek",
    example: "Lead dan Anggota Tim mengejar target bersama.",
  },
  {
    color: "sector-public",
    cluster: "Sektor Publik",
    term: "Angkatan",
    example: "Fasilitator dan Peserta menyelesaikan pelatihan bersama.",
  },
] as const;

const NOTES = [
  {
    icon: KeyRound,
    title: "Kode undangan, bukan formulir rumit",
    desc: "Bagikan satu kode singkat — siapa pun langsung tergabung ke organisasi yang tepat, lengkap dengan istilah yang sudah menyesuaikan.",
  },
  {
    icon: Languages,
    title: "Istilah menyesuaikan otomatis",
    desc: "Pilih sektor sekali saat mendaftar. Seluruh menu, judul, dan tombol ikut menyesuaikan — tanpa konfigurasi manual di tiap halaman.",
  },
  {
    icon: SlidersHorizontal,
    title: "Istilah baku kurang pas? Ubah sendiri",
    desc: "Admin bisa mengganti sebutan apa pun, kata demi kata, kapan saja lewat halaman pengaturan — tidak terkunci pada daftar baku.",
  },
  {
    icon: Repeat,
    title: "Satu akun, banyak organisasi",
    desc: "Aktif di sekolah sekaligus komunitas fotografi? Berpindah organisasi dalam satu klik, tanpa keluar akun atau login ulang.",
  },
] as const;

export default function Home() {
  return (
    <main className="bg-paper">
      {/* ---------- NAV ---------- */}
      <header className="sticky top-0 z-30 border-b border-line/70 bg-paper/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <TandemMark />
            <span className="font-display text-lg font-semibold tracking-tight text-ink">
              Tandem
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
            <a href="#cara-kerja" className="transition hover:text-ink">
              Cara kerja
            </a>
            <a href="#sektor" className="transition hover:text-ink">
              Sektor
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-full px-4 py-2 text-sm font-medium text-ink transition hover:bg-ink/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Daftar Gratis
            </Link>
          </div>
        </div>
      </header>

      {/* ---------- HERO ---------- */}
      <section className="mx-auto grid max-w-6xl gap-14 px-6 pb-24 pt-16 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:pt-24">
        <div>
          <p className="mb-5 font-mono text-xs uppercase tracking-[0.14em] text-muted">
            /ˈtan·dəm/ · n. — bekerja berdampingan, seirama
          </p>
          <h1 className="font-display text-[2.75rem] font-semibold leading-[1.08] tracking-tight text-ink sm:text-6xl">
            Sebut saja
            <br />
            sesuka Anda.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink/80">
            Guru menyebutnya <em className="font-display not-italic text-ink">kelas</em>. Manajer
            menyebutnya <em className="font-display not-italic text-ink">tim</em>. Ketua
            menyebutnya <em className="font-display not-italic text-ink">kelompok</em>.
          </p>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-muted">
            Tandem adalah satu platform kolaborasi untuk siapa pun yang memimpin sekelompok
            orang — sekolah, perusahaan, komunitas, hingga instansi pemerintah. Istilah di layar
            menyesuaikan otomatis dengan sektor Anda, supaya terasa dibangun khusus untuk
            organisasi Anda sejak hari pertama.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3.5 text-sm font-medium text-white shadow-sm transition hover:bg-brand/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Mulai Gratis
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#cara-kerja"
              className="text-sm font-medium text-ink underline decoration-line underline-offset-4 transition hover:decoration-ink"
            >
              Lihat cara kerjanya
            </a>
          </div>
        </div>

        {/* Kartu "entri kamus" — elemen tanda tangan halaman ini */}
        <div className="relative">
          <div className="rounded-[1.75rem] border border-line bg-paper-card p-7 shadow-[0_1px_0_0_rgba(22,23,31,0.04),0_20px_50px_-25px_rgba(22,23,31,0.35)] sm:p-9">
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-muted">
              Entri No. 019 · kata benda
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-ink sm:text-4xl">
              kelompok kerja
            </h2>
            <p className="mt-1 font-display italic text-muted">
              /kə.lom.pok kər.ja/
            </p>
            <p className="mt-4 text-sm leading-relaxed text-ink/75">
              sekumpulan orang yang bekerja menuju tujuan yang sama, dipimpin oleh satu orang
              atau lebih.
            </p>

            <div className="mt-6 border-t border-line pt-5">
              <p className="mb-3 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-muted">
                Menurut sektor Anda
              </p>
              <ol className="space-y-1">
                {SENSES.map((s, i) => (
                  <li
                    key={s.term}
                    className="sense-row rounded-xl border border-transparent px-3 py-2.5"
                    style={
                      {
                        animationDelay: `${i * -2}s`,
                        "--sense-line": `var(--color-${s.color})`,
                        "--sense-tint": `var(--color-${s.color}-soft)`,
                      } as CSSProperties
                    }
                  >
                    <div className="flex items-baseline gap-2.5">
                      <span
                        className={`mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full ${COLOR_STYLES[s.color].dot}`}
                        aria-hidden
                      />
                      <div className="min-w-0">
                        <p className="text-sm leading-snug">
                          <span className="font-mono text-[0.68rem] uppercase tracking-wide text-muted">
                            {i + 1}. {s.cluster} —{" "}
                          </span>
                          <span className="font-semibold text-ink">{s.term}</span>
                        </p>
                        <p className="mt-0.5 text-xs leading-snug text-muted">{s.example}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <p className="mt-5 flex items-center gap-1.5 font-mono text-[0.7rem] text-muted">
              <span aria-hidden>↳</span> 32 sektor tersedia hari ini — daftarnya terus bertambah.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- CALLOUT: REAL-TIME ---------- */}
      <section className="border-y border-line bg-ink py-10 text-paper">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-6">
          <Radio className="h-5 w-5 shrink-0 text-paper/60" aria-hidden />
          <p className="font-display text-lg leading-snug text-paper/90 sm:text-xl">
            Hasil kerja tiap kelompok tayang langsung ke layar kelompok lain — tanpa memuat ulang
            halaman.
          </p>
        </div>
      </section>

      {/* ---------- INDEKS SEKTOR ---------- */}
      <section id="sektor" className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-12 max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">Indeks</p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Empat kelompok besar. Puluhan sektor spesifik.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted">
            Setiap sektor punya padanan istilahnya sendiri — bukan tempelan terjemahan, tapi
            kosakata yang benar-benar dipakai orang di bidang itu. Belum menemukan sektor Anda?
            Pilih &ldquo;Lainnya&rdquo; saat mendaftar dan tentukan istilah Anda sendiri.
          </p>
        </div>

        <div className="grid gap-x-10 gap-y-12 sm:grid-cols-2">
          {CLUSTERS.map((c) => (
            <div key={c.letter}>
              <div className="mb-4 flex items-center gap-3">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-xs font-semibold ${COLOR_STYLES[c.color].badgeBg} ${COLOR_STYLES[c.color].badgeText}`}
                >
                  {c.letter}
                </span>
                <h3 className="font-display text-lg font-medium text-ink">{c.name}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {c.sectors.map((s) => (
                  <span
                    key={s}
                    className={`rounded-full border px-3 py-1 text-xs text-ink/80 ${COLOR_STYLES[c.color].chipBorder} ${COLOR_STYLES[c.color].chipBg}`}
                  >
                    {s}
                  </span>
                ))}
                <span className="rounded-full border border-dashed border-line px-3 py-1 text-xs text-muted">
                  + terus bertambah
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- CARA KERJA ---------- */}
      <section id="cara-kerja" className="border-t border-line bg-paper-card/60 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
              Catatan penggunaan
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Cara kerjanya
            </h2>
          </div>

          <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2">
            {NOTES.map((n) => (
              <div key={n.title} className="flex gap-4">
                <n.icon className="mt-1 h-5 w-5 shrink-0 text-brand" aria-hidden />
                <div>
                  <h3 className="font-display text-lg font-medium text-ink">{n.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{n.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- ASAL MULA ---------- */}
      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="font-display text-2xl italic leading-relaxed text-ink/85 sm:text-[1.75rem]">
          &ldquo;Tandem dimulai dari satu kelas IPS di SMP Negeri 8 Kupang, untuk memfasilitasi
          diskusi kelompok yang hidup dan terekam rapi. Ternyata, cara orang berkolaborasi tidak
          sejauh yang dikira antara satu sektor dengan sektor lainnya.&rdquo;
        </p>
      </section>

      {/* ---------- CTA AKHIR ---------- */}
      <section className="bg-ink py-24 text-paper">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-paper/50">
            /ˈtan·dəm/ · siap dipakai hari ini
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-5xl">
            Pilih sektor Anda.
            <br />
            Sisanya, Tandem yang urus.
          </h2>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-medium text-ink shadow-sm transition hover:bg-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Daftar Gratis
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-paper/25 px-6 py-3.5 text-sm font-medium text-paper transition hover:bg-paper/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Masuk ke akun
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- FOOTER ---------- */}
      <footer className="border-t border-line px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <TandemMark small />
            <span className="font-display text-sm font-medium text-ink">Tandem</span>
          </div>
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} Tandem. Dibuat untuk kerja tim lintas sektor.
          </p>
        </div>
      </footer>
    </main>
  );
}

// Wordmark kustom: dua lingkaran yang saling tumpang tindih, mewakili dua peran
// (Leader/Member) bekerja "in tandem" — sengaja bukan ikon generik agar tidak
// terasa spesifik ke satu sektor (mis. topi wisuda untuk pendidikan saja).
function TandemMark({ small = false }: { small?: boolean }) {
  const size = small ? 22 : 26;
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden>
      <circle cx="11" cy="14" r="8.5" stroke="var(--color-brand)" strokeWidth="1.6" />
      <circle cx="17" cy="14" r="8.5" stroke="var(--color-ink)" strokeWidth="1.6" />
    </svg>
  );
}
