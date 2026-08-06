"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type MembershipRow = {
  org_id: string;
  org_role: "admin" | "member";
  organizations: {
    id: string;
    name: string;
    sector_dictionaries: { sector_label: string } | null;
  };
};

const ACTIVE_ORG_COOKIE = "tandem_active_org";

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string) {
  // 1 tahun, cukup untuk sesi "organisasi aktif terakhir dipakai"
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${60 * 60 * 24 * 365}`;
}

export default function OrgSwitcher() {
  const supabase = createClient();
  const router = useRouter();
  const [memberships, setMemberships] = useState<MembershipRow[]>([]);
  const [activeOrgId, setActiveOrgId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("org_memberships")
        .select("org_id, org_role, organizations ( id, name, sector_dictionaries ( sector_label ) )")
        .eq("user_id", user.id);

      const rows = (data ?? []) as unknown as MembershipRow[];
      setMemberships(rows);

      const stored = getCookie(ACTIVE_ORG_COOKIE);
      const validStored = rows.find((r) => r.org_id === stored);
      const initial = validStored ? stored : rows[0]?.org_id ?? null;
      setActiveOrgId(initial);
      if (initial) setCookie(ACTIVE_ORG_COOKIE, initial);

      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function switchOrg(orgId: string) {
    setActiveOrgId(orgId);
    setCookie(ACTIVE_ORG_COOKIE, orgId);
    setOpen(false);
    router.refresh(); // muat ulang label & data sesuai organisasi baru
  }

  if (loading || memberships.length === 0) return null;

  const active = memberships.find((m) => m.org_id === activeOrgId);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm hover:bg-slate-50"
      >
        <span className="font-medium text-slate-800">{active?.organizations.name ?? "Pilih organisasi"}</span>
        {active && (
          <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-600">
            {active.org_role === "admin" ? "Admin" : "Anggota"}
          </span>
        )}
        <svg width="14" height="14" viewBox="0 0 20 20" fill="none" className="text-slate-400">
          <path d="M5 7l5 5 5-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-72 rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
          <p className="px-3 py-1.5 text-xs text-slate-400">Organisasi Anda</p>
          {memberships.map((m) => (
            <button
              key={m.org_id}
              onClick={() => switchOrg(m.org_id)}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50 ${
                m.org_id === activeOrgId ? "bg-indigo-50/60" : ""
              }`}
            >
              {m.org_id === activeOrgId && <span className="text-indigo-600">✓</span>}
              <span className="flex-1">
                <span className="block font-medium text-slate-800">{m.organizations.name}</span>
                <span className="block text-xs text-slate-400">
                  {m.organizations.sector_dictionaries?.sector_label ?? "Belum diatur"} ·{" "}
                  {m.org_role === "admin" ? "Admin" : "Anggota"}
                </span>
              </span>
            </button>
          ))}
          <div className="mt-1 border-t border-slate-100 px-3 py-2 text-sm text-slate-500">
            Gabung/buat organisasi baru lewat halaman{" "}
            <a href="/register" className="text-indigo-600 hover:underline">
              registrasi
            </a>
            .
          </div>
        </div>
      )}
    </div>
  );
}
