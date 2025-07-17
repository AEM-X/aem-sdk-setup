const fs = require('fs');
const path = require('path');

const version = process.argv[2];
if (!version) {
  console.error('Version argument required');
  process.exit(1);
}

const configPath = path.join(__dirname, '..', 'oclif.config.json');
const pkgPath = path.join(__dirname, '..', 'package.json');

const oclifConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const packageJson = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

oclifConfig.version = version;
packageJson.version = version;

fs.writeFileSync(configPath, JSON.stringify(oclifConfig, null, 2) + '\n');
fs.writeFileSync(pkgPath, JSON.stringify(packageJson, null, 2) + '\n');
