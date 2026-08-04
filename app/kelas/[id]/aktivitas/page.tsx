"use client";

import { useEffect, useState, use } from "react";
import { createClient } from "@/lib/supabase/client";

type Post = {
  id: string;
  group_no: number;
  content: string;
  created_at: string;
};

export default function AktivitasKelas({ params }: { params: Promise<{ id: string }> }) {
  const { id: classId } = use(params);
  const supabase = createClient();
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState("");
  const [groupNo, setGroupNo] = useState(1);
  const [activityId, setActivityId] = useState<string | null>(null);

  // Ambil aktivitas aktif untuk kelas ini, lalu subscribe ke postingan real-time.
  useEffect(() => {
    async function init() {
      const { data: activity } = await supabase
        .from("activities")
        .select("id")
        .eq("class_id", classId)
        .eq("status", "berlangsung")
        .limit(1)
        .maybeSingle();

      if (!activity) return;
      setActivityId(activity.id);

      const { data: existingPosts } = await supabase
        .from("activity_posts")
        .select("id, group_no, content, created_at")
        .eq("activity_id", activity.id)
        .order("created_at", { ascending: true });

      setPosts(existingPosts ?? []);
    }
    init();
  }, [classId, supabase]);

  // Sinkronisasi langsung: postingan kelompok lain tayang otomatis tanpa refresh.
  useEffect(() => {
    if (!activityId) return;

    const channel = supabase
      .channel(`activity-${activityId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "activity_posts",
          filter: `activity_id=eq.${activityId}`,
        },
        (payload) => {
          setPosts((prev) => [...prev, payload.new as Post]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activityId, supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!activityId || !content.trim()) return;

    await supabase.from("activity_posts").insert({
      activity_id: activityId,
      group_no: groupNo,
      content,
    });

    setContent("");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-1 text-2xl font-semibold text-slate-900">Aktivitas Kelas — Live Collaboration</h1>
        <p className="mb-6 text-sm text-slate-500">
          Hasil kerja kelompok tayang langsung ke layar kelompok lain (Gallery Walk).
        </p>

        <form onSubmit={handleSubmit} className="mb-8 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-3">
            <label className="text-sm text-slate-600">Kelompok</label>
            <input
              type="number"
              min={1}
              value={groupNo}
              onChange={(e) => setGroupNo(Number(e.target.value))}
              className="w-20 rounded-lg border border-slate-300 px-2 py-1 text-sm"
            />
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Tulis hasil diskusi atau umpan balik kelompokmu..."
            className="mb-3 w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            rows={3}
          />
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Tayangkan ke Semua Kelompok
          </button>
        </form>

        <div className="space-y-3">
          {posts.map((p) => (
            <div key={p.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-indigo-600">
                Kelompok {p.group_no}
              </p>
              <p className="text-sm text-slate-700">{p.content}</p>
            </div>
          ))}

          {posts.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
              Belum ada aktivitas berlangsung untuk kelas ini.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
