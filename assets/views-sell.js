/* Views: sign-in, home, sell (cart), products, product detail, customers, customer profile,
   checkout and sale complete. Sheets: line edit, customer search/create, tenders, approval. */
(function () {
  const D = POS.data, S = POS.S, V = POS.V, SH = POS.SH, A = POS.ACT, I = POS.icon, E = POS.esc, M = (v) => POS.money(v);

  /* ================= Sign-in (shared device, PIN switch) ================= */
  V.lock = () => {
    const st = POS.store(), u = D.users.find((x) => x.id === S.lockUser);
    return `<div class="lock">
      <div style="text-align:center;display:grid;gap:4px"><div class="eyebrow" style="color:#8fa59d">${st.code} · ${st.device}</div><h1 style="font-size:24px">${E(st.name)}</h1><div class="small" style="color:#8fa59d">Device signed in with Okta SSO · switch user with your PIN</div></div>
      <div class="who">${D.users.map((x) => `<button class="${x.id === S.lockUser ? 'on' : ''}" data-act="lockUser" data-arg="${x.id}"><span class="avatar">${x.initials}</span><span class="small">${x.short}</span><span style="font-size:11px;color:#8fa59d">${x.role}</span></button>`).join('')}</div>
      <div style="text-align:center" class="small">Enter PIN for ${u.short} <span style="color:#8fa59d">(any 4 digits in this demo)</span></div>
      <div class="pin-dots">${[0, 1, 2, 3].map((i) => `<i class="${S.pin.length > i ? 'on' : ''}"></i>`).join('')}</div>
      <div class="keypad" style="max-width:300px;width:100%;margin:0 auto">${[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '⌫'].map((k) => (k === '' ? '<span></span>' : `<button data-act="pinKey" data-arg="${k}" aria-label="${k === '⌫' ? 'Delete' : k}">${k}</button>`)).join('')}</div>
    </div>`;
  };
  Object.assign(A, {
    lockUser: (id) => { S.lockUser = id; S.pin = ''; POS.render(); },
    pinKey: (k) => {
      if (k === '⌫') S.pin = S.pin.slice(0, -1); else if (S.pin.length < 4) S.pin += k;
      if (S.pin.length === 4) { S.user = D.users.find((x) => x.id === S.lockUser); S.pin = ''; if (!S.cart.salesperson) S.cart.salesperson = S.user.id; setTimeout(() => POS.toast(`Signed in as ${S.user.short}`), 0); }
      POS.render();
    },
    lock: () => { S.user = null; S.pin = ''; S.sheet = null; POS.render(); },
  });

  /* ================= Home ================= */
  V.home = () => {
    const st = POS.store(), u = S.user, t = POS.totals();
    const count = S.cart.lines.reduce((a, l) => a + Math.abs(l.qty), 0);
    const toPick = S.orders.filter((o) => o.status === 'To pick').length;
    const target = { USD: 6000, EUR: 5500, JPY: 900000 }[st.currency], sales = S.myDay.sales * { USD: 1, EUR: 0.92, JPY: 149 }[st.currency];
    const tile = (act, arg, ic, label, pip) => `<button class="tile" data-act="${act}" data-arg="${arg}">${I(ic)}<span>${label}</span>${pip ? `<span class="pip">${pip}</span>` : ''}</button>`;
    return {
      title: `Hi, ${u.name.split(' ')[0]}`, sub: `${st.name} · ${S.dayOpen ? 'Store open since 09:52' : 'Day closed'}`,
      right: `<button class="ibtn" data-act="lock" aria-label="Lock and switch user">${I('lock')}</button>`,
      wide: true,
      body: `
        <button class="hero-sale" data-act="tab" data-arg="sell">${I('bag')}<span class="grow"><b>${count ? 'Continue sale' : 'New sale'}</b><span class="small">${count ? `${count} item${count > 1 ? 's' : ''} · ${M(t.total)}` : 'Scan an item or search the catalogue'}</span></span>${I('chev')}</button>
        <div class="tiles">
          ${tile('go', 'returns', 'ret', 'Return or exchange')}${tile('tab', 'products', 'search', 'Find product')}${tile('tab', 'customers', 'users', 'Customers')}
          ${tile('go', 'orders', 'box', 'Orders to fulfil', toPick)}${tile('go', 'parked', 'pause', 'Parked sales', S.parked.length)}${tile('go', 'cash', 'cash', 'Cash & day')}
        </div>
        <div class="two-col" style="display:grid;gap:14px">
        <section class="card"><div class="card-h"><h2>My day</h2><span class="badge accent">${u.role}</span></div><div class="card-b">
          <div class="row"><span class="grow"><b style="font-size:22px" class="num">${M(sales)}</b> <span class="muted small">of ${M(target)} target</span></span><b class="num">${Math.round((sales / target) * 100)}%</b></div>
          <div class="meter"><i style="width:${Math.min(100, (sales / target) * 100)}%"></i></div>
          <div class="g3" style="text-align:center">${[['Sales', S.myDay.txns], ['Avg. sale', M(sales / S.myDay.txns)], ['Items / sale', (S.myDay.units / S.myDay.txns).toFixed(2)]].map(([a, b]) => `<div><div class="eyebrow">${a}</div><b class="num">${b}</b></div>`).join('')}</div>
        </div></section>
        <section class="card"><div class="card-h"><h2>Today in store</h2></div><div class="list">
          <button class="li" data-act="go" data-arg="orders"><span class="badge info">${I('box', 'width="14" height="14"')} Pickup</span><span class="grow s">Aarav Sharma's order is ready for pickup</span>${I('chev', 'width="18" height="18"')}</button>
          <div class="li"><span class="badge good">${I('tag', 'width="14" height="14"')} Promo</span><span class="grow s">Free strap with any watch, applied automatically</span></div>
          ${st.currency === 'JPY' ? `<div class="li"><span class="badge good">Promo</span><span class="grow s">Spend ¥50,000 save ¥5,000 until 20 Oct</span></div>` : ''}
          <div class="li"><span class="badge warn">${I('clock', 'width="14" height="14"')} Tonight</span><span class="grow s">New prices for 1,284 items from 00:00. Shelf labels print at close.</span></div>
        </div></section></div>`,
    };
  };

  /* ================= Products ================= */
  function filteredProducts() {
    const q = S.q.trim().toLowerCase();
    return D.products.filter((p) => (S.cat === 'All' || p.cat === S.cat) && (!q || (p.name + p.sku + p.ean + p.brand + p.cat).toLowerCase().includes(q)));
  }
  const stockLabel = (sku) => { const s = D.stock[sku][0]; return s >= 99 ? '' : s === 0 ? '<span class="st down">Not in store</span>' : s < 3 ? `<span class="st" style="color:var(--warn)">${s} left here</span>` : `<span class="st muted">${s} in store</span>`; };
  function catalog(inSell) {
    const list = filteredProducts();
    return `<div class="search"><input class="input" id="${inSell ? 'q-sell' : 'q-prod'}" value="${E(S.q)}" placeholder="Search name, SKU or scan barcode" data-input="setQ" data-enter="scanEnter" aria-label="Search products">${I('search')}<button class="scan" data-act="scanDemo" aria-label="Scan barcode">${I('scan')}</button></div>
      <div class="chips">${D.categories.map((c) => `<button class="chip ${S.cat === c ? 'on' : ''}" data-act="setCat" data-arg="${c}">${c}</button>`).join('')}</div>
      <div class="pgrid">${list.map((p) => `<button class="pcard" data-act="${inSell ? 'quickAdd' : 'openProduct'}" data-arg="${p.sku}">${POS.art(p)}<span class="n">${E(p.name)}</span><span class="row" style="justify-content:space-between"><span class="p">${M(POS.price(p))}</span>${inSell ? `<span class="badge accent" aria-label="Add">${I('plus', 'width="12" height="12"')}</span>` : ''}</span>${stockLabel(p.sku)}</button>`).join('') || '<p class="muted small">No products match. Try another search.</p>'}</div>`;
  }
  V.products = () => ({ title: 'Products', sub: `${D.products.length} items · prices for ${POS.store().code}`, body: catalog(false), wide: true });
  Object.assign(A, {
    setQ: (v) => { S.q = v; POS.render(); },
    setCat: (c) => { S.cat = c; POS.render(); },
    openProduct: (sku) => POS.go('product', { sku }),
    quickAdd: (sku) => { POS.addLine(sku); POS.toast(`${POS.product(sku).name} added`); },
    scanDemo: () => { const p = D.products[Math.floor(Math.random() * 8)]; POS.addLine(p.sku); if (POS.cur().v !== 'sell') POS.tab('sell'); POS.toast(`Scanned ${p.ean} · ${p.name}`); },
    scanEnter: (v) => {
      const q = v.trim().toLowerCase();
      const p = D.products.find((x) => x.ean === q || x.sku.toLowerCase() === q) || (filteredProducts().length === 1 ? filteredProducts()[0] : null);
      if (p) { POS.addLine(p.sku); S.q = ''; POS.toast(`${p.name} added`); if (POS.cur().v !== 'sell') POS.tab('sell'); }
    },
  });

  V.product = (c) => {
    const p = POS.product(c.sku), st = POS.store(), stock = D.stock[p.sku], near = D.nearby[st.code];
    const variant = c.variant || p.variants[0] || '';
    const none = stock[0] === 0;
    return {
      title: E(p.name), sub: `${p.brand} · ${p.cat}`, wide: true,
      body: `<div class="two-col" style="display:grid;gap:14px">
        <div style="max-width:320px;width:100%;margin:0 auto">${POS.art(p)}</div>
        <div class="stack">
          <div class="row" style="justify-content:space-between"><b style="font-size:26px" class="num">${M(POS.price(p))}</b>${p.cat === 'Watches' ? '<span class="badge good">Free strap with any watch</span>' : ''}</div>
          <div class="small muted">${E(p.attrs)}<br><span class="mono">${p.sku} · EAN ${p.ean}</span></div>
          ${p.variants.length ? `<div class="field"><label>Variant</label><div class="chips" style="flex-wrap:wrap">${p.variants.map((v) => `<button class="chip ${v === variant ? 'on' : ''}" data-act="pickVariant" data-arg="${E(v)}">${E(v)}</button>`).join('')}</div></div>` : ''}
          ${p.service || p.gift ? '' : `<section class="card"><div class="card-h"><h2>Availability</h2><span class="small muted">Updated 1 min ago</span></div><div class="list">
            ${[['This store', stock[0], 'store'], [near[0], stock[1], 'store'], [near[1], stock[2], 'store'], ['Online warehouse', stock[3], 'truck']].map(([l, n, ic]) => `<div class="li">${I(ic, 'width="20" height="20"')}<span class="grow">${l}</span><b class="num ${n ? '' : 'down'}">${n ? n + ' available' : 'None'}</b></div>`).join('')}
          </div></section>`}
          ${S.offline ? '<div class="callout warn">' + I('off') + '<span>Offline: showing stock from the last sync (09:40). Ship-to-customer orders are queued and sent when back online.</span></div>' : ''}
        </div></div>`,
      footer: `<div class="actionbar"><div class="g2">
        <button class="btn big ${none ? 'primary' : ''}" data-act="shipItem" data-arg="${p.sku}" ${p.service || p.gift ? 'disabled' : ''}>${I('truck')}Ship to customer</button>
        <button class="btn big ${none ? '' : 'primary'}" data-act="addItem" data-arg="${p.sku}" ${none ? 'disabled' : ''}>${I('plus')}Add to sale</button></div></div>`,
    };
  };
  Object.assign(A, {
    pickVariant: (v) => { POS.cur().variant = v; POS.render(); },
    addItem: (sku) => { POS.addLine(sku, POS.cur().variant); POS.toast('Added to sale'); POS.tab('sell'); },
    shipItem: (sku) => { POS.addLine(sku, POS.cur().variant, { ship: true }); POS.toast('Added as ship-to-customer (endless aisle)'); POS.tab('sell'); },
  });

  /* ================= Sell (cart) ================= */
  function lineHTML(l) {
    const p = POS.product(l.sku);
    const disc = l.manual + l.promo;
    return `<div class="cart-line ${l.ret ? 'ret' : ''}">${POS.art(p, 'sm')}
      <div style="min-width:0"><div class="t">${E(p.name)}</div><div class="s">${E(l.variant)}${l.variant ? ' · ' : ''}<span class="mono">${p.sku}</span></div>
        ${l.ret ? '<span class="badge warn" style="margin-top:4px">Return</span>' : ''}${l.ship ? '<span class="badge info" style="margin-top:4px">' + I('truck', 'width="13" height="13"') + 'Ship to customer</span>' : ''}
        ${l.note ? `<div class="s">✎ ${E(l.note)}</div>` : ''}
        ${l.promo ? `<div class="promo">${E(l.promoName)}</div>` : ''}${l.manual ? `<div class="promo" style="color:var(--amber)">${l.disc}% off · ${E(l.discReason)}</div>` : ''}
</div>
      <div class="price">${disc ? `<div class="was">${M(l.gross)}</div>` : ''}<div class="${l.gross < 0 ? 'down' : ''}">${M(l.gross - disc)}</div></div>
        <div class="line-acts" style="grid-column:2/-1;margin-top:0">${l.ret ? '' : `<span class="stepper"><button data-act="qty" data-arg="${l.key}|-1" aria-label="Decrease">−</button><span>${l.qty}</span><button data-act="qty" data-arg="${l.key}|1" aria-label="Increase">+</button></span>
          <button class="btn sm icon" data-act="lineDisc" data-arg="${l.key}" aria-label="Discount" title="Discount">${I('percent')}</button><button class="btn sm icon" data-act="lineNote" data-arg="${l.key}" aria-label="${p.sku === 'ATL-S-ENGRV' ? 'Engraving text' : 'Note'}" title="${p.sku === 'ATL-S-ENGRV' ? 'Engraving text' : 'Note'}">${I('pen')}</button>`}
          <button class="btn sm icon ghost" data-act="removeLine" data-arg="${l.key}" aria-label="Remove ${E(p.name)}" title="Remove">${I('x')}</button></div></div>`;
  }
  function custChip() {
    const c = S.cart.customer && POS.customer(S.cart.customer);
    return c ? `<button class="cust-chip set" data-act="openCustomer" data-arg="${c.id}"><span class="avatar">${POS.initials(c.name)}</span><span class="grow"><b>${E(c.name)}</b> <span class="tier">${c.tier}</span><div class="small muted">${c.visits} visits · prefers ${E(c.prefs.toLowerCase())}</div></span><span class="btn sm ghost" data-act="detachCustomer" aria-label="Remove customer">${I('x')}</span></button>`
      : `<button class="cust-chip" data-act="sheet" data-arg="findCustomer"><span class="avatar">${I('userplus', 'width="20" height="20"')}</span><span class="grow"><b>Add customer</b><div class="small muted">Look up by name, email, phone or loyalty QR</div></span></button>`;
  }
  V.sell = () => {
    const t = POS.totals(), st = POS.store(), sp = D.users.find((u) => u.id === S.cart.salesperson) || S.user;
    const empty = !t.lines.length;
    return {
      title: 'Sale', sub: `${st.code}-${st.device.slice(-2)}-${String(S.seq).padStart(6, '0')} · sold by ${sp.short}`, wide: true,
      right: `<button class="ibtn" data-act="park" aria-label="Park sale" ${empty ? 'disabled' : ''}>${I('pause')}</button><button class="ibtn" data-act="sheet" data-arg="saleMenu" aria-label="Sale options">${I('grid')}</button>`,
      body: `<div class="sellwrap"><div class="sell-catalog">${catalog(true)}</div>
        <div class="stack">
          <div class="search"><input class="input" id="q-scan" placeholder="Scan or type barcode / SKU" data-enter="scanEnter" aria-label="Scan or type barcode">${I('scan')}<button class="scan" data-act="scanDemo" aria-label="Scan with camera">${I('scan')}</button></div>
          ${custChip()}
          <section class="card">${empty ? `<div class="card-b" style="padding:28px 16px;text-align:center;gap:6px">${I('bag', 'width="34" height="34" style="margin:0 auto;color:var(--fg-3)"')}<b>No items yet</b><span class="small muted">Scan a barcode, or add items from Products.</span><button class="btn" data-act="tab" data-arg="products" style="justify-self:center;margin-top:6px">${I('search')}Browse products</button></div>` : `<div class="list">${t.lines.map(lineHTML).join('')}</div>`}</section>
          ${empty ? '' : `<section class="card"><div class="card-b" style="padding-top:14px"><div class="totals">
            <div class="r"><span>Subtotal · ${t.units} item${Math.abs(t.units) === 1 ? '' : 's'}</span><span>${M(t.sub)}</span></div>
            ${t.lineDisc ? `<div class="r promo"><span>Item discounts</span><span>−${M(t.lineDisc)}</span></div>` : ''}
            ${t.basketPromo ? `<div class="r promo"><span>${t.basketPromoName}</span><span>−${M(t.basketPromo)}</span></div>` : ''}
            ${t.basketManual ? `<div class="r" style="color:var(--amber)"><span>Sale discount ${S.cart.basketDisc}%</span><span>−${M(t.basketManual)}</span></div>` : ''}
            <div class="r muted"><span>${st.taxMode === 'inclusive' ? 'Includes ' + st.taxLabel : st.taxLabel + (S.offline ? ' · cached rate' : ' · Avalara')}</span><span>${M(t.tax)}</span></div>
            <div class="r grand"><span>${t.total < 0 ? 'Refund due' : 'Total'}</span><span class="num">${M(Math.abs(t.total))}</span></div></div></div></section>`}
        </div></div>`,
      footer: `<div class="actionbar"><button class="btn big primary block" data-act="checkout" ${empty ? 'disabled' : ''}>${empty ? 'Add items to charge' : t.total < 0 ? `Refund ${M(-t.total)}` : `Charge ${M(t.total)}`}</button></div>${POS.tabbar()}`,
    };
  };
  const findLine = (k) => S.cart.lines.find((l) => l.key === +k);
  Object.assign(A, {
    qty: (arg) => { const [k, d] = arg.split('|'); const l = findLine(k); l.qty += +d; if (l.qty <= 0) S.cart.lines = S.cart.lines.filter((x) => x !== l); POS.render(); },
    removeLine: (k) => { S.cart.lines = S.cart.lines.filter((l) => l.key !== +k); POS.render(); },
    lineDisc: (k) => POS.sheet('discount', { lineKey: +k, pct: 10, reason: 'Loyalty goodwill' }),
    lineNote: (k) => POS.sheet('note', { lineKey: +k }),
    checkout: () => POS.go('checkout'),
    openCustomer: (id) => POS.go('customer', { id }),
    detachCustomer: (a, el, e) => { e.stopPropagation(); S.cart.customer = null; POS.render(); },
    park: () => {
      if (!S.cart.lines.length) return;
      const c = S.cart.customer && POS.customer(S.cart.customer);
      S.parked.unshift({ id: 'P-0' + (92 + S.parked.length), by: S.user.short, at: new Date().toTimeString().slice(0, 5), customer: c ? c.name : 'Guest', lines: S.cart.lines.map((l) => ({ sku: l.sku, variant: l.variant, qty: l.qty, note: l.note })) });
      S.cart = POS.newCart(); S.cart.salesperson = S.user.id; POS.toast('Sale parked. Any device in this store can resume it for 24 hours.');
    },
  });

  /* Sale menu sheet */
  SH.saleMenu = () => ({
    title: 'Sale options',
    body: `<div class="card"><div class="list">
      <button class="li" data-act="basketDisc">${I('percent')}<span class="grow"><span class="t">Discount whole sale</span><div class="s">Your limit: ${S.user.discountLimit}% without approval</div></span></button>
      <button class="li" data-act="pickSalesperson">${I('users')}<span class="grow"><span class="t">Salesperson / split commission</span><div class="s">Currently ${(D.users.find((u) => u.id === S.cart.salesperson) || S.user).short}</div></span></button>
      <button class="li" data-act="addGiftCard">${I('gift')}<span class="grow"><span class="t">Sell a gift card</span><div class="s">Activated through the payment terminal</div></span></button>
      <button class="li" data-act="taxExempt">${I('credit')}<span class="grow"><span class="t">Tax exemption</span><div class="s">Certificate number, photo and manager approval</div></span></button>
      <button class="li" data-act="voidSale">${I('x', 'style="color:var(--bad)"')}<span class="grow"><span class="t" style="color:var(--bad)">Void sale</span><div class="s">Clears all items. Recorded in the audit log.</div></span></button>
    </div></div>`,
  });
  Object.assign(A, {
    basketDisc: () => POS.sheet('discount', { lineKey: null, pct: 5, reason: 'Loyalty goodwill' }),
    pickSalesperson: () => { const i = D.users.findIndex((u) => u.id === S.cart.salesperson); S.cart.salesperson = D.users[(i + 1) % D.users.length].id; S.sheet = null; POS.toast('Salesperson: ' + D.users.find((u) => u.id === S.cart.salesperson).short); },
    addGiftCard: () => { POS.addLine('ATL-GC'); S.sheet = null; POS.toast('Gift card added. It is activated when the sale completes.'); },
    taxExempt: () => { S.sheet = null; POS.sheet('approval', { reason: 'Tax exemption needs a manager.', then: 'toast:Tax exemption recorded with certificate EX-2291' }); },
    voidSale: () => { S.cart = POS.newCart(); S.cart.salesperson = S.user.id; S.sheet = null; POS.toast('Sale voided'); },
  });

  /* Discount sheet with approval when over the user's limit */
  SH.discount = (sh) => {
    const l = sh.lineKey ? findLine(sh.lineKey) : null;
    const over = sh.pct > S.user.discountLimit;
    return {
      title: l ? 'Item discount' : 'Sale discount',
      body: `${l ? `<div class="row">${POS.art(POS.product(l.sku), 'sm')}<div class="grow"><b>${E(POS.product(l.sku).name)}</b><div class="small muted">${M(l.price)} × ${l.qty}</div></div></div>` : ''}
        <div class="field"><label>Percentage off</label><div class="chips" style="flex-wrap:wrap">${[5, 10, 15, 20, 30].map((p) => `<button class="chip ${sh.pct === p ? 'on' : ''}" data-act="discPct" data-arg="${p}">${p}%</button>`).join('')}</div></div>
        <div class="field"><label for="disc-reason">Reason</label><select class="input" id="disc-reason" data-change="discReason">${['Loyalty goodwill', 'Damaged box', 'Price match', 'Employee purchase', 'Display item'].map((r) => `<option ${r === sh.reason ? 'selected' : ''}>${r}</option>`).join('')}</select></div>
        ${over ? `<div class="callout warn">${I('lock')}<span><b>Manager approval needed.</b> ${sh.pct}% is above your ${S.user.discountLimit}% limit as ${S.user.role}.</span></div>` : `<div class="callout good">${I('check')}<span>Within your ${S.user.discountLimit}% limit. No approval needed.</span></div>`}`,
      footer: `<button class="btn big primary" data-act="applyDisc">${over ? 'Request approval' : 'Apply discount'}</button>`,
    };
  };
  Object.assign(A, {
    discPct: (p) => { S.sheet.pct = +p; POS.render(); },
    discReason: (v) => { S.sheet.reason = v; },
    applyDisc: () => {
      const { lineKey, pct, reason } = S.sheet;
      const apply = () => { if (lineKey) { const l = findLine(lineKey); l.disc = pct; l.discReason = reason; } else S.cart.basketDisc = pct; };
      if (pct > S.user.discountLimit) { POS.pendingApproval = () => { apply(); POS.toast(`${pct}% discount approved by Sarah L.`); }; POS.sheet('approval', { reason: `${pct}% discount (${reason}) is above ${S.user.short}'s ${S.user.discountLimit}% limit.` }); }
      else { apply(); S.sheet = null; POS.toast(`${pct}% discount applied`); }
    },
  });

  /* Manager approval: PIN on this device, or a push to the manager's phone */
  SH.approval = (sh) => ({
    title: 'Manager approval',
    body: `<div class="callout warn">${I('lock')}<span>${E(sh.reason)}</span></div>
      <div class="chips"><button class="chip ${sh.mode !== 'remote' ? 'on' : ''}" data-act="apprMode" data-arg="pin">PIN on this device</button><button class="chip ${sh.mode === 'remote' ? 'on' : ''}" data-act="apprMode" data-arg="remote">Ask remotely</button></div>
      ${sh.mode === 'remote' ? (sh.waiting ? `<div class="terminal"><div class="pulse">${I('sms')}</div><b>Waiting for Sarah L.</b><span class="small muted">Request sent to her phone. It is bound to this sale and this action only.</span></div>` : `<div class="card"><div class="list">${['Sarah Lindqvist · Store Manager · on floor', 'Chloé Martin · District Manager'].map((m, i) => `<button class="li" data-act="apprRemote" data-arg="${i}"><span class="avatar">${POS.initials(m)}</span><span class="grow t">${m}</span>${I('chev', 'width="18" height="18"')}</button>`).join('')}</div></div>`)
        : `<div class="small muted" style="text-align:center">Sarah Lindqvist · Store Manager</div><div class="pin-dots">${[0, 1, 2, 3].map((i) => `<i class="${(sh.pin || '').length > i ? 'on' : ''}"></i>`).join('')}</div>
        <div class="keypad">${[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '⌫'].map((k) => (k === '' ? '<span></span>' : `<button data-act="apprKey" data-arg="${k}">${k}</button>`)).join('')}</div>`}`,
  });
  function approved() {
    const then = S.sheet.then;
    S.sheet = null;
    if (POS.pendingApproval) { const f = POS.pendingApproval; POS.pendingApproval = null; f(); }
    else if (then && then.startsWith('toast:')) POS.toast(then.slice(6));
    else POS.render();
  }
  Object.assign(A, {
    apprMode: (m) => { S.sheet.mode = m; S.sheet.pin = ''; POS.render(); },
    apprKey: (k) => { const sh = S.sheet; sh.pin = k === '⌫' ? (sh.pin || '').slice(0, -1) : ((sh.pin || '') + k).slice(0, 4); if (sh.pin.length === 4) approved(); else POS.render(); },
    apprRemote: () => { S.sheet.waiting = true; POS.render(); setTimeout(() => { if (S.sheet && S.sheet.type === 'approval') approved(); }, 1800); },
  });

  /* Note / engraving sheet */
  SH.note = (sh) => {
    const l = findLine(sh.lineKey), eng = l.sku === 'ATL-S-ENGRV';
    return {
      title: eng ? 'Engraving text' : 'Item note',
      body: `<div class="field"><label for="note-text">${eng ? 'Text to engrave (max 20 characters)' : 'Note (printed on receipt if selected)'}</label><input class="input" id="note-text" maxlength="${eng ? 20 : 120}" value="${E(l.note)}" placeholder="${eng ? 'For A., 10 years' : 'Gift wrap, repair details…'}"></div>
        <label class="row">${POS.switch('note-print', true, 'Print on receipt')}<span>Print on receipt</span></label>`,
      footer: `<button class="btn big primary" data-act="saveNote">Save</button>`,
    };
  };
  A.saveNote = () => { findLine(S.sheet.lineKey).note = document.getElementById('note-text').value; S.sheet = null; POS.render(); };

  /* ================= Customers ================= */
  function custResults() {
    const q = S.custQ.trim().toLowerCase();
    return D.customers.filter((c) => !q || (c.name + c.email + c.phone + c.id).toLowerCase().includes(q));
  }
  const custRow = (c, act) => `<button class="li" data-act="${act}" data-arg="${c.id}"><span class="avatar">${POS.initials(c.name)}</span><span class="grow"><span class="t">${E(c.name)}</span> <span class="tier">${c.tier}</span><div class="s">${c.email.replace(/^(.).*@(.).*$/, '$1•••@$2•••.com')} · ${c.phone.slice(0, -4).replace(/\d/g, '•')}${c.phone.slice(-4)}</div></span>${I('chev', 'width="18" height="18"')}</button>`;
  V.customers = () => ({
    title: 'Customers', sub: S.offline ? 'Offline · searching customers cached on this device' : 'Search the customer database',
    right: `<button class="ibtn" data-act="sheet" data-arg="newCustomer" aria-label="New customer">${I('userplus')}</button>`,
    body: `<div class="search"><input class="input" id="q-cust" value="${E(S.custQ)}" placeholder="Name, email, phone or loyalty ID" data-input="setCustQ" aria-label="Search customers">${I('search')}<button class="scan" data-act="toast" data-arg="Loyalty QR scanned: Olivia Bennett" aria-label="Scan loyalty QR">${I('qr')}</button></div>
      <section class="card"><div class="list">${custResults().map((c) => custRow(c, 'openCustomer')).join('') || '<div class="li s">No match. Create a new customer instead.</div>'}</div></section>
      <button class="btn block" data-act="sheet" data-arg="newCustomer">${I('userplus')}New customer</button>`,
  });
  A.setCustQ = (v) => { S.custQ = v; POS.render(); };

  SH.findCustomer = () => ({
    title: 'Add customer to sale',
    body: `<div class="search"><input class="input" id="q-cust2" value="${E(S.custQ)}" placeholder="Name, email, phone or loyalty ID" data-input="setCustQ" aria-label="Search customers">${I('search')}<button class="scan" data-act="attachCustomer" data-arg="C-88213490" aria-label="Scan loyalty QR">${I('qr')}</button></div>
      <section class="card"><div class="list">${custResults().map((c) => custRow(c, 'attachCustomer')).join('')}</div></section>`,
    footer: `<button class="btn" data-act="sheet" data-arg="newCustomer">${I('userplus')}Create new customer</button>`,
  });
  A.attachCustomer = (id) => { S.cart.customer = id; S.sheet = null; POS.toast(POS.customer(id).name + ' added to sale'); };

  SH.newCustomer = () => {
    const st = POS.store(), eu = st.region === 'EMEA';
    return {
      title: 'New customer',
      body: `<div class="g2"><div class="field"><label for="nc-first">First name *</label><input class="input" id="nc-first" value="Emma"></div><div class="field"><label for="nc-last">Last name *</label><input class="input" id="nc-last" value="Novak"></div></div>
        <div class="field"><label for="nc-email">Email *</label><input class="input" id="nc-email" type="email" value="emma.novak@example.com"></div>
        <div class="field"><label for="nc-phone">Mobile</label><input class="input" id="nc-phone" value="${{ US: '+1 ', DE: '+49 ', JP: '+81 ' }[st.country]}"></div>
        ${eu ? '' : `<div class="field"><label for="nc-dob">Birthday (optional)</label><input class="input" id="nc-dob" placeholder="MM-DD"></div>`}
        <div class="card"><div class="card-b" style="padding-top:12px">
          <label class="row">${POS.switch('nc-c1', false, 'Marketing email')}<span class="grow small">Send me news and offers by email</span></label>
          <label class="row">${POS.switch('nc-c2', false, 'Marketing SMS')}<span class="grow small">Send me offers by text message</span></label>
          <div class="small muted">Consent text v4 (${st.locale}) is stored with time, store and associate. Fields shown follow ${st.country} rules${eu ? ': birthday and gender are not collected in the EU' : ''}.</div></div></div>
        <div class="callout">${I('check')}<span>No duplicate found for this email or phone.</span></div>`,
      footer: `<button class="btn big primary" data-act="createCustomer">Create and add to sale</button>`,
    };
  };
  A.createCustomer = () => {
    const c = { id: 'C-' + (S.offline ? 'TEMP-0012' : '90011873'), name: `${document.getElementById('nc-first').value} ${document.getElementById('nc-last').value}`, tier: 'Member', email: document.getElementById('nc-email').value, phone: '+1 212 555 0199', since: '2026', ltv: 0, visits: 0, prefs: '—', wrist: '—', receipt: 'Email', credit: 0, consent: { email: document.getElementById('nc-c1').checked, sms: document.getElementById('nc-c2').checked }, history: [], wishlist: [] };
    D.customers.unshift(c); S.cart.customer = c.id; S.sheet = null;
    POS.toast(S.offline ? 'Customer saved with a temporary ID. It will be matched when back online.' : 'Customer created and added to sale');
  };

  V.customer = (cur) => {
    const c = POS.customer(cur.id);
    return {
      title: E(c.name), sub: `${c.tier} · customer since ${c.since}`, wide: true,
      body: `<div class="two-col" style="display:grid;gap:14px"><div class="stack">
        <section class="card"><div class="card-b" style="padding-top:14px">
          <div class="row"><span class="avatar lg">${POS.initials(c.name)}</span><div class="grow"><b style="font-size:18px">${E(c.name)}</b> <span class="tier">${c.tier}</span><div class="small muted mono">${c.id}</div></div></div>
          <div class="g3" style="text-align:center">${[['Spent', M(c.ltv * { USD: 1, EUR: 0.92, JPY: 149 }[POS.store().currency])], ['Visits', c.visits], ['Store credit', M(c.credit)]].map(([a, b]) => `<div><div class="eyebrow">${a}</div><b class="num">${b}</b></div>`).join('')}</div>
          <dl class="kv"><dt>Email</dt><dd>${cur.reveal ? E(c.email) : c.email.replace(/^(.).*@(.).*$/, '$1•••@$2•••.com')}</dd><dt>Mobile</dt><dd>${cur.reveal ? E(c.phone) : '•••• ' + c.phone.slice(-4)}</dd><dt>Receipts by</dt><dd>${c.receipt}</dd><dt>Marketing</dt><dd>${c.consent.email ? 'Email ✓' : 'Email ✗'} · ${c.consent.sms ? 'SMS ✓' : 'SMS ✗'}</dd></dl>
          ${cur.reveal ? '<div class="small muted">Contact details revealed · logged to audit</div>' : `<button class="btn sm" data-act="revealCust" style="justify-self:start">${I('eye')}Show contact details</button>`}
        </div></section>
        <section class="card"><div class="card-h"><h2>Preferences</h2></div><div class="card-b"><dl class="kv"><dt>Likes</dt><dd>${E(c.prefs)}</dd><dt>Wrist size</dt><dd>${c.wrist}</dd></dl></div></section></div>
        <div class="stack">
        ${c.wishlist.length ? `<section class="card"><div class="card-h"><h2>Wishlist</h2></div><div class="list">${c.wishlist.map((s) => { const p = POS.product(s); return `<div class="li">${POS.art(p, 'sm')}<span class="grow"><span class="t">${E(p.name)}</span><div class="s">${M(POS.price(p))} · ${D.stock[s][0]} in store</div></span><button class="btn sm" data-act="quickAdd" data-arg="${s}">Add</button></div>`; }).join('')}</div></section>` : ''}
        <section class="card"><div class="card-h"><h2>Purchase history</h2></div><div class="list">${c.history.map(([d, n, v]) => `<div class="li"><span class="grow"><span class="t">${E(n)}</span><div class="s">${d}</div></span><b class="num">${M(v * { USD: 1, EUR: 0.96, JPY: 150 }[POS.store().currency])}</b></div>`).join('') || '<div class="li s">No purchases yet.</div>'}</div></section>
        <section class="card"><div class="card-h"><h2>Recommended</h2><span class="small muted">Based on purchases</span></div><div class="list">${['ATL-A-90012', 'ATL-J-20077'].map((s) => { const p = POS.product(s); return `<div class="li">${POS.art(p, 'sm')}<span class="grow"><span class="t">${E(p.name)}</span><div class="s">${M(POS.price(p))}</div></span><button class="btn sm" data-act="quickAdd" data-arg="${s}">Add</button></div>`; }).join('')}</div></section></div></div>`,
      footer: `<div class="actionbar"><button class="btn big primary block" data-act="attachFromProfile" data-arg="${c.id}" ${S.cart.customer === c.id ? 'disabled' : ''}>${S.cart.customer === c.id ? 'Added to current sale' : 'Add to current sale'}</button></div>`,
    };
  };
  Object.assign(A, {
    revealCust: () => { POS.cur().reveal = true; POS.toast('Contact details shown. This view is logged.'); },
    attachFromProfile: (id) => { S.cart.customer = id; POS.toast(POS.customer(id).name + ' added to sale'); POS.tab('sell'); },
  });

  /* ================= Checkout ================= */
  const TENDER_ICON = { Card: 'card', Cash: 'cash', 'Gift card': 'gift', 'Store credit': 'credit', 'Pay by link': 'link', Voucher: 'tag', PayPay: 'qr' };
  const TENDER_SUB = { Card: 'Tap, insert or wallet on terminal', Cash: 'Change given in cash', 'Gift card': 'Scan or type card number', 'Store credit': 'From customer balance', 'Pay by link': 'Send link by SMS or email', Voucher: 'Paper voucher code', PayPay: 'Customer scans QR' };
  V.checkout = () => {
    const t = POS.totals(), st = POS.store(), refund = t.total < 0;
    const tenders = refund ? ['Card', 'Cash', 'Store credit'] : st.tenders;
    return {
      title: refund ? 'Refund' : 'Payment', sub: `${t.units} item${Math.abs(t.units) === 1 ? '' : 's'} · total ${M(Math.abs(t.total))}`, wide: true,
      body: `<div class="due"><div class="lbl">${refund ? 'Refund due' : t.payments?.length || S.cart.payments.length ? 'Remaining' : 'Amount due'}</div><div class="amt">${M(Math.abs(t.remaining))}</div>
          ${S.cart.payments.length ? `<div class="small muted">Paid ${M(t.paid)} of ${M(t.total)}</div>` : ''}</div>
        ${S.cart.payments.length ? `<section class="card"><div class="list">${S.cart.payments.map((p, i) => `<div class="paid-line">${I(TENDER_ICON[p.type] || 'card', 'width="18" height="18"')}<span class="grow">${E(p.label)}<div class="small muted mono">${E(p.ref || '')}</div></span><b class="num">${M(p.amount)}</b>${p.type === 'Cash' || p.type === 'Voucher' ? `<button class="btn sm ghost" data-act="removePay" data-arg="${i}" aria-label="Remove payment">${I('x')}</button>` : ''}</div>`).join('')}</div></section>` : ''}
        <div class="eyebrow">${refund ? 'Refund to' : S.cart.payments.length ? 'Pay the rest with' : 'Choose payment'}</div>
        <div class="tender-grid">${tenders.map((tn) => {
          const dis = (tn === 'Pay by link' && S.offline) || (tn === 'Store credit' && !refund && !(S.cart.customer && POS.customer(S.cart.customer).credit));
          return `<button class="tender" data-act="tender" data-arg="${tn}" ${dis ? 'disabled style="opacity:.45"' : ''}>${I(TENDER_ICON[tn])}<span>${refund && tn === 'Card' ? 'Original card' : tn}</span><span class="s">${refund && tn === 'Card' ? 'Referenced refund, no card needed' : dis && tn === 'Pay by link' ? 'Unavailable offline' : dis ? 'Add a customer with credit' : TENDER_SUB[tn]}</span></button>`;
        }).join('')}</div>
        ${S.offline ? `<div class="callout warn">${I('off')}<span>Offline: cards are approved by the terminal in store-and-forward mode up to ${M(st.currency === 'JPY' ? 100000 : 1000)}. ${st.fiscal && st.country === 'DE' ? 'TSE signing is retried on reconnect.' : ''}</span></div>` : ''}`,
      footer: `<div class="actionbar"><button class="btn block" data-act="back">Back to sale</button></div>`,
    };
  };
  Object.assign(A, {
    removePay: (i) => { S.cart.payments.splice(+i, 1); POS.render(); },
    tender: (tn) => {
      const t = POS.totals(), refund = t.total < 0;
      if (refund) {
        S.cart.payments.push({ type: tn, label: tn === 'Card' ? 'Refund to VISA •••• 4417' : tn === 'Cash' ? 'Cash refund' : 'Store credit issued', amount: t.remaining, ref: tn === 'Card' ? 'Referenced refund 8826 1101 4471 2209' : '' });
        return finish();
      }
      if (tn === 'Store credit') { const c = POS.customer(S.cart.customer); const amt = Math.min(c.credit, t.remaining); c.credit -= amt; S.cart.payments.push({ type: tn, label: 'Store credit · ' + c.name, amount: amt }); return POS.totals().remaining <= 0 ? finish() : POS.render(); }
      POS.sheet('pay', { tn, amount: t.remaining, cash: '', stage: 'enter' });
    },
  });

  SH.pay = (sh) => {
    const t = POS.totals(), st = POS.store();
    if (sh.tn === 'Cash') {
      const tendered = sh.cash === '' ? 0 : +sh.cash / (POS.dec() ? 100 : 1);
      const change = POS.round(tendered - t.remaining);
      return {
        title: 'Cash',
        body: `<div class="due" style="padding-top:0"><div class="lbl">Due ${M(t.remaining)} · tendered</div><div class="amt">${M(tendered)}</div><div class="${change >= 0 ? 'up' : 'muted'}" style="font-weight:650">${change >= 0 ? 'Change ' + M(change) : 'Still due ' + M(-change)}</div></div>
          <div class="chips" style="flex-wrap:wrap;justify-content:center"><button class="chip" data-act="cashQuick" data-arg="${t.remaining}">Exact</button>${st.quick.filter((q) => q >= t.remaining * 0.2).map((q) => `<button class="chip" data-act="cashQuick" data-arg="${q}">${M(q)}</button>`).join('')}</div>
          <div class="keypad">${[1, 2, 3, 4, 5, 6, 7, 8, 9, '00', 0, '⌫'].map((k) => `<button data-act="cashKey" data-arg="${k}">${k}</button>`).join('')}</div>`,
        footer: `<button class="btn big primary" data-act="cashOk" ${tendered > 0 ? '' : 'disabled'}>${change >= 0 ? `Take ${M(tendered)} · give ${M(change)}` : `Take ${M(tendered)} (partial)`}</button>`,
      };
    }
    if (sh.stage === 'wait') {
      const what = { Card: ['card', 'Ask the customer to tap, insert or use their wallet', st.terminal], 'Pay by link': ['link', 'Link sent. Waiting for the customer to pay on their phone.', 'Adyen pay-by-link · expires in 30 min'], PayPay: ['qr', 'Customer scans the QR code with PayPay', 'Dynamic QR shown on customer display'], 'Gift card': ['gift', 'Checking balance…', 'Givex'] }[sh.tn] || ['card', '', ''];
      return { title: sh.tn, noClose: true, body: `<div class="terminal"><div class="pulse">${I(what[0])}</div><b style="font-size:26px" class="num">${M(sh.amount)}</b><span>${what[1]}</span><span class="small muted">${what[2]}</span></div>`, footer: `<button class="btn" data-act="cancelPay">Cancel on terminal</button>` };
    }
    const max = t.remaining;
    return {
      title: sh.tn,
      body: `${sh.tn === 'Gift card' || sh.tn === 'Voucher' ? `<div class="field"><label for="gc-no">${sh.tn === 'Gift card' ? 'Gift card number' : 'Voucher code'}</label><input class="input mono" id="gc-no" value="${sh.tn === 'Gift card' ? '6036 2810 4471 1188' : 'XMAS-20-9KQ2'}"></div>` : ''}
        ${sh.tn === 'Pay by link' ? `<div class="field"><label for="pbl-to">Send to</label><input class="input" id="pbl-to" value="${S.cart.customer ? POS.esc(POS.customer(S.cart.customer).phone) : '+1 '}"></div>` : ''}
        <div class="field"><label for="pay-amt">Amount ${sh.tn === 'Card' ? '(change it to split across cards)' : ''}</label><input class="input num" id="pay-amt" inputmode="decimal" value="${POS.dec() ? max.toFixed(2) : max}" style="font-size:22px;font-weight:700;min-height:56px"></div>
        <div class="chips">${[['Full', max], ['Half', POS.round(max / 2)], ['Third', POS.round(max / 3)]].map(([l, v]) => `<button class="chip" data-act="payAmt" data-arg="${v}">${l} · ${M(v)}</button>`).join('')}</div>`,
      footer: `<button class="btn big primary" data-act="payGo">${{ Card: 'Send to terminal', 'Pay by link': 'Send link', PayPay: 'Show QR code', 'Gift card': 'Redeem', Voucher: 'Redeem' }[sh.tn]}</button>`,
    };
  };
  Object.assign(A, {
    cashKey: (k) => { const sh = S.sheet; sh.cash = k === '⌫' ? sh.cash.slice(0, -1) : (sh.cash + k).replace(/^0+/, '').slice(0, 9); POS.render(); },
    cashQuick: (v) => { S.sheet.cash = String(Math.round(+v * (POS.dec() ? 100 : 1))); POS.render(); },
    cashOk: () => {
      const t = POS.totals(); const tendered = +S.sheet.cash / (POS.dec() ? 100 : 1);
      const amt = Math.min(tendered, t.remaining);
      S.cart.payments.push({ type: 'Cash', label: `Cash · tendered ${M(tendered)}`, amount: POS.round(amt) });
      S.cart.change = Math.max(0, POS.round(tendered - t.remaining));
      S.drawer.cashSales += amt;
      S.sheet = null;
      if (POS.totals().remaining <= 0) finish(); else POS.render();
    },
    payAmt: (v) => { document.getElementById('pay-amt').value = POS.dec() ? (+v).toFixed(2) : v; },
    payGo: () => {
      const t = POS.totals(); let amt = Math.min(+document.getElementById('pay-amt').value || 0, t.remaining);
      const tn = S.sheet.tn;
      if (tn === 'Voucher') { amt = Math.min(20, amt); S.cart.payments.push({ type: tn, label: 'Voucher XMAS-20-9KQ2', amount: amt }); S.sheet = null; return POS.totals().remaining <= 0 ? finish() : POS.render(); }
      if (tn === 'Gift card') amt = Math.min({ USD: 75, EUR: 75, JPY: 10000 }[POS.store().currency], amt);
      S.sheet.amount = POS.round(amt); S.sheet.stage = 'wait'; POS.render();
      const wait = S.sheet;
      setTimeout(() => {
        if (S.sheet !== wait) return;
        const ref = '88' + Math.floor(1e13 + Math.random() * 9e13);
        const label = { Card: S.offline ? 'VISA •••• 4417 · offline approved' : 'VISA •••• 4417 · contactless', 'Pay by link': 'Pay-by-link · Apple Pay', PayPay: 'PayPay', 'Gift card': 'Gift card •••• 1188 (balance used)' }[tn];
        S.cart.payments.push({ type: tn, label, amount: wait.amount, ref: tn === 'Gift card' ? 'Givex auth 551902' : 'PSP ' + ref });
        S.sheet = null;
        if (POS.totals().remaining <= 0) finish(); else POS.toast(`${M(wait.amount)} approved. ${M(POS.totals().remaining)} left to pay.`);
      }, tn === 'Pay by link' ? 2400 : 1700);
    },
    cancelPay: () => { S.sheet = null; POS.toast('Payment cancelled on terminal'); },
  });

  /* Completes the sale: number, fiscal signing, queue when offline. */
  function finish() {
    const st = POS.store(), t = POS.totals();
    const number = `${st.code.slice(-3)}-${st.device.slice(-2)}-${String(S.seq).padStart(6, '0')}`;
    S.last = { cart: JSON.parse(JSON.stringify(S.cart)), t, number, at: new Date().toTimeString().slice(0, 5), change: S.cart.change || 0, offline: S.offline, training: S.training, channel: (S.cart.customer && POS.customer(S.cart.customer).receipt) || st.receiptDefault, gift: false, sent: null };
    if (!S.training) { S.seq += 1; S.myDay.txns += t.total > 0 ? 1 : 0; S.myDay.sales += Math.max(0, t.total) / { USD: 1, EUR: 0.92, JPY: 149 }[st.currency]; S.myDay.units += Math.max(0, t.units); if (S.offline) S.queued += 1; }
    S.cart = POS.newCart(); S.cart.salesperson = S.user.id; S.sheet = null;
    S.stack = [{ v: 'done' }];
    POS.render();
  }
  POS.finish = finish;

  /* ================= Sale complete & receipt ================= */
  function receiptHTML(L) {
    const st = POS.store();
    return `<div class="receipt" aria-label="Receipt preview">
      <div class="c b" style="letter-spacing:.2em;font-size:13px">ATLAS TIME</div><div class="c">${E(st.name)} · ${st.city}</div>
      ${L.training ? '<div class="c b">*** TRAINING – NOT A RECEIPT ***</div>' : ''}
      <div class="rule"></div><div class="ln"><span>${L.t.total < 0 ? 'CREDIT NOTE' : L.gift ? 'GIFT RECEIPT' : 'RECEIPT'}</span><span>${L.number}</span></div><div class="ln"><span>13.10.2026 ${L.at}</span><span>#${S.user.id}</span></div><div class="rule"></div>
      ${L.t.lines.map((l) => `<div class="ln"><span>${l.qty} × ${E(POS.product(l.sku).name).slice(0, 22)}</span><span>${L.gift ? '' : M(l.gross)}</span></div>${l.promo || l.manual ? `<div class="ln"><span>  ${E(l.promoName || l.discReason)}</span><span>${L.gift ? '' : '−' + M(l.promo + l.manual)}</span></div>` : ''}${l.note ? `<div>  "${E(l.note)}"</div>` : ''}${l.ship ? '<div>  Ships to customer</div>' : ''}`).join('')}
      ${L.gift ? '' : `<div class="rule"></div>${L.t.basketPromo ? `<div class="ln"><span>${L.t.basketPromoName}</span><span>−${M(L.t.basketPromo)}</span></div>` : ''}<div class="ln b"><span>TOTAL</span><span>${M(L.t.total)}</span></div>
      <div class="ln"><span>${st.taxMode === 'inclusive' ? 'incl. ' : ''}${st.taxLabel}</span><span>${M(L.t.tax)}</span></div><div class="rule"></div>
      ${L.cart.payments.map((p) => `<div class="ln"><span>${E(p.label)}</span><span>${M(p.amount)}</span></div>`).join('')}${L.change ? `<div class="ln"><span>Change</span><span>${M(L.change)}</span></div>` : ''}`}
      ${st.country === 'DE' && !L.training ? `<div class="rule"></div><div>${L.offline ? 'TSE ausgefallen – Signatur folgt' : 'TSE-Signatur: MEUCIQD…k2Q='}</div><div>Signaturzähler: ${88214 + S.seq - 4120}</div><div class="qr"></div>` : ''}
      ${st.country === 'JP' ? '<div class="rule"></div><div>登録番号 T1234567890123</div>' : ''}
      <div class="rule"></div><div class="small">Returns within ${st.returnDays} days with receipt.</div><div class="c">*${L.number.replace(/-/g, '')}*</div></div>`;
  }
  V.done = () => {
    const L = S.last, st = POS.store(), refund = L.t.total < 0;
    const chans = [['Email', 'mail'], ['SMS', 'sms'], ['Print', 'printer'], ['QR', 'qr'], ['None', 'x']];
    return {
      title: refund ? 'Refund complete' : 'Sale complete', sub: `${L.number} · ${L.at}`, wide: true,
      body: `<div class="two-col" style="display:grid;gap:14px"><div class="stack">
          <div class="done-mark">${I('check')}</div>
          <div class="due" style="padding-top:4px"><div class="lbl">${refund ? 'Refunded' : 'Paid'}</div><div class="amt">${M(Math.abs(L.t.total))}</div>${L.change ? `<div style="font-size:20px;font-weight:700" class="up">Give change ${M(L.change)}</div>` : ''}</div>
          ${st.fiscal ? `<div class="callout ${L.offline && st.country === 'DE' ? 'warn' : 'good'}">${I(L.offline && st.country === 'DE' ? 'alert' : 'check')}<span>${st.country === 'DE' ? (L.offline ? 'TSE unreachable. Receipt marked "TSE ausgefallen"; signature is added when back online.' : 'Signed by TSE · counter ' + (88214 + S.seq - 4121)) : st.fiscal}</span></div>` : ''}
          ${L.offline ? `<div class="callout warn">${I('off')}<span>Stored on this device and queued. It syncs to Core POS, SAP and inventory automatically.</span></div>` : ''}
          <section class="card"><div class="card-h"><h2>Receipt</h2>${st.country === 'DE' ? '<span class="badge warn">Must be offered (DE)</span>' : ''}</div><div class="card-b">
            <div class="g3" style="grid-template-columns:repeat(5,1fr)">${chans.map(([c, ic]) => `<button class="tender" style="min-height:64px;justify-items:center;padding:8px 4px;${L.channel === c ? 'border-color:var(--accent);background:var(--accent-soft)' : ''}" data-act="rcptChan" data-arg="${c}">${I(ic)}<span class="small">${c}</span></button>`).join('')}</div>
            ${L.channel === 'Email' ? `<input class="input" id="rc-email" value="${L.cart.customer ? E(POS.customer(L.cart.customer).email) : ''}" placeholder="customer@email.com" aria-label="Email address">` : L.channel === 'SMS' ? `<input class="input" id="rc-sms" value="${L.cart.customer ? E(POS.customer(L.cart.customer).phone) : ''}" placeholder="Mobile number" aria-label="Mobile number">` : ''}
            <label class="row">${POS.switch('rc-gift', L.gift, 'Gift receipt', 'rcptGift')}<span class="grow">Also give a gift receipt (no prices)</span></label>
            <button class="btn primary" data-act="rcptSend">${L.sent ? I('check') + 'Sent · send again' : L.channel === 'None' ? 'Skip receipt' : 'Send receipt'}</button>
          </div></section></div>
        <div class="stack"><div class="eyebrow" style="text-align:center">Preview</div>${receiptHTML(L)}</div></div>`,
      footer: `<div class="actionbar"><button class="btn big primary block" data-act="newSale">${I('plus')}New sale</button></div>`,
    };
  };
  Object.assign(A, {
    rcptChan: (c) => { S.last.channel = c; S.last.sent = null; POS.render(); },
    rcptGift: (on) => { S.last.gift = on; POS.render(); },
    rcptSend: () => { S.last.sent = true; POS.toast(S.last.channel === 'None' ? 'No receipt' : S.last.channel === 'Print' ? `Printing on ${POS.store().printer}` : S.last.channel === 'QR' ? 'QR shown on customer display' : `Receipt sent by ${S.last.channel}`); },
    newSale: () => POS.tab('sell'),
  });
})();
