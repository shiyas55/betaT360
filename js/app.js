// TechnoStore360 B2B Dashboard-style Prototype Application Logic

// Global Application State
const appState = {
  comparedProductIds: ['zoho-crm', 'quickbooks'], // default compared
  homeActiveBrand: null,
  wishlist: [],
  filters: {
    search: '',
    category: '',
    brand: [],
    price: '',
    rating: 0,
    deployment: [],
    support: [],
    sort: 'newest'
  },
  aiRecom: {
    step: 1,
    businessType: '',
    budget: '',
    problem: '',
    deployment: '',
    employees: ''
  },
  resellerReferral: {
    payoutMethod: 'Bank Wire',
    customSlug: 'partner_shiyas_94'
  },
  adminState: {
    orders: [...adminDashboardData.recentOrders],
    sellerApprovals: [...adminDashboardData.sellerApprovals],
    refundRequests: [
      { id: "RF-982", client: "Apex Retailers", product: "Retail Kit", amount: "$499.00", status: "Pending", date: "2026-06-09" },
      { id: "RF-981", client: "Innovate LLC", product: "Sophos Security", amount: "$150.00", status: "Approved", date: "2026-06-05" }
    ]
  }
};

// Routing Shell
function parseHash() {
  const hash = window.location.hash || '#home';
  const parts = hash.split('?');
  const route = parts[0];
  const params = {};
  if (parts[1]) {
    parts[1].split('&').forEach(p => {
      const kv = p.split('=');
      params[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1]);
    });
  }
  return { route, params };
}

function renderPage(route, params) {
  const appContainer = document.getElementById('app-container');
  if (appContainer) {
    appContainer.classList.add('page-entering');
  }
  
  // Highlight active link in Left Sidebar
  updateSidebarActiveLink(route);

  // Router dispatcher
  switch (route) {
    case '#home':
      appContainer.innerHTML = getHomeHTML(params);
      setupHomeEvents();
      break;
    case '#listing':
      // pre-fill filter if parameters passed
      if (params.search) appState.filters.search = params.search;
      if (params.category) appState.filters.category = params.category;
      appContainer.innerHTML = getListingHTML();
      setupListingEvents();
      break;
    case '#detail':
      const prodId = params.id || 'zoho-crm';
      appContainer.innerHTML = getDetailHTML(prodId);
      setupDetailEvents(prodId);
      break;
    case '#compare':
      appContainer.innerHTML = getCompareHTML();
      setupCompareEvents();
      break;
    case '#packages':
      appContainer.innerHTML = getPackagesHTML();
      setupPackagesEvents();
      break;
    case '#demo':
      appContainer.innerHTML = getDemoHTML(params);
      setupDemoEvents();
      break;
    case '#reseller':
      appContainer.innerHTML = getResellerHTML();
      setupResellerEvents();
      break;
    case '#admin':
      appContainer.innerHTML = getAdminHTML(params.tab || 'dashboard');
      setupAdminEvents(params.tab || 'dashboard');
      break;
    case '#login':
      appContainer.innerHTML = getLoginHTML();
      setupLoginEvents();
      break;
    default:
      appContainer.innerHTML = `<div class="container section-spacing" style="text-align: center;"><h2>Page Not Found</h2><a href="#home" class="btn btn-primary" style="margin-top: 1rem;">Go Home</a></div>`;
  }

  // Render icons via Lucide
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Update global Header elements
  updateHeaderCounters();
  updateMobileCtaVisibility(route);
  
  // Close mobile navigation panel when routing
  const mobileNav = document.getElementById('mobile-nav-panel');
  if (mobileNav) mobileNav.classList.remove('active');

  // Trigger page transition fade-in
  if (appContainer) {
    void appContainer.offsetHeight; // Reflow
    appContainer.classList.remove('page-entering');
  }

  // Run scroll reveal viewport check
  initScrollReveal();
}

// Update active states on horizontal category navigation and mobile nav links
function updateSidebarActiveLink(route) {
  const currentHash = window.location.hash || '#home';
  
  // Highlight active link in horizontal category bar
  document.querySelectorAll('.category-bar__link').forEach(link => {
    const href = link.getAttribute('href');
    if (currentHash === href || (href !== '#home' && currentHash.startsWith(href))) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Highlight active items in mobile navigation panel
  document.querySelectorAll('.mobile-nav__link').forEach(link => {
    const href = link.getAttribute('href');
    if (currentHash === href || (href !== '#home' && currentHash.startsWith(href))) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Sync Top mode toggle active state
  const toggles = document.querySelectorAll('.pill-tab-btn');
  if (toggles.length > 0) {
    toggles.forEach(t => t.classList.remove('active'));
    if (['#admin', '#reseller'].includes(route)) {
      toggles[1].classList.add('active');
    } else {
      toggles[0].classList.add('active');
    }
  }
}

// Mobile navigation drawer toggle
function toggleMobileNav() {
  const panel = document.getElementById('mobile-nav-panel');
  const btn = document.querySelector('.hamburger-button');
  let backdrop = document.getElementById('mobile-nav-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id = 'mobile-nav-backdrop';
    backdrop.className = 'mobile-nav-backdrop';
    backdrop.addEventListener('click', toggleMobileNav);
    document.body.appendChild(backdrop);
  }
  
  if (panel) {
    const isActive = panel.classList.toggle('active');
    backdrop.classList.toggle('active', isActive);
    document.body.classList.toggle('no-scroll', isActive);
    if (btn) {
      btn.classList.toggle('active', isActive);
    }
  }
}

// Center search box submission
function handleSearchSubmit() {
  const searchBox = document.getElementById('header-search-box');
  if (searchBox) {
    const q = searchBox.value.trim();
    window.location.hash = `#listing?search=${encodeURIComponent(q)}`;
    searchBox.value = '';
  }
}

function updateHeaderCounters() {
  const compCount = document.getElementById('compare-badge-count');
  if (compCount) {
    const count = appState.comparedProductIds.length;
    const prevCount = compCount.innerText;
    compCount.innerText = count;
    compCount.style.display = count > 0 ? 'inline-block' : 'none';
    if (prevCount !== String(count) && count > 0) {
      compCount.classList.remove('badge-pop');
      void compCount.offsetWidth; // Trigger reflow
      compCount.classList.add('badge-pop');
    }
  }
}

function updateMobileCtaVisibility(route) {
  const ctaBar = document.getElementById('mobile-cta-bar');
  if (ctaBar) {
    if (['#detail', '#home', '#listing', '#compare'].includes(route)) {
      ctaBar.style.display = 'flex';
    } else {
      ctaBar.style.display = 'none';
    }
  }
}

// Top mode toggler (Marketplace vs Workspace)
function switchHeaderMode(mode, element) {
  const siblings = element.parentNode.children;
  for (let sibling of siblings) {
    sibling.classList.remove('active');
  }
  element.classList.add('active');
  
  if (mode === 'website') {
    window.location.hash = '#home';
  } else {
    window.location.hash = '#admin';
  }
}

// Global Toast notification
function showToast(message, type = 'success') {
  // Clear any existing toasts to prevent overlapping
  const existing = document.querySelectorAll('.toast-notification');
  existing.forEach(t => t.remove());

  const toast = document.createElement('div');
  toast.className = `toast-notification ${type}`;
  
  let iconName = 'info';
  if (type === 'success') iconName = 'check-circle';
  else if (type === 'error') iconName = 'alert-triangle';
  else if (type === 'warning') iconName = 'alert-circle';
  
  toast.innerHTML = `
    <i data-lucide="${iconName}" style="width: 1rem; height: 1rem;"></i>
    <span>${message}</span>
    <div class="toast-progress"></div>
  `;
  document.body.appendChild(toast);
  
  if (window.lucide) window.lucide.createIcons();
  
  setTimeout(() => {
    toast.classList.add('toast-exit');
    setTimeout(() => toast.remove(), 250);
  }, 2200);
}

// Card click routing to product details page
function navigateToProduct(prodId, event) {
  // If user clicked a button or compare icon inside the card, do not navigate to product page
  if (event.target.closest('.compare-circle-btn') || event.target.closest('.price-circle-badge') || event.target.closest('a.btn') || event.target.closest('button')) {
    return;
  }
  window.location.hash = `#detail?id=${prodId}`;
}

// Global toggle for product compare matrix addition/removal
function toggleCompareState(prodId, btnElement) {
  const idx = appState.comparedProductIds.indexOf(prodId);
  const prod = products.find(p => p.id === prodId);
  
  if (idx > -1) {
    appState.comparedProductIds.splice(idx, 1);
    if (btnElement) btnElement.classList.remove('active');
    showToast(`${prod ? prod.name : prodId} removed from compare`, 'info');
  } else {
    if (appState.comparedProductIds.length >= 4) {
      showToast("Maximum of 4 products can be compared at one time.", "info");
      return;
    }
    appState.comparedProductIds.push(prodId);
    if (btnElement) btnElement.classList.add('active');
    showToast(`${prod ? prod.name : prodId} added to compare`, 'success');
  }
  
  // Update header count and active state
  updateHeaderCounters();
  
  // If we are currently on the compare page, re-render it to keep view in sync
  const hash = window.location.hash || '#home';
  if (hash.startsWith('#compare')) {
    const appContainer = document.getElementById('app-container');
    if (appContainer) {
      appContainer.innerHTML = getCompareHTML();
      if (window.lucide) window.lucide.createIcons();
    }
  }
}

// ----------------------------------------------------
// PAGE 1: HOMEPAGE HTML & LOGIC
// ----------------------------------------------------

// PAGE 1: HOMEPAGE HTML & LOGIC
// ----------------------------------------------------

const homeBrands = [
  { id: 'ZEGOCLOUD', name: 'ZEGOCLOUD', symbol: 'Z' },
  { id: 'Trello', name: 'Trello', symbol: 'T' },
  { id: 'monday.com', name: 'monday.com', symbol: 'M' },
  { id: 'Zoho', name: 'Zoho', symbol: 'Z' },
  { id: 'Atlassian', name: 'Atlassian', symbol: 'A' },
  { id: 'Productboard', name: 'Productboard', symbol: 'P' },
  { id: 'Asana', name: 'Asana', symbol: 'A' },
  { id: 'ClickUp', name: 'ClickUp', symbol: 'C' },
  { id: 'Wrike', name: 'Wrike', symbol: 'W' },
  { id: 'Figma', name: 'Figma', symbol: 'F' }
];


function getHomeHTML(params) {
  // Category cards string
  const categoryHTML = categories.map(cat => `
    <a href="#listing?category=${cat.id}" class="card card-hover" style="padding: 1.25rem; text-decoration: none; display: flex; flex-direction: column; gap: 0.5rem; text-align: left;">
      <div style="background-color: var(--slate-100); width: 2.25rem; height: 2.25rem; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--primary-blue);">
        <i data-lucide="${cat.icon || 'layers'}" style="width: 1.25rem; height: 1.25rem;"></i>
      </div>
      <h3 style="font-size: 1rem; font-weight: 700; color: var(--slate-900);">${cat.title}</h3>
      <p style="font-size: 0.75rem; color: var(--slate-500); line-height: 1.3;">${cat.description}</p>
    </a>
  `).join('');

  // Business solution packages
  const packagesHomeHTML = solutionPackages.slice(0, 3).map(pkg => `
    <div class="card" style="padding: 1.5rem; display: flex; flex-direction: column; justify-content: space-between; border-top: 4px solid var(--primary-blue); border-radius: var(--radius-lg);">
      <div>
        <span class="badge" style="background-color: rgba(0, 82, 255, 0.08); color: var(--primary-blue); margin-bottom: 0.5rem;">${pkg.bestFor}</span>
        <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 0.25rem;">${pkg.name}</h3>
        <p style="font-size: 0.8rem; color: var(--slate-600); margin-bottom: 1rem; line-height: 1.4;">${pkg.description}</p>
        
        <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.35rem; margin-bottom: 1.25rem;">
          ${pkg.included.slice(0, 3).map(inc => `<li style="font-size: 0.75rem; display: flex; align-items: center; gap: 0.35rem;"><i data-lucide="check-circle" style="color: var(--primary-green); width: 0.8rem; height: 0.8rem;"></i> ${inc}</li>`).join('')}
        </ul>
      </div>

      <div style="border-top: 1px solid var(--slate-100); padding-top: 1rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem;">
        <div>
          <span style="font-size: 0.65rem; color: var(--slate-400); font-weight: 600;">PRICING FROM</span>
          <div style="font-size: 1rem; font-weight: 800; color: var(--slate-900);">${pkg.price.split(' ')[0]}</div>
        </div>
        <a href="#demo?package=${pkg.id}" class="btn btn-primary btn-sm">Consultation</a>
      </div>
    </div>
  `).join('');

  return `
    <!-- Top Hero Banner (technostore360.com live style) -->
    <section class="hero-section" style="position: relative; overflow: hidden; border-radius: 32px;">
      <!-- Background Video -->
      <video autoplay loop muted playsinline style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: 1; pointer-events: none;">
        <source src="assets/IMG_0799.MP4" type="video/mp4">
      </video>
      
      <!-- Left side: soft blur plus light white overlay for text readability -->
      <div class="hero-readability-overlay" style="position: absolute; top: 0; left: 0; width: 65%; height: 100%; background: linear-gradient(to right, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.20) 60%, rgba(255, 255, 255, 0) 100%); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); z-index: 2; pointer-events: none; mask-image: linear-gradient(to right, black 60%, transparent 100%); -webkit-mask-image: linear-gradient(to right, black 60%, transparent 100%);"></div>
      
      <!-- Outer edges/border area: subtle blur overlay for a premium hero look -->
      <div class="hero-outer-blur-overlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 32px; z-index: 3; pointer-events: none; backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); mask-image: radial-gradient(circle, transparent 65%, black 100%); -webkit-mask-image: radial-gradient(circle, transparent 65%, black 100%);"></div>
      
      <!-- Soft white inner vignette for smooth border transition -->
      <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 32px; box-shadow: inset 0 0 50px rgba(255, 255, 255, 0.5); z-index: 3; pointer-events: none;"></div>
      
      <div class="hero-section__copy" style="position: relative; z-index: 5;">
        <!-- Pink badge kicker -->
        <div class="hero-kicker-badge">
          <i data-lucide="sparkles" style="width: 0.85rem; height: 0.85rem; color: var(--accent);"></i>
          <span>Your All-in-One Tech Marketplace for Business</span>
        </div>
        
        <h1 class="hero-title">Find, Compare & Choose <br>Smart Business <br><span class="highlight-pink" id="hero-typing-text"></span><span class="typing-cursor">|</span></h1>
        
        <p class="hero-desc">Empower Your Business with the Perfect Software and Technology Solutions. Explore 20,000+ trusted products and solutions across software, hardware, cloud, security, AI tools and more — all in one place.</p>
        
        <!-- Interactive B2B search bar -->
        <div class="hero-search-shell">
          <button class="hero-search-btn" onclick="handleHeroSearchTrigger()"><i data-lucide="search" style="width: 1.15rem; height: 1.15rem; stroke-width: 2.5px;"></i></button>
          <input type="text" id="hero-search-input" placeholder="Search products, software, brands or solutions..." autocomplete="off" onkeydown="if(event.key === 'Enter') handleHeroSearchTrigger()">
          <div class="hero-search-divider"></div>
          <div class="hero-search-category">
            <span>All Categories</span>
            <i data-lucide="chevron-down" style="width: 0.95rem; height: 0.95rem; margin-left: 0.25rem;"></i>
          </div>
        </div>

        <!-- 3-Column Hero Benefits Strip -->
        <div class="hero-benefits-strip reveal-on-scroll-group">
          <div class="hero-benefit-item reveal-on-scroll-child">
            <div class="hero-benefit-icon pink-icon">
              <i data-lucide="box" style="width: 1.15rem; height: 1.15rem;"></i>
            </div>
            <div class="hero-benefit-text">
              <h4 class="counter-val" data-target="20000" data-suffix="+">0+</h4>
              <p>Products</p>
            </div>
          </div>
          <div class="hero-benefit-divider"></div>
          <div class="hero-benefit-item reveal-on-scroll-child">
            <div class="hero-benefit-icon blue-icon">
              <i data-lucide="shield" style="width: 1.15rem; height: 1.15rem;"></i>
            </div>
            <div class="hero-benefit-text">
              <h4 class="counter-val" data-target="500" data-suffix="+">0+</h4>
              <p>Trusted Brands</p>
            </div>
          </div>
          <div class="hero-benefit-divider"></div>
          <div class="hero-benefit-item reveal-on-scroll-child">
            <div class="hero-benefit-icon pink-icon">
              <i data-lucide="users" style="width: 1.15rem; height: 1.15rem;"></i>
            </div>
            <div class="hero-benefit-text">
              <h4 class="counter-val" data-target="12" data-suffix="M+">0M+</h4>
              <p>Business Customers</p>
            </div>
          </div>
        </div>
      </div>


    </section>

    <!-- Trusted By Businesses Bar -->
    <div class="trusted-bar reveal-on-scroll">
      <div class="trusted-bar__title">Trusted by leading <br>businesses worldwide</div>
      <div class="marquee-container">
        <div class="marquee-track">
          <div class="marquee-content">
            <!-- Microsoft SVG Logo -->
            <div class="trust-logo">
              <svg viewBox="0 0 23 23" style="width: 16px; height: 16px; min-width: 16px;">
                <rect x="0" y="0" width="10.5" height="10.5" fill="#f25022"/>
                <rect x="11.5" y="0" width="10.5" height="10.5" fill="#7fba00"/>
                <rect x="0" y="11.5" width="10.5" height="10.5" fill="#00a4ef"/>
                <rect x="11.5" y="11.5" width="10.5" height="10.5" fill="#ffb900"/>
              </svg>
              <span class="trust-logo-text" style="color: #4f5b70; font-weight: 600; font-family: 'Segoe UI', sans-serif; font-size: 0.95rem; margin-left: 5px;">Microsoft</span>
            </div>

            <!-- AWS Logo -->
            <div class="trust-logo" style="flex-direction: column; align-items: flex-start; gap: 0;">
              <div style="display: flex; align-items: baseline; gap: 1px;">
                <span class="trust-logo-text" style="color: #1a222e; font-size: 1.1rem; font-weight: 800; font-family: sans-serif; letter-spacing: -0.5px;">aws</span>
              </div>
              <svg viewBox="0 0 30 6" style="width: 30px; height: 6px; margin-top: -2px;">
                <path d="M2,1 C10,5 20,5 28,1" stroke="#ff9900" stroke-width="2" fill="none" stroke-linecap="round"/>
              </svg>
            </div>

            <!-- Google Cloud SVG Logo -->
            <div class="trust-logo">
              <svg viewBox="0 0 24 24" style="width: 18px; height: 18px; min-width: 18px;">
                <path d="M12.0003 4.7502L18.4953 8.5002L18.4953 15.5002L12.0003 19.2502L5.5053 15.5002L5.5053 8.5002L12.0003 4.7502Z" fill="none" stroke="#4285F4" stroke-width="2"/>
                <path d="M12.0003 4.7502L18.4953 8.5002L12.0003 12.2502L5.5053 8.5002L12.0003 4.7502Z" fill="#EA4335" opacity="0.85"/>
                <path d="M12.0003 12.2502L18.4953 15.5002L12.0003 19.2502L5.5053 15.5002L12.0003 12.2502Z" fill="#34A853" opacity="0.85"/>
                <path d="M5.5053 8.5002L12.0003 12.2502L5.5053 15.5002L5.5053 8.5002Z" fill="#FBBC05" opacity="0.85"/>
              </svg>
              <span class="trust-logo-text" style="color: #4f5b70; font-weight: 600; font-family: 'Segoe UI', sans-serif; font-size: 0.9rem; margin-left: 5px;">Google Cloud</span>
            </div>

            <!-- Dell Technologies -->
            <div class="trust-logo">
              <span style="font-family: 'Segoe UI', sans-serif; font-weight: 700; color: #0076a3; font-size: 0.95rem; letter-spacing: -0.2px;">DELL Technologies</span>
            </div>

            <!-- Palo Alto -->
            <div class="trust-logo" style="gap: 2px;">
              <svg viewBox="0 0 10 16" style="width: 8px; height: 14px; fill: #ec5a29; min-width: 8px;">
                <polygon points="10,0 2,16 0,16 8,0"/>
              </svg>
              <span style="font-family: 'Outfit', sans-serif; font-weight: 800; color: #1a222e; font-size: 1rem; letter-spacing: -0.2px;">paloalto</span>
              <span style="font-family: 'Outfit', sans-serif; font-weight: 400; color: #78829b; font-size: 0.65rem; text-transform: uppercase; align-self: flex-end; margin-bottom: 2px; margin-left: 2px;">networks</span>
            </div>

            <!-- Adobe -->
            <div class="trust-logo">
              <svg viewBox="0 0 30 30" style="width: 18px; height: 18px; fill: #fa0f00; min-width: 18px;">
                <polygon points="19,3 30,27 24.3,27 21.2,20.3 14.8,20.3 11.7,27 6,27"/>
                <polygon points="15,6.5 17.5,12 12.5,12"/>
              </svg>
              <span class="trust-logo-text" style="color: #2c2c2c; font-weight: 800; font-family: 'Clean', sans-serif; font-size: 0.95rem; margin-left: 5px;">Adobe</span>
            </div>
          </div>
          
          <div class="marquee-content" aria-hidden="true">
            <!-- Microsoft SVG Logo -->
            <div class="trust-logo">
              <svg viewBox="0 0 23 23" style="width: 16px; height: 16px; min-width: 16px;">
                <rect x="0" y="0" width="10.5" height="10.5" fill="#f25022"/>
                <rect x="11.5" y="0" width="10.5" height="10.5" fill="#7fba00"/>
                <rect x="0" y="11.5" width="10.5" height="10.5" fill="#00a4ef"/>
                <rect x="11.5" y="11.5" width="10.5" height="10.5" fill="#ffb900"/>
              </svg>
              <span class="trust-logo-text" style="color: #4f5b70; font-weight: 600; font-family: 'Segoe UI', sans-serif; font-size: 0.95rem; margin-left: 5px;">Microsoft</span>
            </div>

            <!-- AWS Logo -->
            <div class="trust-logo" style="flex-direction: column; align-items: flex-start; gap: 0;">
              <div style="display: flex; align-items: baseline; gap: 1px;">
                <span class="trust-logo-text" style="color: #1a222e; font-size: 1.1rem; font-weight: 800; font-family: sans-serif; letter-spacing: -0.5px;">aws</span>
              </div>
              <svg viewBox="0 0 30 6" style="width: 30px; height: 6px; margin-top: -2px;">
                <path d="M2,1 C10,5 20,5 28,1" stroke="#ff9900" stroke-width="2" fill="none" stroke-linecap="round"/>
              </svg>
            </div>

            <!-- Google Cloud SVG Logo -->
            <div class="trust-logo">
              <svg viewBox="0 0 24 24" style="width: 18px; height: 18px; min-width: 18px;">
                <path d="M12.0003 4.7502L18.4953 8.5002L18.4953 15.5002L12.0003 19.2502L5.5053 15.5002L5.5053 8.5002L12.0003 4.7502Z" fill="none" stroke="#4285F4" stroke-width="2"/>
                <path d="M12.0003 4.7502L18.4953 8.5002L12.0003 12.2502L5.5053 8.5002L12.0003 4.7502Z" fill="#EA4335" opacity="0.85"/>
                <path d="M12.0003 12.2502L18.4953 15.5002L12.0003 19.2502L5.5053 15.5002L12.0003 12.2502Z" fill="#34A853" opacity="0.85"/>
                <path d="M5.5053 8.5002L12.0003 12.2502L5.5053 15.5002L5.5053 8.5002Z" fill="#FBBC05" opacity="0.85"/>
              </svg>
              <span class="trust-logo-text" style="color: #4f5b70; font-weight: 600; font-family: 'Segoe UI', sans-serif; font-size: 0.9rem; margin-left: 5px;">Google Cloud</span>
            </div>

            <!-- Dell Technologies -->
            <div class="trust-logo">
              <span style="font-family: 'Segoe UI', sans-serif; font-weight: 700; color: #0076a3; font-size: 0.95rem; letter-spacing: -0.2px;">DELL Technologies</span>
            </div>

            <!-- Palo Alto -->
            <div class="trust-logo" style="gap: 2px;">
              <svg viewBox="0 0 10 16" style="width: 8px; height: 14px; fill: #ec5a29; min-width: 8px;">
                <polygon points="10,0 2,16 0,16 8,0"/>
              </svg>
              <span style="font-family: 'Outfit', sans-serif; font-weight: 800; color: #1a222e; font-size: 1rem; letter-spacing: -0.2px;">paloalto</span>
              <span style="font-family: 'Outfit', sans-serif; font-weight: 400; color: #78829b; font-size: 0.65rem; text-transform: uppercase; align-self: flex-end; margin-bottom: 2px; margin-left: 2px;">networks</span>
            </div>

            <!-- Adobe -->
            <div class="trust-logo">
              <svg viewBox="0 0 30 30" style="width: 18px; height: 18px; fill: #fa0f00; min-width: 18px;">
                <polygon points="19,3 30,27 24.3,27 21.2,20.3 14.8,20.3 11.7,27 6,27"/>
                <polygon points="15,6.5 17.5,12 12.5,12"/>
              </svg>
              <span class="trust-logo-text" style="color: #2c2c2c; font-weight: 800; font-family: 'Clean', sans-serif; font-size: 0.95rem; margin-left: 5px;">Adobe</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Trending Products Grid -->
    <section style="margin-top: 2rem;">
      <div style="display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 1.5rem;">
        <div>
          <span class="section-kicker">TOP TRENDING PRODUCTS</span>
          <h2 style="font-size: 1.5rem; font-weight: 800; margin-top: 0.25rem;">See what's popular and loved by businesses like yours.</h2>
        </div>
        <a href="#listing" class="btn btn-outline btn-sm" style="font-size: 0.75rem;">View All <i data-lucide="arrow-right" style="width: 0.8rem; margin-left: 0.25rem;"></i></a>
      </div>
      <div id="home-trending-grid" class="product-grid product-grid-4"></div>
    </section>

    <!-- Shop by Brand Section -->
    <section style="margin-top: 2rem;">
      <div style="margin-bottom: 1.5rem; text-align: center;">
        <span class="section-kicker">CHOOSE YOUR BRANDS</span>
        <h2 style="font-size: 1.5rem; font-weight: 800; margin-top: 0.25rem;">Leading global brands trusted by millions of businesses.</h2>
        <p style="color: var(--slate-500); font-size: 0.8rem; margin-top: 0.25rem;">Click a brand to filter trending products below.</p>
      </div>
      <div class="brand-strip" id="home-brand-strip"></div>
    </section>

    <!-- Category Section -->
    <section style="margin-top: 2rem;">
      <div style="margin-bottom: 1.5rem;">
        <span class="section-kicker">EXPLORE TOP CATEGORIES</span>
        <h2 style="font-size: 1.5rem; font-weight: 800; margin-top: 0.25rem;">Find the right solution for every need.</h2>
      </div>
      <div class="category-grid">
        ${categoryHTML}
      </div>
    </section>

    <!-- AI-Powered Solutions Banner -->
    <section style="margin-top: 4rem; margin-bottom: 4rem;">
      <a href="#listing?category=ai-tools" style="display: block; width: 100%; border-radius: 28px; overflow: hidden; border: 1px solid var(--slate-200); box-shadow: var(--shadow-sm); transition: transform 0.2s ease, box-shadow 0.2s ease;">
        <img src="assets/chatgpt_image_jun_16.png" alt="AI-Powered Solutions for a Smarter Tomorrow" style="width: 100%; display: block; height: auto; object-fit: cover;">
      </a>
    </section>

    <!-- Solution Bundles Section -->
    <section style="margin-top: 2rem;">
      <div style="margin-bottom: 1.5rem;">
        <span class="section-kicker">SOLUTION BUNDLES</span>
        <h2 style="font-size: 1.5rem; font-weight: 800; margin-top: 0.25rem;">Pre-Configured Business Solution Kits</h2>
      </div>
      <div class="product-grid product-grid-3">
        ${packagesHomeHTML}
      </div>
    </section>

    <!-- AI Recommendation questionnaire Stepper -->
    <section class="card" style="padding: 2.5rem; margin-top: 2.5rem;">
      <div style="text-align: center; margin-bottom: 2rem;">
        <span class="badge" style="background-color: rgba(255,20,100,0.08); color: var(--accent); margin-bottom: 0.5rem; font-size: 0.65rem;">AI STACK WIZARD</span>
        <h2 style="font-size: 1.5rem; margin-bottom: 0.25rem; font-weight: 800;">Get Smart B2B Stack Recommendations</h2>
        <p style="color: var(--slate-500); max-width: 500px; margin: 0 auto; font-size: 0.8rem;">Answer 5 quick questions about your company, budget, and workflows, and our algorithm will suggest optimal tech packs.</p>
      </div>

      <div class="stepper-container" style="background: none; border: none; padding: 0; max-width: 680px; margin: 0 auto;">
        
        <!-- Step indicator header -->
        <div class="stepper-header" style="margin-bottom: 2rem;">
          <div class="step-node active" id="step-indicator-1">1</div>
          <div class="step-node" id="step-indicator-2">2</div>
          <div class="step-node" id="step-indicator-3">3</div>
          <div class="step-node" id="step-indicator-4">4</div>
          <div class="step-node" id="step-indicator-5">5</div>
        </div>

        <form id="ai-recom-form">
          
          <!-- Panel 1: Business Type -->
          <div class="step-panel active" id="step-panel-1">
            <h3 style="margin-bottom: 1rem; text-align: center; font-size: 1.1rem;">What is your business type?</h3>
            <div class="chip-grid">
              <div class="chip-option" data-wizard-field="businessType" data-wizard-value="Startup">
                <i data-lucide="rocket" style="width: 1.5rem; color: var(--accent);"></i>
                <span style="font-size: 0.85rem;">Startup</span>
              </div>
              <div class="chip-option" data-wizard-field="businessType" data-wizard-value="SMB">
                <i data-lucide="building" style="width: 1.5rem; color: var(--accent);"></i>
                <span style="font-size: 0.85rem;">SMB (Mid-Market)</span>
              </div>
              <div class="chip-option" data-wizard-field="businessType" data-wizard-value="Enterprise">
                <i data-lucide="hotel" style="width: 1.5rem; color: var(--accent);"></i>
                <span style="font-size: 0.85rem;">Enterprise</span>
              </div>
            </div>
          </div>

          <!-- Panel 2: Budget -->
          <div class="step-panel" id="step-panel-2">
            <h3 style="margin-bottom: 1rem; text-align: center; font-size: 1.1rem;">What is your budget tier?</h3>
            <div class="chip-grid">
              <div class="chip-option" data-wizard-field="budget" data-wizard-value="Low">
                <i data-lucide="dollar-sign" style="width: 1.5rem; color: var(--primary-green);"></i>
                <span style="font-size: 0.85rem;">Under $100/mo</span>
              </div>
              <div class="chip-option" data-wizard-field="budget" data-wizard-value="Medium">
                <i data-lucide="wallet" style="width: 1.5rem; color: var(--primary-green);"></i>
                <span style="font-size: 0.85rem;">$100-$1000/mo</span>
              </div>
              <div class="chip-option" data-wizard-field="budget" data-wizard-value="Enterprise">
                <i data-lucide="credit-card" style="width: 1.5rem; color: var(--primary-green);"></i>
                <span style="font-size: 0.85rem;">Custom Enterprise</span>
              </div>
            </div>
          </div>

          <!-- Panel 3: Problem -->
          <div class="step-panel" id="step-panel-3">
            <h3 style="margin-bottom: 1rem; text-align: center; font-size: 1.1rem;">What problem do you want to solve?</h3>
            <div class="chip-grid" style="grid-template-columns: repeat(2, 1fr);">
              <div class="chip-option" data-wizard-field="problem" data-wizard-value="collaboration">
                <span style="font-size: 0.85rem;">Communication & Mail</span>
              </div>
              <div class="chip-option" data-wizard-field="problem" data-wizard-value="security">
                <span style="font-size: 0.85rem;">Network Security</span>
              </div>
              <div class="chip-option" data-wizard-field="problem" data-wizard-value="automation">
                <span style="font-size: 0.85rem;">Accounting & Ledger</span>
              </div>
              <div class="chip-option" data-wizard-field="problem" data-wizard-value="ai">
                <span style="font-size: 0.85rem;">AI Adoption</span>
              </div>
            </div>
          </div>

          <!-- Panel 4: Deployment -->
          <div class="step-panel" id="step-panel-4">
            <h3 style="margin-bottom: 1rem; text-align: center; font-size: 1.1rem;">What deployment do you need?</h3>
            <div class="chip-grid">
              <div class="chip-option" data-wizard-field="deployment" data-wizard-value="Cloud">
                <span style="font-size: 0.85rem;">Cloud / SaaS</span>
              </div>
              <div class="chip-option" data-wizard-field="deployment" data-wizard-value="On-Premise">
                <span style="font-size: 0.85rem;">On-Premise Hardware</span>
              </div>
              <div class="chip-option" data-wizard-field="deployment" data-wizard-value="Hybrid">
                <span style="font-size: 0.85rem;">Hybrid Setup</span>
              </div>
            </div>
          </div>

          <!-- Panel 5: Employees -->
          <div class="step-panel" id="step-panel-5">
            <h3 style="margin-bottom: 1rem; text-align: center; font-size: 1.1rem;">How many users/employees?</h3>
            <div class="chip-grid">
              <div class="chip-option" data-wizard-field="employees" data-wizard-value="Under-10"><span>1 - 10 Users</span></div>
              <div class="chip-option" data-wizard-field="employees" data-wizard-value="10-50"><span>10 - 50 Users</span></div>
              <div class="chip-option" data-wizard-field="employees" data-wizard-value="50-250"><span>50 - 250 Users</span></div>
              <div class="chip-option" data-wizard-field="employees" data-wizard-value="250+"><span>250+ Users</span></div>
            </div>
          </div>

          <!-- Controls -->
          <div style="display: flex; justify-content: space-between; border-top: 1px solid var(--slate-100); padding-top: 1rem; margin-top: 1.5rem;">
            <button type="button" class="btn btn-secondary btn-sm" id="ai-prev-btn" style="visibility: hidden;">Previous</button>
            <button type="button" class="btn btn-primary btn-sm" id="ai-next-btn">Next Step</button>
          </div>

        </form>

        <!-- Loading spinner -->
        <div id="ai-loading-state" style="display: none; text-align: center; padding: 2rem;">
          <div style="border: 3px solid var(--slate-200); border-top-color: var(--accent); border-radius: 50%; width: 2.5rem; height: 2.5rem; animation: spin 1s linear infinite; margin: 0 auto 1rem auto;"></div>
          <p style="font-weight: 600; color: var(--slate-600); font-size: 0.85rem;">Formulating suggestions...</p>
        </div>

        <!-- Recommendations results -->
        <div id="ai-recom-results" style="display: none; border-top: 1px solid var(--slate-100); margin-top: 1.5rem; padding-top: 1.5rem;">
          <h3 style="margin-bottom: 0.75rem; font-size: 1.1rem; color: var(--slate-900);">Recommended Tech Stack For You</h3>
          <div id="ai-results-cards" style="display: grid; grid-template-columns: 1fr; gap: 1rem;"></div>
          <div style="margin-top: 1.5rem; display: flex; gap: 0.5rem;">
            <a href="#demo" class="btn btn-primary btn-sm" style="flex: 1;">Request Consultation</a>
            <button type="button" class="btn btn-secondary btn-sm" onclick="resetAiWizard()">Reset</button>
          </div>
        </div>

      </div>
    </section>

    <!-- Success Stories Section -->
    <section class="success-stories-section">
      <span class="section-kicker">SUCCESS STORIES THAT INSPIRE</span>
      <h2 style="font-size: 1.5rem; font-weight: 800; margin-top: 0.25rem;">Real results from real businesses using the right technology.</h2>
      
      <div class="case-study-card">
        <div>
          <span class="case-study-badge">ERP Implementation</span>
          <h3 style="font-size: 1.35rem; font-weight: 800; margin-bottom: 0.5rem; color: var(--navy);">MAVAR ERP Transformation</h3>
          <p style="font-size: 0.82rem; color: var(--muted); line-height: 1.5; max-width: 480px;">MAVAR streamlined their operations, improved accuracy, and scaled effortlessly with the right ERP solution.</p>
          
          <div class="case-study-stats">
            <div class="stat-item">
              <span class="stat-number">40%</span>
              <span class="stat-label">Process Efficiency</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">60%</span>
              <span class="stat-label">Time Savings</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">99.9%</span>
              <span class="stat-label">Data Accuracy</span>
            </div>
          </div>
          
          <a href="#demo?case=mavar" class="btn btn-outline btn-sm" style="border-color: var(--accent); color: var(--accent);">View Case Study</a>
        </div>
        <div class="case-study-image">
          <img src="assets/media__1781084687510.png" alt="Case Study Mockup">
        </div>
      </div>
    </section>

    <!-- Comparison Table Section -->
    <section style="margin-top: 5rem; margin-bottom: 3rem;">
      <div style="margin-bottom: 2rem;">
        <span class="section-kicker" style="color: var(--accent); font-weight: 800; letter-spacing: 0.15em; font-size: 0.72rem;">WHY A RESELLER, WHY US</span>
        <h2 style="font-size: 1.85rem; font-weight: 800; color: var(--navy); margin-top: 0.35rem; margin-bottom: 0.5rem;">Buying direct vs. buying through TechnoStore360.</h2>
        <p style="font-size: 0.9rem; color: var(--muted); line-height: 1.5; max-width: 600px;">
          A real comparison. The procurement reasons companies choose us over the brand's direct portal — and over generic IT shops.
        </p>
      </div>

      <div class="card" style="padding: 0; overflow-x: auto; border-radius: 16px; border: 1px solid var(--slate-200); box-shadow: 0 10px 30px rgba(37, 52, 75, 0.03);">
        <table style="width: 100%; border-collapse: collapse; text-align: left; min-width: 700px; font-size: 0.82rem;">
          <thead>
            <tr style="border-bottom: 1px solid var(--slate-200); background-color: #fafbfc;">
              <th style="padding: 1.15rem 1.25rem; font-weight: 800; color: var(--slate-500); text-transform: uppercase; font-size: 0.7rem; letter-spacing: 0.05em; width: 35%;">Capability</th>
              <th style="padding: 1.15rem 1.25rem; font-weight: 800; color: var(--accent); text-transform: uppercase; font-size: 0.7rem; letter-spacing: 0.05em; background-color: rgba(226, 27, 90, 0.03); width: 22%;">TechnoStore360</th>
              <th style="padding: 1.15rem 1.25rem; font-weight: 800; color: var(--slate-500); text-transform: uppercase; font-size: 0.7rem; letter-spacing: 0.05em; width: 21%;">Direct From Brand</th>
              <th style="padding: 1.15rem 1.25rem; font-weight: 800; color: var(--slate-500); text-transform: uppercase; font-size: 0.7rem; letter-spacing: 0.05em; width: 22%;">Generic IT Reseller</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid var(--slate-100);">
              <td style="padding: 1.1rem 1.25rem; font-weight: 600; color: var(--slate-800);">Local invoicing in OMR / AED / INR</td>
              <td style="padding: 1.1rem 1.25rem; font-weight: 700; color: var(--accent); background-color: rgba(226, 27, 90, 0.03);">✓</td>
              <td style="padding: 1.1rem 1.25rem; color: var(--slate-600);">partial</td>
              <td style="padding: 1.1rem 1.25rem; color: var(--slate-400);">—</td>
            </tr>
            <tr style="border-bottom: 1px solid var(--slate-100);">
              <td style="padding: 1.1rem 1.25rem; font-weight: 600; color: var(--slate-800);">Net-30 / Net-60 terms</td>
              <td style="padding: 1.1rem 1.25rem; font-weight: 700; color: var(--accent); background-color: rgba(226, 27, 90, 0.03);">✓</td>
              <td style="padding: 1.1rem 1.25rem; color: var(--slate-400);">—</td>
              <td style="padding: 1.1rem 1.25rem; color: var(--slate-600);">rare</td>
            </tr>
            <tr style="border-bottom: 1px solid var(--slate-100);">
              <td style="padding: 1.1rem 1.25rem; font-weight: 600; color: var(--slate-800);">Single quote across software + hardware</td>
              <td style="padding: 1.1rem 1.25rem; font-weight: 700; color: var(--accent); background-color: rgba(226, 27, 90, 0.03);">✓</td>
              <td style="padding: 1.1rem 1.25rem; color: var(--slate-400);">—</td>
              <td style="padding: 1.1rem 1.25rem; color: var(--slate-600);">partial</td>
            </tr>
            <tr style="border-bottom: 1px solid var(--slate-100);">
              <td style="padding: 1.1rem 1.25rem; font-weight: 600; color: var(--slate-800);">On-site deployment & training</td>
              <td style="padding: 1.1rem 1.25rem; font-weight: 700; color: var(--accent); background-color: rgba(226, 27, 90, 0.03);">✓</td>
              <td style="padding: 1.1rem 1.25rem; color: var(--slate-400);">—</td>
              <td style="padding: 1.1rem 1.25rem; color: var(--slate-600);">partial</td>
            </tr>
            <tr style="border-bottom: 1px solid var(--slate-100);">
              <td style="padding: 1.1rem 1.25rem; font-weight: 600; color: var(--slate-800);">Arabic + English support</td>
              <td style="padding: 1.1rem 1.25rem; font-weight: 700; color: var(--accent); background-color: rgba(226, 27, 90, 0.03);">✓</td>
              <td style="padding: 1.1rem 1.25rem; color: var(--slate-600);">partial</td>
              <td style="padding: 1.1rem 1.25rem; color: var(--slate-400);">—</td>
            </tr>
            <tr style="border-bottom: 1px solid var(--slate-100);">
              <td style="padding: 1.1rem 1.25rem; font-weight: 600; color: var(--slate-800);">Volume tier discounts (5/25/100+ seats)</td>
              <td style="padding: 1.1rem 1.25rem; font-weight: 700; color: var(--accent); background-color: rgba(226, 27, 90, 0.03);">✓</td>
              <td style="padding: 1.1rem 1.25rem; color: var(--slate-600);">✓</td>
              <td style="padding: 1.1rem 1.25rem; color: var(--slate-600);">partial</td>
            </tr>
            <tr style="border-bottom: 1px solid var(--slate-100);">
              <td style="padding: 1.1rem 1.25rem; font-weight: 600; color: var(--slate-800);">Renewal protection at original pricing</td>
              <td style="padding: 1.1rem 1.25rem; font-weight: 700; color: var(--accent); background-color: rgba(226, 27, 90, 0.03);">✓</td>
              <td style="padding: 1.1rem 1.25rem; color: var(--slate-400);">—</td>
              <td style="padding: 1.1rem 1.25rem; color: var(--slate-400);">—</td>
            </tr>
            <tr style="border-bottom: none;">
              <td style="padding: 1.1rem 1.25rem; font-weight: 600; color: var(--slate-800);">Dedicated specialist per account</td>
              <td style="padding: 1.1rem 1.25rem; font-weight: 700; color: var(--accent); background-color: rgba(226, 27, 90, 0.03);">✓</td>
              <td style="padding: 1.1rem 1.25rem; color: var(--slate-400);">—</td>
              <td style="padding: 1.1rem 1.25rem; color: var(--slate-600);">partial</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Reseller Band (Megaphone design) -->
    <section class="reseller-band" style="background: linear-gradient(135deg, rgba(255, 20, 100, 0.04) 0%, rgba(255, 20, 100, 0.09) 100%), var(--paper);">
      <div class="reseller-band__metric">25%</div>
      <div class="reseller-band__copy">
        <span class="section-kicker">Become a Reseller</span>
        <h2 style="font-size: 1.6rem; font-weight: 800; margin-bottom: 0.25rem;">Join as a Reseller and Earn Recurring Commission</h2>
        <p>Partner with TechnoStore360 and grow your business with our reseller program. Access direct margins, deal registration support, and high recurring payouts.</p>
        <div style="margin-top: 0.5rem;">
          <a href="#reseller" class="btn btn-primary btn-sm">Become a Reseller</a>
        </div>
      </div>
      <div class="reseller-band__right">
        <div class="megaphone-illustration">
          <i data-lucide="megaphone"></i>
        </div>
      </div>
    </section>
  `;
}

function setupHomeEvents() {
  renderHomeBrandAndProducts();
  if (typeof initSearchSuggestions === 'function') {
    initSearchSuggestions('hero-search-input');
  }
  startTypingAnimation();

  // Dynamic bindings for B2B Stack Wizard to bypass inline block restrictions (CSP)
  const chips = document.querySelectorAll('.chip-option[data-wizard-field]');
  chips.forEach(chip => {
    const field = chip.getAttribute('data-wizard-field');
    const value = chip.getAttribute('data-wizard-value');
    chip.addEventListener('click', () => {
      selectAiOption(field, value, chip);
    });
  });

  const nextBtn = document.getElementById('ai-next-btn');
  if (nextBtn) {
    nextBtn.addEventListener('click', nextAiStep);
  }

  const prevBtn = document.getElementById('ai-prev-btn');
  if (prevBtn) {
    prevBtn.addEventListener('click', prevAiStep);
  }

  const form = document.getElementById('ai-recom-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      handleAiSubmit();
    });
  }

  const resetBtn = document.querySelector('#ai-recom-results button[onclick*="resetAiWizard"]');
  if (resetBtn) {
    resetBtn.removeAttribute('onclick');
    resetBtn.addEventListener('click', resetAiWizard);
  }
}

function toggleHomeBrandFilter(brandId) {
  if (appState.homeActiveBrand === brandId) {
    appState.homeActiveBrand = null;
  } else {
    appState.homeActiveBrand = brandId;
  }
  renderHomeBrandAndProducts();
}

function renderHomeBrandAndProducts() {
  const brandStrip = document.getElementById('home-brand-strip');
  const trendingGrid = document.getElementById('home-trending-grid');
  if (!brandStrip || !trendingGrid) return;

  // Render brand chips
  brandStrip.innerHTML = homeBrands.map(brand => {
    const isActive = appState.homeActiveBrand === brand.id;
    return `
      <div class="brand-chip ${isActive ? 'active' : ''}" onclick="toggleHomeBrandFilter('${brand.id}')">
        <div style="width: 2.25rem; height: 2.25rem; display: flex; align-items: center; justify-content: center; font-weight: 800; color: ${isActive ? 'white' : 'var(--accent)'}; background-color: ${isActive ? 'var(--accent)' : 'var(--slate-100)'}; border-radius: 50%; transition: all 0.2s;">
          ${brand.symbol}
        </div>
        <span>${brand.name}</span>
      </div>
    `;
  }).join('');

  // Filter trending products to match Django's is_trending and newest-first default ordering
  let filtered = products;
  if (appState.homeActiveBrand) {
    filtered = products.filter(p => p.brand === appState.homeActiveBrand);
  } else {
    filtered = products.filter(p => p.dealHighlight).slice().reverse().slice(0, 8);
  }

  // Render product grid
  if (filtered.length === 0) {
    trendingGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--slate-400);">
        <p>No products found under this brand.</p>
      </div>
    `;
  } else {
    trendingGrid.innerHTML = filtered.map(prod => {
      const isCompared = appState.comparedProductIds.includes(prod.id);
      const brandClass = 'brand-' + prod.brand.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const formattedPrice = prod.price > 0 ? 'INR ' + (prod.price * 82.5).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'Get Quote';
      const dealTagHTML = prod.dealHighlight ? `<span class="product-card-deal-tag">${prod.dealHighlight}</span>` : '';
      const originalPriceHTML = prod.originalPrice ? `<span class="product-card-t360__price-original">INR ${(prod.originalPrice * 82.5).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>` : '';
      return `
        <div class="product-card-t360 ${brandClass}" onclick="navigateToProduct('${prod.id}', event)">
          <!-- Deal highlight tag -->
          ${dealTagHTML}

          <!-- Compare indicator button overlay -->
          <button onclick="toggleCompareState('${prod.id}', this)" class="compare-circle-btn ${isCompared ? 'active' : ''}" title="Add to Compare Matrix">
            <i data-lucide="columns" style="width: 0.8rem; height: 0.8rem;"></i>
          </button>

          <!-- Brand Logo centered -->
          <div class="product-card-t360__logo-container">
            <img src="${prod.imageUrl || 'assets/zoho_crm.png'}" alt="${prod.name}" loading="lazy">
          </div>

          <!-- Title & Subtitle -->
          <h3 class="product-card-t360__title">${prod.name}</h3>
          <div class="product-card-t360__vendor">By ${prod.brand}</div>

          <!-- Divider -->
          <hr class="product-card-t360__divider">

          <!-- Footer -->
          <div class="product-card-t360__footer">
            <div class="product-card-t360__price-wrapper">
              <span class="product-card-t360__price-label">Starting at</span>
              <span class="product-card-t360__price-value">${formattedPrice} ${originalPriceHTML}</span>
            </div>
            <button class="product-card-t360__btn" aria-label="View Product">
              <i data-lucide="arrow-right"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  if (window.lucide) window.lucide.createIcons();
}

function handleHeroSearchTrigger() {
  const q = document.getElementById('hero-search-input').value.trim();
  window.location.hash = `#listing?search=${encodeURIComponent(q)}`;
}

// ----------------------------------------------------
// PAGE 2: PRODUCT LISTING PAGE HTML & LOGIC
// ----------------------------------------------------
function getListingHTML() {
  return `
    <div style="padding-top: 0.5rem;">
      
      <!-- Top banner -->
      <div style="margin-bottom: 1.5rem;">
        <span style="font-size: 0.75rem; color: var(--slate-500);"><a href="#home" style="color: inherit; text-decoration: none;">Home</a> &gt; Explore Catalog</span>
        <h1 style="font-size: 1.75rem; margin-top: 0.25rem; font-weight: 800; color: var(--slate-900);">B2B Software & Hardware Catalog</h1>
      </div>

      <!-- Main listing layout -->
      <div class="listing-layout">
        
        <!-- Left Filter panel (desktop) -->
        <aside class="filter-sidebar card" style="padding: 1.25rem; border-radius: var(--radius-lg); border: 1px solid var(--slate-200); background-color: var(--white); top: 20px;">
          ${getFilterSidebarHTML()}
        </aside>

        <!-- Right Listings pane -->
        <div>
          <!-- Search box + Mobile Filter trigger + Sort By Dropdown -->
          <div style="display: flex; gap: 0.75rem; margin-bottom: 1.5rem; align-items: center; flex-wrap: wrap;">
            <div style="flex: 1; position: relative; display: flex; align-items: center; min-width: 200px;">
              <i data-lucide="search" style="position: absolute; left: 1rem; color: var(--slate-400); width: 1.1rem; height: 1.1rem;"></i>
              <input type="text" id="listing-search-box" value="${appState.filters.search}" placeholder="Search products, brands, services..." style="width: 100%; padding: 0.65rem 1rem 0.65rem 2.5rem; border: 1px solid var(--slate-200); border-radius: var(--radius-md); outline: none; background-color: var(--white); font-size: 0.85rem; min-height: 44px;">
            </div>
            
            <button class="btn btn-outline btn-sm" id="mobile-filter-drawer-btn" style="align-items: center; gap: 0.5rem; min-height: 44px; padding: 0 1rem; border-radius: var(--radius-md); font-weight: 600;">
              <i data-lucide="filter" style="width: 1rem; height: 1rem;"></i> Filters
            </button>

            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="font-size: 0.75rem; font-weight: 600; color: var(--slate-500); white-space: nowrap;">Sort By:</span>
              <select id="listing-sort-select" onchange="setListingSort(this.value)" class="form-select" style="padding: 0.5rem; font-size: 0.8rem; border: 1px solid var(--slate-200); border-radius: var(--radius-md); min-width: 130px; min-height: 44px; color: var(--slate-700); background-color: var(--white);">
                <option value="newest" ${appState.filters.sort === 'newest' ? 'selected' : ''}>Newest</option>
                <option value="name" ${appState.filters.sort === 'name' ? 'selected' : ''}>Name</option>
                <option value="price_asc" ${appState.filters.sort === 'price_asc' ? 'selected' : ''}>Price: Low to High</option>
                <option value="price_desc" ${appState.filters.sort === 'price_desc' ? 'selected' : ''}>Price: High to Low</option>
                <option value="rating" ${appState.filters.sort === 'rating' ? 'selected' : ''}>Rating</option>
              </select>
            </div>
          </div>

          <!-- Active filters chips bar -->
          <div id="active-filters-bar" style="display: flex; flex-wrap: wrap; gap: 0.35rem; margin-bottom: 1rem;"></div>

          <!-- Product results Grid -->
          <div id="listing-results-grid" class="product-grid product-grid-3">
            <!-- Populated via Javascript -->
          </div>

          <div id="listing-empty-state" style="display: none; text-align: center; padding: 4rem 2rem;">
            <i data-lucide="box" style="width: 3rem; height: 3rem; color: var(--slate-300); margin-bottom: 1rem;"></i>
            <h3>No Products Found</h3>
            <p style="color: var(--slate-500); margin-bottom: 1.25rem; font-size: 0.85rem;">Try relaxing your category or price restrictions to view more products.</p>
            <button onclick="clearAllFilters()" class="btn btn-primary btn-sm">Clear All Filters</button>
          </div>

        </div>

      </div>

    </div>

    <!-- Mobile Filter Panel Slide-in -->
    <div id="mobile-filter-overlay" class="mobile-nav-overlay"></div>
    <div id="mobile-filter-panel" class="mobile-nav-panel" style="right: -300px; width: 300px;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;">
        <span style="font-weight: 700; font-size: 1.1rem; color: var(--slate-900);">Refine Options</span>
        <button id="mobile-filter-close-btn" style="background: none; border: none; cursor: pointer; color: var(--slate-500);">
          <i data-lucide="x" style="width: 1.5rem; height: 1.5rem;"></i>
        </button>
      </div>
      <div style="flex: 1; overflow-y: auto;" id="mobile-filter-inner-content">
        <!-- Render copy of filters -->
      </div>
    </div>
  `;
}

function getFilterSidebarHTML() {
  const currentCategory = appState.filters.category;
  
  return `
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
      <h3 style="font-size: 0.95rem; font-weight: 700;">Filters</h3>
      <button onclick="clearAllFilters()" style="background: none; border: none; font-size: 0.75rem; color: var(--primary-blue); font-weight: 600; cursor: pointer;">Reset All</button>
    </div>

    <!-- Category selector -->
    <div class="filter-section">
      <div class="filter-title collapsible" onclick="toggleFilterSection(this)" style="font-size: 0.8rem; display: flex; justify-content: space-between; align-items: center; width: 100%;">
        <span>Category</span>
        <i data-lucide="chevron-down" style="width: 0.8rem; height: 0.8rem;"></i>
      </div>
      <div class="filter-content" style="margin-top: 0.5rem;">
        <select id="filter-category-select" onchange="setFilterCategory(this.value)" class="form-select" style="padding: 0.4rem; font-size: 0.75rem; width: 100%;">
          <option value="">All Categories</option>
          ${categories.map(c => `<option value="${c.id}" ${currentCategory === c.id ? 'selected' : ''}>${c.title}</option>`).join('')}
        </select>
      </div>
    </div>

    <!-- Brand filter -->
    <div class="filter-section">
      <div class="filter-title collapsible" onclick="toggleFilterSection(this)" style="font-size: 0.8rem; display: flex; justify-content: space-between; align-items: center; width: 100%;">
        <span>Brand</span>
        <i data-lucide="chevron-down" style="width: 0.8rem; height: 0.8rem;"></i>
      </div>
      <div class="filter-content" style="margin-top: 0.5rem; display: flex; flex-direction: column; gap: 0.35rem;">
        ${[...new Set(products.map(p => p.brand))].sort().map(brand => {
          const isChecked = appState.filters.brand.includes(brand) ? 'checked' : '';
          return `
            <label class="filter-option" style="font-size: 0.75rem; display: flex; align-items: center; gap: 0.35rem;">
              <input type="checkbox" value="${brand}" ${isChecked} onchange="toggleFilterBrand('${brand}')">
              <span>${brand}</span>
            </label>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Price filter -->
    <div class="filter-section">
      <div class="filter-title collapsible" onclick="toggleFilterSection(this)" style="font-size: 0.8rem; display: flex; justify-content: space-between; align-items: center; width: 100%;">
        <span>Price Tiers</span>
        <i data-lucide="chevron-down" style="width: 0.8rem; height: 0.8rem;"></i>
      </div>
      <div class="filter-content" style="margin-top: 0.5rem; display: flex; flex-direction: column; gap: 0.35rem;">
        <label class="filter-option" style="font-size: 0.75rem; display: flex; align-items: center; gap: 0.35rem;">
          <input type="radio" name="price-filter" value="" ${appState.filters.price === '' ? 'checked' : ''} onchange="setFilterPrice('')">
          <span>All Prices</span>
        </label>
        <label class="filter-option" style="font-size: 0.75rem; display: flex; align-items: center; gap: 0.35rem;">
          <input type="radio" name="price-filter" value="free-payg" ${appState.filters.price === 'free-payg' ? 'checked' : ''} onchange="setFilterPrice('free-payg')">
          <span>Pay-as-you-go</span>
        </label>
        <label class="filter-option" style="font-size: 0.75rem; display: flex; align-items: center; gap: 0.35rem;">
          <input type="radio" name="price-filter" value="under-50" ${appState.filters.price === 'under-50' ? 'checked' : ''} onchange="setFilterPrice('under-50')">
          <span>Under $50.00 / mo</span>
        </label>
        <label class="filter-option" style="font-size: 0.75rem; display: flex; align-items: center; gap: 0.35rem;">
          <input type="radio" name="price-filter" value="over-50" ${appState.filters.price === 'over-50' ? 'checked' : ''} onchange="setFilterPrice('over-50')">
          <span>Over $50.00 / mo</span>
        </label>
      </div>
    </div>

    <!-- Deployment filter -->
    <div class="filter-section" style="border-bottom: none; margin-bottom: 0; padding-bottom: 0;">
      <div class="filter-title collapsible" onclick="toggleFilterSection(this)" style="font-size: 0.8rem; display: flex; justify-content: space-between; align-items: center; width: 100%;">
        <span>Deployment</span>
        <i data-lucide="chevron-down" style="width: 0.8rem; height: 0.8rem;"></i>
      </div>
      <div class="filter-content" style="margin-top: 0.5rem; display: flex; flex-direction: column; gap: 0.35rem;">
        ${['Cloud / SaaS', 'On-Premise / Hardware', 'Hybrid'].map(dep => {
          const isChecked = appState.filters.deployment.includes(dep) ? 'checked' : '';
          return `
            <label class="filter-option" style="font-size: 0.75rem; display: flex; align-items: center; gap: 0.35rem;">
              <input type="checkbox" value="${dep}" ${isChecked} onchange="toggleFilterDeployment('${dep}')">
              <span>${dep}</span>
            </label>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Action buttons (Apply & Reset) stacked -->
    <div style="margin-top: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem; padding-top: 1rem; border-top: 1px solid var(--slate-200);">
      <button class="btn btn-sm" onclick="applyFilters()" style="width: 100%; background-color: var(--accent); color: var(--white); font-weight: 600;">Apply Filters</button>
      <button class="btn btn-secondary btn-sm" onclick="clearAllFilters()" style="width: 100%;">Reset All</button>
    </div>
  `;
}

function setupListingEvents() {
  // Bind search box keyups for search filter with debounce and spinner
  const searchBox = document.getElementById('listing-search-box');
  if (searchBox) {
    initSearchSuggestions('listing-search-box');
    let searchTimeout;
    searchBox.addEventListener('input', (e) => {
      const parentShell = searchBox.closest('.search-shell');
      if (parentShell) parentShell.classList.add('searching');
      
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        if (parentShell) parentShell.classList.remove('searching');
        appState.filters.search = e.target.value;
        runListingsFilter();
      }, 300);
    });
  }

  // Mobile drawer bindings
  const drawerBtn = document.getElementById('mobile-filter-drawer-btn');
  const overlay = document.getElementById('mobile-filter-overlay');
  const panel = document.getElementById('mobile-filter-panel');
  const closeBtn = document.getElementById('mobile-filter-close-btn');

  if (drawerBtn && panel) {
    drawerBtn.addEventListener('click', () => {
      document.getElementById('mobile-filter-inner-content').innerHTML = getFilterSidebarHTML();
      if (window.lucide) window.lucide.createIcons();
      overlay.style.display = 'block';
      setTimeout(() => panel.style.right = '0', 50);
    });
  }

  const closeDrawer = () => {
    panel.style.right = '-300px';
    setTimeout(() => overlay.style.display = 'none', 300);
  };

  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (overlay) overlay.addEventListener('click', closeDrawer);

  // Initial render
  runListingsFilter();
}

function getSkeletonHTML() {
  let skeletons = '';
  for (let i = 0; i < 6; i++) {
    skeletons += `
      <div class="product-card-t360 skeleton-card">
        <div class="product-card-t360__logo-container">
          <div class="skeleton-shimmer skeleton-logo"></div>
        </div>
        <div class="skeleton-shimmer skeleton-line skeleton-title" style="margin: 0.5rem auto;"></div>
        <div class="skeleton-shimmer skeleton-line skeleton-vendor" style="margin: 0.5rem auto 1rem auto;"></div>
        <hr class="product-card-t360__divider">
        <div class="product-card-t360__footer">
          <div class="product-card-t360__price-wrapper">
            <div class="skeleton-shimmer skeleton-line skeleton-price-label"></div>
            <div class="skeleton-shimmer skeleton-line skeleton-price-val"></div>
          </div>
          <div class="skeleton-shimmer skeleton-btn"></div>
        </div>
      </div>
    `;
  }
  return skeletons;
}

function runListingsFilter() {
  const grid = document.getElementById('listing-results-grid');
  const empty = document.getElementById('listing-empty-state');
  const f = appState.filters;

  // Perform filtration
  const filtered = products.filter(p => {
    // Search filter
    if (f.search && !p.name.toLowerCase().includes(f.search.toLowerCase()) && !p.brand.toLowerCase().includes(f.search.toLowerCase()) && !p.shortDesc.toLowerCase().includes(f.search.toLowerCase())) return false;
    
    // Category filter
    if (f.category && p.categoryId !== f.category) return false;

    // Brand filter
    if (f.brand.length > 0 && !f.brand.includes(p.brand)) return false;

    // Rating filter
    if (f.rating > 0 && p.rating < f.rating) return false;

    // Deployment filter
    if (f.deployment.length > 0 && !f.deployment.some(dep => p.deployment.includes(dep))) return false;

    // Price filter
    if (f.price === 'free-payg' && p.price !== 0) return false;
    if (f.price === 'under-50' && (p.price === 0 || p.price >= 50)) return false;
    if (f.price === 'over-50' && p.price < 50) return false;

    return true;
  });

  // Apply client-side sorting
  const sortVal = f.sort || 'newest';
  if (sortVal === 'price_asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortVal === 'price_desc') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sortVal === 'name') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortVal === 'rating') {
    filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else {
    // default/newest: maintain default index in products array
    filtered.sort((a, b) => {
      const idxA = products.findIndex(p => p.id === a.id);
      const idxB = products.findIndex(p => p.id === b.id);
      return idxA - idxB;
    });
  }

  // Cancel any pending stagger/render timeouts
  if (window._listingsTimeout) clearTimeout(window._listingsTimeout);
  if (window._staggerTimeouts) {
    window._staggerTimeouts.forEach(t => clearTimeout(t));
  }
  window._staggerTimeouts = [];

  if (filtered.length === 0) {
    grid.style.display = 'none';
    empty.style.display = 'block';
    renderFilterChips();
  } else {
    empty.style.display = 'none';
    grid.style.display = 'grid';
    
    // Show skeletons immediately
    grid.innerHTML = getSkeletonHTML();
    
    // Animate insertion after brief shimmer
    window._listingsTimeout = setTimeout(() => {
      grid.innerHTML = '';
      
      filtered.forEach((prod, index) => {
        const isCompared = appState.comparedProductIds.includes(prod.id);
        const brandClass = 'brand-' + prod.brand.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const formattedPrice = prod.price > 0 ? 'INR ' + (prod.price * 82.5).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'Get Quote';
        let dealTagHTML = '';
        if (prod.originalPrice && prod.originalPrice > prod.price) {
          const discountPercent = Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100);
          dealTagHTML = `<span class="product-card-deal-tag">Save ${discountPercent}%</span>`;
        } else if (prod.dealHighlight) {
          dealTagHTML = `<span class="product-card-deal-tag">${prod.dealHighlight}</span>`;
        }
        const originalPriceHTML = prod.originalPrice ? `<span class="product-card-t360__price-original">INR ${(prod.originalPrice * 82.5).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>` : '';
        
        const cardHTML = `
          <div class="product-card-t360 ${brandClass}" onclick="navigateToProduct('${prod.id}', event)" style="opacity: 0; transform: translateY(12px); transition: opacity 0.25s cubic-bezier(0.25, 1, 0.5, 1), transform 0.25s cubic-bezier(0.25, 1, 0.5, 1);">
            ${dealTagHTML}
            <button onclick="toggleCompareState('${prod.id}', this)" class="compare-circle-btn ${isCompared ? 'active' : ''}" title="Add to Compare Matrix">
              <i data-lucide="columns" style="width: 0.8rem; height: 0.8rem;"></i>
            </button>
            <div class="product-card-t360__logo-container">
              <img src="${prod.imageUrl || 'assets/zoho_crm.png'}" alt="${prod.name}" loading="lazy">
            </div>
            <h3 class="product-card-t360__title">${prod.name}</h3>
            <div class="product-card-t360__vendor">By ${prod.brand}</div>
            <hr class="product-card-t360__divider">
            <div class="product-card-t360__footer">
              <div class="product-card-t360__price-wrapper">
                <span class="product-card-t360__price-label">Starting at</span>
                <span class="product-card-t360__price-value">${formattedPrice} ${originalPriceHTML}</span>
              </div>
              <button class="product-card-t360__btn" aria-label="View Product">
                <i data-lucide="arrow-right"></i>
              </button>
            </div>
          </div>
        `;
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = cardHTML;
        const cardNode = tempDiv.firstElementChild;
        grid.appendChild(cardNode);
        
        const staggerTimeout = setTimeout(() => {
          cardNode.style.opacity = '1';
          cardNode.style.transform = 'translateY(0)';
        }, index * 40);
        window._staggerTimeouts.push(staggerTimeout);
      });
      
      if (window.lucide) window.lucide.createIcons();
    }, 300);
    
    renderFilterChips();
  }
}

function renderFilterChips() {
  const bar = document.getElementById('active-filters-bar');
  if (!bar) return;
  
  let chips = [];
  const f = appState.filters;

  if (f.category) {
    const cat = categories.find(c => c.id === f.category);
    chips.push({ label: `Category: ${cat.title}`, clear: () => f.category = '' });
  }
  f.brand.forEach(b => {
    chips.push({ label: `Brand: ${b}`, clear: () => f.brand = f.brand.filter(x => x !== b) });
  });
  if (f.price) {
    chips.push({ label: `Price: ${f.price}`, clear: () => f.price = '' });
  }
  f.deployment.forEach(d => {
    chips.push({ label: `Deployment: ${d}`, clear: () => f.deployment = f.deployment.filter(x => x !== d) });
  });

  if (chips.length === 0) {
    bar.innerHTML = '';
    return;
  }

  bar.innerHTML = chips.map((c, idx) => `
    <span class="badge filter-chip" style="background-color: var(--white); border: 1px solid var(--slate-200); color: var(--slate-600); padding: 0.25rem 0.5rem; font-weight: 500; display: inline-flex; align-items: center; gap: 0.25rem;">
      ${c.label}
      <i data-lucide="x" onclick="clearSpecificChip(${idx}, this)" style="width: 0.75rem; cursor: pointer; color: var(--slate-400);"></i>
    </span>
  `).join('') + `<button onclick="clearAllFilters()" style="background: none; border: none; font-size: 0.7rem; color: var(--primary-blue); font-weight: 600; cursor: pointer; margin-left: 0.5rem;">Clear All</button>`;
  
  window._chipClearFns = chips.map(c => c.clear);
}

function clearSpecificChip(idx, clickEl) {
  if (window._chipClearFns && window._chipClearFns[idx]) {
    const chipEl = clickEl ? clickEl.closest('.filter-chip') : null;
    if (chipEl) {
      chipEl.classList.add('filter-chip-exit');
      setTimeout(() => {
        window._chipClearFns[idx]();
        const sidebar = document.querySelector('.filter-sidebar');
        if (sidebar) {
          sidebar.innerHTML = getFilterSidebarHTML();
          if (window.lucide) window.lucide.createIcons();
        }
        runListingsFilter();
      }, 150);
    } else {
      window._chipClearFns[idx]();
      const sidebar = document.querySelector('.filter-sidebar');
      if (sidebar) {
        sidebar.innerHTML = getFilterSidebarHTML();
        if (window.lucide) window.lucide.createIcons();
      }
      runListingsFilter();
    }
  }
}

function applyFilters() {
  runListingsFilter();
  
  // Close mobile drawer if open
  const overlay = document.getElementById('mobile-filter-overlay');
  const panel = document.getElementById('mobile-filter-panel');
  if (panel && overlay) {
    panel.style.right = '-300px';
    setTimeout(() => overlay.style.display = 'none', 300);
  }
}

function clearAllFilters() {
  appState.filters = {
    search: '',
    category: '',
    brand: [],
    price: '',
    rating: 0,
    deployment: [],
    support: [],
    sort: 'newest'
  };
  const searchBox = document.getElementById('listing-search-box');
  if (searchBox) searchBox.value = '';
  const sidebar = document.querySelector('.filter-sidebar');
  if (sidebar) sidebar.innerHTML = getFilterSidebarHTML();
  
  // Close mobile drawer if open
  const overlay = document.getElementById('mobile-filter-overlay');
  const panel = document.getElementById('mobile-filter-panel');
  if (panel && overlay) {
    panel.style.right = '-300px';
    setTimeout(() => overlay.style.display = 'none', 300);
  }
  
  runListingsFilter();
}

function setFilterCategory(val) {
  appState.filters.category = val;
  runListingsFilter();
}

function toggleFilterBrand(brand) {
  const idx = appState.filters.brand.indexOf(brand);
  if (idx > -1) appState.filters.brand.splice(idx, 1);
  else appState.filters.brand.push(brand);
  runListingsFilter();
}

function setFilterPrice(val) {
  appState.filters.price = val;
  runListingsFilter();
}

function toggleFilterDeployment(dep) {
  const idx = appState.filters.deployment.indexOf(dep);
  if (idx > -1) appState.filters.deployment.splice(idx, 1);
  else appState.filters.deployment.push(dep);
  runListingsFilter();
}

function setListingSort(val) {
  appState.filters.sort = val;
  runListingsFilter();
}

// ----------------------------------------------------
// PAGE 3: PRODUCT DETAIL PAGE HTML & LOGIC
// ----------------------------------------------------
function getDetailHTML(productId) {
  const prod = products.find(p => p.id === productId) || products[0];
  const isCompared = appState.comparedProductIds.includes(prod.id);
  const alternatives = products.filter(p => p.categoryId === prod.categoryId && p.id !== prod.id).slice(0, 3);
  const brandUpper = prod.brand.toUpperCase();

  const stockQty = prod.stockQty !== undefined ? prod.stockQty : 25; // default 25
  const lowStockLevel = 5;
  const stockStatus = stockQty <= 0 ? 'out_of_stock' : (stockQty <= lowStockLevel ? 'low_stock' : 'in_stock');
  
  let stockStatusHTML = '';
  if (stockStatus === 'in_stock') {
    stockStatusHTML = `
      <span style="font-size: 0.75rem; color: var(--primary-green); font-weight: bold; display: flex; align-items: center; gap: 0.25rem;">
        <span style="width: 6px; height: 6px; border-radius: 50%; background-color: var(--primary-green); display: inline-block;"></span> In Stock (${stockQty} left)
      </span>
    `;
  } else if (stockStatus === 'low_stock') {
    stockStatusHTML = `
      <span style="font-size: 0.75rem; color: #d97706; font-weight: bold; display: flex; align-items: center; gap: 0.25rem;">
        <span style="width: 6px; height: 6px; border-radius: 50%; background-color: #f59e0b; display: inline-block;"></span> Low Stock (${stockQty} left)
      </span>
    `;
  } else {
    stockStatusHTML = `
      <span style="font-size: 0.75rem; color: var(--error-red); font-weight: bold; display: flex; align-items: center; gap: 0.25rem;">
        <span style="width: 6px; height: 6px; border-radius: 50%; background-color: var(--error-red); display: inline-block;"></span> Out of Stock
      </span>
    `;
  }

  return `
    <div style="padding-top: 0.5rem; padding-bottom: 4rem;">
      
      <!-- Breadcrumb -->
      <div style="margin-bottom: 1rem; font-size: 0.75rem; color: var(--slate-500);">
        <a href="#home" style="color: inherit; text-decoration: none;">Home</a> &gt; 
        <a href="#listing" style="color: inherit; text-decoration: none;">Catalog</a> &gt; 
        <a href="#listing?brand=${prod.brand}" style="color: inherit; text-decoration: none;">${prod.brand}</a> &gt; 
        <span>${prod.name}</span>
      </div>

      <!-- Main Columns Grid -->
      <div class="detail-layout">
        
        <!-- Left details pane -->
        <div>
          
          <!-- Product Title Banner -->
          <div style="display: flex; align-items: start; gap: 1.25rem; margin-bottom: 1.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--slate-200);">
            <div style="width: 4.5rem; height: 4.5rem; border-radius: var(--radius-md); border: 1px solid var(--slate-200); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.75rem; color: var(--accent); background-color: var(--white); flex-shrink: 0; box-shadow: var(--shadow-sm); overflow: hidden;">
              <img src="${prod.imageUrl || 'assets/zoho_crm.png'}" style="width: 100%; height: 100%; object-fit: contain; padding: 0.55rem;" alt="${prod.brand}">
            </div>
            <div>
              <div style="display: flex; gap: 0.35rem; align-items: center; margin-bottom: 0.35rem; flex-wrap: wrap;">
                <span class="case-study-badge" style="background-color: rgba(255, 20, 100, 0.08); color: var(--accent); border: none; font-size: 0.65rem; padding: 0.2rem 0.6rem; letter-spacing: 0.5px; margin: 0; font-weight: 700;">${brandUpper} VERIFIED PARTNER</span>
                ${prod.demoAvailable ? `<span class="badge badge-video" style="font-size: 0.65rem;"><i data-lucide="video" style="width: 0.75rem;"></i> Sandbox Enabled</span>` : ''}
              </div>
              <h1 style="font-size: 1.85rem; line-height: 1.2; font-weight: 800; color: var(--ink-strong); margin: 0;">${prod.name}</h1>
              
              <!-- Review Row -->
              <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem; font-size: 0.82rem; flex-wrap: wrap; color: var(--muted); font-weight: 500;">
                <div style="display: flex; align-items: center; gap: 0.15rem; color: #f59e0b;">
                  <i data-lucide="star" style="width: 0.9rem; height: 0.9rem; fill: currentColor;"></i>
                </div>
                <strong style="color: var(--ink-strong); font-weight: 700;">${prod.rating}</strong>
                <span>(${prod.reviewsCount} Reviews)</span>
                <span style="color: var(--line-strong);">|</span>
                <span>10K+ Businesses Trust ${prod.brand}</span>
              </div>
            </div>
          </div>

          <!-- 4-Column Trust checklist strip -->
          <div class="trust-checklist-strip">
            <div class="trust-strip-item">
              <div class="trust-strip-icon"><i data-lucide="shield-check"></i></div>
              <div class="trust-strip-text">
                <h4>Official License</h4>
                <p>100% Genuine</p>
              </div>
            </div>
            <div class="trust-strip-item">
              <div class="trust-strip-icon"><i data-lucide="zap"></i></div>
              <div class="trust-strip-text">
                <h4>Instant Delivery</h4>
                <p>Digital Access</p>
              </div>
            </div>
            <div class="trust-strip-item">
              <div class="trust-strip-icon"><i data-lucide="headset"></i></div>
              <div class="trust-strip-text">
                <h4>24/7 Support</h4>
                <p>Expert Assistance</p>
              </div>
            </div>
            <div class="trust-strip-item">
              <div class="trust-strip-icon"><i data-lucide="lock"></i></div>
              <div class="trust-strip-text">
                <h4>Secure Payment</h4>
                <p>SSL Encrypted</p>
              </div>
            </div>
          </div>

          <!-- Left Media showcase container -->
          <div class="showcase-media-container">
            <img src="${prod.imageUrl || 'assets/zoho_crm.png'}" alt="${prod.name}" class="showcase-media-img" id="detail-primary-image">
            <button class="play-overlay-btn" onclick="playDemoVideoMock()" aria-label="Play Walkthrough">
              <i data-lucide="play"></i>
            </button>
          </div>

          <!-- Thumbnail screenshots underneath -->
          <div class="thumbnails-carousel">
            <div class="thumb-frame active" onclick="switchDetailThumbnail('${prod.imageUrl}', this)"><img src="${prod.imageUrl}" alt="Thumb 1"></div>
            <div class="thumb-frame" onclick="switchDetailThumbnail('assets/media__1781084322621.png', this)"><img src="assets/media__1781084322621.png" alt="Thumb 2"></div>
            <div class="thumb-frame" onclick="switchDetailThumbnail('assets/media__1781084687510.png', this)"><img src="assets/media__1781084687510.png" alt="Thumb 3"></div>
            <div class="thumb-frame" onclick="switchDetailThumbnail('assets/media__1781323496674.png', this)"><img src="assets/media__1781323496674.png" alt="Thumb 4"></div>
            <div class="thumb-frame" onclick="switchDetailThumbnail('assets/quickbooks.png', this)"><img src="assets/quickbooks.png" alt="Thumb 5"></div>
          </div>

          <!-- Tabs Nav -->
          <div class="tabs-nav">
            <button class="tab-btn active" onclick="switchDetailTab('overview', this)">Overview</button>
            <button class="tab-btn" onclick="switchDetailTab('features', this)">Key Features</button>
            <button class="tab-btn" onclick="switchDetailTab('pricing', this)">Specs & Info</button>
            <button class="tab-btn" onclick="switchDetailTab('reviews', this)">Reviews (${prod.reviewsCount})</button>
          </div>

          <!-- Tab Content Panels -->
          <div>
            <!-- Tab 1: Overview -->
            <div class="tab-content-panel active" id="detail-tab-overview">
              <h3 style="font-size: 1.15rem; margin-bottom: 0.75rem; font-weight: 800;">Product Summary</h3>
              <p style="color: var(--slate-600); line-height: 1.6; margin-bottom: 1.5rem; font-size: 0.85rem;">${prod.longDesc}</p>
              
              <!-- Pros & Cons -->
              <h3 style="font-size: 1.15rem; margin-bottom: 0.75rem; font-weight: 800;">Vendor Assessment</h3>
              <div class="form-grid-2" style="margin-bottom: 1.5rem;">
                <div style="background-color: rgba(16, 185, 129, 0.04); border: 1px solid rgba(16, 185, 129, 0.1); border-radius: var(--radius-md); padding: 1rem;">
                  <h4 style="color: var(--primary-green); font-size: 0.85rem; display: flex; align-items: center; gap: 0.35rem; margin-bottom: 0.5rem; font-weight: 700;"><i data-lucide="thumbs-up" style="width: 0.95rem;"></i> Highlighted Pros</h4>
                  <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.35rem; padding-left: 0; margin: 0;">
                    ${prod.pros.map(pro => `<li style="font-size: 0.75rem; color: var(--slate-700); display: flex; align-items: start; gap: 0.35rem;"><i data-lucide="check" style="color: var(--primary-green); width: 0.8rem; flex-shrink: 0; margin-top: 0.15rem;"></i> ${pro}</li>`).join('')}
                  </ul>
                </div>
                <div style="background-color: rgba(239, 68, 68, 0.04); border: 1px solid rgba(239, 68, 68, 0.1); border-radius: var(--radius-md); padding: 1rem;">
                  <h4 style="color: #ef4444; font-size: 0.85rem; display: flex; align-items: center; gap: 0.35rem; margin-bottom: 0.5rem; font-weight: 700;"><i data-lucide="thumbs-down" style="width: 0.95rem;"></i> Considerations</h4>
                  <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.35rem; padding-left: 0; margin: 0;">
                    ${prod.cons.map(con => `<li style="font-size: 0.75rem; color: var(--slate-700); display: flex; align-items: start; gap: 0.35rem;"><i data-lucide="alert-circle" style="color: #ef4444; width: 0.8rem; flex-shrink: 0; margin-top: 0.15rem;"></i> ${con}</li>`).join('')}
                  </ul>
                </div>
              </div>
            </div>

            <!-- Tab 2: Features -->
            <div class="tab-content-panel" id="detail-tab-features">
              <h3 style="font-size: 1.15rem; margin-bottom: 0.75rem; font-weight: 800;">Core Capabilities</h3>
              <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem; padding-left: 0;">
                ${prod.features.map((feat, idx) => `
                  <li style="display: flex; gap: 0.75rem; align-items: start; padding: 0.75rem; background-color: var(--slate-50); border-radius: var(--radius-md); border-left: 3px solid var(--accent);">
                    <span style="font-weight: 700; color: var(--accent); font-size: 0.95rem;">0${idx + 1}</span>
                    <div>
                      <h4 style="font-size: 0.85rem; margin: 0 0 0.15rem 0; color: var(--slate-900); font-weight: 700;">${feat.split(':')[0]}</h4>
                      <p style="font-size: 0.75rem; color: var(--slate-600); margin: 0;">${feat.split(':')[1] || feat}</p>
                    </div>
                  </li>
                `).join('')}
              </ul>
            </div>

            <!-- Tab 3: Specs -->
            <div class="tab-content-panel" id="detail-tab-pricing">
              <h3 style="font-size: 1.15rem; margin-bottom: 0.75rem; font-weight: 800;">Technical Specifications</h3>
              <div style="border: 1px solid var(--slate-200); border-radius: var(--radius-lg); overflow: hidden; margin-bottom: 1.5rem;">
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.8rem;">
                  <tbody>
                    <tr style="border-bottom: 1px solid var(--slate-200); background-color: var(--slate-50);">
                      <td style="padding: 0.75rem; font-weight: 700; width: 180px; color: var(--slate-600);">Deployment Model</td>
                      <td style="padding: 0.75rem; color: var(--slate-800);">${prod.deployment || 'Cloud / SaaS'}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--slate-200);">
                      <td style="padding: 0.75rem; font-weight: 700; color: var(--slate-600);">Business Size Class</td>
                      <td style="padding: 0.75rem; color: var(--slate-800);">${prod.businessType || 'Enterprise & Mid-Market'}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid var(--slate-200); background-color: var(--slate-50);">
                      <td style="padding: 0.75rem; font-weight: 700; color: var(--slate-600);">SLA Technical Support</td>
                      <td style="padding: 0.75rem; color: var(--slate-800);">${prod.support || '24/7 Live Support'}</td>
                    </tr>
                    <tr style="border-bottom: none;">
                      <td style="padding: 0.75rem; font-weight: 700; color: var(--slate-600);">SKU Code</td>
                      <td style="padding: 0.75rem; color: var(--slate-800); font-family: monospace;">${prod.id.toUpperCase()}-SKU</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Tab 4: Reviews -->
            <div class="tab-content-panel" id="detail-tab-reviews">
              <h3 style="font-size: 1.15rem; margin-bottom: 1rem; font-weight: 800;">Customer Reviews</h3>
              <div style="display: flex; flex-direction: column; gap: 1rem;">
                <div style="display: flex; gap: 0.75rem; align-items: start; padding: 1rem; border: 1px solid var(--slate-200); border-radius: var(--radius-md);">
                  <div style="background-color: var(--accent); color: white; border-radius: 50%; width: 2.25rem; height: 2.25rem; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; font-size:0.85rem;">JD</div>
                  <div style="flex: 1;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.35rem;">
                      <div>
                        <h4 style="font-size: 0.85rem; font-weight: 700; margin: 0;">John Doe, CTO</h4>
                        <span style="font-size: 0.7rem; color: var(--slate-400);">Apex Financial</span>
                      </div>
                      <span class="rating-stars" style="font-size:0.8rem; color: #f59e0b;"><i data-lucide="star" style="width: 0.75rem; fill: currentColor;"></i> 5.0</span>
                    </div>
                    <p style="font-size: 0.75rem; color: var(--slate-600); line-height: 1.4; margin: 0;">"Migrating our operations to this platform simplified our internal financial workflows instantly. The compliance and deployment support was stellar."</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <!-- Need a Custom Solution Banner inside content tabs -->
          <div class="custom-solution-banner" style="background: linear-gradient(135deg, rgba(255, 20, 100, 0.04) 0%, rgba(255, 20, 100, 0.09) 100%), var(--paper); border: 1px solid var(--line); color: var(--ink-strong); padding: 2rem; border-radius: 20px; display: flex; justify-content: space-between; align-items: center; margin-top: 2rem; text-align: left; gap: 1.5rem;">
            <div>
              <h3 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 0.25rem;">Need a Custom Solution?</h3>
              <p style="color: var(--slate-600); font-size: 0.85rem; line-height: 1.4; max-width: 480px; margin: 0 !important;">Our experts can help you choose the right plan for your business needs.</p>
              <a href="#demo?product=${prod.id}&custom=true" class="btn btn-primary btn-sm" style="margin-top: 1rem; background-color: var(--accent); border: none;">Contact Our Experts</a>
            </div>
            <div class="megaphone-illustration" style="width: 100px; height: 100px; flex-shrink: 0;">
              <i data-lucide="headset" style="width: 3rem; height: 3rem; color: var(--accent);"></i>
            </div>
          </div>

          <!-- Related Alternatives Section -->
          <div style="margin-top: 2rem; border-top: 1px solid var(--slate-200); padding-top: 1.5rem;">
            <h3 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 1rem; color: var(--slate-900);">Alternatives & Solutions</h3>
            <div style="display: flex; flex-wrap: nowrap; overflow-x: auto; gap: 1.5rem; padding: 0.5rem 0.25rem 1.5rem; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; scrollbar-width: thin; -ms-overflow-style: -ms-autohiding-scrollbar;">
              ${alternatives.map(alt => {
                const formattedAltPrice = alt.price > 0 ? 'INR ' + (alt.price * 82.5).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'Get Quote';
                const altBrandClass = 'brand-' + alt.brand.toLowerCase().replace(/[^a-z0-9]/g, '-');
                const altCompared = appState.comparedProductIds.includes(alt.id);
                let altDealTagHTML = '';
                if (alt.originalPrice && alt.originalPrice > alt.price) {
                  const altDiscount = Math.round(((alt.originalPrice - alt.price) / alt.originalPrice) * 100);
                  altDealTagHTML = `<span class="product-card-deal-tag">Save ${altDiscount}%</span>`;
                } else if (alt.dealHighlight) {
                  altDealTagHTML = `<span class="product-card-deal-tag">${alt.dealHighlight}</span>`;
                }
                const altOriginalPriceHTML = alt.originalPrice ? `<span class="product-card-t360__price-original">INR ${(alt.originalPrice * 82.5).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>` : '';

                return `
                  <div style="flex: 0 0 280px; scroll-snap-align: start; display: flex; flex-direction: column;">
                    <div class="product-card-t360 ${altBrandClass}" onclick="navigateToProduct('${alt.id}', event)" style="opacity: 1; transform: translateY(0); cursor: pointer;">
                      ${altDealTagHTML}
                      <button onclick="toggleCompareState('${alt.id}', this)" class="compare-circle-btn ${altCompared ? 'active' : ''}" title="Add to Compare Matrix">
                        <i data-lucide="columns" style="width: 0.8rem; height: 0.8rem;"></i>
                      </button>
                      <div class="product-card-t360__logo-container">
                        <img src="${alt.imageUrl || 'assets/zoho_crm.png'}" alt="${alt.name}" loading="lazy">
                      </div>
                      <h3 class="product-card-t360__title">${alt.name}</h3>
                      <div class="product-card-t360__vendor">By ${alt.brand}</div>
                      <hr class="product-card-t360__divider">
                      <div class="product-card-t360__footer">
                        <div class="product-card-t360__price-wrapper">
                          <span class="product-card-t360__price-label">Starting at</span>
                          <span class="product-card-t360__price-value">${formattedAltPrice} ${altOriginalPriceHTML}</span>
                        </div>
                        <button class="product-card-t360__btn" aria-label="View Product">
                          <i data-lucide="arrow-right"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

        </div>

        <!-- Right Column: Sidebar (Pricing, Actions) -->
        <aside style="display: flex; flex-direction: column; gap: 1.5rem;">
          
          <!-- Procurement Action Card -->
          <div class="card" style="padding: 1.5rem; border-radius: var(--radius-lg); background-color: var(--white); border-color: var(--slate-200);">
            
            <div style="margin-bottom: 1.25rem;">
              <span style="font-size: 0.65rem; font-weight: 700; color: var(--slate-400); text-transform: uppercase;">Procurement Starting at</span>
              <div style="display: flex; align-items: baseline; gap: 0.35rem; margin-top: 0.15rem;">
                <span id="detail-price-value" style="font-size: 1.75rem; font-weight: 800; color: var(--slate-900);">
                  ${prod.price > 0 ? 'INR ' + (prod.price * 82.5).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'Get Quote'}
                </span>
                <span id="detail-price-period" style="font-size: 0.75rem; color: var(--slate-400);">${prod.price > 0 ? '/ month' : ''}</span>
              </div>
              ${prod.originalPrice && prod.originalPrice > prod.price ? `
                <div style="font-size: 0.75rem; color: var(--error-red); font-weight: 600; margin-top: 0.15rem;">
                  Regular price: <span style="text-decoration: line-through;">INR ${(prod.originalPrice * 82.5).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span> (Save ${Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100)}%)
                </div>
              ` : ''}
            </div>

            <hr style="border: none; border-top: 1px solid var(--slate-100); margin: 0 0 1.25rem 0;">

            <!-- Stock Status -->
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem;">
              <span style="font-size: 0.75rem; font-weight: 600; color: var(--slate-500);">Inventory Level:</span>
              ${stockStatusHTML}
            </div>

            <!-- Forms for Add to Cart -->
            ${stockStatus !== 'out_of_stock' ? `
              <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; background-color: var(--slate-50); border: 1px solid var(--slate-200); padding: 0.35rem 0.75rem; border-radius: var(--radius-md);">
                  <span style="font-size: 0.75rem; font-weight: 600; color: var(--slate-600);">Billing Cycle:</span>
                  <select id="detail-plan-select" style="border: none; background: none; font-size: 0.85rem; font-weight: 700; text-align: right; outline: none; direction: rtl; cursor: pointer; color: var(--slate-900);">
                    <option value="monthly">Monthly Plan</option>
                    <option value="yearly">Yearly Plan (Save 10%)</option>
                  </select>
                </div>
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; background-color: var(--slate-50); border: 1px solid var(--slate-200); padding: 0.35rem 0.75rem; border-radius: var(--radius-md);">
                  <span style="font-size: 0.75rem; font-weight: 600; color: var(--slate-600);">User Licenses:</span>
                  <input type="number" id="detail-qty-input" value="1" min="1" max="${stockQty}" style="width: 60px; border: none; background: none; font-size: 0.85rem; font-weight: 700; text-align: right; outline: none;">
                </div>
                
                <button onclick="handleSPAAdaToCart()" class="btn btn-primary btn-sm" style="width: 100%; padding: 0.65rem; font-weight: 700; font-size: 0.85rem;">
                  Add to Procurement Cart
                </button>
                <button onclick="handleSPABuyNow()" class="btn btn-secondary btn-sm" style="width: 100%; padding: 0.65rem; font-weight: 700; font-size: 0.85rem; background-color: var(--slate-900); color: white; border-color: var(--slate-900);">
                  Buy Now
                </button>
              </div>
            ` : `
              <button class="btn btn-primary btn-sm" disabled style="width: 100%; padding: 0.65rem;">Out of Stock</button>
            `}

            <!-- Compare and Wishlist actions stacked -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-top: 1rem;">
              <!-- Compare Matrix Button -->
              <button onclick="toggleCompareState('${prod.id}', this)" class="btn btn-outline btn-xs ${isCompared ? 'active' : ''}" style="text-align: center; padding: 0.4rem; font-size: 0.7rem; display: flex; align-items: center; justify-content: center; gap: 0.25rem;">
                <i data-lucide="columns" style="width: 0.8rem; height: 0.8rem;"></i> ${isCompared ? 'Compared' : 'Compare Spec'}
              </button>

              <!-- Wishlist Button -->
              <button onclick="toggleSPAWishlist('${prod.id}', this)" id="detail-wishlist-btn" class="btn btn-outline btn-xs" style="text-align: center; padding: 0.4rem; font-size: 0.7rem; display: flex; align-items: center; justify-content: center; gap: 0.25rem;">
                <i data-lucide="heart" style="width: 0.8rem; height: 0.8rem;"></i> Save Stack
              </button>
            </div>

          </div>

        </aside>

      </div>

    </div>
  `;
}

function setupDetailEvents(productId) {
  const prod = products.find(p => p.id === productId) || products[0];
  appState.detailState = {
    activeProduct: prod,
    quantity: 1,
    billingCycle: 'monthly'
  };

  // Initialize display price
  updateSPADetailPrice();

  // 1. Hover Zoom Magnifier Effect
  const primaryImg = document.getElementById('detail-primary-image');
  if (primaryImg) {
    primaryImg.style.transition = 'transform 0.1s ease-out';
    primaryImg.addEventListener('mousemove', (e) => {
      const rect = primaryImg.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      primaryImg.style.transformOrigin = `${x}% ${y}%`;
      primaryImg.style.transform = 'scale(2.2)';
    });
    primaryImg.addEventListener('mouseleave', () => {
      primaryImg.style.transform = 'scale(1)';
      primaryImg.style.transformOrigin = 'center center';
    });
  }

  // 2. 360-Degree Drag Rotation Simulation
  const mediaContainer = document.querySelector('.showcase-media-container');
  if (primaryImg && mediaContainer) {
    mediaContainer.classList.add('draggable');
    
    // Add rotate badge if it doesn't exist
    if (!mediaContainer.querySelector('.badge-360-rotation')) {
      const badge360 = document.createElement('div');
      badge360.className = 'badge-360-rotation';
      badge360.innerHTML = '<i data-lucide="rotate-3d" style="width:0.8rem;height:0.8rem;"></i> Drag to Rotate 360°';
      mediaContainer.appendChild(badge360);
      if (window.lucide) window.lucide.createIcons();
    }

    let isDragging = false;
    let startX = 0;
    let currentIdx = 0;
    
    // List of images to cycle through
    const images = [
      prod.imageUrl,
      'assets/media__1781084322621.png',
      'assets/media__1781084687510.png',
      'assets/media__1781323496674.png',
      'assets/quickbooks.png'
    ];

    mediaContainer.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX;
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - startX;
      const threshold = 35; // px drag to rotate
      if (Math.abs(deltaX) > threshold) {
        const steps = Math.floor(deltaX / threshold);
        let newIdx = (currentIdx - steps) % images.length;
        if (newIdx < 0) newIdx += images.length;

        primaryImg.src = images[newIdx];
        
        // Update thumbnails border
        const thumbs = document.querySelectorAll('.thumbnails-carousel .thumb-frame');
        if (thumbs[newIdx]) {
          thumbs.forEach(t => t.classList.remove('active'));
          thumbs[newIdx].classList.add('active');
        }

        startX = e.clientX;
        currentIdx = newIdx;
      }
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // Touch Support
    mediaContainer.addEventListener('touchstart', (e) => {
      isDragging = true;
      startX = e.touches[0].clientX;
    });

    mediaContainer.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      const deltaX = e.touches[0].clientX - startX;
      const threshold = 35;
      if (Math.abs(deltaX) > threshold) {
        const steps = Math.floor(deltaX / threshold);
        let newIdx = (currentIdx - steps) % images.length;
        if (newIdx < 0) newIdx += images.length;

        primaryImg.src = images[newIdx];
        
        const thumbs = document.querySelectorAll('.thumbnails-carousel .thumb-frame');
        if (thumbs[newIdx]) {
          thumbs.forEach(t => t.classList.remove('active'));
          thumbs[newIdx].classList.add('active');
        }

        startX = e.touches[0].clientX;
        currentIdx = newIdx;
      }
    });

    mediaContainer.addEventListener('touchend', () => {
      isDragging = false;
    });
  }

  // 3. E-commerce select/input bindings
  const planSelect = document.getElementById('detail-plan-select');
  if (planSelect) {
    planSelect.addEventListener('change', (e) => {
      appState.detailState.billingCycle = e.target.value;
      updateSPADetailPrice();
    });
  }

  const qtyInput = document.getElementById('detail-qty-input');
  if (qtyInput) {
    qtyInput.addEventListener('change', (e) => {
      let val = parseInt(e.target.value);
      const stockQty = prod.stockQty !== undefined ? prod.stockQty : 25;
      if (isNaN(val) || val < 1) val = 1;
      if (val > stockQty) val = stockQty;
      e.target.value = val;
      appState.detailState.quantity = val;
    });
  }

  // Initialize wishlist state representation
  updateSPAWishlistBtnState(prod.id);
}

function switchDetailTab(tabName, btnElement) {
  btnElement.parentNode.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  btnElement.classList.add('active');

  const panelsContainer = btnElement.parentNode.nextElementSibling;
  panelsContainer.querySelectorAll('.tab-content-panel').forEach(p => p.classList.remove('active'));
  
  const targetPanel = document.getElementById(`detail-tab-${tabName}`);
  if (targetPanel) targetPanel.classList.add('active');
  
  if (window.lucide) window.lucide.createIcons();
}

function playDemoVideoMock() {
  showToast("Launching simulated sandboxed test-drive environment...", "info");
  setTimeout(() => {
    showToast("Interactive demo video environment loaded successfully.", "success");
  }, 1000);
}


// ----------------------------------------------------
// PAGE 4: PRODUCT COMPARISON PAGE HTML & LOGIC
// ----------------------------------------------------
function getCompareHTML() {
  const selectedProds = products.filter(p => appState.comparedProductIds.includes(p.id));
  
  // Custom Selectable Chips instead of raw checkboxes
  const selectionCheckboxesHTML = products.map(p => {
    const isChecked = appState.comparedProductIds.includes(p.id);
    return `
      <div onclick="toggleCompareCheckbox('${p.id}')" class="compare-selection-chip ${isChecked ? 'active' : ''}">
        <div class="chip-checkbox-box">
          ${isChecked ? '<i data-lucide="check" style="width: 0.8rem; height: 0.8rem; stroke-width: 3;"></i>' : ''}
        </div>
        <span class="chip-text">${p.name}</span>
      </div>
    `;
  }).join('');

  let tableContent = '';
  
  if (selectedProds.length === 0) {
    tableContent = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 4.5rem; color: var(--slate-400);">
          <div style="background-color: var(--slate-100); width: 4rem; height: 4rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem auto; color: var(--slate-400);">
            <i data-lucide="columns" style="width: 2rem; height: 2rem;"></i>
          </div>
          <h4 style="font-size: 1.1rem; font-weight: 700; color: var(--slate-800); margin-bottom: 0.25rem;">No Products Selected for Comparison</h4>
          <p style="font-size: 0.8rem; color: var(--slate-500); max-width: 420px; margin: 0 auto 1.5rem auto;">Select 2 to 4 products from the selectable chips above to compare price, rating, deployment, features and pros/cons.</p>
        </td>
      </tr>
    `;
  } else {
    tableContent = `
      <!-- Column Header Row -->
      <tr class="comp-header-row">
        <th style="width: 220px; font-size: 0.85rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Product specs</th>
        ${selectedProds.map(p => `
          <td>
            <div style="position: relative; display: flex; align-items: center; gap: 0.65rem; padding-right: 1.5rem;">
              <div style="width: 2.25rem; height: 2.25rem; border-radius: var(--radius-sm); border: 1px solid var(--slate-200); display: flex; align-items: center; justify-content: center; font-weight: 800; color: var(--primary-blue); font-size: 1.1rem; background-color: var(--white); flex-shrink: 0; box-shadow: var(--shadow-sm);">
                ${p.brand[0]}
              </div>
              <div>
                <h4 style="font-size: 0.85rem; font-weight: 800; color: var(--slate-900); line-height: 1.25; margin: 0;">${p.name}</h4>
                <div style="display: flex; gap: 0.25rem; align-items: center; margin-top: 0.25rem;">
                  <span class="badge badge-verified" style="font-size: 0.6rem; padding: 0.1rem 0.35rem;"><i data-lucide="shield-check" style="width: 0.6rem; height: 0.6rem;"></i> Verified</span>
                </div>
              </div>
              
              <!-- Remove button absolute top-right -->
              <button onclick="toggleCompareCheckbox('${p.id}')" style="position: absolute; right: 0; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--slate-400); cursor: pointer; display: flex; align-items: center; justify-content: center;" title="Remove product">
                <i data-lucide="x-circle" style="width: 1.15rem; height: 1.15rem;"></i>
              </button>
            </div>
          </td>
        `).join('')}
      </tr>

      <!-- Brand Row -->
      <tr>
        <td class="specs-label-col">Brand / Vendor</td>
        ${selectedProds.map(p => `
          <td style="font-weight: 600; color: var(--slate-800);">${p.brand}</td>
        `).join('')}
      </tr>

      <!-- Category Row -->
      <tr>
        <td class="specs-label-col">Category</td>
        ${selectedProds.map(p => `
          <td style="color: var(--slate-600);">${p.category}</td>
        `).join('')}
      </tr>

      <!-- Pricing Row -->
      <tr>
        <td class="specs-label-col">Starting Price</td>
        ${selectedProds.map(p => `
          <td>
            <div style="font-size: 1.15rem; font-weight: 800; color: var(--slate-900);">${p.price > 0 ? `$${p.price.toFixed(2)}` : 'Custom Quote'}</div>
            <span style="font-size: 0.7rem; color: var(--slate-400); font-weight: 500;">${p.price > 0 ? 'per user / month' : 'Enterprise Contract'}</span>
          </td>
        `).join('')}
      </tr>

      <!-- Rating Row -->
      <tr>
        <td class="specs-label-col">Rating & Quality Score</td>
        ${selectedProds.map(p => `
          <td>
            <div style="display: flex; align-items: center; gap: 0.35rem;">
              <div style="display: flex; align-items: center; gap: 0.15rem; background-color: rgba(245, 158, 11, 0.08); padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: 700; font-size: 0.8rem; color: #d97706;">
                <i data-lucide="star" style="width: 0.8rem; height: 0.8rem; fill: #f59e0b; color: #f59e0b;"></i>
                <span>${p.rating}</span>
              </div>
              <span style="font-size: 0.7rem; color: var(--slate-400); font-weight: 500;">(${p.reviewsCount} reviews)</span>
            </div>
          </td>
        `).join('')}
      </tr>

      <!-- Deployment Row -->
      <tr>
        <td class="specs-label-col">Deployment Type</td>
        ${selectedProds.map(p => `
          <td><span style="font-size: 0.8rem; font-weight: 500;">${p.deployment}</span></td>
        `).join('')}
      </tr>

      <!-- Support Row -->
      <tr>
        <td class="specs-label-col">Technical Support SLA</td>
        ${selectedProds.map(p => `
          <td><span style="font-size: 0.8rem; font-weight: 500; color: var(--slate-700);">${p.support}</span></td>
        `).join('')}
      </tr>

      <!-- Key Features Row -->
      <tr>
        <td class="specs-label-col">Key Features</td>
        ${selectedProds.map(p => `
          <td>
            <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.45rem; padding: 0; margin: 0;">
              ${p.features.slice(0, 3).map(feat => `
                <li style="font-size: 0.75rem; color: var(--slate-600); display: flex; align-items: start; gap: 0.35rem; line-height: 1.3;">
                  <i data-lucide="check" style="width: 0.85rem; height: 0.85rem; color: var(--primary-green); flex-shrink: 0; margin-top: 0.15rem; stroke-width: 3;"></i>
                  <span>${feat}</span>
                </li>
              `).join('')}
            </ul>
          </td>
        `).join('')}
      </tr>

      <!-- Pros Row -->
      <tr>
        <td class="specs-label-col">Highlighted Pros</td>
        ${selectedProds.map(p => `
          <td>
            <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.45rem; padding: 0; margin: 0;">
              ${p.pros.slice(0, 2).map(pro => `
                <li style="font-size: 0.75rem; color: var(--slate-600); display: flex; align-items: start; gap: 0.35rem; line-height: 1.3;">
                  <i data-lucide="plus" style="width: 0.85rem; height: 0.85rem; color: var(--primary-green); flex-shrink: 0; margin-top: 0.15rem; stroke-width: 3;"></i>
                  <span>${pro}</span>
                </li>
              `).join('')}
            </ul>
          </td>
        `).join('')}
      </tr>

      <!-- Considerations Row -->
      <tr>
        <td class="specs-label-col">Considerations</td>
        ${selectedProds.map(p => `
          <td>
            <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.45rem; padding: 0; margin: 0;">
              ${p.cons.slice(0, 2).map(con => `
                <li style="font-size: 0.75rem; color: var(--slate-600); display: flex; align-items: start; gap: 0.35rem; line-height: 1.3;">
                  <i data-lucide="minus" style="width: 0.85rem; height: 0.85rem; color: #ef4444; flex-shrink: 0; margin-top: 0.15rem; stroke-width: 3;"></i>
                  <span>${con}</span>
                </li>
              `).join('')}
            </ul>
          </td>
        `).join('')}
      </tr>

      <!-- Best Use Case Row -->
      <tr>
        <td class="specs-label-col">Recommended For</td>
        ${selectedProds.map(p => `
          <td style="font-size: 0.75rem; color: var(--slate-600); line-height: 1.4; font-weight: 500;">${p.bestUseCase}</td>
        `).join('')}
      </tr>

      <!-- Actions Row -->
      <tr>
        <td class="specs-label-col" style="background-color: var(--slate-50);">Deployment Actions</td>
        ${selectedProds.map(p => `
          <td>
            <div style="display: flex; flex-direction: column; gap: 0.45rem;">
              <a href="#demo?product=${p.id}" class="btn btn-primary btn-sm" style="width: 100%; font-size: 0.75rem; padding: 0.5rem 0;">Request Free Demo</a>
              <a href="#detail?id=${p.id}" class="btn btn-outline btn-sm" style="width: 100%; font-size: 0.75rem; padding: 0.5rem 0;">View Full Specs</a>
            </div>
          </td>
        `).join('')}
      </tr>
    `;
  }

  return `
    <div style="padding-top: 0.5rem;">
      <div style="margin-bottom: 1.5rem;">
        <span style="font-size: 0.75rem; color: var(--slate-500);"><a href="#home" style="color: inherit; text-decoration: none;">Home</a> &gt; Compare Tool</span>
        <h1 style="font-size: 1.75rem; margin-top: 0.25rem;">B2B Product Comparison Matrix</h1>
      </div>

      <!-- Add Product Checklist Selection Area (Card chips style) -->
      <div class="card" style="padding: 1.5rem; margin-bottom: 1.5rem; border-radius: var(--radius-lg);">
        <h4 style="margin-bottom: 1rem; display: flex; align-items: center; gap: 0.35rem; font-size: 0.95rem; font-weight: 700; color: var(--slate-900);"><i data-lucide="plus-circle" style="color: var(--primary-blue); width: 1.15rem; height: 1.15rem;"></i> Select Products (Max 4 for comparison)</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 0.75rem;" id="compare-selection-grid">
          ${selectionCheckboxesHTML}
        </div>
      </div>

      <!-- Comparison Matrix Table -->
      <div class="comparison-table-wrapper" style="border-radius: var(--radius-lg);">
        <table class="comp-table">
          <tbody>
            ${tableContent}
          </tbody>
        </table>
      </div>

    </div>
  `;
}

function setupCompareEvents() {}

function toggleCompareCheckbox(prodId) {
  const idx = appState.comparedProductIds.indexOf(prodId);
  const prod = products.find(p => p.id === prodId);
  
  if (idx > -1) {
    appState.comparedProductIds.splice(idx, 1);
    showToast(`${prod.name} removed from comparison`, 'info');
  } else {
    if (appState.comparedProductIds.length >= 4) {
      showToast("Maximum of 4 products can be compared at one time.", "info");
      return;
    }
    appState.comparedProductIds.push(prodId);
    showToast(`${prod.name} added to comparison`, 'success');
  }
  
  const appContainer = document.getElementById('app-container');
  appContainer.innerHTML = getCompareHTML();
  updateHeaderCounters();
  
  if (window.lucide) window.lucide.createIcons();
}


// ----------------------------------------------------
// PAGE 5: BUSINESS SOLUTIONS PACKAGES HTML
// ----------------------------------------------------
function getPackagesHTML() {
  const packagesListHTML = solutionPackages.map(pkg => `
    <div class="card" style="display: flex; flex-direction: column; justify-content: space-between; border-radius: var(--radius-lg);">
      <div style="background: var(--primary-blue); color: white; padding: 1.25rem;">
        <span class="badge" style="background-color: rgba(255,255,255,0.15); color: white; border: 1px solid rgba(255,255,255,0.2); font-size:0.6rem;">${pkg.bestFor}</span>
        <h3 style="color: white; font-size: 1.1rem; margin-top: 0.25rem;">${pkg.name}</h3>
      </div>

      <div style="padding: 1.25rem; flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <p style="font-size: 0.8rem; color: var(--slate-600); margin-bottom: 1rem; line-height: 1.4;">${pkg.description}</p>
          
          <div style="font-size: 0.65rem; font-weight: 700; color: var(--slate-400); text-transform: uppercase; margin-bottom: 0.35rem;">INCLUDED TECH</div>
          <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.35rem; margin-bottom: 1rem;">
            ${pkg.included.map(inc => `<li style="font-size: 0.75rem; color: var(--slate-700); display: flex; align-items: start; gap: 0.35rem;"><i data-lucide="check" style="color: var(--primary-green); width: 0.8rem; flex-shrink:0;"></i> ${inc}</li>`).join('')}
          </ul>
        </div>

        <div style="border-top: 1px solid var(--slate-100); padding-top: 1rem; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <span style="font-size: 0.65rem; color: var(--slate-400);">Pricing</span>
            <div style="font-size: 1rem; font-weight: 800; color: var(--slate-900);">${pkg.price.split(' ')[0]}</div>
          </div>
          <a href="#demo?package=${pkg.id}" class="btn btn-primary btn-sm" style="font-size:0.75rem; padding: 0.4rem 0.75rem;">Onboard</a>
        </div>
      </div>
    </div>
  `).join('');

  return `
    <div style="padding-top: 0.5rem;">
      <div style="margin-bottom: 2rem; text-align: center;">
        <span class="badge badge-verified" style="margin-bottom: 0.5rem;">SOLUTION KITS</span>
        <h1 style="font-size: 2rem; font-weight: 800; margin-bottom: 0.5rem;">Consolidated Business Kits</h1>
        <p style="color: var(--slate-500); max-width: 600px; margin: 0 auto; font-size: 0.85rem;">Procure bundled licenses, security devices, and setup consulting on single simplified contracts.</p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
        ${packagesListHTML}
      </div>
    </div>
  `;
}

function setupPackagesEvents() {}


// ----------------------------------------------------
// PAGE 6: REQUEST DEMO / GET QUOTE PAGE HTML
// ----------------------------------------------------
function getDemoHTML(params) {
  let targetProductName = '';
  let targetPackageName = '';
  
  if (params.product) {
    const prod = products.find(p => p.id === params.product);
    if (prod) targetProductName = prod.name;
  }
  if (params.package) {
    const pkg = solutionPackages.find(p => p.id === params.package);
    if (pkg) targetPackageName = pkg.name;
  }

  const titleText = params.quote ? 'Request Official B2B Quote' : 'Schedule Stack Demo';
  
  return `
    <div style="padding-top: 0.5rem;">
      <div class="demo-layout">
        
        <!-- Form -->
        <div class="card" style="padding: 1.75rem; border-radius: var(--radius-lg);">
          <h2 style="font-size: 1.5rem; margin-bottom: 0.35rem; font-weight:800;">${titleText}</h2>
          <p style="color: var(--slate-500); margin-bottom: 1.5rem; font-size: 0.8rem;">Submit your corporate specifications to set up configuration pathways.</p>

          <form id="lead-gen-form" onsubmit="handleDemoFormSubmit(event)">
            
            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">Contact Name *</label>
                <input type="text" id="demo-name" class="form-input" required placeholder="Shiyas Ahmad">
              </div>
              <div class="form-group">
                <label class="form-label">Corporate Email Address *</label>
                <input type="email" id="demo-email" class="form-input" required placeholder="shiyas@company.com">
              </div>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">Company Name *</label>
                <input type="text" id="demo-company" class="form-input" required placeholder="Apex Digital Corp">
              </div>
              <div class="form-group">
                <label class="form-label">Phone Number *</label>
                <input type="tel" id="demo-phone" class="form-input" required placeholder="+1 (555) 000-0000">
              </div>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">Business Scale *</label>
                <select id="demo-scale" class="form-select" required style="font-size:0.8rem; padding:0.6rem;">
                  <option value="1-10">1 - 10 Users</option>
                  <option value="10-50">10 - 50 Users</option>
                  <option value="50-250">50 - 250 Users</option>
                  <option value="250+">250+ Users</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Product of Interest *</label>
                <input type="text" id="form-product-interest" class="form-input" value="${targetProductName || targetPackageName || ''}" required placeholder="e.g. Cisco Firewall">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Message / Details</label>
              <textarea class="form-textarea" rows="3" placeholder="Briefly write your custom compliance or deployment parameters..."></textarea>
            </div>

            <button type="submit" class="btn btn-primary btn-sm" style="width: 100%; padding: 0.75rem;">Submit Request</button>

          </form>

          <!-- Success state -->
          <div id="demo-success-overlay" style="display: none; text-align: center; padding: 2rem 1rem;">
            <div style="background-color: rgba(16, 185, 129, 0.1); color: var(--primary-green); width: 3.5rem; height: 3.5rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem auto;">
              <i data-lucide="check-circle" style="width: 2rem; height: 2rem;"></i>
            </div>
            <h2 style="font-size: 1.5rem; margin-bottom: 0.25rem; color: var(--slate-900);">Thank you!</h2>
            <p style="color: var(--slate-600); max-width: 400px; margin: 0 auto 1.5rem auto; font-size: 0.85rem;">Our expert B2B deployment team has received your enquiry. We will contact you soon.</p>
            <a href="#home" class="btn btn-primary btn-sm">Return to Explore</a>
          </div>

        </div>

        <!-- Right Trust sidebar panel -->
        <aside>
          <div class="card" style="padding: 1.5rem; background-color: var(--white); border-radius: var(--radius-lg); border-color: var(--slate-200);">
            <h3 style="font-size: 1rem; margin-bottom: 1rem;">Why request through TechnoStore360?</h3>
            <ul style="list-style: none; display: flex; flex-direction: column; gap: 1rem;">
              <li style="display: flex; gap: 0.5rem; align-items: start; font-size: 0.8rem;">
                <i data-lucide="headset" style="color: var(--primary-blue); width: 1.15rem; flex-shrink: 0;"></i>
                <div>
                  <strong>Free Architecture consultation:</strong> Talk to cloud specialists who structure integrations for free.
                </div>
              </li>
              <li style="display: flex; gap: 0.5rem; align-items: start; font-size: 0.8rem;">
                <i data-lucide="lock" style="color: var(--primary-green); width: 1.15rem; flex-shrink: 0;"></i>
                <div>
                  <strong>Secure Escrow Clearance:</strong> Your financial profiles are protected under compliance certificates.
                </div>
              </li>
            </ul>
          </div>
        </aside>

      </div>
    </div>
  `;
}

function setupDemoEvents() {}

async function handleDemoFormSubmit(e) {
  e.preventDefault();
  
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn ? submitBtn.innerHTML : 'Submit Request';
  if (submitBtn) {
    submitBtn.innerHTML = "Submitting...";
    submitBtn.disabled = true;
  }

  const company = document.getElementById('demo-company') ? document.getElementById('demo-company').value.trim() : 'Anonymous Corp';
  const product = document.getElementById('form-product-interest') ? document.getElementById('form-product-interest').value.trim() : 'General Tech Solutions';
  const scale = document.getElementById('demo-scale') ? document.getElementById('demo-scale').value : '1-10';
  
  // Estimate deal value based on business scale
  let value = 15000;
  if (scale === '1-10') value = 5000 + Math.floor(Math.random() * 5000);
  else if (scale === '10-50') value = 15000 + Math.floor(Math.random() * 15000);
  else if (scale === '50-250') value = 50000 + Math.floor(Math.random() * 20000);
  else if (scale === '250+') value = 120000 + Math.floor(Math.random() * 50000);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const today = new Date();
  const dateStr = `${months[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;
  const newId = "lead-" + Math.floor(100 + Math.random() * 900);

  const lead = {
    id: newId,
    company,
    product,
    date: dateStr,
    status: "Initial Contact",
    value
  };

  try {
    if (window.supabase) {
      const supabaseUrl = "https://blxqhmgayiuagnckmhcf.supabase.co";
      const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJseHFobWdheGl1YWduY2ttaGNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNTE2MDAsImV4cCI6MjA5NjkyNzYwMH0._cSOYcUBmFx8I43lenYaUTlaF4jNUm_kg6Ha06AZ8qk";
      const client = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
      
      const { error } = await client
        .from('leads')
        .insert([lead]);

      if (error) {
        console.error("Supabase insert error:", error);
      } else {
        console.log("Successfully saved lead to Supabase.");
      }
    }
  } catch (err) {
    console.error("Supabase insert exception:", err);
  }

  document.getElementById('lead-gen-form').style.display = 'none';
  document.getElementById('demo-success-overlay').style.display = 'block';
  if (window.lucide) window.lucide.createIcons();
}


// ----------------------------------------------------
// PAGE 7: RESELLER / AFFILIATE DASHBOARD HTML
// ----------------------------------------------------
function getResellerHTML() {
  const rs = resellerDashboardData;
  return `
    <div style="padding-top: 0.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.75rem;">
        <div>
          <span style="font-size: 0.75rem; color: var(--slate-500);"><a href="#home" style="color: inherit; text-decoration: none;">Home</a> &gt; Partner Desk</span>
          <h1 style="font-size: 1.75rem; margin-top: 0.25rem;">Reseller & Affiliate Dashboard</h1>
        </div>
        <div style="display: flex; gap: 0.35rem;">
          <button onclick="simulateAddLead()" class="btn btn-primary btn-sm"><i data-lucide="plus"></i> Add Lead</button>
          <button onclick="simulatePayoutTrigger()" class="btn btn-secondary btn-sm"><i data-lucide="dollar-sign"></i> Request Payout</button>
        </div>
      </div>

      <!-- Stat Cards -->
      <div class="dash-stat-grid" style="margin-bottom: 1.5rem;">
        <div class="dash-stat-card" style="border-radius: var(--radius-lg);">
          <div style="display: flex; justify-content: space-between; color: var(--slate-400); margin-bottom: 0.25rem; font-size:0.7rem;">REFERRAL LEADS</div>
          <div style="font-size: 1.5rem; font-weight: 800;" id="rs-stat-leads">${rs.stats.totalLeads}</div>
        </div>
        <div class="dash-stat-card" style="border-radius: var(--radius-lg);">
          <div style="display: flex; justify-content: space-between; color: var(--slate-400); margin-bottom: 0.25rem; font-size:0.7rem;">CLOSED WON</div>
          <div style="font-size: 1.5rem; font-weight: 800;" id="rs-stat-sales">${rs.stats.totalSales}</div>
        </div>
        <div class="dash-stat-card" style="border-radius: var(--radius-lg);">
          <div style="display: flex; justify-content: space-between; color: var(--slate-400); margin-bottom: 0.25rem; font-size:0.7rem;">PENDING COMMISSION</div>
          <div style="font-size: 1.5rem; font-weight: 800;" id="rs-stat-pending">${rs.stats.pendingCommission}</div>
        </div>
        <div class="dash-stat-card" style="border-radius: var(--radius-lg);">
          <div style="display: flex; justify-content: space-between; color: var(--slate-400); margin-bottom: 0.25rem; font-size:0.7rem;">PAID OUT</div>
          <div style="font-size: 1.5rem; font-weight: 800;">${rs.stats.paidCommission}</div>
        </div>
      </div>

      <!-- Link & Table -->
      <div class="reseller-split-grid">
        <div class="card" style="padding: 1.25rem; border-radius: var(--radius-lg);">
          <h3 style="font-size: 0.95rem; margin-bottom: 0.5rem;">Referral Link</h3>
          <div style="display: flex; gap: 0.35rem; border: 1px solid var(--slate-200); padding: 0.35rem; border-radius: var(--radius-md); background-color: var(--slate-50);">
            <input type="text" id="rs-referral-input" readonly value="${rs.referralLink}" style="flex: 1; border: none; background: none; outline: none; font-size: 0.8rem; font-family: monospace; color: var(--slate-700);">
            <button onclick="copyReferralLink()" class="btn btn-primary btn-sm" style="padding: 0.25rem 0.75rem; font-size:0.7rem;">Copy Link</button>
          </div>
        </div>
        <div class="card" style="padding: 1.25rem; border-radius: var(--radius-lg);">
          <h3 style="font-size: 0.95rem; margin-bottom: 0.35rem;">Commission Payouts</h3>
          <select class="form-select" onchange="appState.resellerReferral.payoutMethod = this.value; showToast('Payout gateway updated', 'success');" style="padding: 0.4rem; font-size: 0.75rem;">
            <option value="Bank Wire">Bank Wire Transfer</option>
            <option value="PayPal">PayPal</option>
          </select>
        </div>
      </div>

      <div class="reseller-split-grid-2">
        <div>
          <h3 style="font-size: 1.1rem; margin-bottom: 0.75rem;">Active Referrals</h3>
          <div class="dash-table-wrapper" style="border-radius: var(--radius-lg);">
            <table class="dash-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Product</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Margin</th>
                </tr>
              </thead>
              <tbody>
                ${rs.leads.map(lead => `
                  <tr>
                    <td style="font-weight: 600;">${lead.name}</td>
                    <td>${lead.product}</td>
                    <td>${lead.date}</td>
                    <td><span class="status-pill ${lead.status === 'Closed Won' ? 'status-paid' : 'status-pending'}" style="font-size:0.65rem;">${lead.status}</span></td>
                    <td style="font-weight: 700;">${lead.commission}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 style="font-size: 1.1rem; margin-bottom: 0.75rem;">Downloads</h3>
          <div class="card" style="padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem; border-radius: var(--radius-lg);">
            ${rs.marketingMaterials.map(mat => `
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--slate-100); padding-bottom: 0.5rem;">
                <div>
                  <h4 style="font-size: 0.8rem; font-weight: 600;">${mat.title}</h4>
                  <span style="font-size: 0.65rem; color: var(--slate-400);">${mat.size}</span>
                </div>
                <button onclick="downloadMockAsset('${mat.title}')" style="background: none; border: none; cursor: pointer; color: var(--primary-blue);"><i data-lucide="download" style="width: 1rem;"></i></button>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

    </div>
  `;
}

function setupResellerEvents() {}

function copyReferralLink() {
  const inp = document.getElementById('rs-referral-input');
  inp.select();
  document.execCommand('copy');
  showToast("Referral link copied!", "success");
}

function downloadMockAsset(title) {
  showToast(`Downloading: ${title}`, "info");
}

function simulateAddLead() {
  const name = prompt("Enter client company name:", "Helix Corp");
  if (!name) return;
  const product = prompt("Enter target product/package name:", "AI Kit");
  if (!product) return;

  const dateStr = new Date().toISOString().split('T')[0];
  resellerDashboardData.leads.unshift({
    name: name,
    product: product,
    date: dateStr,
    status: "Demo Scheduled",
    commission: "Pending"
  });
  resellerDashboardData.stats.totalLeads += 1;

  const appContainer = document.getElementById('app-container');
  appContainer.innerHTML = getResellerHTML();
  if (window.lucide) window.lucide.createIcons();
  showToast("Lead added successfully!", "success");
}

function simulatePayoutTrigger() {
  showToast(`Payout processing wired to ${appState.resellerReferral.payoutMethod}`, "success");
}


// ----------------------------------------------------
// PAGE 8: ADMIN DASHBOARD & FINANCE UI HTML & LOGIC
// ----------------------------------------------------
function getAdminHTML(activeTab) {
  const stats = adminDashboardData.stats;
  const menuLinks = [
    { id: 'dashboard', label: 'Overview', icon: 'bar-chart' },
    { id: 'approvals', label: 'Seller Approvals', icon: 'check-square' },
    { id: 'finance', label: 'Finance & Invoices', icon: 'file-text' },
    { id: 'orders', label: 'Orders Ledger', icon: 'shopping-cart' },
    { id: 'refunds', label: 'Refund Claims', icon: 'rotate-ccw' }
  ];

  const sidebarHTML = menuLinks.map(link => `
    <a href="#admin?tab=${link.id}" class="dash-menu-item ${activeTab === link.id ? 'active' : ''}" style="font-size:0.8rem; padding: 0.6rem 0.85rem; margin-bottom: 0.35rem;">
      <i data-lucide="${link.icon}" style="width: 1rem;"></i>
      <span>${link.label}</span>
    </a>
  `).join('');

  let panelContentHTML = '';

  if (activeTab === 'dashboard') {
    panelContentHTML = `
      <div class="dash-stat-grid" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); margin-bottom: 1.5rem;">
        <div class="dash-stat-card" style="border-radius: var(--radius-lg);">
          <div style="color: var(--slate-400); margin-bottom: 0.25rem; font-size: 0.7rem; font-weight: 700;">ANNUAL REVENUE</div>
          <div style="font-size: 1.5rem; font-weight: 800;">${stats.totalRevenue}</div>
        </div>
        <div class="dash-stat-card" style="border-radius: var(--radius-lg);">
          <div style="color: var(--slate-400); margin-bottom: 0.25rem; font-size: 0.7rem; font-weight: 700;">ACTIVE SUBSCRIPTIONS</div>
          <div style="font-size: 1.5rem; font-weight: 800;">${stats.activeSubscriptions}</div>
        </div>
        <div class="dash-stat-card" style="border-radius: var(--radius-lg);">
          <div style="color: var(--slate-400); margin-bottom: 0.25rem; font-size: 0.7rem; font-weight: 700;">SELLER CHECKS</div>
          <div style="font-size: 1.5rem; font-weight: 800;" id="admin-stat-seller-count">${appState.adminState.sellerApprovals.length}</div>
        </div>
      </div>

      <div class="reseller-split-grid">
        <div class="card" style="padding: 1.25rem; border-radius: var(--radius-lg);">
          <h3 style="font-size: 0.95rem; margin-bottom: 0.75rem;">Q2 Performance</h3>
          <div style="width: 100%; height: 180px;">
            <svg viewBox="0 0 500 200" style="width: 100%; height: 100%;">
              <path d="M 50 150 Q 150 120 250 80 T 450 40" fill="none" stroke="var(--primary-blue)" stroke-width="3"></path>
              <line x1="50" y1="180" x2="450" y2="180" stroke="var(--slate-200)"></line>
              <line x1="50" y1="20" x2="50" y2="180" stroke="var(--slate-200)"></line>
            </svg>
          </div>
        </div>
        <div class="card" style="padding: 1.25rem; border-radius: var(--radius-lg);">
          <h3 style="font-size: 0.95rem; margin-bottom: 0.75rem;">System Tasks</h3>
          <div style="display: flex; flex-direction: column; gap: 0.75rem; font-size: 0.8rem;">
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--slate-100); padding-bottom: 0.35rem;">
              <span>New Demos</span><strong>${stats.demoRequestsToday} requests</strong>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--slate-100); padding-bottom: 0.35rem;">
              <span>Pending Quotes</span><strong>${stats.quoteRequestsPending} pending</strong>
            </div>
          </div>
        </div>
      </div>
    `;
  } else if (activeTab === 'approvals') {
    panelContentHTML = `
      <h3 style="font-size: 1.1rem; margin-bottom: 0.75rem;">Seller Verification</h3>
      <div class="dash-table-wrapper" style="border-radius: var(--radius-lg);">
        <table class="dash-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Country</th>
              <th>Segment</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${appState.adminState.sellerApprovals.length === 0 ? `
              <tr><td colspan="5" style="text-align: center; padding: 2rem;">No pending approvals</td></tr>
            ` : appState.adminState.sellerApprovals.map((sel, idx) => `
              <tr>
                <td style="font-weight: 600;">${sel.company}</td>
                <td>${sel.country}</td>
                <td>${sel.category}</td>
                <td><span class="status-pill status-pending" style="font-size:0.65rem;">${sel.status}</span></td>
                <td>
                  <button onclick="approveSeller(${idx})" class="btn btn-primary btn-sm" style="padding: 0.2rem 0.5rem; font-size:0.7rem;">Approve</button>
                  <button onclick="rejectSeller(${idx})" class="btn btn-secondary btn-sm" style="padding: 0.2rem 0.5rem; font-size:0.7rem; color:#ef4444;">Reject</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } else if (activeTab === 'finance') {
    panelContentHTML = `
      <h3 style="font-size: 1.1rem; margin-bottom: 0.75rem;">Invoice Compiler</h3>
      <div class="reseller-split-grid">
        <div class="card" style="padding: 1.25rem; border-radius: var(--radius-lg);">
          <form onsubmit="handleInvoiceGenerate(event)">
            <div class="form-group">
              <label class="form-label" style="font-size:0.75rem;">Client</label>
              <select class="form-select" id="inv-client" required style="padding:0.4rem; font-size:0.75rem;">
                ${adminDashboardData.invoiceGeneration.clients.map(c => `<option value="${c}">${c}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" style="font-size:0.75rem;">Product</label>
              <select class="form-select" id="inv-product" onchange="updateInvoiceBasePrice(this.value)" required style="padding:0.4rem; font-size:0.75rem;">
                ${adminDashboardData.invoiceGeneration.products.map(p => `<option value="${p}">${p}</option>`).join('')}
              </select>
            </div>
            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label" style="font-size:0.75rem;">Base ($)</label>
                <input type="number" id="inv-price" class="form-input" value="990" required style="padding:0.4rem; font-size:0.75rem;">
              </div>
              <div class="form-group">
                <label class="form-label" style="font-size:0.75rem;">Tax (%)</label>
                <input type="number" id="inv-tax" class="form-input" value="18" required style="padding:0.4rem; font-size:0.75rem;">
              </div>
            </div>
            <button type="submit" class="btn btn-primary btn-sm" style="width: 100%; padding:0.6rem;">Generate Invoice</button>
          </form>
        </div>
        <div class="card" style="padding: 1.5rem; border-style: dashed; border-width: 2px; border-radius: var(--radius-lg);" id="invoice-preview-card">
          <div style="text-align: center; color: var(--slate-400); padding: 3rem 0;">
            <i data-lucide="printer" style="width: 2rem; height: 2rem; margin-bottom: 0.75rem;"></i>
            <p style="font-size: 0.75rem;">Select params and generate B2B doc.</p>
          </div>
        </div>
      </div>
    `;
  } else if (activeTab === 'orders') {
    panelContentHTML = `
      <h3 style="font-size: 1.1rem; margin-bottom: 0.75rem;">Ledger</h3>
      <div class="dash-table-wrapper" style="border-radius: var(--radius-lg);">
        <table class="dash-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Client</th>
              <th>Asset</th>
              <th>Value</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${appState.adminState.orders.map(ord => `
              <tr>
                <td style="font-family: monospace;">${ord.orderId}</td>
                <td style="font-weight: 600;">${ord.client}</td>
                <td>${ord.product.slice(0, 25)}...</td>
                <td style="font-weight: 700;">${ord.amount}</td>
                <td><span class="status-pill status-paid" style="font-size:0.65rem;">${ord.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } else if (activeTab === 'refunds') {
    panelContentHTML = `
      <h3 style="font-size: 1.1rem; margin-bottom: 0.75rem;">Refund claims</h3>
      <div class="dash-table-wrapper" style="border-radius: var(--radius-lg);">
        <table class="dash-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Client</th>
              <th>Product</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${appState.adminState.refundRequests.map((ref, idx) => `
              <tr>
                <td style="font-family: monospace;">${ref.id}</td>
                <td style="font-weight: 600;">${ref.client}</td>
                <td>${ref.product}</td>
                <td style="font-weight: 700;">${ref.amount}</td>
                <td><span class="status-pill ${ref.status === 'Approved' ? 'status-paid' : 'status-pending'}" style="font-size:0.65rem;">${ref.status}</span></td>
                <td>
                  ${ref.status === 'Pending' ? `
                    <button onclick="approveRefund(${idx})" class="btn btn-primary btn-sm" style="padding: 0.2rem 0.4rem; font-size:0.65rem;">Settle</button>
                  ` : `<span style="font-size: 0.75rem; color: var(--slate-400);">Settled</span>`}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  return `
    <div class="dashboard-layout">
      <aside class="dash-sidebar" style="background-color: var(--white); border: 1px solid var(--slate-200); border-radius: var(--radius-lg); padding: 1rem 0.5rem;">
        <nav>${sidebarHTML}</nav>
      </aside>
      <div>
        <header style="border-bottom: 1px solid var(--slate-200); padding-bottom: 0.5rem; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
          <h2 style="font-size: 1.25rem;">Admin Panel</h2>
        </header>
        ${panelContentHTML}
      </div>
    </div>
  `;
}

function setupAdminEvents(activeTab) {
  if (activeTab === 'finance') {
    const selector = document.getElementById('inv-product');
    if (selector) updateInvoiceBasePrice(selector.value);
  }
}

function approveSeller(idx) {
  const comp = appState.adminState.sellerApprovals[idx].company;
  appState.adminState.sellerApprovals.splice(idx, 1);
  showToast(`${comp} Approved!`, "success");
  const appContainer = document.getElementById('app-container');
  appContainer.innerHTML = getAdminHTML('approvals');
  if (window.lucide) window.lucide.createIcons();
}

function rejectSeller(idx) {
  const comp = appState.adminState.sellerApprovals[idx].company;
  appState.adminState.sellerApprovals.splice(idx, 1);
  showToast(`${comp} Rejected`, "info");
  const appContainer = document.getElementById('app-container');
  appContainer.innerHTML = getAdminHTML('approvals');
  if (window.lucide) window.lucide.createIcons();
}

function approveRefund(idx) {
  appState.adminState.refundRequests[idx].status = 'Approved';
  showToast("Escrow settled successfully.", "success");
  const appContainer = document.getElementById('app-container');
  appContainer.innerHTML = getAdminHTML('refunds');
  if (window.lucide) window.lucide.createIcons();
}

function updateInvoiceBasePrice(prodName) {
  const priceInput = document.getElementById('inv-price');
  if (!priceInput) return;
  const foundProd = products.find(p => prodName.includes(p.name) || p.name.includes(prodName));
  if (foundProd) {
    priceInput.value = foundProd.price;
  } else if (prodName.includes('Startup')) {
    priceInput.value = 299;
  } else if (prodName.includes('Retail')) {
    priceInput.value = 499;
  } else if (prodName.includes('Modern Office')) {
    priceInput.value = 599;
  } else if (prodName.includes('Zero-Trust')) {
    priceInput.value = 1499;
  } else if (prodName.includes('AI & Automation')) {
    priceInput.value = 899;
  } else {
    priceInput.value = 150;
  }
}

function handleInvoiceGenerate(e) {
  e.preventDefault();
  const client = document.getElementById('inv-client').value;
  const product = document.getElementById('inv-product').value;
  const basePrice = parseFloat(document.getElementById('inv-price').value);
  const taxRate = parseFloat(document.getElementById('inv-tax').value);
  const taxAmount = (basePrice * taxRate) / 100;
  const totalAmount = basePrice + taxAmount;
  const invoiceNum = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  const preview = document.getElementById('invoice-preview-card');
  if (preview) {
    preview.style.borderStyle = 'solid';
    preview.style.borderColor = 'var(--slate-200)';
    preview.style.backgroundColor = 'var(--white)';
    preview.innerHTML = `
      <div style="display: flex; justify-content: space-between; border-bottom: 2px solid var(--slate-800); padding-bottom: 0.5rem; margin-bottom: 1rem; font-size:0.8rem;">
        <strong>TechnoStore360</strong>
        <span style="font-family: monospace; font-weight:700;">${invoiceNum}</span>
      </div>
      <div style="font-size: 0.75rem; margin-bottom: 1rem;">
        <strong>Billed to:</strong> ${client}<br>
        <strong>Status:</strong> Paid
      </div>
      <div style="font-size: 0.75rem; border-top: 1px solid var(--slate-200); padding-top: 0.5rem;">
        <div>${product}</div>
        <div style="display:flex; justify-content:space-between; margin-top:0.5rem;"><span>Subtotal:</span> <span>$${basePrice.toFixed(2)}</span></div>
        <div style="display:flex; justify-content:space-between; font-weight:800; border-top:1px solid var(--slate-100); padding-top:0.25rem;"><span>Total:</span> <span>$${totalAmount.toFixed(2)}</span></div>
      </div>
      <button onclick="window.print()" class="btn btn-outline btn-sm" style="width:100%; margin-top:1rem; font-size:0.7rem; padding:0.4rem;">Print Invoice</button>
    `;
    if (window.lucide) window.lucide.createIcons();
    showToast("Invoice generated", "success");
  }
}


// ----------------------------------------------------
// PAGE 9: LOGIN / SIGN UP PAGE HTML & LOGIC
// ----------------------------------------------------
function getLoginHTML() {
  return `
    <div style="padding-top: 1rem;">
      <div class="auth-container card" style="border-radius: var(--radius-lg); min-height: auto;">
        
        <div class="auth-form-side" style="padding: 3rem 2rem;">
          <div style="text-align: center; margin-bottom: 1.5rem;">
            <h2 style="font-size: 1.5rem; margin-bottom: 0.25rem; font-weight: 800;">Welcome to TechnoStore360</h2>
            <p style="color: var(--slate-500); font-size: 0.8rem;">Access B2B procurements, partner portals, and dashboards.</p>
          </div>

          <div style="display: flex; border: 1px solid var(--slate-200); border-radius: var(--radius-md); overflow: hidden; margin-bottom: 1.5rem; background-color: var(--slate-50);">
            <button class="btn btn-secondary btn-sm auth-role-tab active" onclick="switchAuthRole('buyer', this)" style="flex: 1; border-radius: 0; background: none; border: none; font-size: 0.7rem; padding: 0.4rem;">Buyer</button>
            <button class="btn btn-secondary btn-sm auth-role-tab" onclick="switchAuthRole('reseller', this)" style="flex: 1; border-radius: 0; background: none; border: none; font-size: 0.7rem; padding: 0.4rem;">Partner</button>
            <button class="btn btn-secondary btn-sm auth-role-tab" onclick="switchAuthRole('admin', this)" style="flex: 1; border-radius: 0; background: none; border: none; font-size: 0.7rem; padding: 0.4rem;">Admin</button>
          </div>

          <form id="auth-main-form" onsubmit="handleAuthSubmit(event)">
            <div class="form-group">
              <label class="form-label" id="auth-login-label">Corporate Email</label>
              <input type="text" id="auth-login-input" required class="form-input" placeholder="e.g. shiyas@company.com">
            </div>
            <div class="form-group">
              <input type="password" required class="form-input" placeholder="••••••••" value="demo123">
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem;">
              <button type="submit" class="btn btn-primary btn-sm" style="width: 100%; padding:0.6rem;">Sign In</button>
              <button type="button" onclick="handleGoogleLoginMock()" class="btn btn-outline btn-sm" style="width: 100%; padding:0.6rem;">Sign in with Google B2B</button>
            </div>
          </form>
        </div>

        <div class="auth-banner-side" style="padding: 2.5rem; border-radius: var(--radius-lg); margin: 1rem;">
          <div>
            <span class="badge" style="background-color: rgba(255,255,255,0.15); color: white; border: 1px solid rgba(255,255,255,0.2);">SECURE GATEWAY</span>
            <h3 style="color: white; font-size: 1.35rem; margin-top: 0.75rem; line-height: 1.2;">Enterprise Grade Access</h3>
            <p style="color: rgba(255,255,255,0.8); font-size: 0.8rem; margin-top: 0.35rem;">Protected by AES-256 endpoint encryption compliance rules.</p>
          </div>
        </div>

      </div>
    </div>
  `;
}

function setupLoginEvents() {
  window._authRole = 'buyer';
}

function switchAuthRole(role, btn) {
  btn.parentNode.querySelectorAll('.auth-role-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  window._authRole = role;

  const label = document.getElementById('auth-login-label');
  const input = document.getElementById('auth-login-input');

  if (role === 'admin') {
    label.innerText = "Admin Account Username";
    input.placeholder = "e.g. admin_shiyas";
    input.value = "admin_shiyas";
  } else if (role === 'reseller') {
    label.innerText = "Partner Email";
    input.placeholder = "e.g. partner@reseller.com";
    input.value = "partner@reseller.com";
  } else {
    label.innerText = "Corporate Email";
    input.placeholder = "e.g. buyer@company.com";
    input.value = "buyer@company.com";
  }
}

function handleAuthSubmit(e) {
  e.preventDefault();
  const input = document.getElementById('auth-login-input');
  if (!input) return;

  const val = input.value.trim();
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  
  if (window._authRole !== 'admin' && !isEmail) {
    input.classList.remove('invalid');
    void input.offsetWidth; // Reflow to restart shake animation
    input.classList.add('invalid');
    showToast("Please enter a valid B2B corporate email address.", "error");
    return;
  }
  
  input.classList.remove('invalid');
  
  // Find submit button and add loader spinner
  const submitBtn = e.target.querySelector('button[type="submit"]');
  let originalBtnHTML = '';
  if (submitBtn) {
    originalBtnHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = `<span class="loading-spinner"></span>Verifying...`;
    submitBtn.disabled = true;
  }
  
  showToast("Verifying credentials...", "info");
  
  setTimeout(() => {
    if (submitBtn) {
      submitBtn.innerHTML = originalBtnHTML;
      submitBtn.disabled = false;
    }
    
    if (window._authRole === 'admin') {
      window.location.hash = '#admin';
      showToast("Administrator session authorized.", "success");
    } else if (window._authRole === 'reseller') {
      window.location.hash = '#reseller';
      showToast("Reseller Partner authorized.", "success");
    } else {
      window.location.hash = '#home';
      showToast("Welcome back!", "success");
    }
  }, 1200);
}

function handleGoogleLoginMock() {
  showToast("Connecting to Google OAuth...", "info");
  setTimeout(() => {
    window.location.hash = '#home';
    showToast("SSO authorized.", "success");
  }, 800);
}


// ----------------------------------------------------
// BOOTSTRAP INITIALIZATION
// ----------------------------------------------------
async function syncSupabaseListings() {
  if (window.supabase) {
    try {
      const supabaseUrl = "https://blxqhmgayiuagnckmhcf.supabase.co";
      const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJseHFobWdheGl1YWduY2ttaGNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNTE2MDAsImV4cCI6MjA5NjkyNzYwMH0._cSOYcUBmFx8I43lenYaUTlaF4jNUm_kg6Ha06AZ8qk";
      const client = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
      
      const { data, error } = await client
        .from('listings')
        .select('*');
        
      if (!error && data && data.length > 0) {
        // Map database listings to products schema
        const dbProducts = data.map(lst => {
          const catId = lst.category ? lst.category.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-') : 'software-solutions';
          return {
            id: lst.id,
            name: lst.title,
            category: lst.category || 'Software Solutions',
            categoryId: catId,
            brand: lst.brand || 'Other',
            shortDesc: lst.desc || '',
            longDesc: lst.desc || '',
            rating: 4.5,
            reviewsCount: 120,
            price: parseFloat(lst.price) || 0,
            originalPrice: (parseFloat(lst.price) || 0) * 1.2,
            priceText: `$${parseFloat(lst.price).toFixed(2)} / mo`,
            dealHighlight: "Partner Deal",
            verified: true,
            demoAvailable: true,
            deployment: "Cloud / SaaS",
            businessType: "Enterprise & Mid-Market",
            support: "24/7 Live Support",
            bestUseCase: lst.desc || '',
            imageUrl: lst.img || 'assets/zoho.png',
            features: [
              "Enterprise integration capabilities",
              "Real-time analytics and reporting dashboard",
              "24/7 developer and partner support desk"
            ],
            pros: [
              "High performance and reliability",
              "Seamless integration",
              "Excellent value"
            ],
            cons: [
              "Requires initial setup support",
              "Documentation is detailed"
            ],
            plans: [
              { name: "Standard", price: `$${(parseFloat(lst.price) || 0).toFixed(2)}`, period: "month", features: ["Core features"] },
              { name: "Professional", price: `$${((parseFloat(lst.price) || 0) * 1.5).toFixed(2)}`, period: "month", features: ["Advanced controls"] },
              { name: "Enterprise", price: `$${((parseFloat(lst.price) || 0) * 2.5).toFixed(2)}`, period: "month", features: ["Custom dashboard"] }
            ]
          };
        });
        
        // Merge with existing products: replace matching IDs or prepend new ones
        dbProducts.forEach(dbProd => {
          const index = products.findIndex(p => p.id === dbProd.id);
          if (index !== -1) {
            products[index] = dbProd;
          } else {
            products.unshift(dbProd);
          }
        });
        
        // Re-render current page dynamically once database products are loaded
        const { route, params } = parseHash();
        renderPage(route, params);
      }
    } catch (err) {
      console.error("Supabase sync error on public client:", err);
    }
  }
}

function handleRoute() {
  const { route, params } = parseHash();
  renderPage(route, params);
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', handleRoute);

window.addEventListener('DOMContentLoaded', () => {
  handleRoute();
  syncSupabaseListings();
  
  // Mobile sidebar drawer toggler
  const sideToggle = document.getElementById('sidebar-toggle-btn');
  const sidebar = document.getElementById('app-sidebar');
  if (sideToggle && sidebar) {
    sideToggle.addEventListener('click', () => {
      sidebar.classList.toggle('active');
      const icon = sideToggle.querySelector('i');
      if (sidebar.classList.contains('active')) {
        icon.setAttribute('data-lucide', 'x');
      } else {
        icon.setAttribute('data-lucide', 'menu');
      }
      if (window.lucide) window.lucide.createIcons();
    });
  }

  // Header Search handler (fallback & main)
  const headerSearch = document.getElementById('header-search-input');
  if (headerSearch) {
    initSearchSuggestions('header-search-input');
    headerSearch.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const q = headerSearch.value.trim();
        window.location.hash = `#listing?search=${encodeURIComponent(q)}`;
        headerSearch.value = '';
      }
    });
  }

  const headerMainSearch = document.getElementById('header-search-box');
  if (headerMainSearch) {
    initSearchSuggestions('header-search-box');
    headerMainSearch.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        handleSearchSubmit();
      }
    });
  }
});

// ----------------------------------------------------
// DYNAMIC PRICING AND DETAIL VIEW CONTROLLERS (Image 3 & 4)
// ----------------------------------------------------

function updateSPADetailPrice() {
  const planSelect = document.getElementById('detail-plan-select');
  const priceValue = document.getElementById('detail-price-value');
  const pricePeriod = document.getElementById('detail-price-period');
  if (!planSelect || !priceValue || !pricePeriod) return;

  const ds = appState.detailState;
  if (!ds || !ds.activeProduct) return;
  const basePrice = ds.activeProduct.price;
  const basePriceInr = basePrice * 82.5;

  if (planSelect.value === 'yearly') {
    const yearlyPrice = basePriceInr * 12 * 0.90;
    priceValue.textContent = 'INR ' + yearlyPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    pricePeriod.textContent = '/ year';
  } else {
    priceValue.textContent = 'INR ' + basePriceInr.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    pricePeriod.textContent = '/ month';
  }
}

function handleSPAAdaToCart() {
  const ds = appState.detailState;
  if (!ds || !ds.activeProduct) return;

  const prod = ds.activeProduct;
  const qty = ds.quantity;
  const cycle = ds.billingCycle;
  const basePrice = prod.price;
  const basePriceInr = basePrice * 82.5;
  
  let unitPrice = basePriceInr;
  let periodStr = 'month';
  if (cycle === 'yearly') {
    unitPrice = basePriceInr * 12 * 0.90;
    periodStr = 'year';
  }
  const total = unitPrice * qty;
  const formattedTotal = 'INR ' + total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  showToast(`Added ${qty} license(s) of ${prod.name} (${cycle} plan) to procurement cart! Total: ${formattedTotal}`, "success");
}

function handleSPABuyNow() {
  const ds = appState.detailState;
  if (!ds || !ds.activeProduct) return;

  const prod = ds.activeProduct;
  const qty = ds.quantity;
  const cycle = ds.billingCycle;
  const basePrice = prod.price;
  const basePriceInr = basePrice * 82.5;
  
  let unitPrice = basePriceInr;
  let periodStr = 'month';
  if (cycle === 'yearly') {
    unitPrice = basePriceInr * 12 * 0.90;
    periodStr = 'year';
  }
  const total = unitPrice * qty;
  const formattedTotal = 'INR ' + total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  showToast(`Proceeding to checkout for ${qty} license(s) of ${prod.name}. Total: ${formattedTotal}`, "success");
}

function toggleSPAWishlist(productId, btnEl) {
  if (!appState.wishlist) {
    appState.wishlist = [];
  }
  const idx = appState.wishlist.indexOf(productId);
  const prod = products.find(p => p.id === productId);
  if (idx > -1) {
    appState.wishlist.splice(idx, 1);
    showToast(`Removed ${prod ? prod.name : productId} from your Saved Stack`, 'info');
  } else {
    appState.wishlist.push(productId);
    showToast(`Added ${prod ? prod.name : productId} to your Saved Stack`, 'success');
  }
  updateSPAWishlistBtnState(productId, btnEl);
}

function updateSPAWishlistBtnState(productId, btnEl) {
  const el = btnEl || document.getElementById('detail-wishlist-btn');
  if (!el) return;
  if (!appState.wishlist) appState.wishlist = [];
  
  const isSaved = appState.wishlist.includes(productId);
  if (isSaved) {
    el.classList.add('active');
    el.style.color = 'var(--error-red)';
    el.style.borderColor = 'var(--error-red)';
    el.innerHTML = `<i data-lucide="heart" style="width: 0.8rem; height: 0.8rem; fill: currentColor;"></i> Saved`;
  } else {
    el.classList.remove('active');
    el.style.color = '';
    el.style.borderColor = '';
    el.innerHTML = `<i data-lucide="heart" style="width: 0.8rem; height: 0.8rem;"></i> Save Stack`;
  }
  if (window.lucide) window.lucide.createIcons();
}

function switchDetailThumbnail(src, frameElement) {
  const primaryImg = document.getElementById('detail-primary-image');
  if (primaryImg) {
    primaryImg.style.transition = 'opacity 0.15s ease-out';
    primaryImg.style.opacity = '0';
    setTimeout(() => {
      primaryImg.src = src;
      primaryImg.style.opacity = '1';
    }, 150);
  }
  if (frameElement) {
    frameElement.parentNode.querySelectorAll('.thumb-frame').forEach(f => f.classList.remove('active'));
    frameElement.classList.add('active');
  }
}

// ==========================================================================
// SEARCH SUGGESTIONS & AUTO-COMPLETE LOGIC
// ==========================================================================

function initSearchSuggestions(inputId) {
  const inputEl = document.getElementById(inputId);
  if (!inputEl) return;

  if (inputEl.parentNode) {
    if (!inputEl.parentNode.style.position) {
      inputEl.parentNode.style.position = 'relative';
    }
  }

  inputEl.addEventListener('input', () => {
    showSuggestions(inputEl);
  });
  inputEl.addEventListener('focus', () => {
    showSuggestions(inputEl);
  });

  document.addEventListener('click', (e) => {
    if (e.target !== inputEl && !inputEl.parentNode.contains(e.target)) {
      const suggestionsEl = document.getElementById(inputId + '-suggestions');
      if (suggestionsEl) suggestionsEl.style.display = 'none';
    }
  });
}

function showSuggestions(inputEl) {
  const query = inputEl.value.trim().toLowerCase();
  const inputId = inputEl.id;
  let suggestionsEl = document.getElementById(inputId + '-suggestions');
  
  if (!suggestionsEl) {
    suggestionsEl = document.createElement('div');
    suggestionsEl.id = inputId + '-suggestions';
    suggestionsEl.className = 'search-suggestions-dropdown';
    inputEl.parentNode.appendChild(suggestionsEl);
  }

  if (!query) {
    suggestionsEl.style.display = 'none';
    return;
  }

  // 1. Direct product name / brand matches
  const matchedProducts = products.filter(p => 
    p.name.toLowerCase().includes(query) || 
    p.brand.toLowerCase().includes(query) || 
    p.shortDesc.toLowerCase().includes(query)
  );

  // 2. Direct category matches
  const matchedCategories = categories.filter(c => 
    c.title.toLowerCase().includes(query)
  );

  // 3. Natural language intent matching
  const intents = [];
  if (query.includes('under') || query.includes('cheap') || query.includes('low') || query.includes('budget')) {
    const numMatch = query.match(/\d+/);
    if (numMatch) {
      const maxPrice = parseFloat(numMatch[0]);
      intents.push({
        type: 'price',
        label: `Products under $${maxPrice} / mo`,
        filter: (p) => p.price <= maxPrice && p.price > 0,
        hash: `#listing?price=${maxPrice}`
      });
    } else {
      intents.push({
        type: 'price',
        label: `Budget Products (under $50/mo)`,
        filter: (p) => p.price <= 50 && p.price > 0,
        hash: `#listing?price=50`
      });
    }
  }
  if (query.includes('free') || query.includes('demo') || query.includes('trial') || query.includes('test-drive')) {
    intents.push({
      type: 'demo',
      label: `Products with Free Demo Available`,
      filter: (p) => p.demoAvailable === true,
      hash: `#listing`
    });
  }
  if (query.includes('cloud') || query.includes('saas') || query.includes('online')) {
    intents.push({
      type: 'cloud',
      label: `Cloud & SaaS deployments`,
      filter: (p) => p.deployment.toLowerCase().includes('cloud') || p.deployment.toLowerCase().includes('saas'),
      hash: `#listing?deployment=cloud`
    });
  }
  if (query.includes('security') || query.includes('safe') || query.includes('protect') || query.includes('firewall')) {
    intents.push({
      type: 'security',
      label: `B2B Cybersecurity Solutions`,
      filter: (p) => p.category === 'Cloud & Security',
      hash: `#listing?category=cloud-security`
    });
  }
  if (query.includes('accounting') || query.includes('invoice') || query.includes('ledger') || query.includes('tax') || query.includes('erp')) {
    intents.push({
      type: 'finance',
      label: `Financial & Ledger Solutions`,
      filter: (p) => p.category === 'Business Automation',
      hash: `#listing?category=business-automation`
    });
  }
  if (query.includes('ai') || query.includes('gpt') || query.includes('bot') || query.includes('smart')) {
    intents.push({
      type: 'ai',
      label: `AI & Machine Learning Utilities`,
      filter: (p) => p.category === 'AI Tools',
      hash: `#listing?category=ai-tools`
    });
  }

  let html = '';

  // Render Category matches
  if (matchedCategories.length > 0) {
    html += `
      <div class="search-suggestions-group">
        <div class="search-suggestions-group-title">Suggested Categories</div>
        ${matchedCategories.map(cat => `
          <div class="search-suggestion-item" onclick="window.location.hash='#listing?category=${cat.id}'; document.getElementById('${inputId}').value='';">
            <div style="background-color: var(--slate-100); width: 1.5rem; height: 1.5rem; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: var(--accent);">
              <i data-lucide="${cat.icon || 'layers'}" style="width: 0.95rem; height: 0.95rem;"></i>
            </div>
            <div class="item-info">
              <span class="item-title">${cat.title}</span>
              <span class="item-desc">${cat.count} listings found</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // Render Natural Language intents
  if (intents.length > 0) {
    html += `
      <div class="search-suggestions-group">
        <div class="search-suggestions-group-title">Natural Language Queries</div>
        ${intents.map(intent => {
          const count = products.filter(intent.filter).length;
          return `
            <div class="search-suggestion-item" onclick="window.location.hash='${intent.hash}'; document.getElementById('${inputId}').value='';">
              <div style="background-color: rgba(43, 161, 251, 0.1); width: 1.5rem; height: 1.5rem; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: var(--accent);">
                <i data-lucide="sparkles" style="width: 0.95rem; height: 0.95rem;"></i>
              </div>
              <div class="item-info">
                <span class="item-title">${intent.label}</span>
                <span class="item-desc">${count} products matching intent</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // Render Product matches
  if (matchedProducts.length > 0) {
    html += `
      <div class="search-suggestions-group">
        <div class="search-suggestions-group-title">Products</div>
        ${matchedProducts.slice(0, 4).map(prod => {
          const startingPrice = prod.price > 0 ? 'INR ' + (prod.price * 82.5).toLocaleString('en-IN', { maximumFractionDigits: 0 }) : 'Get Quote';
          return `
            <div class="search-suggestion-item" onclick="window.location.hash='#detail?id=${prod.id}'; document.getElementById('${inputId}').value='';">
              <img src="${prod.imageUrl || 'assets/zoho_logo.png'}" alt="${prod.name}">
              <div class="item-info">
                <span class="item-title">${prod.name}</span>
                <span class="item-desc">Starting at ${startingPrice} / By ${prod.brand}</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // Personalized B2B Recommendation at the bottom
  let recommendedKit = solutionPackages[0];
  if (query.includes('security') || query.includes('safe') || query.includes('firewall') || query.includes('protect')) {
    recommendedKit = solutionPackages.find(p => p.id === 'security-kit') || recommendedKit;
  } else if (query.includes('ai') || query.includes('gpt') || query.includes('bot')) {
    recommendedKit = solutionPackages.find(p => p.id === 'ai-kit') || recommendedKit;
  } else if (query.includes('office') || query.includes('workspace')) {
    recommendedKit = solutionPackages.find(p => p.id === 'office-kit') || recommendedKit;
  } else if (query.includes('retail') || query.includes('store') || query.includes('pos') || query.includes('shop')) {
    recommendedKit = solutionPackages.find(p => p.id === 'retail-kit') || recommendedKit;
  }

  html += `
    <div class="search-suggestions-group">
      <div class="search-suggestions-personalized-box">
        <h5><i data-lucide="sparkles" style="width: 0.8rem; height: 0.8rem;"></i> AI Personalized B2B Bundle</h5>
        <p>Looking for a complete setup? We recommend the <strong>${recommendedKit.name}</strong> (${recommendedKit.bestFor}).</p>
        <a href="#packages" onclick="document.getElementById('${inputId}').value='';" style="font-size: 0.65rem; color: var(--accent); font-weight: 700; text-decoration: none; margin-top: 0.25rem; display: inline-block;">View Solution Kit &rarr;</a>
      </div>
    </div>
  `;

  if (html === '') {
    suggestionsEl.style.display = 'none';
  } else {
    suggestionsEl.innerHTML = html;
    suggestionsEl.style.display = 'block';
    if (window.lucide) window.lucide.createIcons();
  }
}

// ==========================================================================
// AI RECOMMENDATION STEPPER WIZARD
// ==========================================================================

function selectAiOption(field, value, el) {
  appState.aiRecom[field] = value;
  
  const siblings = el.parentNode.children;
  for (let sibling of siblings) {
    sibling.classList.remove('active', 'selected');
  }
  el.classList.add('active', 'selected');
}

function nextAiStep() {
  const currentStep = appState.aiRecom.step;
  
  let field = '';
  if (currentStep === 1) field = 'businessType';
  else if (currentStep === 2) field = 'budget';
  else if (currentStep === 3) field = 'problem';
  else if (currentStep === 4) field = 'deployment';
  else if (currentStep === 5) field = 'employees';

  if (!appState.aiRecom[field]) {
    showToast(`Please select an option for Step ${currentStep}`, "info");
    return;
  }

  if (currentStep < 5) {
    const currentPanel = document.getElementById(`step-panel-${currentStep}`);
    if (currentPanel) currentPanel.classList.remove('active');

    const currentIndicator = document.getElementById(`step-indicator-${currentStep}`);
    if (currentIndicator) {
      currentIndicator.classList.remove('active');
      currentIndicator.classList.add('completed');
    }

    appState.aiRecom.step++;
    const nextStep = appState.aiRecom.step;

    const nextPanel = document.getElementById(`step-panel-${nextStep}`);
    if (nextPanel) nextPanel.classList.add('active');

    const nextIndicator = document.getElementById(`step-indicator-${nextStep}`);
    if (nextIndicator) nextIndicator.classList.add('active');

    const prevBtn = document.getElementById('ai-prev-btn');
    if (prevBtn) prevBtn.style.visibility = 'visible';

    if (nextStep === 5) {
      const nextBtn = document.getElementById('ai-next-btn');
      if (nextBtn) nextBtn.innerText = "Generate Stack";
    }
  } else {
    handleAiSubmit();
  }
}

function prevAiStep() {
  const currentStep = appState.aiRecom.step;
  if (currentStep > 1) {
    const currentPanel = document.getElementById(`step-panel-${currentStep}`);
    if (currentPanel) currentPanel.classList.remove('active');

    const currentIndicator = document.getElementById(`step-indicator-${currentStep}`);
    if (currentIndicator) currentIndicator.classList.remove('active');

    appState.aiRecom.step--;
    const prevStep = appState.aiRecom.step;

    const prevPanel = document.getElementById(`step-panel-${prevStep}`);
    if (prevPanel) prevPanel.classList.add('active');

    const prevIndicator = document.getElementById(`step-indicator-${prevStep}`);
    if (prevIndicator) {
      prevIndicator.classList.remove('completed');
      prevIndicator.classList.add('active');
    }

    const nextBtn = document.getElementById('ai-next-btn');
    if (nextBtn) nextBtn.innerText = "Next Step";

    if (prevStep === 1) {
      const prevBtn = document.getElementById('ai-prev-btn');
      if (prevBtn) prevBtn.style.visibility = 'hidden';
    }
  }
}

function handleAiSubmit(e) {
  if (e) e.preventDefault();

  if (!appState.aiRecom.employees) {
    showToast("Please select user count to formulate recommendations", "info");
    return;
  }

  const form = document.getElementById('ai-recom-form');
  const loading = document.getElementById('ai-loading-state');
  const results = document.getElementById('ai-recom-results');

  if (form) form.style.display = 'none';
  if (loading) loading.style.display = 'block';
  if (results) results.style.display = 'none';

  setTimeout(() => {
    if (loading) loading.style.display = 'none';
    if (results) results.style.display = 'block';

    const recs = getRecommendations();
    renderRecommendationResults(recs);
  }, 1200);
}

function resetAiWizard() {
  appState.aiRecom = {
    step: 1,
    businessType: '',
    budget: '',
    problem: '',
    deployment: '',
    employees: ''
  };

  const form = document.getElementById('ai-recom-form');
  const loading = document.getElementById('ai-loading-state');
  const results = document.getElementById('ai-recom-results');

  if (form) form.style.display = 'block';
  if (loading) loading.style.display = 'none';
  if (results) results.style.display = 'none';

  for (let i = 1; i <= 5; i++) {
    const panel = document.getElementById(`step-panel-${i}`);
    if (panel) {
      if (i === 1) panel.classList.add('active');
      else panel.classList.remove('active');
    }

    const node = document.getElementById(`step-indicator-${i}`);
    if (node) {
      node.classList.remove('completed', 'active');
      if (i === 1) node.classList.add('active');
    }
  }

  document.querySelectorAll('.chip-option').forEach(chip => {
    chip.classList.remove('active', 'selected');
  });

  const prevBtn = document.getElementById('ai-prev-btn');
  if (prevBtn) prevBtn.style.visibility = 'hidden';

  const nextBtn = document.getElementById('ai-next-btn');
  if (nextBtn) nextBtn.innerText = "Next Step";
}

function getRecommendations() {
  const { businessType, budget, problem, deployment } = appState.aiRecom;
  const list = [];

  let candidates = products;
  if (deployment === 'Cloud') {
    candidates = products.filter(p => p.deployment.toLowerCase().includes('cloud') || p.deployment.toLowerCase().includes('saas'));
  } else if (deployment === 'On-Premise') {
    candidates = products.filter(p => p.deployment.toLowerCase().includes('hardware') || p.deployment.toLowerCase().includes('premise'));
  }

  let primaryProduct = null;
  if (problem === 'collaboration') {
    primaryProduct = candidates.find(p => p.id === 'google-workspace') || candidates.find(p => p.id === 'microsoft-365');
  } else if (problem === 'security') {
    primaryProduct = candidates.find(p => p.id === 'sophos-security') || candidates.find(p => p.id === 'cisco-firewall');
  } else if (problem === 'automation') {
    primaryProduct = candidates.find(p => p.id === 'quickbooks') || candidates.find(p => p.id === 'zoho-books');
  } else if (problem === 'ai') {
    primaryProduct = candidates.find(p => p.id === 'chatgpt-business');
  }

  if (primaryProduct) list.push(primaryProduct);

  if (list.length === 0) {
    list.push(products.find(p => p.id === 'zoho-crm'));
  }

  let recommendedPackage = solutionPackages[0];
  if (problem === 'security') {
    recommendedPackage = solutionPackages.find(p => p.id === 'security-kit');
  } else if (problem === 'ai') {
    recommendedPackage = solutionPackages.find(p => p.id === 'ai-kit');
  } else if (businessType === 'Enterprise') {
    recommendedPackage = solutionPackages.find(p => p.id === 'security-kit');
  } else if (businessType === 'SMB' && problem === 'automation') {
    recommendedPackage = solutionPackages.find(p => p.id === 'retail-kit') || solutionPackages.find(p => p.id === 'office-kit');
  }

  const complementary = products.find(p => p.id !== list[0].id && !recommendedPackage.included.includes(p.name));
  if (complementary) list.push(complementary);

  return {
    products: list.slice(0, 2),
    package: recommendedPackage
  };
}

function renderRecommendationResults(recs) {
  const container = document.getElementById('ai-results-cards');
  if (!container) return;

  let html = '';

  if (recs.package) {
    html += `
      <div style="background-color: var(--white); border: 2px solid var(--accent); border-radius: var(--radius-lg); padding: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem; box-shadow: var(--shadow-md); position: relative; text-align: left;">
        <span class="badge" style="background-color: var(--accent); color: white; position: absolute; top: -12px; right: 20px; font-size: 0.65rem;">TOP BUNDLE SUGGESTION</span>
        <div style="display:flex; justify-content:space-between; align-items:start;">
          <div>
            <h4 style="font-size: 1.15rem; font-weight:800; color: var(--slate-900); margin:0;">${recs.package.name}</h4>
            <span style="font-size: 0.7rem; color: var(--muted); font-weight:600;">Best for: ${recs.package.bestFor}</span>
          </div>
          <span style="font-size: 1.1rem; font-weight:800; color: var(--accent);">${recs.package.price.split(' ')[0]}</span>
        </div>
        <p style="font-size: 0.8rem; color: var(--slate-600); margin:0; line-height:1.4;">${recs.package.description}</p>
        <div style="border-top:1px solid var(--slate-100); padding-top:0.75rem; display:flex; justify-content:space-between; align-items:center; margin-top:0.5rem; flex-wrap: wrap; gap: 0.5rem;">
          <span style="font-size:0.7rem; color: var(--slate-500); font-weight:600;">Includes: ${recs.package.included.join(', ')}</span>
          <a href="#demo?package=${recs.package.id}" class="btn btn-primary btn-sm" style="font-size: 0.75rem; padding: 0.4rem 0.8rem;">Request Custom SLA</a>
        </div>
      </div>
    `;
  }

  recs.products.forEach(prod => {
    const brandClass = 'brand-' + prod.brand.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const formattedPrice = prod.price > 0 ? 'INR ' + (prod.price * 82.5).toLocaleString('en-IN', { maximumFractionDigits: 0 }) : 'Get Quote';
    html += `
      <div style="background-color: var(--white); border: 1px solid var(--slate-200); border-radius: var(--radius-lg); padding: 1.25rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; transition: all 0.2s; text-align: left; flex-wrap: wrap;">
        <div style="display: flex; align-items: center; gap: 1rem; flex: 1; min-width: 200px;">
          <div style="width: 3rem; height: 3rem; background-color: var(--slate-50); border-radius: 8px; display: flex; align-items: center; justify-content: center; padding: 0.25rem; flex-shrink: 0;">
            <img src="${prod.imageUrl || 'assets/zoho_logo.png'}" alt="${prod.name}" style="max-width:100%; max-height:100%; object-fit:contain;">
          </div>
          <div>
            <h4 style="font-size: 0.95rem; font-weight: 800; margin:0; color:var(--slate-900);">${prod.name}</h4>
            <p style="font-size: 0.75rem; color: var(--slate-500); margin:0.15rem 0 0 0; line-height: 1.3;">${prod.shortDesc}</p>
          </div>
        </div>
        <div style="text-align: right; flex-shrink: 0; min-width: 120px;">
          <div style="font-size: 0.85rem; font-weight: 800; color: var(--accent);">${formattedPrice}</div>
          <a href="#detail?id=${prod.id}" class="btn btn-outline btn-sm" style="font-size: 0.7rem; padding: 0.35rem 0.65rem; margin-top: 0.35rem; display: inline-block; text-decoration: none;">View Detail &rarr;</a>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// ----------------------------------------------------
// SCROLL REVEAL, COUNTERS & COLLAPSIBLE ACCORDIONS
// ----------------------------------------------------

function initScrollReveal() {
  // Check if reduced motion is preferred
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.reveal-on-scroll, .reveal-on-scroll-group').forEach(el => {
      el.classList.add('visible');
    });
    document.querySelectorAll('.reveal-on-scroll-child').forEach(child => {
      child.style.opacity = '1';
      child.style.transform = 'none';
    });
    // Immediately set counters to target values
    document.querySelectorAll('.counter-val').forEach(counter => {
      const target = parseFloat(counter.getAttribute('data-target'));
      const suffix = counter.getAttribute('data-suffix') || '';
      counter.innerText = target.toLocaleString('en-US') + suffix;
    });
    return;
  }

  const options = {
    threshold: 0.05,
    rootMargin: '0px 0px -30px 0px'
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        
        // Find counters inside this target
        const counters = entry.target.querySelectorAll('.counter-val');
        if (counters.length > 0) {
          animateCounters(counters);
        }
        
        observer.unobserve(entry.target);
      }
    });
  }, options);

  document.querySelectorAll('.reveal-on-scroll, .reveal-on-scroll-group').forEach(el => {
    observer.observe(el);
  });
}

function animateCounters(counters) {
  counters.forEach(counter => {
    // Prevent double animation
    if (counter.classList.contains('animated')) return;
    counter.classList.add('animated');

    const target = parseFloat(counter.getAttribute('data-target'));
    const suffix = counter.getAttribute('data-suffix') || '';
    const duration = 1200; // 1.2 seconds
    const startTime = performance.now();

    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing out quad
      const easeProgress = progress * (2 - progress);
      const currentValue = Math.floor(easeProgress * target);

      if (suffix.toLowerCase().includes('m')) {
        counter.innerText = currentValue + suffix;
      } else {
        counter.innerText = currentValue.toLocaleString('en-US') + suffix;
      }

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        counter.innerText = target.toLocaleString('en-US') + suffix;
      }
    }
    requestAnimationFrame(updateCounter);
  });
}

function toggleFilterSection(titleEl) {
  const section = titleEl.closest('.filter-section');
  if (!section) return;

  const content = section.querySelector('.filter-content');
  if (!content) return;

  const isCollapsed = section.classList.contains('collapsed');
  
  if (isCollapsed) {
    section.classList.remove('collapsed');
    content.style.maxHeight = '500px';
    content.style.opacity = '1';
    content.style.pointerEvents = 'auto';
  } else {
    section.classList.add('collapsed');
    content.style.maxHeight = '0';
    content.style.opacity = '0';
    content.style.pointerEvents = 'none';
  }
}

function toggleFaqAccordion(btn) {
  const faqItem = btn.closest('.faq-item');
  if (!faqItem) return;
  const content = faqItem.querySelector('.faq-content');
  const chevron = btn.querySelector('i');
  
  const isActive = faqItem.classList.contains('active');
  
  // Close any other open FAQs first
  document.querySelectorAll('.faq-item').forEach(item => {
    if (item !== faqItem) {
      item.classList.remove('active');
      const c = item.querySelector('.faq-content');
      if (c) c.style.maxHeight = '0';
      const ch = item.querySelector('.faq-trigger i');
      if (ch) ch.style.transform = 'rotate(0deg)';
    }
  });
  
  if (isActive) {
    faqItem.classList.remove('active');
    if (content) content.style.maxHeight = '0';
    if (chevron) chevron.style.transform = 'rotate(0deg)';
  } else {
    faqItem.classList.add('active');
    if (content) content.style.maxHeight = content.scrollHeight + 'px';
    if (chevron) chevron.style.transform = 'rotate(180deg)';
  }
}

// Global Scroll Handler for Header and Back-to-Top Button
window.addEventListener('scroll', () => {
  const header = document.getElementById('app-header');
  if (header) {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  const backToTop = document.getElementById('back-to-top-btn');
  if (backToTop) {
    if (window.scrollY > 400) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  }
});

// Global Click Delegation for Back-to-Top Button
document.addEventListener('click', (e) => {
  const btn = e.target.closest('#back-to-top-btn');
  if (btn) {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
});

function startTypingAnimation() {
  if (window.typingAnimationTimeout) {
    clearTimeout(window.typingAnimationTimeout);
  }

  const el = document.getElementById('hero-typing-text');
  if (!el) return;

  const words = [
    "Tech Solutions",
    "Software Systems",
    "Cloud Security"
  ];
  
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = words[0];
    const cursor = document.querySelector('.typing-cursor');
    if (cursor) cursor.style.display = 'none';
    return;
  }

  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 100;

  function type() {
    const targetEl = document.getElementById('hero-typing-text');
    if (!targetEl) return;

    const currentWord = words[wordIndex];

    if (isDeleting) {
      targetEl.textContent = currentWord.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 50;
    } else {
      targetEl.textContent = currentWord.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 120;
    }

    if (!isDeleting && charIndex === currentWord.length) {
      typingSpeed = 2000;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      typingSpeed = 500;
    }

    window.typingAnimationTimeout = setTimeout(type, typingSpeed);
  }

  type();
}
