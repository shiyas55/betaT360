/**
 * TechnoStore360 Admin – Wallet & Referral Management JS
 * All demo data stored in localStorage. No backend required.
 */

/* ══════════════════════════════════════════════
   TOAST NOTIFICATION SYSTEM
══════════════════════════════════════════════ */
const Toast = {
  container: null,
  init() {
    if (this.container) return;
    this.container = document.createElement('div');
    this.container.id = 'toast-container';
    this.container.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 9999;
      display: flex; flex-direction: column; gap: 10px; max-width: 360px;
    `;
    document.body.appendChild(this.container);
  },
  show(message, type = 'success', duration = 4000) {
    this.init();
    const icons = { success: 'check_circle', error: 'error', warning: 'warning', info: 'info' };
    const colors = {
      success: '#10b981', error: '#ef4444', warning: '#f59e0b', info: '#3b82f6'
    };
    const toast = document.createElement('div');
    toast.style.cssText = `
      background: var(--color-bg-card, #fff); border: 1px solid var(--color-border, #e5e7eb);
      border-left: 4px solid ${colors[type]}; border-radius: 10px;
      padding: 14px 16px; display: flex; align-items: flex-start; gap: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.12); font-size: 13.5px;
      color: var(--color-text-dark, #1f2937); animation: toastIn 0.3s ease;
      font-family: var(--font-body, Inter, sans-serif); line-height: 1.5;
    `;
    toast.innerHTML = `
      <span class="material-symbols-outlined" style="color:${colors[type]};font-size:20px;flex-shrink:0;margin-top:1px">${icons[type]}</span>
      <span style="flex:1">${message}</span>
      <button onclick="this.parentElement.remove()" style="background:none;border:none;cursor:pointer;color:var(--color-text-muted,#9ca3af);font-size:18px;line-height:1;padding:0 0 0 4px">✕</button>
    `;
    this.container.appendChild(toast);
    if (!document.getElementById('toast-style')) {
      const s = document.createElement('style');
      s.id = 'toast-style';
      s.textContent = `@keyframes toastIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}`;
      document.head.appendChild(s);
    }
    setTimeout(() => toast.remove(), duration);
  },
  success(m) { this.show(m, 'success'); },
  error(m) { this.show(m, 'error'); },
  warning(m) { this.show(m, 'warning'); },
  info(m) { this.show(m, 'info'); }
};

/* ══════════════════════════════════════════════
   MODAL SYSTEM
══════════════════════════════════════════════ */
const Modal = {
  open(id) {
    const el = document.getElementById(id);
    if (el) { el.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
  },
  close(id) {
    const el = document.getElementById(id);
    if (el) { el.style.display = 'none'; document.body.style.overflow = ''; }
  },
  closeAll() {
    document.querySelectorAll('.aw-modal').forEach(m => { m.style.display = 'none'; });
    document.body.style.overflow = '';
  }
};

document.addEventListener('keydown', e => { if (e.key === 'Escape') Modal.closeAll(); });

/* ══════════════════════════════════════════════
   DEMO DATA – WALLETS
══════════════════════════════════════════════ */
const DEFAULT_WALLETS = [
  { id: 'WLT-001', userId: 'USR-1001', name: 'Arjun Sharma', type: 'Business Customer', email: 'arjun@acmecorp.com', available: 12450.00, pending: 1200.00, earnings: 18900.00, withdrawn: 6450.00, referral: 750.00, status: 'active', lastTx: '2026-06-26', method: 'UPI', account: 'arjun@hdfc', created: '2025-01-10' },
  { id: 'WLT-002', userId: 'USR-1002', name: 'Priya Nair', type: 'Vendor', email: 'priya@techhub.in', available: 28900.00, pending: 3400.00, earnings: 52000.00, withdrawn: 19700.00, referral: 2100.00, status: 'active', lastTx: '2026-06-27', method: 'Bank', account: 'SBI ****4521', created: '2024-11-05' },
  { id: 'WLT-003', userId: 'USR-1003', name: 'Kiran Mehta', type: 'Reseller', email: 'kiran@gadgetz.com', available: 4100.00, pending: 0, earnings: 9800.00, withdrawn: 5700.00, referral: 400.00, status: 'frozen', lastTx: '2026-06-20', method: 'UPI', account: 'kiran@okaxis', created: '2025-03-22' },
  { id: 'WLT-004', userId: 'USR-1004', name: 'Sneha Patel', type: 'Customer', email: 'sneha.p@gmail.com', available: 890.00, pending: 150.00, earnings: 1200.00, withdrawn: 160.00, referral: 100.00, status: 'active', lastTx: '2026-06-25', method: 'UPI', account: 'sneha@paytm', created: '2025-06-01' },
  { id: 'WLT-005', userId: 'USR-1005', name: 'Ravi Kumar', type: 'Affiliate', email: 'ravi.k@affiliate.io', available: 6700.00, pending: 2100.00, earnings: 31000.00, withdrawn: 22200.00, referral: 4500.00, status: 'active', lastTx: '2026-06-27', method: 'Bank', account: 'HDFC ****7734', created: '2024-09-15' },
  { id: 'WLT-006', userId: 'USR-1006', name: 'Deepa Krishnan', type: 'Vendor', email: 'deepa@cloudstore.in', available: 0, pending: 0, earnings: 5600.00, withdrawn: 5600.00, referral: 0, status: 'suspended', lastTx: '2026-05-30', method: 'UPI', account: 'deepa@ybl', created: '2025-02-14' },
  { id: 'WLT-007', userId: 'USR-1007', name: 'Anil Verma', type: 'Business Customer', email: 'anil@bizpro.co', available: 15600.00, pending: 800.00, earnings: 24000.00, withdrawn: 7600.00, referral: 1200.00, status: 'active', lastTx: '2026-06-26', method: 'Bank', account: 'ICICI ****2290', created: '2024-12-20' },
  { id: 'WLT-008', userId: 'USR-1008', name: 'Meena Joshi', type: 'Reseller', email: 'meena@resellerzone.in', available: 3200.00, pending: 500.00, earnings: 11200.00, withdrawn: 7500.00, referral: 600.00, status: 'pending', lastTx: '2026-06-22', method: 'UPI', account: 'meena@sbi', created: '2025-04-08' },
  { id: 'WLT-009', userId: 'USR-1009', name: 'Suresh Pillai', type: 'Customer', email: 'suresh.pillai@yahoo.in', available: 320.00, pending: 0, earnings: 450.00, withdrawn: 130.00, referral: 50.00, status: 'active', lastTx: '2026-06-18', method: 'UPI', account: 'suresh@gpay', created: '2025-07-11' },
  { id: 'WLT-010', userId: 'USR-1010', name: 'Farzana Sheikh', type: 'Affiliate', email: 'farzana@affpro.com', available: 9800.00, pending: 1600.00, earnings: 42000.00, withdrawn: 30600.00, referral: 5800.00, status: 'active', lastTx: '2026-06-27', method: 'Bank', account: 'Axis ****8812', created: '2024-08-30' }
];

const DEFAULT_TRANSACTIONS = [
  { id: 'TXN-0001', walletId: 'WLT-002', user: 'Priya Nair', type: 'Vendor', txType: 'Product Earning', desc: 'Commission on Order #ORD-1042', credit: 1200.00, debit: 0, balance: 28900.00, date: '2026-06-27 14:22', status: 'completed' },
  { id: 'TXN-0002', walletId: 'WLT-005', user: 'Ravi Kumar', type: 'Affiliate', txType: 'Referral Earning', desc: 'Referral bonus — USR-1041 activated', credit: 500.00, debit: 0, balance: 6700.00, date: '2026-06-27 12:10', status: 'completed' },
  { id: 'TXN-0003', walletId: 'WLT-001', user: 'Arjun Sharma', type: 'Business Customer', txType: 'Withdrawal', desc: 'Bank withdrawal request #WD-088', credit: 0, debit: 2000.00, balance: 12450.00, date: '2026-06-26 18:05', status: 'completed' },
  { id: 'TXN-0004', walletId: 'WLT-007', user: 'Anil Verma', type: 'Business Customer', txType: 'Admin Credit', desc: 'Loyalty bonus Q2 2026', credit: 1500.00, debit: 0, balance: 15600.00, date: '2026-06-26 10:00', status: 'completed' },
  { id: 'TXN-0005', walletId: 'WLT-010', user: 'Farzana Sheikh', type: 'Affiliate', txType: 'Commission', desc: 'Tier-2 affiliate commission Apr', credit: 3200.00, debit: 0, balance: 9800.00, date: '2026-06-25 09:30', status: 'completed' },
  { id: 'TXN-0006', walletId: 'WLT-003', user: 'Kiran Mehta', type: 'Reseller', txType: 'Refund', desc: 'Refund for cancelled ORD-0991', credit: 400.00, debit: 0, balance: 4100.00, date: '2026-06-24 16:45', status: 'completed' },
  { id: 'TXN-0007', walletId: 'WLT-004', user: 'Sneha Patel', type: 'Customer', txType: 'Referral Earning', desc: 'Referral reward — first purchase', credit: 100.00, debit: 0, balance: 890.00, date: '2026-06-23 11:20', status: 'completed' },
  { id: 'TXN-0008', walletId: 'WLT-006', user: 'Deepa Krishnan', type: 'Vendor', txType: 'Admin Debit', desc: 'Penalty: policy violation', credit: 0, debit: 500.00, balance: 0, date: '2026-06-22 08:00', status: 'completed' },
  { id: 'TXN-0009', walletId: 'WLT-008', user: 'Meena Joshi', type: 'Reseller', txType: 'Product Earning', desc: 'Margin on ORD-1108', credit: 680.00, debit: 0, balance: 3200.00, date: '2026-06-22 07:15', status: 'pending' },
  { id: 'TXN-0010', walletId: 'WLT-009', user: 'Suresh Pillai', type: 'Customer', txType: 'Adjustment', desc: 'Balance correction by admin', credit: 50.00, debit: 0, balance: 320.00, date: '2026-06-20 13:00', status: 'completed' },
  { id: 'TXN-0011', walletId: 'WLT-002', user: 'Priya Nair', type: 'Vendor', txType: 'Withdrawal', desc: 'UPI withdrawal #WD-079', credit: 0, debit: 5000.00, balance: 27700.00, date: '2026-06-19 17:55', status: 'completed' },
  { id: 'TXN-0012', walletId: 'WLT-005', user: 'Ravi Kumar', type: 'Affiliate', txType: 'Referral Earning', desc: 'Batch referral payout May', credit: 2200.00, debit: 0, balance: 6200.00, date: '2026-06-18 10:40', status: 'completed' },
  { id: 'TXN-0013', walletId: 'WLT-001', user: 'Arjun Sharma', type: 'Business Customer', txType: 'Refund', desc: 'Refund ORD-0882 partial', credit: 1100.00, debit: 0, balance: 14450.00, date: '2026-06-17 14:20', status: 'reversed' },
  { id: 'TXN-0014', walletId: 'WLT-010', user: 'Farzana Sheikh', type: 'Affiliate', txType: 'Withdrawal', desc: 'Bank transfer #WD-072', credit: 0, debit: 8000.00, balance: 6600.00, date: '2026-06-15 09:00', status: 'completed' },
  { id: 'TXN-0015', walletId: 'WLT-007', user: 'Anil Verma', type: 'Business Customer', txType: 'Product Earning', desc: 'Resell margin ORD-1050', credit: 900.00, debit: 0, balance: 14100.00, date: '2026-06-14 15:30', status: 'failed' },
];

const DEFAULT_WITHDRAWALS = [
  { id: 'WD-001', user: 'Priya Nair', type: 'Vendor', walletId: 'WLT-002', amount: 5000.00, method: 'Bank Transfer', account: 'SBI ****4521', date: '2026-06-27', status: 'pending', note: '' },
  { id: 'WD-002', user: 'Ravi Kumar', type: 'Affiliate', walletId: 'WLT-005', amount: 2000.00, method: 'UPI', account: 'ravi@okaxis', date: '2026-06-26', status: 'under_review', note: 'Verifying bank details' },
  { id: 'WD-003', user: 'Arjun Sharma', type: 'Business Customer', walletId: 'WLT-001', amount: 2000.00, method: 'Bank Transfer', account: 'HDFC ****7734', date: '2026-06-26', status: 'approved', note: 'Approved — processing next batch' },
  { id: 'WD-004', user: 'Farzana Sheikh', type: 'Affiliate', walletId: 'WLT-010', amount: 8000.00, method: 'Bank Transfer', account: 'Axis ****8812', date: '2026-06-25', status: 'paid', note: 'UTR: HDFC202606251122' },
  { id: 'WD-005', user: 'Anil Verma', type: 'Business Customer', walletId: 'WLT-007', amount: 3000.00, method: 'UPI', account: 'anil@icici', date: '2026-06-25', status: 'processing', note: '' },
  { id: 'WD-006', user: 'Meena Joshi', type: 'Reseller', walletId: 'WLT-008', amount: 1500.00, method: 'UPI', account: 'meena@sbi', date: '2026-06-24', status: 'pending', note: '' },
  { id: 'WD-007', user: 'Sneha Patel', type: 'Customer', walletId: 'WLT-004', amount: 500.00, method: 'UPI', account: 'sneha@paytm', date: '2026-06-24', status: 'rejected', note: 'KYC not completed. Please verify your account.' },
  { id: 'WD-008', user: 'Kiran Mehta', type: 'Reseller', walletId: 'WLT-003', amount: 1200.00, method: 'UPI', account: 'kiran@okaxis', date: '2026-06-23', status: 'failed', note: 'UPI transfer failed — account frozen' },
  { id: 'WD-009', user: 'Priya Nair', type: 'Vendor', walletId: 'WLT-002', amount: 10000.00, method: 'Bank Transfer', account: 'SBI ****4521', date: '2026-06-20', status: 'paid', note: 'UTR: SBI202606202245' },
  { id: 'WD-010', user: 'Suresh Pillai', type: 'Customer', walletId: 'WLT-009', amount: 200.00, method: 'UPI', account: 'suresh@gpay', date: '2026-06-18', status: 'approved', note: '' },
];

const DEFAULT_REFERRAL_LINKS = [
  { id: 'REF-L001', referrer: 'Ravi Kumar', type: 'Affiliate', code: 'RAVI2026A', link: 'https://technostore360.in/ref/RAVI2026A', created: '2026-06-27T07:00:00', expiry: '2026-06-28T07:00:00', status: 'active', clicks: 142, signups: 28, activations: 19, earnings: 950.00 },
  { id: 'REF-L002', referrer: 'Farzana Sheikh', type: 'Affiliate', code: 'FAR26XB', link: 'https://technostore360.in/ref/FAR26XB', created: '2026-06-26T10:00:00', expiry: '2026-06-27T10:00:00', status: 'expired', clicks: 88, signups: 12, activations: 9, earnings: 450.00 },
  { id: 'REF-L003', referrer: 'Arjun Sharma', type: 'Business Customer', code: 'ARJ2026C', link: 'https://technostore360.in/ref/ARJ2026C', created: '2026-06-27T11:30:00', expiry: '2026-06-28T11:30:00', status: 'active', clicks: 34, signups: 5, activations: 3, earnings: 150.00 },
  { id: 'REF-L004', referrer: 'Meena Joshi', type: 'Reseller', code: 'MEE26RZ', link: 'https://technostore360.in/ref/MEE26RZ', created: '2026-06-25T09:00:00', expiry: '2026-06-26T09:00:00', status: 'disabled', clicks: 12, signups: 2, activations: 1, earnings: 50.00 },
  { id: 'REF-L005', referrer: 'Priya Nair', type: 'Vendor', code: 'PRI26V9', link: 'https://technostore360.in/ref/PRI26V9', created: '2026-06-27T08:00:00', expiry: '2026-06-28T08:00:00', status: 'active', clicks: 67, signups: 11, activations: 8, earnings: 400.00 },
];

const DEFAULT_REFERRED_USERS = [
  { id: 'RU-001', name: 'Vikram Singh', email: 'vikram@company.in', phone: '+91-9812345670', referrer: 'Ravi Kumar', code: 'RAVI2026A', regDate: '2026-06-27', activDate: '2026-06-27', accountType: 'Business Customer', actStatus: 'Activated', rewardStatus: 'Approved', reward: 50.00 },
  { id: 'RU-002', name: 'Asha Reddy', email: 'asha.r@startup.io', phone: '+91-9900112233', referrer: 'Farzana Sheikh', code: 'FAR26XB', regDate: '2026-06-26', activDate: '2026-06-26', accountType: 'Customer', actStatus: 'Verified', rewardStatus: 'Pending', reward: 50.00 },
  { id: 'RU-003', name: 'Nikhil Bose', email: 'nikhil@techfirm.co', phone: '+91-9876543210', referrer: 'Priya Nair', code: 'PRI26V9', regDate: '2026-06-27', activDate: null, accountType: 'Vendor', actStatus: 'Pending Verification', rewardStatus: 'Not Eligible', reward: 0 },
  { id: 'RU-004', name: 'Tara Menon', email: 'tara.m@partner.in', phone: '+91-8800990011', referrer: 'Arjun Sharma', code: 'ARJ2026C', regDate: '2026-06-27', activDate: '2026-06-27', accountType: 'Reseller', actStatus: 'Activated', rewardStatus: 'Paid', reward: 50.00 },
  { id: 'RU-005', name: 'Sameer Gupta', email: 'sameer@resell.biz', phone: '+91-9111223344', referrer: 'Ravi Kumar', code: 'RAVI2026A', regDate: '2026-06-25', activDate: null, accountType: 'Business Customer', actStatus: 'Registered', rewardStatus: 'Not Eligible', reward: 0 },
];

const DEFAULT_ACTIVATIONS = [
  { id: 'ACT-001', refUser: 'Vikram Singh', referrer: 'Ravi Kumar', regDate: '2026-06-27', verStatus: 'Verified', required: 'First Purchase', activDate: '2026-06-27', actStatus: 'Activated', rewardElig: 'Eligible', decision: 'Approved', note: '' },
  { id: 'ACT-002', refUser: 'Asha Reddy', referrer: 'Farzana Sheikh', regDate: '2026-06-26', verStatus: 'Verified', required: 'KYC Upload', activDate: null, actStatus: 'Pending', rewardElig: 'Pending', decision: 'Awaiting', note: '' },
  { id: 'ACT-003', refUser: 'Nikhil Bose', referrer: 'Priya Nair', regDate: '2026-06-27', verStatus: 'Pending', required: 'Email Verification', activDate: null, actStatus: 'Pending', rewardElig: 'Not Eligible', decision: 'Pending', note: '' },
  { id: 'ACT-004', refUser: 'Tara Menon', referrer: 'Arjun Sharma', regDate: '2026-06-27', verStatus: 'Verified', required: 'First Purchase', activDate: '2026-06-27', actStatus: 'Activated', rewardElig: 'Eligible', decision: 'Reward Paid', note: 'Paid via wallet' },
  { id: 'ACT-005', refUser: 'Sameer Gupta', referrer: 'Ravi Kumar', regDate: '2026-06-25', verStatus: 'Registered', required: 'Email Verification', activDate: null, actStatus: 'Registered', rewardElig: 'Not Eligible', decision: 'Pending', note: '' },
];

const DEFAULT_VIDEO_VIEWERS = [
  { id: 'USR-1002', name: 'Priya Nair', email: 'priya@techhub.in', type: 'Vendor', watched: true, pct: 100, completed: 'Completed', firstView: '2026-06-20', lastView: '2026-06-25' },
  { id: 'USR-1005', name: 'Ravi Kumar', email: 'ravi.k@affiliate.io', type: 'Affiliate', watched: true, pct: 78, completed: 'In Progress', firstView: '2026-06-22', lastView: '2026-06-27' },
  { id: 'USR-1001', name: 'Arjun Sharma', email: 'arjun@acmecorp.com', type: 'Business Customer', watched: true, pct: 100, completed: 'Completed', firstView: '2026-06-24', lastView: '2026-06-24' },
  { id: 'USR-1010', name: 'Farzana Sheikh', email: 'farzana@affpro.com', type: 'Affiliate', watched: true, pct: 45, completed: 'In Progress', firstView: '2026-06-27', lastView: '2026-06-27' },
  { id: 'USR-1004', name: 'Sneha Patel', email: 'sneha.p@gmail.com', type: 'Customer', watched: false, pct: 0, completed: 'Not Started', firstView: null, lastView: null },
];

/* ══════════════════════════════════════════════
   STATE MANAGEMENT (localStorage)
══════════════════════════════════════════════ */
const Store = {
  get(key, def) {
    try { const v = localStorage.getItem('aw_' + key); return v ? JSON.parse(v) : def; }
    catch (e) { return def; }
  },
  set(key, val) { localStorage.setItem('aw_' + key, JSON.stringify(val)); },
  init() {
    if (!this.get('initialized')) {
      this.set('wallets', DEFAULT_WALLETS);
      this.set('transactions', DEFAULT_TRANSACTIONS);
      this.set('withdrawals', DEFAULT_WITHDRAWALS);
      this.set('refLinks', DEFAULT_REFERRAL_LINKS);
      this.set('refUsers', DEFAULT_REFERRED_USERS);
      this.set('activations', DEFAULT_ACTIVATIONS);
      this.set('videoViewers', DEFAULT_VIDEO_VIEWERS);
      this.set('initialized', true);
    }
  },
  reset() {
    ['wallets','transactions','withdrawals','refLinks','refUsers','activations','videoViewers','initialized']
      .forEach(k => localStorage.removeItem('aw_' + k));
    this.init();
    Toast.info('Demo data reset to defaults.');
    setTimeout(() => location.reload(), 1200);
  }
};

/* ══════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════ */
function fmt(n) { return '$' + Number(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

function statusBadge(status) {
  const map = {
    active:       ['#10b981','rgba(16,185,129,0.1)','Active'],
    pending:      ['#f59e0b','rgba(245,158,11,0.1)','Pending'],
    frozen:       ['#3b82f6','rgba(59,130,246,0.1)','Frozen'],
    suspended:    ['#ef4444','rgba(239,68,68,0.1)','Suspended'],
    closed:       ['#6b7280','rgba(107,114,128,0.1)','Closed'],
    completed:    ['#10b981','rgba(16,185,129,0.1)','Completed'],
    failed:       ['#ef4444','rgba(239,68,68,0.1)','Failed'],
    cancelled:    ['#6b7280','rgba(107,114,128,0.1)','Cancelled'],
    reversed:     ['#8b5cf6','rgba(139,92,246,0.1)','Reversed'],
    approved:     ['#10b981','rgba(16,185,129,0.1)','Approved'],
    rejected:     ['#ef4444','rgba(239,68,68,0.1)','Rejected'],
    processing:   ['#3b82f6','rgba(59,130,246,0.1)','Processing'],
    paid:         ['#059669','rgba(5,150,105,0.1)','Paid'],
    under_review: ['#f59e0b','rgba(245,158,11,0.1)','Under Review'],
    expired:      ['#6b7280','rgba(107,114,128,0.1)','Expired'],
    disabled:     ['#ef4444','rgba(239,68,68,0.1)','Disabled'],
  };
  const s = status ? status.toLowerCase().replace(/ /g,'_') : 'pending';
  const [color, bg, label] = map[s] || ['#6b7280','rgba(107,114,128,0.1)', status];
  return `<span style="display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:50px;font-size:11px;font-weight:600;background:${bg};color:${color}">
    <span style="width:6px;height:6px;border-radius:50%;background:${color};flex-shrink:0"></span>${label}</span>`;
}

function userTypeBadge(type) {
  const colors = {
    'Vendor':['#f59e0b','rgba(245,158,11,0.1)'],
    'Reseller':['#0d9488','rgba(13,148,136,0.1)'],
    'Affiliate':['#8b5cf6','rgba(139,92,246,0.1)'],
    'Business Customer':['#2563eb','rgba(37,99,235,0.1)'],
    'Customer':['#6b7280','rgba(107,114,128,0.1)'],
  };
  const [c,bg] = colors[type] || ['#6b7280','rgba(107,114,128,0.1)'];
  return `<span style="padding:2px 8px;border-radius:50px;font-size:11px;font-weight:600;background:${bg};color:${c}">${type}</span>`;
}

/* ══════════════════════════════════════════════
   WALLET PAGE
══════════════════════════════════════════════ */
let walletPage = 1, walletPerPage = 10, walletFilters = {}, activeWalletId = null;

function initWalletPage() {
  Store.init();
  renderWalletCards();
  renderWalletTable();
  setupWalletFilters();
}

function renderWalletCards() {
  const wallets = Store.get('wallets', []);
  const totalAvail = wallets.reduce((s,w) => s + w.available, 0);
  const totalPending = wallets.reduce((s,w) => s + w.pending, 0);
  const totalEarnings = wallets.reduce((s,w) => s + w.earnings, 0);
  const totalWithdrawn = wallets.reduce((s,w) => s + w.withdrawn, 0);
  const txns = Store.get('transactions', []);
  const wds = Store.get('withdrawals', []);

  const set = (id, val) => { const el = document.getElementById(id); if(el) el.textContent = val; };
  set('card-total-balance', fmt(totalAvail + totalPending));
  set('card-available', fmt(totalAvail));
  set('card-pending', fmt(totalPending));
  set('card-user-earnings', fmt(wallets.filter(w=>w.type==='Customer'||w.type==='Business Customer').reduce((s,w)=>s+w.earnings,0)));
  set('card-vendor-earnings', fmt(wallets.filter(w=>w.type==='Vendor'||w.type==='Reseller').reduce((s,w)=>s+w.earnings,0)));
  set('card-withdrawn', fmt(totalWithdrawn));
  set('card-wd-pending', wds.filter(w=>w.status==='pending').length);
  set('card-tx-completed', txns.filter(t=>t.status==='completed').length);
  set('card-tx-failed', txns.filter(t=>t.status==='failed').length);
}

function getFilteredWallets() {
  let data = Store.get('wallets', []);
  const f = walletFilters;
  if (f.search) { const s = f.search.toLowerCase(); data = data.filter(w => w.name.toLowerCase().includes(s) || w.email.toLowerCase().includes(s) || w.userId.toLowerCase().includes(s)); }
  if (f.type && f.type !== 'all') data = data.filter(w => w.type === f.type);
  if (f.status && f.status !== 'all') data = data.filter(w => w.status === f.status);
  if (f.minBal) data = data.filter(w => w.available >= parseFloat(f.minBal));
  if (f.maxBal) data = data.filter(w => w.available <= parseFloat(f.maxBal));
  if (f.sort === 'balance_desc') data.sort((a,b) => b.available - a.available);
  else if (f.sort === 'balance_asc') data.sort((a,b) => a.available - b.available);
  else if (f.sort === 'earnings_desc') data.sort((a,b) => b.earnings - a.earnings);
  else if (f.sort === 'tx_latest') data.sort((a,b) => new Date(b.lastTx) - new Date(a.lastTx));
  return data;
}

function renderWalletTable() {
  const tbody = document.getElementById('wallet-tbody');
  if (!tbody) return;
  const data = getFilteredWallets();
  const total = data.length;
  const start = (walletPage - 1) * walletPerPage;
  const page = data.slice(start, start + walletPerPage);

  if (page.length === 0) {
    tbody.innerHTML = `<tr><td colspan="12" style="text-align:center;padding:40px;color:var(--color-text-muted)">
      <span class="material-symbols-outlined" style="font-size:40px;display:block;margin-bottom:8px">search_off</span>
      No wallets found matching your filters.</td></tr>`;
  } else {
    tbody.innerHTML = page.map(w => `
      <tr class="table-row">
        <td style="padding:12px 10px;font-size:12px;color:var(--color-text-muted)">${w.userId}</td>
        <td style="padding:12px 10px">
          <div style="display:flex;align-items:center;gap:10px">
            <div style="width:32px;height:32px;border-radius:50%;background:var(--color-pink-primary);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;flex-shrink:0">${w.name.charAt(0)}</div>
            <div><div style="font-weight:600;font-size:13px">${w.name}</div><div style="font-size:11px;color:var(--color-text-muted)">${w.email}</div></div>
          </div>
        </td>
        <td style="padding:12px 10px">${userTypeBadge(w.type)}</td>
        <td style="padding:12px 10px;font-weight:600;font-size:13px">${fmt(w.available)}</td>
        <td style="padding:12px 10px;color:var(--color-text-muted);font-size:13px">${fmt(w.pending)}</td>
        <td style="padding:12px 10px;font-size:13px">${fmt(w.earnings)}</td>
        <td style="padding:12px 10px;font-size:13px">${fmt(w.withdrawn)}</td>
        <td style="padding:12px 10px;font-size:13px;color:#8b5cf6">${fmt(w.referral)}</td>
        <td style="padding:12px 10px" id="ws-${w.id}">${statusBadge(w.status)}</td>
        <td style="padding:12px 10px;font-size:12px;color:var(--color-text-muted)">${w.lastTx}</td>
        <td style="padding:12px 10px">
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            <button onclick="openWalletDetail('${w.id}')" style="padding:5px 10px;font-size:11px;border-radius:6px;border:1px solid var(--color-pink-primary);color:var(--color-pink-primary);background:none;cursor:pointer">View</button>
            <button onclick="openCreditDebitModal('${w.id}','credit')" style="padding:5px 10px;font-size:11px;border-radius:6px;border:1px solid var(--color-success);color:var(--color-success);background:none;cursor:pointer">Credit</button>
            <button onclick="openCreditDebitModal('${w.id}','debit')" style="padding:5px 10px;font-size:11px;border-radius:6px;border:1px solid var(--color-warning);color:var(--color-warning);background:none;cursor:pointer">Debit</button>
            <button onclick="toggleWalletStatus('${w.id}')" style="padding:5px 10px;font-size:11px;border-radius:6px;border:1px solid var(--color-danger);color:var(--color-danger);background:none;cursor:pointer">${w.status === 'frozen' ? 'Unfreeze' : 'Freeze'}</button>
          </div>
        </td>
      </tr>`).join('');
  }
  renderWalletPagination(total);
}

function renderWalletPagination(total) {
  const el = document.getElementById('wallet-pagination');
  if (!el) return;
  const pages = Math.ceil(total / walletPerPage);
  const info = document.getElementById('wallet-page-info');
  if (info) info.textContent = `Showing ${Math.min((walletPage-1)*walletPerPage+1, total)}–${Math.min(walletPage*walletPerPage,total)} of ${total} wallets`;
  el.innerHTML = `
    <button onclick="setWalletPage(${walletPage-1})" ${walletPage<=1?'disabled':''} style="padding:6px 12px;border-radius:6px;border:1px solid var(--color-border);background:var(--color-bg-card);cursor:pointer;color:var(--color-text-dark)">‹ Prev</button>
    ${Array.from({length:Math.min(pages,5)},(_,i)=>i+1).map(p=>`<button onclick="setWalletPage(${p})" style="padding:6px 12px;border-radius:6px;border:1px solid ${p===walletPage?'var(--color-pink-primary)':'var(--color-border)'};background:${p===walletPage?'var(--color-pink-primary)':'var(--color-bg-card)'};color:${p===walletPage?'#fff':'var(--color-text-dark)'};cursor:pointer">${p}</button>`).join('')}
    <button onclick="setWalletPage(${walletPage+1})" ${walletPage>=pages?'disabled':''} style="padding:6px 12px;border-radius:6px;border:1px solid var(--color-border);background:var(--color-bg-card);cursor:pointer;color:var(--color-text-dark)">Next ›</button>`;
}

function setWalletPage(p) { walletPage = p; renderWalletTable(); }

function setupWalletFilters() {
  const apply = () => {
    walletFilters = {
      search: document.getElementById('wf-search')?.value || '',
      type: document.getElementById('wf-type')?.value || 'all',
      status: document.getElementById('wf-status')?.value || 'all',
      minBal: document.getElementById('wf-min')?.value || '',
      maxBal: document.getElementById('wf-max')?.value || '',
      sort: document.getElementById('wf-sort')?.value || '',
    };
    walletPage = 1; renderWalletTable();
  };
  document.getElementById('wf-apply')?.addEventListener('click', apply);
  document.getElementById('wf-search')?.addEventListener('input', apply);
  document.getElementById('wf-reset')?.addEventListener('click', () => {
    ['wf-search','wf-type','wf-status','wf-min','wf-max','wf-sort'].forEach(id => {
      const el = document.getElementById(id); if(el) el.value = id.includes('type')||id.includes('status')||id.includes('sort') ? 'all' : '';
    });
    walletFilters = {}; walletPage = 1; renderWalletTable();
  });
}

function openWalletDetail(wid) {
  activeWalletId = wid;
  const wallets = Store.get('wallets', []);
  const w = wallets.find(x => x.id === wid);
  if (!w) return;
  const txns = Store.get('transactions', []).filter(t => t.walletId === wid).slice(0,5);
  const wds = Store.get('withdrawals', []).filter(d => d.walletId === wid).slice(0,5);

  document.getElementById('wd-name').textContent = w.name;
  document.getElementById('wd-email').textContent = w.email;
  document.getElementById('wd-type').innerHTML = userTypeBadge(w.type);
  document.getElementById('wd-id').textContent = w.id;
  document.getElementById('wd-user-id').textContent = w.userId;
  document.getElementById('wd-status').innerHTML = statusBadge(w.status);
  document.getElementById('wd-available').textContent = fmt(w.available);
  document.getElementById('wd-pending').textContent = fmt(w.pending);
  document.getElementById('wd-earnings').textContent = fmt(w.earnings);
  document.getElementById('wd-withdrawn').textContent = fmt(w.withdrawn);
  document.getElementById('wd-referral').textContent = fmt(w.referral);
  document.getElementById('wd-method').textContent = w.method;
  document.getElementById('wd-account').textContent = w.account;
  document.getElementById('wd-created').textContent = w.created;
  document.getElementById('wd-last-tx').textContent = w.lastTx;

  const txHtml = txns.length ? txns.map(t => `<tr>
    <td style="padding:8px;font-size:12px">${t.id}</td>
    <td style="padding:8px;font-size:12px">${t.txType}</td>
    <td style="padding:8px;font-size:12px;color:var(--color-success)">${t.credit > 0 ? fmt(t.credit) : '—'}</td>
    <td style="padding:8px;font-size:12px;color:var(--color-danger)">${t.debit > 0 ? fmt(t.debit) : '—'}</td>
    <td style="padding:8px;font-size:12px">${statusBadge(t.status)}</td>
  </tr>`).join('') : `<tr><td colspan="5" style="text-align:center;padding:16px;color:var(--color-text-muted);font-size:12px">No transactions yet</td></tr>`;
  document.getElementById('wd-txn-body').innerHTML = txHtml;

  Modal.open('wallet-detail-modal');
}

function openCreditDebitModal(wid, mode) {
  activeWalletId = wid;
  const wallets = Store.get('wallets', []);
  const w = wallets.find(x => x.id === wid);
  const modeLabel = mode === 'credit' ? 'Add Credit' : 'Add Debit';
  document.getElementById('cd-modal-title').textContent = `${modeLabel} — ${w?.name || wid}`;
  document.getElementById('cd-modal-mode').value = mode;
  document.getElementById('cd-modal-wid').value = wid;
  document.getElementById('cd-amount').value = '';
  document.getElementById('cd-reason').value = '';
  document.getElementById('cd-ref').value = '';
  document.getElementById('cd-notes').value = '';
  document.getElementById('cd-available').textContent = fmt(w?.available || 0);
  Modal.open('credit-debit-modal');
}

function confirmCreditDebit() {
  const wid = document.getElementById('cd-modal-wid').value;
  const mode = document.getElementById('cd-modal-mode').value;
  const amount = parseFloat(document.getElementById('cd-amount').value);
  const reason = document.getElementById('cd-reason').value.trim();

  if (!amount || isNaN(amount) || amount <= 0) { Toast.error('Amount is required and must be greater than zero.'); return; }
  if (!reason) { Toast.error('Reason is required.'); return; }

  const wallets = Store.get('wallets', []);
  const idx = wallets.findIndex(w => w.id === wid);
  if (idx < 0) return;

  if (mode === 'debit' && amount > wallets[idx].available) { Toast.error('Debit amount cannot exceed available balance.'); return; }

  const txns = Store.get('transactions', []);
  const newTxId = 'TXN-' + String(txns.length + 1).padStart(4,'0');

  if (mode === 'credit') {
    wallets[idx].available += amount;
    wallets[idx].earnings += amount;
    txns.unshift({ id: newTxId, walletId: wid, user: wallets[idx].name, type: wallets[idx].type, txType: 'Admin Credit', desc: reason, credit: amount, debit: 0, balance: wallets[idx].available, date: new Date().toISOString().slice(0,16).replace('T',' '), status: 'completed' });
    Toast.success(`Demo credit of ${fmt(amount)} added successfully.`);
  } else {
    wallets[idx].available -= amount;
    wallets[idx].withdrawn += amount;
    txns.unshift({ id: newTxId, walletId: wid, user: wallets[idx].name, type: wallets[idx].type, txType: 'Admin Debit', desc: reason, credit: 0, debit: amount, balance: wallets[idx].available, date: new Date().toISOString().slice(0,16).replace('T',' '), status: 'completed' });
    Toast.success(`Demo debit of ${fmt(amount)} applied successfully.`);
  }
  Store.set('wallets', wallets);
  Store.set('transactions', txns);
  Modal.close('credit-debit-modal');
  renderWalletCards();
  renderWalletTable();
}

function toggleWalletStatus(wid) {
  const wallets = Store.get('wallets', []);
  const w = wallets.find(x => x.id === wid);
  if (!w) return;
  const action = w.status === 'frozen' ? 'unfreeze' : 'freeze';
  if (!confirm(`Are you sure you want to ${action} wallet ${wid} for ${w.name}?`)) return;
  w.status = w.status === 'frozen' ? 'active' : 'frozen';
  Store.set('wallets', wallets);
  const badge = document.getElementById('ws-' + wid);
  if (badge) badge.innerHTML = statusBadge(w.status);
  renderWalletTable();
  Toast.success(`Wallet ${action === 'freeze' ? 'frozen' : 'unfrozen'} successfully.`);
}

/* ══════════════════════════════════════════════
   TRANSACTIONS PAGE
══════════════════════════════════════════════ */
let txPage = 1, txPerPage = 10, txFilters = {};

function initTransactionsPage() {
  Store.init();
  renderTransactionsTable();
  document.getElementById('txf-apply')?.addEventListener('click', applyTxFilters);
  document.getElementById('txf-search')?.addEventListener('input', applyTxFilters);
  document.getElementById('txf-reset')?.addEventListener('click', resetTxFilters);
}

function applyTxFilters() {
  txFilters = {
    search: document.getElementById('txf-search')?.value || '',
    type: document.getElementById('txf-type')?.value || 'all',
    status: document.getElementById('txf-status')?.value || 'all',
    dateFrom: document.getElementById('txf-from')?.value || '',
    dateTo: document.getElementById('txf-to')?.value || '',
  };
  txPage = 1; renderTransactionsTable();
}

function resetTxFilters() {
  ['txf-search','txf-type','txf-status','txf-from','txf-to'].forEach(id => {
    const el = document.getElementById(id); if(el) el.value = '';
  });
  txFilters = {}; txPage = 1; renderTransactionsTable();
}

function renderTransactionsTable() {
  const tbody = document.getElementById('tx-tbody');
  if (!tbody) return;
  let data = Store.get('transactions', []);
  const f = txFilters;
  if (f.search) { const s = f.search.toLowerCase(); data = data.filter(t => t.id.toLowerCase().includes(s) || t.user.toLowerCase().includes(s)); }
  if (f.type && f.type !== 'all') data = data.filter(t => t.txType === f.type);
  if (f.status && f.status !== 'all') data = data.filter(t => t.status === f.status);
  const total = data.length;
  const page = data.slice((txPage-1)*txPerPage, txPage*txPerPage);
  tbody.innerHTML = page.length ? page.map(t => `<tr>
    <td style="padding:12px 10px;font-size:12px;font-family:monospace">${t.id}</td>
    <td style="padding:12px 10px;font-size:12px;color:var(--color-text-muted)">${t.walletId}</td>
    <td style="padding:12px 10px;font-size:13px;font-weight:500">${t.user}</td>
    <td style="padding:12px 10px">${userTypeBadge(t.type)}</td>
    <td style="padding:12px 10px;font-size:12px">${t.txType}</td>
    <td style="padding:12px 10px;font-size:12px;color:var(--color-text-muted);max-width:200px">${t.desc}</td>
    <td style="padding:12px 10px;font-weight:600;color:var(--color-success)">${t.credit > 0 ? fmt(t.credit) : '—'}</td>
    <td style="padding:12px 10px;font-weight:600;color:var(--color-danger)">${t.debit > 0 ? fmt(t.debit) : '—'}</td>
    <td style="padding:12px 10px;font-size:12px">${fmt(t.balance)}</td>
    <td style="padding:12px 10px;font-size:12px;color:var(--color-text-muted)">${t.date}</td>
    <td style="padding:12px 10px">${statusBadge(t.status)}</td>
  </tr>`).join('') : `<tr><td colspan="11" style="text-align:center;padding:40px;color:var(--color-text-muted)">No transactions found.</td></tr>`;
  const pag = document.getElementById('tx-pagination');
  const info = document.getElementById('tx-page-info');
  const pages = Math.ceil(total / txPerPage);
  if (info) info.textContent = `${Math.min((txPage-1)*txPerPage+1,total)}–${Math.min(txPage*txPerPage,total)} of ${total}`;
  if (pag) pag.innerHTML = `<button onclick="setTxPage(${txPage-1})" ${txPage<=1?'disabled':''} style="padding:5px 10px;border-radius:6px;border:1px solid var(--color-border);background:var(--color-bg-card);cursor:pointer">‹</button>${Array.from({length:Math.min(pages,5)},(_,i)=>i+1).map(p=>`<button onclick="setTxPage(${p})" style="padding:5px 10px;border-radius:6px;border:1px solid ${p===txPage?'var(--color-pink-primary)':'var(--color-border)'};background:${p===txPage?'var(--color-pink-primary)':'var(--color-bg-card)'};color:${p===txPage?'#fff':'var(--color-text-dark)'};cursor:pointer">${p}</button>`).join('')}<button onclick="setTxPage(${txPage+1})" ${txPage>=pages?'disabled':''} style="padding:5px 10px;border-radius:6px;border:1px solid var(--color-border);background:var(--color-bg-card);cursor:pointer">›</button>`;
}
function setTxPage(p) { txPage = p; renderTransactionsTable(); }

/* ══════════════════════════════════════════════
   WITHDRAWALS PAGE
══════════════════════════════════════════════ */
let wdPage = 1, wdPerPage = 10, wdFilters = {}, activeWdId = null;

function initWithdrawalsPage() {
  Store.init();
  renderWithdrawalsTable();
  document.getElementById('wdf-apply')?.addEventListener('click', applyWdFilters);
  document.getElementById('wdf-search')?.addEventListener('input', applyWdFilters);
  document.getElementById('wdf-reset')?.addEventListener('click', resetWdFilters);
}

function applyWdFilters() {
  wdFilters = {
    search: document.getElementById('wdf-search')?.value || '',
    status: document.getElementById('wdf-status')?.value || 'all',
  };
  wdPage = 1; renderWithdrawalsTable();
}
function resetWdFilters() { wdFilters = {}; wdPage = 1; renderWithdrawalsTable(); }

function renderWithdrawalsTable() {
  const tbody = document.getElementById('wd-tbody');
  if (!tbody) return;
  let data = Store.get('withdrawals', []);
  const f = wdFilters;
  if (f.search) { const s = f.search.toLowerCase(); data = data.filter(w => w.user.toLowerCase().includes(s) || w.id.toLowerCase().includes(s)); }
  if (f.status && f.status !== 'all') data = data.filter(w => w.status === f.status);
  const total = data.length, page = data.slice((wdPage-1)*wdPerPage, wdPage*wdPerPage);
  tbody.innerHTML = page.length ? page.map(w => `<tr id="wdr-${w.id}">
    <td style="padding:12px 10px;font-size:12px;font-family:monospace">${w.id}</td>
    <td style="padding:12px 10px;font-size:13px;font-weight:500">${w.user}</td>
    <td style="padding:12px 10px">${userTypeBadge(w.type)}</td>
    <td style="padding:12px 10px;font-weight:700;font-size:14px">${fmt(w.amount)}</td>
    <td style="padding:12px 10px;font-size:12px">${w.method}</td>
    <td style="padding:12px 10px;font-size:12px;color:var(--color-text-muted)">${w.account}</td>
    <td style="padding:12px 10px;font-size:12px;color:var(--color-text-muted)">${w.date}</td>
    <td style="padding:12px 10px" id="wdst-${w.id}">${statusBadge(w.status)}</td>
    <td style="padding:12px 10px;font-size:11px;color:var(--color-text-muted);max-width:150px">${w.note || '—'}</td>
    <td style="padding:12px 10px">
      <div style="display:flex;gap:5px;flex-wrap:wrap">
        ${w.status === 'pending' ? `<button onclick="updateWdStatus('${w.id}','approved')" style="padding:4px 8px;font-size:11px;border-radius:5px;border:1px solid var(--color-success);color:var(--color-success);background:none;cursor:pointer">Approve</button>` : ''}
        ${(w.status === 'approved'||w.status==='under_review') ? `<button onclick="updateWdStatus('${w.id}','processing')" style="padding:4px 8px;font-size:11px;border-radius:5px;border:1px solid #3b82f6;color:#3b82f6;background:none;cursor:pointer">Processing</button><button onclick="updateWdStatus('${w.id}','paid')" style="padding:4px 8px;font-size:11px;border-radius:5px;border:1px solid #059669;color:#059669;background:none;cursor:pointer">Mark Paid</button>` : ''}
        ${(w.status === 'pending'||w.status==='under_review') ? `<button onclick="openWdRejectModal('${w.id}')" style="padding:4px 8px;font-size:11px;border-radius:5px;border:1px solid var(--color-danger);color:var(--color-danger);background:none;cursor:pointer">Reject</button>` : ''}
        ${w.status === 'processing' ? `<button onclick="updateWdStatus('${w.id}','paid')" style="padding:4px 8px;font-size:11px;border-radius:5px;border:1px solid #059669;color:#059669;background:none;cursor:pointer">Mark Paid</button><button onclick="updateWdStatus('${w.id}','failed')" style="padding:4px 8px;font-size:11px;border-radius:5px;border:1px solid var(--color-danger);color:var(--color-danger);background:none;cursor:pointer">Mark Failed</button>` : ''}
      </div>
    </td></tr>`).join('') : `<tr><td colspan="10" style="text-align:center;padding:40px;color:var(--color-text-muted)">No withdrawal requests found.</td></tr>`;
  const info = document.getElementById('wd-page-info');
  if (info) info.textContent = `${total} requests`;
}

function updateWdStatus(id, status) {
  const withdrawals = Store.get('withdrawals', []);
  const w = withdrawals.find(x => x.id === id);
  if (!w) return;
  if (!confirm(`Mark withdrawal ${id} as "${status.replace('_',' ')}"?`)) return;
  w.status = status;
  if (status === 'paid') w.note = 'UTR: DEMO' + Date.now().toString().slice(-10);
  Store.set('withdrawals', withdrawals);
  const st = document.getElementById('wdst-' + id);
  if (st) st.innerHTML = statusBadge(status);
  renderWithdrawalsTable();
  Toast.success(`Withdrawal ${id} marked as ${status.replace('_',' ')}.`);
}

function openWdRejectModal(id) {
  activeWdId = id;
  document.getElementById('wd-reject-note').value = '';
  Modal.open('wd-reject-modal');
}

function confirmWdReject() {
  const note = document.getElementById('wd-reject-note').value.trim();
  if (!note) { Toast.error('Admin note is required for rejection.'); return; }
  const withdrawals = Store.get('withdrawals', []);
  const w = withdrawals.find(x => x.id === activeWdId);
  if (!w) return;
  w.status = 'rejected';
  w.note = note;
  Store.set('withdrawals', withdrawals);
  Modal.close('wd-reject-modal');
  renderWithdrawalsTable();
  Toast.success(`Withdrawal ${activeWdId} rejected. Note saved.`);
}

/* ══════════════════════════════════════════════
   REFERRALS PAGE
══════════════════════════════════════════════ */
let refTab = 'links', countdownIntervals = {};

function initReferralsPage() {
  Store.init();
  renderReferralCards();
  switchRefTab('links');
  startAllCountdowns();
}

function renderReferralCards() {
  const links = Store.get('refLinks', []);
  const users = Store.get('refUsers', []);
  const acts = Store.get('activations', []);
  const set = (id, v) => { const el = document.getElementById(id); if(el) el.textContent = v; };
  set('rc-total-links', links.length);
  set('rc-active-links', links.filter(l=>l.status==='active').length);
  set('rc-expired-links', links.filter(l=>l.status==='expired').length);
  set('rc-total-users', users.length);
  set('rc-successful', acts.filter(a=>a.actStatus==='Activated').length);
  set('rc-pending-acts', acts.filter(a=>a.actStatus==='Pending').length);
  set('rc-rejected-acts', acts.filter(a=>a.decision==='Rejected').length);
  const totalReward = users.reduce((s,u)=>s+u.reward,0);
  set('rc-total-reward', fmt(totalReward));
  set('rc-pending-reward', fmt(users.filter(u=>u.rewardStatus==='Pending').reduce((s,u)=>s+u.reward,0)));
  set('rc-paid-reward', fmt(users.filter(u=>u.rewardStatus==='Paid').reduce((s,u)=>s+u.reward,0)));
}

function switchRefTab(tab) {
  refTab = tab;
  ['links','users','activations','video'].forEach(t => {
    const btn = document.getElementById('tab-btn-' + t);
    const panel = document.getElementById('tab-panel-' + t);
    if (btn) { btn.style.borderBottom = t === tab ? '2px solid var(--color-pink-primary)' : '2px solid transparent'; btn.style.color = t === tab ? 'var(--color-pink-primary)' : 'var(--color-text-muted)'; }
    if (panel) panel.style.display = t === tab ? 'block' : 'none';
  });
  if (tab === 'links') renderRefLinksTable();
  if (tab === 'users') renderRefUsersTable();
  if (tab === 'activations') renderActivationsTable();
  if (tab === 'video') renderVideoSection();
}

function renderRefLinksTable() {
  const tbody = document.getElementById('ref-links-tbody');
  if (!tbody) return;
  const links = Store.get('refLinks', []);
  tbody.innerHTML = links.map(l => {
    const isActive = l.status === 'active';
    const expiry = new Date(l.expiry);
    const remaining = Math.max(0, Math.floor((expiry - new Date()) / 1000));
    return `<tr>
      <td style="padding:12px 10px;font-size:12px;font-family:monospace">${l.id}</td>
      <td style="padding:12px 10px;font-size:13px;font-weight:500">${l.referrer}</td>
      <td style="padding:12px 10px">${userTypeBadge(l.type)}</td>
      <td style="padding:12px 10px;font-size:12px;font-family:monospace;color:var(--color-pink-primary)">${l.code}</td>
      <td style="padding:12px 10px;font-size:11px;color:var(--color-text-muted);max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${l.link}</td>
      <td style="padding:12px 10px;font-size:12px;color:var(--color-text-muted)">${l.created.slice(0,10)}</td>
      <td style="padding:12px 10px;font-size:12px;color:var(--color-text-muted)">${l.expiry.slice(0,16).replace('T',' ')}</td>
      <td style="padding:12px 10px;font-size:12px;font-family:monospace;font-weight:600;color:${isActive&&remaining>0?'var(--color-warning)':'var(--color-danger)'}" id="cd-${l.id}">${isActive && remaining > 0 ? formatCountdown(remaining) : '—'}</td>
      <td style="padding:12px 10px">${statusBadge(l.status)}</td>
      <td style="padding:12px 10px;text-align:center">${l.clicks}</td>
      <td style="padding:12px 10px;text-align:center">${l.signups}</td>
      <td style="padding:12px 10px;text-align:center">${l.activations}</td>
      <td style="padding:12px 10px;font-weight:600">${fmt(l.earnings)}</td>
      <td style="padding:12px 10px">
        <div style="display:flex;gap:5px;flex-wrap:wrap">
          <button onclick="copyRefLink('${l.link}')" style="padding:4px 8px;font-size:11px;border-radius:5px;border:1px solid var(--color-border);background:none;cursor:pointer;color:var(--color-text-dark)">Copy</button>
          ${l.status==='active'?`<button onclick="setRefLinkStatus('${l.id}','disabled')" style="padding:4px 8px;font-size:11px;border-radius:5px;border:1px solid var(--color-danger);color:var(--color-danger);background:none;cursor:pointer">Disable</button>`:''}
          ${l.status==='disabled'?`<button onclick="setRefLinkStatus('${l.id}','active')" style="padding:4px 8px;font-size:11px;border-radius:5px;border:1px solid var(--color-success);color:var(--color-success);background:none;cursor:pointer">Enable</button>`:''}
          <button onclick="generateNewLink('${l.id}')" style="padding:4px 8px;font-size:11px;border-radius:5px;border:1px solid #8b5cf6;color:#8b5cf6;background:none;cursor:pointer">Regenerate</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function formatCountdown(secs) {
  const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600)/60), s = secs % 60;
  return [h,m,s].map(n=>String(n).padStart(2,'0')).join(':');
}

function startAllCountdowns() {
  clearInterval(window._cdInterval);
  window._cdInterval = setInterval(() => {
    const links = Store.get('refLinks', []);
    links.forEach(l => {
      if (l.status !== 'active') return;
      const remaining = Math.max(0, Math.floor((new Date(l.expiry) - new Date()) / 1000));
      const el = document.getElementById('cd-' + l.id);
      if (el) el.textContent = remaining > 0 ? formatCountdown(remaining) : 'Expired';
      if (remaining === 0 && l.status === 'active') {
        l.status = 'expired';
        Store.set('refLinks', links);
        renderRefLinksTable();
        renderReferralCards();
      }
    });
  }, 1000);
}

function setRefLinkStatus(id, status) {
  const links = Store.get('refLinks', []);
  const l = links.find(x => x.id === id);
  if (!l || !confirm(`${status === 'disabled' ? 'Disable' : 'Enable'} referral link ${id}?`)) return;
  l.status = status;
  Store.set('refLinks', links);
  renderRefLinksTable();
  renderReferralCards();
  Toast.success(`Referral link ${status === 'disabled' ? 'disabled' : 'enabled'} successfully.`);
}

function generateNewLink(id) {
  const links = Store.get('refLinks', []);
  const l = links.find(x => x.id === id);
  if (!l || !confirm(`Generate a new replacement link for ${l.referrer}?`)) return;
  const newCode = l.code.slice(0,-2) + Math.random().toString(36).slice(-2).toUpperCase();
  l.code = newCode;
  l.link = 'https://technostore360.in/ref/' + newCode;
  l.created = new Date().toISOString();
  l.expiry = new Date(Date.now() + 24*3600*1000).toISOString();
  l.status = 'active';
  Store.set('refLinks', links);
  renderRefLinksTable();
  Toast.success('New referral link generated successfully.');
}

function copyRefLink(link) {
  navigator.clipboard.writeText(link).then(() => Toast.success('Referral link copied to clipboard!'));
}

function renderRefUsersTable() {
  const tbody = document.getElementById('ref-users-tbody');
  if (!tbody) return;
  const users = Store.get('refUsers', []);
  tbody.innerHTML = users.length ? users.map(u => `<tr>
    <td style="padding:12px 10px;font-size:12px;color:var(--color-text-muted)">${u.id}</td>
    <td style="padding:12px 10px;font-size:13px;font-weight:500">${u.name}</td>
    <td style="padding:12px 10px;font-size:12px">${u.email}</td>
    <td style="padding:12px 10px;font-size:12px;color:var(--color-text-muted)">${u.phone}</td>
    <td style="padding:12px 10px;font-size:13px">${u.referrer}</td>
    <td style="padding:12px 10px;font-family:monospace;font-size:12px;color:var(--color-pink-primary)">${u.code}</td>
    <td style="padding:12px 10px;font-size:12px;color:var(--color-text-muted)">${u.regDate}</td>
    <td style="padding:12px 10px;font-size:12px;color:var(--color-text-muted)">${u.activDate || '—'}</td>
    <td style="padding:12px 10px">${userTypeBadge(u.accountType)}</td>
    <td style="padding:12px 10px">${statusBadge(u.actStatus.toLowerCase().replace(/ /g,'_'))}</td>
    <td style="padding:12px 10px" id="rws-${u.id}">${statusBadge(u.rewardStatus.toLowerCase().replace(/ /g,'_'))}</td>
    <td style="padding:12px 10px;font-weight:600;color:var(--color-success)">${u.reward > 0 ? fmt(u.reward) : '—'}</td>
    <td style="padding:12px 10px">
      ${u.rewardStatus==='Pending'?`<button onclick="approveReward('${u.id}')" style="padding:4px 8px;font-size:11px;border-radius:5px;border:1px solid var(--color-success);color:var(--color-success);background:none;cursor:pointer">Approve Reward</button>`:''}
      ${u.rewardStatus==='Approved'?`<button onclick="markRewardPaid('${u.id}')" style="padding:4px 8px;font-size:11px;border-radius:5px;border:1px solid #059669;color:#059669;background:none;cursor:pointer">Mark Paid</button>`:''}
    </td>
  </tr>`).join('') : `<tr><td colspan="13" style="text-align:center;padding:40px;color:var(--color-text-muted)">No referred users found.</td></tr>`;
}

function approveReward(userId) {
  const users = Store.get('refUsers', []);
  const u = users.find(x => x.id === userId);
  if (!u || !confirm(`Approve referral reward for ${u.name}?`)) return;
  u.rewardStatus = 'Approved';
  Store.set('refUsers', users);
  renderRefUsersTable();
  renderReferralCards();
  Toast.success('Referral reward approved.');
}

function markRewardPaid(userId) {
  const users = Store.get('refUsers', []);
  const u = users.find(x => x.id === userId);
  if (!u || !confirm(`Mark reward as paid for ${u.name}?`)) return;
  u.rewardStatus = 'Paid';
  Store.set('refUsers', users);
  renderRefUsersTable();
  renderReferralCards();
  Toast.success('Referral reward marked as paid.');
}

function renderActivationsTable() {
  const tbody = document.getElementById('act-tbody');
  if (!tbody) return;
  const acts = Store.get('activations', []);
  tbody.innerHTML = acts.length ? acts.map(a => `<tr>
    <td style="padding:12px 10px;font-size:12px;font-family:monospace">${a.id}</td>
    <td style="padding:12px 10px;font-size:13px;font-weight:500">${a.refUser}</td>
    <td style="padding:12px 10px;font-size:13px">${a.referrer}</td>
    <td style="padding:12px 10px;font-size:12px;color:var(--color-text-muted)">${a.regDate}</td>
    <td style="padding:12px 10px">${statusBadge(a.verStatus.toLowerCase().replace(/ /g,'_'))}</td>
    <td style="padding:12px 10px;font-size:12px">${a.required}</td>
    <td style="padding:12px 10px;font-size:12px;color:var(--color-text-muted)">${a.activDate || '—'}</td>
    <td style="padding:12px 10px">${statusBadge(a.actStatus.toLowerCase().replace(/ /g,'_'))}</td>
    <td style="padding:12px 10px">${statusBadge(a.rewardElig.toLowerCase().replace(/ /g,'_'))}</td>
    <td style="padding:12px 10px;font-size:12px;font-weight:600" id="act-dec-${a.id}">${a.decision}</td>
    <td style="padding:12px 10px;font-size:11px;color:var(--color-text-muted)">${a.note || '—'}</td>
    <td style="padding:12px 10px">
      <div style="display:flex;gap:5px;flex-wrap:wrap">
        ${a.actStatus==='Pending'?`<button onclick="approveActivation('${a.id}')" style="padding:4px 8px;font-size:11px;border-radius:5px;border:1px solid var(--color-success);color:var(--color-success);background:none;cursor:pointer">Approve</button><button onclick="rejectActivation('${a.id}')" style="padding:4px 8px;font-size:11px;border-radius:5px;border:1px solid var(--color-danger);color:var(--color-danger);background:none;cursor:pointer">Reject</button>`:''}
        ${a.actStatus==='Activated'&&a.decision!=='Reward Paid'?`<button onclick="approveActReward('${a.id}')" style="padding:4px 8px;font-size:11px;border-radius:5px;border:1px solid #8b5cf6;color:#8b5cf6;background:none;cursor:pointer">Approve Reward</button>`:''}
      </div>
    </td>
  </tr>`).join('') : `<tr><td colspan="12" style="text-align:center;padding:40px;color:var(--color-text-muted)">No activations found.</td></tr>`;
}

function approveActivation(id) {
  const acts = Store.get('activations', []);
  const a = acts.find(x => x.id === id);
  if (!a || !confirm(`Approve activation ${id} for ${a.refUser}?`)) return;
  a.actStatus = 'Activated'; a.decision = 'Approved'; a.activDate = new Date().toISOString().slice(0,10); a.rewardElig = 'Eligible';
  Store.set('activations', acts);
  renderActivationsTable(); renderReferralCards();
  Toast.success('Referral activation approved.');
}

function rejectActivation(id) {
  const acts = Store.get('activations', []);
  const a = acts.find(x => x.id === id);
  if (!a || !confirm(`Reject activation ${id}?`)) return;
  a.actStatus = 'Registered'; a.decision = 'Rejected'; a.rewardElig = 'Not Eligible';
  Store.set('activations', acts);
  renderActivationsTable(); renderReferralCards();
  Toast.warning('Referral activation rejected.');
}

function approveActReward(id) {
  const acts = Store.get('activations', []);
  const a = acts.find(x => x.id === id);
  if (!a || !confirm(`Approve and mark reward as paid for activation ${id}?`)) return;
  a.decision = 'Reward Paid';
  Store.set('activations', acts);
  renderActivationsTable();
  Toast.success('Referral reward approved and marked as paid.');
}

function renderVideoSection() {
  // Video section is static HTML, just render viewers
  const tbody = document.getElementById('video-viewers-tbody');
  if (!tbody) return;
  const viewers = Store.get('videoViewers', []);
  tbody.innerHTML = viewers.map(v => `<tr>
    <td style="padding:12px 10px;font-size:12px;color:var(--color-text-muted)">${v.id}</td>
    <td style="padding:12px 10px;font-size:13px;font-weight:500">${v.name}</td>
    <td style="padding:12px 10px;font-size:12px">${v.email}</td>
    <td style="padding:12px 10px">${userTypeBadge(v.type)}</td>
    <td style="padding:12px 10px">${v.watched ? '<span style="color:var(--color-success)">✓ Watched</span>' : '<span style="color:var(--color-text-muted)">Not watched</span>'}</td>
    <td style="padding:12px 10px">
      <div style="display:flex;align-items:center;gap:8px">
        <div style="flex:1;height:6px;background:var(--color-border);border-radius:3px;min-width:80px"><div style="height:100%;width:${v.pct}%;background:var(--color-pink-primary);border-radius:3px"></div></div>
        <span style="font-size:12px;font-weight:600">${v.pct}%</span>
      </div>
    </td>
    <td style="padding:12px 10px">${statusBadge(v.completed.toLowerCase().replace(/ /g,'_'))}</td>
    <td style="padding:12px 10px;font-size:12px;color:var(--color-text-muted)">${v.firstView || '—'}</td>
    <td style="padding:12px 10px;font-size:12px;color:var(--color-text-muted)">${v.lastView || '—'}</td>
  </tr>`).join('');
}

/* ══════════════════════════════════════════════
   EXPORT (demo CSV)
══════════════════════════════════════════════ */
function exportWalletReport() {
  const wallets = Store.get('wallets', []);
  const csv = ['ID,Name,Type,Email,Available,Pending,Earnings,Withdrawn,Status']
    .concat(wallets.map(w => `${w.id},${w.name},${w.type},${w.email},${w.available},${w.pending},${w.earnings},${w.withdrawn},${w.status}`))
    .join('\n');
  const a = document.createElement('a');
  a.href = 'data:text/csv,' + encodeURIComponent(csv);
  a.download = 'wallet_report_demo.csv';
  a.click();
  Toast.success('Demo wallet report exported.');
}

/* ══════════════════════════════════════════════
   AUTO-INIT ON PAGE LOAD
══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  Store.init();
  if (document.getElementById('wallet-tbody')) initWalletPage();
  if (document.getElementById('tx-tbody')) initTransactionsPage();
  if (document.getElementById('wd-tbody')) initWithdrawalsPage();
  if (document.getElementById('ref-links-tbody')) initReferralsPage();
});
