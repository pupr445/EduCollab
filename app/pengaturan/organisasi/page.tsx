export const runtime = "edge";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";
import OrganisasiSettingsForm from "./OrganisasiSettingsForm";

const ACTIVE_ORG_COOKIE = "tandem_active_org";

export default async function PengaturanOrganisasiPage() {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const activeOrgId = cookieStore.get(ACTIVE_ORG_COOKIE)?.value;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <p className="text-sm text-slate-500">Silakan login terlebih dahulu.</p>
      </main>
    );
  }

  if (!activeOrgId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <p className="text-sm text-slate-500">Anda belum tergabung di organisasi mana pun.</p>
      </main>
    );
  }

  const { data: membership } = await supabase
    .from("org_memberships")
    .select("org_role")
    .eq("user_id", user.id)
    .eq("org_id", activeOrgId)
    .maybeSingle();

  if (!membership || membership.org_role !== "admin") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-sm text-center">
          <p className="text-sm text-slate-500">
            Hanya admin organisasi yang bisa membuka halaman ini. Beralih ke organisasi tempat
            Anda menjadi admin lewat pemilih organisasi di navigasi atas.
          </p>
        </div>
      </main>
    );
  }

  const { data: org } = await supabase
    .from("organizations")
    .select(
      "id, name, sector_key, sector_status, focus_kegiatan, invite_code, custom_leader_label, custom_member_label, custom_group_label, custom_content_label"
    )
    .eq("id", activeOrgId)
    .single();

  const { data: sectorOptions } = await supabase
    .from("sector_dictionaries")
    .select("sector_key, cluster_key, cluster_label, sector_label")
    .order("cluster_key")
    .order("sector_label");

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Pengaturan Organisasi</h1>
            <p className="text-sm text-slate-500">Sektor & istilah yang tampil untuk seluruh anggota.</p>
          </div>
          <LogoutButton />
        </div>

        {org && (
          <OrganisasiSettingsForm org={org} sectorOptions={sectorOptions ?? []} />
        )}
      </div>
    </main>
  );
}
