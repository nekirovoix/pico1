const DEFAULTS = Object.freeze({
  circuitpython_version: '10.3.0',
  source_board: 'raspberry_pi_pico',
  target_board: 'classroom_studio_pico',
  usb_manufacturer: 'Classroom Studio',
  usb_product: 'Classroom Studio',
  usb_vid: '0x239A',
  usb_pid: '0x80F4',
  serial_prefix: 'CLASSROOM-',
  drive_label: 'CLASSROOM',
  maintenance_pin: 'GP3',
  drive_mode: 'maintenance',
  language: 'en_US'
});

const form = document.querySelector('#configurator');
const preview = document.querySelector('#json-preview');
const status = document.querySelector('#form-status');
const actionIds = ['download', 'copy', 'edit-github'];
const editUrl = 'https://github.com/nekirovoix/pico1/edit/main/config/default.json';
const storageKey = 'pico1-live-config-v1';

function values() {
  return Object.fromEntries(Object.keys(DEFAULTS).map(key => {
    if (key === 'drive_mode') return [key, form.elements.drive_mode.value];
    return [key, form.elements[key].value.trim()];
  }));
}

function message(key, text) {
  const input = form.elements[key];
  const target = document.querySelector(`#${key}-error`);
  if (target) target.textContent = text || '';
  if (input && input.length && key === 'drive_mode') return;
  if (input) input.setAttribute('aria-invalid', text ? 'true' : 'false');
}

function validate(config) {
  const errors = {};
  if (!/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(config.circuitpython_version)) errors.circuitpython_version = 'نسخه باید مانند 10.3.0 باشد.';
  for (const key of ['source_board', 'target_board']) {
    if (!/^[a-z0-9][a-z0-9_]{1,63}$/.test(config[key])) errors[key] = 'فقط حروف کوچک انگلیسی، عدد و زیرخط مجاز است.';
  }
  if (config.source_board === config.target_board) errors.target_board = 'نام برد سفارشی باید با برد مبدأ متفاوت باشد.';
  for (const key of ['usb_manufacturer', 'usb_product']) {
    if (!/^[\x20-\x7e]{1,126}$/.test(config[key])) errors[key] = '۱ تا ۱۲۶ نویسه ASCII چاپ‌پذیر وارد کنید.';
  }
  if (!/^[\x20-\x7e]{1,24}$/.test(config.serial_prefix)) errors.serial_prefix = '۱ تا ۲۴ نویسه ASCII چاپ‌پذیر وارد کنید.';
  for (const key of ['usb_vid', 'usb_pid']) {
    if (!/^0x[0-9A-Fa-f]{4}$/.test(config[key])) errors[key] = 'قالب صحیح مانند 0x239A است.';
    else if (['0X0000', '0XFFFF'].includes(config[key].toUpperCase())) errors[key] = 'این مقدار رزرو شده است.';
  }
  if (!/^[A-Z0-9_-]{1,11}$/.test(config.drive_label)) errors.drive_label = 'حداکثر ۱۱ حرف بزرگ، عدد، _ یا - مجاز است.';
  if (!/^GP(?:[0-9]|1[0-9]|2[0-9])$/.test(config.maintenance_pin)) errors.maintenance_pin = 'پین باید بین GP0 و GP29 باشد.';
  else if (['GP23', 'GP24', 'GP25', 'GP29'].includes(config.maintenance_pin)) errors.maintenance_pin = 'این پین با عملکرد داخلی رایج Pico تداخل دارد.';
  if (!/^[a-z]{2}_[A-Z]{2}$/.test(config.language)) errors.language = 'قالب صحیح مانند en_US است.';
  Object.keys(DEFAULTS).forEach(key => message(key, errors[key]));
  return errors;
}

function canonical(config) {
  const normalized = {...config, usb_vid: config.usb_vid.replace(/^0x/i, '0x').toUpperCase().replace('0X', '0x'), usb_pid: config.usb_pid.replace(/^0x/i, '0x').toUpperCase().replace('0X', '0x')};
  return JSON.stringify(normalized, null, 2) + '\n';
}

function update() {
  const config = values();
  const errors = validate(config);
  const valid = Object.keys(errors).length === 0;
  preview.textContent = canonical(config);
  status.textContent = valid ? 'تنظیمات معتبر و آمادهٔ دریافت است.' : `${Object.keys(errors).length} خطا را پیش از دریافت اصلاح کنید.`;
  status.classList.toggle('invalid', !valid);
  actionIds.forEach(id => document.querySelector(`#${id}`).disabled = !valid);
  try { localStorage.setItem(storageKey, JSON.stringify(config)); } catch {}
  return valid;
}

function restore() {
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(storageKey)); } catch {}
  const config = saved && typeof saved === 'object' ? {...DEFAULTS, ...saved} : DEFAULTS;
  Object.entries(config).forEach(([key, value]) => {
    if (key === 'drive_mode') {
      const radio = form.querySelector(`input[name="drive_mode"][value="${CSS.escape(value)}"]`);
      if (radio) radio.checked = true;
    } else if (form.elements[key]) form.elements[key].value = value;
  });
  update();
}

async function copyJson() {
  await navigator.clipboard.writeText(canonical(values()));
  const button = document.querySelector('#copy');
  const original = button.textContent;
  button.textContent = 'کپی شد';
  setTimeout(() => { button.textContent = original; }, 1800);
}

form.addEventListener('input', update);
document.querySelector('#download').addEventListener('click', () => {
  if (!update()) return;
  const blob = new Blob([canonical(values())], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = 'config.json'; link.click();
  URL.revokeObjectURL(url);
});
document.querySelector('#copy').addEventListener('click', async () => {
  if (!update()) return;
  try { await copyJson(); } catch { status.textContent = 'مرورگر اجازهٔ کپی نداد؛ متن پیش‌نمایش را دستی کپی کنید.'; status.classList.add('invalid'); }
});
document.querySelector('#edit-github').addEventListener('click', async () => {
  if (!update()) return;
  const tab = window.open(editUrl, '_blank', 'noopener');
  try { await navigator.clipboard.writeText(canonical(values())); status.textContent = 'JSON کپی شد؛ در ویرایشگر GitHub جای‌گذاری و Commit کنید.'; }
  catch { status.textContent = 'ویرایشگر باز شد؛ JSON را از پیش‌نمایش دستی کپی کنید.'; }
  if (!tab) window.location.href = editUrl;
});
document.querySelector('#reset').addEventListener('click', () => {
  try { localStorage.removeItem(storageKey); } catch {}
  Object.entries(DEFAULTS).forEach(([key, value]) => {
    if (key === 'drive_mode') form.querySelector(`input[value="${value}"]`).checked = true;
    else form.elements[key].value = value;
  });
  update();
});

restore();
