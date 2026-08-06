"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  listSectorOptions,
  groupByCluster,
  type SectorDictionaryEntry,
} from "@/lib/sectorLabels";

export type OrgFieldsValue =
  | {
      mode: "buat";
      orgName: string;
      clusterKey: string; // "" = belum pilih, "lainnya" = kategori khusus
      sectorKey: string; // "" jika clusterKey === "lainnya"
      focusKegiatan: string;
      customLabels: { leader: string; member: string; group: string; content: string };
    }
  | { mode: "gabung"; inviteCode: string };

export default function OrgFields({
  value,
  onChange,
}: {
  value: OrgFieldsValue;
  onChange: (v: OrgFieldsValue) => void;
}) {
  const supabase = createClient();
  const [options, setOptions] = useState<SectorDictionaryEntry[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  useEffect(() => {
    listSectorOptions(supabase).then((rows) => {
      setOptions(rows);
      setLoadingOptions(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clusters = groupByCluster(options);

  return (
    <div className="mb-4 rounded-lg border border-slate-200 p-4">
      <div className="mb-3 flex gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="orgMode"
            checked={value.mode === "buat"}
            onChange={() =>
              onChange({
                mode: "buat",
                orgName: "",
                clusterKey: "",
                sectorKey: "",
                focusKegiatan: "",
                customLabels: { leader: "", member: "", group: "", content: "" },
              })
            }
          />
          Buat organisasi baru (jadi Admin)
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="orgMode"
            checked={value.mode === "gabung"}
            onChange={() => onChange({ mode: "gabung", inviteCode: "" })}
          />
          Gabung dengan kode
        </label>
      </div>

      {value.mode === "gabung" && (
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Kode Organisasi</label>
          <input
            type="text"
            required
            value={value.inviteCode}
            onChange={(e) => onChange({ mode: "gabung", inviteCode: e.target.value })}
            placeholder="mis. AB12CD"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <p className="mt-1 text-xs text-slate-400">Minta kode ini dari admin organisasi Anda.</p>
        </div>
      )}

      {value.mode === "buat" && (
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Nama Organisasi</label>
          <input
            type="text"
            required
            value={value.orgName}
            onChange={(e) => onChange({ ...value, orgName: e.target.value })}
            placeholder="mis. SMP Negeri 8 Kupang, Hima Wear Store"
            className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />

          <label className="mb-1 block text-sm font-medium text-slate-700">Kelompok Sektor</label>
          <select
            required
            value={value.clusterKey}
            onChange={(e) =>
              onChange({ ...value, clusterKey: e.target.value, sectorKey: "" })
            }
            className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">
              {loadingOptions ? "Memuat pilihan..." : "Pilih kelompok sektor"}
            </option>
            {clusters.map((c) => (
              <option key={c.clusterKey} value={c.clusterKey}>
                {c.clusterLabel}
              </option>
            ))}
            <option value="lainnya">Lainnya (khusus)</option>
          </select>

          {value.clusterKey && value.clusterKey !== "lainnya" && (
            <>
              <label className="mb-1 block text-sm font-medium text-slate-700">Sektor Spesifik</label>
              <select
                required
                value={value.sectorKey}
                onChange={(e) => onChange({ ...value, sectorKey: e.target.value })}
                className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Pilih sektor spesifik</option>
                {clusters
                  .find((c) => c.clusterKey === value.clusterKey)
                  ?.sectors.map((s) => (
                    <option key={s.sector_key} value={s.sector_key}>
                      {s.sector_label}
                    </option>
                  ))}
              </select>
            </>
          )}

          {value.clusterKey === "lainnya" && (
            <div className="mb-3 rounded-lg bg-slate-50 p-3">
              <p className="mb-2 text-xs text-slate-500">
                Sektor Anda belum ada di daftar baku. Isi istilah yang paling cocok untuk organisasi Anda:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {(["leader", "member", "group", "content"] as const).map((field) => (
                  <input
                    key={field}
                    type="text"
                    required
                    maxLength={30}
                    placeholder={
                      { leader: "Label Leader (mis. Ketua)", member: "Label Member (mis. Anggota)", group: "Label Group (mis. Regu)", content: "Label Content (mis. Panduan)" }[field]
                    }
                    value={value.customLabels[field]}
                    onChange={(e) =>
                      onChange({
                        ...value,
                        customLabels: { ...value.customLabels, [field]: e.target.value },
                      })
                    }
                    className="rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                ))}
              </div>
            </div>
          )}

          <label className="mb-1 block text-sm font-medium text-slate-700">
            Fokus Kegiatan <span className="font-normal text-slate-400">(opsional)</span>
          </label>
          <input
            type="text"
            value={value.focusKegiatan}
            onChange={(e) => onChange({ ...value, focusKegiatan: e.target.value })}
            placeholder="mis. Penyusunan RPP, Persiapan Tryout CPNS"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      )}
    </div>
  );
}
