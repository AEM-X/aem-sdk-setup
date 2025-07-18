# Repository Guidelines for Codex Agents

## Project Structure Rules

- Commands parse flags only and delegate logic to modules in `src/lib/`.
- Use `src/utils/log.js` for all CLI output and `src/lib/constants.js` for shared values.
- Never use synchronous filesystem APIs or hard‑coded paths.

## Required CLI Behavior

- Each command must support `--dry-run`, `--verbose`, `--json`, `--force`, and `--skip-*` flags.
- Show progress with `ux.action.start()` and `ux.action.stop()` when tasks take noticeable time.
- Throw errors with `this.error()` for user-facing failures.

## Testing Standards

- Achieve 100% Jest coverage for new code.
- Mock all filesystem or external interactions.
- Cover success, failure, edge cases, and flag effects.

## Documentation Standards

- Document every exported function with JSDoc including purpose, `@param`, `@returns`, and error behavior.
- Run `npm run docs` to generate HTML docs in the `docs/` folder.

## Release and CI

- Commits must follow semantic-release conventions; version numbers are managed automatically.
- CI must pass lint, tests, and formatting before merge. Documentation is rebuilt on each release.

## Codex Execution Rules (Every Time):

Always read README.md, package.json, oclif.config.json before doing anything

Only modify files related to the current phase or task

Never repeat or reanalyze completed work

Check for existing functionality before adding anything

Reuse lib/ helpers when applicable

Never leave TODOs or incomplete logic

Prioritize performance, clarity, testability over cleverness

## Contributor Reminder

All contributors, human or AI, must maintain production-level standards. Commits must not reduce coverage, break CI, or bypass linting.
