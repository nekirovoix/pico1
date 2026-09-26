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
  {"manufacturer":"Cedar Uni Computer Lab","product":"CU Serial Console 001","serial_prefix":"CUCL001-","source_board":"raspberry_pi_pico","target_board":"edu_cu_cl_001_pico","drive_label":"EDCUCL001"},
  {"manufacturer":"Cedar Uni Engineering","product":"CU Data Bridge 002","serial_prefix":"CUEN002-","source_board":"raspberry_pi_pico","target_board":"edu_cu_en_002_pico","drive_label":"EDCUEN002"},
  {"manufacturer":"Cedar Uni Science","product":"CU Control Port 003","serial_prefix":"CUSC003-","source_board":"raspberry_pi_pico","target_board":"edu_cu_sc_003_pico","drive_label":"EDCUSC003"},
  {"manufacturer":"Cedar Uni Robotics","product":"CU Sensor Hub 004","serial_prefix":"CURB004-","source_board":"raspberry_pi_pico","target_board":"edu_cu_rb_004_pico","drive_label":"EDCURB004"},
  {"manufacturer":"Cedar Uni Library","product":"CU Project Adapter 005","serial_prefix":"CULB005-","source_board":"raspberry_pi_pico","target_board":"edu_cu_lb_005_pico","drive_label":"EDCULB005"},
  {"manufacturer":"Cedar Uni Research","product":"CU Device Link 006","serial_prefix":"CURS006-","source_board":"raspberry_pi_pico","target_board":"edu_cu_rs_006_pico","drive_label":"EDCURS006"},
  {"manufacturer":"Cedar Uni Classroom","product":"CU USB Terminal 007","serial_prefix":"CUCR007-","source_board":"raspberry_pi_pico","target_board":"edu_cu_cr_007_pico","drive_label":"EDCUCR007"},
  {"manufacturer":"Cedar Uni Electronics","product":"CU Debug Port 008","serial_prefix":"CUEL008-","source_board":"raspberry_pi_pico","target_board":"edu_cu_el_008_pico","drive_label":"EDCUEL008"},
  {"manufacturer":"Cedar Uni Student Lab","product":"CU Service Port 009","serial_prefix":"CUSL009-","source_board":"raspberry_pi_pico","target_board":"edu_cu_sl_009_pico","drive_label":"EDCUSL009"},
  {"manufacturer":"Cedar Uni Learning","product":"CU USB Interface 010","serial_prefix":"CULR010-","source_board":"raspberry_pi_pico","target_board":"edu_cu_lr_010_pico","drive_label":"EDCULR010"},
  {"manufacturer":"Maple School Computer Lab","product":"MA Data Bridge 011","serial_prefix":"MACL011-","source_board":"raspberry_pi_pico","target_board":"edu_ma_cl_011_pico","drive_label":"EDMACL011"},
  {"manufacturer":"Maple School Engineering","product":"MA Control Port 012","serial_prefix":"MAEN012-","source_board":"raspberry_pi_pico","target_board":"edu_ma_en_012_pico","drive_label":"EDMAEN012"},
  {"manufacturer":"Maple School Science","product":"MA Sensor Hub 013","serial_prefix":"MASC013-","source_board":"raspberry_pi_pico","target_board":"edu_ma_sc_013_pico","drive_label":"EDMASC013"},
  {"manufacturer":"Maple School Robotics","product":"MA Project Adapter 014","serial_prefix":"MARB014-","source_board":"raspberry_pi_pico","target_board":"edu_ma_rb_014_pico","drive_label":"EDMARB014"},
  {"manufacturer":"Maple School Library","product":"MA Device Link 015","serial_prefix":"MALB015-","source_board":"raspberry_pi_pico","target_board":"edu_ma_lb_015_pico","drive_label":"EDMALB015"},
  {"manufacturer":"Maple School Research","product":"MA USB Terminal 016","serial_prefix":"MARS016-","source_board":"raspberry_pi_pico","target_board":"edu_ma_rs_016_pico","drive_label":"EDMARS016"},
  {"manufacturer":"Maple School Classroom","product":"MA Debug Port 017","serial_prefix":"MACR017-","source_board":"raspberry_pi_pico","target_board":"edu_ma_cr_017_pico","drive_label":"EDMACR017"},
  {"manufacturer":"Maple School Electronics","product":"MA Service Port 018","serial_prefix":"MAEL018-","source_board":"raspberry_pi_pico","target_board":"edu_ma_el_018_pico","drive_label":"EDMAEL018"},
  {"manufacturer":"Maple School Student Lab","product":"MA USB Interface 019","serial_prefix":"MASL019-","source_board":"raspberry_pi_pico","target_board":"edu_ma_sl_019_pico","drive_label":"EDMASL019"},
  {"manufacturer":"Maple School Learning","product":"MA Serial Console 020","serial_prefix":"MALR020-","source_board":"raspberry_pi_pico","target_board":"edu_ma_lr_020_pico","drive_label":"EDMALR020"},
  {"manufacturer":"Horizon College Computer Lab","product":"HC Control Port 021","serial_prefix":"HCCL021-","source_board":"raspberry_pi_pico","target_board":"edu_hc_cl_021_pico","drive_label":"EDHCCL021"},
  {"manufacturer":"Horizon College Engineering","product":"HC Sensor Hub 022","serial_prefix":"HCEN022-","source_board":"raspberry_pi_pico","target_board":"edu_hc_en_022_pico","drive_label":"EDHCEN022"},
  {"manufacturer":"Horizon College Science","product":"HC Project Adapter 023","serial_prefix":"HCSC023-","source_board":"raspberry_pi_pico","target_board":"edu_hc_sc_023_pico","drive_label":"EDHCSC023"},
  {"manufacturer":"Horizon College Robotics","product":"HC Device Link 024","serial_prefix":"HCRB024-","source_board":"raspberry_pi_pico","target_board":"edu_hc_rb_024_pico","drive_label":"EDHCRB024"},
  {"manufacturer":"Horizon College Library","product":"HC USB Terminal 025","serial_prefix":"HCLB025-","source_board":"raspberry_pi_pico","target_board":"edu_hc_lb_025_pico","drive_label":"EDHCLB025"},
  {"manufacturer":"Horizon College Research","product":"HC Debug Port 026","serial_prefix":"HCRS026-","source_board":"raspberry_pi_pico","target_board":"edu_hc_rs_026_pico","drive_label":"EDHCRS026"},
  {"manufacturer":"Horizon College Classroom","product":"HC Service Port 027","serial_prefix":"HCCR027-","source_board":"raspberry_pi_pico","target_board":"edu_hc_cr_027_pico","drive_label":"EDHCCR027"},
  {"manufacturer":"Horizon College Electronics","product":"HC USB Interface 028","serial_prefix":"HCEL028-","source_board":"raspberry_pi_pico","target_board":"edu_hc_el_028_pico","drive_label":"EDHCEL028"},
  {"manufacturer":"Horizon College Student Lab","product":"HC Serial Console 029","serial_prefix":"HCSL029-","source_board":"raspberry_pi_pico","target_board":"edu_hc_sl_029_pico","drive_label":"EDHCSL029"},
  {"manufacturer":"Horizon College Learning","product":"HC Data Bridge 030","serial_prefix":"HCLR030-","source_board":"raspberry_pi_pico","target_board":"edu_hc_lr_030_pico","drive_label":"EDHCLR030"},
  {"manufacturer":"Pioneer Academy Computer Lab","product":"PS Sensor Hub 031","serial_prefix":"PSCL031-","source_board":"raspberry_pi_pico","target_board":"edu_ps_cl_031_pico","drive_label":"EDPSCL031"},
  {"manufacturer":"Pioneer Academy Engineering","product":"PS Project Adapter 032","serial_prefix":"PSEN032-","source_board":"raspberry_pi_pico","target_board":"edu_ps_en_032_pico","drive_label":"EDPSEN032"},
  {"manufacturer":"Pioneer Academy Science","product":"PS Device Link 033","serial_prefix":"PSSC033-","source_board":"raspberry_pi_pico","target_board":"edu_ps_sc_033_pico","drive_label":"EDPSSC033"},
  {"manufacturer":"Pioneer Academy Robotics","product":"PS USB Terminal 034","serial_prefix":"PSRB034-","source_board":"raspberry_pi_pico","target_board":"edu_ps_rb_034_pico","drive_label":"EDPSRB034"},
  {"manufacturer":"Pioneer Academy Library","product":"PS Debug Port 035","serial_prefix":"PSLB035-","source_board":"raspberry_pi_pico","target_board":"edu_ps_lb_035_pico","drive_label":"EDPSLB035"},
  {"manufacturer":"Pioneer Academy Research","product":"PS Service Port 036","serial_prefix":"PSRS036-","source_board":"raspberry_pi_pico","target_board":"edu_ps_rs_036_pico","drive_label":"EDPSRS036"},
  {"manufacturer":"Pioneer Academy Classroom","product":"PS USB Interface 037","serial_prefix":"PSCR037-","source_board":"raspberry_pi_pico","target_board":"edu_ps_cr_037_pico","drive_label":"EDPSCR037"},
  {"manufacturer":"Pioneer Academy Electronics","product":"PS Serial Console 038","serial_prefix":"PSEL038-","source_board":"raspberry_pi_pico","target_board":"edu_ps_el_038_pico","drive_label":"EDPSEL038"},
  {"manufacturer":"Pioneer Academy Student Lab","product":"PS Data Bridge 039","serial_prefix":"PSSL039-","source_board":"raspberry_pi_pico","target_board":"edu_ps_sl_039_pico","drive_label":"EDPSSL039"},
  {"manufacturer":"Pioneer Academy Learning","product":"PS Control Port 040","serial_prefix":"PSLR040-","source_board":"raspberry_pi_pico","target_board":"edu_ps_lr_040_pico","drive_label":"EDPSLR040"},
  {"manufacturer":"Riverside Uni Computer Lab","product":"RU Project Adapter 041","serial_prefix":"RUCL041-","source_board":"raspberry_pi_pico","target_board":"edu_ru_cl_041_pico","drive_label":"EDRUCL041"},
  {"manufacturer":"Riverside Uni Engineering","product":"RU Device Link 042","serial_prefix":"RUEN042-","source_board":"raspberry_pi_pico","target_board":"edu_ru_en_042_pico","drive_label":"EDRUEN042"},
  {"manufacturer":"Riverside Uni Science","product":"RU USB Terminal 043","serial_prefix":"RUSC043-","source_board":"raspberry_pi_pico","target_board":"edu_ru_sc_043_pico","drive_label":"EDRUSC043"},
  {"manufacturer":"Riverside Uni Robotics","product":"RU Debug Port 044","serial_prefix":"RURB044-","source_board":"raspberry_pi_pico","target_board":"edu_ru_rb_044_pico","drive_label":"EDRURB044"},
  {"manufacturer":"Riverside Uni Library","product":"RU Service Port 045","serial_prefix":"RULB045-","source_board":"raspberry_pi_pico","target_board":"edu_ru_lb_045_pico","drive_label":"EDRULB045"},
  {"manufacturer":"Riverside Uni Research","product":"RU USB Interface 046","serial_prefix":"RURS046-","source_board":"raspberry_pi_pico","target_board":"edu_ru_rs_046_pico","drive_label":"EDRURS046"},
  {"manufacturer":"Riverside Uni Classroom","product":"RU Serial Console 047","serial_prefix":"RUCR047-","source_board":"raspberry_pi_pico","target_board":"edu_ru_cr_047_pico","drive_label":"EDRUCR047"},
  {"manufacturer":"Riverside Uni Electronics","product":"RU Data Bridge 048","serial_prefix":"RUEL048-","source_board":"raspberry_pi_pico","target_board":"edu_ru_el_048_pico","drive_label":"EDRUEL048"},
  {"manufacturer":"Riverside Uni Student Lab","product":"RU Control Port 049","serial_prefix":"RUSL049-","source_board":"raspberry_pi_pico","target_board":"edu_ru_sl_049_pico","drive_label":"EDRUSL049"},
  {"manufacturer":"Riverside Uni Learning","product":"RU Sensor Hub 050","serial_prefix":"RULR050-","source_board":"raspberry_pi_pico","target_board":"edu_ru_lr_050_pico","drive_label":"EDRULR050"},
  {"manufacturer":"Summit Institute Computer Lab","product":"SI Device Link 051","serial_prefix":"SICL051-","source_board":"raspberry_pi_pico","target_board":"edu_si_cl_051_pico","drive_label":"EDSICL051"},
  {"manufacturer":"Summit Institute Engineering","product":"SI USB Terminal 052","serial_prefix":"SIEN052-","source_board":"raspberry_pi_pico","target_board":"edu_si_en_052_pico","drive_label":"EDSIEN052"},
  {"manufacturer":"Summit Institute Science","product":"SI Debug Port 053","serial_prefix":"SISC053-","source_board":"raspberry_pi_pico","target_board":"edu_si_sc_053_pico","drive_label":"EDSISC053"},
  {"manufacturer":"Summit Institute Robotics","product":"SI Service Port 054","serial_prefix":"SIRB054-","source_board":"raspberry_pi_pico","target_board":"edu_si_rb_054_pico","drive_label":"EDSIRB054"},
  {"manufacturer":"Summit Institute Library","product":"SI USB Interface 055","serial_prefix":"SILB055-","source_board":"raspberry_pi_pico","target_board":"edu_si_lb_055_pico","drive_label":"EDSILB055"},
  {"manufacturer":"Summit Institute Research","product":"SI Serial Console 056","serial_prefix":"SIRS056-","source_board":"raspberry_pi_pico","target_board":"edu_si_rs_056_pico","drive_label":"EDSIRS056"},
  {"manufacturer":"Summit Institute Classroom","product":"SI Data Bridge 057","serial_prefix":"SICR057-","source_board":"raspberry_pi_pico","target_board":"edu_si_cr_057_pico","drive_label":"EDSICR057"},
  {"manufacturer":"Summit Institute Electronics","product":"SI Control Port 058","serial_prefix":"SIEL058-","source_board":"raspberry_pi_pico","target_board":"edu_si_el_058_pico","drive_label":"EDSIEL058"},
  {"manufacturer":"Summit Institute Student Lab","product":"SI Sensor Hub 059","serial_prefix":"SISL059-","source_board":"raspberry_pi_pico","target_board":"edu_si_sl_059_pico","drive_label":"EDSISL059"},
  {"manufacturer":"Summit Institute Learning","product":"SI Project Adapter 060","serial_prefix":"SILR060-","source_board":"raspberry_pi_pico","target_board":"edu_si_lr_060_pico","drive_label":"EDSILR060"},
  {"manufacturer":"Greenfield Uni Computer Lab","product":"GU USB Terminal 061","serial_prefix":"GUCL061-","source_board":"raspberry_pi_pico","target_board":"edu_gu_cl_061_pico","drive_label":"EDGUCL061"},
  {"manufacturer":"Greenfield Uni Engineering","product":"GU Debug Port 062","serial_prefix":"GUEN062-","source_board":"raspberry_pi_pico","target_board":"edu_gu_en_062_pico","drive_label":"EDGUEN062"},
  {"manufacturer":"Greenfield Uni Science","product":"GU Service Port 063","serial_prefix":"GUSC063-","source_board":"raspberry_pi_pico","target_board":"edu_gu_sc_063_pico","drive_label":"EDGUSC063"},
  {"manufacturer":"Greenfield Uni Robotics","product":"GU USB Interface 064","serial_prefix":"GURB064-","source_board":"raspberry_pi_pico","target_board":"edu_gu_rb_064_pico","drive_label":"EDGURB064"},
  {"manufacturer":"Greenfield Uni Library","product":"GU Serial Console 065","serial_prefix":"GULB065-","source_board":"raspberry_pi_pico","target_board":"edu_gu_lb_065_pico","drive_label":"EDGULB065"},
  {"manufacturer":"Greenfield Uni Research","product":"GU Data Bridge 066","serial_prefix":"GURS066-","source_board":"raspberry_pi_pico","target_board":"edu_gu_rs_066_pico","drive_label":"EDGURS066"},
  {"manufacturer":"Greenfield Uni Classroom","product":"GU Control Port 067","serial_prefix":"GUCR067-","source_board":"raspberry_pi_pico","target_board":"edu_gu_cr_067_pico","drive_label":"EDGUCR067"},
  {"manufacturer":"Greenfield Uni Electronics","product":"GU Sensor Hub 068","serial_prefix":"GUEL068-","source_board":"raspberry_pi_pico","target_board":"edu_gu_el_068_pico","drive_label":"EDGUEL068"},
  {"manufacturer":"Greenfield Uni Student Lab","product":"GU Project Adapter 069","serial_prefix":"GUSL069-","source_board":"raspberry_pi_pico","target_board":"edu_gu_sl_069_pico","drive_label":"EDGUSL069"},
  {"manufacturer":"Greenfield Uni Learning","product":"GU Device Link 070","serial_prefix":"GULR070-","source_board":"raspberry_pi_pico","target_board":"edu_gu_lr_070_pico","drive_label":"EDGULR070"},
  {"manufacturer":"Nova School Computer Lab","product":"NA Debug Port 071","serial_prefix":"NACL071-","source_board":"raspberry_pi_pico","target_board":"edu_na_cl_071_pico","drive_label":"EDNACL071"},
  {"manufacturer":"Nova School Engineering","product":"NA Service Port 072","serial_prefix":"NAEN072-","source_board":"raspberry_pi_pico","target_board":"edu_na_en_072_pico","drive_label":"EDNAEN072"},
  {"manufacturer":"Nova School Science","product":"NA USB Interface 073","serial_prefix":"NASC073-","source_board":"raspberry_pi_pico","target_board":"edu_na_sc_073_pico","drive_label":"EDNASC073"},
  {"manufacturer":"Nova School Robotics","product":"NA Serial Console 074","serial_prefix":"NARB074-","source_board":"raspberry_pi_pico","target_board":"edu_na_rb_074_pico","drive_label":"EDNARB074"},
  {"manufacturer":"Nova School Library","product":"NA Data Bridge 075","serial_prefix":"NALB075-","source_board":"raspberry_pi_pico","target_board":"edu_na_lb_075_pico","drive_label":"EDNALB075"},
  {"manufacturer":"Nova School Research","product":"NA Control Port 076","serial_prefix":"NARS076-","source_board":"raspberry_pi_pico","target_board":"edu_na_rs_076_pico","drive_label":"EDNARS076"},
  {"manufacturer":"Nova School Classroom","product":"NA Sensor Hub 077","serial_prefix":"NACR077-","source_board":"raspberry_pi_pico","target_board":"edu_na_cr_077_pico","drive_label":"EDNACR077"},
  {"manufacturer":"Nova School Electronics","product":"NA Project Adapter 078","serial_prefix":"NAEL078-","source_board":"raspberry_pi_pico","target_board":"edu_na_el_078_pico","drive_label":"EDNAEL078"},
  {"manufacturer":"Nova School Student Lab","product":"NA Device Link 079","serial_prefix":"NASL079-","source_board":"raspberry_pi_pico","target_board":"edu_na_sl_079_pico","drive_label":"EDNASL079"},
  {"manufacturer":"Nova School Learning","product":"NA USB Terminal 080","serial_prefix":"NALR080-","source_board":"raspberry_pi_pico","target_board":"edu_na_lr_080_pico","drive_label":"EDNALR080"},
  {"manufacturer":"Central Tech Computer Lab","product":"CT Service Port 081","serial_prefix":"CTCL081-","source_board":"raspberry_pi_pico","target_board":"edu_ct_cl_081_pico","drive_label":"EDCTCL081"},
  {"manufacturer":"Central Tech Engineering","product":"CT USB Interface 082","serial_prefix":"CTEN082-","source_board":"raspberry_pi_pico","target_board":"edu_ct_en_082_pico","drive_label":"EDCTEN082"},
  {"manufacturer":"Central Tech Science","product":"CT Serial Console 083","serial_prefix":"CTSC083-","source_board":"raspberry_pi_pico","target_board":"edu_ct_sc_083_pico","drive_label":"EDCTSC083"},
  {"manufacturer":"Central Tech Robotics","product":"CT Data Bridge 084","serial_prefix":"CTRB084-","source_board":"raspberry_pi_pico","target_board":"edu_ct_rb_084_pico","drive_label":"EDCTRB084"},
  {"manufacturer":"Central Tech Library","product":"CT Control Port 085","serial_prefix":"CTLB085-","source_board":"raspberry_pi_pico","target_board":"edu_ct_lb_085_pico","drive_label":"EDCTLB085"},
  {"manufacturer":"Central Tech Research","product":"CT Sensor Hub 086","serial_prefix":"CTRS086-","source_board":"raspberry_pi_pico","target_board":"edu_ct_rs_086_pico","drive_label":"EDCTRS086"},
  {"manufacturer":"Central Tech Classroom","product":"CT Project Adapter 087","serial_prefix":"CTCR087-","source_board":"raspberry_pi_pico","target_board":"edu_ct_cr_087_pico","drive_label":"EDCTCR087"},
  {"manufacturer":"Central Tech Electronics","product":"CT Device Link 088","serial_prefix":"CTEL088-","source_board":"raspberry_pi_pico","target_board":"edu_ct_el_088_pico","drive_label":"EDCTEL088"},
  {"manufacturer":"Central Tech Student Lab","product":"CT USB Terminal 089","serial_prefix":"CTSL089-","source_board":"raspberry_pi_pico","target_board":"edu_ct_sl_089_pico","drive_label":"EDCTSL089"},
  {"manufacturer":"Central Tech Learning","product":"CT Debug Port 090","serial_prefix":"CTLR090-","source_board":"raspberry_pi_pico","target_board":"edu_ct_lr_090_pico","drive_label":"EDCTLR090"},
  {"manufacturer":"Bright Future Computer Lab","product":"BF USB Interface 091","serial_prefix":"BFCL091-","source_board":"raspberry_pi_pico","target_board":"edu_bf_cl_091_pico","drive_label":"EDBFCL091"},
  {"manufacturer":"Bright Future Engineering","product":"BF Serial Console 092","serial_prefix":"BFEN092-","source_board":"raspberry_pi_pico","target_board":"edu_bf_en_092_pico","drive_label":"EDBFEN092"},
  {"manufacturer":"Bright Future Science","product":"BF Data Bridge 093","serial_prefix":"BFSC093-","source_board":"raspberry_pi_pico","target_board":"edu_bf_sc_093_pico","drive_label":"EDBFSC093"},
  {"manufacturer":"Bright Future Robotics","product":"BF Control Port 094","serial_prefix":"BFRB094-","source_board":"raspberry_pi_pico","target_board":"edu_bf_rb_094_pico","drive_label":"EDBFRB094"},
  {"manufacturer":"Bright Future Library","product":"BF Sensor Hub 095","serial_prefix":"BFLB095-","source_board":"raspberry_pi_pico","target_board":"edu_bf_lb_095_pico","drive_label":"EDBFLB095"},
  {"manufacturer":"Bright Future Research","product":"BF Project Adapter 096","serial_prefix":"BFRS096-","source_board":"raspberry_pi_pico","target_board":"edu_bf_rs_096_pico","drive_label":"EDBFRS096"},
  {"manufacturer":"Bright Future Classroom","product":"BF Device Link 097","serial_prefix":"BFCR097-","source_board":"raspberry_pi_pico","target_board":"edu_bf_cr_097_pico","drive_label":"EDBFCR097"},
  {"manufacturer":"Bright Future Electronics","product":"BF USB Terminal 098","serial_prefix":"BFEL098-","source_board":"raspberry_pi_pico","target_board":"edu_bf_el_098_pico","drive_label":"EDBFEL098"},
  {"manufacturer":"Bright Future Student Lab","product":"BF Debug Port 099","serial_prefix":"BFSL099-","source_board":"raspberry_pi_pico","target_board":"edu_bf_sl_099_pico","drive_label":"EDBFSL099"},
  {"manufacturer":"Bright Future Learning","product":"BF Service Port 100","serial_prefix":"BFLR100-","source_board":"raspberry_pi_pico","target_board":"edu_bf_lr_100_pico","drive_label":"EDBFLR100"},
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
  form.elements.drive_label.value = profile.drive_label;
  form.elements.usb_vid.value = randomUsbId();
  form.elements.usb_pid.value = randomUsbId();
  document.querySelector('#usb-id-status').textContent = `پروفایل ${profile.target_board} برای ${profile.manufacturer} با شناسهٔ ${form.elements.usb_vid.value}:${form.elements.usb_pid.value} تولید شد.`;
  update();
});
document.querySelector('#edit-github').addEventListener('click',async()=>{if(!update())return;const tab=window.open(editUrl,'_blank');if(tab)tab.opener=null;try{await navigator.clipboard.writeText(canonical(values()));status.textContent='JSON کپی شد؛ در ویرایشگر GitHub جای‌گذاری و Commit کنید.';}catch{status.textContent='ویرایشگر باز شد؛ JSON را دستی کپی کنید.';}if(!tab)window.location.href=editUrl;});
document.querySelector('#reset').addEventListener('click',()=>{try{localStorage.removeItem(storageKey);}catch{}Object.entries(DEFAULTS).forEach(([key,value])=>{if(key==='drive_mode')form.querySelector(`input[value="${value}"]`).checked=true;else form.elements[key].value=value;});update();});
restore();
