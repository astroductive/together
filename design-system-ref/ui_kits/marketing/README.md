# UI Kit · Marketing Landing

A faithful recreation of the Together marketing landing page — the glass / monochrome direction from the Figma "Landing page and dashboard" project.

## Files
- `index.html` — mounts the page; loads `styles.css`, the DS bundle, shared icons, and `LandingPage.jsx`.
- `LandingPage.jsx` — the full page, composed from DS primitives (`Button`, `Card`, `Logo`, `Badge`).

## Sections
Glass nav ribbon · split hero (light copy + ink panel + Arabic live card) · scrolling marquee · five-mode feature grid (ink fill-sweep on hover) · "Language first" panel · field-notes editorial row · ink workflow steps · closing CTA · footer.

## Notes
- Light theme only (marketing surface). Page background is the original radial + linear gradient wash.
- Icons come from `ui_kits/lib/icons.jsx` (lucide-matched). Feature hover sweeps an ink panel up from the bottom — the brand's signature interaction.
- Responsive: collapses to a single column under 900px (ink hero panel + nav links hide).
