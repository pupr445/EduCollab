"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { translateError } from "@/lib/errorMessages";
import { listContentTypeOptions } from "@/lib/sectorLabels";

type KelasOption = { id: string; name: string };

export default function UploadMaterialForm({
  contentLabel = "Materi",
  groupLabel = "Kelas",
  leaderLabel = "Guru",
  clusterKey = null,
}: {
  contentLabel?: string;
  groupLabel?: string;
  leaderLabel?: string;
  clusterKey?: string | null;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [classes, setClasses] = useState<KelasOption[]>([]);
  const [classId, setClassId] = useState("");
  const [title, setTitle] = useState("");
  const [kindOptions, setKindOptions] = useState<string[]>(["Dokumen"]);
  const [kind, setKind] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadClasses() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("classes").select("id, name").eq("owner_id", user.id);
      setClasses(data ?? []);
      if (data && data.length > 0) setClassId(data[0].id);
    }
    if (open) loadClasses();
  }, [open, supabase]);

  useEffect(() => {
    if (!open) return;
    listContentTypeOptions(supabase, clusterKey).then((opts) => {
      setKindOptions(opts);
      setKind((current) => current || opts[0] || "Dokumen");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, clusterKey]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !classId) return;
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Sesi login tidak ditemukan. Silakan login ulang.");
      setLoading(false);
      return;
    }

    const path = `${classId}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("materials").upload(path, file);

    if (uploadError) {
      setError(translateError(uploadError));
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("materials").insert({
      class_id: classId,
      title,
      kind,
      storage_path: path,
      uploaded_by: user.id,
    });

    if (insertError) {
      setError(translateError(insertError));
      setLoading(false);
      return;
    }

    setTitle("");
    setFile(null);
    setOpen(false);
    setLoading(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
        + Unggah {contentLabel}
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 font-medium text-slate-900">Unggah {contentLabel}</h2>

      {classes.length === 0 ? (
        <p className="mb-3 text-sm text-slate-500">
          Kamu belum memiliki {groupLabel.toLowerCase()}. Buat {groupLabel.toLowerCase()} terlebih dahulu
          di Dasbor {leaderLabel}.
        </p>
      ) : (
        <>
          <label className="mb-1 block text-sm font-medium text-slate-700">{groupLabel}</label>
          <select value={classId} onChange={(e) => setClassId(e.target.value)} className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <label className="mb-1 block text-sm font-medium text-slate-700">Judul</label>
          <input
            type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="mis. RPP Perubahan Sosial Budaya"
            className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />

          <label className="mb-1 block text-sm font-medium text-slate-700">Jenis</label>
          <select value={kind} onChange={(e) => setKind(e.target.value)} className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
            {kindOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>

          <label className="mb-1 block text-sm font-medium text-slate-700">Berkas</label>
          <input type="file" required onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </>
      )}

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button type="submit" disabled={loading || classes.length === 0} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
          {loading ? "Mengunggah..." : "Unggah"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
          Batal
        </button>
      </div>
    </form>
  );
}
