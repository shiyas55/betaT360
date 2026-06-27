/**
 * Product FAQ Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    const faqContainer = document.getElementById('faq-list-container');
    const addFaqBtn = document.getElementById('btn-add-faq');

    if (addFaqBtn && faqContainer) {
        addFaqBtn.addEventListener('click', (e) => {
            e.preventDefault();
            addNewFaq();
        });
        
        // Setup initial events if there are existing rows
        setupFaqRowEvents();
    }

    // Product Details Accordion Logic
    const accordionHeaders = document.querySelectorAll('.faq-accordion-header');
    if (accordionHeaders.length > 0) {
        accordionHeaders.forEach(header => {
            header.addEventListener('click', function() {
                const item = this.parentElement;
                const isActive = item.classList.contains('active');
                
                // Close all
                document.querySelectorAll('.faq-accordion-item').forEach(el => {
                    el.classList.remove('active');
                    const body = el.querySelector('.faq-accordion-body');
                    if(body) body.style.maxHeight = null;
                });
                
                if (!isActive) {
                    item.classList.add('active');
                    const body = item.querySelector('.faq-accordion-body');
                    if(body) body.style.maxHeight = body.scrollHeight + "px";
                }
            });
        });
    }
});

function addNewFaq(question = '', answer = '') {
    const container = document.getElementById('faq-list-container');
    const rowCount = container.children.length;
    
    const row = document.createElement('div');
    row.className = 'faq-row';
    row.style.cssText = 'border: 1px solid var(--border-color, #e2e8f0); border-radius: 8px; padding: 15px; margin-bottom: 15px; background: #fff; transition: all 0.3s;';
    
    row.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <span class="material-symbols-outlined drag-handle" style="cursor: grab; color: #94a3b8;">drag_indicator</span>
                <h4 style="margin: 0; font-size: 0.9rem; font-weight: 600;">FAQ Item</h4>
            </div>
            <div style="display: flex; gap: 8px;">
                <button type="button" class="btn btn-outline btn-xs btn-duplicate-faq" style="padding: 4px;" title="Duplicate"><span class="material-symbols-outlined" style="font-size: 16px;">content_copy</span></button>
                <button type="button" class="btn btn-outline btn-xs btn-delete-faq" style="padding: 4px; color: #ef4444; border-color: #ef4444;" title="Delete"><span class="material-symbols-outlined" style="font-size: 16px;">delete</span></button>
                <button type="button" class="btn btn-outline btn-xs btn-toggle-faq" style="padding: 4px;" title="Expand/Collapse"><span class="material-symbols-outlined toggle-icon" style="font-size: 16px;">expand_less</span></button>
            </div>
        </div>
        <div class="faq-row-content">
            <div class="form-group" style="margin-bottom: 10px;">
                <label style="font-size: 0.8rem; margin-bottom: 4px; display: block;">Question</label>
                <input type="text" class="form-input faq-question" value="${question}" placeholder="e.g. What is the warranty?" style="width: 100%; padding: 8px; border: 1px solid #e2e8f0; border-radius: 4px;">
            </div>
            <div class="form-group">
                <label style="font-size: 0.8rem; margin-bottom: 4px; display: block;">Answer</label>
                <textarea class="form-input faq-answer" rows="3" placeholder="Enter answer here..." style="width: 100%; padding: 8px; border: 1px solid #e2e8f0; border-radius: 4px;">${answer}</textarea>
            </div>
        </div>
    `;
    
    container.appendChild(row);
    setupFaqRowEvents(row);
    
    if (window.UIFeedback) {
        UIFeedback.showToast("FAQ added successfully", "success");
    }
}

function setupFaqRowEvents(specificRow = null) {
    const rows = specificRow ? [specificRow] : document.querySelectorAll('.faq-row');
    
    rows.forEach(row => {
        // Delete
        const delBtn = row.querySelector('.btn-delete-faq');
        if (delBtn && !delBtn.hasAttribute('data-bound')) {
            delBtn.setAttribute('data-bound', 'true');
            delBtn.addEventListener('click', () => {
                row.remove();
                if (window.UIFeedback) UIFeedback.showToast("FAQ deleted", "success");
            });
        }
        
        // Duplicate
        const dupBtn = row.querySelector('.btn-duplicate-faq');
        if (dupBtn && !dupBtn.hasAttribute('data-bound')) {
            dupBtn.setAttribute('data-bound', 'true');
            dupBtn.addEventListener('click', () => {
                const q = row.querySelector('.faq-question').value;
                const a = row.querySelector('.faq-answer').value;
                addNewFaq(q, a);
            });
        }
        
        // Toggle
        const toggleBtn = row.querySelector('.btn-toggle-faq');
        if (toggleBtn && !toggleBtn.hasAttribute('data-bound')) {
            toggleBtn.setAttribute('data-bound', 'true');
            toggleBtn.addEventListener('click', () => {
                const content = row.querySelector('.faq-row-content');
                const icon = toggleBtn.querySelector('.toggle-icon');
                if (content.style.display === 'none') {
                    content.style.display = 'block';
                    icon.textContent = 'expand_less';
                } else {
                    content.style.display = 'none';
                    icon.textContent = 'expand_more';
                }
            });
        }
        
        // Validation on blur
        const qInput = row.querySelector('.faq-question');
        const aInput = row.querySelector('.faq-answer');
        
        if (qInput && !qInput.hasAttribute('data-bound')) {
            qInput.setAttribute('data-bound', 'true');
            qInput.addEventListener('blur', () => {
                if (!qInput.value.trim() && window.UIFeedback) {
                    UIFeedback.showError(qInput, "Question cannot be empty.");
                } else if (window.UIFeedback) {
                    UIFeedback.clearError(qInput);
                }
            });
        }
        
        if (aInput && !aInput.hasAttribute('data-bound')) {
            aInput.setAttribute('data-bound', 'true');
            aInput.addEventListener('blur', () => {
                if (!aInput.value.trim() && window.UIFeedback) {
                    UIFeedback.showError(aInput, "Answer cannot be empty.");
                } else if (window.UIFeedback) {
                    UIFeedback.clearError(aInput);
                }
            });
        }
    });
}

// Hook into form submission for demo
document.addEventListener('DOMContentLoaded', () => {
    const productForm = document.getElementById('product-demo-form');
    if (productForm) {
        productForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Validate all FAQs
            let hasError = false;
            document.querySelectorAll('.faq-row').forEach(row => {
                const q = row.querySelector('.faq-question');
                const a = row.querySelector('.faq-answer');
                if (!q.value.trim()) { UIFeedback.showError(q, "Question cannot be empty."); hasError = true; }
                if (!a.value.trim()) { UIFeedback.showError(a, "Answer cannot be empty."); hasError = true; }
            });
            
            if (hasError) {
                UIFeedback.showToast("Please complete all required fields.", "error");
            } else {
                UIFeedback.showToast("Product saved successfully!", "success");
            }
        });
    }
});
