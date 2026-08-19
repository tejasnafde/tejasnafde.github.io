/* tn07 ring - cross-site discovery bar.
   Usage: <script src="https://tn07.dev/ring.js" defer></script>
   Add an app here and every site picks it up with no redeploy.

   rashi.tn07.dev is live but is DELIBERATELY not here, and must stay out. It is
   a personal page, not a product. Do not "fix" its absence. */
(function () {
  // cat groups apps so a visitor is offered the nearest neighbour first.
  // The bar NEVER grows with this list: it shows at most PICKS entries plus one
  // "All" link to the full directory on tn07.dev. Adding a 20th app changes
  // which three appear, not how big the bar is. The homepage is the catalog;
  // this is a teaser. Do not turn it back into a catalog.
  var APPS = [
    { host: 'switchboard.tn07.dev', name: 'Switchboard', cat: 'tools', blurb: 'Workspace around your coding agents', icon: 'switchboard.png' },
    { host: 'someday.tn07.dev',     name: 'Someday',     cat: 'tools', blurb: 'Things you said you would get around to' , icon: 'someday.png' },
    { host: 'follymarket.tn07.dev', name: 'Follymarket', cat: 'fun',   blurb: 'Play-money prediction market' , icon: 'follymarket.svg' },
    { host: 'watchwithmi.tn07.dev', name: 'WatchWithMi', cat: 'tools', blurb: 'Watch things together, in sync' , icon: 'watchwithmi.svg' },
    { host: 'gaming.tn07.dev',      name: 'Board Games', cat: 'fun',   blurb: 'Battleship, Connect 4, Labyrinth' , icon: 'gaming.svg' },
    { host: 'marvel.tn07.dev',      name: 'Marvel',      cat: 'fun',   blurb: 'A reading order for 65 years of comics' , icon: 'marvel.svg' },
    { host: 'scout.tn07.dev',       name: 'Scout',       cat: 'tools', blurb: 'Jobs scored against your profile' , icon: 'scout.svg' }
  ];
  // A not-yet-deployed app may carry soon: true. The bar skips it and the
  // "All N" count excludes it, because a dead hostname fails with an SSL
  // error, not a friendly 404. Delete the flag when the site goes live.

  var HOME = 'tn07.dev';
  var ALL = 'https://' + HOME + '/#tools';
  var PICKS = 3;
  var KEY = 'tn07-ring-dismissed';
  var DAYS = 30;

  try {
    if (Date.now() - (+localStorage.getItem(KEY) || 0) < DAYS * 864e5) return;
  } catch (e) { /* private mode: just show it */ }

  var here = location.hostname;
  var self = APPS.findIndex(function (a) { return a.host === here; });

  // Rank the other apps: same category first, then wrap around the list from
  // this app's own position. The wrap means neighbouring sites recommend
  // different things instead of every site pushing the same first three.
  var mine = self > -1 ? APPS[self].cat : null;
  var others = APPS
    .map(function (a, i) {
      return { a: a, rank: (a.cat === mine ? 0 : 1e3) + ((i - self - 1 + APPS.length) % APPS.length) };
    })
    .filter(function (o) { return o.a.host !== here && !o.a.soon; })
    .sort(function (x, y) { return x.rank - y.rank; })
    .slice(0, PICKS)
    .map(function (o) { return o.a; });
  if (!others.length) return;

  var host = document.createElement('div');
  host.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:2147483000';
  var root = host.attachShadow({ mode: 'open' });

  // ponytail: inherit the host page's accent so the bar matches each site.
  // Falls back to violet on a site that has not adopted tokens.css yet.
  var accent = getComputedStyle(document.documentElement)
    .getPropertyValue('--accent').trim() || '#A78BFA';

  // Match the page's actual theme by sniffing its background luminance.
  // System colors (Canvas/CanvasText) are useless here: all:initial resets
  // color-scheme inside the shadow root, so they resolve light regardless of
  // the page, which painted a white bar across every dark site.
  function isDark(el) {
    var m = (getComputedStyle(el).backgroundColor || '').match(/[\d.]+/g);
    if (!m || (m.length === 4 && +m[3] === 0)) return null; // transparent
    return (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) / 255 < 0.5;
  }
  var dark = isDark(document.body);
  if (dark === null) dark = isDark(document.documentElement);
  if (dark === null) dark = false;
  var barBg = dark ? 'rgb(14 14 17 / .82)' : 'rgb(255 255 255 / .82)';
  var barInk = dark ? '#EDECEF' : '#16141A';
  var barLine = dark ? 'rgb(255 255 255 / .14)' : 'rgb(0 0 0 / .14)';

  root.innerHTML =
    '<style>' +
    ':host{all:initial}' +
    '*{box-sizing:border-box;margin:0;font-family:ui-sans-serif,system-ui,-apple-system,sans-serif}' +
    '.bar{display:flex;align-items:center;gap:10px;padding:8px 12px;overflow-x:auto;' +
      'scrollbar-width:none;background:' + barBg + ';' +
      'backdrop-filter:blur(14px) saturate(150%);border-top:1px solid ' + barLine + ';' +
      'color:' + barInk + ';padding-bottom:calc(8px + env(safe-area-inset-bottom))}' +
    '.bar::-webkit-scrollbar{display:none}' +
    '.lbl{flex:none;font-size:10px;letter-spacing:.14em;text-transform:uppercase;' +
      'opacity:.5;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}' +
    'a{flex:none;display:flex;align-items:center;gap:8px;text-decoration:none;color:inherit;' +
      'padding:5px 10px;min-height:36px;border-radius:8px;' +
      'border:1px solid ' + barLine + ';transition:border-color 120ms cubic-bezier(.2,0,0,1)}' +
    'a:hover,a:focus-visible{border-color:' + accent + '}' +
    'a:focus-visible{outline:2px solid ' + accent + ';outline-offset:2px}' +
    'a>img{width:18px;height:18px;border-radius:4px;flex:none}' +
    'a>div{display:flex;flex-direction:column;gap:1px;justify-content:center}' +
    'b{font-size:13px;font-weight:600;letter-spacing:-.01em}' +
    'span{font-size:11px;opacity:.6;white-space:nowrap}' +
    '.all{border-style:dashed;opacity:.75}' +
    '.all:hover{opacity:1}' +
    'button{margin-left:auto;flex:none;background:none;border:0;color:inherit;opacity:.5;' +
      'cursor:pointer;font-size:18px;line-height:1;width:44px;height:44px;border-radius:8px}' +
    'button:hover{opacity:1}' +
    '@media (max-width:600px){.lbl,span{display:none}}' +
    '</style>' +
    '<div class="bar" role="complementary" aria-label="Other things on tn07.dev">' +
      '<span class="lbl">Also by tn07</span>' +
      others.map(function (a) {
        // icon is decorative (alt="") and self-removing if it ever 404s
        var img = a.icon ? '<img src="https://tn07.dev/icons/' + a.icon + '" alt="" width="18" height="18" onerror="this.remove()">' : '';
        return '<a href="https://' + a.host + '">' + img + '<div><b>' + a.name + '</b><span>' + a.blurb + '</span></div></a>';
      }).join('') +
      (here === HOME ? '' : '<a class="all" href="' + ALL + '"><b>All ' + APPS.filter(function (a) { return !a.soon; }).length + ' &rsaquo;</b></a>') +
      '<button type="button" aria-label="Hide this bar">&times;</button>' +
    '</div>';

  root.querySelector('button').onclick = function () {
    try { localStorage.setItem(KEY, Date.now()); } catch (e) {}
    host.remove();
  };

  document.body.appendChild(host);
})();
