import Link from "next/link";
import { GraduationCap, Users, FolderOpen, Radio } from "lucide-react";

const FEATURES = [
  {
    icon: Users,
    title: "Manajemen Skenario Pembelajaran",
    desc: "Rancang aktivitas kelas seperti Gallery Walk atau Numbered Heads Together, dan atur kelompok siswa secara sistematis.",
  },
  {
    icon: Radio,
    title: "Sinkronisasi Real-Time",
    desc: "Hasil kerja tiap kelompok tayang langsung ke layar kelompok lain tanpa perlu memuat ulang halaman.",
  },
  {
    icon: FolderOpen,
    title: "Bank Materi & RPP Terpusat",
    desc: "RPP, materi presentasi guru, dan portofolio tugas siswa tersimpan dalam satu wadah digital berbasis cloud.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-1 text-sm font-medium text-indigo-700">
          <GraduationCap className="h-4 w-4" />
          Tandem
        </div>
        <h1 className="mb-4 text-4xl font-semibold tracking-tight text-slate-900">
          Platform Perangkat Ajar Interaktif
        </h1>
        <p className="mx-auto mb-8 max-w-xl text-slate-500">
          Memfasilitasi pembelajaran kolaboratif secara digital — dirancang untuk kelas dengan
          diskusi dinamis dan interaksi sosial tinggi, seperti topik Perubahan Sosial Budaya.
        </p>
        <Link
          href="/login"
          className="inline-block rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Masuk ke Tandem
        </Link>
      </section>

      <section className="mx-auto max-w-5xl grid grid-cols-1 gap-6 px-6 pb-20 sm:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.title} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <f.icon className="mb-3 h-6 w-6 text-indigo-600" />
            <h3 className="mb-1 font-medium text-slate-900">{f.title}</h3>
            <p className="text-sm text-slate-500">{f.desc}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
