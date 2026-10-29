const MAX_FILE = 5 * 1024 * 1024;      // 5 Mo par PDF
const MAX_TOTAL = 15 * 1024 * 1024;    // 15 Mo total pour les PDF
const WHATSAPP = '243817483857';
const MAIL = 'arsenenzanzu19@gmail.com';

const isEn = () => document.documentElement.lang === 'en';
const t = (fr, en) => (isEn() ? en : fr);

const form = document.getElementById('stage-form');
const successBox = document.getElementById('stage-success');
const errorBox = document.getElementById('stage-error');
const fallbackBox = document.getElementById('stage-fallback');
const countBadge = document.getElementById('stage-count');
const submitBtn = document.getElementById('stage-submit');
const slots = [...document.querySelectorAll('.stage-file')];
const institutionField = form.querySelector('input[name="institution"]');
const levelField = form.querySelector('input[name="level"]');
const institutionLabel = form.querySelector('.institution-label');
const levelLabel = form.querySelector('.level-label');

function updateFieldLabelsByType() {
  const selected = form.querySelector('input[name="type"]:checked')?.value || 'Stage académique';
  const isAcademic = selected === 'Stage académique';

  if (institutionLabel) institutionLabel.textContent = isAcademic ? 'École / université / institution *' : 'Entreprise / organisation *';
  if (levelLabel) levelLabel.textContent = isAcademic ? 'Niveau / filière *' : 'Poste / spécialité *';

  if (institutionField) {
    institutionField.placeholder = isAcademic ? 'Ex. : UCBC, UCG, …' : 'Ex. : COTEC, MTN, Airtel…';
    institutionField.setAttribute('data-ph-fr', isAcademic ? 'Ex. : UCBC, UCG, …' : 'Ex. : COTEC, MTN, Airtel…');
    institutionField.setAttribute('data-ph-en', isAcademic ? 'E.g. UCBC, UCG, …' : 'E.g. COTEC, MTN, Airtel…');
  }

  if (levelField) {
    levelField.placeholder = isAcademic ? 'Ex. : L1 Informatique' : 'Ex. : Technicien réseau, Wi‑Fi…';
    levelField.setAttribute('data-ph-fr', isAcademic ? 'Ex. : L1 Informatique' : 'Ex. : Technicien réseau, Wi‑Fi…');
    levelField.setAttribute('data-ph-en', isAcademic ? 'E.g. Year 1 Computer Science' : 'E.g. Network technician, Wi‑Fi…');
  }
}

/* ---------- Référence unique ---------- */
function makeReference() {
  const d = new Date();
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `STG-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}-${rnd}`;
}
document.getElementById('stage-reference').value = makeReference();

/* ---------- Pré-sélection du type via ?type= ---------- */
const typeParam = new URLSearchParams(location.search).get('type');
const typeMap = { academique: 't-acad', professionnel: 't-pro', formation: 't-form' };
if (typeParam && typeMap[typeParam]) document.getElementById(typeMap[typeParam]).checked = true;

/* ---------- Date minimale = aujourd'hui ---------- */
const startField = document.getElementById('stage-start');
if (startField) startField.min = new Date().toISOString().slice(0, 10);

/* ---------- Fichiers PDF ---------- */
const sizeLabel = (n) => (n >= 1048576 ? (n / 1048576).toFixed(1) + ' Mo' : Math.max(1, Math.round(n / 1024)) + ' Ko');

async function isRealPdf(file) {
  const looksPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
  if (!looksPdf) return false;
  try {
    const head = await file.slice(0, 5).text();
    return head === '%PDF-';
  } catch { return true; }
}

function updateCount() {
  const n = slots.filter((s) => s.classList.contains('has-file')).length;
  countBadge.textContent = `${n} / 3`;
  countBadge.classList.toggle('ok', n >= 3);
}

function resetSlot(slot) {
  const input = slot.querySelector('input[type=file]');
  input.value = '';
  slot.classList.remove('has-file', 'has-error');
  slot.querySelector('.stage-file-state').textContent = t('Choisir un PDF', 'Choose a PDF');
  slot.querySelector('.stage-file-remove').hidden = true;
  const small = slot.querySelector('small');
  if (small.dataset.orig) small.textContent = small.dataset.orig;
  updateCount();
}

slots.forEach((slot) => {
  const input = slot.querySelector('input[type=file]');
  const small = slot.querySelector('small');
  const state = slot.querySelector('.stage-file-state');
  const remove = slot.querySelector('.stage-file-remove');
  input.addEventListener('change', async () => {
    errorBox.hidden = true;
    const file = input.files[0];
    if (!small.dataset.orig) small.dataset.orig = small.textContent;
    if (!file) { resetSlot(slot); return; }
    let problem = '';
    if (!(await isRealPdf(file))) problem = t('Ce fichier n’est pas un PDF.', 'This file is not a PDF.');
    else if (file.size > MAX_FILE) problem = t(`Fichier trop lourd (${sizeLabel(file.size)}). Maximum 5 Mo par PDF.`, `File too large (${sizeLabel(file.size)}). Maximum 5 MB per PDF.`);
    if (problem) {
      input.value = '';
      slot.classList.remove('has-file');
      slot.classList.add('has-error');
      state.textContent = t('Réessayer', 'Try again');
      small.textContent = problem;
      remove.hidden = true;
      updateCount();
      return;
    }
    slot.classList.remove('has-error');
    slot.classList.add('has-file');
    small.textContent = `${file.name} · ${sizeLabel(file.size)}`;
    state.textContent = t('Ajouté', 'Added');
    remove.hidden = false;
    updateCount();
  });
  remove.addEventListener('click', (e) => { e.preventDefault(); resetSlot(slot); });
});

/* ---------- Envoi ---------- */
function showError(msg) {
  if (errorBox.dataset.hideTimer) clearTimeout(Number(errorBox.dataset.hideTimer));

  errorBox.innerHTML = `
    <span class="stage-msg-text">${msg}</span>
    <button type="button" class="stage-msg-close" aria-label="Fermer le message">×</button>
  `;
  errorBox.hidden = false;
  errorBox.classList.add('is-visible');

  const closeBtn = errorBox.querySelector('.stage-msg-close');
  closeBtn.addEventListener('click', () => {
    errorBox.hidden = true;
    errorBox.classList.remove('is-visible');
    if (errorBox.dataset.hideTimer) clearTimeout(Number(errorBox.dataset.hideTimer));
  });

  const timer = window.setTimeout(() => {
    errorBox.hidden = true;
    errorBox.classList.remove('is-visible');
  }, 4000);
  errorBox.dataset.hideTimer = String(timer);
}

function validateRequiredFields() {
  let firstInvalid = null;
  let firstMessage = t('Veuillez compléter le champ requis avant d’envoyer.', 'Please complete the required field before sending.');

  const radioGroup = form.querySelectorAll('input[name="type"]');
  const radioChecked = [...radioGroup].some((radio) => radio.checked);
  if (!radioChecked) {
    firstInvalid = radioGroup[0] || null;
    firstMessage = t('Veuillez sélectionner votre type de demande.', 'Please select your request type.');
  }

  const nameInput = form.querySelector('input[name="name"]');
  if (nameInput && (!nameInput.value.trim())) {
    firstInvalid ??= nameInput;
    firstMessage = firstInvalid === nameInput ? t('Veuillez renseigner votre nom complet.', 'Please enter your full name.') : firstMessage;
  }

  const phoneInput = form.querySelector('input[name="phone"]');
  if (phoneInput && (!phoneInput.value.trim())) {
    firstInvalid ??= phoneInput;
    firstMessage = firstInvalid === phoneInput ? t('Veuillez renseigner votre téléphone ou WhatsApp.', 'Please enter your phone or WhatsApp.') : firstMessage;
  }

  const emailInput = form.querySelector('input[name="email"]');
  if (emailInput && (!emailInput.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim()))) {
    firstInvalid ??= emailInput;
    firstMessage = firstInvalid === emailInput ? t('Veuillez saisir une adresse e-mail valide.', 'Please enter a valid email address.') : firstMessage;
  }

  const institutionInput = form.querySelector('input[name="institution"]');
  if (institutionInput && (!institutionInput.value.trim())) {
    firstInvalid ??= institutionInput;
    firstMessage = firstInvalid === institutionInput ? t('Veuillez renseigner votre école ou institution.', 'Please enter your school or institution.') : firstMessage;
  }

  const levelInput = form.querySelector('input[name="level"]');
  if (levelInput && (!levelInput.value.trim())) {
    firstInvalid ??= levelInput;
    firstMessage = firstInvalid === levelInput ? t('Veuillez renseigner votre niveau ou filière.', 'Please enter your level or field of study.') : firstMessage;
  }

  const domainSelect = form.querySelector('select[name="domain"]');
  if (domainSelect && !domainSelect.value) {
    firstInvalid ??= domainSelect;
    firstMessage = firstInvalid === domainSelect ? t('Veuillez choisir votre domaine.', 'Please choose your field.') : firstMessage;
  }

  const durationSelect = form.querySelector('select[name="duration"]');
  if (durationSelect && !durationSelect.value) {
    firstInvalid ??= durationSelect;
    firstMessage = firstInvalid === durationSelect ? t('Veuillez choisir la durée souhaitée.', 'Please choose the desired duration.') : firstMessage;
  }

  const files = slots.map((s) => s.querySelector('input').files[0]).filter(Boolean);
  if (files.length === 0) {
    const firstFileInput = slots[0]?.querySelector('input[type="file"]');
    firstInvalid ??= firstFileInput || null;
    firstMessage = firstInvalid === firstFileInput ? t('Veuillez joindre au moins un PDF avant d’envoyer.', 'Please attach at least one PDF before sending.') : firstMessage;
  }

  if (firstInvalid) {
    showError(firstMessage);
    return false;
  }

  return true;
}

function summary(fd) {
  const g = (k) => String(fd.get(k) || '').trim();
  const files = slots.map((s) => s.querySelector('input').files[0]).filter(Boolean).map((f) => f.name).join(', ');
  return [
    `Bonjour COTEC, je viens d’envoyer une demande depuis le site (réf. ${g('reference')}).`,
    `Type : ${g('type')}`,
    `Nom : ${g('name')}`,
    `Institution : ${g('institution')}${g('level') ? ' · ' + g('level') : ''}`,
    `Domaine : ${g('domain')} · Durée : ${g('duration')}`,
    files ? `PDF : ${files}` : ''
  ].filter(Boolean).join('\n');
}

window.addEventListener('beforeunload', (event) => {
  if (form.dataset.dirty === 'true' && !form.hidden) {
    event.preventDefault();
    event.returnValue = 'Votre formulaire est en cours de saisie. Si vous rechargez la page, vous risquez de perdre les informations déjà saisies.';
  }
});

form.addEventListener('input', () => {
  form.dataset.dirty = 'true';
});
form.addEventListener('change', () => {
  form.dataset.dirty = 'true';
  updateFieldLabelsByType();
});

updateFieldLabelsByType();

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  errorBox.hidden = true;
  fallbackBox.hidden = true;
  form.dataset.dirty = 'false';

  if (!validateRequiredFields()) return;

  const files = slots.map((s) => s.querySelector('input').files[0]).filter(Boolean);
  if (slots.some((s) => s.classList.contains('has-error'))) {
    showError(t('Un des fichiers est invalide. Corrigez-le ou retirez-le avant d’envoyer.', 'One of the files is invalid. Fix or remove it before sending.'));
    return;
  }
  const total = files.reduce((n, f) => n + f.size, 0);
  if (total > MAX_TOTAL) {
    showError(t(`Les fichiers pèsent ${sizeLabel(total)} au total. Maximum 15 Mo pour les 3 PDF : compressez vos documents si besoin.`, `Files total ${sizeLabel(total)}. Maximum 15 MB for the 3 PDFs: please compress your documents if needed.`));
    return;
  }

  const label = submitBtn.querySelector('span');
  const oldLabel = label.innerHTML;
  submitBtn.disabled = true;
  label.textContent = t('Envoi en cours…', 'Sending…');

  window.onbeforeunload = null;
  const fd = new FormData(form);
  const text = summary(fd);
  const wa = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
  const mail = `mailto:${MAIL}?subject=${encodeURIComponent('Demande de stage / formation — ' + fd.get('name'))}&body=${encodeURIComponent(text)}`;

  try {
    document.getElementById('stage-ref-show').textContent = fd.get('reference');
    document.getElementById('stage-wa').href = wa;
    const popup = window.open(wa, '_blank', 'noopener,noreferrer');
    if (!popup) {
      throw new Error('Popup blocked');
    }
    form.hidden = true;
    successBox.hidden = false;
    successBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (error) {
    fallbackBox.innerHTML = isEn()
      ? `We could not open WhatsApp automatically. Please use <a href="${wa}" target="_blank" rel="noopener">this WhatsApp link</a> or <a href="${mail}">email</a> and attach your PDFs.`
      : `L’ouverture de WhatsApp a été bloquée. Utilisez <a href="${wa}" target="_blank" rel="noopener">ce lien WhatsApp</a> ou <a href="${mail}">l’e-mail</a> pour joindre vos PDF.`;
    fallbackBox.hidden = false;
    fallbackBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } finally {
    submitBtn.disabled = false;
    label.innerHTML = oldLabel;
  }
});

/* ---------- Menu, services, langue (même comportement que les autres pages) ---------- */
const yearNode = document.getElementById('year');
if (yearNode) yearNode.textContent = new Date().getFullYear();

const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
menuToggle.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Ouvrir le menu' : 'Fermer le menu');
  mainNav.classList.toggle('open', !isOpen);
});
mainNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  mainNav.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
}));

const servicesNavItem = document.querySelector('.services-nav-item');
const servicesMenuToggle = document.querySelector('.services-menu-toggle');
const servicesMenu = document.getElementById('services-menu');
function setServicesMenuOpen(isOpen) {
  if (!servicesMenu || !servicesMenuToggle) return;
  servicesMenuToggle.setAttribute('aria-expanded', String(isOpen));
  servicesMenu.hidden = !isOpen;
}
if (servicesNavItem && servicesMenuToggle && servicesMenu) {
  servicesNavItem.addEventListener('pointerenter', (event) => {
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && event.pointerType !== 'touch') setServicesMenuOpen(true);
  });
  servicesNavItem.addEventListener('pointerleave', (event) => {
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && event.pointerType !== 'touch') setServicesMenuOpen(false);
  });
  servicesMenuToggle.addEventListener('click', (event) => {
    event.stopPropagation();
    setServicesMenuOpen(servicesMenuToggle.getAttribute('aria-expanded') !== 'true');
  });
  servicesNavItem.addEventListener('focusout', (event) => {
    if (!servicesNavItem.contains(event.relatedTarget)) setServicesMenuOpen(false);
  });
  document.addEventListener('click', (event) => {
    if (!servicesNavItem.contains(event.target)) setServicesMenuOpen(false);
  });
  servicesMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setServicesMenuOpen(false)));
}

document.querySelectorAll('.lang-btn').forEach((button) => button.addEventListener('click', () => {
  const language = button.dataset.lang;
  document.documentElement.lang = language;
  document.querySelectorAll('[data-fr][data-en]').forEach((element) => {
    if (element.matches('option')) element.textContent = element.dataset[language];
    else element.innerHTML = element.dataset[language];
  });
  document.querySelectorAll('[data-ph-fr]').forEach((el) => { el.placeholder = language === 'en' ? el.dataset.phEn : el.dataset.phFr; });
  slots.forEach((slot) => {
    if (!slot.classList.contains('has-file') && !slot.classList.contains('has-error')) {
      slot.querySelector('.stage-file-state').textContent = t('Choisir un PDF', 'Choose a PDF');
    }
  });
  document.querySelectorAll('.lang-btn').forEach((item) => {
    const isActive = item === button;
    item.classList.toggle('active', isActive);
    item.setAttribute('aria-pressed', String(isActive));
  });
}));
