const servicePages = {
  installation: {
    image: 'https://sm.pcmag.com/t/pcmag_me/news/s/spacex-sel/spacex-selling-399-refurbished-starlink-dishes-to-us-users_avh7.1920.jpg',
    eyebrow: { fr: 'INSTALLATION · STARLINK · RÉSEAUX', en: 'INSTALLATION · STARLINK · NETWORKS' },
    title: { fr: 'Une installation soignée.<br><em>Une connexion prête à servir.</em>', en: 'Installed with care.<br><em>Ready to connect.</em>' },
    intro: { fr: 'De l’installation de Starlink aux équipements Wi‑Fi et aux liaisons réseau sans fil, nous mettons en place des solutions adaptées à votre domicile, votre commerce ou votre entreprise. L’installation est entièrement gratuite, et notre équipe vous accompagne dans le choix du matériel, son installation et sa configuration pour vous offrir une connexion adaptée à vos besoins.', en: 'From Starlink installation to Wi‑Fi equipment and wireless network links, we set up solutions tailored to your home, shop or business. Installation is completely free, and our team supports you in choosing the right equipment, installing it and configuring it so you get a connection suited to your needs.' },
    offerLabel: { fr: '', en: '' },
    offers: [
      { name: 'Starlink Mini', price: '350', oldPrice: '390', text: { fr: 'Un kit compact et facile à déplacer, adapté à la maison, à une boutique ou à un petit bureau. Une solution pratique lorsque vous recherchez flexibilité et simplicité.', en: 'A compact, portable kit suited to a home, shop or small office. A practical option when flexibility and simplicity matter.' }, badge: { fr: 'COMPACT · FACILE À DÉPLACER', en: 'COMPACT · PORTABLE' } },
      { name: 'Starlink Standard', price: '490', oldPrice: '530', text: { fr: 'Un kit pensé pour une installation à la maison ou dans un espace professionnel. Idéal pour profiter d’une connexion Internet haut débit au quotidien.', en: 'A kit designed for installation at home or in a professional space. A great fit for everyday high-speed internet.' }, badge: { fr: 'MAISON · USAGE QUOTIDIEN', en: 'HOME · EVERYDAY USE' } }
    ],
    priceNote: null,
    featuresTitle: { fr: 'Votre installation, étape par étape', en: 'Your installation, step by step' },
    featuresLead: { fr: '', en: '' },
    features: [
      { title: { fr: 'Étude et emplacement', en: 'Site and placement' }, text: { fr: 'Vérification de la vue du ciel, du support et du meilleur emplacement pour l’antenne.', en: 'Check of sky visibility, mounting surface and best antenna location.' } },
      { title: { fr: 'Pose et alignement', en: 'Mounting and alignment' }, text: { fr: 'Fixation adaptée au site et orientation de l’équipement pour un signal stable.', en: 'Site-appropriate mounting and equipment alignment for a stable signal.' } },
      { title: { fr: 'Câblage propre', en: 'Neat cabling' }, text: { fr: 'Passage et protection des câbles, avec une installation nette à la maison ou au commerce.', en: 'Cable routing and protection, neatly installed at home or in your business.' } },
      { title: { fr: 'Configuration et tests', en: 'Setup and testing' }, text: { fr: 'Configuration du routeur et du Wi-Fi, test de vitesse et conseils de prise en main.', en: 'Router and Wi-Fi setup, speed test and practical guidance.' } }
    ],
    stepsTitle: { fr: 'Comment ça se passe', en: 'How it works' },
    steps: [
      { title: { fr: 'Parlons de votre projet', en: 'Tell us about your project' }, text: { fr: 'Envoyez votre localisation et précisez si vous avez déjà acheté le kit.', en: 'Send your location and tell us whether you already have a kit.' } },
      { title: { fr: 'Visite et préparation', en: 'Site visit and planning' }, text: { fr: 'Nous convenons d’un rendez-vous et vérifions les besoins du site.', en: 'We arrange a visit and assess what your site needs.' } },
      { title: { fr: 'Installation', en: 'Installation' }, text: { fr: 'Nous posons, alignons et configurons le système avec soin.', en: 'We mount, align and configure the system with care.' } },
      { title: { fr: 'Connexion en service', en: 'You’re online' }, text: { fr: 'Nous testons le réseau avec vous avant la fin de l’intervention.', en: 'We test the network with you before wrapping up.' } }
    ],
    ctaTitle: { fr: 'Prêt à planifier votre installation ?', en: 'Ready to plan your installation?' },
    ctaText: { fr: 'Parlez-nous de votre adresse, de votre kit et du type de bâtiment. Nous vous répondrons sur WhatsApp.', en: 'Tell us your location, kit and building type. We’ll reply on WhatsApp.' },
    whatsapp: 'Bonjour COTEC, je souhaite planifier une installation Starlink.\nLocalisation : ____\nKit : Mini / Standard / déjà acheté\nType de site : maison / boutique / bureau'
  },
  maintenance: {
    image: '/assets/img/IMG_on_cotec13.jpg',
    imagePosition: 'center 42%',
    eyebrow: { fr: 'ASSISTANCE · MAINTENANCE · DÉPANNAGE', en: 'SUPPORT · MAINTENANCE · REPAIRS' },
    title: { fr: 'Un problème technique ?<br><em>Nous sommes là pour vous aider.</em>', en: 'A technical issue?<br><em>We are here to help.</em>' },
    intro: { fr: 'Profitez d’une maintenance gratuite en tant qu’abonné COTEC. Notre équipe vous accompagne pour rétablir le bon fonctionnement de vos équipements réseau.', en: 'Enjoy free maintenance as a COTEC subscriber. Our team supports you in restoring your network equipment to proper working order.' },
    offerLabel: { fr: 'NOS INTERVENTIONS', en: 'WHAT WE SERVICE' },
    offers: [
      { name: { fr: 'Maintenance pour abonnés COTEC', en: 'Maintenance for COTEC subscribers' }, price: { fr: 'Gratuit', en: 'Free' }, text: { fr: 'Un problème avec votre connexion après l’installation ? Un ingénieur vérifie le matériel et intervient sans frais pour les abonnés COTEC.', en: 'Having connection trouble after installation? An engineer checks the equipment and carries out maintenance at no charge for COTEC subscribers.' }, badge: { fr: 'INCLUS POUR LES ABONNÉS', en: 'INCLUDED FOR SUBSCRIBERS' } },
      { name: { fr: 'Intervention hors abonnement', en: 'Service without a subscription' }, price: { fr: 'Sur devis', en: 'Quote' }, text: { fr: 'Nous diagnostiquons la panne et vous communiquons les frais avant toute intervention.', en: 'We diagnose the problem and confirm any fees before starting work.' }, badge: { fr: 'DEVIS AVANT INTERVENTION', en: 'QUOTE BEFORE SERVICE' } }
    ],
    priceNote: null,
    featuresTitle: { fr: 'Nous entretenons votre installation', en: 'We maintain your installation' },
    featuresLead: { fr: 'Nos ingénieurs interviennent chez vous après l’installation si votre connexion ou votre matériel présente un problème.', en: 'After installation, our engineers can visit your home if your connection or equipment develops a problem.' },
    features: [
      { title: { fr: 'Routeur et Wi-Fi', en: 'Router and Wi-Fi' }, text: { fr: 'Nous vérifions le routeur, la configuration et la couverture Wi-Fi chez vous.', en: 'We check your router, settings and home Wi-Fi coverage.' } },
      { title: { fr: 'Liaison point à point', en: 'Point-to-point link' }, text: { fr: 'Nous inspectons les antennes et équipements Tenda, NanoStation ou LiteBeam.', en: 'We inspect antennas and Tenda, NanoStation or LiteBeam equipment.' } },
      { title: { fr: 'Diagnostic et remise en service', en: 'Diagnosis and repair' }, text: { fr: 'Nous recherchons l’origine de la panne, effectuons la maintenance et testons la connexion avec vous.', en: 'We find the cause, carry out maintenance and test the connection with you.' } }
    ],
    stepsTitle: { fr: 'Comment obtenir une intervention', en: 'How to request service' },
    steps: [
      { title: { fr: 'Contactez COTEC', en: 'Contact COTEC' }, text: { fr: 'Envoyez-nous votre quartier, une photo du matériel et décrivez le problème.', en: 'Send us your neighborhood, a photo of the equipment and a description of the problem.' } },
      { title: { fr: 'Visite de l’ingénieur', en: 'Engineer visit' }, text: { fr: 'Nous convenons d’un rendez-vous et un ingénieur vérifie l’installation chez vous.', en: 'We arrange a visit and an engineer checks the installation at your home.' } },
      { title: { fr: 'Maintenance et test', en: 'Maintenance and testing' }, text: { fr: 'Nous réparons ou réglons ce qui ne va pas, puis vérifions la connexion. C’est gratuit pour les abonnés COTEC.', en: 'We repair or adjust the faulty equipment, then test the connection. This is free for COTEC subscribers.' } }
    ],
    ctaTitle: { fr: 'Un problème technique ?', en: 'A technical problem?' },
    ctaText: { fr: 'Profitez d’une maintenance gratuite en tant qu’abonné COTEC. Notre équipe vous accompagne pour rétablir le bon fonctionnement de vos équipements réseau.', en: 'Enjoy free maintenance as a COTEC subscriber. Our team supports you in restoring your network equipment to proper working order.' },
    whatsapp: 'Bonjour COTEC, je suis abonné(e) et j’ai un problème après l’installation.\nLocalisation / quartier : ____\nÉquipement : routeur / point à point / Tenda / NanoStation / LiteBeam\nProblème constaté : ____'
  },
  abonnement: {
    image: '/assets/img/OMG_on_cotec15.jpg',
    imagePosition: 'center 34%',
    eyebrow: { fr: 'ABONNEMENT & RÉABONNEMENT · BUTEMBO', en: 'INTERNET SUBSCRIPTION & RENEWAL · BUTEMBO' },
    title: { fr: 'Restez connecté,<br><em>chaque jour.</em>', en: 'Stay connected,<br><em>every day.</em>' },
    intro: { fr: 'Choisissez une connexion point à point illimitée ou un abonnement pour votre propre kit Starlink. Nous vérifions la couverture de votre adresse à Butembo avant de confirmer la disponibilité.', en: 'Choose unlimited point-to-point internet or a subscription for your own Starlink kit. We check coverage at your address in Butembo before confirming availability.' },
    offerLabel: { fr: 'SOUSCRIPTION ET RENOUVELLEMENT', en: 'NEW SUBSCRIPTIONS AND RENEWALS' },
    offers: [
      { name: { fr: 'Abonnement point à point', en: 'Point-to-point internet plan' }, price: '30', oldPrice: '50', text: { fr: 'Connexion Internet illimitée à 30 $ par mois sur le réseau point à point COTEC.', en: 'Unlimited internet for $30 per month on COTEC’s point-to-point network.' }, badge: { fr: 'CONNEXION ILLIMITÉE', en: 'UNLIMITED INTERNET' } },
      { name: { fr: 'Abonnement avec votre Starlink', en: 'Subscription with your Starlink kit' }, price: '70', oldPrice: '100', text: { fr: 'Vous possédez déjà votre kit Starlink ? Profitez de l’abonnement à 70 $ par mois.', en: 'Already own your Starlink kit? Get the subscription for $70 per month.' }, badge: { fr: 'KIT STARLINK DU CLIENT', en: 'CUSTOMER-OWNED STARLINK' } }
    ],
    priceNote: null,
    featuresTitle: { fr: 'Deux façons de rester connecté', en: 'Two ways to stay connected' },
    featuresLead: { fr: 'Choisissez la connexion point à point illimitée ou utilisez votre propre kit Starlink.', en: 'Choose unlimited point-to-point internet or use your own Starlink kit.' },
    features: [
      { title: { fr: 'Point à point illimité · 30 $/mois', en: 'Unlimited point-to-point · $30/month' }, text: { fr: 'Connexion illimitée sur le réseau COTEC, sous réserve de couverture à votre adresse.', en: 'Unlimited connection on the COTEC network, subject to coverage at your address.' } },
      { title: { fr: 'Votre kit Starlink · 70 $/mois', en: 'Your Starlink kit · $70/month' }, text: { fr: 'Gardez votre propre kit Starlink et souscrivez à la formule mensuelle correspondante.', en: 'Use your own Starlink kit and subscribe to the corresponding monthly plan.' } },
      { title: { fr: 'Activation et accompagnement', en: 'Activation and support' }, text: { fr: 'Notre équipe vous guide pour vérifier votre adresse, démarrer la formule et obtenir de l’assistance.', en: 'Our team helps check your address, start your plan and get support.' } }
    ],
    stepsTitle: { fr: 'Pour vous abonner', en: 'How to subscribe' },
    steps: [
      { title: { fr: 'Envoyez votre quartier', en: 'Share your area' }, text: { fr: 'Indiquez votre adresse ou un repère proche à Butembo.', en: 'Share your address or a nearby landmark in Butembo.' } },
      { title: { fr: 'Vérifions la couverture', en: 'We check coverage' }, text: { fr: 'Nous vous répondons sur la disponibilité et les options.', en: 'We’ll reply with availability and options.' } },
      { title: { fr: 'Choisissez votre formule', en: 'Choose a plan' }, text: { fr: 'Nous confirmons ensemble le tarif, le matériel et les frais de départ.', en: 'We confirm the plan, equipment and initial costs together.' } },
      { title: { fr: 'Activation', en: 'Activation' }, text: { fr: 'Nous convenons de la mise en service et vous guidons pour démarrer.', en: 'We arrange service activation and guide you through getting started.' } }
    ],
    ctaTitle: { fr: 'Vérifiez votre couverture', en: 'Check your coverage' },
    ctaText: { fr: 'Envoyez votre localisation sur WhatsApp et notre équipe vous indiquera les possibilités.', en: 'Send your location on WhatsApp and our team will tell you what’s available.' },
    whatsapp: 'Bonjour COTEC, je souhaite vérifier la couverture Internet.\nLocalisation / quartier : ____\nUsage : maison / boutique / bureau'
  }
};

const translations = (value, language) => typeof value === 'string' ? value : value[language];
const params = new URLSearchParams(window.location.search);
const serviceKey = params.get('service') in servicePages ? params.get('service') : 'installation';
const language = { value: document.documentElement.lang === 'en' ? 'en' : 'fr' };
const page = servicePages[serviceKey];
const root = document.querySelector('#service-detail');

function renderPage() {
  const lang = language.value;
  const t = (value) => translations(value, lang);
  const quote = encodeURIComponent(page.whatsapp);
  const offers = page.offers.map((offer, index) => {
    const offerExtra = serviceKey === 'installation'
      ? `\nKit souhaité : ${t(offer.name)}`
      : serviceKey === 'abonnement'
        ? `\nFormule souhaitée : ${t(offer.name)}\nTarif : ${offer.price} $/mois`
        : '';
    const offerAction = serviceKey === 'installation'
      ? `${lang === 'fr' ? 'Choisir' : 'Choose'} ${t(offer.name)}`
      : (lang === 'fr' ? 'Demander cette formule' : 'Ask about this option');
    return `
    <article class="detail-offer ${index === 0 ? 'detail-offer-featured' : ''}">
      <span class="detail-offer-badge">${t(offer.badge)}</span>
      <h3>${t(offer.name)}</h3>
      <div class="detail-price">${typeof offer.price === 'string' && /^\d+$/.test(offer.price) ? `<span class="detail-currency">$</span>${offer.price}${serviceKey === 'abonnement' && offer.oldPrice ? `<del class="detail-old-price">$${offer.oldPrice}</del>` : ''}${serviceKey === 'abonnement' ? `<small>${lang === 'fr' ? '/ mois' : '/ month'}</small>` : ''}` : t(offer.price)}</div>
      <p>${t(offer.text)}</p>
      <a class="detail-text-link" href="#" data-whatsapp-key="${serviceKey === 'abonnement' ? 'subscription_request' : serviceKey === 'maintenance' ? 'maintenance_issue' : 'plan_installation'}" data-whatsapp-fallback="${serviceKey === 'abonnement' ? 'Bonjour COTEC, je souhaite m’abonner à Internet.' : serviceKey === 'maintenance' ? 'Bonjour COTEC, je suis abonné(e) et j’ai un problème après l’installation.' : 'Bonjour COTEC, je souhaite planifier une installation.'}" data-whatsapp-extra="${offerExtra.replace(/"/g, '&quot;')}" target="_blank" rel="noopener">${offerAction} <span>↗</span></a>
    </article>`;
  }).join('');
  const features = page.features.map((item, index) => `
    <article class="detail-feature"><span class="detail-feature-number">0${index + 1}</span><div><h3>${t(item.title)}</h3><p>${t(item.text)}</p></div></article>`).join('');
  const steps = page.steps.map((item, index) => `
    <article class="detail-step"><span>0${index + 1}</span><h3>${t(item.title)}</h3><p>${t(item.text)}</p></article>`).join('');

  root.innerHTML = `
    <section class="detail-hero" style="--detail-image:url('${page.image}');--detail-image-position:${page.imagePosition || 'center 48%'}">
      <div class="detail-hero-shade"></div>
      <div class="detail-shell detail-hero-content">
        <p class="detail-eyebrow"><span></span>${t(page.eyebrow)}</p>
        <h1>${t(page.title)}</h1>
        <p class="detail-lead">${t(page.intro)}</p>
        <div class="detail-actions"><a class="detail-button detail-button-lime" href="#" data-whatsapp-key="service_quote" data-whatsapp-fallback="Bonjour COTEC, je souhaite demander un devis." target="_blank" rel="noopener">${lang === 'fr' ? 'Demander un devis sur WhatsApp' : 'Request a quote on WhatsApp'} <span>↗</span></a><a class="detail-button detail-button-glass" href="#offres">${lang === 'fr' ? 'Voir les offres' : 'View options'} ↓</a></div>
        <div class="detail-hero-location"><span class="detail-live-dot"></span>${lang === 'fr' ? 'Butembo · Nord-Kivu, RDC' : 'Butembo · North Kivu, DRC'}</div>
      </div>
      <div class="detail-hero-index">CT / ${serviceKey.toUpperCase()}</div>
    </section>

    <section class="detail-offers-section" id="offres">
      <div class="detail-shell">
        <div class="detail-section-head"><div>${page.offerLabel && page.offerLabel.fr ? `<p class="detail-kicker">${t(page.offerLabel)}</p>` : ''}<h2>${serviceKey === 'installation' ? (lang === 'fr' ? 'NOS SOLUTIONS STARLINK' : 'OUR STARLINK SOLUTIONS') : (lang === 'fr' ? 'Une solution claire,<br><em>adaptée à votre besoin.</em>' : 'A clear option,<br><em>built around your needs.</em>')}</h2></div>${serviceKey === 'installation' ? `<p class="detail-section-copy">${lang === 'fr' ? '<strong>Le bon kit.</strong><br><strong>La connexion qu’il vous faut.</strong>' : '<strong>The right kit.</strong><br><strong>The connection you need.</strong>'}</p>` : ''}</div>
        <div class="detail-offer-grid">${offers}</div>
        ${page.priceNote ? `<p class="detail-price-note"><span>i</span>${t(page.priceNote)}</p>` : ''}
      </div>
    </section>

    ${serviceKey === 'installation' ? `
    <section class="detail-access-section">
      <div class="detail-shell">
        <div class="detail-section-head detail-access-head">
          <div>
            <p class="detail-kicker">S’ABONNER</p>
            <h2>Réseaux point à point<br><em>sans dépendre de Starlink.</em></h2>
          </div>
          <p class="detail-section-copy">À partir de 30 $ par mois, profitez d’une connexion fiable via nos solutions de réseau point à point, pour rester connecté sans passer par Starlink.</p>
        </div>

        <div class="detail-access-grid">
          <article class="detail-access-card">
            <img src="https://nycmesh-docs.netlify.app/img/typicalInstall/lbelongpole.jpg" alt="Tenda" />
            <div class="detail-access-body">
              <h3>Réseau domestique fiable</h3>
              <p>Une solution simple pour maison, boutique ou site de petite taille.</p>
            </div>
          </article>

          <article class="detail-access-card">
            <img src="https://d1okf4ta8xniw3.cloudfront.net/original/2X/9/987c6e6a82b80f6969caf72afcbc0ee0efec5be2.jpeg" alt="Cambium" />
            <div class="detail-access-body">
              <h3>Infrastructure professionnelle</h3>
              <p>Une base robuste pour des réseaux plus exigeants et plus stables.</p>
            </div>
          </article>

          <article class="detail-access-card">
            <img src="https://miro.medium.com/v2/resize:fit:720/format:webp/0*zmnpVm-Jr98Ms3zC" alt="LiteBeam" />
            <div class="detail-access-body">
              <h3>Connexion longue portée</h3>
              <p>Pour couvrir efficacement les zones éloignées ou difficiles d’accès.</p>
            </div>
          </article>

          <article class="detail-access-card">
            <img src="https://www.nycmesh.net/img/nsm5/roof-87.jpg" alt="NanoStation" />
            <div class="detail-access-body">
              <h3>Liens point à point</h3>
              <p>Parfait pour relier des points de service ou des sites distants.</p>
            </div>
          </article>
        </div>

        <div class="detail-access-plan">
          <div>
            <p class="detail-access-plan-label">Abonnement</p>
            <strong>30 $ / mois</strong>
          </div>
          <a class="detail-button detail-button-lime" href="#" data-whatsapp-key="subscription_request" data-whatsapp-fallback="Bonjour COTEC, je souhaite m’abonner à Internet." target="_blank" rel="noopener">S’abonner <span>↗</span></a>
        </div>
      </div>
    </section>
    ` : ''}

    <section class="detail-features-section ${serviceKey === 'abonnement' ? 'detail-features-subscription' : ''}">
      <div class="detail-shell detail-features-grid">
        <div class="detail-features-intro"><p class="detail-kicker">${lang === 'fr' ? 'LE SAVOIR-FAIRE COTEC' : 'COTEC EXPERTISE'}</p><h2>${t(page.featuresTitle)}</h2>${page.featuresLead && t(page.featuresLead) ? `<p>${t(page.featuresLead)}</p>` : ''}<a class="detail-text-link" href="#" data-whatsapp-key="technician_help" data-whatsapp-fallback="Bonjour COTEC, je viens du site et je souhaite parler à un technicien." target="_blank" rel="noopener">${lang === 'fr' ? 'Échanger avec un technicien' : 'Talk to a technician'} <span>↗</span></a></div>
        <div class="detail-feature-list">${features}</div>
      </div>
    </section>

    <section class="detail-process-section">
      <div class="detail-shell"><div class="detail-section-head detail-process-head"><div><p class="detail-kicker">${lang === 'fr' ? 'SIMPLE ET TRANSPARENT' : 'SIMPLE AND CLEAR'}</p><h2>${t(page.stepsTitle)}</h2></div>${serviceKey === 'installation' ? `<p>${lang === 'fr' ? 'Vous savez à quoi vous attendre avant que nous commencions.' : 'You know what to expect before we begin.'}</p>` : ''}</div><div class="detail-steps">${steps}</div></div>
    </section>

    <section class="detail-cta-section">
      <div class="detail-shell detail-cta-card"><div><p class="detail-kicker">COTEC · BUTEMBO</p><h2>${t(page.ctaTitle)}</h2><p>${t(page.ctaText)}</p></div><a class="detail-button detail-button-lime" href="#" data-whatsapp-key="${serviceKey === 'abonnement' ? 'subscription_request' : serviceKey === 'maintenance' ? 'maintenance_issue' : 'plan_installation'}" data-whatsapp-fallback="${serviceKey === 'abonnement' ? 'Bonjour COTEC, je souhaite m’abonner à Internet.' : serviceKey === 'maintenance' ? 'Bonjour COTEC, je suis abonné(e) et j’ai un problème après l’installation.' : 'Bonjour COTEC, je souhaite planifier une installation.'}" target="_blank" rel="noopener">${lang === 'fr' ? 'Réserver sur WhatsApp' : 'Book on WhatsApp'} <span>↗</span></a></div>
    </section>`;

  document.title = `${t(page.eyebrow)} — COMFORT TECHNOLOGIES COTEC`;
  document.documentElement.lang = lang;
  document.querySelectorAll('.lang-btn').forEach((button) => {
    const active = button.dataset.lang === lang;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  document.querySelectorAll('[data-fr][data-en]').forEach((element) => {
    element.innerHTML = element.dataset[lang];
  });
}

const mobileToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#detail-nav');
const servicesNavItem = document.querySelector('.services-nav-item');
const servicesMenuToggle = document.querySelector('.services-menu-toggle');
const servicesMenu = document.querySelector('#services-menu');

function setServicesMenuOpen(isOpen) {
  if (!servicesMenu || !servicesMenuToggle) return;
  servicesMenuToggle.setAttribute('aria-expanded', String(isOpen));
  servicesMenu.hidden = !isOpen;
}

if (servicesNavItem && servicesMenuToggle && servicesMenu) {
  const servicesMenuCanHover = window.matchMedia('(hover: hover) and (pointer: fine)');
  servicesNavItem.addEventListener('pointerenter', (event) => {
    if (servicesMenuCanHover.matches && event.pointerType !== 'touch') setServicesMenuOpen(true);
  });
  servicesNavItem.addEventListener('pointerleave', (event) => {
    if (servicesMenuCanHover.matches && event.pointerType !== 'touch') setServicesMenuOpen(false);
  });
  servicesMenuToggle.addEventListener('focus', () => setServicesMenuOpen(true));
  servicesNavItem.addEventListener('focusout', (event) => {
    if (!servicesNavItem.contains(event.relatedTarget)) setServicesMenuOpen(false);
  });
  servicesMenuToggle.addEventListener('click', (event) => {
    event.stopPropagation();
    setServicesMenuOpen(servicesMenuToggle.getAttribute('aria-expanded') !== 'true');
  });
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.services-nav-item')) setServicesMenuOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setServicesMenuOpen(false);
  });
  servicesMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setServicesMenuOpen(false)));
}

mobileToggle.addEventListener('click', () => {
  const isOpen = mobileToggle.getAttribute('aria-expanded') === 'true';
  mobileToggle.setAttribute('aria-expanded', String(!isOpen));
  mobileToggle.setAttribute('aria-label', isOpen ? 'Ouvrir le menu' : 'Fermer le menu');
  nav.classList.toggle('open', !isOpen);
});
nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  nav.classList.remove('open');
  mobileToggle.setAttribute('aria-expanded', 'false');
}));
document.querySelectorAll('.lang-btn').forEach((button) => button.addEventListener('click', () => {
  language.value = button.dataset.lang;
  renderPage();
}));
document.querySelector('#year').textContent = new Date().getFullYear();
renderPage();

document.querySelectorAll('a[href*="wa.me/243970695281"]').forEach((link) => {
  link.href = link.href.replace('243970695281', '243817483857');
  link.setAttribute('aria-label', 'Contacter COTEC sur WhatsApp au +243 817 483 857');
  link.title = 'WhatsApp · +243 817 483 857';
});
