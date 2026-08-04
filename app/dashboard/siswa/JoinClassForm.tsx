"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { translateError } from "@/lib/errorMessages";

export default function JoinClassForm() {
  const supabase = createClient();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
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

    const { data: kelas, error: findError } = await supabase
      .from("classes")
      .select("id")
      .eq("join_code", code.trim().toUpperCase())
      .maybeSingle();

    if (findError || !kelas) {
      setError("Kode gabung tidak ditemukan. Periksa kembali kode dari gurumu.");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("class_members").insert({
      class_id: kelas.id,
      student_id: user.id,
    });

    if (insertError) {
      setError(insertError.code === "23505" ? "Kamu sudah tergabung di kelas ini." : translateError(insertError));
      setLoading(false);
      return;
    }

    setCode("");
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
        + Gabung Kelas
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 font-medium text-slate-900">Gabung Kelas</h2>

      <label className="mb-1 block text-sm font-medium text-slate-700">Kode Gabung</label>
      <input
        type="text" required value={code} onChange={(e) => setCode(e.target.value)}
        placeholder="mis. AB12CD"
        className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
          {loading ? "Bergabung..." : "Gabung"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
          Batal
        </button>
      </div>
    </form>
  );
}
