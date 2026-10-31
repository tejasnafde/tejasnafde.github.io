import { createAnalytics } from "./analytics-client.js";

const analytics = createAnalytics({
  product: "shared",
  surface: "portfolio",
  environment: globalThis.location?.hostname === "tn07.dev" ? "production" : "development",
});

// A coarse bucket, never the referrer URL. The LinkedIn app often sends no
// referrer at all, so links you share can carry ?ref=linkedin instead.
const SOURCES = new Set(["direct", "linkedin", "search", "ai", "github", "x", "tn07", "other"]);

export function landingSource(referrer, search) {
  const tag = new URLSearchParams(search).get("ref");
  if (SOURCES.has(tag)) return tag;
  let host;
  try {
    host = new URL(referrer).hostname;
  } catch {
    return "direct";
  }
  if (host.includes("linkedin") || host === "lnkd.in") return "linkedin";
  if (/(^|\.)(chatgpt\.com|perplexity\.ai|claude\.ai|gemini\.google\.com)$/.test(host)) return "ai";
  if (/(^|\.)(google|bing|duckduckgo|yahoo|ecosia|yandex|baidu)\./.test(host)) return "search";
  if (/(^|\.)github\.com$/.test(host)) return "github";
  if (/^(x\.com|t\.co|(www\.)?twitter\.com)$/.test(host)) return "x";
  if (host === "tn07.dev" || host.endsWith(".tn07.dev")) return "tn07";
  return "other";
}

// "/blog/<slug>" -> "<slug>"; the index page and anything odd -> null.
export function blogSlug(pathname) {
  return /^\/blog\/([a-z0-9-]{1,80})\/?$/.exec(pathname)?.[1] ?? null;
}

// How far down the article the reader got, 0 to 100.
export function scrollPercent(scrollY, viewportHeight, articleTop, articleHeight) {
  if (articleHeight <= 0) return 100;
  const seen = (scrollY + viewportHeight - articleTop) / articleHeight;
  return Math.round(Math.min(1, Math.max(0, seen)) * 100);
}

// Visible milliseconds -> whole seconds, clamped to what the Worker accepts.
export function engagedSeconds(visibleMs) {
  return Math.min(1800, Math.max(0, Math.round(visibleMs / 1000)));
}

// One blog_read per page view, sent the first time the page is hidden or left.
// ponytail: a reader who switches tabs and comes back is counted only up to the first hide.
function trackReading(slug) {
  const article = document.querySelector(".post-content");
  let visibleMs = 0;
  let visibleSince = document.visibilityState === "visible" ? performance.now() : null;
  let maxScroll = 0;
  let sent = false;

  const measure = () => {
    if (!article) return;
    const box = article.getBoundingClientRect();
    maxScroll = Math.max(
      maxScroll,
      scrollPercent(window.scrollY, window.innerHeight, box.top + window.scrollY, box.height),
    );
  };
  const send = () => {
    if (sent) return;
    sent = true;
    if (visibleSince !== null) visibleMs += performance.now() - visibleSince;
    measure();
    analytics.track(
      "blog_read",
      { target: slug, engaged_seconds: engagedSeconds(visibleMs), scroll_pct: maxScroll },
      { surface: "blog" },
    );
  };

  measure();
  window.addEventListener("scroll", measure, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") send();
  });
  window.addEventListener("pagehide", send);
}

if (typeof document !== "undefined") {
  const source = landingSource(document.referrer, location.search);
  const slug = blogSlug(location.pathname);
  if (location.pathname === "/") {
    analytics.track("acquisition_landing", { source });
  } else if (slug) {
    analytics.track("acquisition_landing", { source, target: slug }, { surface: "blog" });
    trackReading(slug);
  }

  // Drop ?ref from the address bar once it is read, so a reader who copies the
  // link does not count as LinkedIn again. The canonical tag already has no query.
  const params = new URLSearchParams(location.search);
  if (params.has("ref")) {
    params.delete("ref");
    const query = params.toString();
    history.replaceState(null, "", location.pathname + (query ? `?${query}` : "") + location.hash);
  }
}

const productHosts = new Set([
  "gaming.tn07.dev",
  "marvel.tn07.dev",
  "someday.tn07.dev",
  "switchboard.tn07.dev",
  "watchwithmi.tn07.dev",
  "follymarket.tn07.dev",
  "scout.tn07.dev",
  "jam.tn07.dev",
]);

globalThis.document?.addEventListener("click", (event) => {
  const link = event.target.closest("a[href]");
  if (!link) return;
  const destination = new URL(link.href);
  if (productHosts.has(destination.hostname)) {
    // gaming.tn07.dev -> "gaming"; every host above is allowlisted by name.
    analytics.track("project_open", { target: destination.hostname.split(".")[0] });
  } else if (destination.hostname === "github.com") {
    analytics.track("project_open", { target: "github" });
  }
});
