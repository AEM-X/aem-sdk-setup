# AEM SDK Setup CLI

This project provides a small command line interface built with [oclif](https://oclif.io/) to automate setting up a local AEM SDK. It is **not** a migration tool but simply a helper utility for extracting the SDK archives and preparing your development environment.

## Installation

```bash
npm install -g ./
```

From a cloned repository you can invoke the CLI without installing it globally:

```bash
node ./bin/run --help
```

## Usage

Place the AEM SDK ZIP files in a directory and run the command from that
directory. At a minimum the CLI expects an `aem-sdk-*.zip` archive. Optional
archives such as `aem-forms-addon-*.zip` or the dispatcher tools installer can
be placed next to it. The tool extracts everything into an `instance/` folder.

```bash
aem-sdk-setup
```

The command walks you through an interactive setup where you choose whether to
install AEM Forms, secrets or the Dispatcher tools. The archives are extracted
into an `instance/` folder and start scripts are copied for you.

If the ZIP files reside elsewhere you can provide the location using the `-d`
or `--directory` flag:

```bash
aem-sdk-setup --directory /path/to/zips
```

### Commands

The CLI exposes a single root command. The following options are available:

```bash
aem-sdk-setup --help                   # display usage information
aem-sdk-setup --version                # display version number
aem-sdk-setup -d /path/to/zips         # use files from a different directory
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
