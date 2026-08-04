"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { translateError } from "@/lib/errorMessages";

function generateJoinCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export default function CreateClassForm() {
  const supabase = createClient();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Sesi login tidak ditemukan. Silakan login ulang.");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("classes").insert({
      name,
      topic,
      owner_id: user.id,
      join_code: generateJoinCode(),
    });

    if (insertError) {
      setError(translateError(insertError));
      setLoading(false);
      return;
    }

    setName("");
    setTopic("");
    setOpen(false);
    setLoading(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
      >
        + Buat Kelas Baru
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 font-medium text-slate-900">Buat Kelas Baru</h2>

      <label className="mb-1 block text-sm font-medium text-slate-700">Nama Kelas</label>
      <input
        type="text" required value={name} onChange={(e) => setName(e.target.value)}
        placeholder="mis. VIII-A IPS"
        className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />

      <label className="mb-1 block text-sm font-medium text-slate-700">Topik</label>
      <input
        type="text" required value={topic} onChange={(e) => setTopic(e.target.value)}
        placeholder="mis. Perubahan Sosial Budaya"
        className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
          {loading ? "Menyimpan..." : "Simpan Kelas"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
          Batal
        </button>
      </div>
    </form>
  );
}
