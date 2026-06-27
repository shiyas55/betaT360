// Theme Loader
    (function () {
      const currentTheme = localStorage.getItem('admin-theme') || 'light';
      if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        const icon = document.getElementById('dark-mode-icon');
        if (icon) icon.textContent = 'light_mode';
      }
    })();

    // Sidebar State Loader
    (function () {
      const isCollapsed = localStorage.getItem('sidebar-collapsed') === 'true';
      if (isCollapsed && window.innerWidth >= 992) {
        document.body.classList.add('sidebar-collapsed');
        const icon = document.getElementById('collapse-icon');
        if (icon) icon.textContent = 'menu';
      }
    })();

    // Mobile Sidebar Toggler
    const toggleBtn = document.getElementById('mobile-toggle-btn');
    const sidebar = document.getElementById('admin-sidebar');

    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', (e) => {
        sidebar.classList.toggle('open');
        e.stopPropagation();
      });

      document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && e.target !== toggleBtn) {
          sidebar.classList.remove('open');
        }
      });
    }

    // Toggle Desktop Sidebar Collapse
    function toggleSidebarCollapse() {
      document.body.classList.toggle('sidebar-collapsed');
      const isCollapsed = document.body.classList.contains('sidebar-collapsed');
      localStorage.setItem('sidebar-collapsed', isCollapsed);

      const icon = document.getElementById('collapse-icon');
      if (icon) {
        icon.textContent = isCollapsed ? 'menu' : 'menu_open';
      }
    }

    // Toggle Dark Mode
    function toggleDarkMode() {
      const htmlEl = document.documentElement;
      const currentTheme = htmlEl.getAttribute('data-theme');
      const icon = document.getElementById('dark-mode-icon');

      if (currentTheme === 'dark') {
        htmlEl.removeAttribute('data-theme');
        localStorage.setItem('admin-theme', 'light');
        if (icon) icon.textContent = 'dark_mode';
      } else {
        htmlEl.setAttribute('data-theme', 'dark');
        localStorage.setItem('admin-theme', 'dark');
        if (icon) icon.textContent = 'light_mode';
      }
    }

    // Toggle Dropdown Menus
    function toggleDropdownMenu(event, id) {
      event.stopPropagation();
      // Close other dropdowns
      document.querySelectorAll('.dropdown-menu').forEach(el => {
        if (el.id !== id) {
          el.classList.remove('show');
        }
      });

      const menu = document.getElementById(id);
      if (menu) {
        menu.classList.toggle('show');
      }
    }

    // Top Search input handler
    function handleTopSearch(event) {
      if (event.key === 'Enter') {
        const query = event.target.value.trim();
        if (query) {
          const currentUrl = window.location.pathname;
          if (currentUrl.includes('/products/')) {
            window.location.href = `{% url 'admin_products' %}?search=${encodeURIComponent(query)}`;
          } else if (currentUrl.includes('/users/')) {
            window.location.href = `{% url 'admin_users' %}?search=${encodeURIComponent(query)}`;
          } else if (currentUrl.includes('/orders/')) {
            window.location.href = `{% url 'admin_orders' %}?search=${encodeURIComponent(query)}`;
          } else {
            window.location.href = `{% url 'admin_home' %}?search=${encodeURIComponent(query)}`;
          }
        }
      }
    }

    // Toggle Create Dropdown
    function toggleCreateDropdown(event) {
      event.stopPropagation();
      document.getElementById('create-dropdown-menu').classList.toggle('show');
    }

    // Close all open dropdowns when clicking outside
    document.addEventListener('click', function (event) {
      // Close dropdown-menu
      document.querySelectorAll('.dropdown-menu').forEach(menu => {
        if (!menu.contains(event.target)) {
          menu.classList.remove('show');
        }
      });
      // Close create dropdown
      const createMenu = document.getElementById('create-dropdown-menu');
      if (createMenu && createMenu.classList.contains('show') && !event.target.closest('.create-dropdown')) {
        createMenu.classList.remove('show');
      }
    });