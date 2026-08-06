"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { translateError } from "@/lib/errorMessages";
import { groupByCluster, type SectorDictionaryEntry } from "@/lib/sectorLabels";

type Org = {
  id: string;
  name: string;
  sector_key: string | null;
  sector_status: "pending" | "confirmed";
  focus_kegiatan: string | null;
  invite_code: string;
  custom_leader_label: string | null;
  custom_member_label: string | null;
  custom_group_label: string | null;
  custom_content_label: string | null;
};

export default function OrganisasiSettingsForm({
  org,
  sectorOptions,
}: {
  org: Org;
  sectorOptions: SectorDictionaryEntry[];
}) {
  const supabase = createClient();
  const router = useRouter();
  const clusters = groupByCluster(sectorOptions);
  const currentEntry = sectorOptions.find((s) => s.sector_key === org.sector_key);

  const [clusterKey, setClusterKey] = useState(currentEntry?.cluster_key ?? "");
  const [sectorKey, setSectorKey] = useState(org.sector_key ?? "");
  const [focusKegiatan, setFocusKegiatan] = useState(org.focus_kegiatan ?? "");

  // Override label — boleh diisi untuk sektor manapun (keputusan 2.1), dikosongkan
  // berarti "pakai label bawaan sektor".
  const [overrideOn, setOverrideOn] = useState(
    Boolean(org.custom_leader_label || org.custom_member_label || org.custom_group_label || org.custom_content_label)
  );
  const [labels, setLabels] = useState({
    leader: org.custom_leader_label ?? "",
    member: org.custom_member_label ?? "",
    group: org.custom_group_label ?? "",
    content: org.custom_content_label ?? "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const { error: updateError } = await supabase
      .from("organizations")
      .update({
        sector_key: sectorKey || null,
        sector_status: sectorKey ? "confirmed" : org.sector_status,
        focus_kegiatan: focusKegiatan || null,
        custom_leader_label: overrideOn && labels.leader ? labels.leader : null,
        custom_member_label: overrideOn && labels.member ? labels.member : null,
        custom_group_label: overrideOn && labels.group ? labels.group : null,
        custom_content_label: overrideOn && labels.content ? labels.content : null,
      })
      .eq("id", org.id);

    if (updateError) {
      setError(translateError(updateError));
      setSaving(false);
      return;
    }

    setSavedAt(Date.now());
    setSaving(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-1 font-medium text-slate-900">{org.name}</h2>
        <p className="mb-4 text-sm text-slate-500">
          Kode undangan untuk anggota baru:{" "}
          <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-slate-700">{org.invite_code}</span>
        </p>

        {org.sector_status === "pending" && (
          <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
            Sektor organisasi belum diatur — seluruh anggota masih melihat istilah default (Admin,
            Anggota, Grup, Dokumen). Pilih sektor di bawah untuk menyesuaikan istilah.
          </p>
        )}

        <label className="mb-1 block text-sm font-medium text-slate-700">Kelompok Sektor</label>
        <select
          value={clusterKey}
          onChange={(e) => {
            setClusterKey(e.target.value);
            setSectorKey("");
          }}
          className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">Pilih kelompok sektor</option>
          {clusters.map((c) => (
            <option key={c.clusterKey} value={c.clusterKey}>
              {c.clusterLabel}
            </option>
          ))}
        </select>

        {clusterKey && (
          <>
            <label className="mb-1 block text-sm font-medium text-slate-700">Sektor Spesifik</label>
            <select
              value={sectorKey}
              onChange={(e) => setSectorKey(e.target.value)}
              className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Pilih sektor spesifik</option>
              {clusters
                .find((c) => c.clusterKey === clusterKey)
                ?.sectors.map((s) => (
                  <option key={s.sector_key} value={s.sector_key}>
                    {s.sector_label}
                  </option>
                ))}
            </select>
          </>
        )}

        <label className="mb-1 block text-sm font-medium text-slate-700">
          Fokus Kegiatan <span className="font-normal text-slate-400">(opsional)</span>
        </label>
        <input
          type="text"
          value={focusKegiatan}
          onChange={(e) => setFocusKegiatan(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <label className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700">
          <input type="checkbox" checked={overrideOn} onChange={(e) => setOverrideOn(e.target.checked)} />
          Ganti istilah bawaan sektor ini dengan istilah saya sendiri
        </label>

        {overrideOn && (
          <div className="grid grid-cols-2 gap-3">
            {(["leader", "member", "group", "content"] as const).map((field) => (
              <div key={field}>
                <label className="mb-1 block text-xs font-medium text-slate-500">
                  {{ leader: "Leader", member: "Member", group: "Group", content: "Content" }[field]}
                </label>
                <input
                  type="text"
                  maxLength={30}
                  value={labels[field]}
                  onChange={(e) => setLabels({ ...labels, [field]: e.target.value })}
                  placeholder="Kosongkan untuk pakai label bawaan"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {savedAt && <p className="text-sm text-green-600">Perubahan disimpan.</p>}

      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {saving ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </form>
  );
}
