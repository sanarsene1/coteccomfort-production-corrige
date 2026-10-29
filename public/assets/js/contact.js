const contactForm = document.getElementById('contact-form');
contactForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!contactForm.reportValidity()) return;

  const formData = new FormData(contactForm);
  const name = String(formData.get('name')).trim();
  const email = String(formData.get('email')).trim();
  const subject = String(formData.get('subject')).trim();
  const message = String(formData.get('message')).trim();
  const language = document.documentElement.lang === 'en';
  const mailSubject = encodeURIComponent(`${subject} — ${name}`);
  const mailBody = encodeURIComponent(`${language ? 'Name' : 'Nom'}: ${name}\n${language ? 'Email' : 'E-mail'}: ${email}\n\n${message}`);
  window.location.href = `mailto:arsenenzanzu19@gmail.com?subject=${mailSubject}&body=${mailBody}`;
});

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
    if (element.matches('option')) {
      element.textContent = element.dataset[language];
    } else {
      element.innerHTML = element.dataset[language];
    }
  });
  document.querySelectorAll('.lang-btn').forEach((item) => {
    const isActive = item === button;
    item.classList.toggle('active', isActive);
    item.setAttribute('aria-pressed', String(isActive));
  });
}));
