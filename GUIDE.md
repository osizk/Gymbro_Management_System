# GymBro Management System - Developer Guide

This guide documents the current GymBro project as it exists in this repository.
It is meant for teammates who need to run, understand, debug, or extend the
system.

GymBro is a full-stack gym management application with a React/Vite frontend,
an Express backend, and a PostgreSQL database. The app is organized around two
kinds of screens:

- Line-item modules, where one header record owns multiple detail lines.
- Simple form modules, where one screen manages one table-like resource.

The codebase already contains the main modules. When adding or fixing features,
follow the patterns already used in the matching module type.

---

## 1. Tech Stack

Backend:

- Node.js
- Express 5
- PostgreSQL through `pg`
- CommonJS modules
- `dotenv` for local environment values

Frontend:

- React 19
- Vite
- React Router
- Axios
- Shared custom CSS in `client/src/index.css`

Infrastructure:

- Docker Compose
- PostgreSQL 15
- Adminer for database inspection

---

## 2. Project Structure

```text
Gymbro_Management_System/
├── docker-compose.yml
├── README.md
├── GUIDE.md
├── database/
│   ├── 01_init.sql
│   ├── 02_seed.sql
│   └── csv/
├── server/
│   ├── app.js
│   ├── server.js
│   ├── db/
│   │   └── index.js
│   ├── routes/
│   ├── controllers/
│   └── services/
└── client/
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        ├── api/
        ├── components/
        ├── contexts/
        ├── hooks/
        ├── pages/
        └── utils/
```

Important files:

- `docker-compose.yml` starts database, Adminer, backend, and frontend.
- `database/01_init.sql` defines enums, tables, keys, and relationships.
- `database/02_seed.sql` imports seed data from `database/csv`.
- `server/app.js` creates the Express app, middleware, route mount, 404 handler,
  and global error handler.
- `server/routes/index.js` mounts every backend module under `/api`.
- `server/db/index.js` creates the PostgreSQL connection pool.
- `client/src/App.jsx` defines all frontend routes and wraps pages in the shared
  layout.
- `client/src/components/Sidebar.jsx` defines the navigation groups.
- `client/src/api/axiosInstance.js` creates the shared Axios client with
  `baseURL: '/api'`.
- `client/src/index.css` contains the design system classes used by the pages.

---

## 3. Running The Project

First-time start or rebuild:

```bash
docker-compose up --build
```

Daily start:

```bash
docker-compose up -d
```

Stop containers but keep database volume:

```bash
docker-compose down
```

Stop containers and delete database volume:

```bash
docker-compose down -v
```

URLs:

- Frontend: `http://localhost:5173`
- Backend base: `http://localhost:5000/api`
- Adminer: `http://localhost:8081`
- PostgreSQL host port: `5432`

Adminer login:

- System: `PostgreSQL`
- Server: `db`
- Username: `gymbro_admin`
- Password: `1111`
- Database: `gymbro_db`

Docker service names matter inside containers. The frontend Vite proxy sends
`/api` requests to `http://backend:5000`, and the backend connects to database
host `db`.

---

## 4. Docker And Environment

`docker-compose.yml` defines four services:

- `db`: PostgreSQL 15 with database `gymbro_db`.
- `adminer`: database browser on port `8081`.
- `backend`: builds `server/`, exposes port `5000`, mounts local server files.
- `frontend`: builds `client/`, exposes port `5173`, mounts local client files.

Backend environment values are provided directly in Compose:

```text
DB_HOST=db
DB_USER=gymbro_admin
DB_PASSWORD=1111
DB_NAME=gymbro_db
PORT=5000
```

The backend Dockerfile starts the server with:

```bash
node server.js
```

The frontend Dockerfile starts Vite with:

```bash
npm run dev -- --host
```

---

## 5. Database Overview

`database/01_init.sql` creates enum types first, then simple form tables, then
line-item tables.

Enums:

- `gender_type`: `MALE`, `FEMALE`, `OTHER`
- `member_status_type`: `ACTIVE`, `EXPIRED`, `CANCELLED`
- `booking_status_type`: `BOOKED`, `CANCELLED`, `ATTENDED`
- `equipment_status_type`: `ACTIVE`, `UNDER_MAINTENANCE`, `RETIRED`
- `ticket_status_type`: `PENDING`, `IN_PROGRESS`, `DONE`
- `product_status_type`: `ACTIVE`, `INACTIVE`, `OUT_OF_STOCK`
- `subscription_status_type`: `ACTIVE`, `EXPIRED`, `CANCELLED`
- `reference_type`: `SUBSCRIPTION`, `TRAINING`, `CLASS`, `MERCHANDISE`

Simple form tables:

- `member`
- `trainer`
- `package`
- `training_type`
- `class`
- `class_booking`
- `equipment_category`
- `equipment`
- `staff`
- `maintenance_ticket`
- `expense_category`
- `payment_method`
- `product_category`
- `product`

Line-item modules:

- `subscription` with `subscription_line_item`
- `training_booking` with `training_session`
- `payment_receipt` with `receipt_line_item`
- `expense_voucher` with `expense_line_item`
- `merchandise_invoice` with `merchandise_line_item`
- `equipment_purchase` with `equipment_purchase_item`

Seed data:

- `database/02_seed.sql` imports CSV files from `database/csv`.
- The database scripts run automatically only when the PostgreSQL volume is first
  created.
- If you change init or seed SQL after the database already exists, run
  `docker-compose down -v` and then rebuild/start again.

---

## 6. Backend Architecture

The backend request path is:

```text
server.js -> app.js -> routes/index.js -> route file -> controller -> service -> db
```

`server/app.js`:

- Enables CORS.
- Parses JSON bodies.
- Mounts all routes under `/api`.
- Returns JSON 404 responses.
- Uses a global error handler for uncaught server errors.

`server/db/index.js`:

- Creates one shared PostgreSQL pool.
- Reads DB settings from environment variables with local defaults.

Every normal module follows this shape:

```text
server/routes/exampleRoute.js
server/controllers/exampleController.js
server/services/exampleService.js
```

Routes should stay thin. Controllers validate request bodies and format
responses. Services own SQL queries, transactions, calculations, ID generation,
and lookup queries.

Standard response shapes:

```json
{ "success": true, "data": {} }
{ "success": true, "message": "Deleted" }
{ "success": false, "message": "Something went wrong" }
```

---

## 7. Backend Route Map

All paths below are mounted under `/api`.

Line-item modules:

| Frontend area | Backend base | Main endpoints |
| --- | --- | --- |
| Merchandise Sales | `/merchandise` | `/invoices`, `/invoices/:id`, `/products/active`, `/members/active`, `/members/:id` |
| Subscriptions | `/subscriptions` | `/`, `/:id`, `/packages` |
| Expense Vouchers | `/expenses` | `/vouchers`, `/vouchers/:id`, `/categories`, `/staff`, `/payment-methods` |
| Training Bookings | `/training-bookings` | `/`, `/:id`, `/trainers`, `/training-types`, `/members` |
| Payment Receipts | `/payment-receipts` | `/`, `/:id`, `/payment-methods` |
| Equipment Purchase | `/equipment` | `/`, `/:id`, `/staff`, `/payment-methods`, `/equipment-categories` |

Simple form modules:

| Resource | Backend base | Notes |
| --- | --- | --- |
| Members | `/members` | CRUD |
| Trainers | `/trainers` | CRUD |
| Staff | `/staff` | CRUD |
| Packages | `/packages` | CRUD |
| Training Types | `/training-types` | CRUD |
| Classes | `/classes` | CRUD |
| Class Bookings | `/class-bookings` | CRUD plus `/classes` and `/members` lookups |
| Products | `/products` | CRUD plus `/categories` lookup |
| Equipment Items | `/equipment-items` | CRUD plus `/categories` lookup |
| Maintenance Tickets | `/maintenance-tickets` | CRUD plus `/equipment` and `/staff` lookups |
| Expense Categories | `/expense-categories` | CRUD |
| Payment Methods | `/payment-methods` | CRUD |
| Equipment Categories | `/equipment-categories` | CRUD |
| Product Categories | `/product-categories` | CRUD |

---

## 8. Line-Item Module Rules

Line-item modules have a header record and child line records. Create and update
operations should use transactions because several rows must change together.

Common service pattern:

```js
const client = await pool.connect();
try {
  await client.query('BEGIN');
  // insert/update/delete header and lines
  await client.query('COMMIT');
} catch (err) {
  await client.query('ROLLBACK');
  throw err;
} finally {
  client.release();
}
```

Current ID prefixes:

| Module | Header table | Prefix |
| --- | --- | --- |
| Merchandise Sales | `merchandise_invoice` | `INV-YYYY-NNNNNN` |
| Subscriptions | `subscription` | `SUB-YYYY-NNNNNN` |
| Expense Vouchers | `expense_voucher` | `EXP-YYYY-NNNNNN` |
| Training Bookings | `training_booking` | `BK-YYYY-NNNNNN` |
| Payment Receipts | `payment_receipt` | `RCP-YYYY-NNNNNN` |
| Equipment Purchase | `equipment_purchase` | `EPO-YYYY-NNNNNN` |
| Maintenance Tickets | `maintenance_ticket` | `MNT-YYYY-NNNNNN` |

Important module behavior:

- Subscriptions calculate `extended_price = base_price * (1 - discount_pct / 100)`
  and sum line totals into `subscription.total_amount`.
- Merchandise sales calculate line extended prices, deduct product stock on
  create/update, restore stock on update/delete, and use `SELECT ... FOR UPDATE`
  when checking product stock.
- Training bookings calculate `duration_minutes` from start/end time and
  `session_cost = duration_minutes / 60 * hourly_rate`.
- Payment receipts sum `amount_paid` into `payment_receipt.total_paid`.
- Expense vouchers sum line `amount` into `expense_voucher.total_expense`.
- Equipment purchases calculate `extended_cost = quantity * unit_cost` and sum
  it into `equipment_purchase.total_purchase_cost`.

Most update flows replace all old line items with the new submitted line item
array. Preserve that approach unless you intentionally redesign the module.

---

## 9. Frontend Architecture

The frontend starts in `client/src/main.jsx`, which renders `App`.

`client/src/App.jsx`:

- Wraps the app in `ToastProvider`.
- Uses `BrowserRouter`.
- Renders the global `Toast`.
- Defines a `Layout` with `Sidebar` and the page content.
- Redirects `/` to `/subscriptions`.
- Defines list, new, view, and edit routes for every resource.

Frontend module shape:

```text
client/src/api/exampleApi.js
client/src/pages/Example/ExampleList.jsx
client/src/pages/Example/ExampleForm.jsx
client/src/pages/Example/ExampleView.jsx
```

List pages usually include:

- Data loading with `useEffect`.
- Search filters.
- Optional status/date filters.
- Client-side sorting.
- Pagination with page size options `10`, `25`, `50`.
- Row actions for view, edit, and delete.

Form pages usually include:

- Create/edit detection with `useParams`.
- Loading existing data in edit mode.
- Validation before submit.
- Controlled inputs.
- Lookup dropdowns or search modals.
- Navigation to the view page after save.

View pages usually include:

- Read-only display.
- Back, edit, and print actions.
- Invoice-style layout for line-item documents.

---

## 10. Frontend Route Map

Main line-item pages:

| Module | List | New | View | Edit |
| --- | --- | --- | --- | --- |
| Merchandise | `/merchandise` | `/merchandise/new` | `/merchandise/:id` | `/merchandise/:id/edit` |
| Subscriptions | `/subscriptions` | `/subscriptions/new` | `/subscriptions/:id` | `/subscriptions/:id/edit` |
| Expenses | `/expenses` | `/expenses/new` | `/expenses/:id` | `/expenses/:id/edit` |
| Training Bookings | `/training-bookings` | `/training-bookings/new` | `/training-bookings/:id` | `/training-bookings/:id/edit` |
| Payment Receipts | `/payment-receipts` | `/payment-receipts/new` | `/payment-receipts/:id` | `/payment-receipts/:id/edit` |
| Equipment Purchase | `/equipment` | `/equipment/new` | `/equipment/:id` | `/equipment/:id/edit` |

Simple form pages:

- `/members`
- `/trainers`
- `/staff`
- `/packages`
- `/training-types`
- `/classes`
- `/class-bookings`
- `/products`
- `/equipment-items`
- `/maintenance-tickets`
- `/expense-categories`
- `/payment-methods`
- `/equipment-categories`
- `/product-categories`

Each simple form module also has `/new`, `/:id`, and `/:id/edit`.

---

## 11. API Client Files

Shared client:

- `client/src/api/axiosInstance.js` sets `baseURL: '/api'`.
- Vite proxies `/api` to the backend container in development.

Line-item API files:

- `subscriptionApi.js`
- `merchandiseInvoiceApi.js`
- `expenseVoucherApi.js`
- `trainingBookingApi.js`
- `paymentReceiptApi.js`
- `equipmentPurchaseApi.js`

Simple form API file:

- `simpleFormsApi.js`

Note: Some API files return `res.data` directly, while others return the Axios
promise. Check the file before consuming it in a page. Existing pages already
handle their module's chosen style.

---

## 12. Shared Frontend Components

Navigation and layout:

- `Sidebar.jsx` groups links into `Lineitem Form` and `Simple Form Group`.

Search modals:

- `MemberSearchModal.jsx` loads active members from `/api/merchandise/members/active`.
- `ProductSearchModal.jsx` receives product data as props.
- `PackageSearchModal.jsx` receives package data as props.
- `TrainerSearchModal.jsx` is used by training booking flows.
- `StaffSearchModal.jsx` is used by staff lookup flows.

Toast system:

- `contexts/ToastContext.jsx` stores toast state and exposes `showToast`.
- `hooks/useToast.js` reads the toast context.
- `components/Toast.jsx` displays success, error, and info messages.

Utility:

- `utils/sortUtils.js` contains `compareSortValues`, which handles strings,
  numbers, and date-like values for table sorting.

---

## 13. Styling Guide

Use `client/src/index.css` classes instead of creating one-off inline styles.
The app uses a white/green/gray design language with the `DM Sans` and `Syne`
fonts.

Common layout classes:

- `app-layout`
- `sidebar`
- `main-content`
- `page-header`
- `page-title`
- `page-subtitle`
- `card`
- `card-body`

Common form classes:

- `form-label`
- `form-input`
- `form-input readonly`
- `form-input autofill`
- `form-input computed`
- `form-input error`
- `form-error`
- `form-grid-2`
- `form-section-title`
- `divider`

Common table and list classes:

- `table-wrapper`
- `line-table`
- `filter-bar`
- `pagination`
- `pagination-pages`
- `page-btn`
- `page-btn active`
- `state-box`
- `action-btn edit`
- `action-btn delete`

Common document/view classes:

- `view-header-bar`
- `view-actions`
- `invoice-paper`
- `invoice-top`
- `invoice-brand`
- `invoice-id`
- `invoice-parties`
- `invoice-table`
- `invoice-total-row`
- `invoice-total-box`
- `invoice-footer`

Common modal classes:

- `modal-overlay`
- `modal`
- `modal-header`
- `modal-title`
- `modal-close`
- `modal-search`
- `modal-body`
- `modal-row`
- `modal-row-id`
- `modal-empty`

Print styles already hide the sidebar and view header bar.

---

## 14. How To Add A New Module

Use the closest existing module as your template.

For a line-item module:

1. Create a service in `server/services`.
2. Create a controller in `server/controllers`.
3. Create a route file in `server/routes`.
4. Register the route in `server/routes/index.js`.
5. Create an API file in `client/src/api`.
6. Create list, form, and view pages in `client/src/pages`.
7. Add imports and routes in `client/src/App.jsx`.
8. Add the link to `client/src/components/Sidebar.jsx`.
9. Add or reuse lookup modals if needed.

For a simple form module:

1. Copy the closest simple service/controller/route.
2. Match table columns and validation rules.
3. Add API functions to `simpleFormsApi.js` or a new API file.
4. Copy a simple `List`, `Form`, and `View` page.
5. Register frontend routes and sidebar navigation.

When registering routes, place fixed lookup routes before `/:id` routes so
`/:id` does not catch paths like `/categories` or `/new`.

---

## 15. Development Rules

Backend:

- Keep SQL and calculations in services.
- Keep request validation and response formatting in controllers.
- Use transactions for multi-row writes.
- Always release transaction clients in `finally`.
- Use parameterized SQL queries.
- Return `404` when a requested record does not exist.
- Return `400` for missing required request fields.
- Return `422` for business-rule failures like insufficient stock when useful.

Frontend:

- Keep pages consistent with existing list/form/view patterns.
- Navigate to the view page after successful create or update.
- Use `useParams()` to detect edit mode.
- Use shared API helper functions.
- Use the shared CSS classes from `index.css`.
- Use `showToast` for user-facing success and error feedback where the existing
  page pattern does.

Data handling:

- PostgreSQL `DECIMAL` values often arrive as strings. Convert with `Number()` or
  `parseFloat()` before calculations.
- Date fields are stored as SQL `DATE`; pages usually display them with
  `toLocaleDateString`.
- Time fields may arrive as `HH:mm:ss`; UI often displays `String(value).slice(0, 5)`.

---

## 16. Common Troubleshooting

Database changes not showing:

```bash
docker-compose down -v
docker-compose up --build
```

Backend cannot connect to database:

- Check that the backend is using `DB_HOST=db` inside Docker.
- Check that the `db` service is healthy/running.
- Recreate the database volume if schema or seed scripts changed.

Frontend API calls fail:

- Check that requests use `/api`.
- Check `client/vite.config.js`; `/api` should proxy to `http://backend:5000`.
- Check that backend routes are mounted in `server/routes/index.js`.

Duplicate key after manual CSV or Adminer inserts:

```sql
SELECT setval(
  pg_get_serial_sequence('your_table', 'id'),
  COALESCE((SELECT MAX(id) FROM your_table), 1)
);
```

Tables with manual integer IDs, such as some line-item tables, may not use a
PostgreSQL sequence. Their services calculate the next ID using `MAX(id)`.

Stock numbers look wrong:

- Merchandise invoice create deducts product stock.
- Merchandise invoice update restores old stock first, then deducts new stock.
- Merchandise invoice delete restores stock.
- If data was edited manually in the database, product stock may need manual
  correction.

---

## 17. Quick Mental Model

Think of GymBro as three layers:

1. Database tables define the domain: members, staff, products, classes,
   equipment, payments, expenses, subscriptions, bookings, and purchases.
2. Backend services enforce the business rules: generated document IDs,
   transaction safety, totals, stock movement, and lookup data.
3. Frontend pages expose a consistent workflow: list records, create/edit forms,
   read-only views, search modals, pagination, sorting, and printable documents.

When changing the project, start from the database shape, follow the matching
service pattern, then wire the frontend route/API/page in the same style as the
nearest existing module.
