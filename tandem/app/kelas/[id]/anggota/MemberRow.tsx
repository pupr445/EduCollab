"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { translateError } from "@/lib/errorMessages";

export default function MemberRow({
  classId,
  studentId,
  studentName,
  groupNo,
}: {
  classId: string;
  studentId: string;
  studentName: string;
  groupNo: number | null;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [value, setValue] = useState(groupNo ?? 1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);

    const { error } = await supabase
      .from("class_members")
      .update({ group_no: value })
      .eq("class_id", classId)
      .eq("student_id", studentId);

    if (error) {
      setError(translateError(error));
      setSaving(false);
      return;
    }

    setSaved(true);
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-3 px-5 py-4">
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-900">{studentName}</p>
        {error && <p className="text-xs text-red-600">{error}</p>}
        {saved && !error && <p className="text-xs text-green-600">Tersimpan.</p>}
      </div>
      <label className="text-xs text-slate-500">Kelompok</label>
      <input
        type="number"
        min={1}
        value={value}
        onChange={(e) => {
          setValue(Number(e.target.value));
          setSaved(false);
        }}
        className="w-16 rounded-lg border border-slate-300 px-2 py-1 text-sm"
      />
      <button
        onClick={handleSave}
        disabled={saving}
        className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {saving ? "..." : "Simpan"}
      </button>
    </div>
  );
}
