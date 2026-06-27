/**
 * Vendor Activation Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // Check local storage for vendor status
    const isVendor = localStorage.getItem('is_demo_vendor') === 'true';
    updateVendorSidebar(isVendor);
    
    // Vendor form submission
    const vendorForm = document.getElementById('vendor-activation-form');
    if (vendorForm) {
        vendorForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const bName = document.getElementById('vendor_business_name');
            const email = document.getElementById('vendor_email');
            const terms = document.getElementById('vendor_terms');
            
            let hasError = false;
            if (!bName.value.trim()) { window.UIFeedback?.showError(bName, 'Business name is required.'); hasError = true; }
            if (!email.value.trim()) { window.UIFeedback?.showError(email, 'Email is required.'); hasError = true; }
            if (!terms.checked) { window.UIFeedback?.showError(terms, 'You must accept the terms.'); hasError = true; }
            
            if (hasError) {
                window.UIFeedback?.showToast('Please complete all required fields.', 'error');
                return;
            }
            
            // Success
            localStorage.setItem('is_demo_vendor', 'true');
            window.UIFeedback?.hideModal('vendor-activation-modal');
            window.UIFeedback?.showToast('Vendor profile activated successfully.', 'success');
            
            updateVendorSidebar(true);
        });
    }
    
    // Auto-clear errors on input
    const inputs = document.querySelectorAll('#vendor-activation-form input');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            window.UIFeedback?.clearError(input);
        });
    });
});

function updateVendorSidebar(isVendor) {
    const vendorMenuLabel = document.getElementById('sidebar-vendor-label');
    const vendorMenuIcon = document.getElementById('sidebar-vendor-icon');
    if (!vendorMenuLabel) return;
    
    if (isVendor) {
        vendorMenuLabel.textContent = 'Vendor Dashboard';
        if (vendorMenuIcon) vendorMenuIcon.textContent = 'storefront';
        
        // Remove the onclick that opens the modal if activated
        const vendorLink = vendorMenuLabel.closest('a');
        if (vendorLink) {
            vendorLink.removeAttribute('onclick');
            vendorLink.href = '#'; // In a real app, this would route to /vendor/dashboard
        }
    } else {
        vendorMenuLabel.textContent = 'Become a Vendor';
        if (vendorMenuIcon) vendorMenuIcon.textContent = 'add_business';
    }
}
