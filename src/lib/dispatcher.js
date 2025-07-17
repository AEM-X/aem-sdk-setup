const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const { spawn } = require('child_process');

/**
 * Install dispatcher configuration using installer script from the extracted SDK.
 * @param {string} extractedDir extracted SDK directory
 * @param {string} prefix prefix for installer script name
 * @returns {Promise<void>}
 */
async function installDispatcher(
  extractedDir,
  prefix,
  outputDir = '.',
  src = '',
) {
  const installer = glob.sync(`${prefix}*.sh`, { cwd: extractedDir })[0];
  if (!installer) {
    throw new Error(
      `Error: AEM Dispatcher installer script (${prefix}*.sh) not found in the extracted AEM SDK directory.`,
    );
  }
  await fs.chmod(path.join(extractedDir, installer), 0o755);
  await new Promise((resolve, reject) => {
    const shellCmd = process.platform === 'win32' ? 'bash' : 'sh';
    const child = spawn(shellCmd, [installer], {
      cwd: extractedDir,
      stdio: 'ignore',
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
  await fs.move(dispatcherDir, destDir, { overwrite: true });
  if (src && (await fs.pathExists(src))) {
    await fs.copy(src, path.join(destDir, 'src'));
  }
}

module.exports = { installDispatcher };
