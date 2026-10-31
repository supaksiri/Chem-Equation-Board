# ATOMVERSE 4.0 — Luminous Hybrid Lab

React 18 + TypeScript + Vite + React Three Fiber educational chemistry web app, designed for a Thai Grade 10 (ม.4) course. **Development source; browser/build verification still required.**

## Modules

1. **ATOM FORGE**: protons/neutrons/electrons, isotope identity, 3D nucleus, A/B comparison and atom missions.
2. **MASS CHAMBER**: representative 3D balance with **one constant-sized bead per selected atom** (0–24 on each pan). With reference mode, the right-hand beads represent **1-u mass units**, not atoms. Difference in pan level is based on total representative mass. This is a visual analogy, not a real atomic weighing instrument.
3. **ISOTOPE REACTOR**: hypothetical Cl-35/Cl-37 percentage 0–100, weighted isotopic mass and 80-point particle display.
4. **MOLECULE STUDIO**: guided molecule assembly for 8 verified formulas, molecular mass calculation. This is not a free-valence bond builder.
5. **QUIZ CENTER**: 16 built-in four-choice questions, 4 per laboratory; either all 16 or 4 per laboratory, immediate-feedback practice mode or end-of-quiz feedback exam mode. Each explanation links back to a relevant lab. Questions are hand-authored rather than generated randomly.
6. **SCIENCE DETECTIVE**: 4 lab-linked missions, contextual hints and achievement recording from relevant lab state. LAB 01 additionally has its five inherited Mini Missions.
7. **PERIODIC PORTAL**: interactive short 20-element table with approximate standard atomic weights. Selecting an element launches Atom Forge with that proton/electron count; neutron count starts with a simplified illustrative value and may not correspond to a known stable isotope. Isotope masses are displayed only when a validated dataset entry exists. LAB 02 has the more limited isotope sample selector.
8. **SCIENCE PASSPORT**: local browser storage for 4 detective achievements, last 30 quiz submissions, printing via browser Print to PDF. No accounts, central class grading or cloud sync.

## Getting started

```bash
npm install
npm test
npm run build
npm run dev
```

Open the Vite URL indicated by the terminal. Before showing students: verify Build, live rendering, controls, quiz feedback, mobile layouts and browser console. `npm run build` emits `dist/`. No `node_modules` needs to be uploaded.

## GitHub Pages

Recommended: deploy to a **new** public GitHub repository `atomverse-4.0` so the working ATOMVERSE 3.0/2.0 link is preserved. Upload the **contents** of this project into repository root, including hidden `.github/workflows/deploy.yml` (but exclude `node_modules`). Settings → Pages → Source = **GitHub Actions**; commit to `main`. The bundled workflow runs install → tests → build → deploy `dist`. Once successful: `https://supaksiri.github.io/atomverse-4.0/`. GitHub Pages builds require npm registry connectivity in GitHub Actions.

## Scientific cautions and TODO

- 3D balance models weight/number abstractly, **not actual atomic physical scales**, and visual bead size is fixed.
- Nuclide mass is not necessarily equal to its mass number. In a selected natural element, standard atomic weight is not a single-isotope mass.
- Chlorine abundances here are user-controlled hypothetical percentages. The 80 points approximate the percentage in whole-particle increments.
- Simplified nucleus geometry and molecular geometry are not to scale; model is explicitly pedagogical.
- Quiz is currently 16 items, not a full validated 40-item exam. No statistically validated item difficulties/discriminations.
- Periodic Portal contains 20 elements only. It does not currently pass an isotope selection to Mass Chamber.
- Mission achievement requires clicking **record** after meeting the target LAB 02–04 state; not silently awarded.
- Users can clear browser storage; scores are **not** sent to teacher or database.
- Build/browser screenshot/mobile/keyboard accessibility audits are not verified in this environment: npm dependency download is blocked. Tests validate existing science calculations and structural integration, **not** browser-level simulation correctness.
