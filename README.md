# Core POS · Store app (UI prototype)

Clickable prototype of the **Core POS in-store app**, the lightweight mobile POS that store associates use on iPhone, iPad and Android. It is the companion to the Core POS back-office admin panel and uses the same fictional tenant (*Atlas Retail Group*), brands, stores, tax, fiscal, payment and access rules.

Open `index.html` in a browser. No build step or server is needed. On a desktop the app is shown in a phone or tablet frame with demo controls next to it; on a real phone it fills the screen.

`python3 tools/build.py` bundles everything into one self-contained file at `dist/core-pos-app.html` for hosting.

## Demo controls

| Control | What it shows |
|---|---|
| **Demo store: US / DE / JP** | The same app adapting to country rules. US: USD, prices exclude tax, sales tax from Avalara. DE: EUR, VAT included, TSE fiscal signing, printed receipt must be offered. JP: JPY with no decimals, JCT included, qualified invoice number, PayPay, tiered "spend ¥50,000 save ¥5,000" promotion. |
| **Phone / Tablet** | Phone layout, or tablet with catalogue and cart side by side. |
| **Offline** | Selling continues offline: queued transactions, cached tax rates and stock, store-and-forward card approvals, temporary customer IDs, "TSE ausgefallen" receipts in Germany. |
| **Training mode** | Practice sales that are not charged, signed or posted. |

Sign in with any 4-digit PIN. Mia (Senior Associate) may give up to 10% off without approval; larger discounts, no-sale drawer opens, tax exemptions and returns without a receipt ask for a manager approval (PIN on the device or a remote request).

## Screens and flows

| Area | What's covered |
|---|---|
| Sign-in | Shared device, SSO-enrolled; fast user switching by PIN |
| Home | Start/continue sale, quick actions, my day vs target (sales, average sale, items per sale), store notices |
| Sell | Scan or search, cart with quantity, item and sale discounts with reason codes, automatic promotions (free strap with any watch, JP tiered spend), engraving/notes, salesperson, park sale, gift card, tax exemption, void, tax per country |
| Products | Search by name/SKU/EAN, categories, stock in this store, nearby stores and online, variants, add to sale or ship to customer (endless aisle) |
| Customers | Search, loyalty QR, masked contact details with logged reveal, preferences, wishlist, purchase history, recommendations, create customer with country-specific fields and consent |
| Payment | Card on Adyen terminal, cash with quick amounts and change, gift card, store credit, voucher, pay by link, PayPay; split across any tenders; refunds to the original card without the card |
| Sale complete | Change due, fiscal status, receipt by email/SMS/print/QR or none, gift receipt, live receipt preview |
| Returns & exchanges | Find by receipt, card, customer or online order; select items, reason and condition; refund or exchange; no-receipt returns with approval and store credit |
| Orders to fulfil | Click & collect and ship-from-store tasks: pick list, short pick, ready for pickup / print label, hand over with ID check |
| Parked sales | Resume on any device in the store |
| Cash & day | Drawer summary, paid in/out, cash pickup, no-sale with approval, X report, blind denomination count and Z close with over/short |
| More | User and limits, hardware status (terminal, printer, scanner, battery), sync queue and offline package, training mode |

## Files

```
index.html             stage, device frame and demo controls
assets/styles.css      design tokens (light + dark), Square-style minimal components, Poppins
assets/data.js         sample stores, users, catalogue, stock, customers, orders
assets/app.js          state, cart and tax maths, rendering, navigation, icons
assets/views-sell.js   sign-in, home, sell, products, customers, payment, receipt
assets/views-ops.js    returns, orders, parked sales, cash & day, more
tools/build.py         single-file bundle → dist/core-pos-app.html
```
