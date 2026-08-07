export const runtime = 'edge';

import { createClient } from "@/lib/supabase/server";
import { FolderOpen } from "lucide-react";
import UploadMaterialForm from "./UploadMaterialForm";
import MaterialItem from "./MaterialItem";
import LogoutButton from "@/components/LogoutButton";
import { getActiveMembership } from "@/lib/activeOrgServer";
import { getOrgLabels } from "@/lib/sectorLabels";

export default async function BankMateri() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const membership = user ? await getActiveMembership(supabase, user.id) : null;
  const labels = await getOrgLabels(supabase, membership?.org_id);

  const { data: materials } = await supabase
    .from("materials")
    .select("id, title, kind, created_at, storage_path")
    .order("created_at", { ascending: false });
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <FolderOpen className="h-6 w-6 text-indigo-600" />
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Bank {labels.content}</h1>
              <p className="text-sm text-slate-500">
                Dokumen dan berkas kerja — tersimpan terpusat di cloud.
              </p>
            </div>
          </div>
          <LogoutButton />
        </div>

        <div className="mb-8">
          <UploadMaterialForm
            contentLabel={labels.content}
            groupLabel={labels.group}
            leaderLabel={labels.leader}
            clusterKey={labels.clusterKey}
          />
        </div>

        <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white shadow-sm">
          {(materials ?? []).map((m) => (
            <MaterialItem key={m.id} material={m} />
          ))}
          {(!materials || materials.length === 0) && (
            <div className="p-8 text-center text-sm text-slate-500">
              Belum ada {labels.content.toLowerCase()} diunggah. {labels.leader} dapat menambahkan
              berkas di sini.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
