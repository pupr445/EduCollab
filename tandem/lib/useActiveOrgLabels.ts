"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getOrgLabels, DEFAULT_LABELS, type SectorLabels } from "@/lib/sectorLabels";
import { getActiveOrgCookie } from "@/lib/activeOrgCookie";

// Dipakai di client component kecil (form) yang perlu menampilkan istilah
// sesuai sektor organisasi aktif, tapi tidak punya akses ke Server Component.
export function useActiveOrgLabels(): SectorLabels {
  const [labels, setLabels] = useState<SectorLabels>(DEFAULT_LABELS);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    (async () => {
      let orgId = getActiveOrgCookie();

      if (!orgId) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from("org_memberships")
            .select("org_id")
            .eq("user_id", user.id)
            .order("joined_at", { ascending: true })
            .limit(1)
            .maybeSingle();
          orgId = data?.org_id ?? null;
        }
      }

      const resolved = await getOrgLabels(supabase, orgId);
      if (!cancelled) setLabels(resolved);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return labels;
}
