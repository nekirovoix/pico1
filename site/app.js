const DEFAULTS = Object.freeze({
  circuitpython_version: '10.3.0', source_board: 'raspberry_pi_pico', target_board: 'classroom_studio_pico',
  usb_manufacturer: 'Classroom Studio', usb_product: 'Classroom Studio', usb_vid: '0x238A', usb_pid: '0x80F5',
  serial_prefix: 'CLASSROOM-', drive_label: 'CLASSROOM', maintenance_pin: 'GP3', drive_mode: 'maintenance',
  runtime_profile: 'classroom_guard', language: 'en_US'
});
const form = document.querySelector('#configurator');
const preview = document.querySelector('#json-preview');
const status = document.querySelector('#form-status');
const actionIds = ['download', 'copy', 'edit-github'];
const editUrl = 'https://github.com/nekirovoix/pico1/edit/main/config/default.json';
const storageKey = 'pico1-live-config-v2';
const USB_IDENTITY_PROFILES = Object.freeze([
  {"manufacturer":"Cedar University Computer Lab","product":"Cedar Computer Lab Serial Console","serial_prefix":"CU-CL-001-"},
  {"manufacturer":"Cedar University Engineering Center","product":"Cedar Engineering Data Bridge","serial_prefix":"CU-EC-002-"},
  {"manufacturer":"Cedar University Science Faculty","product":"Cedar Science Control Port","serial_prefix":"CU-SF-003-"},
  {"manufacturer":"Cedar University Robotics Club","product":"Cedar Robotics Sensor Gateway","serial_prefix":"CU-RC-004-"},
  {"manufacturer":"Cedar University Digital Library","product":"Cedar Digital Lib Project Adapter","serial_prefix":"CU-DL-005-"},
  {"manufacturer":"Cedar University Research Office","product":"Cedar Research Device Link","serial_prefix":"CU-RO-006-"},
  {"manufacturer":"Cedar University Classroom Network","product":"Cedar Classroom Academic Terminal","serial_prefix":"CU-CN-007-"},
  {"manufacturer":"Cedar University Electronics Lab","product":"Cedar Electronics Lab Debug Port","serial_prefix":"CU-EL-008-"},
  {"manufacturer":"Cedar University Student Workshop","product":"Cedar Student Service Console","serial_prefix":"CU-SW-009-"},
  {"manufacturer":"Cedar University Learning Center","product":"Cedar Learning USB Interface","serial_prefix":"CU-LC-010-"},
  {"manufacturer":"Maple Academy Computer Lab","product":"Maple Computer Lab Data Bridge","serial_prefix":"MA-CL-011-"},
  {"manufacturer":"Maple Academy Engineering Center","product":"Maple Engineering Control Port","serial_prefix":"MA-EC-012-"},
  {"manufacturer":"Maple Academy Science Faculty","product":"Maple Science Sensor Gateway","serial_prefix":"MA-SF-013-"},
  {"manufacturer":"Maple Academy Robotics Club","product":"Maple Robotics Project Adapter","serial_prefix":"MA-RC-014-"},
  {"manufacturer":"Maple Academy Digital Library","product":"Maple Digital Lib Device Link","serial_prefix":"MA-DL-015-"},
  {"manufacturer":"Maple Academy Research Office","product":"Maple Research Academic Terminal","serial_prefix":"MA-RO-016-"},
  {"manufacturer":"Maple Academy Classroom Network","product":"Maple Classroom Debug Port","serial_prefix":"MA-CN-017-"},
  {"manufacturer":"Maple Academy Electronics Lab","product":"Maple Electronics Lab Service Console","serial_prefix":"MA-EL-018-"},
  {"manufacturer":"Maple Academy Student Workshop","product":"Maple Student USB Interface","serial_prefix":"MA-SW-019-"},
  {"manufacturer":"Maple Academy Learning Center","product":"Maple Learning Serial Console","serial_prefix":"MA-LC-020-"},
  {"manufacturer":"Horizon College Computer Lab","product":"Horizon Computer Lab Control Port","serial_prefix":"HC-CL-021-"},
  {"manufacturer":"Horizon College Engineering Center","product":"Horizon Engineering Sensor Gateway","serial_prefix":"HC-EC-022-"},
  {"manufacturer":"Horizon College Science Faculty","product":"Horizon Science Project Adapter","serial_prefix":"HC-SF-023-"},
  {"manufacturer":"Horizon College Robotics Club","product":"Horizon Robotics Device Link","serial_prefix":"HC-RC-024-"},
  {"manufacturer":"Horizon College Digital Library","product":"Horizon Digital Lib Academic Terminal","serial_prefix":"HC-DL-025-"},
  {"manufacturer":"Horizon College Research Office","product":"Horizon Research Debug Port","serial_prefix":"HC-RO-026-"},
  {"manufacturer":"Horizon College Classroom Network","product":"Horizon Classroom Service Console","serial_prefix":"HC-CN-027-"},
  {"manufacturer":"Horizon College Electronics Lab","product":"Horizon Electronics Lab USB Interface","serial_prefix":"HC-EL-028-"},
  {"manufacturer":"Horizon College Student Workshop","product":"Horizon Student Serial Console","serial_prefix":"HC-SW-029-"},
  {"manufacturer":"Horizon College Learning Center","product":"Horizon Learning Data Bridge","serial_prefix":"HC-LC-030-"},
  {"manufacturer":"Pioneer School Computer Lab","product":"Pioneer Computer Lab Sensor Gateway","serial_prefix":"PS-CL-031-"},
  {"manufacturer":"Pioneer School Engineering Center","product":"Pioneer Engineering Project Adapter","serial_prefix":"PS-EC-032-"},
  {"manufacturer":"Pioneer School Science Faculty","product":"Pioneer Science Device Link","serial_prefix":"PS-SF-033-"},
  {"manufacturer":"Pioneer School Robotics Club","product":"Pioneer Robotics Academic Terminal","serial_prefix":"PS-RC-034-"},
  {"manufacturer":"Pioneer School Digital Library","product":"Pioneer Digital Lib Debug Port","serial_prefix":"PS-DL-035-"},
  {"manufacturer":"Pioneer School Research Office","product":"Pioneer Research Service Console","serial_prefix":"PS-RO-036-"},
  {"manufacturer":"Pioneer School Classroom Network","product":"Pioneer Classroom USB Interface","serial_prefix":"PS-CN-037-"},
  {"manufacturer":"Pioneer School Electronics Lab","product":"Pioneer Electronics Lab Serial Console","serial_prefix":"PS-EL-038-"},
  {"manufacturer":"Pioneer School Student Workshop","product":"Pioneer Student Data Bridge","serial_prefix":"PS-SW-039-"},
  {"manufacturer":"Pioneer School Learning Center","product":"Pioneer Learning Control Port","serial_prefix":"PS-LC-040-"},
  {"manufacturer":"Riverside Campus Computer Lab","product":"Riverside Computer Lab Project Adapter","serial_prefix":"RC-CL-041-"},
  {"manufacturer":"Riverside Campus Engineering Center","product":"Riverside Engineering Device Link","serial_prefix":"RC-EC-042-"},
  {"manufacturer":"Riverside Campus Science Faculty","product":"Riverside Science Academic Terminal","serial_prefix":"RC-SF-043-"},
  {"manufacturer":"Riverside Campus Robotics Club","product":"Riverside Robotics Debug Port","serial_prefix":"RC-RC-044-"},
  {"manufacturer":"Riverside Campus Digital Library","product":"Riverside Digital Lib Service Console","serial_prefix":"RC-DL-045-"},
  {"manufacturer":"Riverside Campus Research Office","product":"Riverside Research USB Interface","serial_prefix":"RC-RO-046-"},
  {"manufacturer":"Riverside Campus Classroom Network","product":"Riverside Classroom Serial Console","serial_prefix":"RC-CN-047-"},
  {"manufacturer":"Riverside Campus Electronics Lab","product":"Riverside Electronics Lab Data Bridge","serial_prefix":"RC-EL-048-"},
  {"manufacturer":"Riverside Campus Student Workshop","product":"Riverside Student Control Port","serial_prefix":"RC-SW-049-"},
  {"manufacturer":"Riverside Campus Learning Center","product":"Riverside Learning Sensor Gateway","serial_prefix":"RC-LC-050-"},
  {"manufacturer":"Summit Institute Computer Lab","product":"Summit Computer Lab Device Link","serial_prefix":"SI-CL-051-"},
  {"manufacturer":"Summit Institute Engineering Center","product":"Summit Engineering Academic Terminal","serial_prefix":"SI-EC-052-"},
  {"manufacturer":"Summit Institute Science Faculty","product":"Summit Science Debug Port","serial_prefix":"SI-SF-053-"},
  {"manufacturer":"Summit Institute Robotics Club","product":"Summit Robotics Service Console","serial_prefix":"SI-RC-054-"},
  {"manufacturer":"Summit Institute Digital Library","product":"Summit Digital Lib USB Interface","serial_prefix":"SI-DL-055-"},
  {"manufacturer":"Summit Institute Research Office","product":"Summit Research Serial Console","serial_prefix":"SI-RO-056-"},
  {"manufacturer":"Summit Institute Classroom Network","product":"Summit Classroom Data Bridge","serial_prefix":"SI-CN-057-"},
  {"manufacturer":"Summit Institute Electronics Lab","product":"Summit Electronics Lab Control Port","serial_prefix":"SI-EL-058-"},
  {"manufacturer":"Summit Institute Student Workshop","product":"Summit Student Sensor Gateway","serial_prefix":"SI-SW-059-"},
  {"manufacturer":"Summit Institute Learning Center","product":"Summit Learning Project Adapter","serial_prefix":"SI-LC-060-"},
  {"manufacturer":"Greenfield University Computer Lab","product":"Greenfield Computer Lab Academic Terminal","serial_prefix":"GU-CL-061-"},
  {"manufacturer":"Greenfield University Engineering Center","product":"Greenfield Engineering Debug Port","serial_prefix":"GU-EC-062-"},
  {"manufacturer":"Greenfield University Science Faculty","product":"Greenfield Science Service Console","serial_prefix":"GU-SF-063-"},
  {"manufacturer":"Greenfield University Robotics Club","product":"Greenfield Robotics USB Interface","serial_prefix":"GU-RC-064-"},
  {"manufacturer":"Greenfield University Digital Library","product":"Greenfield Digital Lib Serial Console","serial_prefix":"GU-DL-065-"},
  {"manufacturer":"Greenfield University Research Office","product":"Greenfield Research Data Bridge","serial_prefix":"GU-RO-066-"},
  {"manufacturer":"Greenfield University Classroom Network","product":"Greenfield Classroom Control Port","serial_prefix":"GU-CN-067-"},
  {"manufacturer":"Greenfield University Electronics Lab","product":"Greenfield Electronics Lab Sensor Gateway","serial_prefix":"GU-EL-068-"},
  {"manufacturer":"Greenfield University Student Workshop","product":"Greenfield Student Project Adapter","serial_prefix":"GU-SW-069-"},
  {"manufacturer":"Greenfield University Learning Center","product":"Greenfield Learning Device Link","serial_prefix":"GU-LC-070-"},
  {"manufacturer":"Nova Academy Computer Lab","product":"Nova Computer Lab Debug Port","serial_prefix":"NA-CL-071-"},
  {"manufacturer":"Nova Academy Engineering Center","product":"Nova Engineering Service Console","serial_prefix":"NA-EC-072-"},
  {"manufacturer":"Nova Academy Science Faculty","product":"Nova Science USB Interface","serial_prefix":"NA-SF-073-"},
  {"manufacturer":"Nova Academy Robotics Club","product":"Nova Robotics Serial Console","serial_prefix":"NA-RC-074-"},
  {"manufacturer":"Nova Academy Digital Library","product":"Nova Digital Lib Data Bridge","serial_prefix":"NA-DL-075-"},
  {"manufacturer":"Nova Academy Research Office","product":"Nova Research Control Port","serial_prefix":"NA-RO-076-"},
  {"manufacturer":"Nova Academy Classroom Network","product":"Nova Classroom Sensor Gateway","serial_prefix":"NA-CN-077-"},
  {"manufacturer":"Nova Academy Electronics Lab","product":"Nova Electronics Lab Project Adapter","serial_prefix":"NA-EL-078-"},
  {"manufacturer":"Nova Academy Student Workshop","product":"Nova Student Device Link","serial_prefix":"NA-SW-079-"},
  {"manufacturer":"Nova Academy Learning Center","product":"Nova Learning Academic Terminal","serial_prefix":"NA-LC-080-"},
  {"manufacturer":"Central Polytechnic Computer Lab","product":"Central Computer Lab Service Console","serial_prefix":"CP-CL-081-"},
  {"manufacturer":"Central Polytechnic Engineering Center","product":"Central Engineering USB Interface","serial_prefix":"CP-EC-082-"},
  {"manufacturer":"Central Polytechnic Science Faculty","product":"Central Science Serial Console","serial_prefix":"CP-SF-083-"},
  {"manufacturer":"Central Polytechnic Robotics Club","product":"Central Robotics Data Bridge","serial_prefix":"CP-RC-084-"},
  {"manufacturer":"Central Polytechnic Digital Library","product":"Central Digital Lib Control Port","serial_prefix":"CP-DL-085-"},
  {"manufacturer":"Central Polytechnic Research Office","product":"Central Research Sensor Gateway","serial_prefix":"CP-RO-086-"},
  {"manufacturer":"Central Polytechnic Classroom Network","product":"Central Classroom Project Adapter","serial_prefix":"CP-CN-087-"},
  {"manufacturer":"Central Polytechnic Electronics Lab","product":"Central Electronics Lab Device Link","serial_prefix":"CP-EL-088-"},
  {"manufacturer":"Central Polytechnic Student Workshop","product":"Central Student Academic Terminal","serial_prefix":"CP-SW-089-"},
  {"manufacturer":"Central Polytechnic Learning Center","product":"Central Learning Debug Port","serial_prefix":"CP-LC-090-"},
  {"manufacturer":"Bright Future School Computer Lab","product":"Bright Computer Lab USB Interface","serial_prefix":"BF-CL-091-"},
  {"manufacturer":"Bright Future School Engineering Center","product":"Bright Engineering Serial Console","serial_prefix":"BF-EC-092-"},
  {"manufacturer":"Bright Future School Science Faculty","product":"Bright Science Data Bridge","serial_prefix":"BF-SF-093-"},
  {"manufacturer":"Bright Future School Robotics Club","product":"Bright Robotics Control Port","serial_prefix":"BF-RC-094-"},
  {"manufacturer":"Bright Future School Digital Library","product":"Bright Digital Lib Sensor Gateway","serial_prefix":"BF-DL-095-"},
  {"manufacturer":"Bright Future School Research Office","product":"Bright Research Project Adapter","serial_prefix":"BF-RO-096-"},
  {"manufacturer":"Bright Future School Classroom Network","product":"Bright Classroom Device Link","serial_prefix":"BF-CN-097-"},
  {"manufacturer":"Bright Future School Electronics Lab","product":"Bright Electronics Lab Academic Terminal","serial_prefix":"BF-EL-098-"},
  {"manufacturer":"Bright Future School Student Workshop","product":"Bright Student Debug Port","serial_prefix":"BF-SW-099-"},
  {"manufacturer":"Bright Future School Learning Center","product":"Bright Learning Service Console","serial_prefix":"BF-LC-100-"},
].map(Object.freeze));
let lastProfileIndex = -1;

function randomProfileIndex() {
  const sample = new Uint32Array(1);
  crypto.getRandomValues(sample);
  return sample[0] % USB_IDENTITY_PROFILES.length;
}

function randomIdentityProfile() {
  let index;
  do index = randomProfileIndex(); while (index === lastProfileIndex && USB_IDENTITY_PROFILES.length > 1);
  lastProfileIndex = index;
  return USB_IDENTITY_PROFILES[index];
}

function randomUsbId() {
  const sample = new Uint16Array(1);
  crypto.getRandomValues(sample);
  const value = 0x1000 + (sample[0] % 0xEFFF);
  return `0x${value.toString(16).toUpperCase().padStart(4, '0')}`;
}

function values() { return Object.fromEntries(Object.keys(DEFAULTS).map(key => [key, key === 'drive_mode' ? form.elements.drive_mode.value : form.elements[key].value.trim()])); }
function message(key, text) {
  const input = form.elements[key]; const target = document.querySelector(`#${key}-error`);
  if (target) target.textContent = text || '';
  if (input && input.length && key === 'drive_mode') return;
  if (input) input.setAttribute('aria-invalid', text ? 'true' : 'false');
}
function validate(config) {
  const errors = {};
  if (!/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(config.circuitpython_version)) errors.circuitpython_version = 'نسخه باید مانند 10.3.0 باشد.';
  for (const key of ['source_board','target_board']) if (!/^[a-z0-9][a-z0-9_]{1,63}$/.test(config[key])) errors[key] = 'فقط حروف کوچک انگلیسی، عدد و زیرخط مجاز است.';
  if (config.source_board === config.target_board) errors.target_board = 'نام برد سفارشی باید متفاوت باشد.';
  for (const key of ['usb_manufacturer','usb_product']) if (!/^[\x20-\x7e]{1,126}$/.test(config[key])) errors[key] = '۱ تا ۱۲۶ نویسه ASCII چاپ‌پذیر وارد کنید.';
  if (!/^[\x20-\x7e]{1,24}$/.test(config.serial_prefix)) errors.serial_prefix = '۱ تا ۲۴ نویسه ASCII چاپ‌پذیر وارد کنید.';
  for (const key of ['usb_vid','usb_pid']) {
    if (!/^0x[0-9A-Fa-f]{4}$/.test(config[key])) errors[key] = 'قالب صحیح مانند 0x238A است.';
    else if (['0X0000','0XFFFF'].includes(config[key].toUpperCase())) errors[key] = 'این مقدار رزرو شده است.';
  }
  if (!/^[A-Z0-9_-]{1,11}$/.test(config.drive_label)) errors.drive_label = 'حداکثر ۱۱ حرف بزرگ، عدد، _ یا - مجاز است.';
  if (!/^GP(?:[0-9]|1[0-9]|2[0-9])$/.test(config.maintenance_pin)) errors.maintenance_pin = 'پین باید بین GP0 و GP29 باشد.';
  else if (['GP23','GP24','GP25','GP29'].includes(config.maintenance_pin)) errors.maintenance_pin = 'این پین با عملکرد داخلی رایج Pico تداخل دارد.';
  if (!['standard','classroom_guard'].includes(config.runtime_profile)) errors.runtime_profile = 'پروفایل اجرا معتبر نیست.';
  if (config.runtime_profile === 'classroom_guard' && config.drive_mode === 'always') errors.drive_mode = 'Guard نمی‌تواند هم‌زمان درایو میزبان و فایل‌سیستم runtime را قابل‌نوشتن نگه دارد.';
  if (!/^[a-z]{2}_[A-Z]{2}$/.test(config.language)) errors.language = 'قالب صحیح مانند en_US است.';
  Object.keys(DEFAULTS).forEach(key => message(key, errors[key])); return errors;
}
function canonical(config) {
  const hex = value => value.replace(/^0x/i,'0x').toUpperCase().replace('0X','0x');
  return JSON.stringify({...config, usb_vid:hex(config.usb_vid), usb_pid:hex(config.usb_pid)}, null, 2) + '\n';
}
function update() {
  const config=values(), errors=validate(config), valid=Object.keys(errors).length===0;
  preview.textContent=canonical(config); status.textContent=valid?'تنظیمات معتبر و آمادهٔ دریافت است.':`${Object.keys(errors).length} خطا را پیش از دریافت اصلاح کنید.`;
  status.classList.toggle('invalid',!valid); actionIds.forEach(id=>document.querySelector(`#${id}`).disabled=!valid);
  try{localStorage.setItem(storageKey,JSON.stringify(config));}catch{} return valid;
}
function restore() {
  let saved=null; try{saved=JSON.parse(localStorage.getItem(storageKey));}catch{}
  const config=saved&&typeof saved==='object'?{...DEFAULTS,...saved}:DEFAULTS;
  Object.entries(config).forEach(([key,value])=>{if(key==='drive_mode'){const radio=form.querySelector(`input[name="drive_mode"][value="${CSS.escape(value)}"]`);if(radio)radio.checked=true;}else if(form.elements[key])form.elements[key].value=value;}); update();
}
async function copyJson(){await navigator.clipboard.writeText(canonical(values()));const button=document.querySelector('#copy'),original=button.textContent;button.textContent='کپی شد';setTimeout(()=>{button.textContent=original;},1800);}
form.addEventListener('input',update);
document.querySelector('#download').addEventListener('click',()=>{if(!update())return;const blob=new Blob([canonical(values())],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='config.json';link.click();URL.revokeObjectURL(url);});
document.querySelector('#copy').addEventListener('click',async()=>{if(!update())return;try{await copyJson();}catch{status.textContent='مرورگر اجازهٔ کپی نداد؛ متن پیش‌نمایش را دستی کپی کنید.';status.classList.add('invalid');}});
document.querySelector('#generate-test-usb-id').addEventListener('click',()=>{
  const profile = randomIdentityProfile();
  form.elements.usb_manufacturer.value = profile.manufacturer;
  form.elements.usb_product.value = profile.product;
  form.elements.serial_prefix.value = profile.serial_prefix;
  form.elements.usb_vid.value = randomUsbId();
  form.elements.usb_pid.value = randomUsbId();
  document.querySelector('#usb-id-status').textContent = `پروفایل آموزشی ${profile.manufacturer} با شناسهٔ ${form.elements.usb_vid.value}:${form.elements.usb_pid.value} تولید شد؛ فقط برای تست خصوصی استفاده کنید.`;
  update();
});
document.querySelector('#edit-github').addEventListener('click',async()=>{if(!update())return;const tab=window.open(editUrl,'_blank');if(tab)tab.opener=null;try{await navigator.clipboard.writeText(canonical(values()));status.textContent='JSON کپی شد؛ در ویرایشگر GitHub جای‌گذاری و Commit کنید.';}catch{status.textContent='ویرایشگر باز شد؛ JSON را دستی کپی کنید.';}if(!tab)window.location.href=editUrl;});
document.querySelector('#reset').addEventListener('click',()=>{try{localStorage.removeItem(storageKey);}catch{}Object.entries(DEFAULTS).forEach(([key,value])=>{if(key==='drive_mode')form.querySelector(`input[value="${value}"]`).checked=true;else form.elements[key].value=value;});update();});
restore();
