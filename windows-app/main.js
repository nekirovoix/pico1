const { app, BrowserWindow, ipcMain, shell } = require('electron');
const { execFile } = require('node:child_process');
const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');

const DIST = path.join(__dirname, 'generator', 'dist');
const DEFAULT_LABELS = new Set(['RPI-RP2', 'CIRCUITPY', 'CLASSROOM']);

function createWindow() {
  const win = new BrowserWindow({
    width: 1060,
    height: 760,
    minWidth: 860,
    minHeight: 620,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  win.removeMenu();
  win.loadFile('index.html');
}

async function readConfig() {
  try {
    return JSON.parse(await fs.readFile(path.join(DIST, 'build-config.json'), 'utf8'));
  } catch {
    return null;
  }
}

function powershell(script) {
  return new Promise((resolve, reject) => {
    execFile('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script],
      { windowsHide: true, timeout: 15000, maxBuffer: 1024 * 1024 },
      (error, stdout, stderr) => error ? reject(new Error(stderr.trim() || error.message)) : resolve(stdout.trim()));
  });
}

async function scanDrives() {
  if (process.platform !== 'win32') return [];
  const output = await powershell("Get-CimInstance Win32_LogicalDisk | Where-Object {$_.DriveType -eq 2 -or $_.VolumeName -in @('RPI-RP2','CIRCUITPY','CLASSROOM')} | Select-Object DeviceID,VolumeName,DriveType | ConvertTo-Json -Compress");
  if (!output) return [];
  const parsed = JSON.parse(output);
  const list = Array.isArray(parsed) ? parsed : [parsed];
  const config = await readConfig();
  const labels = new Set(DEFAULT_LABELS);
  if (config?.drive_label) labels.add(config.drive_label);
  return list.map(d => ({ root: `${d.DeviceID}\\`, label: d.VolumeName || '', recognized: labels.has(d.VolumeName || '') }))
    .filter(d => d.recognized);
}

async function sha256(file) {
  const data = await fs.readFile(file);
  return crypto.createHash('sha256').update(data).digest('hex');
}

async function findUf2() {
  const names = (await fs.readdir(DIST)).filter(name => name.toLowerCase().endsWith('.uf2'));
  if (names.length !== 1) throw new Error(`Expected exactly one UF2 artifact; found ${names.length}.`);
  return path.join(DIST, names[0]);
}

async function verifyUf2(file) {
  const sums = await fs.readFile(path.join(DIST, 'SHA256SUMS.txt'), 'utf8');
  const expectedLine = sums.split(/\r?\n/).find(line => line.trim().endsWith(path.basename(file)));
  if (!expectedLine) throw new Error('UF2 is missing from SHA256SUMS.txt.');
  const expected = expectedLine.trim().split(/\s+/)[0].toLowerCase();
  const actual = await sha256(file);
  if (actual !== expected) throw new Error(`UF2 SHA256 mismatch. Expected ${expected}, got ${actual}.`);
  return actual;
}

async function requireDrive(root, requiredLabel) {
  const drives = await scanDrives();
  const drive = drives.find(d => d.root.toUpperCase() === String(root).toUpperCase());
  if (!drive) throw new Error('The selected drive is no longer present or is not recognized.');
  if (requiredLabel && drive.label !== requiredLabel) throw new Error(`This operation requires the exact ${requiredLabel} drive.`);
  return drive;
}

ipcMain.handle('firmware:config', readConfig);
ipcMain.handle('drives:scan', scanDrives);
ipcMain.handle('firmware:verify', async () => {
  const file = await findUf2();
  return { file: path.basename(file), sha256: await verifyUf2(file) };
});
ipcMain.handle('pico:installBoot', async (_event, root) => {
  const drive = await requireDrive(root);
  if (!['CIRCUITPY', 'CLASSROOM'].includes(drive.label)) throw new Error('boot.py can only be installed on CIRCUITPY or CLASSROOM.');
  const source = path.join(DIST, 'boot.py');
  const destination = path.join(drive.root, 'boot.py');
  const backup = path.join(drive.root, 'boot.py.before-classroom');
  try { await fs.access(backup); }
  catch {
    try { await fs.copyFile(destination, backup); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  await fs.copyFile(source, destination);
  return { destination, backup };
});
ipcMain.handle('pico:flash', async (_event, root) => {
  await requireDrive(root, 'RPI-RP2');
  const source = await findUf2();
  const digest = await verifyUf2(source);
  const destination = path.join(root, path.basename(source));
  await fs.copyFile(source, destination);
  return { destination, sha256: digest };
});
ipcMain.handle('pico:open', async (_event, root) => {
  await requireDrive(root);
  const result = await shell.openPath(root);
  if (result) throw new Error(result);
  return true;
});
ipcMain.handle('links:actions', () => shell.openExternal('https://github.com/nekirovoix/pico1/actions'));

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
