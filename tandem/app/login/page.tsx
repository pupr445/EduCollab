"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { translateError } from "@/lib/errorMessages";
import { setActiveOrgCookie } from "@/lib/activeOrgCookie";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(translateError(error));
      setLoading(false);
      return;
    }

    // Peran (admin/member) & tujuan dasbor ditentukan dari keanggotaan organisasi
    // pengguna — bukan dari kolom profiles.role lama ("guru"/"siswa") yang sudah
    // tidak dipakai lagi (Konsep Fitur Dropdown Registrasi v4).
    const { data: membership } = await supabase
      .from("org_memberships")
      .select("org_id, org_role")
      .eq("user_id", data.user.id)
      .order("joined_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (membership) {
      setActiveOrgCookie(membership.org_id);
    }

    router.push(membership?.org_role === "admin" ? "/dashboard/guru" : "/dashboard/siswa");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm"
      >
        <h1 className="mb-1 text-xl font-semibold text-slate-900">Masuk ke Tandem</h1>
        <p className="mb-6 text-sm text-slate-500">
          Untuk guru dan siswa yang sudah terdaftar di kelas.
        </p>

        <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="nama@sekolah.id"
        />

        <label className="mb-1 block text-sm font-medium text-slate-700">Kata Sandi</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="••••••••"
        />

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Memproses..." : "Masuk"}
        </button>

        <p className="mt-4 text-center text-sm text-slate-500">
          Belum punya akun?{" "}
          <Link href="/register" className="font-medium text-indigo-600 hover:underline">
            Daftar di sini
          </Link>
        </p>
      </form>
    </main>
  );
}
