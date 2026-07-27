# Spectra Leaf project website

This directory contains the editable source for the premium single-page documentation website for the **Spectra Leaf Fermentation System**. The production export is generated into the repository-level `docs/` directory for GitHub Pages.

## Technology

- Next.js 14 App Router, React and TypeScript
- Tailwind CSS with project-level CSS components
- Framer Motion for interface transitions
- GSAP, ScrollTrigger and `@gsap/react` for scroll storytelling
- Lenis for smooth scrolling
- Lucide React icons
- Static export for GitHub Pages

## Structure

```text
site/
├── scripts/                  # Safe asset, build and preview utilities
├── public/assets/            # Project images and prepared video copies
└── src/
    ├── app/                  # Page, metadata, error page and global styling
    ├── components/           # Layout, hero, sections, UI and video stories
    ├── data/                 # Editable project, navigation, team and gallery data
    ├── hooks/                # Motion and active-section preferences
    └── lib/                  # Shared paths and utility helpers
```

## Installation and local development

```powershell
cd site
npm install
npm run dev
```

`npm run dev` first verifies and copies the authoritative videos from `../docs/assets/` into `public/assets/`, then starts Next.js at the URL printed in the terminal.

## Validation and production build

```powershell
npm run check
npm run build
```

The build performs the following sequence:

1. Verifies `docs/assets/video1.mp4` and `video2.mp4`.
2. Copies development versions into `site/public/assets/`.
3. Creates verified backups in `site/.video-backup/`.
4. Cleans only generated content inside `docs/`.
5. Runs the Next.js static export.
6. Copies the export into `docs/`.
7. Restores both protected videos.
8. Creates `docs/.nojekyll` and `docs/404.html`.

Preview the production base path locally with:

```powershell
npm run preview
```

Then open `http://127.0.0.1:4173/e21-3yp-SPECTRA-LEAF/`.

## GitHub Pages deployment

The site is configured for:

- production URL: `https://cepdnaclk.github.io/e21-3yp-SPECTRA-LEAF/`
- base path: `/e21-3yp-SPECTRA-LEAF`
- static output: repository-level `docs/`
- trailing-slash URLs and unoptimized static images

The existing GitHub Actions workflow installs dependencies in `site/`, validates the project, runs the safe production build, and deploys `docs/`.

## Video replacement

Replace the authoritative files only when an intentional project-video update is required:

1. Place the new non-empty files at `docs/assets/video1.mp4` and `docs/assets/video2.mp4`.
2. Keep the filenames exact.
3. Run `npm run prepare:assets`.
4. Run `npm run build`.
5. Confirm the source, backup, public and generated copies remain non-empty.

The legacy misspelled `vedio1.mp4` and `vedio2.mp4` files are preserved unchanged for safety but are not referenced by the site.

## Editing content

- Project text, repository URL, institution details, technology list, objectives, testing status and roadmap: `src/data/project.ts`
- Navigation: `src/data/navigation.ts`
- Team names, registration numbers, roles, contact links and biographies: `src/data/team.ts`
- Gallery entries and alt text: `src/data/gallery.ts`
- Timeline phases and neutral status labels: `src/data/timeline.ts`

To add a gallery image, place it under `public/assets/images/`, add an item in `src/data/gallery.ts`, and use an asset path beginning with `/assets/images/`.

## Asset paths

`src/lib/paths.ts` is the only place that applies the GitHub Pages base path. Use `getAssetPath("/assets/...")` for public images, videos, icons and downloads. Development paths remain root-relative; production paths are prefixed automatically.

## Scroll-controlled video

`src/components/video/ScrollScrubVideo.tsx` lazily loads video metadata near the viewport, maps ScrollTrigger progress to `currentTime`, smooths updates through `requestAnimationFrame`, and uses refs rather than per-frame React state. It cleans observers, listeners, ScrollTriggers and animation frames on unmount.

For reduced-motion users, long scroll pinning is removed, all story text remains visible, and a normal play/pause control is provided.

## Browser compatibility and troubleshooting

The site targets current Chrome, Edge, Firefox and Safari, including mobile Safari. If a video does not appear, confirm the canonical source file exists and is non-empty, then run `npm run prepare:assets`.

If the production preview has missing assets, use the base-path preview command rather than serving `docs/` directly. If a build stops after cleaning generated docs, the verified backups remain in `.video-backup/`; rerunning `npm run build` restores the production output.

After deployment, verify `docs/index.html`, `docs/.nojekyll`, `docs/_next/`, both production videos, internal anchors and the browser console.
