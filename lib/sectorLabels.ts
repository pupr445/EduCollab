// Kamus istilah dinamis per organisasi.
// Urutan prioritas (Konsep Fitur Dropdown Registrasi v4, bagian 2.1 & 8):
//   1. Override admin per-field (custom_*_label) — berlaku untuk SEMUA sektor.
//   2. Label UI dari sector_dictionaries sesuai sector_key organisasi.
//   3. Label default sistem — dipakai bila organisasi belum pilih sektor
//      (sector_status = 'pending') atau data tidak ditemukan.

import type { SupabaseClient } from "@supabase/supabase-js";

export type SectorLabels = {
  leader: string;
  member: string;
  group: string;
  content: string;
};

export const DEFAULT_LABELS: SectorLabels = {
  leader: "Admin",
  member: "Anggota",
  group: "Grup",
  content: "Dokumen",
};

type OrgLabelRow = {
  sector_key: string | null;
  sector_status: "pending" | "confirmed";
  custom_leader_label: string | null;
  custom_member_label: string | null;
  custom_group_label: string | null;
  custom_content_label: string | null;
  sector_dictionaries: {
    leader_ui_label: string;
    member_ui_label: string;
    group_ui_label: string;
    content_ui_label: string;
  } | null;
};

export async function getOrgLabels(
  supabase: SupabaseClient,
  orgId: string | null | undefined
): Promise<SectorLabels> {
  if (!orgId) return DEFAULT_LABELS;

  const { data: org, error } = await supabase
    .from("organizations")
    .select(
      `sector_key, sector_status,
       custom_leader_label, custom_member_label, custom_group_label, custom_content_label,
       sector_dictionaries ( leader_ui_label, member_ui_label, group_ui_label, content_ui_label )`
    )
    .eq("id", orgId)
    .single<OrgLabelRow>();

  if (error || !org || org.sector_status === "pending") return DEFAULT_LABELS;

  const dict = org.sector_dictionaries; // null jika sector_key null / 'custom'

  return {
    leader: org.custom_leader_label || dict?.leader_ui_label || DEFAULT_LABELS.leader,
    member: org.custom_member_label || dict?.member_ui_label || DEFAULT_LABELS.member,
    group: org.custom_group_label || dict?.group_ui_label || DEFAULT_LABELS.group,
    content: org.custom_content_label || dict?.content_ui_label || DEFAULT_LABELS.content,
  };
}

// --- Tipe & util untuk dropdown dua tingkat (Kelompok Sektor -> Sektor Spesifik) ---

export type SectorDictionaryEntry = {
  sector_key: string;
  cluster_key: string;
  cluster_label: string;
  sector_label: string;
};

export async function listSectorOptions(
  supabase: SupabaseClient
): Promise<SectorDictionaryEntry[]> {
  const { data, error } = await supabase
    .from("sector_dictionaries")
    .select("sector_key, cluster_key, cluster_label, sector_label")
    .order("cluster_key")
    .order("sector_label");

  if (error || !data) return [];
  return data as SectorDictionaryEntry[];
}

export function groupByCluster(entries: SectorDictionaryEntry[]) {
  const map = new Map<string, { clusterLabel: string; sectors: SectorDictionaryEntry[] }>();
  for (const e of entries) {
    if (!map.has(e.cluster_key)) {
      map.set(e.cluster_key, { clusterLabel: e.cluster_label, sectors: [] });
    }
    map.get(e.cluster_key)!.sectors.push(e);
  }
  return Array.from(map.entries()).map(([clusterKey, v]) => ({
    clusterKey,
    clusterLabel: v.clusterLabel,
    sectors: v.sectors,
  }));
}
