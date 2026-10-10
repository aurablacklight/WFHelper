# Dev Diagnostic Scripts

These scripts are manual diagnostics. They are not wired into `package.json` and should not
be treated as required build, test, or release steps.

| Script                        | Purpose                                                                  | Notes                                                                 |
| ----------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| `analyze-riven-template.ts`   | Prints alpha and brightness measurements for `assets/RivenTemplate.png`. | Run with `npx tsx` from the repo root.                                |
| `analyze-card-positions.ts`   | Scans OCR debug screenshots to estimate riven card crop regions.         | Expects local `OCR-debug/riven_images` inputs and writes debug crops. |
| `test-crop-positions.ts`      | Exercises candidate riven crop positions against local OCR debug images. | Depends on local debug images and production OCR modules.             |
| `riven-template-analysis.txt` | Captured analysis output for the riven template.                         | Reference artifact, not executable.                                   |
| `advise-gun-build.cjs` | Compares an owned gun's saved configs and recommended build. | Build main first. Takes a local inventory and weapon name; `--target <faction>`, `--stacks`, `--no-capacity`, and `--json` are optional. Defaults to stacks off for arsenal checks. See `docs/build-advisor/validation.md`. |
