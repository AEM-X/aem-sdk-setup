# Quick Context for AI Agents

AEM SDK Setup is a Node.js CLI powered by **oclif**. Commands live in
`src/commands` and delegate most work to modules under `src/lib`. Shared
utilities such as the logger reside in `src/utils/`, and constants are defined
in `src/lib/constants.js`. All filesystem operations rely on the async API from
`fs-extra`.

Tests are located in the `test/` folder and executed with **Jest**. Generate API
documentation with `npm run docs`, which outputs to `docs/` (ignored by git).
Continuous integration and releases run via GitHub Actions workflows using
**semantic-release**.

**Folder overview**

```
bin/               - CLI entry point
src/commands/      - command definitions
src/lib/           - reusable modules
src/utils/         - shared utilities such as logging
test/              - jest tests
```

Always skim `README.md`, `package.json`, and `oclif.config.json` first. If the
project structure or conventions change, update this file and the generated docs
so future agents have accurate context. Run `npm test`, `npm run lint`, and
`npm run docs` before committing.

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
