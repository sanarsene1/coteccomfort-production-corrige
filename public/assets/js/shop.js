const allProducts = [];
const productsPerPage = 12;
const pageCount = 1;

const params = new URLSearchParams(window.location.search);
let currentPage = Math.min(Math.max(Number(params.get('page')) || 1, 1), pageCount);
const categoryPills = document.getElementById('category-pills');
const grid = document.getElementById('shop-grid');
const pagination = document.getElementById('shop-pagination');
const resultsCount = document.getElementById('results-count');
const categoriesCount = document.getElementById('categories-count');
const priceRange = document.getElementById('price-range');
const showingRange = document.getElementById('showing-range');
const totalItems = document.getElementById('total-items');
const searchInput = document.getElementById('shop-search');
const sortSelect = document.getElementById('shop-sort');

const categories = Array.from(new Set(allProducts.map((product) => product.category))).sort();

function toUsd(value) {
  return Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

function getFilteredProducts() {
  const query = searchInput.value.trim().toLowerCase();
  const selectedCategory = document.querySelector('.category-pill.is-active')?.dataset.category || 'all';
  const base = allProducts.filter((product) => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = !query || product.name.toLowerCase().includes(query) || product.category.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const sortValue = sortSelect.value;
  if (sortValue === 'price-low') base.sort((a, b) => a.price - b.price);
  if (sortValue === 'price-high') base.sort((a, b) => b.price - a.price);
  if (sortValue === 'name-asc') base.sort((a, b) => a.name.localeCompare(b.name));
  if (sortValue === 'name-desc') base.sort((a, b) => b.name.localeCompare(a.name));
  return base;
}

function renderCategoryPills() {
  const pills = ['all', ...categories];
  categoryPills.innerHTML = pills.map((category) => {
    const isActive = (document.querySelector('.category-pill.is-active')?.dataset.category || 'all') === category;
    const label = category === 'all' ? 'All' : category;
    return `<button type="button" class="category-pill ${isActive ? 'is-active' : ''}" data-category="${category}">${label}</button>`;
  }).join('');

  categoryPills.querySelectorAll('.category-pill').forEach((button) => {
    button.addEventListener('click', () => {
      categoryPills.querySelectorAll('.category-pill').forEach((pill) => pill.classList.toggle('is-active', pill === button));
      currentPage = 1;
      render();
    });
  });
}

function renderProducts() {
  const filteredProducts = getFilteredProducts();
  const availablePages = Array.from(new Set(filteredProducts.map((product) => product.page)));
  const pages = availablePages.length ? availablePages : [1];
  if (!pages.includes(currentPage)) currentPage = pages[0];
  const page = currentPage;
  const pageProducts = filteredProducts.filter((product) => product.page === page);

  if (!filteredProducts.length) {
    grid.innerHTML = `
      <div class="shop-empty-state">
        <div>
          <h2>Notre boutique sera bientôt en ligne</h2>
          <p>Notre boutique est actuellement en cours de préparation. Pour toute demande, contactez directement notre équipe sur WhatsApp.</p>
          <a href="#" data-whatsapp-key="shop_inquiry" data-whatsapp-fallback="Bonjour COTEC, je souhaite en savoir plus sur la boutique." target="_blank" rel="noopener noreferrer">Parler à un conseiller</a>
        </div>
      </div>
    `;
    showingRange.textContent = '0-0';
    totalItems.textContent = '0';
    resultsCount.textContent = '0';
    categoriesCount.textContent = '0';
    priceRange.textContent = '$0 - $0';
    pagination.innerHTML = '';
    return;
  }

  grid.innerHTML = pageProducts.map((product) => `
    <article class="shop-product">
      <div class="shop-product-media">
        <img src="${product.image}" alt="${product.name}" loading="lazy">
        ${product.discount ? `<span class="shop-badge">-${product.discount}%</span>` : ''}
      </div>
      <div class="shop-product-body">
        <div class="shop-product-brand"><span>${product.brand || 'COTEC'}</span><strong>${product.category}</strong></div>
        <h3 class="shop-product-title">${product.name}</h3>
        ${product.description ? `<p class="shop-product-description">${product.description}</p>` : ''}
        <div class="shop-stock ${product.stockStatus === 'Low Stock' ? 'is-low' : ''}">${product.stockStatus || 'In Stock'}</div>
        <div class="shop-price"><strong>${toUsd(product.price)}</strong>${product.oldPrice ? `<span>${toUsd(product.oldPrice)}</span>` : ''}</div>
        <div class="shop-actions">
          <a class="shop-icon-action shop-view-action" href="#" data-whatsapp-key="product_inquiry" data-whatsapp-fallback="Bonjour COTEC, je souhaite plus d’informations sur ce produit." data-whatsapp-extra="\nProduit : ${product.name}" target="_blank" rel="noopener" aria-label="Voir ${product.name}" title="View">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5c-5.2 0-9.2 4.3-10.7 6.2a1.3 1.3 0 0 0 0 1.6C2.8 14.7 6.8 19 12 19s9.2-4.3 10.7-6.2a1.3 1.3 0 0 0 0-1.6C21.2 9.3 17.2 5 12 5Zm0 11.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9Zm0-2a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/></svg>
          </a>
          <a class="shop-icon-action shop-whatsapp-action" href="#" data-whatsapp-key="product_inquiry" data-whatsapp-fallback="Bonjour COTEC, je souhaite plus d’informations sur ce produit." data-whatsapp-extra="\nProduit : ${product.name}" target="_blank" rel="noopener" aria-label="Contacter COTEC sur WhatsApp pour ${product.name}" title="WhatsApp">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.04 2a9.9 9.9 0 0 0-8.53 14.92L2.2 22l5.2-1.36A9.95 9.95 0 1 0 12.04 2Zm0 17.9a7.9 7.9 0 0 1-4.02-1.1l-.29-.17-3.09.81.82-3.01-.19-.31a7.9 7.9 0 1 1 6.77 3.78Zm4.34-5.92c-.24-.12-1.43-.71-1.65-.79-.22-.08-.38-.12-.54.12-.16.24-.62.79-.76.95-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.01-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.19-.46-.39-.4-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.33.98 2.49c.12.16 1.69 2.58 4.09 3.62.57.25 1.02.39 1.37.5.58.18 1.11.16 1.53.1.47-.07 1.43-.58 1.63-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28Z"/></svg>
          </a>
        </div>
      </div>
    </article>
  `).join('');

  const startIndex = pageProducts.length
    ? filteredProducts.filter((product) => product.page < page).length + 1
    : 0;
  const endIndex = startIndex ? startIndex + pageProducts.length - 1 : 0;
  showingRange.textContent = `${startIndex}-${endIndex}`;
  totalItems.textContent = String(filteredProducts.length);

  pagination.innerHTML = pages.map((pageNumber) => `
    <button type="button" class="shop-page-btn ${pageNumber === page ? 'is-active' : ''}" data-page="${pageNumber}" ${pageNumber === page ? 'aria-current="page"' : ''}>${pageNumber}</button>
  `).join('');

  pagination.querySelectorAll('.shop-page-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const newPage = Number(button.dataset.page);
      currentPage = newPage;
      const url = new URL(window.location.href);
      url.searchParams.set('page', String(newPage));
      window.history.replaceState({}, '', url);
      render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  resultsCount.textContent = String(filteredProducts.length);
  categoriesCount.textContent = String(categories.length);
  const minPrice = filteredProducts.length ? Math.min(...filteredProducts.map((item) => item.price)) : 0;
  const maxPrice = filteredProducts.length ? Math.max(...filteredProducts.map((item) => item.price)) : 0;
  priceRange.textContent = `${toUsd(minPrice)} - ${toUsd(maxPrice)}`;
}

function render() {
  renderCategoryPills();
  renderProducts();
}

searchInput.addEventListener('input', () => {
  currentPage = 1;
  render();
});
sortSelect.addEventListener('change', render);

render();

if (document.querySelector('.menu-toggle')) {
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    nav.classList.toggle('open', !isOpen);
  });
}

const yearNode = document.getElementById('year');
if (yearNode) yearNode.textContent = new Date().getFullYear();

const shopSort = document.getElementById('shop-sort');
if (shopSort) shopSort.value = 'newest';
