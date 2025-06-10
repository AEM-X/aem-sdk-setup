# AEM SDK Setup CLI

This CLI helps you set up a local AEM SDK environment. It mirrors the behavior of the original shell script using Node.js and [oclif](https://oclif.io/).

## Installation

```bash
npm install -g ./
```

## Usage

Run the setup command in a directory containing the AEM SDK ZIP files:

```bash
aem-sdk-setup
```

The tool will prompt whether to install additional components such as AEM Forms, secrets, and Dispatcher tools.

## Contribution

1. Fork the repository and create your branch.
2. Install dependencies with `npm install`.
3. Run `npm test` and `npm run lint` before submitting a pull request.

## Supported Environments

- Node.js 18+
- Tested on Linux, macOS and Windows via GitHub Actions

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
