import { createClient } from "@/lib/supabase/server";
import { FileText, FolderOpen, GraduationCap } from "lucide-react";

const KIND_LABEL: Record<string, string> = {
  rpp: "RPP",
  materi: "Materi Presentasi",
  portofolio: "Portofolio Siswa",
};

export default async function BankMateri() {
  const supabase = await createClient();
  const { data: materials } = await supabase
    .from("materials")
    .select("id, title, kind, created_at")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center gap-3">
          <FolderOpen className="h-6 w-6 text-indigo-600" />
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Bank Materi & RPP</h1>
            <p className="text-sm text-slate-500">
              Dokumen RPP, materi presentasi, dan portofolio tugas — tersimpan terpusat di cloud.
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white shadow-sm">
          {(materials ?? []).map((m) => (
            <div key={m.id} className="flex items-center gap-4 px-5 py-4">
              {m.kind === "rpp" ? (
                <GraduationCap className="h-5 w-5 shrink-0 text-slate-400" />
              ) : (
                <FileText className="h-5 w-5 shrink-0 text-slate-400" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">{m.title}</p>
                <p className="text-xs text-slate-500">{KIND_LABEL[m.kind] ?? m.kind}</p>
              </div>
              <span className="text-xs text-slate-400">
                {new Date(m.created_at).toLocaleDateString("id-ID")}
              </span>
            </div>
          ))}

          {(!materials || materials.length === 0) && (
            <div className="p-8 text-center text-sm text-slate-500">
              Belum ada materi diunggah. Guru dapat menambahkan RPP atau materi presentasi.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
