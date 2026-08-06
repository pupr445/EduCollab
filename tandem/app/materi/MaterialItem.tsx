"use client";

import { useState } from "react";
import { FileText, GraduationCap, Download } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { translateError } from "@/lib/errorMessages";

const KIND_LABEL: Record<string, string> = {
  rpp: "RPP",
  materi: "Materi Presentasi",
  portofolio: "Portofolio Siswa",
};

type Material = {
  id: string;
  title: string;
  kind: string;
  created_at: string;
  storage_path: string | null;
};

export default function MaterialItem({ material }: { material: Material }) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    if (!material.storage_path) return;
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.storage
      .from("materials")
      .createSignedUrl(material.storage_path, 60);

    if (error || !data) {
      setError(translateError(error));
      setLoading(false);
      return;
    }

    window.open(data.signedUrl, "_blank");
    setLoading(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-4 px-5 py-4">
      {material.kind === "rpp" ? (
        <GraduationCap className="h-5 w-5 shrink-0 text-slate-400" />
      ) : (
        <FileText className="h-5 w-5 shrink-0 text-slate-400" />
      )}
      <div className="min-w-[10rem] flex-1">
        <p className="text-sm font-medium text-slate-900">{material.title}</p>
        <p className="text-xs text-slate-500">{KIND_LABEL[material.kind] ?? material.kind}</p>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
      <span className="text-xs text-slate-400">
        {new Date(material.created_at).toLocaleDateString("id-ID")}
      </span>
      {material.storage_path && (
        <button
          onClick={handleDownload}
          disabled={loading}
          className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
        >
          <Download className="h-3.5 w-3.5" />
          {loading ? "..." : "Unduh"}
        </button>
      )}
    </div>
  );
}
