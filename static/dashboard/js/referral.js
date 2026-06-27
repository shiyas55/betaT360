/**
 * Referral System Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    initReferralLink();
    
    const copyBtn = document.getElementById('btn-copy-ref');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const linkInput = document.getElementById('ref-link-input');
            if (linkInput && !linkInput.disabled) {
                linkInput.select();
                document.execCommand('copy');
                window.UIFeedback?.showToast('Referral link copied.', 'success');
            } else {
                window.UIFeedback?.showToast('This referral link has expired.', 'error');
            }
        });
    }
    
    const generateBtn = document.getElementById('btn-generate-ref');
    if (generateBtn) {
        generateBtn.addEventListener('click', () => {
            generateNewLink();
        });
    }
});

let countdownInterval = null;

function initReferralLink() {
    const linkObjStr = localStorage.getItem('referral_link_data');
    if (linkObjStr) {
        const linkObj = JSON.parse(linkObjStr);
        const now = Date.now();
        if (now < linkObj.expiryTime) {
            setupLinkUI(linkObj.url, linkObj.expiryTime, true);
        } else {
            setupLinkUI(linkObj.url, linkObj.expiryTime, false);
        }
    } else {
        generateNewLink();
    }
}

function generateNewLink() {
    const newCode = 'DEMO' + Math.floor(1000 + Math.random() * 9000);
    const newUrl = `https://technostore360.com/ref/${newCode}`;
    const now = Date.now();
    const expiryTime = now + (24 * 60 * 60 * 1000); // 24 hours
    
    const linkObj = { url: newUrl, createdAt: now, expiryTime: expiryTime };
    localStorage.setItem('referral_link_data', JSON.stringify(linkObj));
    
    setupLinkUI(newUrl, expiryTime, true);
    window.UIFeedback?.showToast('New referral link generated.', 'success');
}

function setupLinkUI(url, expiryTime, isActive) {
    const linkInput = document.getElementById('ref-link-input');
    const statusBadge = document.getElementById('ref-status-badge');
    const generateBtn = document.getElementById('btn-generate-ref');
    const copyBtn = document.getElementById('btn-copy-ref');
    
    if (linkInput) linkInput.value = url;
    
    if (isActive) {
        if (linkInput) linkInput.disabled = false;
        if (copyBtn) copyBtn.disabled = false;
        if (statusBadge) {
            statusBadge.textContent = 'Active';
            statusBadge.className = 'badge badge-success';
        }
        if (generateBtn) generateBtn.style.display = 'none';
        
        startCountdown(expiryTime);
    } else {
        if (linkInput) linkInput.disabled = true;
        if (copyBtn) copyBtn.disabled = true;
        if (statusBadge) {
            statusBadge.textContent = 'Expired';
            statusBadge.className = 'badge badge-error';
        }
        if (generateBtn) generateBtn.style.display = 'inline-block';
        
        const timerEl = document.getElementById('ref-countdown');
        if (timerEl) timerEl.textContent = '00:00:00';
        
        if (countdownInterval) clearInterval(countdownInterval);
    }
}

function startCountdown(expiryTime) {
    if (countdownInterval) clearInterval(countdownInterval);
    
    const timerEl = document.getElementById('ref-countdown');
    if (!timerEl) return;
    
    countdownInterval = setInterval(() => {
        const now = Date.now();
        const diff = expiryTime - now;
        
        if (diff <= 0) {
            clearInterval(countdownInterval);
            initReferralLink(); // Will switch to expired state
            return;
        }
        
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        
        timerEl.textContent = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }, 1000);
}
