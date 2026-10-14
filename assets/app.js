/* Core POS app: state, cart maths, rendering loop, navigation and shared UI helpers. */
window.POS = window.POS || {};

(function () {
  const D = POS.data;

  /* ---------- Icons ---------- */
  const P = {
    home: '<path d="M3 11l9-8 9 8M5 9.5V21h5v-6h4v6h5V9.5"/>',
    bag: '<path d="M5 8h14l-1 13H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
    users: '<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0M16 3.5a4 4 0 0 1 0 7.5M22 21a7 7 0 0 0-4-6.3"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    scan: '<path d="M3 7V4h3M18 4h3v3M21 17v3h-3M6 20H3v-3M7 8v8M10 8v8M13 8v8M17 8v8"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    x: '<path d="M18 6L6 18M6 6l12 12"/>',
    back: '<path d="M15 18l-6-6 6-6"/>',
    chev: '<path d="M9 18l6-6-6-6"/>',
    card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/>',
    cash: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>',
    gift: '<rect x="3" y="8" width="18" height="13" rx="1"/><path d="M3 12h18M12 8v13M12 8S10 3 7.5 4.5 9 8 12 8zM12 8s2-5 4.5-3.5S15 8 12 8z"/>',
    link: '<path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>',
    wallet: '<path d="M3 7a2 2 0 0 1 2-2h13v4M3 7v11a2 2 0 0 0 2 2h15V9H5a2 2 0 0 1-2-2z"/><circle cx="16" cy="14.5" r="1.3"/>',
    credit: '<path d="M4 4h16v16H4z"/><path d="M8 9h8M8 13h5"/>',
    store: '<path d="M3 9l1.5-5h15L21 9M3 9h18v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0V9zM5 13v8h14v-8"/>',
    truck: '<path d="M1 4h14v12H1zM15 8h4l4 4v4h-8"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
    box: '<path d="M21 8l-9-5-9 5v8l9 5 9-5V8zM3 8l9 5 9-5M12 13v8"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    check: '<path d="M20 6L9 17l-5-5"/>',
    alert: '<path d="M12 3l10 18H2L12 3z"/><path d="M12 10v5M12 18h.01"/>',
    off: '<path d="M2 2l20 20M8.5 16.5a5 5 0 0 1 7 0M5 13a10 10 0 0 1 5.2-2.8M19 13a10 10 0 0 0-2.5-1.8M2 9a15 15 0 0 1 4.3-2.6M22 9a15 15 0 0 0-11-3.9M12 20h.01"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    percent: '<path d="M19 5L5 19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
    pen: '<path d="M17 3l4 4L8 20H4v-4L17 3z"/>',
    receipt: '<path d="M5 2h14v20l-3-2-2 2-2-2-2 2-2-2-3 2V2zM9 7h6M9 11h6M9 15h4"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/>',
    sms: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    printer: '<path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
    qr: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 17h4v4h-4"/>',
    ret: '<path d="M9 14L4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-4"/>',
    userplus: '<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0M19 8v6M16 11h6"/>',
    tag: '<path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
    eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>',
    pause: '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>',
    sync: '<path d="M21 2v6h-6M3 22v-6h6M21 8a9 9 0 0 0-15-3.5L3 8M3 16a9 9 0 0 0 15 3.5l3-3.5"/>',
    out: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    star: '<path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1L12 2z"/>',
    graduation: '<path d="M22 10L12 5 2 10l10 5 10-5zM6 12v5c3 2 9 2 12 0v-5"/>',
    signal: '<path d="M2 20h.01M7 20v-4M12 20v-8M17 20V8M22 4v16"/>',
    battery: '<rect x="2" y="7" width="18" height="10" rx="2"/><path d="M22 11v2M5 10h9v4H5z"/>',
  };
  POS.icon = (n, attrs = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${attrs}>${P[n] || ''}</svg>`;

  /* Drawn product art, tinted by hue. */
  const ART = {
    watch: '<rect x="38" y="6" width="24" height="22" rx="4"/><rect x="38" y="72" width="24" height="22" rx="4"/><circle cx="50" cy="50" r="26" stroke-width="5"/><path d="M50 50V34M50 50l11 7"/><path d="M78 47h4v6h-4"/>',
    bag: '<path d="M18 38h64l-6 52H24z" stroke-width="5"/><path d="M34 38V28a16 16 0 0 1 32 0v10"/><path d="M40 58h20"/>',
    wallet: '<rect x="14" y="26" width="72" height="50" rx="8" stroke-width="5"/><path d="M14 40h72M62 58h12"/>',
    ring: '<ellipse cx="50" cy="56" rx="32" ry="24" stroke-width="5"/><ellipse cx="50" cy="56" rx="22" ry="14"/><path d="M36 30h28l-6 10H42z"/>',
    strap: '<path d="M36 6h28v34H36zM36 60h28v34H36z" stroke-width="5"/><path d="M42 74h16M42 82h16M50 40v20"/>',
    pen: '<path d="M70 14l16 16-46 46H24V60z" stroke-width="5"/><path d="M60 24l16 16M20 88h60"/>',
    card: '<rect x="12" y="24" width="76" height="52" rx="8" stroke-width="5"/><path d="M12 40h76M24 62h20"/><path d="M64 56l6 6 10-12"/>',
  };
  POS.art = (p, cls = '') => `<div class="art ${cls}" style="--h:${p.hue}"><svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ART[p.art]}</svg></div>`;

  /* ---------- Formatting ---------- */
  POS.esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  POS.store = () => D.stores[S.storeCode];
  POS.dec = () => (POS.store().currency === 'JPY' ? 0 : 2);
  POS.round = (v) => { const f = 10 ** POS.dec(); return Math.round(v * f) / f; };
  POS.money = (v) => new Intl.NumberFormat(POS.store().locale, { style: 'currency', currency: POS.store().currency, minimumFractionDigits: POS.dec(), maximumFractionDigits: POS.dec() }).format(v);
  POS.product = (sku) => D.products.find((p) => p.sku === sku);
  POS.price = (p) => p.price[{ USD: 0, EUR: 1, JPY: 2 }[POS.store().currency]];
  POS.customer = (id) => D.customers.find((c) => c.id === id);
  POS.initials = (n) => n.split(' ').map((x) => x[0]).join('').slice(0, 2);
  POS.switch = (id, on, label, act) => `<label class="switch"><input type="checkbox" id="${id}" ${on ? 'checked' : ''} aria-label="${POS.esc(label)}" ${act ? `data-change="${act}"` : ''}><span></span></label>`;

  /* ---------- State ---------- */
  const newCart = () => ({ lines: [], customer: null, payments: [], basketDisc: 0, salesperson: null, number: null });
  const S = (POS.S = {
    storeCode: 'US-NYC-001', device: 'phone', user: null, lockUser: '1182', pin: '',
    stack: [{ v: 'home' }], cart: newCart(), parked: JSON.parse(JSON.stringify(D.parked)),
    offline: false, queued: 0, training: false, sheet: null, toast: null,
    cat: 'All', q: '', custQ: '', seq: 4120, myDay: { sales: 3840, txns: 9, units: 13 }, last: null,
    drawer: { paidIn: 0, paidOut: 0, cashSales: 412 }, dayOpen: true, orders: JSON.parse(JSON.stringify(D.orders)),
  });
  POS.newCart = newCart;

  /* ---------- Cart maths ---------- */
  let key = 0;
  POS.addLine = (sku, variant, opts = {}) => {
    const p = POS.product(sku);
    const ex = S.cart.lines.find((l) => l.sku === sku && l.variant === variant && !l.ret && !l.ship && !opts.ship && !p.service && !p.gift && !opts.ret);
    if (ex) ex.qty += 1;
    else S.cart.lines.push({ key: ++key, sku, variant: variant ?? (p.variants[0] || ''), qty: opts.ret ? -1 : 1, price: opts.price ?? POS.price(p), disc: 0, discReason: '', note: opts.note || '', ship: !!opts.ship, ret: !!opts.ret, serial: '' });
  };
  POS.totals = (cart = S.cart) => {
    const st = POS.store();
    const lines = cart.lines.map((l) => ({ ...l, gross: l.price * l.qty, manual: POS.round((l.price * Math.abs(l.qty) * l.disc) / 100) * Math.sign(l.qty), promo: 0, promoName: '' }));
    // Gift with purchase: a strap is free with any watch.
    const hasWatch = lines.some((l) => !l.ret && l.qty > 0 && POS.product(l.sku).cat === 'Watches');
    const strap = lines.find((l) => !l.ret && l.qty > 0 && l.sku === 'ATL-A-90012');
    if (hasWatch && strap) { strap.promo = strap.price; strap.promoName = 'Free strap with any watch'; }
    const sub = lines.reduce((a, l) => a + l.gross, 0);
    const lineDisc = lines.reduce((a, l) => a + l.manual + l.promo, 0);
    let basketPromo = 0, basketPromoName = '';
    if (st.currency === 'JPY' && sub - lineDisc >= 50000) { basketPromo = 5000; basketPromoName = 'Spend ¥50,000 save ¥5,000'; }
    const basketManual = POS.round(((sub - lineDisc - basketPromo) * (cart.basketDisc || 0)) / 100);
    const net = POS.round(sub - lineDisc - basketPromo - basketManual);
    let tax, total;
    if (st.taxMode === 'exclusive') { tax = POS.round(net * st.taxRate); total = POS.round(net + tax); }
    else { total = net; tax = POS.round(net - net / (1 + st.taxRate)); }
    const paid = cart.payments.reduce((a, p) => a + p.amount, 0);
    return { lines, sub, lineDisc, basketPromo, basketPromoName, basketManual, discounts: lineDisc + basketPromo + basketManual, net, tax, total, paid: POS.round(paid), remaining: POS.round(total - paid), units: lines.reduce((a, l) => a + l.qty, 0) };
  };

  /* ---------- Navigation ---------- */
  POS.V = {};      // views
  POS.SH = {};     // sheets
  POS.ACT = {};    // actions
  POS.cur = () => S.stack[S.stack.length - 1];
  POS.go = (v, p = {}) => { S.stack.push({ v, ...p }); POS.render(); };
  POS.back = () => { if (S.stack.length > 1) S.stack.pop(); POS.render(); };
  POS.tab = (v) => { S.stack = [{ v }]; S.sheet = null; POS.render(); };
  POS.sheet = (type, p = {}) => { S.sheet = { type, ...p }; POS.render(); };
  POS.closeSheet = () => { S.sheet = null; POS.pendingApproval = null; POS.render(); };
  let toastT;
  POS.toast = (m) => { S.toast = m; POS.render(); clearTimeout(toastT); toastT = setTimeout(() => { S.toast = null; POS.render(); }, 2400); };

  const TABS = [['home', 'Home', 'home'], ['sell', 'Sell', 'bag'], ['products', 'Products', 'search'], ['customers', 'Customers', 'users'], ['more', 'More', 'grid']];
  const ROOT_OF = { home: 'home', sell: 'sell', products: 'products', product: 'products', customers: 'customers', customer: 'customers', more: 'more' };

  function tabbar() {
    const root = ROOT_OF[S.stack[0].v] || 'more';
    const count = S.cart.lines.reduce((a, l) => a + Math.abs(l.qty), 0);
    return `<nav class="tabbar" aria-label="Main">${TABS.map(([v, l, ic]) => `<button class="${root === v ? 'on' : ''}" data-act="tab" data-arg="${v}" aria-label="${l}">${POS.icon(ic)}${l}${v === 'sell' && count ? `<span class="pip">${count}</span>` : ''}</button>`).join('')}</nav>`;
  }

  POS.tabbar = tabbar;

  /* ---------- Render loop ---------- */
  const scrollMem = {};
  POS.render = () => {
    const el = document.getElementById('app');
    if (!el) return;
    const active = document.activeElement;
    const focusId = active && active.id && el.contains(active) ? active.id : null;
    const sel = focusId && 'selectionStart' in active ? [active.selectionStart, active.selectionEnd] : null;
    const cur = POS.cur();
    const oldContent = el.querySelector('.content');
    if (oldContent) scrollMem[el.dataset.view] = oldContent.scrollTop;

    let html = '';
    if (!S.user) html = POS.V.lock();
    else {
      const view = POS.V[cur.v](cur);
      const banners = (S.offline ? `<div class="banner offline">${POS.icon('off', 'width="16" height="16"')}Offline · selling continues · ${S.queued} transaction${S.queued === 1 ? '' : 's'} queued</div>` : '')
        + (S.training ? `<div class="banner training">${POS.icon('graduation', 'width="16" height="16"')}Training mode · nothing is charged, signed or posted</div>` : '');
      html = `${banners}
        <header class="hdr">${S.stack.length > 1 ? `<button class="ibtn" data-act="back" aria-label="Back">${POS.icon('back')}</button>` : ''}
          <div class="grow"><h1>${view.title}</h1>${view.sub ? `<div class="sub">${view.sub}</div>` : ''}</div>${view.right || ''}</header>
        <main class="content ${view.wide ? 'pad-wide' : ''}">${view.body}</main>
        ${view.footer === undefined ? tabbar() : view.footer}`;
    }
    if (S.sheet) {
      const sh = POS.SH[S.sheet.type](S.sheet);
      html += `<div class="scrim" data-act="closeSheet"></div><section class="sheet" role="dialog" aria-modal="true" aria-label="${POS.esc(sh.title)}"><div class="grab"></div>
        <div class="sheet-h"><h2>${sh.title}</h2>${sh.noClose ? '' : `<button class="ibtn" data-act="closeSheet" aria-label="Close">${POS.icon('x')}</button>`}</div>
        <div class="sheet-b">${sh.body}</div>${sh.footer ? `<div class="sheet-f">${sh.footer}</div>` : ''}</section>`;
    }
    if (S.toast) html += `<div class="toast" role="status">${POS.esc(S.toast)}</div>`;
    el.innerHTML = html;
    el.dataset.view = S.user ? cur.v : 'lock';
    const nc = el.querySelector('.content');
    if (nc && scrollMem[el.dataset.view] !== undefined) nc.scrollTop = scrollMem[el.dataset.view];
    if (focusId) { const f = document.getElementById(focusId); if (f) { f.focus(); if (sel && f.setSelectionRange) try { f.setSelectionRange(sel[0], sel[1]); } catch (e) { /* not a text input */ } } }
    renderSide();
  };

  /* ---------- Event delegation ---------- */
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-act]');
    if (!t || !document.getElementById('stage').contains(t)) return;
    const fn = POS.ACT[t.dataset.act];
    if (fn) { e.preventDefault(); fn(t.dataset.arg, t, e); }
  });
  document.addEventListener('input', (e) => { const fn = POS.ACT[e.target.dataset.input]; if (fn) fn(e.target.value, e.target, e); });
  document.addEventListener('change', (e) => { const fn = POS.ACT[e.target.dataset.change]; if (fn) fn(e.target.type === 'checkbox' ? e.target.checked : e.target.value, e.target, e); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && S.sheet && !POS.SH[S.sheet.type](S.sheet).noClose) POS.closeSheet();
    if (e.key === 'Enter' && e.target.dataset.enter) POS.ACT[e.target.dataset.enter]?.(e.target.value, e.target, e);
  });

  Object.assign(POS.ACT, {
    tab: (v) => POS.tab(v),
    back: () => POS.back(),
    go: (v) => POS.go(v),
    closeSheet: () => POS.closeSheet(),
    sheet: (t) => POS.sheet(t),
    toast: (m) => POS.toast(m),
  });

  /* ---------- Demo side panel ---------- */
  const JUMPS = [['Sell', () => POS.tab('sell')], ['Product detail', () => { POS.tab('products'); POS.go('product', { sku: 'ATL-W-40221' }); }], ['Customer', () => { POS.tab('customers'); POS.go('customer', { id: 'C-88213490' }); }],
    ['Checkout', () => { if (!S.cart.lines.length) { POS.addLine('ATL-W-40221'); POS.addLine('ATL-A-90012'); } POS.tab('sell'); POS.go('checkout'); }], ['Return', () => { POS.tab('home'); POS.go('returns'); }],
    ['Orders to fulfil', () => { POS.tab('home'); POS.go('orders'); }], ['Close day', () => { POS.tab('more'); POS.go('cash'); }], ['Lock screen', () => { S.user = null; S.pin = ''; POS.render(); }]];
  function renderSide() {
    const side = document.getElementById('side');
    if (!side) return;
    const st = POS.store();
    side.querySelector('#side-store').innerHTML = Object.values(D.stores).map((s) => `<button class="${s.code === S.storeCode ? 'on' : ''}" data-act="demoStore" data-arg="${s.code}">${s.country}</button>`).join('');
    side.querySelector('#side-dev').innerHTML = ['phone', 'tablet'].map((d) => `<button class="${S.device === d ? 'on' : ''}" data-act="demoDevice" data-arg="${d}">${d === 'phone' ? 'Phone' : 'Tablet'}</button>`).join('');
    side.querySelector('#side-rules').innerHTML = `<b>${st.code}</b> · ${st.name}<br>${st.currency} · ${st.taxEngine} · prices ${st.taxMode} of tax${st.fiscal ? `<br>Fiscal: ${st.fiscal}` : ''}<br>Returns within ${st.returnDays} days`;
    side.querySelector('#side-off').checked = S.offline;
    side.querySelector('#side-train').checked = S.training;
  }
  Object.assign(POS.ACT, {
    demoStore: (code) => { S.storeCode = code; S.cart = newCart(); S.sheet = null; S.stack = [{ v: 'home' }]; POS.toast(`Signed in at ${code}`); },
    demoDevice: (d) => { S.device = d; document.getElementById('frame').className = 'frame' + (d === 'tablet' ? ' tablet' : ''); POS.render(); },
    demoOffline: (on) => { S.offline = on; POS.toast(on ? 'Connection lost. Selling continues offline.' : `Back online. ${S.queued} queued transaction${S.queued === 1 ? '' : 's'} synced.`); if (!on) S.queued = 0; },
    demoTraining: (on) => { S.training = on; POS.render(); },
    jump: (i) => { if (!S.user) { S.user = D.users[0]; S.cart.salesperson = S.user.id; } JUMPS[+i][1](); },
  });

  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('side-jump').innerHTML = JUMPS.map(([l], i) => `<button data-act="jump" data-arg="${i}">${l}</button>`).join('');
    const clock = () => { const n = new Date(); const t = document.getElementById('clock'); if (t) t.textContent = n.toTimeString().slice(0, 5); };
    clock(); setInterval(clock, 30000);
    POS.render();
  });
})();
