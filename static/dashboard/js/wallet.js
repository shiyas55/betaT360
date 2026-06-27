/**
 * Wallet Section Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize dummy data if not exists
    if (!localStorage.getItem('wallet_balance')) {
        localStorage.setItem('wallet_balance', '1500.00');
    }
    
    if (!localStorage.getItem('wallet_transactions')) {
        const initialTx = [
            { id: 'TXN-9382', date: new Date().toISOString(), desc: 'Product Sale - iPhone 13', type: 'credit', amount: 850.00, status: 'completed' },
            { id: 'TXN-9381', date: new Date(Date.now() - 86400000).toISOString(), desc: 'Referral Bonus', type: 'credit', amount: 50.00, status: 'completed' },
            { id: 'TXN-9380', date: new Date(Date.now() - 172800000).toISOString(), desc: 'Withdrawal to Bank', type: 'debit', amount: 400.00, status: 'completed' }
        ];
        localStorage.setItem('wallet_transactions', JSON.stringify(initialTx));
    }
    
    updateWalletUI();
    
    // Withdrawal Form
    const withdrawForm = document.getElementById('wallet-withdraw-form');
    if (withdrawForm) {
        withdrawForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const amountInput = document.getElementById('withdraw_amount');
            const accountInput = document.getElementById('withdraw_account');
            const amount = parseFloat(amountInput.value);
            const balance = parseFloat(localStorage.getItem('wallet_balance'));
            
            let hasError = false;
            
            if (isNaN(amount) || amount <= 0) {
                window.UIFeedback?.showError(amountInput, 'Amount must be greater than zero.');
                hasError = true;
            } else if (amount > balance) {
                window.UIFeedback?.showError(amountInput, 'Amount cannot exceed available balance.');
                hasError = true;
            }
            
            if (!accountInput.value.trim()) {
                window.UIFeedback?.showError(accountInput, 'Bank or UPI details are required.');
                hasError = true;
            }
            
            if (hasError) return;
            
            // Deduct balance
            const newBalance = balance - amount;
            localStorage.setItem('wallet_balance', newBalance.toFixed(2));
            
            // Add transaction
            const txns = JSON.parse(localStorage.getItem('wallet_transactions'));
            txns.unshift({
                id: 'TXN-' + Math.floor(1000 + Math.random() * 9000),
                date: new Date().toISOString(),
                desc: 'Withdrawal Request',
                type: 'debit',
                amount: amount,
                status: 'pending'
            });
            localStorage.setItem('wallet_transactions', JSON.stringify(txns));
            
            // UI Updates
            window.UIFeedback?.hideModal('wallet-withdraw-modal');
            window.UIFeedback?.showToast('Withdrawal request added to demo history.', 'success');
            
            amountInput.value = '';
            accountInput.value = '';
            
            updateWalletUI();
        });
        
        // Auto-clear errors
        withdrawForm.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', () => window.UIFeedback?.clearError(input));
        });
    }
});

function updateWalletUI() {
    const balanceEl = document.getElementById('wallet-available-balance');
    if (balanceEl) {
        const bal = parseFloat(localStorage.getItem('wallet_balance') || 0);
        balanceEl.textContent = '$' + bal.toFixed(2);
    }
    
    const tbody = document.getElementById('wallet-transactions-body');
    if (tbody) {
        const txns = JSON.parse(localStorage.getItem('wallet_transactions') || '[]');
        tbody.innerHTML = '';
        
        if (txns.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 20px;">No transactions found</td></tr>`;
            return;
        }
        
        txns.forEach(tx => {
            const dateStr = new Date(tx.date).toLocaleDateString();
            const typeColor = tx.type === 'credit' ? '#10b981' : '#ef4444';
            const typeSign = tx.type === 'credit' ? '+' : '-';
            const statusClass = tx.status === 'completed' ? 'badge-success' : (tx.status === 'pending' ? 'badge-warning' : 'badge-error');
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${tx.id}</td>
                <td>${dateStr}</td>
                <td>${tx.desc}</td>
                <td style="text-transform: capitalize; color: ${typeColor}; font-weight: 500;">${tx.type}</td>
                <td style="color: ${typeColor}; font-weight: 600;">${typeSign}$${tx.amount.toFixed(2)}</td>
                <td><span class="badge ${statusClass}" style="font-size: 0.7rem; padding: 2px 6px; border-radius: 4px;">${tx.status}</span></td>
            `;
            tbody.appendChild(tr);
        });
    }
}
