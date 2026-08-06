"use client";

export const runtime = 'edge';

import { useEffect, useState, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { translateError } from "@/lib/errorMessages";
import { useActiveOrgLabels } from "@/lib/useActiveOrgLabels";

type Post = {
  id: string;
  group_no: number;
  content: string;
  created_at: string;
};

const METHOD_LABEL: Record<string, string> = {
  gallery_walk: "Gallery Walk",
  numbered_heads: "Numbered Heads Together",
  diskusi_bebas: "Diskusi Bebas",
};

export default function AktivitasKelas({ params }: { params: Promise<{ id: string }> }) {
  const { id: classId } = use(params);
  const supabase = createClient();
  const labels = useActiveOrgLabels();
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState("");
  const [groupNo, setGroupNo] = useState(1);
  const [activityId, setActivityId] = useState<string | null>(null);
  const [activityMeta, setActivityMeta] = useState<{ title: string; method: string } | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [checkingActivity, setCheckingActivity] = useState(true);

  const [title, setTitle] = useState("");
  const [method, setMethod] = useState("gallery_walk");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  async function loadActivity() {
    setCheckingActivity(true);
    const { data: activity } = await supabase
      .from("activities")
      .select("id, title, method")
      .eq("class_id", classId)
      .eq("status", "berlangsung")
      .limit(1)
      .maybeSingle();

    setActivityId(activity?.id ?? null);
    setActivityMeta(activity ? { title: activity.title, method: activity.method } : null);

    if (activity) {
      const { data: existingPosts } = await supabase
        .from("activity_posts")
        .select("id, group_no, content, created_at")
        .eq("activity_id", activity.id)
        .order("created_at", { ascending: true });
      setPosts(existingPosts ?? []);
    } else {
      setPosts([]);
    }
    setCheckingActivity(false);
  }

  useEffect(() => {
    async function checkOwner() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: kelas } = await supabase
        .from("classes")
        .select("owner_id")
        .eq("id", classId)
        .maybeSingle();

      setIsOwner(!!kelas && kelas.owner_id === user.id);
    }
    checkOwner();
  }, [classId, supabase]);

  useEffect(() => {
    loadActivity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, supabase]);

  useEffect(() => {
    if (!activityId) return;

    const channel = supabase
      .channel(`activity-${activityId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "activity_posts", filter: `activity_id=eq.${activityId}` },
        (payload) => setPosts((prev) => [...prev, payload.new as Post])
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

  async function handleCreateActivity(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);

    const { error } = await supabase.from("activities").insert({
      class_id: classId,
      title,
      method,
      status: "berlangsung",
    });

    if (error) {
      setCreateError(translateError(error));
      setCreating(false);
      return;
    }

    setTitle("");
    setCreating(false);
    loadActivity();
  }

  async function handleEndActivity() {
    if (!activityId) return;
    await supabase.from("activities").update({ status: "selesai" }).eq("id", activityId);
    loadActivity();
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-1 text-2xl font-semibold text-slate-900">Aktivitas {labels.group} — Live Collaboration</h1>
        <p className="mb-6 text-sm text-slate-500">
          Hasil kerja kelompok tayang langsung ke layar kelompok lain.
        </p>

        {checkingActivity && <p className="mb-6 text-sm text-slate-400">Memuat aktivitas...</p>}

        {!checkingActivity && !activityId && isOwner && (
          <form onSubmit={handleCreateActivity} className="mb-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-medium text-slate-900">Mulai Aktivitas Baru</h2>

            <label className="mb-1 block text-sm font-medium text-slate-700">Judul Aktivitas</label>
            <input
              type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="mis. Diskusi Perubahan Sosial Budaya"
              className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />

            <label className="mb-1 block text-sm font-medium text-slate-700">Metode</label>
            <select
              value={method} onChange={(e) => setMethod(e.target.value)}
              className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="gallery_walk">Gallery Walk</option>
              <option value="numbered_heads">Numbered Heads Together</option>
              <option value="diskusi_bebas">Diskusi Bebas</option>
            </select>

            {createError && <p className="mb-3 text-sm text-red-600">{createError}</p>}

            <button type="submit" disabled={creating} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
              {creating ? "Memulai..." : "Mulai Aktivitas"}
            </button>
          </form>
        )}

        {!checkingActivity && !activityId && !isOwner && (
          <div className="mb-8 rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
            Belum ada aktivitas berlangsung untuk {labels.group.toLowerCase()} ini.
          </div>
        )}

        {activityId && (
          <>
            <div className="mb-6 flex items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-indigo-900">{activityMeta?.title}</p>
                <p className="text-xs text-indigo-600">{METHOD_LABEL[activityMeta?.method ?? ""] ?? activityMeta?.method}</p>
              </div>
              {isOwner && (
                <button onClick={handleEndActivity} className="rounded-lg border border-indigo-300 bg-white px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100">
                  Selesaikan Aktivitas
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="mb-8 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-3">
                <label className="text-sm text-slate-600">Kelompok</label>
                <input
                  type="number" min={1} value={groupNo} onChange={(e) => setGroupNo(Number(e.target.value))}
                  className="w-20 rounded-lg border border-slate-300 px-2 py-1 text-sm"
                />
              </div>
              <textarea
                value={content} onChange={(e) => setContent(e.target.value)}
                placeholder="Tulis hasil diskusi atau umpan balik kelompokmu..."
                className="mb-3 w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                rows={3}
              />
              <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                Tayangkan ke Semua Kelompok
              </button>
            </form>

            <div className="space-y-3">
              {posts.map((p) => (
                <div key={p.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-indigo-600">Kelompok {p.group_no}</p>
                  <p className="text-sm text-slate-700">{p.content}</p>
                </div>
              ))}
              {posts.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                  Belum ada postingan pada aktivitas ini.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
