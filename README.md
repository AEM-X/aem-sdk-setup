# AEM SDK Setup CLI

[![CI](https://github.com/AEM-X/aem-sdk-setup/actions/workflows/node.yml/badge.svg)](https://github.com/AEM-X/aem-sdk-setup/actions/workflows/node.yml)
[![Coverage Status](https://codecov.io/gh/AEM-X/aem-sdk-setup/branch/main/graph/badge.svg)](https://codecov.io/gh/AEM-X/aem-sdk-setup)
[![CodeQL](https://github.com/AEM-X/aem-sdk-setup/actions/workflows/codeql.yml/badge.svg)](https://github.com/AEM-X/aem-sdk-setup/actions/workflows/codeql.yml)
[![License Scan](https://github.com/AEM-X/aem-sdk-setup/actions/workflows/license.yml/badge.svg)](https://github.com/AEM-X/aem-sdk-setup/actions/workflows/license.yml)
[![Security Audit](https://github.com/AEM-X/aem-sdk-setup/actions/workflows/npm-audit.yml/badge.svg)](https://github.com/AEM-X/aem-sdk-setup/actions/workflows/npm-audit.yml)

This project provides a small command line interface built with [oclif](https://oclif.io/) to automate setting up a local AEM SDK. It is **not** a migration tool but simply a helper utility for extracting the SDK archives and preparing your development environment.

<!-- toc -->

- [Installation](#installation)
- [Getting started](#getting-started)
- [Usage](#usage)
- [Commands](#commands)
- [Contribution](#contribution)
- [Publishing](#publishing)
- [Tech Stack](#tech-stack)
- [Package Information](#package-information)
- [Code Coverage](#code-coverage)
- [Code Quality](#code-quality)
- [License Scan](#license-scan)
- [Security Audit](#security-audit)
- [Supported Environments](#supported-environments)
- [License](#license)
<!-- tocstop -->

## Installation

Requires Node.js 18 or later.

```bash
npm install -g ./
```

Installing globally makes the `aem-sdk-setup` command available in your `PATH`.

From a cloned repository you can invoke the CLI without installing it globally:

```bash
node ./bin/run --help
```

## Getting started

Download the AEM as a Cloud Service SDK (also known as the _aem-local-sdk_) from
the official product downloads page and place the ZIP files in a directory.
Run the CLI from that location.

## Usage

Place the official AEM SDK ZIP files in a directory and run the command from
that location. At a minimum the CLI expects an archive named
`aem-sdk-<version>.zip`. The command extracts the archive into a folder next to
the ZIP and copies the quickstart JARs into the `instance/` structure. If a
folder named `install/` is present, all ZIP files within are copied to both
author and publish `crx-quickstart/install` directories.

When the CLI runs it prompts for optional installations:

- **AEM Forms add‑on** – requires a file matching
  `aem-forms-addon-*.zip`. The extracted `.far` archive is copied to both
  instances.
- **Secrets** – copies a local `secretsdir/` folder and sets the required sling
  property files.
- **AEM Dispatcher tools** – executes the dispatcher installer found in the SDK
  and moves the generated `dispatcher-sdk-*` folder to `dispatcher/`.

```bash
aem-sdk-setup
```

Run `aem-sdk-setup --help` at any time to see available options.

The command walks you through an interactive setup where you choose whether to
install AEM Forms, secrets or the Dispatcher tools. After extraction two
folders `instance/author` and `instance/publish` are created containing the
quickstart JARs. If `start_author.sh` or `start_publish.sh` exist in the working
directory they are copied into the respective instance folders for convenience.

If the ZIP files reside elsewhere you can provide the location using the `-d`
or `--directory` flag. Generated files are placed in an `output/` directory by
default which can be changed with the `-o`/`--output` flag:

```bash
aem-sdk-setup --directory /path/to/zips --output ./result
```

## Commands

The CLI exposes a single root command. The following options are available:

```bash
aem-sdk-setup --help                   # display usage information
aem-sdk-setup --version, -v            # display version number only
aem-sdk-setup -d /path/to/zips         # use files from a different directory
aem-sdk-setup -o ./result              # write instance to a custom folder
aem-sdk-setup autocomplete             # enable shell autocompletion
```

Running `aem-sdk-setup` without a subcommand automatically executes the setup process.

When installed globally the CLI will warn you if a newer version is available.

## Contribution

1. Fork the repository and create your branch.
2. Install dependencies with `npm install`.
3. Run `npm run format:check` and `npm run lint` before submitting a pull request.
4. Run `npm test`.

## Publishing

The CLI reads its version from `package.json`. To release a new version:

1. Bump the version with `npm version <patch|minor|major>`.
2. Ensure the `author` field in `package.json` is populated.
3. Publish the package to npm using `npm publish --access public`.

After publishing, the new version will be shown when running `aem-sdk-setup --version`.

## Tech Stack

- Node.js and [oclif](https://oclif.io/) for the CLI framework
- `fs-extra`, `glob` and `unzipper` for filesystem and archive operations
- Jest for unit testing with coverage
- ESLint and Prettier for code style
- GitHub Actions for continuous integration with linting, formatting checks, tests and CodeQL analysis

## Package Information

- **Name:** `aem-sdk-setup`
- **Version:** see [`package.json`](package.json) for the current release
- **License:** Apache-2.0
- **Runtime dependencies:** `@oclif/core`, `fs-extra`, `glob`, `unzipper`
- **Dev dependencies:** `jest`, `eslint`, `prettier`, `@types/node`

## Code Coverage

The `node.yml` workflow runs `npm test -- --coverage --coverageReporters=text --coverageReporters=lcov` on every commit. The coverage
results are printed in the console and uploaded to Codecov.

To check coverage locally run:

```bash
npm test -- --coverage --coverageReporters=text --coverageReporters=lcov
```

The current test suite reports around **97%** statement coverage.

## Code Quality

In addition to coverage reports, the repository runs a scheduled CodeQL scan via
GitHub Actions to detect common vulnerabilities and ensure code quality.

## License Scan

A dedicated workflow uses `license-checker` to review dependency licenses on
every push and pull request. The generated report is uploaded as a workflow
artifact for further inspection.

## Security Audit

An additional job runs `npm audit --audit-level=high` on each commit to detect
known vulnerabilities in dependencies.

## Supported Environments

- Node.js 18 and later
- Tested on Linux, macOS and Windows via GitHub Actions

## License

This project is licensed under the Apache License 2.0. See [LICENSE](LICENSE) for details.
