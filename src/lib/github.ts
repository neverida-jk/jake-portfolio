// Live GitHub activity for the hero's Now panel (§7.4, adjusted for static
// hosting — no API route, no token; a plain client-side fetch against the
// public events endpoint). On any failure, rate limit, or empty response
// the caller renders nothing: no skeleton, no error, ever.

const USER = "neverida-jk";
const CACHE_KEY = "jake.github.activity.v1";
const CACHE_MS = 30 * 60 * 1000;
const WEEKS = 12;

export type GithubActivity = {
  /** e.g. "pushed to tropa · 3 days ago" */
  latestLine: string;
  /** Weekly push counts, oldest first, covering the last WEEKS weeks. */
  weeklyPushCounts: number[];
};

type GhEvent = { type: string; created_at: string; repo?: { name: string } };

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.max(1, Math.round(diffMs / 60000));
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.round(days / 30);
  return `${months} month${months === 1 ? "" : "s"} ago`;
}

function activityVerb(type: string): string {
  switch (type) {
    case "PullRequestEvent":
      return "opened a pull request";
    case "IssuesEvent":
      return "opened an issue";
    case "CreateEvent":
      return "created a branch";
    case "WatchEvent":
      return "starred a repo";
    default:
      return "was active on GitHub";
  }
}

function readCache(): GithubActivity | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { at: number; data: GithubActivity };
    if (Date.now() - parsed.at > CACHE_MS) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

function writeCache(data: GithubActivity) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data }));
  } catch {
    // sessionStorage full/unavailable — the cache is a nicety, not required.
  }
}

export async function fetchGithubActivity(): Promise<GithubActivity | null> {
  if (typeof window === "undefined") return null;

  const cached = readCache();
  if (cached) return cached;

  try {
    const res = await fetch(`https://api.github.com/users/${USER}/events/public`, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!res.ok) return null; // covers rate limiting (403/429) too

    const events = (await res.json()) as GhEvent[];
    if (!Array.isArray(events) || events.length === 0) return null;

    const pushEvent = events.find((e) => e.type === "PushEvent");
    let latestLine: string | null = null;
    if (pushEvent?.repo?.name) {
      const repo = pushEvent.repo.name.split("/")[1] ?? pushEvent.repo.name;
      latestLine = `pushed to ${repo} · ${relativeTime(pushEvent.created_at)}`;
    } else if (events[0]) {
      latestLine = `${activityVerb(events[0].type)} · ${relativeTime(events[0].created_at)}`;
    }
    if (!latestLine) return null;

    const pushes = events.filter((e) => e.type === "PushEvent");
    const now = Date.now();
    const weeklyPushCounts = Array.from({ length: WEEKS }, () => 0);
    for (const e of pushes) {
      const weeksAgo = Math.floor((now - new Date(e.created_at).getTime()) / (7 * 24 * 3600 * 1000));
      const idx = WEEKS - 1 - weeksAgo;
      if (idx >= 0 && idx < WEEKS) weeklyPushCounts[idx] += 1;
    }

    const data: GithubActivity = { latestLine, weeklyPushCounts };
    writeCache(data);
    return data;
  } catch {
    return null; // network failure, CORS, parse error — render nothing.
  }
}
