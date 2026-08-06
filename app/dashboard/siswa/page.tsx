export const runtime = 'edge';

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import JoinClassForm from "./JoinClassForm";
import LogoutButton from "@/components/LogoutButton";
import OrgSwitcher from "@/components/OrgSwitcher";

export default async function DashboardSiswa() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: memberships } = await supabase
    .from("class_members")
    .select("group_no, classes(id, name, topic)")
    .eq("student_id", user?.id ?? "");
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-slate-900">Dasbor Siswa</h1>
          <div className="flex items-center gap-2">
            <OrgSwitcher />
            <LogoutButton />
          </div>
        </div>
        <p className="mb-8 text-sm text-slate-500">Kelas dan kelompok yang kamu ikuti.</p>

        <div className="mb-8">
          <JoinClassForm />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {(memberships ?? []).map((m: any) => (
            <Link
              key={m.classes.id}
              href={`/kelas/${m.classes.id}/aktivitas`}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <h2 className="font-medium text-slate-900">{m.classes.name}</h2>
              <p className="text-sm text-slate-500">{m.classes.topic}</p>
              <p className="mt-3 text-xs text-slate-400">Kelompok {m.group_no}</p>
            </Link>
          ))}
          {(!memberships || memberships.length === 0) && (
            <div className="col-span-full rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
              Kamu belum bergabung ke kelas manapun. Minta kode gabung dari gurumu.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
