export const runtime = 'edge';

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import CreateClassForm from "./CreateClassForm";
import ClassCard from "./ClassCard";
import LogoutButton from "@/components/LogoutButton";
import OrgSwitcher from "@/components/OrgSwitcher";
import { getActiveMembership } from "@/lib/activeOrgServer";
import { getOrgLabels } from "@/lib/sectorLabels";

export default async function DashboardGuru() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const membership = user ? await getActiveMembership(supabase, user.id) : null;
  const labels = await getOrgLabels(supabase, membership?.org_id);

  const { data: classes } = await supabase
    .from("classes")
    .select("id, name, topic, join_code")
    .eq("owner_id", user?.id ?? "");
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Dasbor {labels.leader}</h1>
            <p className="text-sm text-slate-500">
              Kelola {labels.group.toLowerCase()}, skenario kegiatan, dan bank {labels.content.toLowerCase()}.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <OrgSwitcher />
            <Link
              href="/pengaturan/organisasi"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Pengaturan Organisasi
            </Link>
            <Link
              href="/materi"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Bank {labels.content}
            </Link>
            <LogoutButton />
          </div>
        </div>

        <div className="mb-8">
          <CreateClassForm groupLabel={labels.group} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {(classes ?? []).map((c) => (
            <ClassCard key={c.id} kelas={c} />
          ))}
          {(!classes || classes.length === 0) && (
            <div className="col-span-full rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
              Belum ada {labels.group.toLowerCase()}. Buat {labels.group.toLowerCase()} baru untuk mulai
              merancang kegiatan (mis. Gallery Walk atau Numbered Heads Together).
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
