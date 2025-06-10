# AEM SDK Setup CLI

This project provides a small command line interface built with [oclif](https://oclif.io/) to automate setting up a local AEM SDK. It is **not** a migration tool but simply a helper utility for extracting the SDK archives and preparing your development environment.

## Installation

```bash
npm install -g ./
```

## Usage

Place the AEM SDK ZIP files in a directory and run the command:

```bash
aem-sdk-setup
```

You will be asked which optional components (AEM Forms, secrets and Dispatcher tools) you would like to install.

### Commands

The CLI exposes a single root command. The following options are available:

```bash
aem-sdk-setup --help       # display usage information
aem-sdk-setup --version    # display version number
```

## Contribution

1. Fork the repository and create your branch.
2. Install dependencies with `npm install`.
3. Run `npm test` and `npm run lint` before submitting a pull request.

## Supported Environments

- Node.js 18+
- Tested on Linux, macOS and Windows via GitHub Actions

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
