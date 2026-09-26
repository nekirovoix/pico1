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
  {"manufacturer":"Cedar Uni Computer Lab","product":"CU Serial Console 001","serial_prefix":"CUCL001-","source_board":"raspberry_pi_pico","target_board":"edu_cu_cl_001_pico"},
  {"manufacturer":"Cedar Uni Engineering","product":"CU Data Bridge 002","serial_prefix":"CUEN002-","source_board":"raspberry_pi_pico","target_board":"edu_cu_en_002_pico"},
  {"manufacturer":"Cedar Uni Science","product":"CU Control Port 003","serial_prefix":"CUSC003-","source_board":"raspberry_pi_pico","target_board":"edu_cu_sc_003_pico"},
  {"manufacturer":"Cedar Uni Robotics","product":"CU Sensor Hub 004","serial_prefix":"CURB004-","source_board":"raspberry_pi_pico","target_board":"edu_cu_rb_004_pico"},
  {"manufacturer":"Cedar Uni Library","product":"CU Project Adapter 005","serial_prefix":"CULB005-","source_board":"raspberry_pi_pico","target_board":"edu_cu_lb_005_pico"},
  {"manufacturer":"Cedar Uni Research","product":"CU Device Link 006","serial_prefix":"CURS006-","source_board":"raspberry_pi_pico","target_board":"edu_cu_rs_006_pico"},
  {"manufacturer":"Cedar Uni Classroom","product":"CU USB Terminal 007","serial_prefix":"CUCR007-","source_board":"raspberry_pi_pico","target_board":"edu_cu_cr_007_pico"},
  {"manufacturer":"Cedar Uni Electronics","product":"CU Debug Port 008","serial_prefix":"CUEL008-","source_board":"raspberry_pi_pico","target_board":"edu_cu_el_008_pico"},
  {"manufacturer":"Cedar Uni Student Lab","product":"CU Service Port 009","serial_prefix":"CUSL009-","source_board":"raspberry_pi_pico","target_board":"edu_cu_sl_009_pico"},
  {"manufacturer":"Cedar Uni Learning","product":"CU USB Interface 010","serial_prefix":"CULR010-","source_board":"raspberry_pi_pico","target_board":"edu_cu_lr_010_pico"},
  {"manufacturer":"Maple School Computer Lab","product":"MA Data Bridge 011","serial_prefix":"MACL011-","source_board":"raspberry_pi_pico","target_board":"edu_ma_cl_011_pico"},
  {"manufacturer":"Maple School Engineering","product":"MA Control Port 012","serial_prefix":"MAEN012-","source_board":"raspberry_pi_pico","target_board":"edu_ma_en_012_pico"},
  {"manufacturer":"Maple School Science","product":"MA Sensor Hub 013","serial_prefix":"MASC013-","source_board":"raspberry_pi_pico","target_board":"edu_ma_sc_013_pico"},
  {"manufacturer":"Maple School Robotics","product":"MA Project Adapter 014","serial_prefix":"MARB014-","source_board":"raspberry_pi_pico","target_board":"edu_ma_rb_014_pico"},
  {"manufacturer":"Maple School Library","product":"MA Device Link 015","serial_prefix":"MALB015-","source_board":"raspberry_pi_pico","target_board":"edu_ma_lb_015_pico"},
  {"manufacturer":"Maple School Research","product":"MA USB Terminal 016","serial_prefix":"MARS016-","source_board":"raspberry_pi_pico","target_board":"edu_ma_rs_016_pico"},
  {"manufacturer":"Maple School Classroom","product":"MA Debug Port 017","serial_prefix":"MACR017-","source_board":"raspberry_pi_pico","target_board":"edu_ma_cr_017_pico"},
  {"manufacturer":"Maple School Electronics","product":"MA Service Port 018","serial_prefix":"MAEL018-","source_board":"raspberry_pi_pico","target_board":"edu_ma_el_018_pico"},
  {"manufacturer":"Maple School Student Lab","product":"MA USB Interface 019","serial_prefix":"MASL019-","source_board":"raspberry_pi_pico","target_board":"edu_ma_sl_019_pico"},
  {"manufacturer":"Maple School Learning","product":"MA Serial Console 020","serial_prefix":"MALR020-","source_board":"raspberry_pi_pico","target_board":"edu_ma_lr_020_pico"},
  {"manufacturer":"Horizon College Computer Lab","product":"HC Control Port 021","serial_prefix":"HCCL021-","source_board":"raspberry_pi_pico","target_board":"edu_hc_cl_021_pico"},
  {"manufacturer":"Horizon College Engineering","product":"HC Sensor Hub 022","serial_prefix":"HCEN022-","source_board":"raspberry_pi_pico","target_board":"edu_hc_en_022_pico"},
  {"manufacturer":"Horizon College Science","product":"HC Project Adapter 023","serial_prefix":"HCSC023-","source_board":"raspberry_pi_pico","target_board":"edu_hc_sc_023_pico"},
  {"manufacturer":"Horizon College Robotics","product":"HC Device Link 024","serial_prefix":"HCRB024-","source_board":"raspberry_pi_pico","target_board":"edu_hc_rb_024_pico"},
  {"manufacturer":"Horizon College Library","product":"HC USB Terminal 025","serial_prefix":"HCLB025-","source_board":"raspberry_pi_pico","target_board":"edu_hc_lb_025_pico"},
  {"manufacturer":"Horizon College Research","product":"HC Debug Port 026","serial_prefix":"HCRS026-","source_board":"raspberry_pi_pico","target_board":"edu_hc_rs_026_pico"},
  {"manufacturer":"Horizon College Classroom","product":"HC Service Port 027","serial_prefix":"HCCR027-","source_board":"raspberry_pi_pico","target_board":"edu_hc_cr_027_pico"},
  {"manufacturer":"Horizon College Electronics","product":"HC USB Interface 028","serial_prefix":"HCEL028-","source_board":"raspberry_pi_pico","target_board":"edu_hc_el_028_pico"},
  {"manufacturer":"Horizon College Student Lab","product":"HC Serial Console 029","serial_prefix":"HCSL029-","source_board":"raspberry_pi_pico","target_board":"edu_hc_sl_029_pico"},
  {"manufacturer":"Horizon College Learning","product":"HC Data Bridge 030","serial_prefix":"HCLR030-","source_board":"raspberry_pi_pico","target_board":"edu_hc_lr_030_pico"},
  {"manufacturer":"Pioneer Academy Computer Lab","product":"PS Sensor Hub 031","serial_prefix":"PSCL031-","source_board":"raspberry_pi_pico","target_board":"edu_ps_cl_031_pico"},
  {"manufacturer":"Pioneer Academy Engineering","product":"PS Project Adapter 032","serial_prefix":"PSEN032-","source_board":"raspberry_pi_pico","target_board":"edu_ps_en_032_pico"},
  {"manufacturer":"Pioneer Academy Science","product":"PS Device Link 033","serial_prefix":"PSSC033-","source_board":"raspberry_pi_pico","target_board":"edu_ps_sc_033_pico"},
  {"manufacturer":"Pioneer Academy Robotics","product":"PS USB Terminal 034","serial_prefix":"PSRB034-","source_board":"raspberry_pi_pico","target_board":"edu_ps_rb_034_pico"},
  {"manufacturer":"Pioneer Academy Library","product":"PS Debug Port 035","serial_prefix":"PSLB035-","source_board":"raspberry_pi_pico","target_board":"edu_ps_lb_035_pico"},
  {"manufacturer":"Pioneer Academy Research","product":"PS Service Port 036","serial_prefix":"PSRS036-","source_board":"raspberry_pi_pico","target_board":"edu_ps_rs_036_pico"},
  {"manufacturer":"Pioneer Academy Classroom","product":"PS USB Interface 037","serial_prefix":"PSCR037-","source_board":"raspberry_pi_pico","target_board":"edu_ps_cr_037_pico"},
  {"manufacturer":"Pioneer Academy Electronics","product":"PS Serial Console 038","serial_prefix":"PSEL038-","source_board":"raspberry_pi_pico","target_board":"edu_ps_el_038_pico"},
  {"manufacturer":"Pioneer Academy Student Lab","product":"PS Data Bridge 039","serial_prefix":"PSSL039-","source_board":"raspberry_pi_pico","target_board":"edu_ps_sl_039_pico"},
  {"manufacturer":"Pioneer Academy Learning","product":"PS Control Port 040","serial_prefix":"PSLR040-","source_board":"raspberry_pi_pico","target_board":"edu_ps_lr_040_pico"},
  {"manufacturer":"Riverside Uni Computer Lab","product":"RU Project Adapter 041","serial_prefix":"RUCL041-","source_board":"raspberry_pi_pico","target_board":"edu_ru_cl_041_pico"},
  {"manufacturer":"Riverside Uni Engineering","product":"RU Device Link 042","serial_prefix":"RUEN042-","source_board":"raspberry_pi_pico","target_board":"edu_ru_en_042_pico"},
  {"manufacturer":"Riverside Uni Science","product":"RU USB Terminal 043","serial_prefix":"RUSC043-","source_board":"raspberry_pi_pico","target_board":"edu_ru_sc_043_pico"},
  {"manufacturer":"Riverside Uni Robotics","product":"RU Debug Port 044","serial_prefix":"RURB044-","source_board":"raspberry_pi_pico","target_board":"edu_ru_rb_044_pico"},
  {"manufacturer":"Riverside Uni Library","product":"RU Service Port 045","serial_prefix":"RULB045-","source_board":"raspberry_pi_pico","target_board":"edu_ru_lb_045_pico"},
  {"manufacturer":"Riverside Uni Research","product":"RU USB Interface 046","serial_prefix":"RURS046-","source_board":"raspberry_pi_pico","target_board":"edu_ru_rs_046_pico"},
  {"manufacturer":"Riverside Uni Classroom","product":"RU Serial Console 047","serial_prefix":"RUCR047-","source_board":"raspberry_pi_pico","target_board":"edu_ru_cr_047_pico"},
  {"manufacturer":"Riverside Uni Electronics","product":"RU Data Bridge 048","serial_prefix":"RUEL048-","source_board":"raspberry_pi_pico","target_board":"edu_ru_el_048_pico"},
  {"manufacturer":"Riverside Uni Student Lab","product":"RU Control Port 049","serial_prefix":"RUSL049-","source_board":"raspberry_pi_pico","target_board":"edu_ru_sl_049_pico"},
  {"manufacturer":"Riverside Uni Learning","product":"RU Sensor Hub 050","serial_prefix":"RULR050-","source_board":"raspberry_pi_pico","target_board":"edu_ru_lr_050_pico"},
  {"manufacturer":"Summit Institute Computer Lab","product":"SI Device Link 051","serial_prefix":"SICL051-","source_board":"raspberry_pi_pico","target_board":"edu_si_cl_051_pico"},
  {"manufacturer":"Summit Institute Engineering","product":"SI USB Terminal 052","serial_prefix":"SIEN052-","source_board":"raspberry_pi_pico","target_board":"edu_si_en_052_pico"},
  {"manufacturer":"Summit Institute Science","product":"SI Debug Port 053","serial_prefix":"SISC053-","source_board":"raspberry_pi_pico","target_board":"edu_si_sc_053_pico"},
  {"manufacturer":"Summit Institute Robotics","product":"SI Service Port 054","serial_prefix":"SIRB054-","source_board":"raspberry_pi_pico","target_board":"edu_si_rb_054_pico"},
  {"manufacturer":"Summit Institute Library","product":"SI USB Interface 055","serial_prefix":"SILB055-","source_board":"raspberry_pi_pico","target_board":"edu_si_lb_055_pico"},
  {"manufacturer":"Summit Institute Research","product":"SI Serial Console 056","serial_prefix":"SIRS056-","source_board":"raspberry_pi_pico","target_board":"edu_si_rs_056_pico"},
  {"manufacturer":"Summit Institute Classroom","product":"SI Data Bridge 057","serial_prefix":"SICR057-","source_board":"raspberry_pi_pico","target_board":"edu_si_cr_057_pico"},
  {"manufacturer":"Summit Institute Electronics","product":"SI Control Port 058","serial_prefix":"SIEL058-","source_board":"raspberry_pi_pico","target_board":"edu_si_el_058_pico"},
  {"manufacturer":"Summit Institute Student Lab","product":"SI Sensor Hub 059","serial_prefix":"SISL059-","source_board":"raspberry_pi_pico","target_board":"edu_si_sl_059_pico"},
  {"manufacturer":"Summit Institute Learning","product":"SI Project Adapter 060","serial_prefix":"SILR060-","source_board":"raspberry_pi_pico","target_board":"edu_si_lr_060_pico"},
  {"manufacturer":"Greenfield Uni Computer Lab","product":"GU USB Terminal 061","serial_prefix":"GUCL061-","source_board":"raspberry_pi_pico","target_board":"edu_gu_cl_061_pico"},
  {"manufacturer":"Greenfield Uni Engineering","product":"GU Debug Port 062","serial_prefix":"GUEN062-","source_board":"raspberry_pi_pico","target_board":"edu_gu_en_062_pico"},
  {"manufacturer":"Greenfield Uni Science","product":"GU Service Port 063","serial_prefix":"GUSC063-","source_board":"raspberry_pi_pico","target_board":"edu_gu_sc_063_pico"},
  {"manufacturer":"Greenfield Uni Robotics","product":"GU USB Interface 064","serial_prefix":"GURB064-","source_board":"raspberry_pi_pico","target_board":"edu_gu_rb_064_pico"},
  {"manufacturer":"Greenfield Uni Library","product":"GU Serial Console 065","serial_prefix":"GULB065-","source_board":"raspberry_pi_pico","target_board":"edu_gu_lb_065_pico"},
  {"manufacturer":"Greenfield Uni Research","product":"GU Data Bridge 066","serial_prefix":"GURS066-","source_board":"raspberry_pi_pico","target_board":"edu_gu_rs_066_pico"},
  {"manufacturer":"Greenfield Uni Classroom","product":"GU Control Port 067","serial_prefix":"GUCR067-","source_board":"raspberry_pi_pico","target_board":"edu_gu_cr_067_pico"},
  {"manufacturer":"Greenfield Uni Electronics","product":"GU Sensor Hub 068","serial_prefix":"GUEL068-","source_board":"raspberry_pi_pico","target_board":"edu_gu_el_068_pico"},
  {"manufacturer":"Greenfield Uni Student Lab","product":"GU Project Adapter 069","serial_prefix":"GUSL069-","source_board":"raspberry_pi_pico","target_board":"edu_gu_sl_069_pico"},
  {"manufacturer":"Greenfield Uni Learning","product":"GU Device Link 070","serial_prefix":"GULR070-","source_board":"raspberry_pi_pico","target_board":"edu_gu_lr_070_pico"},
  {"manufacturer":"Nova School Computer Lab","product":"NA Debug Port 071","serial_prefix":"NACL071-","source_board":"raspberry_pi_pico","target_board":"edu_na_cl_071_pico"},
  {"manufacturer":"Nova School Engineering","product":"NA Service Port 072","serial_prefix":"NAEN072-","source_board":"raspberry_pi_pico","target_board":"edu_na_en_072_pico"},
  {"manufacturer":"Nova School Science","product":"NA USB Interface 073","serial_prefix":"NASC073-","source_board":"raspberry_pi_pico","target_board":"edu_na_sc_073_pico"},
  {"manufacturer":"Nova School Robotics","product":"NA Serial Console 074","serial_prefix":"NARB074-","source_board":"raspberry_pi_pico","target_board":"edu_na_rb_074_pico"},
  {"manufacturer":"Nova School Library","product":"NA Data Bridge 075","serial_prefix":"NALB075-","source_board":"raspberry_pi_pico","target_board":"edu_na_lb_075_pico"},
  {"manufacturer":"Nova School Research","product":"NA Control Port 076","serial_prefix":"NARS076-","source_board":"raspberry_pi_pico","target_board":"edu_na_rs_076_pico"},
  {"manufacturer":"Nova School Classroom","product":"NA Sensor Hub 077","serial_prefix":"NACR077-","source_board":"raspberry_pi_pico","target_board":"edu_na_cr_077_pico"},
  {"manufacturer":"Nova School Electronics","product":"NA Project Adapter 078","serial_prefix":"NAEL078-","source_board":"raspberry_pi_pico","target_board":"edu_na_el_078_pico"},
  {"manufacturer":"Nova School Student Lab","product":"NA Device Link 079","serial_prefix":"NASL079-","source_board":"raspberry_pi_pico","target_board":"edu_na_sl_079_pico"},
  {"manufacturer":"Nova School Learning","product":"NA USB Terminal 080","serial_prefix":"NALR080-","source_board":"raspberry_pi_pico","target_board":"edu_na_lr_080_pico"},
  {"manufacturer":"Central Tech Computer Lab","product":"CT Service Port 081","serial_prefix":"CTCL081-","source_board":"raspberry_pi_pico","target_board":"edu_ct_cl_081_pico"},
  {"manufacturer":"Central Tech Engineering","product":"CT USB Interface 082","serial_prefix":"CTEN082-","source_board":"raspberry_pi_pico","target_board":"edu_ct_en_082_pico"},
  {"manufacturer":"Central Tech Science","product":"CT Serial Console 083","serial_prefix":"CTSC083-","source_board":"raspberry_pi_pico","target_board":"edu_ct_sc_083_pico"},
  {"manufacturer":"Central Tech Robotics","product":"CT Data Bridge 084","serial_prefix":"CTRB084-","source_board":"raspberry_pi_pico","target_board":"edu_ct_rb_084_pico"},
  {"manufacturer":"Central Tech Library","product":"CT Control Port 085","serial_prefix":"CTLB085-","source_board":"raspberry_pi_pico","target_board":"edu_ct_lb_085_pico"},
  {"manufacturer":"Central Tech Research","product":"CT Sensor Hub 086","serial_prefix":"CTRS086-","source_board":"raspberry_pi_pico","target_board":"edu_ct_rs_086_pico"},
  {"manufacturer":"Central Tech Classroom","product":"CT Project Adapter 087","serial_prefix":"CTCR087-","source_board":"raspberry_pi_pico","target_board":"edu_ct_cr_087_pico"},
  {"manufacturer":"Central Tech Electronics","product":"CT Device Link 088","serial_prefix":"CTEL088-","source_board":"raspberry_pi_pico","target_board":"edu_ct_el_088_pico"},
  {"manufacturer":"Central Tech Student Lab","product":"CT USB Terminal 089","serial_prefix":"CTSL089-","source_board":"raspberry_pi_pico","target_board":"edu_ct_sl_089_pico"},
  {"manufacturer":"Central Tech Learning","product":"CT Debug Port 090","serial_prefix":"CTLR090-","source_board":"raspberry_pi_pico","target_board":"edu_ct_lr_090_pico"},
  {"manufacturer":"Bright Future Computer Lab","product":"BF USB Interface 091","serial_prefix":"BFCL091-","source_board":"raspberry_pi_pico","target_board":"edu_bf_cl_091_pico"},
  {"manufacturer":"Bright Future Engineering","product":"BF Serial Console 092","serial_prefix":"BFEN092-","source_board":"raspberry_pi_pico","target_board":"edu_bf_en_092_pico"},
  {"manufacturer":"Bright Future Science","product":"BF Data Bridge 093","serial_prefix":"BFSC093-","source_board":"raspberry_pi_pico","target_board":"edu_bf_sc_093_pico"},
  {"manufacturer":"Bright Future Robotics","product":"BF Control Port 094","serial_prefix":"BFRB094-","source_board":"raspberry_pi_pico","target_board":"edu_bf_rb_094_pico"},
  {"manufacturer":"Bright Future Library","product":"BF Sensor Hub 095","serial_prefix":"BFLB095-","source_board":"raspberry_pi_pico","target_board":"edu_bf_lb_095_pico"},
  {"manufacturer":"Bright Future Research","product":"BF Project Adapter 096","serial_prefix":"BFRS096-","source_board":"raspberry_pi_pico","target_board":"edu_bf_rs_096_pico"},
  {"manufacturer":"Bright Future Classroom","product":"BF Device Link 097","serial_prefix":"BFCR097-","source_board":"raspberry_pi_pico","target_board":"edu_bf_cr_097_pico"},
  {"manufacturer":"Bright Future Electronics","product":"BF USB Terminal 098","serial_prefix":"BFEL098-","source_board":"raspberry_pi_pico","target_board":"edu_bf_el_098_pico"},
  {"manufacturer":"Bright Future Student Lab","product":"BF Debug Port 099","serial_prefix":"BFSL099-","source_board":"raspberry_pi_pico","target_board":"edu_bf_sl_099_pico"},
  {"manufacturer":"Bright Future Learning","product":"BF Service Port 100","serial_prefix":"BFLR100-","source_board":"raspberry_pi_pico","target_board":"edu_bf_lr_100_pico"},
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
  form.elements.source_board.value = profile.source_board;
  form.elements.target_board.value = profile.target_board;
  form.elements.usb_manufacturer.value = profile.manufacturer;
  form.elements.usb_product.value = profile.product;
  form.elements.serial_prefix.value = profile.serial_prefix;
  form.elements.usb_vid.value = randomUsbId();
  form.elements.usb_pid.value = randomUsbId();
  document.querySelector('#usb-id-status').textContent = `پروفایل ${profile.target_board} برای ${profile.manufacturer} با شناسهٔ ${form.elements.usb_vid.value}:${form.elements.usb_pid.value} تولید شد.`;
  update();
});
document.querySelector('#edit-github').addEventListener('click',async()=>{if(!update())return;const tab=window.open(editUrl,'_blank');if(tab)tab.opener=null;try{await navigator.clipboard.writeText(canonical(values()));status.textContent='JSON کپی شد؛ در ویرایشگر GitHub جای‌گذاری و Commit کنید.';}catch{status.textContent='ویرایشگر باز شد؛ JSON را دستی کپی کنید.';}if(!tab)window.location.href=editUrl;});
document.querySelector('#reset').addEventListener('click',()=>{try{localStorage.removeItem(storageKey);}catch{}Object.entries(DEFAULTS).forEach(([key,value])=>{if(key==='drive_mode')form.querySelector(`input[value="${value}"]`).checked=true;else form.elements[key].value=value;});update();});
restore();
