/* Core POS app: sample data for the prototype (fictional tenant "Atlas Retail Group").
   Three demo stores show how the same app adapts to country rules:
   US (sales tax via Avalara, tax exclusive), DE (VAT inclusive, TSE fiscal signing), JP (JCT, no decimals). */
window.POS = window.POS || {};

POS.data = {
  stores: {
    'US-NYC-001': {
      code: 'US-NYC-001', name: 'Fifth Avenue Flagship', brand: 'Atlas Time', city: 'New York', country: 'US', region: 'NAM',
      locale: 'en-US', currency: 'USD', tz: 'America/New_York', taxMode: 'exclusive', taxRate: 0.08875, taxLabel: 'Sales tax NY 8.875%', taxEngine: 'Avalara AvaTax',
      fiscal: null, receiptDefault: 'Ask customer', tenders: ['Card', 'Cash', 'Gift card', 'Store credit', 'Pay by link'], cashRounding: 0,
      device: 'D-NYC1-02', terminal: 'Adyen S1F2 · S1F2-000158202', printer: 'Epson TM-m30III', returnDays: 60, quick: [20, 50, 100, 200],
      denoms: [100, 50, 20, 10, 5, 1, 0.25, 0.1, 0.05, 0.01], float: 300,
    },
    'DE-BER-012': {
      code: 'DE-BER-012', name: 'KaDeWe Concession', brand: 'Atlas Time', city: 'Berlin', country: 'DE', region: 'EMEA',
      locale: 'de-DE', currency: 'EUR', tz: 'Europe/Berlin', taxMode: 'inclusive', taxRate: 0.19, taxLabel: 'MwSt. 19%', taxEngine: 'Native VAT',
      fiscal: 'TSE (fiskaly SIGN DE)', receiptDefault: 'Print', tenders: ['Card', 'Cash', 'Gift card', 'Voucher'], cashRounding: 0,
      device: 'D-BER2-02', terminal: 'Adyen V400m · V400m-806117', printer: 'Star mC-Print3', returnDays: 30, quick: [20, 50, 100, 500],
      denoms: [500, 200, 100, 50, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1, 0.05, 0.02, 0.01], float: 250,
    },
    'JP-TYO-011': {
      code: 'JP-TYO-011', name: 'Ginza Six', brand: 'Atlas Time', city: 'Tokyo', country: 'JP', region: 'APAC',
      locale: 'ja-JP', currency: 'JPY', tz: 'Asia/Tokyo', taxMode: 'inclusive', taxRate: 0.10, taxLabel: '消費税 10%', taxEngine: 'Native JCT',
      fiscal: 'Qualified invoice T1234567890123', receiptDefault: 'Print', tenders: ['Card', 'Cash', 'PayPay', 'Gift card'], cashRounding: 0,
      device: 'D-TYO11-03', terminal: 'Adyen AMS1 · AMS1-000330561', printer: 'Epson TM-m30III', returnDays: 30, quick: [10000, 50000, 100000],
      denoms: [10000, 5000, 1000, 500, 100, 50, 10, 5, 1], float: 50000,
    },
  },

  users: [
    { id: '1182', name: 'Mia Kowalski', short: 'Mia K.', role: 'Senior Associate', discountLimit: 10, initials: 'MK' },
    { id: '1121', name: 'Tom Reyes', short: 'Tom R.', role: 'Associate', discountLimit: 0, initials: 'TR' },
    { id: '1003', name: 'Sarah Lindqvist', short: 'Sarah L.', role: 'Store Manager', discountLimit: 30, initials: 'SL' },
  ],

  categories: ['All', 'Watches', 'Leather', 'Jewellery', 'Straps', 'Services', 'Gift cards'],

  /* price: [USD, EUR, JPY]; art: drawing used for the product tile */
  products: [
    { sku: 'ATL-W-40221', name: 'Meridian Chronograph 42mm', brand: 'Atlas Time', cat: 'Watches', art: 'watch', hue: 210, price: [395, 379, 59400], variants: ['Steel · black dial', 'Steel · blue dial', 'Gold tone'], ean: '4053858942217', attrs: 'Quartz chronograph · 42 mm · 10 ATM', serial: true },
    { sku: 'ATL-W-40198', name: 'Meridian Automatic 40mm', brand: 'Atlas Time', cat: 'Watches', art: 'watch', hue: 18, price: [595, 569, 89100], variants: ['Rose gold · white dial', 'Steel · green dial'], ean: '4053858941982', attrs: 'Automatic · sapphire · 40 mm', serial: true },
    { sku: 'ATL-W-40310', name: 'Coastline Diver 44mm', brand: 'Atlas Time', cat: 'Watches', art: 'watch', hue: 190, price: [325, 309, 48400], variants: ['Black · rubber', 'Blue · steel'], ean: '4053858943108', attrs: 'Diver · 20 ATM · 44 mm', serial: true },
    { sku: 'NOR-W-00712', name: 'Fjord 36mm, mesh strap', brand: 'Nordlys', cat: 'Watches', art: 'watch', hue: 160, price: [189, 179, 27500], variants: ['Silver', 'Gold', 'Black'], ean: '5707446007125', attrs: 'Minimalist · 36 mm · mesh', serial: true },
    { sku: 'KES-L-11804', name: 'Harbour Tote, cognac', brand: 'Kestrel', cat: 'Leather', art: 'bag', hue: 28, price: [495, 469, 74800], variants: ['Cognac', 'Black', 'Olive'], ean: '0796483118045', attrs: 'Full-grain leather · 15" laptop' },
    { sku: 'KES-L-11530', name: 'Crossbody Mini', brand: 'Kestrel', cat: 'Leather', art: 'bag', hue: 340, price: [245, 229, 36300], variants: ['Black', 'Burgundy'], ean: '0796483115303', attrs: 'Pebbled leather · adjustable strap' },
    { sku: 'KES-L-11290', name: 'Bifold Wallet RFID', brand: 'Kestrel', cat: 'Leather', art: 'wallet', hue: 30, price: [129, 119, 18700], variants: ['Black', 'Brown'], ean: '0796483112906', attrs: 'RFID blocking · 8 card slots' },
    { sku: 'ATL-J-20077', name: 'Link Bracelet, steel', brand: 'Atlas Time', cat: 'Jewellery', art: 'ring', hue: 220, price: [139, 129, 20900], variants: ['Steel', 'Gold tone'], ean: '4053858200775', attrs: 'Stainless steel · 19 cm' },
    { sku: 'ATL-A-90012', name: 'Leather Strap 20mm', brand: 'Atlas Time', cat: 'Straps', art: 'strap', hue: 25, price: [59, 55, 8800], variants: ['Brown', 'Black', 'Navy'], ean: '4053858900125', attrs: 'Quick-release · fits 20 mm lugs' },
    { sku: 'ATL-S-ENGRV', name: 'Engraving service', brand: 'Atlas Time', cat: 'Services', art: 'pen', hue: 260, price: [25, 25, 3300], variants: [], ean: '—', attrs: 'Up to 20 characters · ready in 30 min', service: true },
    { sku: 'ATL-GC', name: 'Gift card', brand: 'Atlas Time', cat: 'Gift cards', art: 'card', hue: 150, price: [100, 100, 10000], variants: ['Amount on activation'], ean: '—', attrs: 'Activated at the till · no expiry', gift: true },
  ],

  /* Stock: [this store, nearby store A, nearby store B, online DC] */
  stock: {
    'ATL-W-40221': [4, 2, 0, 312], 'ATL-W-40198': [1, 0, 3, 88], 'ATL-W-40310': [0, 5, 2, 140], 'NOR-W-00712': [6, 1, 1, 410],
    'KES-L-11804': [2, 0, 1, 64], 'KES-L-11530': [3, 2, 0, 120], 'KES-L-11290': [11, 4, 6, 820], 'ATL-J-20077': [5, 0, 2, 230],
    'ATL-A-90012': [24, 9, 12, 1500], 'ATL-S-ENGRV': [99, 0, 0, 0], 'ATL-GC': [99, 0, 0, 0],
  },
  nearby: { 'US-NYC-001': ['SoHo · 2.1 mi', 'Brooklyn · 5.4 mi'], 'DE-BER-012': ['Alexa · 4 km', 'Potsdam · 26 km'], 'JP-TYO-011': ['Shinjuku · 6 km', 'Yokohama · 29 km'] },

  customers: [
    { id: 'C-88213490', name: 'Olivia Bennett', tier: 'Gold', email: 'olivia.bennett@example.com', phone: '+1 212 555 0148', since: '2019', ltv: 4820, visits: 14, prefs: 'Rose gold, automatic movements', wrist: '16 cm', receipt: 'Email', credit: 40, consent: { email: true, sms: false } ,
      history: [['12 Sep 2026', 'Meridian Automatic 40mm', 595], ['02 Mar 2026', 'Link Bracelet, steel', 139], ['18 Dec 2025', 'Harbour Tote, cognac', 495]], wishlist: ['ATL-W-40310'] },
    { id: 'C-77102244', name: 'Lukas Becker', tier: 'Silver', email: 'lukas.becker@example.com', phone: '+49 30 5550 1144', since: '2022', ltv: 1210, visits: 5, prefs: 'Diver watches', wrist: '18 cm', receipt: 'Print', credit: 0, consent: { email: true, sms: true },
      history: [['20 Aug 2026', 'Coastline Diver 44mm', 309]], wishlist: ['ATL-W-40221'] },
    { id: 'C-66019871', name: 'Yuki Sato', tier: 'Platinum', email: 'yuki.sato@example.com', phone: '+81 3 5550 7781', since: '2017', ltv: 11400, visits: 31, prefs: 'Leather goods, black', wrist: '15 cm', receipt: 'Print', credit: 0, consent: { email: false, sms: false },
      history: [['01 Oct 2026', 'Crossbody Mini', 229], ['14 Jun 2026', 'Meridian Chronograph 42mm', 379]], wishlist: ['KES-L-11804'] },
    { id: 'C-55120003', name: 'Aarav Sharma', tier: 'Member', email: 'aarav.sharma@example.com', phone: '+1 646 555 0101', since: '2026', ltv: 189, visits: 1, prefs: '—', wrist: '—', receipt: 'SMS', credit: 0, consent: { email: true, sms: true },
      history: [['30 Sep 2026', 'Fjord 36mm, mesh strap', 189]], wishlist: [] },
  ],

  /* Recent sale used by the returns flow (looked up by receipt barcode). */
  pastSale: {
    id: '02-004118', date: '05 Oct 2026', associate: 'Tom R.', customer: 'C-88213490',
    lines: [{ sku: 'ATL-W-40221', variant: 'Steel · black dial', qty: 1 }, { sku: 'ATL-A-90012', variant: 'Brown', qty: 1 }],
    tender: 'Card · VISA •••• 4417',
  },

  orders: [
    { id: 'FC-1048812', type: 'Click & collect', customer: 'Olivia Bennett', due: 'Today 17:00', status: 'To pick', lines: [['ATL-J-20077', 'Steel', 1], ['ATL-A-90012', 'Navy', 1]] },
    { id: 'FC-1048790', type: 'Ship from store', customer: 'J. Morales', due: 'Today 18:00 (carrier)', status: 'To pick', lines: [['KES-L-11290', 'Black', 2]] },
    { id: 'FC-1048755', type: 'Click & collect', customer: 'Aarav Sharma', due: 'Ready since 11:20', status: 'Ready for pickup', lines: [['NOR-W-00712', 'Gold', 1]] },
  ],

  parked: [
    { id: 'P-0091', by: 'Tom R.', at: '11:42', customer: 'Lukas Becker', lines: [{ sku: 'ATL-W-40221', variant: 'Steel · blue dial', qty: 1 }, { sku: 'ATL-S-ENGRV', variant: '', qty: 1, note: 'L.B. 2026' }] },
  ],
};
