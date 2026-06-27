/**
 * TechnoStore360 - Frontend Prototype Scripts
 * This file replaces all backend rendering and provides demo data/interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
    initUI();
    initDemoData();
    initProductFAQ();
});

function initUI() {
    // Sidebar toggle
    const toggleBtn = document.querySelector('.toggle-btn');
    const sidebar = document.querySelector('.admin-sidebar');
    const contentWrapper = document.querySelector('.content-wrapper');

    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            if (contentWrapper) {
                contentWrapper.classList.toggle('expanded');
            }
        });
    }

    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Dropdowns
    const dropdownToggles = document.querySelectorAll('[onclick^="toggleDropdownMenu"]');
    dropdownToggles.forEach(toggle => {
        // Remove inline onclick to handle it properly here
        toggle.removeAttribute('onclick');
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const targetId = toggle.getAttribute('data-target') || 'user-dropdown';
            const dropdown = document.getElementById(targetId);
            if (dropdown) {
                document.querySelectorAll('.dropdown-menu').forEach(d => {
                    if (d !== dropdown) d.style.display = 'none';
                });
                dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
            }
        });
    });

    document.addEventListener('click', () => {
        document.querySelectorAll('.dropdown-menu').forEach(d => {
            d.style.display = 'none';
        });
    });

    // Modals
    window.openModal = function(id) {
        const modal = document.getElementById(id);
        if (modal) modal.style.display = 'block';
    }
    window.closeModal = function(id) {
        const modal = document.getElementById(id);
        if (modal) modal.style.display = 'none';
    }
}

function initDemoData() {
    // Replace empty tables with demo data if table body is empty
    const productTable = document.querySelector('.catalog-table tbody');
    if (productTable && productTable.children.length === 0) {
        const demoProducts = [
            { name: 'Techno360 Server', sku: 'SRV-001', price: '$1200', stock: 45, status: 'Active' },
            { name: 'Cloud Storage 1TB', sku: 'CS-1TB', price: '$120/yr', stock: 'Unlimited', status: 'Active' }
        ];
        productTable.innerHTML = demoProducts.map(p => `
            <tr>
                <td>${p.name}</td>
                <td>${p.sku}</td>
                <td>${p.price}</td>
                <td>${p.stock}</td>
                <td><span class="badge badge-success">${p.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-secondary">Edit</button>
                    <button class="btn btn-sm btn-danger">Delete</button>
                </td>
            </tr>
        `).join('');
    }
}

function initProductFAQ() {
    const faqContainer = document.getElementById('faq-container');
    const addFaqBtn = document.getElementById('add-faq-btn');
    
    if (addFaqBtn && faqContainer) {
        let faqCount = 0;
        
        addFaqBtn.addEventListener('click', (e) => {
            e.preventDefault();
            faqCount++;
            
            const faqHtml = `
                <div class="faq-item" style="border: 1px solid var(--color-border); padding: 16px; margin-bottom: 16px; border-radius: var(--radius-sm);">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <strong>FAQ #${faqCount}</strong>
                        <div>
                            <button class="btn btn-sm btn-secondary" onclick="this.closest('.faq-item').remove()">Delete</button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Question</label>
                        <input type="text" class="form-control" placeholder="E.g., How does this work?">
                    </div>
                    <div class="form-group">
                        <label>Answer</label>
                        <textarea class="form-control" rows="3" placeholder="Enter the answer here..."></textarea>
                    </div>
                </div>
            `;
            faqContainer.insertAdjacentHTML('beforeend', faqHtml);
        });
    }

    // Accordions for Product Details page
    const faqSection = document.getElementById('product-faq-section');
    const faqDisplayContainer = document.getElementById('faq-display-container');
    
    if (faqSection && faqDisplayContainer) {
        // Demo FAQs for the details page
        const demoFaqs = [
            { question: "What is the warranty period?", answer: "All corporate purchases come with a standard 3-year advanced replacement warranty." },
            { question: "Can I upgrade the storage later?", answer: "Yes, storage is fully modular and can be expanded up to 100TB." }
        ];

        if (demoFaqs.length > 0) {
            faqSection.style.display = 'block';
            faqDisplayContainer.innerHTML = demoFaqs.map(faq => `
                <div class="faq-accordion-item" style="border: 1px solid var(--slate-200); border-radius: 6px; margin-bottom: 0.75rem; overflow: hidden;">
                    <button class="faq-accordion" style="width: 100%; text-align: left; background: var(--slate-50); padding: 1rem; border: none; font-weight: 600; cursor: pointer; display: flex; justify-content: space-between; align-items: center; color: var(--slate-800);">
                        ${faq.question}
                        <span class="material-symbols-outlined">expand_more</span>
                    </button>
                    <div class="faq-panel" style="max-height: 0; overflow: hidden; transition: max-height 0.2s ease-out; background: white;">
                        <p style="padding: 1rem; margin: 0; color: var(--slate-600); font-size: 0.85rem; line-height: 1.5;">${faq.answer}</p>
                    </div>
                </div>
            `).join('');

            // Accordion logic
            const accordions = document.querySelectorAll('.faq-accordion');
            accordions.forEach(acc => {
                acc.addEventListener('click', function() {
                    this.classList.toggle('active');
                    const panel = this.nextElementSibling;
                    if (panel.style.maxHeight) {
                        panel.style.maxHeight = null;
                        this.querySelector('span').textContent = 'expand_more';
                    } else {
                        panel.style.maxHeight = panel.scrollHeight + "px";
                        this.querySelector('span').textContent = 'expand_less';
                    }
                });
            });
        }
    }
}
