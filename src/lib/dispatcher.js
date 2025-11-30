const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const { spawn } = require('child_process');

/**
 * Installs dispatcher configuration using installer script from the extracted SDK.
 *
 * This function locates and executes the dispatcher installer script from the
 * extracted SDK directory. After execution, it moves the generated dispatcher-sdk-*
 * directory to the output location. Optionally, if a source directory is provided,
 * it copies it into the dispatcher directory.
 *
 * @param {string} extractedDir - Path to the extracted SDK directory
 * @param {string} prefix - Prefix pattern for the installer script name (e.g., 'aem-sdk-dispatcher-tools-')
 * @param {string} [outputDir='.'] - Output directory where the dispatcher will be placed
 * @param {string} [src=''] - Optional path to dispatcher source directory to copy
 * @returns {Promise<void>} Resolves when installation is completed
 * @throws {Error} If the extractedDir doesn't exist, installer script is not found, installer exits with non-zero code, or dispatcher directory is not found
 *
 * @example
 * await installDispatcher('./extracted', 'aem-sdk-dispatcher-tools-', './output', './my-dispatcher-src');
 */
async function installDispatcher(
  extractedDir,
  prefix,
  outputDir = '.',
  src = '',
) {
  if (!extractedDir || typeof extractedDir !== 'string') {
    throw new Error('Extracted directory path must be a non-empty string');
  }
  if (!(await fs.pathExists(extractedDir))) {
    throw new Error(`Extracted directory does not exist: ${extractedDir}`);
  }
  if (!prefix || typeof prefix !== 'string') {
    throw new Error('Installer prefix must be a non-empty string');
  }
  const installer = glob.sync(`${prefix}*.sh`, { cwd: extractedDir })[0];
  if (!installer) {
    throw new Error(
      `Error: AEM Dispatcher installer script (${prefix}*.sh) not found in the extracted AEM SDK directory.`,
    );
  }
  const installerPath = path.join(extractedDir, installer);
  await fs.chmod(installerPath, 0o755);
  await new Promise((resolve, reject) => {
    const shellCmd = process.platform === 'win32' ? 'bash' : 'sh';
    const child = spawn(shellCmd, [installer], {
      cwd: extractedDir,
      stdio: 'inherit',
    });
    child.on('error', (err) => {
      reject(
        new Error(
          `Failed to start dispatcher installer: ${err.message}. ${process.platform === 'win32' ? 'Ensure bash is available (Git Bash or WSL).' : ''}`,
        ),
      );
    });
    child.on('close', (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`dispatcher installer exited with code ${code}`)),
    );
  });
  const dispatcherDir = glob.sync('dispatcher-sdk-*', {
    cwd: extractedDir,
    absolute: true,
  })[0];
  if (!dispatcherDir) {
    throw new Error(
      'Error: AEM Dispatcher configuration directory (dispatcher-sdk-*) not found.',
    );
  }
  const destDir = path.join(outputDir, 'dispatcher');
  await fs.ensureDir(path.dirname(destDir));
  await fs.move(dispatcherDir, destDir, { overwrite: true });
  if (src && typeof src === 'string' && (await fs.pathExists(src))) {
    await fs.copy(src, path.join(destDir, 'src'));
  }
}

module.exports = { installDispatcher };
