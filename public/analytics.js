import { createAnalytics } from "/analytics-client.js";

const analytics = createAnalytics({
  product: "shared",
  surface: "portfolio",
  environment: location.hostname === "tn07.dev" ? "production" : "development",
});

if (location.pathname === "/") analytics.track("acquisition_landing");

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
    analytics.track("project_open", { target: "product" });
  } else if (destination.hostname === "github.com") {
    analytics.track("project_open", { target: "github" });
  }
});
