# GymBro — Teammate Developer Guide

This guide gives you everything you need to build your assigned module.  
Read it fully before writing a single line of code — it will save you hours.

---

## 1. Project Overview

GymBro is a Gym Management System built by a team. Each person owns one module.  
The project is already running. You are adding a new module on top of existing code.

**Tech Stack**
- Backend: Node.js + Express + PostgreSQL (pg)
- Frontend: React + Vite + React Router v6
- Styling: Custom CSS (`index.css`) with CSS variables — no Tailwind classes needed
- Docker: Everything runs in containers via `docker-compose`

---

## 2. Project Structure

```
project/
├── docker-compose.yml
├── database/               ← SQL init scripts (already done, don't touch)
│
├── server/
│   ├── app.js              ← Express config (don't touch)
│   ├── server.js           ← Entry point (don't touch)
│   ├── db/index.js         ← PostgreSQL pool (don't touch)
│   ├── routes/
│   │   ├── index.js        ← REGISTER YOUR ROUTE HERE (one line)
│   │   ├── merchandiseInvoiceRoute.js   ← reference example
│   │   └── subscriptionRoute.js         ← reference example
│   ├── controllers/
│   │   ├── merchandiseInvoiceController.js
│   │   └── subscriptionController.js
│   └── services/
│       ├── merchandiseInvoiceService.js
│       └── subscriptionService.js
│
└── client/
    └── src/
        ├── App.jsx              ← ADD YOUR ROUTES HERE
        ├── index.css            ← shared styles (don't touch)
        ├── components/
        │   ├── Sidebar.jsx           ← ADD YOUR LINK HERE
        │   ├── MemberSearchModal.jsx ← reusable, use it
        │   ├── PackageSearchModal.jsx
        │   └── ProductSearchModal.jsx
        ├── api/
        │   ├── axiosInstance.js        ← shared Axios (don't touch)
        │   ├── merchandiseInvoiceApi.js ← reference example
        │   └── subscriptionApi.js       ← reference example
        └── pages/
            ├── Merchandise/
            │   ├── MerchandiseList.jsx
            │   ├── MerchandiseForm.jsx
            │   └── MerchandiseView.jsx
            └── Subscription/
                ├── SubscriptionList.jsx
                ├── SubscriptionForm.jsx
                └── SubscriptionView.jsx
```

---

## 3. Module Assignment

| Module | Route prefix | ID format | Person |
|---|---|---|---|
| Merchandise Sales ✅ | `/merchandise` | `INV-YYYY-NNNNNN` | Done |
| Subscriptions ✅ | `/subscriptions` | `SUB-YYYY-NNNNNN` | Done |
| Training Bookings | `/training-bookings` | `BK-YYYY-NNNNNN` | Your name |
| Payment Receipts | `/payment-receipts` | `RCP-YYYY-NNNNNN` | Your name |
| Expense Vouchers | `/expenses` | `EXP-YYYY-NNNNNN` | Your name |
| Equipment Purchase | `/equipment` | `EPO-YYYY-NNNNNN` | Your name |

---

## 4. Every Module Has Exactly These Files

### Backend (3 files)
```
server/services/{module}Service.js        ← DB queries + business logic
server/controllers/{module}Controller.js  ← req/res handling, calls service
server/routes/{module}Route.js            ← Express router
```

### Frontend (4 files)
```
client/src/api/{module}Api.js
client/src/pages/{Module}/{Module}List.jsx   ← table + filters + pagination
client/src/pages/{Module}/{Module}Form.jsx   ← create + edit (detected by URL param)
client/src/pages/{Module}/{Module}View.jsx   ← read-only view + print
```

### Plus register in (2 shared files — one line each)
```
server/routes/index.js      ← router.use('/your-path', require('./yourRoute'))
client/src/App.jsx          ← 4 Route entries
client/src/components/Sidebar.jsx ← 1 NavLink entry
```

---

## 5. Step-by-Step: How to Build Your Module

Follow this exact order. Don't skip steps.

### Step 1 — Service file
Copy `subscriptionService.js` as your starting point. Change:
- `generateXxxId()` — prefix string (e.g. `BK-`, `RCP-`, `EXP-`)
- Table names in all queries
- Column names to match your schema
- Business logic (e.g. session cost calculation, stock checks)

### Step 2 — Controller file
Copy `subscriptionController.js`. Change:
- Import your service instead
- Validation checks to match your required fields
- Export function names

### Step 3 — Route file
Copy `subscriptionRoute.js`. Change:
- Import your controller
- Add/remove routes as needed (e.g. lookup endpoints for dropdowns)

### Step 4 — Register route
Open `server/routes/index.js`, add one line:
```js
router.use('/your-path', require('./yourRoute'));
```

### Step 5 — API file
Copy `subscriptionApi.js`. Change function names and paths to match your module.

### Step 6 — List page
Copy `SubscriptionList.jsx`. Change:
- Import your API functions
- Column headers and `td` content to match your data
- Filter fields (search placeholder, date fields, status filter if needed)
- Navigation paths (`/your-path`, `/your-path/new`, `/your-path/:id/edit`)

### Step 7 — Form page
Copy `SubscriptionForm.jsx`. This is the most work. Change:
- Header fields (your table's columns)
- Line items table columns
- Which modals to use (Member, Package, Product — or none)
- Validation rules
- Payload shape sent to backend

### Step 8 — View page
Copy `SubscriptionView.jsx`. Change:
- Which fields show in the invoice paper layout
- Line items table columns

### Step 9 — Register in App.jsx
Add 4 routes:
```jsx
import YourList from './pages/YourModule/YourList';
import YourForm from './pages/YourModule/YourForm';
import YourView from './pages/YourModule/YourView';

<Route path="/your-path"           element={<Layout><YourList /></Layout>} />
<Route path="/your-path/new"       element={<Layout><YourForm /></Layout>} />
<Route path="/your-path/:id"       element={<Layout><YourView /></Layout>} />
<Route path="/your-path/:id/edit"  element={<Layout><YourForm /></Layout>} />
```

### Step 10 — Register in Sidebar.jsx
Add one link inside the `NAV` array:
```js
{ to: '/your-path', label: 'Your Module Name' },
```

---

## 6. API Response Shape

Every endpoint always returns one of these two shapes. Never break this convention.

```json
{ "success": true, "data": { ... } }
{ "success": false, "message": "Error description" }
```

---

## 7. Auto-Generated ID Pattern

Every header table uses `PREFIX-YYYY-NNNNNN` where NNNNNN resets each year.

Copy this function from any service and change the prefix and table name:

```js
async function generateYourId(client) {
  const year = new Date().getFullYear();
  const prefix = `BK-${year}-`;                          // ← change prefix
  const result = await client.query(
    `SELECT id FROM training_booking                      -- ← change table
     WHERE id LIKE $1 ORDER BY id DESC LIMIT 1`,
    [`${prefix}%`]
  );
  let nextNum = 1;
  if (result.rows.length > 0) {
    const lastNum = parseInt(result.rows[0].id.split('-')[2], 10);
    nextNum = lastNum + 1;
  }
  return `${prefix}${String(nextNum).padStart(6, '0')}`;
}
```

---

## 8. DB Transactions — Always Use for Write Operations

All create/update/delete must use a transaction. Copy this pattern exactly:

```js
async function createSomething(data) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // ... your inserts/updates here ...

    await client.query('COMMIT');
    return await getSomethingById(newId);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();   // ← ALWAYS release, even on error
  }
}
```

---

## 9. Reusable Modals (already built — just import)

| Modal | File | Props |
|---|---|---|
| Member search | `MemberSearchModal.jsx` | `onSelect(member)`, `onClose()` |
| Product search | `ProductSearchModal.jsx` | `products[]`, `onSelect(product)`, `onClose()` |
| Package search | `PackageSearchModal.jsx` | `packages[]`, `onSelect(pkg)`, `onClose()` |

Usage pattern (same for all modals):
```jsx
import MemberSearchModal from '../../components/MemberSearchModal';

// In state:
const [showMemberModal, setShowMemberModal] = useState(false);

// In JSX:
{showMemberModal && (
  <MemberSearchModal
    onSelect={(member) => {
      setMemberId(String(member.id));
      setMemberName(member.member_name);
      setShowMemberModal(false);
    }}
    onClose={() => setShowMemberModal(false)}
  />
)}

// Trigger button:
<button onClick={() => setShowMemberModal(true)}>🔍</button>
```

To add a **new modal** for your own LOV (e.g. Trainer, Staff):
Copy `ProductSearchModal.jsx`, change the column headers and row content, pass your data as a prop.

---

## 10. CSS Classes Reference

All styling uses class names from `index.css`. Never write inline styles for layout — use these:

| Class | Use for |
|---|---|
| `page-title` | Main page heading |
| `page-subtitle` | Sub-text under heading |
| `page-header` | Flex row: title left, button right |
| `card` | White rounded card container |
| `card-body` | Padding inside card |
| `form-label` | Field label |
| `form-input` | Any input/select |
| `form-input readonly` | Read-only grey input |
| `form-input autofill` | Auto-filled yellow-green input |
| `form-input computed` | Computed right-aligned grey input |
| `form-input error` | Red border on validation fail |
| `form-error` | Red error text below input |
| `form-grid-2` | 2-column grid for header fields |
| `form-section-title` | Section label above fields |
| `divider` | Horizontal line |
| `btn btn-primary` | Green action button |
| `btn btn-secondary` | White/grey secondary button |
| `btn btn-danger` | Red danger button |
| `table-wrapper` | Scrollable table container |
| `line-table` | Line items table inside form |
| `action-btn edit` | Green text Edit button in table |
| `action-btn delete` | Red text Delete button in table |
| `badge badge-green` | Green pill badge |
| `badge badge-gray` | Grey pill badge |
| `filter-bar` | Flex row of filter inputs |
| `pagination` | Pagination footer row |
| `page-btn` | Individual page number button |
| `page-btn active` | Current page button |
| `state-box` | Centered loading/empty/error box |
| `total-block` | Right-aligned total container |
| `total-inner` | Green total amount box |
| `total-label` | "Total Amount" label |
| `total-value` | Big green amount number |
| `modal-overlay` | Full-screen modal backdrop |
| `modal` | Modal card |
| `modal-header` | Modal title + close button row |
| `modal-title` | Modal heading text |
| `modal-close` | ✕ close button |
| `modal-search` | Search input area in modal |
| `modal-body` | Scrollable list in modal |
| `modal-row` | Clickable row in modal list |
| `modal-row-id` | Small grey ID in modal row |
| `modal-empty` | Empty/loading state in modal |
| `invoice-paper` | White document container (view page) |
| `invoice-top` | Logo + meta header row |
| `invoice-brand` | Logo + company name |
| `invoice-id` | Big green document number |
| `invoice-table` | Line items table on view page |
| `invoice-total-row` | Right-aligned total on view page |
| `invoice-total-box` | Green total box on view page |
| `invoice-footer` | Footer text on view page |
| `view-header-bar` | Back/Edit/Print button row |
| `view-actions` | Button group in view header |

---

## 11. Navigation Flow (important — follow this)

```
List page
  ↓ click "+ New"
Form page (create mode — no :id in URL)
  ↓ save
View page (read-only)
  ↓ click "Edit"
Form page (edit mode — :id in URL)
  ↓ save
View page
  ↓ click "← Back"
List page
```

**How form detects create vs edit mode:**
```js
const { id } = useParams();
const isEdit = Boolean(id);
```

**After save, always navigate to view:**
```js
if (isEdit) {
  await updateSomething(id, payload);
  navigate(`/your-path/${id}`);
} else {
  const res = await createSomething(payload);
  navigate(`/your-path/${res.data.id}`);  // ← use the returned ID
}
```

---

## 12. Common Mistakes to Avoid

| Mistake | Fix |
|---|---|
| Forgetting `client.release()` | Always put it in `finally {}` |
| `DECIMAL` from pg comes back as string `"5.00"` | Always `parseFloat()` before arithmetic |
| Sequence out of sync after manual DB inserts | Run `SELECT setval(pg_get_serial_sequence('table','id'), (SELECT MAX(id) FROM table))` in Adminer |
| Vite env variable not updating | Rebuild with `docker-compose up --build` |
| Route conflict (`:id` catches `/new`) | Always register `/new` route BEFORE `/:id` in App.jsx |
| Modal closes on row click but data doesn't fill | Check that `onSelect` is called before `onClose` |
| `FOR UPDATE` missing on stock/quantity check | Use `SELECT ... FOR UPDATE` to prevent race conditions |

---

## 13. Running the Project

```bash
# First time or after changing package.json
docker-compose up --build

# Daily use
docker-compose up -d       # start in background
docker-compose down        # stop, keep DB data
docker-compose down -v     # stop + wipe DB

# If node_modules error
rm -rf server/node_modules client/node_modules
docker-compose up --build

# Restart only backend (after backend-only changes)
docker-compose restart backend
```

**URLs:**
- App: `http://localhost:5173`
- Adminer (DB viewer): `http://localhost:8081`
- Backend API: `http://localhost:5000/api`

---

## 14. Giving Context to Your Claude

When you start a new Claude conversation to build your module, paste this prompt:

```
I'm building a module for a Gym Management System called GymBro.
The project uses: Node.js + Express + PostgreSQL (pg) backend,
React + Vite + React Router v6 frontend, custom CSS with CSS variables.

The project already has two working modules (Merchandise and Subscriptions)
that I'll share as reference. I need you to build [YOUR MODULE NAME].

Here is the database schema for my tables:
[PASTE YOUR CREATE TABLE SQL HERE]

Here is the UI mockup description:
[DESCRIBE YOUR FORM OR PASTE MOCKUP DETAILS]

Rules to follow:
- Backend: service / controller / route pattern
- Always use DB transactions for writes (BEGIN/COMMIT/ROLLBACK + client.release() in finally)
- ID format: PREFIX-YYYY-NNNNNN resetting each year
- API response shape: { success, data } or { success, message }
- Frontend: List + Form + View pages, same CSS classes as existing modules
- Form detects create vs edit via useParams() id
- After save: navigate to view page, not list page
- End date auto-calculates from start date + duration (never manually editable)
- parseFloat() all DECIMAL values from pg before arithmetic

Please ask me any questions before starting.
```

---

## 15. Database Quick Reference

**Connection** — configured in `server/db/index.js`, uses `.env` vars:
```
DB_HOST=db   DB_USER=gymbro_admin   DB_PASSWORD=1111   DB_NAME=gymbro_db
```

**Adminer** — `http://localhost:8081`
- System: PostgreSQL
- Server: db
- Username: gymbro_admin
- Password: 1111
- Database: gymbro_db

**Fix sequence after manual inserts:**
```sql
SELECT setval(
  pg_get_serial_sequence('your_table', 'id'),
  (SELECT MAX(id) FROM your_table)
);
```

---

## 16. Module-Specific Notes

### Training Bookings
- Header: `training_booking` — member 🔍, trainer 🔍 (new TrainerSearchModal needed)
- Lines: `training_session` — training type LOV, start/end time, duration auto-calc in minutes
- `duration_minutes = (end_time - start_time) in minutes`
- `session_cost = (duration_minutes / 60) * hourly_rate`
- Total field: `total_session_cost`

### Payment Receipts
- Header: `payment_receipt` — member 🔍, payment method dropdown (from `payment_method` table)
- Lines: `receipt_line_item` — reference_type enum (`SUBSCRIPTION`,`TRAINING`,`CLASS`,`MERCHANDISE`), reference_no text, amount_paid, remaining_balance, notes
- No computed price — user enters amount directly
- Total field: `total_paid`

### Expense Vouchers
- Header: `expense_voucher` — vendor_name text, staff dropdown 🔍 (new StaffSearchModal needed), payment method dropdown
- Lines: `expense_line_item` — expense_category dropdown (from `expense_category` table), amount, description
- Total field: `total_expense`

### Equipment Purchase
- Header: `equipment_purchase` — supplier_name text, staff dropdown 🔍, payment method dropdown
- Lines: `equipment_purchase_item` — equipment_name text, category dropdown (from `equipment_category` table), quantity, unit_cost, warranty_months, extended_cost
- `extended_cost = quantity * unit_cost` (no discount)
- Total field: `total_purchase_cost`
