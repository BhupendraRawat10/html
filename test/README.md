# NSBLPA Prototype

A mobile-first, responsive prototype for NSBLPA. Built with semantic HTML5, CSS3 and vanilla JS (ES6). No build tools required — works offline.

## Files

- `index.html` — Home
- `ownership.html` — Ownership page
- `teams.html` — Teams grid (links out to team sites)
- `apps.html` — Apps listing (links to Google Play)
- `contact.html` — Contact form (mailto fallback)
- `assets/styles.css` — Styling (mobile-first)
- `assets/scripts.js` — Small JS for nav toggle and contact form
- `assets/logo-placeholder.svg` — placeholder logo

## How to run locally

1. Download/copy the `nsblpa-prototype/` folder.
2. Open `index.html` in any modern browser (Chrome/Edge/Firefox/Safari).
3. (Optional) Serve via a static server:
   - Python 3: `python -m http.server 8000` then open http://localhost:8000

## Assumptions & design decisions

- Mobile-first: layout optimized for small screens then scales up at 720px and 1024px.
- No frameworks used — lightweight CSS and vanilla JS to meet "offline" requirement.
- Focused on clarity and accessibility: semantic elements (main, nav, article), alt attributes, aria labels for interactive toggles.
- Contact form uses `mailto:` in prototype; production should POST to a secure endpoint.
- Placeholder logo used — replace `assets/logo-placeholder.svg` with final brand assets.
- All external links open in new tabs and use `rel="noopener"`.

## Assets used

- `logo-placeholder.svg` is a small inline SVG placeholder — swap with your real logos.
- No external fonts were loaded to keep performance high and offline capable.

## Notes for recording the Loom video

Use this short script:

1. Intro: "Hi, I'm [Name]. This is the NSBLPA prototype for Horizon Sphere Equity Group."
2. Show Home page on mobile size: highlight hero, quick links.
3. Tap/open Teams: show grid and link out behavior.
4. Open Apps: highlight categorization and Play Store links.
5. Open Ownership: show owner cards and app links.
6. Open Contact and demonstrate the contact form (fill and submit to open mail client).
7. Mention accessibility choices and performance considerations (small assets, no external fonts).
8. Close: "Thanks — ready for next steps."

Record 2–4 minutes, walk through the interactions, and explain design choices briefly.

---

If you want, I can:

- Replace the SVG logo with provided PNG/SVG logos (you can paste them here).
- Add small hover states or micro-interactions.
- Prepare a zip of the project contents (I cannot upload a zip here, but I can produce a downloadable file if you prefer via a supported channel).
