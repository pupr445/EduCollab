// Util cookie bersama untuk "organisasi aktif" (Konsep Fitur Dropdown Registrasi v4, bagian 5).
// Dipakai di client components: OrgSwitcher, halaman login, halaman registrasi, dan hook label dinamis.

export const ACTIVE_ORG_COOKIE = "tandem_active_org";

export function getActiveOrgCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + ACTIVE_ORG_COOKIE + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

export function setActiveOrgCookie(orgId: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${ACTIVE_ORG_COOKIE}=${encodeURIComponent(orgId)}; path=/; max-age=${60 * 60 * 24 * 365}`;
}
