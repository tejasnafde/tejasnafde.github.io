import { createAnalytics } from "/analytics-client.js";

const analytics = createAnalytics({
  product: "shared",
  surface: "portfolio",
  environment: location.hostname === "tn07.dev" ? "production" : "development",
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

if (location.pathname === "/") {
  analytics.track("acquisition_landing", {
    source: landingSource(document.referrer, location.search),
  });
}

const productHosts = new Set([
  "gaming.tn07.dev",
  "marvel.tn07.dev",
  "someday.tn07.dev",
  "switchboard.tn07.dev",
  "watchwithmi.tn07.dev",
  "follymarket.tn07.dev",
  "scout.tn07.dev",
]);

document.addEventListener("click", (event) => {
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
