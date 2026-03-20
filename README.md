# Luca Pignatelli — Academic Portfolio

Personal academic website. Built with plain HTML, CSS, and vanilla JavaScript — no frameworks, no build step, no dependencies beyond two CDN-loaded libraries (MathJax and Google Fonts).

Live at: **[pignatelliluca.github.io](https://pignatelliluca.github.io)**

---

## Table of Contents

1. [File Structure](#file-structure)
2. [Getting Started](#getting-started)
3. [Adding Your Photo](#adding-your-photo)
4. [Page-by-Page Guide](#page-by-page-guide)
   - [Homepage](#homepage-indexhtml)
   - [About](#about-abouthtml)
   - [Publications](#publications-publicationshtml)
   - [Talks](#talks-talkshtml)
   - [Teaching](#teaching-teachinghtml)
   - [Curriculum Vitae](#curriculum-vitae-cvhtml)
   - [Other Mathematics](#other-mathematics-otherhtml)
   - [Miscellany](#miscellany-mischtml)
   - [Games](#games-gameshtml)
   - [Files](#files-fileshtml)
5. [Adding Downloadable Files](#adding-downloadable-files)
6. [Navigation & Shared Components](#navigation--shared-components)
7. [Dark / Light Mode](#dark--light-mode)
8. [Styling & Theming](#styling--theming)
9. [Math Rendering](#math-rendering)
10. [Deploying to GitHub Pages](#deploying-to-github-pages)
11. [Common Tasks — Quick Reference](#common-tasks--quick-reference)

---

## File Structure

```
your-repo/
│
├── index.html            ← Homepage / landing page
├── about.html            ← About me & research interests
├── publications.html     ← Papers and preprints
├── talks.html            ← Seminars, conference talks, posters
├── teaching.html         ← TA roles and community service
├── cv.html               ← Full curriculum vitae timeline
├── other.html            ← Theses and master's projects
├── misc.html             ← Books, side projects, thoughts
├── games.html            ← 2048, Snake, Minesweeper, Game of Life
├── files.html            ← Central file repository (PDFs)
│
├── styles.css            ← All styling, both light & dark themes
├── nav.js                ← Shared sidebar, mobile header, theme toggle
│
├── assets/
│   └── photo.png         ← Your profile photo
│
└── files/
    ├── cv_pignatelli.pdf
    ├── notes_aachen_mar2025.pdf
    ├── plateau_problem.pdf
    ├── poster_como_jun2025.pdf
    ├── poster_wurzburg_apr2024.pdf
    ├── project_CFD_master.pdf
    ├── project_flocking_master.pdf
    ├── project_porousmedia_master.pdf
    ├── slides_CFD_master.pdf
    ├── slides_CWE_master.pdf
    ├── slides_bachelor_jul2021.pdf
    ├── slides_covnl_jul2025.pdf
    ├── slides_flocking_master.pdf
    ├── slides_gammamia_oct2024.pdf
    ├── slides_master_jul2023.pdf
    ├── slides_nijmegen_nov2023.pdf
    ├── slides_tuwien_may2025.pdf
    ├── thesis_bachelor_jul2021.pdf
    ├── thesis_master_jul2023.pdf
    └── ...               ← Any future PDFs go here
```

---

## Getting Started

Because this is a plain HTML site, there is no install step. To preview locally, the simplest option is a one-line server from your terminal:

```bash
# Python (comes pre-installed on most systems)
python3 -m http.server 8000
# then open http://localhost:8000 in your browser
```

Alternatively, if you have Node.js:

```bash
npx serve .
```

> **Important:** Don't just double-click `index.html` to open it. Some browsers block local font and script loading when files are opened directly from disk (`file://` protocol). Always use a local server.

---

## Adding Your Photo

1. Create a folder named `assets` in the root of the repository.
2. Save your photo inside it as `photo.png`.
   - Square crop works best; minimum recommended size is **400 × 400 px**.
3. That's it — no code changes needed.

Your photo appears in three places automatically: the homepage hero, the sidebar on every sub-page, and the mobile header.

If the file is missing, a grey placeholder with your initials is shown instead.

---

## Page-by-Page Guide

### Homepage (`index.html`)

The landing page. Contains your name, title, affiliation, social links, and a grid of cards linking to every section.

**To update your name, title, or affiliation:**
```html
<h1 class="home-name">Luca Pignatelli</h1>
<p class="home-title">PhD Candidate · Calculus of Variations</p>
<p class="home-affil">Radboud University · Nijmegen, Netherlands</p>
```

**To update social/contact links:** Find the `.home-social` div and update the `href` attributes.

**To change section card descriptions:** Each card is an `<a class="home-card">` block. Edit the `.card-desc` text.

---

### About (`about.html`)

Bio, research description, mathematical statement of the central problem, and research interests.

**To update bio:** Edit `<div class="about-bio">`. Supports inline LaTeX.

**To update research interests:** Edit `<ul class="interest-list">`.

**To update the theorem box:** Find `<div class="theorem-box">` and edit the label and LaTeX.

---

### Publications (`publications.html`)

Papers with filter buttons (All / Preprint / In Progress).

**To add a paper:** Copy an `<li class="pub-item" data-type="preprint">` block and fill in `.pub-year`, `.pub-badge`, `.pub-title`, `.pub-authors`, `.pub-venue`, `.pub-abstract`, `.pub-links`.

**To add a filter category:** Add `<button class="filter-btn" data-filter="journal">Journal</button>` and mark papers with `data-type="journal"`.

---

### Talks (`talks.html`)

Past talks followed by upcoming events.

**To add a talk:** Copy a `.talk-item` block. Add a `.pub-links` block for slides/poster/notes.

**To unlock a file button:** Find the `<!-- Uncomment when ... -->` comment and remove the comment markers.

**To add an upcoming event:** Copy an `.upcoming-item` block.

File naming: `slides_[venue]_[monthyear].pdf`, `poster_[venue]_[monthyear].pdf`, `notes_[venue]_[monthyear].pdf`.

---

### Teaching (`teaching.html`)

Course cards and a service/community list.

**To add a course:** Copy a `.course-card` block and fill in `.course-term`, `.course-level`, `.course-name`, `.course-inst`, `.course-desc`.

**To add a service entry:** Copy a `.talk-item` in the service section.

---

### Curriculum Vitae (`cv.html`)

Timeline of positions, education, research visits, conferences, skills, and referees.

**To add a timeline entry:** Copy a `.tl-item` block within the right `<div class="timeline-track">` and fill in `.tl-year`, `.tl-role`, `.tl-place`.

**To update the CV PDF:** Change the `href` in `.cv-download-wrap` to point to the new file.

---

### Other Mathematics (`other.html`)

Theses and master's course projects from BSc and MSc at Politecnico di Torino.

**To add an entry:** Copy a `.pub-item` block. Thesis entries have two button pairs (thesis + slides); project entries have one or two depending on available files.

---

### Miscellany (`misc.html`)

Three sections: Recently Read, Side Projects, Thoughts.

**To add a book:** Copy `.book-item`. Set `.book-spine` background colour inline.

**To add a project:** Copy `.project-card`.

**To add a thought:** Copy `.thought-item`. Supports inline LaTeX.

---

### Games (`games.html`)

Four browser games in a 2×2 grid on desktop, single column on mobile. All high scores saved in `localStorage`.

**2048**
- Arrow keys (hover card first on desktop) or swipe on mobile.
- Reach 2048 to win. High score key: `lp-hs-2048`.

**Snake**
- Arrow keys / WASD or swipe. Speed increases with score.
- High score key: `lp-hs-snake`.

**Minesweeper**
- 9×9 grid, 10 mines. First click is always safe.
- Left-click to reveal; right-click or the toggle button to flag.
- Button label describes current cell-click mode: **🔍 Reveal** = clicking reveals; **🚩 Flag** = clicking flags.
- Best time key: `lp-hs-ms`.

**Conway's Game of Life**
- 60×60 toroidal grid. Starts with a glider.
- Click/drag to draw; ▶/⏸ to run/pause; **Random** or **Clear** to reset.

**To modify a game:** Edit the relevant IIFE block in the `<script>` at the bottom of `games.html`.

---

### Files (`files.html`)

Table-based repository of all PDFs: Papers, Talk Slides, Posters, Notes, Theses, Master's Projects, CV.

**To add a file:**
1. Drop the PDF into `files/`.
2. Copy an existing `<tr>` row in the right section and update the name, context, badge, date, and path.

**Badge classes:**

| Class | Colour | Use for |
|---|---|---|
| `badge-paper` | warm gold | preprints, papers, CV, theses |
| `badge-slides` | blue | talk slides, master's projects |
| `badge-poster` | purple | conference posters |
| `badge-notes` | green | lecture notes, reading group summaries |

**Gamma Mia notes placeholder:** When `files/notes_nijmegen_oct2024.pdf` is ready, uncomment the placeholder rows in both `files.html` (Notes section) and `talks.html` (Gamma Mia entry).

---

## Adding Downloadable Files

All PDFs live in `files/`. Naming convention:

```
files/
├── slides_[venue]_[monthyear].pdf      e.g. slides_tuwien_may2025.pdf
├── poster_[venue]_[monthyear].pdf      e.g. poster_como_jun2025.pdf
├── notes_[venue]_[monthyear].pdf       e.g. notes_aachen_mar2025.pdf
├── thesis_[degree]_[monthyear].pdf     e.g. thesis_master_jul2023.pdf
└── project_[topic]_master.pdf          e.g. project_CFD_master.pdf
```

Standard button pattern (preview opens new tab, download saves the file):

```html
<button class="btn btn-outline"
  data-pdf-preview="files/your-file.pdf"
  data-pdf-title="Descriptive title">
  Preview
</button>
<a href="files/your-file.pdf" class="btn btn-pdf" download>
  Download
</a>
```

---

## Navigation & Shared Components

All pages share the sidebar and mobile header, both injected by **`nav.js`**.

**To add a new page:** Edit the `NAV` array in `nav.js`:

```javascript
var NAV = [
  { href: 'index.html',        label: 'Home'             },
  { href: 'about.html',        label: 'About'            },
  { href: 'publications.html', label: 'Publications'     },
  { href: 'talks.html',        label: 'Talks'            },
  { href: 'teaching.html',     label: 'Teaching'         },
  { href: 'cv.html',           label: 'Curriculum Vitae'  },
  { href: 'other.html',        label: 'Other Mathematics' },
  { href: 'misc.html',         label: 'Miscellany'        },
  { href: 'games.html',        label: 'Games'             },
  { href: 'files.html',        label: 'Files'             },
];
```

**Every sub-page needs** in `<body>`:
```html
<header class="mobile-header" id="mobile-header"></header>
<aside  class="sidebar"       id="sidebar"></aside>
```
And before `</body>`:
```html
<script src="nav.js"></script>
```

---

## Dark / Light Mode

Defaults to system preference (`prefers-color-scheme`). Manual choice stored in `localStorage` as `lp-theme`.

All colours are CSS custom properties. To change a colour for both themes, edit it in both blocks in `styles.css`:

```css
:root, [data-theme="light"] { --gold: #8a6a2a; }
[data-theme="dark"]          { --gold: #c49a3c; }
```

---

## Styling & Theming

All styles in `styles.css`, organised in labelled sections. Key sections:

- **CSS Custom Properties** — colours & fonts
- **Homepage** — `.home-hero`, `.home-cards`
- **Publications** — `.pub-list`, `.pub-badge`
- **CV Timeline** — `.timeline-track`, `.tl-item`
- **Files** — `.file-table`, `.file-badge`
- **Responsive** — `@media` breakpoints

**Fonts** (Google Fonts):
- `Cormorant Garant` — display headings and game titles
- `EB Garamond` — body text
- `DM Sans` — UI elements

---

## Math Rendering

LaTeX rendered by [MathJax 3](https://www.mathjax.org) via jsDelivr CDN. Add to any page that needs it:

```html
<script>
  window.MathJax = {
    tex: { inlineMath: [['\\(','\\)']], displayMath: [['\\[','\\]']] }
  };
</script>
<script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js" async></script>
```

Inline: `\( \varepsilon \to 0 \)` — Display: `\[ \mathcal{F}_\varepsilon[u] = \ldots \]`

Currently loaded on: `about.html`, `publications.html`, `talks.html`, `other.html`, `misc.html`.

---

## Deploying to GitHub Pages

1. Create a repository (e.g. `pignatelliluca.github.io`)
2. Push all files to `main`
3. Repository → **Settings** → **Pages** → Source: `main` / `root` → **Save**
4. Live at `https://yourusername.github.io/` within a minute

---

## Common Tasks — Quick Reference

| Task | File to edit |
|---|---|
| Change name / title / affiliation | `index.html` and `nav.js` |
| Add a new paper | `publications.html` |
| Add a past talk or poster | `talks.html` |
| Add an upcoming event | `talks.html` — `.upcoming-item` block |
| Add a new course | `teaching.html` |
| Add a timeline entry (CV) | `cv.html` |
| Add a thesis or MSc project | `other.html` |
| Add a book, project, or thought | `misc.html` |
| Upload a PDF and link it | Drop in `files/`, add row to `files.html`, add buttons on relevant page |
| Unlock a commented-out file button | Find `<!-- Uncomment when ... -->` in `talks.html` or `files.html` and remove comment markers |
| Add a page to the nav | `nav.js` — `NAV` array |
| Change the accent colour | `styles.css` — `--gold` and `--gold-h` in both theme blocks |
| Change body font | `styles.css` — `font-family` on `body`, update Google Fonts import |
| Add LaTeX to a page | Add MathJax `<script>` tags to that page's `<head>` |
| Update social links in the sidebar | `nav.js` — `buildSidebar()` function |
| Update profile photo | Replace `assets/photo.png` |
| Modify a game | Edit the relevant IIFE block in `games.html` `<script>` |

---

*Last updated: March 2026*
