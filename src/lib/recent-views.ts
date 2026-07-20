const KEY = "artemis_recent_views";
const MAX = 20;

export function getRecentViews(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function addRecentView(jobId: string) {
  const views = getRecentViews().filter((id) => id !== jobId);
  views.unshift(jobId);
  localStorage.setItem(KEY, JSON.stringify(views.slice(0, MAX)));
}
