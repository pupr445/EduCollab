"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { translateError } from "@/lib/errorMessages";

export default function RegisterPage() {
  const supabase = createClient();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("siswa");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(translateError(signUpError));
      setLoading(false);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        full_name: fullName,
        role,
      });

      if (profileError) {
        setError("Akun berhasil dibuat, tetapi profil gagal disimpan: " + translateError(profileError));
        setLoading(false);
        return;
      }
    }

    setSuccess(true);
    setLoading(false);
    setTimeout(() => router.push("/login"), 1500);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm"
      >
        <h1 className="mb-1 text-xl font-semibold text-slate-900">Daftar ke Tandem</h1>
        <p className="mb-6 text-sm text-slate-500">Buat akun baru sebagai guru atau siswa.</p>

        <label className="mb-1 block text-sm font-medium text-slate-700">Nama Lengkap</label>
        <input
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="Nama lengkap"
        />

        <label className="mb-1 block text-sm font-medium text-slate-700">Peran</label>
        <div className="mb-4 flex gap-4">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="radio" name="role" value="siswa" checked={role === "siswa"} onChange={() => setRole("siswa")} />
            Siswa
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="radio" name="role" value="guru" checked={role === "guru"} onChange={() => setRole("guru")} />
            Guru
          </label>
        </div>

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
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="Minimal 6 karakter"
        />

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
        {success && <p className="mb-4 text-sm text-green-600">Registrasi berhasil! Mengalihkan ke halaman login...</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Memproses..." : "Daftar"}
        </button>

        <p className="mt-4 text-center text-sm text-slate-500">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-medium text-indigo-600 hover:underline">
            Masuk di sini
          </Link>
        </p>
      </form>
    </main>
  );
}
