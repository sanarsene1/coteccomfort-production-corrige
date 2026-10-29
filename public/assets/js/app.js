const commentUtils = window.commentUtils || {};
const { pickApprovedComments, pickVisibleComments, isValidComment, DEFAULT_COMMENTS = [] } = commentUtils;
const LOCAL_AUTH_MODE = window.COTEC_USE_LOCAL_AUTH === true;
const COMMENTS_VISIBLE_LIMIT = 5;

const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
const servicesNavItem = document.querySelector('.services-nav-item');
const servicesMenuToggle = document.querySelector('.services-menu-toggle');
const servicesMenu = document.querySelector('#services-menu');
const heroImages = [...document.querySelectorAll('.hero-visual .hero-image')];
const heroDots = [...document.querySelectorAll('.hero-dot')];
const heroContent = document.querySelector('.hero-content');
const heroEyebrow = document.querySelector('.hero-content .eyebrow [data-fr]');
const heroHeading = document.querySelector('.hero-content h1');
const heroLead = document.querySelector('.hero-content .hero-lead');
const heroNote = document.querySelector('.hero-content .hero-note span:last-child');
const heroSlides = [
  {
    eyebrow: ['FOURNISSEUR D’ACCÈS INTERNET · RDC', 'INTERNET SERVICE PROVIDER · DRC'],
    heading: ['Bienvenue chez<br><em>COMFORT TECHNOLOGIES COTEC.</em>', 'Welcome to<br><em>COMFORT TECHNOLOGIES COTEC.</em>'],
    lead: ['Internet haut débit et installations fiables, pensés pour les maisons, commerces et entreprises de Butembo et du Nord-Kivu.', 'High-speed internet and reliable installations for homes, businesses and organizations in Butembo and North Kivu.'],
    note: ['Votre connexion, notre priorité.', 'Your connection is our priority.']
  },
  {
    eyebrow: ['COMFORT TECHNOLOGIES COTEC', 'COMFORT TECHNOLOGIES COTEC'],
    heading: ['Votre partenaire<br><em>en connectivité.</em>', 'Your connectivity<br><em>partner.</em>'],
    lead: ['Au cœur de Butembo, dans le Nord-Kivu, nous rapprochons les personnes et les idées grâce à une technologie accessible et un service de proximité.', 'In the heart of Butembo, North Kivu, we bring people and ideas closer with accessible technology and attentive local support.'],
    note: ['Ensemble, construisons votre connexion.', 'Let’s build your connection together.']
  },
  {
    eyebrow: ['FOURNISSEUR D’ACCÈS INTERNET · RDC', 'INTERNET SERVICE PROVIDER · DRC'],
    heading: ['La RDC mérite<br><em>d’être connectée.</em>', 'The DRC deserves<br><em>to be connected.</em>'],
    lead: ['COMFORT TECHNOLOGIES COTEC vous accompagne avec des solutions Internet fiables, à la maison comme au travail.', 'COMFORT TECHNOLOGIES COTEC brings reliable internet solutions to your home and workplace.'],
    note: ['Le haut débit, plus près de vous.', 'High-speed internet, closer to you.']
  },
  {
    eyebrow: ['INSTALLATION · CONFIGURATION · ASSISTANCE', 'INSTALLATION · SETUP · SUPPORT'],
    heading: ['Le bon signal,<br><em>au bon endroit.</em>', 'The right signal,<br><em>right where you need it.</em>'],
    lead: ['Starlink, LiteBeam, NanoStation ou Cambium : nos techniciens installent des équipements adaptés à votre terrain.', 'Starlink, LiteBeam, NanoStation or Cambium: our technicians install equipment suited to your site.'],
    note: ['Du matériel bien posé. Un réseau bien pensé.', 'Installed with care. Designed to perform.']
  },
  {
    eyebrow: ['CONNECTIVITÉ · RÉSEAUX · ÉNERGIE', 'CONNECTIVITY · NETWORKS · ENERGY'],
    heading: ['L’énergie avance.<br><em>Votre réseau aussi.</em>', 'Powering progress.<br><em>Keeping you connected.</em>'],
    lead: ['Internet, Wi-Fi et solutions solaires : équipez votre maison ou votre entreprise pour aller plus loin.', 'Internet, Wi-Fi and solar solutions: equip your home or business to go further.'],
    note: ['Connectés à votre avenir.', 'Connected to your future.']
  },
  {
    eyebrow: ['COTEC · AU CŒUR DU NORD-KIVU', 'COTEC · AT THE HEART OF NORTH KIVU'],
    heading: ['La connexion qui<br><em>nous rapproche.</em>', 'Connectivity that<br><em>brings us closer.</em>'],
    lead: ['Des solutions Internet et réseau pensées pour les habitants et les entreprises de Butembo.', 'Internet and networking solutions designed for the people and businesses of Butembo.'],
    note: ['Ensemble, restons connectés.', 'Together, let’s stay connected.']
  }
];
let activeHeroSlide = 0;

function renderHeroSlide(index) {
  if (!heroContent || !heroEyebrow || !heroHeading || !heroLead || !heroNote) {
    return;
  }
  activeHeroSlide = index;
  const slide = heroSlides[index];
  const languageIndex = document.documentElement.lang === 'en' ? 1 : 0;
  [[heroEyebrow, slide.eyebrow], [heroHeading, slide.heading], [heroLead, slide.lead], [heroNote, slide.note]].forEach(([element, translations]) => {
    element.dataset.fr = translations[0];
    element.dataset.en = translations[1];
    element.innerHTML = translations[languageIndex];
  });
  heroImages.forEach((image, imageIndex) => {
    const isActive = imageIndex === index;
    if (isActive && image.dataset.src) {
      image.src = image.dataset.src;
      delete image.dataset.src;
    }
    image.classList.toggle('is-active', isActive);
  });
  heroContent.classList.toggle('hero-welcome', index === 0);
  heroContent.classList.toggle('hero-brand-only', index === 1);
  heroContent.classList.remove('hero-copy-refresh');
  void heroContent.offsetWidth;
  heroContent.classList.add('hero-copy-refresh');
  heroDots.forEach((dot, dotIndex) => {
    const isActive = dotIndex === index;
    dot.classList.toggle('is-active', isActive);
    dot.setAttribute('aria-pressed', String(isActive));
  });
}

heroDots.forEach((dot, index) => dot.addEventListener('click', () => {
  renderHeroSlide(index);
  nextHeroChangeAt = Date.now() + heroSlideDuration;
  startHeroTimer();
}));

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let heroTimer;
const heroSlideDuration = 5500;
let nextHeroChangeAt = 0;
let heroCarouselStarted = false;

function startHeroTimer() {
  window.clearInterval(heroTimer);
  if (!heroCarouselStarted) return;
  const now = Date.now();
  if (now >= nextHeroChangeAt) {
    const elapsedSlides = Math.floor((now - nextHeroChangeAt) / heroSlideDuration) + 1;
    renderHeroSlide((activeHeroSlide + elapsedSlides) % heroSlides.length);
    nextHeroChangeAt += elapsedSlides * heroSlideDuration;
  }
  if (document.hidden) return;
  heroTimer = window.setInterval(() => {
    const currentTime = Date.now();
    if (currentTime < nextHeroChangeAt) return;
    const elapsedSlides = Math.floor((currentTime - nextHeroChangeAt) / heroSlideDuration) + 1;
    renderHeroSlide((activeHeroSlide + elapsedSlides) % heroSlides.length);
    nextHeroChangeAt += elapsedSlides * heroSlideDuration;
  }, 250);
}

document.addEventListener('visibilitychange', startHeroTimer);
reduceMotion.addEventListener?.('change', startHeroTimer);
renderHeroSlide(0);

if (menuToggle && mainNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Ouvrir le menu' : 'Fermer le menu');
    mainNav.classList.toggle('open', !isOpen);
  });

  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Ouvrir le menu');
    });
  });
}

function setServicesMenuOpen(isOpen) {
  if (!servicesMenu || !servicesMenuToggle) return;
  servicesMenuToggle.setAttribute('aria-expanded', String(isOpen));
  servicesMenu.hidden = !isOpen;
}

const servicesMenuCanHover = window.matchMedia('(hover: hover) and (pointer: fine)');

if (servicesNavItem) {
  servicesNavItem.addEventListener('pointerenter', (event) => {
    if (servicesMenuCanHover.matches && event.pointerType !== 'touch') setServicesMenuOpen(true);
  });

  servicesNavItem.addEventListener('pointerleave', (event) => {
    if (servicesMenuCanHover.matches && event.pointerType !== 'touch') setServicesMenuOpen(false);
  });

  servicesNavItem.addEventListener('focusout', (event) => {
    if (!servicesNavItem.contains(event.relatedTarget)) setServicesMenuOpen(false);
  });
}

if (servicesMenuToggle) {
  servicesMenuToggle.addEventListener('focus', () => setServicesMenuOpen(true));
  servicesMenuToggle.addEventListener('click', () => {
    setServicesMenuOpen(servicesMenuToggle.getAttribute('aria-expanded') !== 'true');
  });
}

document.addEventListener('click', (event) => {
  if (!event.target.closest('.services-nav-item')) setServicesMenuOpen(false);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setServicesMenuOpen(false);
});

if (servicesMenu) {
  servicesMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      setServicesMenuOpen(false);
      if (mainNav) mainNav.classList.remove('open');
      if (menuToggle) {
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Ouvrir le menu');
      }
    });
  });
}

const finderTabs = [...document.querySelectorAll('.finder-tab')];
const finderForm = document.querySelector('#equipment-finder-form');
const finderTypeSelect = finderForm ? finderForm.querySelector('select[name="requestType"]') : null;
const finderTypeLabel = finderForm ? finderForm.querySelector('#finder-type-label') : null;
const finderFeedback = document.querySelector('#finder-form-feedback');
const finderFeedbackText = finderFeedback ? finderFeedback.querySelector('.finder-form-feedback__text') : null;
const finderFeedbackClose = finderFeedback ? finderFeedback.querySelector('.finder-form-feedback__close') : null;
const today = new Date();
const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
let finderFeedbackTimer;
let finderMode = 'installation';

const equipmentOptions = [
  { value: 'conseil', fr: 'Je ne sais pas encore — conseillez-moi', en: 'I’m not sure yet — please advise me' },
  { value: 'Starlink', fr: 'Starlink', en: 'Starlink' },
  { value: 'TP-Link / MikroTik', fr: 'TP-Link / MikroTik', en: 'TP-Link / MikroTik' },
  { value: 'LiteBeam / NanoStation', fr: 'LiteBeam / NanoStation', en: 'LiteBeam / NanoStation' },
  { value: 'Wi-Fi', fr: 'Réseau Wi-Fi', en: 'Wi-Fi network' },
  { value: 'Solaire', fr: 'Équipement solaire', en: 'Solar equipment' },
  { value: 'Autre', fr: 'Autre', en: 'Other' }
];
const subscriptionOptions = [
  { value: 'conseil', fr: 'Je ne sais pas encore — conseillez-moi', en: 'I’m not sure yet — please advise me' },
  { value: 'Starlink personnel', fr: 'Starlink personnel', en: 'Personal Starlink' },
  { value: 'Point à point', fr: 'Point à point', en: 'Point-to-point' }
];

function updateFinderTypeOptions() {
  if (!finderTypeLabel || !finderTypeSelect) return;
  const language = document.documentElement.lang === 'en' ? 'en' : 'fr';
  const isSubscription = finderMode === 'abonnement';
  const options = isSubscription ? subscriptionOptions : equipmentOptions;
  finderTypeLabel.dataset.fr = isSubscription ? 'Type d’abonnement' : 'Type d’équipement';
  finderTypeLabel.dataset.en = isSubscription ? 'Subscription type' : 'Equipment type';
  finderTypeLabel.textContent = finderTypeLabel.dataset[language];
  finderTypeSelect.replaceChildren();

  options.forEach(({ value, fr, en }) => {
    const option = document.createElement('option');
    option.value = value;
    option.dataset.fr = fr;
    option.dataset.en = en;
    option.textContent = option.dataset[language];
    if (value === 'conseil') option.selected = true;
    finderTypeSelect.append(option);
  });
}

if (finderForm && finderTypeSelect && finderTypeLabel) {
  updateFinderTypeOptions();

  const preferredDateField = finderForm.querySelector('input[name="date"]');
  preferredDateField.value = localToday;
  preferredDateField.min = localToday;
}

function clearFinderFeedback() {
  if (!finderFeedback || !finderFeedbackText) return;
  window.clearTimeout(finderFeedbackTimer);
  finderFeedbackText.textContent = '';
  finderFeedback.hidden = true;
}

function showFinderFeedback(message) {
  if (!finderFeedback || !finderFeedbackText) return;
  window.clearTimeout(finderFeedbackTimer);
  finderFeedbackText.textContent = message;
  finderFeedback.hidden = false;
  finderFeedbackTimer = window.setTimeout(clearFinderFeedback, 5000);
}

if (finderFeedbackClose) finderFeedbackClose.addEventListener('click', clearFinderFeedback);
if (finderForm) finderForm.addEventListener('change', clearFinderFeedback);

finderTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    finderMode = tab.dataset.mode;
    updateFinderTypeOptions();
    finderTabs.forEach((option) => {
      const isActive = option === tab;
      option.classList.toggle('is-active', isActive);
      option.setAttribute('aria-selected', String(isActive));
    });
  });
});

if (finderForm && finderTypeSelect) {
  finderForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(finderForm);
    const language = document.documentElement.lang === 'en' ? 'en' : 'fr';
    const areaField = finderForm.querySelector('[name="area"]');
    const dateField = finderForm.querySelector('[name="date"]');
    let invalidField = null;
    let validationMessage = '';

    if (!areaField.value) {
      invalidField = areaField;
      validationMessage = language === 'en'
        ? 'Please choose your town from the list before continuing.'
        : 'Choisissez votre ville dans la liste pour continuer.';
    } else if (!finderTypeSelect.value) {
      invalidField = finderTypeSelect;
      validationMessage = finderMode === 'abonnement'
        ? (language === 'en' ? 'Choose a subscription or select “I’m not sure yet — please advise me”.' : 'Choisissez un abonnement ou « Je ne sais pas encore — conseillez-moi ».')
        : (language === 'en' ? 'Choose an equipment type or select “I’m not sure yet — please advise me”.' : 'Choisissez un équipement ou « Je ne sais pas encore — conseillez-moi ».');
    } else if (!dateField.value || dateField.value < localToday) {
      invalidField = dateField;
      validationMessage = language === 'en'
        ? 'Choose today or a future date to continue.'
        : 'Choisissez la date d’aujourd’hui ou une date future pour continuer.';
    }

    if (invalidField) {
      showFinderFeedback(validationMessage);
      invalidField.focus();
      return;
    }

    clearFinderFeedback();
    const modeLabel = finderTabs.find((tab) => tab.dataset.mode === finderMode).querySelector('span').dataset[language];
    const date = formData.get('date');
    const selectedRequest = finderTypeSelect.value;
    const requestType = selectedRequest === 'conseil'
      ? (language === 'en' ? 'I have not chosen yet; please advise me' : 'Je n’ai pas encore choisi, merci de me conseiller')
      : finderTypeSelect.selectedOptions[0].dataset[language];
    const requestTypeLabel = finderMode === 'abonnement'
      ? (language === 'en' ? 'Subscription' : 'Abonnement')
      : (language === 'en' ? 'Equipment' : 'Équipement');
    const message = language === 'en'
      ? `Hello, I am a visitor from the COMFORT TECHNOLOGIES COTEC website. I would like to request ${modeLabel.toLowerCase()}. Town: ${formData.get('area')}. ${requestTypeLabel}: ${requestType}. Preferred date: ${date}. Please contact me.`
      : `Bonjour, je suis un visiteur du site COMFORT TECHNOLOGIES COTEC. Je souhaite demander une prestation de ${modeLabel.toLowerCase()}. Ville : ${formData.get('area')}. ${requestTypeLabel} : ${requestType}. Date souhaitée : ${date}. Merci de me contacter.`;
    window.open(`https://wa.me/243817483857?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  });
}

async function openWhatsAppTemplate(event, key, fallbackMessage, extraText = '') {
  event.preventDefault();

  try {
    const response = await fetch(`/api/whatsapp/messages?key=${encodeURIComponent(key)}`);
    const payload = await response.json();
    const messageText = payload?.message?.message || fallbackMessage || 'Bonjour COTEC, je souhaite parler à un conseiller.';
    const finalMessage = extraText ? `${messageText}${extraText}` : messageText;
    const phone = payload?.message?.phone_number || '243817483857';
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(finalMessage)}`, '_blank', 'noopener,noreferrer');
  } catch (error) {
    const phone = '243817483857';
    const finalMessage = extraText ? `${fallbackMessage}${extraText}` : fallbackMessage;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(finalMessage)}`, '_blank', 'noopener,noreferrer');
  }
}

document.querySelectorAll('[data-whatsapp-key]').forEach((button) => {
  button.addEventListener('click', (event) => {
    const key = button.dataset.whatsappKey;
    const fallback = button.dataset.whatsappFallback || 'Bonjour COTEC, je souhaite parler à un conseiller.';
    const extra = button.dataset.whatsappExtra || '';
    openWhatsAppTemplate(event, key, fallback, extra);
  });
});

document.querySelectorAll('.lang-btn').forEach((button) => {
  button.addEventListener('click', () => {
    const language = button.dataset.lang;
    document.documentElement.lang = language;
    document.querySelectorAll('[data-fr][data-en]').forEach((element) => {
      const translation = element.dataset[language];
      if (translation !== undefined) element.innerHTML = translation;
    });
    updateFinderTypeOptions();
    document.querySelectorAll('.lang-btn').forEach((option) => {
      const active = option === button;
      option.classList.toggle('active', active);
      option.setAttribute('aria-pressed', String(active));
    });
    renderHeroSlide(activeHeroSlide);
  });
});

const accountTrigger = document.querySelector('.account-trigger');
const accountModal = document.querySelector('#account-modal');
const accountForm = document.querySelector('#account-form, #auth-page-form');
const authNotice = document.querySelector('#auth-page-notice');
const commentList = document.querySelector('[data-comments-root] .comment-list');
const commentForm = document.querySelector('#comment-form');
const commentNotice = commentForm ? commentForm.querySelector('.comment-form__notice') : null;
const supabaseConfig = window.COTEC_SUPABASE || {};
const supabaseClient = LOCAL_AUTH_MODE ? null : supabaseConfig.url && supabaseConfig.anonKey && window.supabase
  ? window.supabase.createClient(supabaseConfig.url, supabaseConfig.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

function getCurrentUserName() {
  const user = getStoredUser();
  if (!user) return 'C';
  const candidate = user.username || user.email?.split('@')[0] || 'C';
  return String(candidate).trim() || 'C';
}

function getInitialsFromName(name) {
  const normalized = String(name || '').trim();
  if (!normalized) return 'C';
  const parts = normalized.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function getAvatarPalette(seed) {
  const palettes = [
    ['#d8f0ff', '#2a6ea6'],
    ['#ffe7d9', '#b76a32'],
    ['#fce7ec', '#c95b6a'],
    ['#e9f7d8', '#4a8b3d'],
    ['#f0e7ff', '#6945a0'],
    ['#ffe9a8', '#9b6a00'],
    ['#dffaf0', '#1e7d6d'],
    ['#ffd8d8', '#9f3a3a']
  ];

  const index = Math.abs(String(seed || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % palettes.length;
  return palettes[index];
}

function buildUserAvatar(name, size = 36) {
  const initials = getInitialsFromName(name);
  const [bg, color] = getAvatarPalette(name);
  const safeSize = Math.max(24, Number(size) || 36);

  return `
    <div class="account-trigger__avatar" style="background:${bg};color:${color};width:${safeSize}px;height:${safeSize}px;">
      <span>${initials}</span>
    </div>
  `;
}

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('cotec-auth-user') || 'null') || null;
  } catch (error) {
    return null;
  }
}

async function localAuthRequest(endpoint, payload) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Erreur d’authentification.');
  }

  return data;
}

function setReturnUrl(targetUrl) {
  try {
    if (!targetUrl || targetUrl.includes('account.html')) return;
    sessionStorage.setItem('cotec-return-url', targetUrl);
  } catch (error) {
    // Ignore storage errors in locked browsing modes.
  }
}

function getReturnUrl() {
  try {
    return sessionStorage.getItem('cotec-return-url') || '/index.html';
  } catch (error) {
    return '/index.html';
  }
}

function redirectAfterAuth() {
  const returnUrl = getReturnUrl();
  try {
    sessionStorage.removeItem('cotec-return-url');
  } catch (error) {
    // Ignore storage errors.
  }

  const target = returnUrl && returnUrl !== 'null' ? returnUrl : '/index.html';
  window.location.assign(target);
}

function openAccountModal(event) {
  if (event && typeof event.preventDefault === 'function') {
    event.preventDefault();
  }

  if (window.location.pathname.endsWith('/account.html') || window.location.pathname.endsWith('account.html')) {
    return;
  }

  setReturnUrl(window.location.pathname + window.location.search);
  window.location.assign('account.html');
}

function handleLogout() {
  setLoggedIn(false);
  renderAccountTrigger();
  if (window.location.pathname.endsWith('/account.html') || window.location.pathname.endsWith('account.html') || window.location.pathname.endsWith('/profile.html')) {
    window.location.assign('/index.html');
  }
}

function renderAccountTrigger() {
  if (!accountTrigger) return;

  const user = getStoredUser();
  const navEnd = accountTrigger.closest('.nav-end');
  const existingLogoutButton = navEnd ? navEnd.querySelector('.account-trigger__logout') : null;
  const isProfilePage = window.location.pathname.endsWith('/profile.html') || window.location.pathname.endsWith('profile.html');

  if (getIsLoggedIn() && user) {
    const name = getCurrentUserName();
    accountTrigger.classList.add('is-logged-in');
    accountTrigger.innerHTML = buildUserAvatar(name, 34);
    accountTrigger.setAttribute('aria-label', `Compte connecté : ${name}`);
    accountTrigger.title = `Compte : ${name}`;
    accountTrigger.dataset.redirect = '/profile.html';

    if (isProfilePage && !existingLogoutButton) {
      const logoutButton = document.createElement('button');
      logoutButton.type = 'button';
      logoutButton.className = 'account-trigger__logout';
      logoutButton.textContent = 'Déconnexion';
      logoutButton.addEventListener('click', (event) => {
        event.stopPropagation();
        handleLogout();
      });
      navEnd.appendChild(logoutButton);
    }
    if (!isProfilePage && existingLogoutButton) {
      existingLogoutButton.remove();
    }
    return;
  }

  accountTrigger.classList.remove('is-logged-in');
  accountTrigger.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-7 8a7 7 0 0 1 14 0"/><circle cx="12" cy="8" r="3" fill="none"/></svg>';
  accountTrigger.setAttribute('aria-label', 'Ouvrir le compte');
  accountTrigger.title = 'Mon compte';
  delete accountTrigger.dataset.redirect;
  if (existingLogoutButton) existingLogoutButton.remove();
}

function closeAccountModal() {
  if (!accountModal) return;
  accountModal.hidden = true;
  document.body.classList.remove('modal-open');
}

function getIsLoggedIn() {
  try {
    return localStorage.getItem('cotec-auth') === 'true' || Boolean(localStorage.getItem('cotec-auth-token'));
  } catch (error) {
    return false;
  }
}

function setLoggedIn(isLoggedIn) {
  try {
    localStorage.setItem('cotec-auth', String(isLoggedIn));
    if (!isLoggedIn) {
      localStorage.removeItem('cotec-auth-user');
      localStorage.removeItem('cotec-auth-token');
    }
  } catch (error) {
    // Ignore storage errors in private browsing or locked environments.
  }
}

function sanitizeStoredComments(list) {
  const legacyAuthors = new Set(['Hervé', 'Carine', 'Aline', 'Jules']);
  const comments = Array.isArray(list) ? list.filter((comment) => {
    if (!comment || typeof comment !== 'object') return false;
    const author = String(comment.author || '').trim();
    if (legacyAuthors.has(author)) return false;
    return comment.status === 'approved' || comment.status === 'pending';
  }) : [];

  try {
    const normalized = JSON.stringify(comments);
    if (normalized !== JSON.stringify(list || [])) {
      localStorage.setItem('cotec-comment-flow', normalized);
    }
  } catch (error) {
    // Ignore storage issues.
  }

  return comments;
}

async function fetchApprovedComments() {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('comments')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        const mapped = data.map((item) => ({
          id: item.id,
          author: item.author_name || 'Client COTEC',
          service: item.email ? 'Client COTEC' : 'Client COTEC',
          status: 'approved',
          text: item.content || '',
          publishedAt: item.created_at,
        }));
        return pickVisibleComments(mapped, COMMENTS_VISIBLE_LIMIT);
      }
    } catch (error) {
      console.warn('Supabase comments unavailable:', error);
    }
  }

  try {
    const response = await fetch('/api/comments', { cache: 'no-store' });
    if (response.ok) {
      const data = await response.json();
      const comments = Array.isArray(data.comments) ? data.comments.map((item) => ({
        id: item.id,
        author: item.author || 'Client COTEC',
        service: item.service || 'Service client',
        status: item.status || 'approved',
        text: item.text || '',
        publishedAt: item.created_at,
      })) : [];
      return pickVisibleComments(comments, COMMENTS_VISIBLE_LIMIT);
    }
  } catch (error) {
    console.warn('Commentaires MySQL indisponibles :', error.message || error);
  }

  return [];
}

async function renderComments() {
  if (!commentList) return;

  const comments = await fetchApprovedComments();

  if (!comments.length) {
    commentList.innerHTML = '<div class="comment-empty"><p data-fr="Aucun avis approuvé pour le moment." data-en="No approved reviews yet.">Aucun avis approuvé pour le moment.</p></div>';
    return;
  }

  const showAll = commentList.dataset.showAll === 'true';
  const allVisibleComments = comments;
  const displayedComments = showAll ? allVisibleComments : allVisibleComments.slice(0, COMMENTS_VISIBLE_LIMIT);

  commentList.innerHTML = displayedComments.map((comment) => {
    const authorInitial = (comment.author || 'C').trim().charAt(0).toUpperCase();
    const serviceLabel = comment.service || 'COTEC';
    const dateLabel = comment.publishedAt ? new Date(comment.publishedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
    return `
      <article class="comment-card">
        <div class="comment-card__top">
          <span class="comment-card__avatar">${authorInitial}</span>
          <div>
            <strong>${comment.author || 'Client COTEC'}</strong>
            <small>${serviceLabel}${dateLabel ? ` · ${dateLabel}` : ''}</small>
          </div>
        </div>
        <p>“${comment.text}”</p>
      </article>
    `;
  }).join('');

  const hasMore = allVisibleComments.length > COMMENTS_VISIBLE_LIMIT;
  if (hasMore && !showAll) {
    const readMoreButton = document.createElement('button');
    readMoreButton.type = 'button';
    readMoreButton.className = 'comment-form__submit';
    readMoreButton.textContent = 'Lire plus';
    readMoreButton.addEventListener('click', () => {
      commentList.dataset.showAll = 'true';
      renderComments();
    });
    commentList.appendChild(readMoreButton);
  }

  if (showAll && hasMore) {
    const collapseButton = document.createElement('button');
    collapseButton.type = 'button';
    collapseButton.className = 'comment-form__submit';
    collapseButton.textContent = 'Réduire';
    collapseButton.addEventListener('click', () => {
      delete commentList.dataset.showAll;
      renderComments();
    });
    commentList.appendChild(collapseButton);
  }
}

if (accountTrigger) {
  accountTrigger.addEventListener('click', () => {
    if (getIsLoggedIn()) {
      window.location.assign(accountTrigger.dataset.redirect || '/profile.html');
      return;
    }
    openAccountModal();
  });
}

function renderAccountPageState() {
  if (!window.location.pathname.endsWith('/account.html')) return;

  const card = document.querySelector('.auth-card');
  const form = document.getElementById('auth-page-form');
  const title = document.getElementById('account-page-title');
  const providers = document.querySelector('.auth-providers');
  const user = getStoredUser();

  if (!card || !form) return;

  const loggedIn = Boolean(getIsLoggedIn() && user);
  if (loggedIn) {
    const name = getCurrentUserName();
    const initials = getInitialsFromName(name);
    const [bg, color] = getAvatarPalette(name);

    if (title) title.textContent = 'Mon espace compte';
    if (providers) providers.style.display = 'none';
    form.style.display = 'none';

    let dashboard = document.querySelector('.account-page__dashboard');
    if (!dashboard) {
      dashboard = document.createElement('div');
      dashboard.className = 'account-page__dashboard';
      dashboard.style.cssText = 'margin-top:16px;padding:20px;border:1px solid rgba(24,37,30,0.1);border-radius:18px;background:#fff;box-shadow:0 10px 24px rgba(20,40,29,0.05);';
      card.insertBefore(dashboard, form);
    }

    const avatar = document.createElement('div');
    avatar.style.cssText = `display:flex;align-items:center;justify-content:center;width:58px;height:58px;border-radius:50%;background:${bg};color:${color};font-weight:800;font-size:22px;letter-spacing:0.04em;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.35);`;
    avatar.textContent = initials;

    const goToProfileButton = document.createElement('button');
    goToProfileButton.type = 'button';
    goToProfileButton.textContent = 'Voir mon profil';
    goToProfileButton.style.cssText = 'margin-top:14px;display:inline-flex;align-items:center;justify-content:center;min-height:40px;padding:0 14px;border:1px solid rgba(21,53,38,0.12);border-radius:999px;background:#f2f7f1;color:#153526;font-weight:700;cursor:pointer;';
    goToProfileButton.addEventListener('click', () => {
      window.location.assign('/profile.html');
    });

    const logoutBtn = document.createElement('button');
    logoutBtn.type = 'button';
    logoutBtn.textContent = 'Se déconnecter';
    logoutBtn.style.cssText = 'margin-top:16px;display:inline-flex;align-items:center;justify-content:center;min-height:42px;padding:0 16px;border:0;border-radius:999px;background:#153526;color:#fff;font-weight:700;cursor:pointer;';
    logoutBtn.addEventListener('click', handleLogout);

    dashboard.innerHTML = `
      <div style="display:flex;align-items:center;gap:14px;">
        ${avatar.outerHTML}
        <div>
          <div style="font-size:10px;text-transform:uppercase;letter-spacing:.12em;color:#5f7166;">Compte connecté</div>
          <div style="font-size:24px;font-weight:800;font-family:var(--font-display),sans-serif;color:#10291d;line-height:1.1;">${name}</div>
        </div>
      </div>
      <div style="margin-top:20px;padding-top:16px;border-top:1px solid rgba(24,37,30,0.08);color:#3d554a;font-size:14px;line-height:1.7;">
        Vous êtes connecté à votre espace COTEC.<br>
        Vous pouvez continuer votre navigation et publier un avis.
      </div>
    `;
    dashboard.appendChild(goToProfileButton);
    dashboard.appendChild(logoutBtn);
    return;
  }

  if (providers) providers.style.display = 'grid';
  form.style.display = 'grid';
  const existingDashboard = document.querySelector('.account-page__dashboard');
  if (existingDashboard) existingDashboard.remove();
}

renderAccountTrigger();
renderAccountPageState();

accountModal?.querySelectorAll('[data-close-account]').forEach((element) => {
  element.addEventListener('click', closeAccountModal);
});

async function upsertUserProfile(user, username, email) {
  if (!supabaseClient || !user?.id) return;

  try {
    const { error } = await supabaseClient.from('profiles').upsert({
      id: user.id,
      user_id: user.id,
      username,
      email,
      full_name: username,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });

    if (error) {
      console.warn('Profil Supabase non créé:', error);
    }
  } catch (error) {
    console.warn('Erreur de mise à jour du profil Supabase:', error);
  }
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '').trim();
  const username = String(formData.get('username') || '').trim();
  const confirmPassword = String(formData.get('confirmPassword') || '').trim();
  const noticeTarget = form.id === 'auth-page-form' ? authNotice : commentNotice;
  const mode = form.dataset.authMode === 'signup' ? 'signup' : 'login';

  if (!email || !password) {
    if (noticeTarget) {
      noticeTarget.textContent = 'Merci de remplir votre e-mail et votre mot de passe.';
      noticeTarget.classList.add('is-visible');
    }
    return;
  }

  if (mode === 'signup') {
    if (!username) {
      if (noticeTarget) {
        noticeTarget.textContent = 'Merci de saisir un nom d’utilisateur.';
        noticeTarget.classList.add('is-visible');
      }
      return;
    }

    if (password !== confirmPassword) {
      if (noticeTarget) {
        noticeTarget.textContent = 'Les mots de passe ne correspondent pas.';
        noticeTarget.classList.add('is-visible');
      }
      return;
    }
  }

  if (LOCAL_AUTH_MODE) {
    try {
      const endpoint = mode === 'signup' ? '/api/auth/register' : '/api/auth/login';
      const payload = mode === 'signup' ? { username, email, password } : { email, password };
      const data = await localAuthRequest(endpoint, payload);
      const activeUser = data.user;
      localStorage.setItem('cotec-auth-user', JSON.stringify(activeUser));
      localStorage.setItem('cotec-auth-token', `${activeUser.id}:${Date.now()}`);
      setLoggedIn(true);

      form.reset();
      form.querySelectorAll('input').forEach((input) => {
        input.value = '';
      });

      if (mode === 'signup') {
        applyAuthFormMode(form, 'login');
        if (window.location.pathname.endsWith('/account.html') || window.location.pathname.endsWith('account.html')) {
          if (noticeTarget) {
            noticeTarget.textContent = 'Compte créé avec succès. Vous pouvez vous connecter.';
            noticeTarget.classList.add('is-visible');
          }
          return;
        }
      }

      redirectAfterAuth();
      return;
    } catch (error) {
      if (noticeTarget) {
        noticeTarget.textContent = error.message || 'L’authentification a échoué.';
        noticeTarget.classList.add('is-visible');
      }
      return;
    }
  }

  if (supabaseClient) {
    const authAction = mode === 'signup'
      ? supabaseClient.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + '/confirm-email.html',
            data: {
              username,
              full_name: username,
            },
          },
        })
      : supabaseClient.auth.signInWithPassword({ email, password });

    const { data, error } = await authAction;
    if (error) {
      if (noticeTarget) {
        noticeTarget.textContent = error.message || 'La connexion a échoué.';
        noticeTarget.classList.add('is-visible');
      }
      return;
    }

    const activeUser = data?.user || data?.session?.user;
    if (activeUser) {
      if (mode === 'signup') {
        if (!data?.session && !data?.user?.email_confirmed_at) {
          form.reset();
          form.querySelectorAll('input').forEach((input) => {
            input.value = '';
          });
          setLoggedIn(false);
          window.location.assign('/confirm-email.html?status=check-email');
          return;
        }

        await upsertUserProfile(activeUser, username || activeUser.email?.split('@')[0] || 'user', email);
        form.reset();
        form.querySelectorAll('input').forEach((input) => {
          input.value = '';
        });
        setLoggedIn(false);
        applyAuthFormMode(form, 'login');

        if (window.location.pathname.endsWith('/account.html') || window.location.pathname.endsWith('account.html')) {
          if (noticeTarget) {
            noticeTarget.textContent = 'Compte créé avec succès. Veuillez vous connecter pour continuer.';
            noticeTarget.classList.add('is-visible');
          }
          return;
        }

        if (noticeTarget) {
          noticeTarget.textContent = 'Compte créé avec succès. Veuillez vous connecter pour continuer.';
          noticeTarget.classList.add('is-visible');
        }
        window.location.assign('/account.html');
        return;
      }
      setLoggedIn(true);
      redirectAfterAuth();
      return;
    }
  }

  setLoggedIn(true);
  redirectAfterAuth();
}

function applyAuthFormMode(form, nextMode) {
  const mode = nextMode === 'signup' ? 'signup' : 'login';
  form.dataset.authMode = mode;

  const submitBtn = form.querySelector('.account-modal__submit, .account-page__submit');
  const heading = document.querySelector('#account-page-title');
  const secondaryPrefix = form.querySelector('.account-page__secondary-text--prefix');
  const inlineToggle = form.querySelector('.account-page__inline-toggle');
  const usernameField = form.querySelector('[name="username"]').closest('.account-page__field, .account-modal__field');
  const confirmField = form.querySelector('[name="confirmPassword"]').closest('.account-page__field, .account-modal__field');

  if (usernameField) usernameField.style.display = mode === 'signup' ? 'grid' : 'none';
  if (confirmField) confirmField.style.display = mode === 'signup' ? 'grid' : 'none';

  if (submitBtn) {
    submitBtn.textContent = mode === 'signup' ? 'Créer le compte' : 'Se connecter';
    submitBtn.setAttribute('data-fr', mode === 'signup' ? 'Créer le compte' : 'Se connecter');
    submitBtn.setAttribute('data-en', mode === 'signup' ? 'Create account' : 'Log in');
  }

  if (heading) {
    heading.textContent = mode === 'signup' ? 'Créer votre compte' : 'Connexion';
  }

  if (secondaryPrefix && inlineToggle) {
    const isSignup = mode === 'signup';
    secondaryPrefix.textContent = isSignup ? secondaryPrefix.dataset.signup : secondaryPrefix.dataset.login;
    inlineToggle.dataset.mode = isSignup ? 'login' : 'signup';
    inlineToggle.textContent = isSignup ? 'Se connecter' : 'Créer un compte';
  }
}

function bindAuthForm(form) {
  if (!form) return;
  form.addEventListener('submit', handleAuthSubmit);

  form.querySelector('.google-auth-btn, .account-page__google')?.addEventListener('click', async () => {
    const noticeTarget = form.id === 'auth-page-form' ? authNotice : commentNotice;
    if (LOCAL_AUTH_MODE || !supabaseClient) {
      setLoggedIn(true);
      closeAccountModal();
      if (noticeTarget) {
        noticeTarget.textContent = 'Mode local activé. Vous pouvez créer un compte local ou vous connecter directement.';
        noticeTarget.classList.add('is-visible');
      }
      return;
    }

    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/index.html',
      },
    });

    if (error) {
      if (noticeTarget) {
        noticeTarget.textContent = error.message || 'La connexion Google n’a pas pu être démarrée.';
        noticeTarget.classList.add('is-visible');
      }
      return;
    }

    closeAccountModal();
    if (noticeTarget) {
      noticeTarget.textContent = 'Connexion Google en cours. Revenez sur cette page après validation.';
      noticeTarget.classList.add('is-visible');
    }
  });

  form.querySelectorAll('[data-mode]').forEach((toggleButton) => {
    toggleButton.addEventListener('click', () => {
      const nextMode = toggleButton.dataset.mode === 'signup' ? 'signup' : 'login';
      const inputs = form.querySelectorAll('input');
      inputs.forEach((input) => {
        input.value = '';
      });
      applyAuthFormMode(form, nextMode);
    });
  });

  const initialMode = form.dataset.authMode === 'signup' ? 'signup' : 'login';
  applyAuthFormMode(form, initialMode);
}

if (accountForm) {
  bindAuthForm(accountForm);
}

if (commentForm) {
  commentForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(commentForm);
    const message = String(formData.get('comment') || '').trim();

    if (!isValidComment(message)) {
      if (commentNotice) {
        commentNotice.textContent = 'Le commentaire est trop court. Ajoutez au moins 3 caractères.';
        commentNotice.classList.add('is-visible');
      }
      return;
    }

    const authorName = getStoredUser()?.username || getStoredUser()?.email?.split('@')[0] || 'Client COTEC';

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: authorName,
          service: 'Service client',
          text: message,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Le commentaire n’a pas pu être enregistré.');
      }

      commentForm.reset();
      delete commentList?.dataset.showAll;
      await renderComments();

      if (commentNotice) {
        commentNotice.textContent = 'Votre commentaire a bien été publié et est visible sur le site.';
        commentNotice.classList.add('is-visible');
      }
    } catch (error) {
      if (commentNotice) {
        commentNotice.textContent = error.message || 'Le commentaire n’a pas pu être enregistré.';
        commentNotice.classList.add('is-visible');
      }
    }
  });
}

if (commentList) {
  renderComments();
}

const yearEl = document.querySelector('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

const appLoader = document.getElementById('app-loader');

if (appLoader) {
  const minLoaderDelay = 2000;
  const maxLoaderDelay = 4000;
  const loaderDelay = Math.floor(Math.random() * (maxLoaderDelay - minLoaderDelay + 1)) + minLoaderDelay;

  let loaderHidden = false;
  const hideLoader = () => {
    if (loaderHidden) return;
    loaderHidden = true;
    appLoader.classList.add('is-leaving');
    window.setTimeout(() => {
      appLoader.remove();
      heroCarouselStarted = true;
      nextHeroChangeAt = Date.now() + heroSlideDuration;
      startHeroTimer();
    }, 700);
  };

  // Hide after the short delay once the page is usable, without waiting for every image/video.
  window.setTimeout(hideLoader, loaderDelay);
  // Safety net: never keep the loader longer than 6 seconds.
  window.setTimeout(hideLoader, 6000);
} else {
  window.addEventListener('load', () => {
    heroCarouselStarted = true;
    nextHeroChangeAt = Date.now() + heroSlideDuration;
    startHeroTimer();
  }, { once: true });
}
