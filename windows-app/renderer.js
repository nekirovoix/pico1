const $ = selector => document.querySelector(selector);
const log = message => { $('#log').textContent += `[${new Date().toLocaleTimeString('fa-IR')}] ${message}\n`; };

for (const button of document.querySelectorAll('.nav')) {
  button.addEventListener('click', () => {
    document.querySelectorAll('.nav,.page').forEach(node => node.classList.remove('active'));
    button.classList.add('active');
    document.getElementById(button.dataset.page).classList.add('active');
  });
}

const fields = [
  ['circuitpython_version', 'نسخه CircuitPython'], ['source_board', 'برد مبدا'],
  ['target_board', 'برد مقصد'], ['usb_manufacturer', 'سازنده USB'],
  ['usb_product', 'نام محصول USB'], ['usb_vid', 'VID'], ['usb_pid', 'PID'],
  ['serial_prefix', 'پیشوند سریال'], ['drive_label', 'نام درایو'],
  ['maintenance_pin', 'پین تعمیر'], ['language', 'زبان']
];
let config = {};

function appendSelect(form, name, label, values, fallback) {
  const wrapper = document.createElement('label'); wrapper.textContent = label;
  const select = document.createElement('select'); select.name = name;
  for (const value of values) {
    const option = document.createElement('option'); option.value = value; option.textContent = value;
    option.selected = (config[name] || fallback) === value; select.appendChild(option);
  }
  config[name] = select.value;
  select.addEventListener('change', () => { config[name] = select.value; });
  wrapper.appendChild(select); form.appendChild(wrapper);
}

async function loadConfig() {
  config = await window.pico.config() || {};
  const form = $('#configForm'); form.textContent = '';
  for (const [key, label] of fields) {
    const wrapper = document.createElement('label'); wrapper.textContent = label;
    const input = document.createElement('input'); input.name = key; input.value = config[key] || ''; input.dir = 'ltr';
    input.addEventListener('input', () => { config[key] = input.value; });
    wrapper.appendChild(input); form.appendChild(wrapper);
  }
  appendSelect(form, 'drive_mode', 'حالت درایو', ['maintenance', 'always', 'hidden'], 'maintenance');
  appendSelect(form, 'runtime_profile', 'پروفایل اجرا', ['classroom_guard', 'standard'], 'standard');
}

async function scan() {
  const holder = $('#drives'); holder.textContent = '';
  try {
    const drives = await window.pico.scan();
    if (!drives.length) holder.textContent = 'درایو شناخته‌شده‌ای پیدا نشد.';
    for (const drive of drives) {
      const card = document.createElement('article');
      const title = document.createElement('strong'); title.textContent = `${drive.label} — ${drive.root}`; card.appendChild(title);
      const actions = document.createElement('div'); actions.className = 'toolbar';
      actions.appendChild(makeButton('بازکردن', async () => { await window.pico.open(drive.root); log(`${drive.root} باز شد.`); }));
      if (drive.label === 'RPI-RP2') actions.appendChild(makeButton('نصب UF2', async () => {
        if (!confirm('فریمور تأییدشده روی RPI-RP2 کپی شود؟')) return;
        const result = await window.pico.flash(drive.root); log(`UF2 کپی شد: ${result.destination} — ${result.sha256}`); setTimeout(scan, 2500);
      }, true));
      if (['CIRCUITPY', 'CLASSROOM'].includes(drive.label)) actions.appendChild(makeButton('نصب boot.py', async () => {
        const result = await window.pico.installBoot(drive.root); log(`boot.py نصب شد: ${result.destination}`);
      }));
      card.appendChild(actions); holder.appendChild(card);
    }
    log(`${drives.length} درایو شناخته‌شده پیدا شد.`);
  } catch (error) { log(`خطا: ${error.message}`); }
}

function makeButton(text, action, danger = false) {
  const button = document.createElement('button'); button.textContent = text;
  if (danger) button.className = 'danger';
  button.addEventListener('click', async () => { button.disabled = true; try { await action(); } catch (e) { log(`خطا: ${e.message}`); } finally { button.disabled = false; } });
  return button;
}

$('#scan').addEventListener('click', scan);
$('#verify').addEventListener('click', async () => { try { const r = await window.pico.verify(); log(`${r.file} معتبر است: ${r.sha256}`); } catch (e) { log(`خطا: ${e.message}`); } });
$('#actions').addEventListener('click', () => window.pico.openActions());
$('#downloadConfig').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(config, null, 2) + '\n'], { type: 'application/json' });
  const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'config.json'; a.click(); URL.revokeObjectURL(url);
});
loadConfig().then(scan).catch(error => log(`خطا: ${error.message}`));
