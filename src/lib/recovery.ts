export const RECOVERY_STORAGE_KEY = "netan_recovery_access_token";

export function captureRecoveryHash() {
  if (typeof window === "undefined") return false;
  const raw = window.location.hash.replace(/^#/, "");
  if (!raw) return false;
  const hash = new URLSearchParams(raw);
  const type = hash.get("type");
  const access = hash.get("access_token");
  if (type !== "recovery" || !access) return false;
  sessionStorage.setItem(RECOVERY_STORAGE_KEY, access);
  window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  return true;
}
