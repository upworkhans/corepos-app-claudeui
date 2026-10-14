/* Views: returns & exchanges, orders to fulfil (BOPIS / ship from store), parked sales,
   cash & business day (paid in/out, X report, Z close), and More (device, sync, training). */
(function () {
  const D = POS.data, S = POS.S, V = POS.V, SH = POS.SH, A = POS.ACT, I = POS.icon, E = POS.esc, M = (v) => POS.money(v);

  /* ================= Returns & exchanges ================= */
  V.returns = (cur) => {
    const st = POS.store();
    if (cur.stage === 'found') {
      const sale = D.pastSale, c = POS.customer(sale.customer);
      cur.sel = cur.sel || { 0: true };
      const rows = sale.lines.map((l, i) => { const p = POS.product(l.sku); const paid = i === 1 ? 0 : POS.price(p); return { l, p, paid, i }; });
      const refund = rows.filter((r) => cur.sel[r.i]).reduce((a, r) => a + r.paid, 0);
      return {
        title: 'Return', sub: `Receipt ${st.code.slice(-3)}-${sale.id} · ${sale.date}`, wide: true,
        body: `<div class="callout good">${I('check')}<span>Within the ${st.returnDays}-day return window · paid by ${sale.tender} · sold by ${sale.associate}</span></div>
          <button class="cust-chip set"><span class="avatar">${POS.initials(c.name)}</span><span class="grow"><b>${c.name}</b> <span class="tier">${c.tier}</span><div class="small muted">Original customer</div></span></button>
          <section class="card"><div class="card-h"><h2>Select items to return</h2></div><div class="list">${rows.map((r) => `<label class="li" style="cursor:pointer"><input type="checkbox" ${cur.sel[r.i] ? 'checked' : ''} data-change="retSel" data-i="${r.i}" style="width:22px;height:22px;accent-color:var(--accent)" aria-label="Return ${E(r.p.name)}">${POS.art(r.p, 'sm')}<span class="grow"><span class="t">${E(r.p.name)}</span><div class="s">${E(r.l.variant)}${r.paid === 0 ? ' · was free (promotion)' : ''}</div></span><b class="num">${M(r.paid)}</b></label>`).join('')}</div></section>
          <div class="g2"><div class="field"><label for="ret-reason">Reason</label><select class="input" id="ret-reason"><option>Changed mind</option><option>Wrong size / fit</option><option>Faulty</option><option>Gift</option></select></div>
          <div class="field"><label for="ret-disp">Item condition</label><select class="input" id="ret-disp"><option>Resaleable</option><option>Damaged</option><option>Send for repair / warranty</option></select></div></div>
          <div class="totals card" style="padding:14px"><div class="r"><span>Refund to ${sale.tender}</span><b>${M(refund)}</b></div><div class="small muted">Referenced refund through Adyen: the customer doesn't need the card.</div></div>`,
        footer: `<div class="actionbar"><div class="g2"><button class="btn big" data-act="retExchange" ${refund || Object.values(cur.sel).some(Boolean) ? '' : 'disabled'}>${I('ret')}Exchange</button><button class="btn big primary" data-act="retRefund" ${Object.values(cur.sel).some(Boolean) ? '' : 'disabled'}>Refund ${M(refund)}</button></div></div>`,
      };
    }
    if (cur.stage === 'noreceipt') {
      return {
        title: 'Return without receipt', sub: 'Store credit only · lowest price in the last 90 days',
        body: `<div class="callout warn">${I('lock')}<span>Non-receipted returns need manager approval and are refunded as store credit.</span></div>
          <section class="card"><div class="card-h"><h2>Which item?</h2></div><div class="list">${D.products.filter((p) => !p.service && !p.gift).slice(0, 8).map((p) => `<button class="li" data-act="retNoReceipt" data-arg="${p.sku}">${POS.art(p, 'sm')}<span class="grow"><span class="t">${E(p.name)}</span><div class="s">Lowest price 90 days: ${M(POS.round(POS.price(p) * 0.85))}</div></span>${I('chev', 'width="18" height="18"')}</button>`).join('')}</div></section>`,
      };
    }
    return {
      title: 'Return or exchange', sub: `${st.code} · ${st.returnDays}-day policy`,
      body: `<div class="search"><input class="input mono" id="ret-q" placeholder="Receipt number, e.g. ${st.code.slice(-3)}-02-004118" data-enter="retFind" aria-label="Receipt number">${I('receipt')}<button class="scan" data-act="retFind" aria-label="Scan receipt barcode">${I('scan')}</button></div>
        <section class="card"><div class="card-h"><h2>Find the original sale</h2></div><div class="list">
          <button class="li" data-act="retFind"><span class="ic">${I('scan')}</span><span class="grow"><span class="t">Scan receipt barcode or QR</span><div class="s">Works for receipts from the previous POS too</div></span>${I('chev', 'width="18" height="18"')}</button>
          <button class="li" data-act="retFind"><span class="ic">${I('card')}</span><span class="grow"><span class="t">Customer's payment card</span><div class="s">Tap the card on the terminal to find recent sales</div></span>${I('chev', 'width="18" height="18"')}</button>
          <button class="li" data-act="retFind"><span class="ic">${I('users')}</span><span class="grow"><span class="t">Customer profile</span><div class="s">Pick from their purchase history</div></span>${I('chev', 'width="18" height="18"')}</button>
          <button class="li" data-act="retFind"><span class="ic">${I('box')}</span><span class="grow"><span class="t">Online order</span><div class="s">Return an e-commerce order in store</div></span>${I('chev', 'width="18" height="18"')}</button>
          <button class="li" data-act="retNone"><span class="ic">${I('alert')}</span><span class="grow"><span class="t">No receipt</span><div class="s">Store credit only, manager approval</div></span>${I('chev', 'width="18" height="18"')}</button>
        </div></section>`,
    };
  };
  function returnLinesToCart() {
    const cur = POS.cur(), sale = D.pastSale;
    S.cart = POS.newCart(); S.cart.salesperson = S.user.id; S.cart.customer = sale.customer;
    sale.lines.forEach((l, i) => { if (cur.sel[i]) POS.addLine(l.sku, l.variant, { ret: true, price: i === 1 ? 0 : POS.price(POS.product(l.sku)) }); });
  }
  Object.assign(A, {
    retFind: () => { POS.cur().stage = 'found'; POS.cur().sel = { 0: true }; POS.toast('Sale found'); },
    retNone: () => { POS.cur().stage = 'noreceipt'; POS.render(); },
    retSel: (on, el) => { POS.cur().sel[el.dataset.i] = on; POS.render(); },
    retRefund: () => { returnLinesToCart(); S.stack = [{ v: 'sell' }, { v: 'checkout' }]; POS.render(); },
    retExchange: () => { returnLinesToCart(); POS.tab('sell'); POS.toast('Return items added. Add the new items for the exchange.'); },
    retNoReceipt: (sku) => {
      POS.pendingApproval = () => { S.cart = POS.newCart(); S.cart.salesperson = S.user.id; POS.addLine(sku, undefined, { ret: true, price: POS.round(POS.price(POS.product(sku)) * 0.85) }); S.stack = [{ v: 'sell' }, { v: 'checkout' }]; POS.toast('Approved by Sarah L. Refund as store credit.'); };
      POS.sheet('approval', { reason: 'Return without a receipt needs manager approval.' });
    },
  });

  /* ================= Orders to fulfil ================= */
  V.orders = (cur) => {
    const f = cur.f || 'To pick';
    const list = S.orders.filter((o) => (f === 'Done' ? ['Collected', 'Shipped'].includes(o.status) : f === 'To pick' ? ['To pick', 'Packing'].includes(o.status) : o.status === f));
    const cnt = (s) => S.orders.filter((o) => (s === 'To pick' ? ['To pick', 'Packing'].includes(o.status) : s === 'Done' ? ['Collected', 'Shipped'].includes(o.status) : o.status === s)).length;
    return {
      title: 'Orders to fulfil', sub: 'Click & collect and ship from store · from Fluent Commerce',
      body: `<div class="chips">${['To pick', 'Ready for pickup', 'Done'].map((s) => `<button class="chip ${f === s ? 'on' : ''}" data-act="ordFilter" data-arg="${s}">${s} · ${cnt(s)}</button>`).join('')}</div>
        <section class="card"><div class="list">${list.map((o) => `<button class="li" data-act="openOrder" data-arg="${o.id}">${I(o.type === 'Ship from store' ? 'truck' : 'store', 'width="22" height="22"')}<span class="grow"><span class="t">${E(o.customer)}</span><div class="s"><span class="mono">${o.id}</span> · ${o.type} · ${o.lines.reduce((a, l) => a + l[2], 0)} items</div><div class="s" style="color:${o.due.startsWith('Today') ? 'var(--warn)' : 'var(--fg-3)'}">${I('clock', 'width="13" height="13" style="vertical-align:-2px"')} ${o.due}</div></span><span class="badge ${o.status === 'Ready for pickup' ? 'good' : o.status === 'To pick' ? 'warn' : 'info'}">${o.status}</span></button>`).join('') || '<div class="li s">Nothing here right now.</div>'}</div></section>`,
    };
  };
  V.order = (cur) => {
    const o = S.orders.find((x) => x.id === cur.id);
    cur.picked = cur.picked || {};
    const all = o.lines.every((_, i) => cur.picked[i]);
    let footer;
    if (o.status === 'To pick') footer = `<div class="g2"><button class="btn big" data-act="shortPick">Can't find an item</button><button class="btn big primary" data-act="ordPacked" ${all ? '' : 'disabled'}>${o.type === 'Ship from store' ? 'Packed · print label' : 'Ready for pickup'}</button></div>`;
    else if (o.status === 'Ready for pickup') footer = `<label class="row">${POS.switch('id-check', !!cur.idok, 'ID checked', 'ordId')}<span class="grow">Customer showed ID or order QR</span></label><button class="btn big primary" data-act="ordHandover" ${cur.idok ? '' : 'disabled'}>Hand over to customer</button>`;
    else if (o.status === 'Packing') footer = `<button class="btn big primary" data-act="ordShipped">Handed to carrier</button>`;
    else footer = `<button class="btn big" data-act="back">Done</button>`;
    return {
      title: E(o.customer), sub: `${o.id} · ${o.type}`,
      body: `<div class="row"><span class="badge ${o.status === 'Ready for pickup' ? 'good' : 'warn'}">${o.status}</span><span class="small muted">${o.due}</span></div>
        <section class="card"><div class="card-h"><h2>${o.status === 'To pick' ? 'Pick list' : 'Items'}</h2>${o.status === 'To pick' ? `<span class="small muted">Scan each item or tick it</span>` : ''}</div><div class="list">${o.lines.map(([sku, v, q], i) => { const p = POS.product(sku); return `<label class="li" style="cursor:pointer">${o.status === 'To pick' ? `<input type="checkbox" ${cur.picked[i] ? 'checked' : ''} data-change="pickLine" data-i="${i}" style="width:22px;height:22px;accent-color:var(--accent)" aria-label="Picked ${E(p.name)}">` : ''}${POS.art(p, 'sm')}<span class="grow"><span class="t">${q} × ${E(p.name)}</span><div class="s">${E(v)} · <span class="mono">${p.ean}</span></div><div class="s">Location: ${['Display case B', 'Stockroom shelf 4', 'Back drawer 2'][i % 3]}</div></span></label>`; }).join('')}</div></section>
        ${o.type === 'Ship from store' ? `<div class="callout">${I('truck')}<span>Carrier label comes from Fluent (UPS Ground). Collection at 18:00.</span></div>` : `<div class="callout">${I('sms')}<span>The customer gets an SMS when the order is ready.</span></div>`}`,
      footer: `<div class="actionbar">${footer}</div>`,
    };
  };
  Object.assign(A, {
    ordFilter: (f) => { POS.cur().f = f; POS.render(); },
    openOrder: (id) => POS.go('order', { id }),
    pickLine: (on, el) => { POS.cur().picked[el.dataset.i] = on; POS.render(); },
    shortPick: () => POS.toast('Short pick reported to Fluent. The item is re-sourced from another location.'),
    ordPacked: () => { const o = S.orders.find((x) => x.id === POS.cur().id); o.status = o.type === 'Ship from store' ? 'Packing' : 'Ready for pickup'; o.due = o.type === 'Ship from store' ? 'Carrier at 18:00' : 'Ready since ' + new Date().toTimeString().slice(0, 5); POS.toast(o.type === 'Ship from store' ? 'Label printed. Hand to the carrier at 18:00.' : 'Ready for pickup. Customer notified by SMS.'); },
    ordId: (on) => { POS.cur().idok = on; POS.render(); },
    ordHandover: () => { const o = S.orders.find((x) => x.id === POS.cur().id); o.status = 'Collected'; o.due = 'Collected ' + new Date().toTimeString().slice(0, 5); POS.toast('Order collected. Status sent to Fluent.'); POS.back(); },
    ordShipped: () => { const o = S.orders.find((x) => x.id === POS.cur().id); o.status = 'Shipped'; o.due = 'Shipped'; POS.toast('Handed to carrier'); POS.back(); },
  });

  /* ================= Parked sales ================= */
  V.parked = () => ({
    title: 'Parked sales', sub: 'Resume on any device in this store · kept 24 hours',
    body: S.parked.length ? `<section class="card"><div class="list">${S.parked.map((p, i) => { const total = p.lines.reduce((a, l) => a + POS.price(POS.product(l.sku)) * l.qty, 0); return `<div class="li"><span class="avatar">${I('pause', 'width="18" height="18"')}</span><span class="grow"><span class="t">${E(p.customer)}</span><div class="s">${p.lines.map((l) => POS.product(l.sku).name).join(', ')}</div><div class="s">Parked ${p.at} by ${p.by} · <span class="mono">${p.id}</span></div></span><div class="stack" style="justify-items:end;gap:6px"><b class="num">${M(total)}</b><button class="btn sm primary" data-act="resume" data-arg="${i}">Resume</button></div></div>`; }).join('')}</div></section>`
      : `<div class="card"><div class="card-b" style="padding:28px;text-align:center">${I('pause', 'width="32" height="32" style="margin:0 auto;color:var(--fg-3)"')}<b>No parked sales</b><span class="small muted">Park a sale from the Sale screen to serve another customer.</span></div></div>`,
  });
  A.resume = (i) => {
    const p = S.parked.splice(+i, 1)[0];
    if (S.cart.lines.length) A.park();
    S.cart = POS.newCart(); S.cart.salesperson = S.user.id;
    const c = D.customers.find((x) => x.name === p.customer); if (c) S.cart.customer = c.id;
    p.lines.forEach((l) => { POS.addLine(l.sku, l.variant, { note: l.note }); S.cart.lines[S.cart.lines.length - 1].qty = l.qty; });
    POS.tab('sell'); POS.toast(`Resumed ${p.id}`);
  };

  /* ================= Cash & business day ================= */
  V.cash = () => {
    const st = POS.store(), d = S.drawer;
    const expected = st.float + d.cashSales * { USD: 1, EUR: 1, JPY: 1 }[st.currency] + d.paidIn - d.paidOut;
    return {
      title: 'Cash & day', sub: `${st.code} · business day 13 Oct · ${st.tz}`, wide: true,
      body: `<section class="card"><div class="card-h"><h2>Business day</h2><span class="badge ${S.dayOpen ? 'good' : 'info'}">${S.dayOpen ? 'Open' : 'Z-closed'}</span></div><div class="card-b">
          <dl class="kv"><dt>Opened</dt><dd>09:52 by Sarah L.</dd><dt>Transactions</dt><dd>${38 + S.myDay.txns - 9}</dd><dt>Net sales</dt><dd>${M(12880 * { USD: 1, EUR: 0.92, JPY: 149 }[st.currency] + (S.myDay.sales - 3840))}</dd>${st.fiscal ? `<dt>Fiscal</dt><dd>${st.country === 'DE' ? 'TSE online' : st.fiscal}</dd>` : ''}</dl></div></section>
        <section class="card"><div class="card-h"><h2>Drawer 1</h2><span class="small muted">${st.device}</span></div><div class="card-b">
          <dl class="kv"><dt>Opening float</dt><dd>${M(st.float)}</dd><dt>Cash sales</dt><dd>${M(d.cashSales)}</dd><dt>Paid in</dt><dd>${M(d.paidIn)}</dd><dt>Paid out</dt><dd>−${M(d.paidOut)}</dd></dl>
          <div class="divider"></div><div class="row"><span class="grow"><b>Expected in drawer</b></span><b class="num" style="font-size:20px">${M(expected)}</b></div>
          <div class="g2"><button class="btn" data-act="cashMove" data-arg="in">${I('plus')}Paid in</button><button class="btn" data-act="cashMove" data-arg="out">${I('out')}Paid out</button>
          <button class="btn" data-act="cashMove" data-arg="pickup">${I('cash')}Cash pickup</button><button class="btn" data-act="noSale">${I('lock')}Open drawer</button></div></div></section>
        <section class="card"><div class="list">
          <button class="li" data-act="sheet" data-arg="xReport"><span class="ic">${I('receipt')}</span><span class="grow"><span class="t">X report</span><div class="s">Mid-day totals. Doesn't close anything.</div></span>${I('chev', 'width="18" height="18"')}</button>
          <button class="li" data-act="go" data-arg="zclose" ${S.dayOpen ? '' : 'disabled'}>${I('lock')}<span class="grow"><span class="t">Count drawer & close day (Z)</span><div class="s">Blind count, over/short, posts totals to SAP${st.fiscal && st.country === 'DE' ? ', closes the TSE day' : ''}</div></span>${I('chev', 'width="18" height="18"')}</button>
        </div></section>`,
    };
  };
  SH.cashMove = (sh) => ({
    title: { in: 'Paid in', out: 'Paid out', pickup: 'Cash pickup' }[sh.kind],
    body: `<div class="field"><label for="cm-amt">Amount</label><input class="input num" id="cm-amt" inputmode="decimal" value="${sh.kind === 'pickup' ? (POS.store().currency === 'JPY' ? 100000 : 500) : POS.store().currency === 'JPY' ? 2000 : 20}" style="font-size:22px;font-weight:700;min-height:56px"></div>
      <div class="field"><label for="cm-reason">Reason</label><select class="input" id="cm-reason">${(sh.kind === 'out' ? ['Store supplies', 'Courier', 'Cleaning'] : sh.kind === 'in' ? ['Change float top-up', 'Petty cash return'] : ['Safe drop', 'Bank deposit']).map((r) => `<option>${r}</option>`).join('')}</select></div>
      ${sh.kind === 'out' ? '<div class="small muted">Paid outs over the limit need a receipt photo and manager approval.</div>' : ''}${sh.kind === 'pickup' ? '<div class="small muted">Bag number is recorded and sent to SAP as a deposit.</div>' : ''}`,
    footer: `<button class="btn big primary" data-act="cashMoveOk">Record</button>`,
  });
  Object.assign(A, {
    cashMove: (k) => POS.sheet('cashMove', { kind: k }),
    cashMoveOk: () => { const v = +document.getElementById('cm-amt').value || 0; const k = S.sheet.kind; if (k === 'in') S.drawer.paidIn += v; else S.drawer.paidOut += v; S.sheet = null; POS.toast(`${{ in: 'Paid in', out: 'Paid out', pickup: 'Pickup' }[k]} of ${M(v)} recorded`); },
    noSale: () => POS.sheet('approval', { reason: 'Opening the drawer without a sale needs a manager.', then: 'toast:Drawer opened · no-sale recorded in audit log' }),
  });
  SH.xReport = () => {
    const st = POS.store(), f = { USD: 1, EUR: 0.92, JPY: 149 }[st.currency];
    return {
      title: 'X report · 13 Oct',
      body: `<div class="card"><div class="card-b" style="padding-top:14px"><dl class="kv">
        <dt>Gross sales</dt><dd>${M(14210 * f)}</dd><dt>Returns</dt><dd>−${M(1330 * f)}</dd><dt>Net sales</dt><dd>${M(12880 * f)}</dd><dt>${st.taxLabel}</dt><dd>${M(st.taxMode === 'inclusive' ? 12880 * f * st.taxRate / (1 + st.taxRate) : 12880 * f * st.taxRate)}</dd>
        <dt>Transactions</dt><dd>38</dd><dt>Avg. sale</dt><dd>${M((12880 * f) / 38)}</dd><dt>Discounts</dt><dd>${M(612 * f)}</dd></dl>
        <div class="divider"></div><dl class="kv"><dt>Card</dt><dd>${M(10920 * f)}</dd><dt>Cash</dt><dd>${M(S.drawer.cashSales)}</dd><dt>Gift card</dt><dd>${M(640 * f)}</dd><dt>Pay by link</dt><dd>${M(908 * f)}</dd></dl></div></div>`,
      footer: `<button class="btn" data-act="toast" data-arg="X report printed">${I('printer')}Print</button>`,
    };
  };

  V.zclose = (cur) => {
    const st = POS.store();
    cur.counts = cur.counts || {};
    const counted = st.denoms.reduce((a, d) => a + d * (+cur.counts[d] || 0), 0);
    const expected = st.float + S.drawer.cashSales + S.drawer.paidIn - S.drawer.paidOut;
    const diff = POS.round(counted - expected);
    return {
      title: 'Close day', sub: 'Count the drawer by denomination',
      body: `<div class="callout">${I('eye')}<span>Blind count: the expected amount is shown only after you submit.</span></div>
        <section class="card"><div class="list">${st.denoms.map((d) => `<div class="li"><b class="num" style="width:90px">${M(d)}</b><span class="grow"></span><input class="input num" style="width:90px;text-align:right" inputmode="numeric" id="den-${String(d).replace('.', '_')}" value="${cur.counts[d] || ''}" placeholder="0" data-input="denCount" data-d="${d}" aria-label="Count of ${M(d)}"><b class="num muted" style="width:96px;text-align:right">${M(d * (+cur.counts[d] || 0))}</b></div>`).join('')}</div></section>
        <section class="card"><div class="card-b" style="padding-top:14px"><div class="totals"><div class="r grand"><span>Counted</span><span>${M(counted)}</span></div>
          ${cur.submitted ? `<div class="r"><span>Expected</span><span>${M(expected)}</span></div><div class="r" style="font-weight:700;color:${Math.abs(diff) < 1 ? 'var(--good)' : 'var(--bad)'}"><span>${diff >= 0 ? 'Over' : 'Short'}</span><span>${M(Math.abs(diff))}</span></div>` : ''}</div></div></section>
        ${cur.submitted && Math.abs(diff) >= 1 ? `<div class="field"><label for="z-note">Explain the difference</label><textarea class="input" id="z-note" placeholder="Required when over/short exceeds ${M(1)}"></textarea></div>` : ''}`,
      footer: `<div class="actionbar">${cur.submitted ? `<button class="btn big primary block" data-act="zFinish">Close day & post to SAP</button>` : `<div class="g2"><button class="btn big" data-act="zFill">Fill example count</button><button class="btn big primary" data-act="zSubmit" ${counted ? '' : 'disabled'}>Submit count</button></div>`}</div>`,
    };
  };
  Object.assign(A, {
    denCount: (v, el) => { POS.cur().counts[el.dataset.d] = v.replace(/\D/g, ''); clearTimeout(A._dt); A._dt = setTimeout(POS.render, 350); },
    zFill: () => {
      const st = POS.store(); let left = POS.round(st.float + S.drawer.cashSales + S.drawer.paidIn - S.drawer.paidOut); const counts = {};
      st.denoms.forEach((d) => { const n = Math.floor(POS.round(left) / d + 1e-9); if (n) { counts[d] = String(n); left = POS.round(left - n * d); } });
      POS.cur().counts = counts; POS.render();
    },
    zSubmit: () => { POS.cur().submitted = true; POS.render(); },
    zFinish: () => { S.dayOpen = false; const st = POS.store(); S.stack = [{ v: 'more' }, { v: 'cash' }]; POS.toast(`Day closed. Z report printed${st.country === 'DE' ? ', TSE day closed' : ''}, totals ${S.offline ? 'queued for' : 'posted to'} SAP.`); },
  });

  /* ================= More ================= */
  V.more = () => {
    const st = POS.store(), u = S.user;
    return {
      title: 'More', sub: `${st.code} · ${st.device}`, wide: true,
      body: `<div class="two-col" style="display:grid;gap:14px"><div class="stack">
        <section class="card"><div class="card-b" style="padding-top:14px"><div class="row"><span class="avatar lg">${u.initials}</span><div class="grow"><b style="font-size:18px">${u.name}</b><div class="small muted">${u.role} · #${u.id}</div><div class="small muted">Discounts up to ${u.discountLimit}% without approval</div></div></div>
          <button class="btn" data-act="lock">${I('lock')}Lock & switch user</button></div></section>
        <section class="card"><div class="list">
          <button class="li" data-act="go" data-arg="cash"><span class="ic">${I('cash')}</span><span class="grow t">Cash & business day</span>${I('chev', 'width="18" height="18"')}</button>
          <button class="li" data-act="go" data-arg="orders"><span class="ic">${I('box')}</span><span class="grow t">Orders to fulfil</span>${I('chev', 'width="18" height="18"')}</button>
          <button class="li" data-act="go" data-arg="parked"><span class="ic">${I('pause')}</span><span class="grow t">Parked sales</span>${I('chev', 'width="18" height="18"')}</button>
          <button class="li" data-act="go" data-arg="returns"><span class="ic">${I('ret')}</span><span class="grow t">Return or exchange</span>${I('chev', 'width="18" height="18"')}</button>
        </div></section>
        <section class="card"><div class="card-b" style="padding-top:14px">
          <label class="row">${POS.switch('more-train', S.training, 'Training mode', 'demoTraining')}<span class="grow"><b>Training mode</b><div class="small muted">Practise sales and returns. Nothing is charged, signed or posted.</div></span></label>
        </div></section></div>
        <div class="stack">
        <section class="card"><div class="card-h"><h2>Hardware</h2></div><div class="list">
          ${[['card', 'Payment terminal', st.terminal, 'Connected'], ['printer', 'Receipt printer', st.printer, 'Paper OK'], ['scan', 'Barcode scanner', 'Camera + Bluetooth ring scanner', 'Ready'], ['battery', 'Battery', '64% · charging sled attached', 'OK']].map(([ic, a, b, s]) => `<div class="li">${I(ic, 'width="20" height="20"')}<span class="grow"><span class="t">${a}</span><div class="s">${b}</div></span><span class="badge good">${s}</span></div>`).join('')}
        </div></section>
        <section class="card"><div class="card-h"><h2>Sync</h2><span class="badge ${S.offline ? 'warn' : 'good'}">${S.offline ? 'Offline' : 'Online'}</span></div><div class="card-b"><dl class="kv">
          <dt>Queued transactions</dt><dd>${S.queued}</dd><dt>Last sync</dt><dd>${S.offline ? '09:40' : 'Just now'}</dd><dt>Offline catalogue</dt><dd>v8812 · 48,210 items</dd><dt>Receipt numbers left</dt><dd>882 reserved</dd><dt>Offline sign-in</dt><dd>PINs cached · 72 h</dd><dt>App version</dt><dd>4.12.1 (minimum 4.11.0)</dd></dl>
          <button class="btn" data-act="toast" data-arg="${S.offline ? 'No connection. Will retry automatically.' : 'Synced. Catalogue, prices and promotions up to date.'}">${I('sync')}Sync now</button></div></section>
        <section class="card"><div class="list">
          <div class="li"><span class="ic">${I('signal')}</span><span class="grow"><span class="t">Language</span><div class="s">${st.locale} · receipts follow the customer’s language</div></span></div>
          <button class="li" data-act="toast" data-arg="Opening the training library"><span class="ic">${I('graduation')}</span><span class="grow t">How-to videos & help</span>${I('chev', 'width="18" height="18"')}</button>
        </div></section></div></div>`,
    };
  };
})();
