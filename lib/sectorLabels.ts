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
  clusterKey: string | null;
};

export const DEFAULT_LABELS: SectorLabels = {
  leader: "Admin",
  member: "Anggota",
  group: "Grup",
  content: "Dokumen",
  clusterKey: null,
};

type OrgLabelRow = {
  sector_key: string | null;
  sector_status: "pending" | "confirmed";
  custom_leader_label: string | null;
  custom_member_label: string | null;
  custom_group_label: string | null;
  custom_content_label: string | null;
  sector_dictionaries: {
    cluster_key: string;
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
       sector_dictionaries ( cluster_key, leader_ui_label, member_ui_label, group_ui_label, content_ui_label )`
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
    clusterKey: dict?.cluster_key ?? null,
  };
}

// --- Tipe & util untuk dropdown dua tingkat (Kelompok Sektor -> Sektor Spesifik) ---

export type SectorDictionaryEntry = {
  sector_key: string;
  cluster_key: string;
  cluster_label: string;
  sector_label: string;
  rollout_stage: "penuh" | "beta";
};

export async function listSectorOptions(
  supabase: SupabaseClient
): Promise<SectorDictionaryEntry[]> {
  const { data, error } = await supabase
    .from("sector_dictionaries")
    .select("sector_key, cluster_key, cluster_label, sector_label, rollout_stage")
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

// Kirim umpan balik istilah untuk sektor beta (Konsep Fitur Dropdown Registrasi v4,
// bagian 9 — rencana validasi istilah dengan pengguna nyata).
export async function submitSectorFeedback(
  supabase: SupabaseClient,
  params: {
    orgId: string | null;
    sectorKey: string;
    field: "leader" | "member" | "group" | "content" | "umum";
    comment: string;
    userId: string;
  }
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from("sector_label_feedback").insert({
    org_id: params.orgId,
    sector_key: params.sectorKey,
    field: params.field,
    comment: params.comment,
    created_by: params.userId,
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// Pilihan "Jenis" konten mengikuti Kelompok Sektor organisasi aktif — bukan lagi
// terkunci ke 3 pilihan pendidikan. clusterKey null (organisasi belum pilih sektor,
// atau memilih "Lainnya") jatuh ke pilihan universal.
export async function listContentTypeOptions(
  supabase: SupabaseClient,
  clusterKey: string | null
): Promise<string[]> {
  const { data, error } = await supabase
    .from("content_type_options")
    .select("cluster_key, label, sort_order")
    .order("sort_order");

  if (error || !data) return ["Dokumen"];

  const forCluster = data.filter((r) => r.cluster_key === clusterKey);
  const universal = data.filter((r) => r.cluster_key === null);
  const rows = forCluster.length > 0 ? forCluster : universal;

  return rows.map((r) => r.label as string);
}
