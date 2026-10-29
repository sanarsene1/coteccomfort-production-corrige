(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const revealSelectors = [
    '.hero-content',
    '.about-grid > *',
    '.about-value-list > .about-value',
    '.about-local',
    '.intro-copy .eyebrow',
    '.intro-copy h2',
    '.intro-copy > p:not(.eyebrow)',
    '.intro-copy .text-link',
    '.section-heading > *',
    '.service-card',
    '.service-footer',
    '.pricing-grid > *',
    '.team-grid > *',
    '.contact-grid > *',
    '.team-directory-heading',
    '.team-person',
    '.contact-heading',
    '.contact-info-card',
    '.contact-location-card',
    '.contact-form',
    '.contact-map-copy',
    '.contact-map-frame',
    '.shop-hero-copy',
    '.shop-hero-meta > div',
    '.shop-search',
    '.shop-filter-wrap',
    '.shop-sidebar-box',
    '.shop-toolbar',
    '.shop-product',
    '.shop-pagination',
    '.detail-hero-content',
    '.detail-section-head',
    '.detail-offer',
    '.detail-access-card',
    '.detail-access-plan',
    '.detail-feature',
    '.detail-step',
    '.detail-cta-card'
  ];
  const selector = revealSelectors.join(',');
  const observed = new WeakSet();
  let previousScrollY = window.scrollY;
  let scrollDirection = 'down';

  function setupReveals() {
    if (reducedMotion.matches) return;
    document.documentElement.classList.add('motion-ready');
    const targets = document.querySelectorAll(selector);
    targets.forEach((element) => {
      if (observed.has(element)) return;
      observed.add(element);
      element.classList.add('scroll-reveal');
      const group = element.parentElement;
      const sameGroup = group ? [...group.children].filter((child) => child.matches?.(selector)) : [];
      const siblingIndex = Math.max(0, sameGroup.indexOf(element));
      element.dataset.revealOrder = String(siblingIndex);
      element.dataset.revealGroupSize = String(sameGroup.length);
      element.style.setProperty('--reveal-delay', `${Math.min(siblingIndex, 5) * 85}ms`);
      observer.observe(element);
    });
  }

  function animateNavigationOnLoad() {
    if (reducedMotion.matches) return;
    const header = document.querySelector('.site-header');
    if (!header) return;
    const items = [
      header.querySelector('.brand'),
      ...header.querySelectorAll('.main-nav > a, .main-nav > .services-nav-item, .main-nav > .nav-end')
    ].filter(Boolean);
    items.forEach((item, index) => {
      item.classList.add('nav-load-in');
      item.style.setProperty('--nav-delay', `${Math.min(index, 8) * 90}ms`);
    });
  }

  const observer = new IntersectionObserver((entries) => {
    const currentScrollY = window.scrollY;
    if (Math.abs(currentScrollY - previousScrollY) > 2) {
      scrollDirection = currentScrollY > previousScrollY ? 'down' : 'up';
      previousScrollY = currentScrollY;
    }
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.dataset.revealDirection = scrollDirection;
        const order = Number(entry.target.dataset.revealOrder || 0);
        const groupSize = Number(entry.target.dataset.revealGroupSize || 1);
        const staggerIndex = scrollDirection === 'up' ? groupSize - order - 1 : order;
        entry.target.style.setProperty('--reveal-delay', `${Math.min(staggerIndex, 5) * 150}ms`);
        entry.target.classList.add('is-visible');
      } else {
        entry.target.classList.remove('is-visible');
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });

  setupReveals();
  animateNavigationOnLoad();

  const contentObserver = new MutationObserver((mutations) => {
    if (mutations.some((mutation) => mutation.addedNodes.length)) setupReveals();
  });
  contentObserver.observe(document.querySelector('main') || document.body, { childList: true, subtree: true });

  if (reducedMotion.matches || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const hero = document.querySelector('.hero');
  if (!hero) return;
  let frame = 0;
  hero.addEventListener('pointermove', (event) => {
    if (frame) return;
    frame = window.requestAnimationFrame(() => {
      const bounds = hero.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - .5;
      const y = (event.clientY - bounds.top) / bounds.height - .5;
      hero.style.setProperty('--pointer-x', `${(x * 22).toFixed(1)}px`);
      hero.style.setProperty('--pointer-y', `${(y * 18).toFixed(1)}px`);
      frame = 0;
    });
  }, { passive: true });
  hero.addEventListener('pointerleave', () => {
    hero.style.setProperty('--pointer-x', '0px');
    hero.style.setProperty('--pointer-y', '0px');
  }, { passive: true });
})();
