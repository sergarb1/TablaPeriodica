# Química Visual 🧪

<p align="center">
  <a href="https://sergarb1.github.io/TablaPeriodica/">🌐 sergarb1.github.io/TablaPeriodica</a>
</p>

**Aprende la tabla periódica de forma visual, interactiva y gratuita.**
**Learn the periodic table visually, interactively, and for free.**

---

## ✨ Características / Features

| ES | EN |
|---|---|
| ✅ 118 elementos con datos bilingües (ES/EN) | ✅ 118 elements with bilingual data (ES/EN) |
| 🖱️ Tabla periódica interactiva con mosaicos glassmorphism | 🖱️ Interactive glassmorphism periodic table |
| 🔍 Búsqueda, filtro por familia, tendencias periódicas | 🔍 Search, family filter, periodic trends |
| ⚛️ Modelo de Bohr animado para cada elemento | ⚛️ Animated Bohr model per element |
| 🃏 Flashcards con sistema de conocido/no conocido | 🃏 Flashcards with known/unknown tracking |
| ⚖️ Comparador lado a lado de propiedades | ⚖️ Side-by-side element comparison |
| 🧪 Visor 3D de moléculas (H₂O, CO₂, CH₄, NH₃, O₂, NaCl) | 🧪 3D molecule viewer (H₂O, CO₂, CH₄, NH₃, O₂, NaCl) |
| 🎮 3 minijuegos: adivinar, memoria, contrarreloj | 🎮 3 minigames: quiz, memory, speed quiz |
| 📚 Guía educativa estilo Head First (7 secciones divertidas) | 📚 Head First-style educational guide (7 fun sections) |
| 📊 Progreso con XP, nivel, rachas, 14 logros | 📊 Progress with XP, level, streaks, 14 achievements |
| 🌙 Modo oscuro / claro | 🌙 Dark / light mode |
| 📱 PWA instalable (offline-ready) | 📱 Installable PWA (offline-ready) |
| 🔒 100% local — tus datos nunca salen del dispositivo | 🔒 100% local — your data never leaves your device |
| 📖 Licencias libres (AGPL v3 + CC BY-SA 4.0) | 📖 Free licenses (AGPL v3 + CC BY-SA 4.0) |

---

## 🚀 Tecnologías / Tech Stack

| Frontend | Build | PWA | Deploy |
|---|---|---|---|
| Vue 3 + TypeScript | Vite 8 + Rolldown | vite-plugin-pwa v1 | GitHub Pages (Actions) |
| Tailwind CSS v4 | vue-tsc (typecheck) | Workbox (CacheFirst) | Hash router |
| vue-i18n (ES/EN) | npm 11 / Node 24 | Service Worker | Auto-deploy on push |
| @vueuse/motion | — | Manifest (standalone) | — |
| vue-router + Pinia | — | 26 precached entries | — |

---

## 🏗️ Estructura del proyecto / Project structure

```
quimica-visual/
├── src/
│   ├── App.vue              # Header, nav, footer (free/libre notice)
│   ├── pages/
│   │   ├── HomePage.vue     # Landing con CTA gigante a la tabla
│   │   ├── TablePage.vue    # Tabla periódica interactiva
│   │   ├── ElementPage.vue  # Vista detalle de cada elemento
│   │   ├── LearnPage.vue    # Estudio por familias + enlaces rápidos
│   │   ├── GamesPage.vue    # 3 minijuegos en pestañas
│   │   ├── ProgressPage.vue # XP, nivel, estadísticas, logros
│   │   ├── FlashcardsPage.vue # Tarjetas de repaso
│   │   ├── ComparePage.vue  # Comparador de elementos
│   │   ├── LabPage.vue      # Visor de moléculas 3D
│   │   └── GuidePage.vue    # Guía educativa Head First
│   ├── components/          # Componentes reutilizables
│   ├── composables/         # useTheme, useLocale, useProgress, useElement
│   ├── data/                # elements.json (118 elementos)
│   ├── i18n/locales/        # es.json, en.json
│   ├── router/              # Hash router (11 rutas)
│   └── types/               # Interfaces TypeScript
├── .github/workflows/       # deploy.yml
├── AGENTS.md                # Config para asistentes IA
├── LICENSE                  # AGPL v3
├── LICENSE-CONTENT          # CC BY-SA 4.0
└── README.md
```

---

## 🛠️ Desarrollo local / Local development

```bash
# Clonar / Clone
git clone https://github.com/sergarb1/TablaPeriodica.git
cd quimica-visual

# Instalar dependencias / Install deps
npm install

# Servidor de desarrollo / Dev server (HMR en localhost:5173)
npm run dev

# Build producción + typecheck / Production build with typecheck
npm run build

# Previsualizar build / Preview production build
npm run preview
```

> ⚠️ **Importante:** El build ejecuta `vue-tsc -b` (typecheck) antes de `vite build`. Asegúrate de que no haya errores de tipo antes de commitear.

---

## 🌍 Despliegue / Deployment

El despliegue es automático mediante **GitHub Actions**. Cada push a `main`:

1. Hace checkout del repositorio (`actions/checkout@v7`)
2. Configura Node 24 (`actions/setup-node@v6`)
3. Ejecuta `npm ci && npm run build`
4. Sube el contenido de `dist/` como artifact (`actions/upload-pages-artifact@v5`)
5. Despliega a GitHub Pages (`actions/deploy-pages@v5`)

La aplicación está disponible en:
**https://sergarb1.github.io/TablaPeriodica/**

---

## 📖 Licencias / Licenses

| Código / Code | Contenido / Content |
|---|---|
| [AGPL v3](LICENSE) | [CC BY-SA 4.0](LICENSE-CONTENT) |
| Software libre, copia, modifica y comparte | Contenido educativo, comparte y adapta |

**Creado por / Created by:** Sergi García Barea

---

## 🤝 Contribuir / Contributing

¿Ideas, bugs, mejoras? Abre un [issue](https://github.com/sergarb1/TablaPeriodica/issues) o enviá un PR. Toda contribución es bienvenida.

---

## ⚡ Nota para asistentes IA

Consulta [AGENTS.md](AGENTS.md) para ver la configuración completa del proyecto: stack, comandos, estructura, convenciones y detalles de despliegue.
