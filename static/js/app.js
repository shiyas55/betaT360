// TECHNOSTORE360 - Cleaned-up Client Script

// 1. Mobile Navigation Toggle
function toggleMobileNav() {
  // Close filters if open
  const filterSidebar = document.querySelector('.filter-sidebar');
  const filterBackdrop = document.getElementById('filter-backdrop');
  if (filterSidebar && filterSidebar.classList.contains('active')) {
    filterSidebar.classList.remove('active');
    if (filterBackdrop) filterBackdrop.classList.remove('active');
  }

  const panel = document.getElementById('mobile-nav-panel');
  const btn = document.querySelector('.hamburger-button');
  const header = document.getElementById('app-header');
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
    if (btn) btn.classList.toggle('active', isActive);
    if (header) header.classList.toggle('nav-open', isActive);
    backdrop.classList.toggle('active', isActive);
    document.body.classList.toggle('no-scroll', isActive);
  }
}

// 2. Global Toast notification
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

// 3. Global toggle for product compare matrix addition/removal
function toggleCompareState(sku, btnElement) {
  const isActive = btnElement.classList.contains('active');
  const action = isActive ? 'remove' : 'add';
  
  fetch(`/compare/?action=${action}&sku=${sku}`)
    .then(response => {
      if (response.ok) {
        if (isActive) {
          btnElement.classList.remove('active');
          showToast(`Removed from compare matrix`, 'info');
        } else {
          btnElement.classList.add('active');
          showToast(`Added to compare matrix`, 'success');
        }
        
        // If we are currently on the compare page, reload to update the table
        if (window.location.pathname.includes('/compare/')) {
          window.location.reload();
        }
      } else {
        showToast("Error updating compare matrix", "error");
      }
    })
    .catch(err => {
      console.error(err);
      showToast("Error updating compare matrix", "error");
    });
}

// 4. Collapsible Filter section handler
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

// 5. FAQ Accordion handler
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

// 6. Global Scroll Handler for Header and Back-to-Top Button
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
  const header = document.getElementById('app-header');
  const currentScrollY = window.scrollY;

  if (header) {
    // Toggle background styles on scroll
    if (currentScrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Hide header on scroll down, slide it back down on scroll up
    if (currentScrollY > 100) {
      if (currentScrollY > lastScrollY) {
        // Scrolling down - hide top navbar
        header.style.transform = 'translateY(-100%)';
        header.style.transition = 'transform 0.3s ease-in-out';
      } else {
        // Scrolling up - slide top navbar down to stick
        header.style.transform = 'translateY(0)';
        header.style.transition = 'transform 0.3s ease-in-out';
      }
    } else {
      // Near top of the page - reset transform
      header.style.transform = 'translateY(0)';
    }
  }
  
  lastScrollY = currentScrollY;

  const backToTop = document.getElementById('back-to-top-btn');
  if (backToTop) {
    if (window.scrollY > 400) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  }
});

// 7. Global Click Delegation for Back-to-Top Button
document.addEventListener('click', (e) => {
  const btn = e.target.closest('#back-to-top-btn');
  if (btn) {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
});

// 8. Typing animation for hero
function startTypingAnimation() {
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

    setTimeout(type, typingSpeed);
  }

  type();
}

// 9. Scroll reveals and counters animation observer
function setupScrollReveal() {
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
    if (counter.classList.contains('animated')) return;
    counter.classList.add('animated');

    const target = parseFloat(counter.getAttribute('data-target'));
    const suffix = counter.getAttribute('data-suffix') || '';
    const duration = 1200; // 1.2 seconds
    const startTime = performance.now();

    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
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

// 3. Mobile Filters Toggle
function toggleMobileFilters() {
  // Close navigation menu if open
  const navPanel = document.getElementById('mobile-nav-panel');
  const navBtn = document.querySelector('.hamburger-button');
  const navHeader = document.getElementById('app-header');
  const navBackdrop = document.getElementById('mobile-nav-backdrop');
  if (navPanel && navPanel.classList.contains('active')) {
    navPanel.classList.remove('active');
    if (navBtn) navBtn.classList.remove('active');
    if (navHeader) navHeader.classList.remove('nav-open');
    if (navBackdrop) navBackdrop.classList.remove('active');
  }

  const sidebar = document.querySelector('.filter-sidebar');
  let backdrop = document.getElementById('filter-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id = 'filter-backdrop';
    backdrop.className = 'filter-backdrop';
    backdrop.addEventListener('click', toggleMobileFilters);
    document.body.appendChild(backdrop);
  }
  if (sidebar) {
    const isActive = sidebar.classList.toggle('active');
    backdrop.classList.toggle('active', isActive);
    document.body.classList.toggle('no-scroll', isActive);
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  startTypingAnimation();
  setupScrollReveal();
  
  if (window.lucide) {
    window.lucide.createIcons();
  }
});
