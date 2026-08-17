# RMS Admin Suite — Premium Admin Dashboard Template

A **reusable, offline-first admin dashboard template** built with pure **HTML + Tailwind CSS + Vanilla JS**.
No React, no Next.js, no build step. Drop it into any project — PHP, Laravel, WordPress, Django, Node — and wire up your backend.

## What's inside

```
rms-admin-suite-template/
├── assets/
│   ├── css/style.css          # theme variables, dark mode, animations, print + RTL rules
│   ├── js/tailwind.js         # Tailwind runtime (local — works offline)
│   ├── js/theme-config.js     # Tailwind config (CSS-variable themes)
│   ├── js/chart.min.js        # Chart.js (local — works offline)
│   ├── js/app.js              # all interactions (vanilla JS)
│   ├── fonts/                 # Manrope webfonts (local) + fonts.css
│   └── img/                   # logo, avatars, gallery media, patterns
├── login.html                 # split-screen login (inline validation states)
├── register.html              # registration page (inline validation states)
├── register-multi.html        # multi-step onboarding wizard (3 steps + success)
├── forgot-password.html       # reset link flow with success state
├── otp-login.html             # passwordless WhatsApp/SMS OTP sign-in
├── index.html                 # Ecommerce / Sales dashboard
├── dashboard-crm.html         # CRM dashboard
├── dashboard-marketing.html   # WhatsApp marketing dashboard
├── meta-dashboard.html        # Meta API SaaS performance dashboard
├── broadcast.html             # broadcast composer: audience picker + scheduling
├── tables.html                # data table: search, sort, pagination, bulk select
├── chat.html                  # Meta / WhatsApp customer chat inbox
├── quick-replies.html         # WhatsApp quick reply manager (shortcuts, categories)
├── whatsapp-templates.html    # Meta API template builder with live phone preview
├── kanban.html                # drag & drop CRM deals pipeline
├── calendar.html              # campaign calendar: month + week view, draggable events
├── notifications.html         # notification center: unread states, filters
├── plans.html                 # plans & subscriptions
├── payments.html              # payment history (search, filter, pagination)
├── invoice.html               # printable invoice, pre-fills from payments via URL
├── staff.html                 # staff & members with role permissions matrix
├── blog-list.html             # blog posts list
├── blog-create.html           # blog editor (create / update)
├── blog-categories.html       # blog category manager
├── gallery.html               # media gallery: add / delete / filter
├── search.html                # global search results page
├── starter.html               # blank page + Laravel Blade integration guide
├── 404.html                   # branded page-not-found screen
├── maintenance.html           # branded scheduled-maintenance screen
├── faq.html                   # searchable FAQ accordion
├── profile.html               # user profile: activity timeline + security
├── pricing.html               # public pricing landing (monthly/annual toggle)
├── about.html                 # public about page: story, stats, values, team
├── contact.html               # public contact page with validated form
├── changelog.html             # release notes / version history timeline
├── settings.html              # settings with tabs + theme preferences + RTL
├── build/                     # Tailwind production compiler (static CSS)
└── README.md
```

## CSS: precompiled by default

All pages ship linked to the **precompiled** `assets/css/tailwind.compiled.css` —
fast first paint, zero runtime overhead, fully offline.

If you add **new Tailwind classes** in your own pages/sections, regenerate the
stylesheet once (no Node.js required — the script auto-downloads the official
Tailwind standalone CLI on first run):

```bash
bash build/build-css.sh
```

The old runtime files (`assets/js/tailwind.js` + `assets/js/theme-config.js`) are
still included. If you prefer zero-build development, swap the compiled
`<link>` in your page's `<head>` back to:

```html
<script src="assets/js/tailwind.js"></script>
<script src="assets/js/theme-config.js"></script>
```

## Features

- **5 color themes** — Indigo, Emerald, Rose, Amber, Ocean (top-bar palette switcher)
- **Dark mode** — one-click toggle, remembered across pages (localStorage)
- **100% offline** — Tailwind, Chart.js, fonts and images are all local files
- **Zero frameworks** — open any `.html` file directly in a browser, it just works
- **Reusable shell** — same sidebar / topbar markup on every page

## Run it

Open `login.html` or `index.html` in any browser. No server needed.

## Use with Laravel / PHP

1. Copy `assets/` into your `public/assets/` folder.
2. Convert each `.html` page to a Blade view (`resources/views/...`).
3. The sidebar/topbar markup is identical on every page — extract it once into
   `layouts/app.blade.php` and keep only the `<main>` content per page.
4. Replace demo `onclick` handlers / `RM.toast(...)` calls with real form posts
   and API calls to your controllers.

## Theming

- Theme variables live at the top of `assets/css/style.css`
  (`[data-theme="..."]` blocks) — add your own brand palette by copying a block.
- Brand name "RM Services" appears in the sidebar, topbar, auth pages and footer —
  search & replace to rebrand.

---
© 2026 RM Services. Crafted for rapid product development.
