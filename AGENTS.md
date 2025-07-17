# Repository Guidelines for Codex Agents

- Use Prettier and ESLint configs provided in the repository.
- Avoid synchronous fs operations and hard coded paths.
- All CLI logs should be formatted using `src/utils/log.js`.
- New code must be covered by Jest unit tests using mocked file systems.
- Commands should remain compatible with oclif v4 and use CommonJS modules.
- Always run `npm test` before committing.
