# AEM SDK Setup

A command line tool to unpack the AEM as a Cloud Service SDK and prepare a local development instance. The CLI is built with [oclif](https://oclif.io/).

## Installation

Node.js 18 or newer is required. Clone this repository and install the dependencies:

```bash
npm install
```

You can then run the CLI directly:

```bash
node ./bin/run --help
```

## Usage

Place the official SDK ZIP files in a directory and execute the command from that location:

```bash
node ./bin/run setup
```

The tool extracts the archives and copies the quickstart JARs into an `instance/` structure. It optionally installs the AEM Forms add‑on, secrets configuration and Dispatcher tools.

### Options

- `-d, --directory` – folder containing the SDK files (defaults to the current directory)
- `-o, --output` – destination for the generated instance (defaults to `output`)

Run `node ./bin/run --help` to see all available flags.

## Development

- `npm test` runs the unit tests
- `npm run lint` checks code style
- `npm run format` formats source files

The project includes a comprehensive test suite with full coverage.

## License

Apache-2.0
