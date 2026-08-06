"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { translateError } from "@/lib/errorMessages";

type Kelas = { id: string; name: string; topic: string; join_code: string };

export default function ClassCard({ kelas }: { kelas: Kelas }) {
  const supabase = createClient();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(kelas.name);
  const [topic, setTopic] = useState(kelas.topic);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase
      .from("classes")
      .update({ name, topic })
      .eq("id", kelas.id);

    if (error) {
      setError(translateError(error));
      setLoading(false);
      return;
    }

    setEditing(false);
    setLoading(false);
    router.refresh();
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `Yakin ingin menghapus kelas "${kelas.name}"? Seluruh anggota, aktivitas, dan materi terkait kelas ini juga akan ikut terhapus.`
    );
    if (!confirmed) return;

    setDeleting(true);
    const { error } = await supabase.from("classes").delete().eq("id", kelas.id);

    if (error) {
      alert(translateError(error));
      setDeleting(false);
      return;
    }

    router.refresh();
  }

  if (editing) {
    return (
      <form onSubmit={handleSave} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <label className="mb-1 block text-sm font-medium text-slate-700">Nama Kelas</label>
        <input
          type="text" required value={name} onChange={(e) => setName(e.target.value)}
          className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />

        <label className="mb-1 block text-sm font-medium text-slate-700">Topik</label>
        <input
          type="text" required value={topic} onChange={(e) => setTopic(e.target.value)}
          className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />

        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
          <button type="button" onClick={() => setEditing(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
            Batal
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-medium text-slate-900">{kelas.name}</h2>
      <p className="text-sm text-slate-500">{kelas.topic}</p>
      <p className="mt-2 text-xs text-slate-400">Kode gabung: {kelas.join_code}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={`/kelas/${kelas.id}/aktivitas`} className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700">
          Lihat Aktivitas
        </Link>
        <Link href={`/kelas/${kelas.id}/anggota`} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100">
          Kelola Anggota
        </Link>
        <button onClick={() => setEditing(true)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100">
          Edit
        </button>
        <button onClick={handleDelete} disabled={deleting} className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50">
          {deleting ? "Menghapus..." : "Hapus"}
        </button>
      </div>
    </div>
  );
}
