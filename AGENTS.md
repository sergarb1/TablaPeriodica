# Química Visual — AGENTS.md

## Stack
- Vue 3 + Composition API + `<script setup>` + TypeScript
- Tailwind CSS v4
- @vueuse/motion (v-motion directive)
- vue-i18n (bilingual ES/EN)
- Pinia (state)
- vue-router (hash router for GitHub Pages)
- vite-plugin-pwa (auto-update, CacheFirst, 26 precached entries)
- Node 24, npm 11+

## Commands
```bash
npm run dev        # Vite dev server with HMR
npm run build      # vue-tsc -b && vite build (typecheck + bundle)
npm run preview    # vite preview (serve dist locally)
npm install        # Install deps (no lockfile, npm install --no-frozen-lockfile)
git add -A && git commit -m "msg" && git push  # Deploy to GitHub Pages via Actions
```

## Project Structure
```
src/
  App.vue              # Header nav (ES/EN toggle, dark mode) + router-view + footer (free/libre notice)
  pages/               # Route pages (lazy-loaded)
    HomePage.vue        # Big CTA to table, 3-card layout, daily element, XP/streak
    TablePage.vue       # Interactive periodic table with glassmorphism tiles
    ElementPage.vue     # Detail view per element: Bohr model, 8 properties, neighbor nav
    LearnPage.vue       # Family cards with progress bars + quick links (flashcards, compare, lab, guide)
    GamesPage.vue       # 3 game modes in tabs: Quiz (10 Qs, streak XP), Memory (symbol↔name pairs), Speed (60s)
    ProgressPage.vue    # XP bar, level, stats grid, 14 achievements
    FlashcardsPage.vue  # Flip cards with family filter, known/unknown tracking, localStorage
    ComparePage.vue     # Side-by-side element comparison with property bars
    LabPage.vue         # 3D molecule viewer (CSS rotate animation, 6 molecules)
    GuidePage.vue       # Head First-style educational guide (7 sections, fun tone, emojis)
  components/          # Reusable components (ElementTile, ElementPopover, TableConfig)
  composables/         # useTheme, useLocale, useProgress, useElement, useTableConfig
  data/                # elements.json (118 elements bilingual), families.json, achievements.json
  i18n/locales/        # es.json, en.json
  router/              # Hash router with 11 routes
  types/               # TypeScript interfaces (ElementData, FamilyData, AchievementData, etc.)
dist/                  # Built output (gitignored, deployed by Actions)
.github/workflows/     # deploy.yml — build & deploy to gh-pages
```

## Key Conventions
- No comments in production code
- No emojis unless user explicitly requests them
- All text via vue-i18n (`$t('key')` or `t('key')`)
- `<script setup>` + TypeScript for all components
- Tailwind utility classes (no custom CSS except scoped keyframes)
- Mobile-first, responsive with sm:/md: breakpoints
- All element data in elements.json (no API calls)
- localStorage for progress + flashcard state
- AGPL v3 (code) + CC BY-SA 4.0 (content) licensing

## GitHub Pages
- URL: https://sergarb1.github.io/TablaPeriodica/
- Base: `/TablaPeriodica/`
- Deploy: push to main → Actions builds & deploys to gh-pages branch
- Hash router required for SPA routing on GitHub Pages

## Status (Jul 2026)
### Changes this session
- **Mobile nav hamburger** — mobile (`< sm`) nav links hidden behind hamburger with dropdown
- **Nav button styling** — nav buttons now have `bg-slate-100 dark:bg-slate-800 rounded-lg` background
- **Landing page cards smaller** — reduced padding, gaps, font sizes for at-a-glance view
- **Default theme "filled"** changed from "crystal", old `'normal'` localStorage migrates to `'filled'`
- **Mobile default compact** — first visit on `< 640px` starts with `tileSize: 'compact'`
- **Label mode fix** — `labelMode` prop wired to `ElementTile`; symbol/name/both now works
- **Table alignment fix** — cells use `items-center justify-center`; `tilePx` passed inline to tiles
- **Opciones button** — gear icon + "Opciones" text in table toolbar
- **Guide bold rendering** — `**text**` markdown converted to `<strong>` via `bold()` helper
- **Nav "Tabla periódica"** instead of "Explorar" + i18n key `app.tableLabel`
- **Popover clickable** — "Detalles" button removed; whole card clickable; "Click para más info" hint
- **Square logo** — `logoCuadrado.png` added (`public/`); used as favicon, apple-touch-icon, PWA manifest icons
- **78 tests pass** (6 suites, 0 failures), build clean
