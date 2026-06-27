/**
 * UI Feedback System for TechnoStore360 Dashboard
 */

const UIFeedback = {
    // Show a toast message
    showToast: function(message, type = 'success') {
        const container = document.getElementById('toast-container') || this._createToastContainer();
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let icon = '';
        if (type === 'success') icon = '<span class="material-symbols-outlined">check_circle</span>';
        if (type === 'error') icon = '<span class="material-symbols-outlined">error</span>';
        if (type === 'warning') icon = '<span class="material-symbols-outlined">warning</span>';
        
        toast.innerHTML = `
            ${icon}
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
        `;
        
        container.appendChild(toast);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (toast.parentElement) toast.remove();
        }, 3000);
    },
    
    _createToastContainer: function() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px;';
        document.body.appendChild(container);
        
        // Add basic styles if not present
        if (!document.getElementById('toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = `
                .toast { padding: 12px 16px; border-radius: 8px; display: flex; align-items: center; gap: 10px; color: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1); animation: slideIn 0.3s ease-out; font-family: var(--font-body, 'Inter', sans-serif); font-size: 0.875rem; min-width: 250px; justify-content: space-between; }
                .toast-success { background-color: #10b981; }
                .toast-error { background-color: #ef4444; }
                .toast-warning { background-color: #f59e0b; }
                .toast-close { background: none; border: none; color: white; cursor: pointer; font-size: 1.2rem; }
                @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            `;
            document.head.appendChild(style);
        }
        return container;
    },
    
    // Show validation error below an input
    showError: function(inputElement, message) {
        this.clearError(inputElement);
        inputElement.classList.add('error-border');
        inputElement.style.borderColor = '#ef4444';
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error-message';
        errorDiv.style.cssText = 'color: #ef4444; font-size: 0.75rem; margin-top: 4px;';
        errorDiv.textContent = message;
        
        inputElement.parentNode.insertBefore(errorDiv, inputElement.nextSibling);
    },
    
    clearError: function(inputElement) {
        inputElement.classList.remove('error-border');
        inputElement.style.borderColor = '';
        const next = inputElement.nextElementSibling;
        if (next && next.classList.contains('field-error-message')) {
            next.remove();
        }
    },
    
    showModal: function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.style.display = 'flex';
    },
    
    hideModal: function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.style.display = 'none';
    },

    toggleSkeleton: function(containerId, show) {
        const container = document.getElementById(containerId);
        if(!container) return;
        const skeleton = container.querySelector('.skeleton-loader');
        const content = container.querySelector('.actual-content');
        
        if (show) {
            if (skeleton) skeleton.style.display = 'block';
            if (content) content.style.display = 'none';
        } else {
            if (skeleton) skeleton.style.display = 'none';
            if (content) content.style.display = 'block';
        }
    }
};

window.UIFeedback = UIFeedback;
