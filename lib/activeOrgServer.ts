// Resolusi "keanggotaan organisasi aktif" di sisi server (Server Component).
// Prioritas: cookie tandem_active_org (jika valid) -> keanggotaan pertama pengguna.
// Dipakai di halaman dashboard & pengaturan supaya label & data yang ditampilkan
// selalu konsisten dengan organisasi yang sedang aktif.

import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import { ACTIVE_ORG_COOKIE } from "./activeOrgCookie";

export type ActiveMembership = { org_id: string; org_role: "admin" | "member" };

export async function getActiveMembership(
  supabase: SupabaseClient,
  userId: string
): Promise<ActiveMembership | null> {
  const cookieStore = await cookies();
  const cookieOrgId = cookieStore.get(ACTIVE_ORG_COOKIE)?.value;

  if (cookieOrgId) {
    const { data } = await supabase
      .from("org_memberships")
      .select("org_id, org_role")
      .eq("user_id", userId)
      .eq("org_id", cookieOrgId)
      .maybeSingle();
    if (data) return data as ActiveMembership;
  }

  const { data } = await supabase
    .from("org_memberships")
    .select("org_id, org_role")
    .eq("user_id", userId)
    .order("joined_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return (data as ActiveMembership) ?? null;
}
