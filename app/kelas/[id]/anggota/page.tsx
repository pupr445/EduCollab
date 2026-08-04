export const runtime = 'edge';

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import MemberRow from "./MemberRow";

export default async function AnggotaKelas({ params }: { params: Promise<{ id: string }> }) {
  const { id: classId } = await params;
  const supabase = await createClient();

  const { data: kelas } = await supabase
    .from("classes")
    .select("name, topic")
    .eq("id", classId)
    .maybeSingle();

  const { data: members } = await supabase
    .from("class_members")
    .select("class_id, student_id, group_no")
    .eq("class_id", classId);

  const studentIds = (members ?? []).map((m) => m.student_id);
  const { data: profiles } =
    studentIds.length > 0
      ? await supabase.from("profiles").select("id, full_name").in("id", studentIds)
      : { data: [] as { id: string; full_name: string }[] };

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <Link href="/dashboard/guru" className="mb-4 inline-block text-sm text-indigo-600 hover:underline">
          &larr; Kembali ke Dasbor Guru
        </Link>
        <h1 className="mb-1 text-2xl font-semibold text-slate-900">Anggota & Kelompok</h1>
        <p className="mb-6 text-sm text-slate-500">
          {kelas?.name} — {kelas?.topic}
        </p>

        <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white shadow-sm">
          {(members ?? []).map((m) => (
            <MemberRow
              key={`${m.class_id}-${m.student_id}`}
              classId={m.class_id}
              studentId={m.student_id}
              studentName={profileMap.get(m.student_id) ?? "(Nama tidak tersedia)"}
              groupNo={m.group_no}
            />
          ))}
          {(!members || members.length === 0) && (
            <div className="p-8 text-center text-sm text-slate-500">
              Belum ada siswa yang bergabung ke kelas ini. Bagikan kode gabung kelas kepada siswa.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
