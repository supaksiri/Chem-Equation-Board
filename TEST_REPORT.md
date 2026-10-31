# ATOMVERSE 4.0 — Verification report

## Verified in authoring environment
- `npm test`: **37 / 37 passed** (33 existing chemistry tests + 4 additional structural/feature checks).
- Existing tests check C-12, C-13, atom identity, isotope averaging, molecule masses and valid composition.
- Additional checks confirm 16 authored 4-choice quiz items, four detective cases, the count-aware 3D scale code path, and 8 home destinations.

## Not yet verified
- `npm run build`: **cannot be successfully completed here** because npm dependencies (`react`, `three`, etc.) are not installed and npm registry connection timed out; TypeScript reports missing modules. This does not establish that the code is build-error-free.
- No Chromium live interaction or phone responsiveness smoke test was completed on a fully built app.
- Scientific diagrams are simplified and warrant a classroom pilot before use.

## Test after GitHub Actions deployment
1. Check green status of `npm install`, `npm test`, and `npm run build` under Actions. Capture the error log if any job fails.
2. Mass Chamber: 1, 2, 5, 24 atoms should show 1, 2, 5, 24 constant-radius beads. Reference B must be labeled as `หน่วย u`.
3. Atom Forge C-12→C-13, A/B comparison, draggable/stepper control.
4. Quiz full and per-lab sets, choice persistence, result, correct explanations and Return to Lab link.
5. Detective missions: satisfy each lab condition and record it; Passport should persist across refresh.
6. Periodic Portal: select oxygen and check atom Z=8; warning that neutron count is illustrative.
7. Confirm responsive design on mobile, reset storage, and print Passport.
