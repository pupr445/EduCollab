export const runtime = "edge";

import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";

type FeedbackRow = {
  id: string;
  comment: string;
  field: string;
  created_at: string;
  sector_dictionaries: { sector_label: string; cluster_label: string } | null;
  organizations: { name: string } | null;
};

export default async function PanelMasukanIstilah() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <p className="text-sm text-slate-500">Silakan login terlebih dahulu.</p>
      </main>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_tandem_staff")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_tandem_staff) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <p className="max-w-sm text-center text-sm text-slate-500">
          Halaman ini khusus untuk staf Tandem. Kalau ini seharusnya bisa Anda akses, minta
          administrator menjalankan migrasi <code>migration_panel_masukan.sql</code> dan menandai
          akun Anda sebagai staf.
        </p>
      </main>
    );
  }

  const { data: feedback } = await supabase
    .from("sector_label_feedback")
    .select(
      "id, comment, field, created_at, sector_dictionaries ( sector_label, cluster_label ), organizations ( name )"
    )
    .order("created_at", { ascending: false })
    .returns<FeedbackRow[]>();

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Masukan Istilah Sektor</h1>
            <p className="text-sm text-slate-500">
              Seluruh umpan balik dari admin organisasi atas sektor beta — dasar untuk revisi
              kamus istilah.
            </p>
          </div>
          <LogoutButton />
        </div>

        <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white shadow-sm">
          {(feedback ?? []).map((f) => (
            <div key={f.id} className="px-5 py-4">
              <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
                  {f.sector_dictionaries?.cluster_label ?? "—"}
                </span>
                <span>{f.sector_dictionaries?.sector_label ?? "Sektor tidak diketahui"}</span>
                <span>·</span>
                <span>{f.organizations?.name ?? "Organisasi tidak diketahui"}</span>
                <span>·</span>
                <span>{new Date(f.created_at).toLocaleDateString("id-ID")}</span>
              </div>
              <p className="text-sm text-slate-800">{f.comment}</p>
            </div>
          ))}
          {(!feedback || feedback.length === 0) && (
            <div className="p-8 text-center text-sm text-slate-500">
              Belum ada masukan yang masuk.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
