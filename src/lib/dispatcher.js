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
async function installDispatcher(extractedDir, prefix) {
  const installer = glob.sync(`${prefix}*.sh`, { cwd: extractedDir })[0];
  if (!installer) {
    throw new Error(
      `Error: AEM Dispatcher installer script (${prefix}*.sh) not found in the extracted AEM SDK directory.`,
    );
  }
  await fs.chmod(path.join(extractedDir, installer), 0o755);
  await new Promise((resolve, reject) => {
    const child = spawn(`./${installer}`, {
      cwd: extractedDir,
      stdio: 'inherit',
      shell: true,
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
  await fs.move(dispatcherDir, 'dispatcher', { overwrite: true });
}

module.exports = { installDispatcher };
