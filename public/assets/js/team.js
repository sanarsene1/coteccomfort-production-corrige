const teamMembers = [
  { name: 'Désiré Kambale', role: 'Directeur Général', type: 'Direction', image: 'https://images.pexels.com/photos/31647492/pexels-photo-31647492.jpeg?auto=compress&cs=tinysrgb&w=1000' },
  { name: 'Priscille Muhindo', role: 'Responsable Technique', type: 'Direction', image: 'https://images.pexels.com/photos/38670854/pexels-photo-38670854.jpeg?auto=compress&cs=tinysrgb&w=1000' },
  { name: 'David Musafiri', role: 'Responsable Commercial', type: 'Direction', image: 'https://images.pexels.com/photos/4797689/pexels-photo-4797689.jpeg?auto=compress&cs=tinysrgb&w=1000' },
  { name: 'Grâce Kavira', role: 'Responsable Marketing', type: 'Direction', image: 'https://images.pexels.com/photos/31307734/pexels-photo-31307734.jpeg?auto=compress&cs=tinysrgb&w=1000' },
  { name: 'Patrick Vahira', role: 'Responsable Financier', type: 'Direction', image: 'https://images.pexels.com/photos/9363531/pexels-photo-9363531.jpeg?auto=compress&cs=tinysrgb&w=1000' },
  { name: 'Esther Mulindwa', role: 'Responsable RH', type: 'Direction', image: 'https://images.pexels.com/photos/38670858/pexels-photo-38670858.jpeg?auto=compress&cs=tinysrgb&w=1000' },
  { name: 'Jean Silso', role: 'Responsable Juridique', type: 'Direction', image: 'https://images.pexels.com/photos/11189139/pexels-photo-11189139.jpeg?auto=compress&cs=tinysrgb&w=1000' },
  { name: 'Emmanuel Paluku', role: 'Technicien Réseau', type: 'Équipe', image: 'https://images.pexels.com/photos/29138334/pexels-photo-29138334.jpeg?auto=compress&cs=tinysrgb&w=1000' },
  { name: 'Kevin Kasereka', role: 'Technicien Réseau', type: 'Équipe', image: 'https://images.pexels.com/photos/36773804/pexels-photo-36773804.jpeg?auto=compress&cs=tinysrgb&w=1000' },
  { name: 'Chantal Muliwaho', role: 'Commerciale de vente', type: 'Équipe', image: 'https://images.pexels.com/photos/3727474/pexels-photo-3727474.jpeg?auto=compress&cs=tinysrgb&w=1000' },
  { name: 'Aline Kahindo', role: 'Spécialiste Marketing', type: 'Équipe', image: 'https://images.pexels.com/photos/37118089/pexels-photo-37118089.jpeg?auto=compress&cs=tinysrgb&w=1000' },
  { name: 'Faustin Kisonia', role: 'Comptable', type: 'Équipe', image: 'https://images.pexels.com/photos/6077664/pexels-photo-6077664.jpeg?auto=compress&cs=tinysrgb&w=1000' },
  { name: 'Sarah Kyakimwa', role: 'Recrutement', type: 'Équipe', image: 'https://images.pexels.com/photos/5915235/pexels-photo-5915235.jpeg?auto=compress&cs=tinysrgb&w=1000' },
  { name: 'Maître André Vunabandi', role: 'Juriste', type: 'Équipe', image: 'https://images.pexels.com/photos/7109089/pexels-photo-7109089.jpeg?auto=compress&cs=tinysrgb&w=1000' }
];

const peopleGrid = document.getElementById('team-people');
peopleGrid.innerHTML = teamMembers.map((member, index) => `
  <article class="team-person ${index === 0 ? 'is-director' : ''}">
    <div class="team-person-photo">
      <img src="${member.image}" alt="Portrait illustratif pour ${member.name}, ${member.role}" loading="lazy">
      <span class="team-person-number">${String(index + 1).padStart(2, '0')}</span>
      <span class="team-person-level">${member.type}</span>
    </div>
    <div class="team-person-content">
      <h3>${member.name}</h3>
      <p>${member.role}</p>
    </div>
  </article>
`).join('');

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

const languageButtons = document.querySelectorAll('.lang-btn');
languageButtons.forEach((button) => button.addEventListener('click', () => {
  const language = button.dataset.lang;
  document.documentElement.lang = language;
  document.querySelectorAll('[data-fr][data-en]').forEach((element) => {
    element.innerHTML = element.dataset[language];
  });
  languageButtons.forEach((item) => {
    const isActive = item === button;
    item.classList.toggle('active', isActive);
    item.setAttribute('aria-pressed', String(isActive));
  });
}));
