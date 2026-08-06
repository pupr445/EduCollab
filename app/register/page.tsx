"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { translateError } from "@/lib/errorMessages";
import { setActiveOrgCookie } from "@/lib/activeOrgCookie";
import OrgFields, { type OrgFieldsValue } from "./OrgFields";

export default function RegisterPage() {
  const supabase = createClient();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [org, setOrg] = useState<OrgFieldsValue>({
    mode: "buat",
    orgName: "",
    clusterKey: "",
    sectorKey: "",
    focusKegiatan: "",
    customLabels: { leader: "", member: "", group: "", content: "" },
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validasi organisasi sebelum membuat akun, supaya tidak ada akun "nyangkut"
    // tanpa organisasi jika validasi gagal di tengah jalan.
    if (org.mode === "buat" && org.clusterKey === "lainnya") {
      const { leader, member, group, content } = org.customLabels;
      if (!leader || !member || !group || !content) {
        setError("Lengkapi keempat label istilah (Leader, Member, Group, Content) untuk sektor khusus.");
        setLoading(false);
        return;
      }
    }
    if (org.mode === "buat" && org.clusterKey && org.clusterKey !== "lainnya" && !org.sectorKey) {
      setError("Pilih Sektor Spesifik, atau pilih \"Lainnya (khusus)\" di Kelompok Sektor.");
      setLoading(false);
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });

    if (signUpError) {
      setError(translateError(signUpError));
      setLoading(false);
      return;
    }

    if (!data.user) {
      setError("Registrasi gagal. Silakan coba lagi.");
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      full_name: fullName,
    });

    if (profileError) {
      setError("Akun berhasil dibuat, tetapi profil gagal disimpan: " + translateError(profileError));
      setLoading(false);
      return;
    }

    if (org.mode === "buat") {
      const isCustom = org.clusterKey === "lainnya";
      const { data: newOrg, error: orgError } = await supabase
        .from("organizations")
        .insert({
          name: org.orgName,
          sector_key: isCustom ? null : org.sectorKey,
          sector_status: "confirmed",
          focus_kegiatan: org.focusKegiatan || null,
          custom_leader_label: isCustom ? org.customLabels.leader : null,
          custom_member_label: isCustom ? org.customLabels.member : null,
          custom_group_label: isCustom ? org.customLabels.group : null,
          custom_content_label: isCustom ? org.customLabels.content : null,
          created_by: data.user.id,
        })
        .select("id")
        .single();

      if (orgError || !newOrg) {
        setError("Akun berhasil dibuat, tetapi organisasi gagal disimpan: " + translateError(orgError));
        setLoading(false);
        return;
      }

      const { error: memberError } = await supabase.from("org_memberships").insert({
        user_id: data.user.id,
        org_id: newOrg.id,
        org_role: "admin",
      });

      if (memberError) {
        setError("Organisasi dibuat, tetapi gagal menjadikan Anda admin: " + translateError(memberError));
        setLoading(false);
        return;
      }

      setActiveOrgCookie(newOrg.id);
    } else {
      const { data: found, error: findError } = await supabase.rpc(
        "find_organization_by_invite_code",
        { code: org.inviteCode }
      );

      const foundOrg = Array.isArray(found) ? found[0] : found;
      if (findError || !foundOrg) {
        setError("Kode organisasi tidak ditemukan. Periksa kembali kode dari admin organisasi Anda.");
        setLoading(false);
        return;
      }

      const { error: memberError } = await supabase.from("org_memberships").insert({
        user_id: data.user.id,
        org_id: foundOrg.id,
        org_role: "member",
      });

      if (memberError) {
        setError(translateError(memberError));
        setLoading(false);
        return;
      }

      setActiveOrgCookie(foundOrg.id);
    }

    // Peran admin/member ditentukan otomatis dari cara bergabung ("Buat organisasi"
    // vs "Gabung dengan kode") — bukan lagi dipilih manual sebagai "Guru"/"Siswa"
    // (Konsep Fitur Dropdown Registrasi v4: peran mengikuti sektor, bukan sebaliknya).
    const nextPath = org.mode === "buat" ? "/dashboard/guru" : "/dashboard/siswa";

    setSuccess(true);
    setLoading(false);
    setTimeout(() => router.push(nextPath), 1500);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm"
      >
        <h1 className="mb-1 text-xl font-semibold text-slate-900">Daftar ke Tandem</h1>
        <p className="mb-6 text-sm text-slate-500">Buat akun baru dan gabung/buat organisasi Anda.</p>

        <label className="mb-1 block text-sm font-medium text-slate-700">Nama Lengkap</label>
        <input
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="Nama lengkap"
        />

        <label className="mb-2 block text-sm font-medium text-slate-700">Organisasi</label>
        <OrgFields value={org} onChange={setOrg} />

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

