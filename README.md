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

1. Download the AEM as a Cloud Service SDK (also known as the _aem-local-sdk_) from
   the [official product downloads page](https://experience.adobe.com/#/downloads/content/software-distribution/en/aemcloud.html).
2. Place the ZIP files in a directory (or use the `-d` flag to specify a different location).
3. Run the CLI from that location or specify the directory using command-line flags.

**Required files:**

- `aem-sdk-<version>.zip` - The main AEM SDK archive (required)

**Optional files:**

- `aem-forms-addon-<version>.zip` - AEM Forms add-on (optional)
- `install/*.zip` - Any ZIP files in an `install/` folder will be copied to both instances
- `secretsdir/` - Local secrets directory (optional)
- `start_author.sh` / `start_publish.sh` - Helper start scripts (optional)

## Usage

### Basic Usage

Place the official AEM SDK ZIP files in a directory and run the command from
that location. At a minimum the CLI expects an archive named
`aem-sdk-<version>.zip`. The command extracts the archive into a folder next to
the ZIP and copies the quickstart JARs into the `instance/` structure. If a
folder named `install/` is present, all ZIP files within are copied to both
author and publish `crx-quickstart/install` directories.

```bash
aem-sdk-setup
```

### Interactive Setup

The command walks you through an interactive setup where you choose whether to
install optional components:

- **Full Installation** – Choose "yes" to install all optional components (Forms, Secrets, Dispatcher)
- **AEM Forms add‑on** – Requires a file matching `aem-forms-addon-*.zip`. The extracted `.far` archive is copied to both instances.
- **Secrets** – Copies a local `secretsdir/` folder and sets the required sling property files.
- **AEM Dispatcher tools** – Executes the dispatcher installer found in the SDK and moves the generated `dispatcher-sdk-*` folder to `dispatcher/`. Optionally, you can provide a path to dispatcher source files.

After extraction, two folders `instance/author` and `instance/publish` are created containing the
quickstart JARs. If `start_author.sh` or `start_publish.sh` exist in the working
directory, they are copied into the respective instance folders for convenience.

### Custom Directories

If the ZIP files reside elsewhere, you can provide the location using the `-d`
or `--directory` flag. Generated files are placed in an `output/` directory by
default, which can be changed with the `-o`/`--output` flag:

```bash
aem-sdk-setup --directory /path/to/zips --output ./result
```

### Example Workflow

```bash
# 1. Download SDK files to a directory
cd ~/aem-sdk-files

# 2. Run setup (interactive)
aem-sdk-setup

# 3. Or specify custom paths
aem-sdk-setup -d ~/downloads/aem -o ~/aem-instances/my-project
```

### Output Structure

After successful setup, your output directory will contain:

```
output/
├── instance/
│   ├── author/
│   │   ├── aem-author-p4502.jar
│   │   ├── crx-quickstart/
│   │   │   ├── install/          # Packages from install/ folder
│   │   │   ├── conf/
│   │   │   │   └── sling.properties  # If secrets installed
│   │   │   └── secretsdir/       # If secrets installed
│   │   └── start_author.sh       # If present in working directory
│   └── publish/
│       ├── aem-publish-p4503.jar
│       └── crx-quickstart/
│           └── ... (same structure as author)
└── dispatcher/                   # If dispatcher installed
    └── dispatcher-sdk-*/
```

## Commands

The CLI exposes a single root command. The following options are available:

```bash
# Display usage information
aem-sdk-setup --help

# Display version number only
aem-sdk-setup --version
aem-sdk-setup -v

# Use files from a different directory
aem-sdk-setup -d /path/to/zips
aem-sdk-setup --directory /path/to/zips

# Write instance to a custom folder
aem-sdk-setup -o ./result
aem-sdk-setup --output ./result

# Enable shell autocompletion
aem-sdk-setup autocomplete
```

Running `aem-sdk-setup` without a subcommand automatically executes the setup process.

When installed globally, the CLI will warn you if a newer version is available.

## Troubleshooting

### Common Issues

**Error: AEM SDK file not found**

- Ensure the SDK ZIP file is named `aem-sdk-<version>.zip`
- Check that you're running the command from the correct directory, or use `-d` to specify the directory

**Error: Quickstart jar not found**

- The SDK archive may be corrupted or incomplete. Re-download the SDK from Adobe.

**Error: AEM Forms Archive (.far) file not found**

- Ensure the Forms add-on ZIP is properly extracted
- Verify the Forms ZIP file is not corrupted

**Dispatcher installer fails**

- On Windows, ensure `bash` is available (Git Bash or WSL)
- Check that the installer script has execute permissions
- Verify the SDK archive contains the dispatcher tools

**Secrets installation fails**

- Ensure `secretsdir` folder exists in the working directory (or the directory specified with `-d`)
- Check folder permissions

### Getting Help

- Run `aem-sdk-setup --help` for command-line options
- Check the [GitHub Issues](https://github.com/AEM-X/aem-sdk-setup/issues) for known problems
- Review the [Contributing Guide](CONTRIBUTING.md) for development setup

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

- **Node.js:** 18 and later
- **Operating Systems:** Linux, macOS, and Windows
- **Windows Notes:**
  - Dispatcher installation requires `bash` (Git Bash or WSL recommended)
  - All other operations work natively on Windows

The project is tested on Linux, macOS, and Windows via GitHub Actions.

## License

This project is licensed under the Apache License 2.0. See [LICENSE](LICENSE) for details.
