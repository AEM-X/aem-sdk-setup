# AEM SDK Setup CLI

[![CI](https://github.com/AEM-X/aem-sdk-setup/actions/workflows/node.yml/badge.svg)](https://github.com/AEM-X/aem-sdk-setup/actions/workflows/node.yml)
[![npm](https://img.shields.io/npm/v/aem-sdk-setup.svg)](https://www.npmjs.com/package/aem-sdk-setup)
[![Coverage Status](https://codecov.io/gh/AEM-X/aem-sdk-setup/branch/main/graph/badge.svg)](https://codecov.io/gh/AEM-X/aem-sdk-setup)
[![CodeQL](https://github.com/AEM-X/aem-sdk-setup/actions/workflows/codeql.yml/badge.svg)](https://github.com/AEM-X/aem-sdk-setup/actions/workflows/codeql.yml)
[![License Scan](https://github.com/AEM-X/aem-sdk-setup/actions/workflows/license.yml/badge.svg)](https://github.com/AEM-X/aem-sdk-setup/actions/workflows/license.yml)
[![Security Audit](https://github.com/AEM-X/aem-sdk-setup/actions/workflows/npm-audit.yml/badge.svg)](https://github.com/AEM-X/aem-sdk-setup/actions/workflows/npm-audit.yml)

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
AEM SDK Setup is a Node.js CLI built with [oclif](https://oclif.io/) that automates preparing local AEM SDK instances. It extracts the official archives and can set up dispatcher configs, forms add-ons, and secrets. The project uses Jest for testing, JSDoc for documentation, and semantic-release for automated versioning.

<!-- toc -->

- [Installation](#installation)
- [Getting started](#getting-started)
- [Features](#features)
- [Usage](#usage)
- [Commands](#commands)
- [Flags](#flags)
- [Developer Commands](#developer-commands)
- [Testing](#testing)
- [Documentation](#documentation)
- [Release](#release)
- [Contribution](#contribution)
- [License](#license)
<!-- tocstop -->

## Installation

Requires Node.js 18 or later.

```bash
npm install -g aem-sdk-setup
```

Installing globally makes the `aem-sdk-setup` command available in your `PATH`.

Clone the repository and install dependencies for local development:

```bash
git clone https://github.com/AEM-X/aem-sdk-setup.git
cd aem-sdk-setup
npm install
npm link
```

Now you can run `aem-sdk-setup --help` from anywhere.

## Getting started

Download the AEM as a Cloud Service SDK (also known as the _aem-local-sdk_) from
the official product downloads page. Initialise a working directory and
sub‑folders using the `init` command:

```bash
aem-sdk-setup init
```

Place the ZIP files inside `setup/input` and run the CLI from anywhere.

## Features

- Extracts AEM SDK archives and copies quickstart JARs
- Optional Forms add-on installation
- Secrets folder handling
- Dispatcher configuration setup
- Dry-run and JSON output modes
- Styled progress output
- Generates API docs with JSDoc

## Usage

Place the official AEM SDK ZIP files inside `setup/input` and run the command
from any directory. At a minimum the CLI expects an archive named
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

If you want to use different locations you can override the defaults with the
`-d`/`--directory` flag and the `-o`/`--output` flag. By default the command
reads from `setup/input` and writes the instance to `setup/output`:

```bash
aem-sdk-setup --directory /path/to/zips --output ./result
```

## Commands

The following commands and options are available:

| Command                          | Description                          |
| -------------------------------- | ------------------------------------ |
| `aem-sdk-setup --help, -h`       | Display usage information            |
| `aem-sdk-setup --version, -v`    | Display version number only          |
| `aem-sdk-setup -d /path/to/zips` | Use files from a different directory |
| `aem-sdk-setup -o ./result`      | Write instance to a custom folder    |
| `aem-sdk-setup --verbose`        | Show detailed progress output        |
| `aem-sdk-setup init`             | Create the default folder structure  |
| `aem-sdk-setup autocomplete`     | Enable shell autocompletion          |
| `aem-sdk-setup commands`         | List all available commands          |
| `aem-sdk-setup update`           | Update to the latest version         |

Flags such as `--dry-run` and `--verbose` can be used with most commands for
additional control.

Running `aem-sdk-setup` without a subcommand automatically executes the setup process.

## Flags

| Flag        | Description                               |
| ----------- | ----------------------------------------- |
| `--dry-run` | Simulate actions without writing files    |
| `--verbose` | Show detailed logs                        |
| `--json`    | Output results as JSON                    |
| `--force`   | Overwrite existing files                  |
| `--skip-*`  | Skip optional steps like forms or secrets |

## Developer Commands

Run these from the project root:

```bash
npm run lint
npm run format
npm test
npm run docs
```

When installed globally the CLI will warn you if a newer version is available.
You can also run `aem-sdk-setup update` to upgrade to the latest release.

## Testing

Run the full test suite with coverage:

```bash
npm test -- --coverage
```

Tests mock all file and network operations using Jest.

## Documentation

Generate API reference using JSDoc:

```bash
npm run docs
```

Documentation is output to [docs/index.html](docs/index.html).

## Release

This project uses semantic-release to publish new versions and changelogs automatically when commits follow the Conventional Commits spec.

## Contribution

Use semantic commit messages and read [AGENTS.md](AGENTS.md) for full contributor rules.

## License

This project is licensed under the Apache License 2.0. See [LICENSE](LICENSE) for details.
