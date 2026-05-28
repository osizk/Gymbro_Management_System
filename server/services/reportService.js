const pool = require('../db');

const reportGroups = [
  {
    id: '7-1-nattakit',
    groupName: 'Nattakit',
    memberId: '67070503413',
    reports: [
      {
        id: 'membership-subscriptions-list',
        section: '7.1.1',
        title: 'List All Membership Subscriptions',
        analysis: false,
        filters: [
          { name: 'from_date', label: 'From Date', type: 'date', defaultValue: '2026-01-01' },
          { name: 'to_date', label: 'To Date', type: 'date', defaultValue: '2026-03-24' },
          { name: 'status', label: 'Status', type: 'select', defaultValue: 'ALL', options: ['ALL', 'ACTIVE', 'EXPIRED', 'CANCELLED'] },
        ],
      },
      {
        id: 'membership-subscription-print',
        section: '7.1.2',
        title: 'Print Membership Subscription',
        analysis: false,
        filters: [
          { name: 'subscription_no', label: 'Subscription No', type: 'text', defaultValue: 'SUB-2026-000003' },
        ],
      },
      {
        id: 'revenue-by-package',
        section: '7.1.3',
        title: 'Revenue by Package',
        analysis: true,
        filters: [
          { name: 'from_date', label: 'From Date', type: 'date', defaultValue: '2026-01-01' },
          { name: 'to_date', label: 'To Date', type: 'date', defaultValue: '2026-03-24' },
        ],
      },
    ],
  },
  {
    id: '7-2-phittayanan',
    groupName: 'Phittayanan',
    memberId: '67070503428',
    reports: [
      {
        id: 'training-bookings-list',
        section: '7.2.1',
        title: 'List All Personal Training Bookings',
        analysis: false,
        filters: [
          { name: 'from_date', label: 'From Date', type: 'date', defaultValue: '2026-01-01' },
          { name: 'to_date', label: 'To Date', type: 'date', defaultValue: '2026-01-24' },
          { name: 'trainer_id', label: 'Trainer', type: 'select', defaultValue: '0', lookup: 'trainers' },
        ],
      },
      {
        id: 'training-booking-print',
        section: '7.2.2',
        title: 'Print Personal Training Booking (Detail)',
        analysis: false,
        filters: [
          { name: 'booking_no', label: 'Booking No', type: 'text', defaultValue: 'BK-2026-000003' },
        ],
      },
      {
        id: 'revenue-by-trainer',
        section: '7.2.3',
        title: 'Revenue by Trainer with Commission',
        analysis: true,
        filters: [
          { name: 'from_date', label: 'From Date', type: 'date', defaultValue: '2026-01-01' },
          { name: 'to_date', label: 'To Date', type: 'date', defaultValue: '2026-03-24' },
        ],
      },
    ],
  },
  {
    id: '7-3-ashira',
    groupName: 'Ashira',
    memberId: '67070503445',
    reports: [
      {
        id: 'merchandise-invoices-list',
        section: '7.3.1',
        title: 'List All Merchandise Sales Invoices',
        analysis: false,
        filters: [
          { name: 'from_date', label: 'From Date', type: 'date', defaultValue: '2026-01-01' },
          { name: 'to_date', label: 'To Date', type: 'date', defaultValue: '2026-03-24' },
          { name: 'product_id', label: 'Product', type: 'select', defaultValue: '0', lookup: 'products' },
        ],
      },
      {
        id: 'merchandise-invoice-print',
        section: '7.3.2',
        title: 'Print Merchandise Sales Invoice (Detail)',
        analysis: false,
        filters: [
          { name: 'invoice_no', label: 'Invoice No', type: 'text', defaultValue: 'INV-2026-000001' },
        ],
      },
      {
        id: 'revenue-by-product',
        section: '7.3.3',
        title: 'Revenue by Product',
        analysis: true,
        filters: [
          { name: 'from_date', label: 'From Date', type: 'date', defaultValue: '2026-01-01' },
          { name: 'to_date', label: 'To Date', type: 'date', defaultValue: '2026-03-24' },
        ],
      },
    ],
  },
  {
    id: '7-4-chanaphath',
    groupName: 'Chanaphath',
    memberId: '67070503462',
    reports: [
      {
        id: 'payment-receipts-list',
        section: '7.4.1',
        title: 'List All Payment Receipts',
        analysis: false,
        filters: [
          { name: 'from_date', label: 'From Date', type: 'date', defaultValue: '2026-01-01' },
          { name: 'to_date', label: 'To Date', type: 'date', defaultValue: '2026-03-24' },
          { name: 'method_id', label: 'Payment Method', type: 'select', defaultValue: '0', lookup: 'paymentMethods' },
        ],
      },
      {
        id: 'payment-receipt-detail',
        section: '7.4.2',
        title: 'Receipt Details with Line References',
        analysis: false,
        filters: [
          { name: 'receipt_no', label: 'Receipt No', type: 'text', defaultValue: 'RCP-2026-000001' },
        ],
      },
      {
        id: 'payments-by-method',
        section: '7.4.3',
        title: 'Payments by Method',
        analysis: true,
        filters: [
          { name: 'from_date', label: 'From Date', type: 'date', defaultValue: '2026-01-01' },
          { name: 'to_date', label: 'To Date', type: 'date', defaultValue: '2026-03-24' },
        ],
      },
    ],
  },
  {
    id: '7-5-phuttipong',
    groupName: 'Phuttipong',
    memberId: '67070503430',
    reports: [
      {
        id: 'expense-vouchers-list',
        section: '7.5.1',
        title: 'List All Expense Vouchers',
        analysis: false,
        filters: [
          { name: 'from_date', label: 'From Date', type: 'date', defaultValue: '2026-01-01' },
          { name: 'to_date', label: 'To Date', type: 'date', defaultValue: '2026-03-24' },
          { name: 'category_id', label: 'Category', type: 'select', defaultValue: '0', lookup: 'expenseCategories' },
        ],
      },
      {
        id: 'expense-voucher-print',
        section: '7.5.2',
        title: 'Print Expense Voucher (Detail)',
        analysis: false,
        filters: [
          { name: 'voucher_no', label: 'Voucher No', type: 'text', defaultValue: 'EXP-2026-000004' },
        ],
      },
      {
        id: 'expense-by-category',
        section: '7.5.3',
        title: 'Expense by Category',
        analysis: true,
        filters: [
          { name: 'from_date', label: 'From Date', type: 'date', defaultValue: '2026-01-01' },
          { name: 'to_date', label: 'To Date', type: 'date', defaultValue: '2026-03-24' },
        ],
      },
    ],
  },
  {
    id: '7-6-bannasorn',
    groupName: 'Bannasorn',
    memberId: '67070503420',
    reports: [
      {
        id: 'active-subscriptions-as-of',
        section: '7.6.1',
        title: 'Active Subscriptions as of Date',
        analysis: false,
        filters: [
          { name: 'as_of_date', label: 'As of Date', type: 'date', defaultValue: '2026-03-21' },
        ],
      },
      {
        id: 'subscriptions-expiring-30-days',
        section: '7.6.2',
        title: 'Subscriptions Expiring in Next 30 Days',
        analysis: false,
        filters: [
          { name: 'as_of_date', label: 'As of Date', type: 'date', defaultValue: '2026-03-21' },
        ],
      },
      {
        id: 'monthly-business-performance',
        section: '7.6.3',
        title: 'Monthly Business Performance Summary',
        analysis: true,
        filters: [
          { name: 'from_date', label: 'From Date', type: 'date', defaultValue: '2026-01-15' },
          { name: 'to_date', label: 'To Date', type: 'date', defaultValue: '2026-03-03' },
        ],
      },
    ],
  },
];

function findReport(reportId) {
  for (const group of reportGroups) {
    const report = group.reports.find((item) => item.id === reportId);
    if (report) return { group, report };
  }
  return null;
}

function filtersFor(report, query) {
  const values = {};
  for (const filter of report.filters) {
    values[filter.name] = query[filter.name] || filter.defaultValue || '';
  }
  return values;
}

function moneySummary(rows, key) {
  return rows.reduce((sum, row) => sum + Number(row[key] || 0), 0);
}

async function optionsForLookup(lookup) {
  if (!lookup) return null;

  const lookupQueries = {
    trainers: {
      sql: `SELECT id::text AS value, trainer_name AS label FROM trainer ORDER BY trainer_name`,
      allLabel: 'All trainers',
    },
    products: {
      sql: `SELECT id::text AS value, product_name AS label FROM product ORDER BY product_name`,
      allLabel: 'All products',
    },
    paymentMethods: {
      sql: `SELECT id::text AS value, method_name AS label FROM payment_method ORDER BY method_name`,
      allLabel: 'All methods',
    },
    expenseCategories: {
      sql: `SELECT id::text AS value, category_name AS label FROM expense_category ORDER BY category_name`,
      allLabel: 'All categories',
    },
  };

  const config = lookupQueries[lookup];
  if (!config) return null;

  const result = await pool.query(config.sql);
  return [{ value: '0', label: config.allLabel }, ...result.rows];
}

async function hydrateFilterOptions(report) {
  const filters = [];
  for (const filter of report.filters) {
    if (filter.lookup) {
      filters.push({
        ...filter,
        options: await optionsForLookup(filter.lookup),
      });
    } else if (Array.isArray(filter.options)) {
      filters.push({
        ...filter,
        options: filter.options.map((option) => ({ value: option, label: option })),
      });
    } else {
      filters.push(filter);
    }
  }
  return filters;
}

async function getReportGroups() {
  return reportGroups;
}

async function getMembershipSubscriptionsList(f) {
  const result = await pool.query(
    `SELECT s.id AS subscription_no, s.subscription_date, m.id AS member_id,
            m.member_name, s.status, COUNT(sli.id)::INT AS package_count, s.total_amount
     FROM subscription s
     JOIN member m ON m.id = s.member_id
     LEFT JOIN subscription_line_item sli ON sli.subscription_id = s.id
     WHERE s.subscription_date BETWEEN $1::date AND $2::date
       AND ($3 = 'ALL' OR s.status::text = $3)
     GROUP BY s.id, s.subscription_date, m.id, m.member_name, s.status, s.total_amount
     ORDER BY s.subscription_date, s.id`,
    [f.from_date, f.to_date, f.status]
  );
  return {
    columns: [
      { key: 'subscription_no', label: 'Subscription No' },
      { key: 'subscription_date', label: 'Date', type: 'date' },
      { key: 'member_id', label: 'Member ID' },
      { key: 'member_name', label: 'Member Name' },
      { key: 'status', label: 'Status' },
      { key: 'package_count', label: 'Packages', align: 'right' },
      { key: 'total_amount', label: 'Total Amount', type: 'money', align: 'right' },
    ],
    rows: result.rows,
    summary: { recordCount: result.rows.length, totalAmount: moneySummary(result.rows, 'total_amount') },
  };
}

async function getMembershipSubscriptionPrint(f) {
  const result = await pool.query(
    `SELECT s.id AS subscription_no, s.subscription_date, m.id AS member_id,
            m.member_name, m.phone, s.status, sli.line_no, p.package_name,
            p.duration_months, sli.start_date, sli.end_date, sli.base_price,
            sli.discount_pct, sli.extended_price, s.total_amount
     FROM subscription s
     JOIN member m ON m.id = s.member_id
     JOIN subscription_line_item sli ON sli.subscription_id = s.id
     JOIN package p ON p.id = sli.package_id
     WHERE s.id = $1
     ORDER BY sli.line_no`,
    [f.subscription_no]
  );
  return {
    columns: [
      { key: 'line_no', label: '#' },
      { key: 'package_name', label: 'Package' },
      { key: 'duration_months', label: 'Months', align: 'right' },
      { key: 'start_date', label: 'Start Date', type: 'date' },
      { key: 'end_date', label: 'End Date', type: 'date' },
      { key: 'base_price', label: 'Base Price', type: 'money', align: 'right' },
      { key: 'discount_pct', label: 'Discount %', align: 'right' },
      { key: 'extended_price', label: 'Amount', type: 'money', align: 'right' },
    ],
    rows: result.rows,
    detail: result.rows[0] || null,
    summary: { recordCount: result.rows.length, totalAmount: moneySummary(result.rows, 'extended_price') },
  };
}

async function getRevenueByPackage(f) {
  const result = await pool.query(
    `SELECT p.id AS package_id, p.package_name, COUNT(sli.id)::INT AS subscription_count,
            SUM(sli.base_price) AS gross_amount,
            SUM(sli.base_price - sli.extended_price) AS discount_amount,
            SUM(sli.extended_price) AS net_revenue
     FROM subscription s
     JOIN subscription_line_item sli ON sli.subscription_id = s.id
     JOIN package p ON p.id = sli.package_id
     WHERE s.subscription_date BETWEEN $1::date AND $2::date
     GROUP BY p.id, p.package_name
     ORDER BY net_revenue DESC`,
    [f.from_date, f.to_date]
  );
  return {
    columns: [
      { key: 'package_id', label: 'Package ID' },
      { key: 'package_name', label: 'Package Name' },
      { key: 'subscription_count', label: 'Subscriptions', align: 'right' },
      { key: 'gross_amount', label: 'Gross Amount', type: 'money', align: 'right' },
      { key: 'discount_amount', label: 'Discount', type: 'money', align: 'right' },
      { key: 'net_revenue', label: 'Net Revenue', type: 'money', align: 'right' },
    ],
    rows: result.rows,
    summary: { recordCount: result.rows.length, totalAmount: moneySummary(result.rows, 'net_revenue') },
  };
}

async function getTrainingBookingsList(f) {
  const result = await pool.query(
    `SELECT tb.id AS booking_no, tb.booking_date, m.id AS member_id, m.member_name,
            t.id AS trainer_id, t.trainer_name, COUNT(ts.id)::INT AS session_count,
            tb.total_session_cost
     FROM training_booking tb
     JOIN member m ON m.id = tb.member_id
     JOIN trainer t ON t.id = tb.trainer_id
     LEFT JOIN training_session ts ON ts.booking_id = tb.id
     WHERE tb.booking_date BETWEEN $1::date AND $2::date
       AND ($3 = '0' OR tb.trainer_id = $3)
     GROUP BY tb.id, tb.booking_date, m.id, m.member_name, t.id, t.trainer_name, tb.total_session_cost
     ORDER BY tb.booking_date, tb.id`,
    [f.from_date, f.to_date, f.trainer_id]
  );
  return {
    columns: [
      { key: 'booking_no', label: 'Booking No' },
      { key: 'booking_date', label: 'Date', type: 'date' },
      { key: 'member_name', label: 'Member' },
      { key: 'trainer_name', label: 'Trainer' },
      { key: 'session_count', label: 'Sessions', align: 'right' },
      { key: 'total_session_cost', label: 'Total Cost', type: 'money', align: 'right' },
    ],
    rows: result.rows,
    summary: { recordCount: result.rows.length, totalAmount: moneySummary(result.rows, 'total_session_cost') },
  };
}

async function getTrainingBookingPrint(f) {
  const result = await pool.query(
    `SELECT tb.id AS booking_no, tb.booking_date, m.id AS member_id, m.member_name,
            t.id AS trainer_id, t.trainer_name, ts.line_no, tt.type_name,
            ts.session_date, ts.start_time, ts.end_time, ts.duration_minutes,
            ts.hourly_rate, ts.session_cost, ts.notes, tb.total_session_cost
     FROM training_booking tb
     JOIN member m ON m.id = tb.member_id
     JOIN trainer t ON t.id = tb.trainer_id
     JOIN training_session ts ON ts.booking_id = tb.id
     JOIN training_type tt ON tt.id = ts.type_id
     WHERE tb.id = $1
     ORDER BY ts.line_no`,
    [f.booking_no]
  );
  return {
    columns: [
      { key: 'line_no', label: '#' },
      { key: 'type_name', label: 'Training Type' },
      { key: 'session_date', label: 'Session Date', type: 'date' },
      { key: 'start_time', label: 'Start' },
      { key: 'end_time', label: 'End' },
      { key: 'duration_minutes', label: 'Minutes', align: 'right' },
      { key: 'hourly_rate', label: 'Hourly Rate', type: 'money', align: 'right' },
      { key: 'session_cost', label: 'Session Cost', type: 'money', align: 'right' },
    ],
    rows: result.rows,
    detail: result.rows[0] || null,
    summary: { recordCount: result.rows.length, totalAmount: moneySummary(result.rows, 'session_cost') },
  };
}

async function getRevenueByTrainer(f) {
  const result = await pool.query(
    `SELECT t.id AS trainer_id, t.trainer_name, t.commission_rate,
            COUNT(DISTINCT tb.id)::INT AS booking_count, COUNT(ts.id)::INT AS session_count,
            SUM(ts.session_cost) AS training_revenue,
            SUM(ts.session_cost * t.commission_rate / 100) AS commission_amount,
            SUM(ts.session_cost - (ts.session_cost * t.commission_rate / 100)) AS net_after_commission
     FROM training_booking tb
     JOIN trainer t ON t.id = tb.trainer_id
     JOIN training_session ts ON ts.booking_id = tb.id
     WHERE tb.booking_date BETWEEN $1::date AND $2::date
     GROUP BY t.id, t.trainer_name, t.commission_rate
     ORDER BY training_revenue DESC`,
    [f.from_date, f.to_date]
  );
  return {
    columns: [
      { key: 'trainer_id', label: 'Trainer ID' },
      { key: 'trainer_name', label: 'Trainer Name' },
      { key: 'commission_rate', label: 'Commission %', align: 'right' },
      { key: 'booking_count', label: 'Bookings', align: 'right' },
      { key: 'session_count', label: 'Sessions', align: 'right' },
      { key: 'training_revenue', label: 'Revenue', type: 'money', align: 'right' },
      { key: 'commission_amount', label: 'Commission', type: 'money', align: 'right' },
      { key: 'net_after_commission', label: 'Net', type: 'money', align: 'right' },
    ],
    rows: result.rows,
    summary: { recordCount: result.rows.length, totalAmount: moneySummary(result.rows, 'training_revenue') },
  };
}

async function getMerchandiseInvoicesList(f) {
  const result = await pool.query(
    `SELECT mi.id AS invoice_no, mi.invoice_date, m.id AS member_id, m.member_name,
            COUNT(mli.id)::INT AS item_count, mi.total_amount
     FROM merchandise_invoice mi
     LEFT JOIN member m ON m.id = mi.member_id
     JOIN merchandise_line_item mli ON mli.invoice_id = mi.id
     WHERE mi.invoice_date BETWEEN $1::date AND $2::date
       AND ($3 = '0' OR mli.product_id = $3::bigint)
     GROUP BY mi.id, mi.invoice_date, m.id, m.member_name, mi.total_amount
     ORDER BY mi.invoice_date, mi.id`,
    [f.from_date, f.to_date, f.product_id]
  );
  return {
    columns: [
      { key: 'invoice_no', label: 'Invoice No' },
      { key: 'invoice_date', label: 'Date', type: 'date' },
      { key: 'member_name', label: 'Member' },
      { key: 'item_count', label: 'Items', align: 'right' },
      { key: 'total_amount', label: 'Total Amount', type: 'money', align: 'right' },
    ],
    rows: result.rows,
    summary: { recordCount: result.rows.length, totalAmount: moneySummary(result.rows, 'total_amount') },
  };
}

async function getMerchandiseInvoicePrint(f) {
  const result = await pool.query(
    `SELECT mi.id AS invoice_no, mi.invoice_date, m.id AS member_id, m.member_name,
            m.phone, mli.line_no, p.product_name, mli.quantity, mli.unit_price,
            mli.discount_pct, mli.extended_price, mi.total_amount
     FROM merchandise_invoice mi
     LEFT JOIN member m ON m.id = mi.member_id
     JOIN merchandise_line_item mli ON mli.invoice_id = mi.id
     JOIN product p ON p.id = mli.product_id
     WHERE mi.id = $1
     ORDER BY mli.line_no`,
    [f.invoice_no]
  );
  return {
    columns: [
      { key: 'line_no', label: '#' },
      { key: 'product_name', label: 'Product' },
      { key: 'quantity', label: 'Qty', align: 'right' },
      { key: 'unit_price', label: 'Unit Price', type: 'money', align: 'right' },
      { key: 'discount_pct', label: 'Discount %', align: 'right' },
      { key: 'extended_price', label: 'Amount', type: 'money', align: 'right' },
    ],
    rows: result.rows,
    detail: result.rows[0] || null,
    summary: { recordCount: result.rows.length, totalAmount: moneySummary(result.rows, 'extended_price') },
  };
}

async function getRevenueByProduct(f) {
  const result = await pool.query(
    `SELECT p.id AS product_id, p.product_name, pc.category_name,
            SUM(mli.quantity) AS total_quantity_sold,
            SUM(mli.quantity * p.cost_price) AS total_cost,
            SUM(mli.extended_price) AS total_revenue,
            SUM(mli.extended_price - (mli.quantity * p.cost_price)) AS gross_profit
     FROM merchandise_invoice mi
     JOIN merchandise_line_item mli ON mli.invoice_id = mi.id
     JOIN product p ON p.id = mli.product_id
     JOIN product_category pc ON pc.id = p.category_id
     WHERE mi.invoice_date BETWEEN $1::date AND $2::date
     GROUP BY p.id, p.product_name, pc.category_name
     ORDER BY total_revenue DESC`,
    [f.from_date, f.to_date]
  );
  return {
    columns: [
      { key: 'product_id', label: 'Product ID' },
      { key: 'product_name', label: 'Product Name' },
      { key: 'category_name', label: 'Category' },
      { key: 'total_quantity_sold', label: 'Qty Sold', align: 'right' },
      { key: 'total_cost', label: 'Cost', type: 'money', align: 'right' },
      { key: 'total_revenue', label: 'Revenue', type: 'money', align: 'right' },
      { key: 'gross_profit', label: 'Gross Profit', type: 'money', align: 'right' },
    ],
    rows: result.rows,
    summary: { recordCount: result.rows.length, totalAmount: moneySummary(result.rows, 'total_revenue') },
  };
}

async function getPaymentReceiptsList(f) {
  const result = await pool.query(
    `SELECT pr.id AS receipt_no, pr.receipt_date, m.id AS member_id, m.member_name,
            pm.method_name, pr.payment_reference_no, pr.total_paid
     FROM payment_receipt pr
     JOIN member m ON m.id = pr.member_id
     JOIN payment_method pm ON pm.id = pr.method_id
     WHERE pr.receipt_date BETWEEN $1::date AND $2::date
       AND ($3 = '0' OR pr.method_id = $3::int)
     ORDER BY pr.receipt_date, pr.id`,
    [f.from_date, f.to_date, f.method_id]
  );
  return {
    columns: [
      { key: 'receipt_no', label: 'Receipt No' },
      { key: 'receipt_date', label: 'Date', type: 'date' },
      { key: 'member_name', label: 'Member' },
      { key: 'method_name', label: 'Payment Method' },
      { key: 'payment_reference_no', label: 'Reference No' },
      { key: 'total_paid', label: 'Total Paid', type: 'money', align: 'right' },
    ],
    rows: result.rows,
    summary: { recordCount: result.rows.length, totalAmount: moneySummary(result.rows, 'total_paid') },
  };
}

async function getPaymentReceiptDetail(f) {
  const result = await pool.query(
    `SELECT pr.id AS receipt_no, pr.receipt_date, m.id AS member_id, m.member_name,
            pm.method_name, pr.payment_reference_no, rli.line_no, rli.reference_type,
            rli.reference_no, rli.amount_paid, rli.remaining_balance, rli.notes, pr.total_paid
     FROM payment_receipt pr
     JOIN member m ON m.id = pr.member_id
     JOIN payment_method pm ON pm.id = pr.method_id
     JOIN receipt_line_item rli ON rli.receipt_id = pr.id
     WHERE pr.id = $1
     ORDER BY rli.line_no`,
    [f.receipt_no]
  );
  return {
    columns: [
      { key: 'line_no', label: '#' },
      { key: 'reference_type', label: 'Reference Type' },
      { key: 'reference_no', label: 'Reference No' },
      { key: 'amount_paid', label: 'Amount Paid', type: 'money', align: 'right' },
      { key: 'remaining_balance', label: 'Remaining', type: 'money', align: 'right' },
      { key: 'notes', label: 'Notes' },
    ],
    rows: result.rows,
    detail: result.rows[0] || null,
    summary: { recordCount: result.rows.length, totalAmount: moneySummary(result.rows, 'amount_paid') },
  };
}

async function getPaymentsByMethod(f) {
  const result = await pool.query(
    `SELECT pm.id AS method_id, pm.method_name, COUNT(pr.id)::INT AS receipt_count,
            SUM(pr.total_paid) AS total_paid,
            ROUND(SUM(pr.total_paid) * 100.0 / NULLIF(SUM(SUM(pr.total_paid)) OVER (), 0), 2) AS percentage_of_total
     FROM payment_receipt pr
     JOIN payment_method pm ON pm.id = pr.method_id
     WHERE pr.receipt_date BETWEEN $1::date AND $2::date
     GROUP BY pm.id, pm.method_name
     ORDER BY total_paid DESC`,
    [f.from_date, f.to_date]
  );
  return {
    columns: [
      { key: 'method_id', label: 'Method ID' },
      { key: 'method_name', label: 'Payment Method' },
      { key: 'receipt_count', label: 'Receipts', align: 'right' },
      { key: 'total_paid', label: 'Total Paid', type: 'money', align: 'right' },
      { key: 'percentage_of_total', label: '% of Total', align: 'right' },
    ],
    rows: result.rows,
    summary: { recordCount: result.rows.length, totalAmount: moneySummary(result.rows, 'total_paid') },
  };
}

async function getExpenseVouchersList(f) {
  const result = await pool.query(
    `SELECT ev.id AS voucher_no, ev.voucher_date, ev.vendor_name,
            s.staff_name AS paid_by_staff, pm.method_name, COUNT(eli.id)::INT AS line_count,
            ev.total_expense
     FROM expense_voucher ev
     JOIN staff s ON s.id = ev.paid_by_staff_id
     JOIN payment_method pm ON pm.id = ev.method_id
     JOIN expense_line_item eli ON eli.voucher_id = ev.id
     WHERE ev.voucher_date BETWEEN $1::date AND $2::date
       AND ($3 = '0' OR eli.category_id = $3::int)
     GROUP BY ev.id, ev.voucher_date, ev.vendor_name, s.staff_name, pm.method_name, ev.total_expense
     ORDER BY ev.voucher_date, ev.id`,
    [f.from_date, f.to_date, f.category_id]
  );
  return {
    columns: [
      { key: 'voucher_no', label: 'Voucher No' },
      { key: 'voucher_date', label: 'Date', type: 'date' },
      { key: 'vendor_name', label: 'Vendor' },
      { key: 'paid_by_staff', label: 'Paid By' },
      { key: 'method_name', label: 'Payment Method' },
      { key: 'line_count', label: 'Lines', align: 'right' },
      { key: 'total_expense', label: 'Total Expense', type: 'money', align: 'right' },
    ],
    rows: result.rows,
    summary: { recordCount: result.rows.length, totalAmount: moneySummary(result.rows, 'total_expense') },
  };
}

async function getExpenseVoucherPrint(f) {
  const result = await pool.query(
    `SELECT ev.id AS voucher_no, ev.voucher_date, ev.vendor_name,
            s.staff_name AS paid_by_staff, pm.method_name, eli.line_no,
            ec.category_name, eli.description, eli.amount, ev.total_expense
     FROM expense_voucher ev
     JOIN staff s ON s.id = ev.paid_by_staff_id
     JOIN payment_method pm ON pm.id = ev.method_id
     JOIN expense_line_item eli ON eli.voucher_id = ev.id
     JOIN expense_category ec ON ec.id = eli.category_id
     WHERE ev.id = $1
     ORDER BY eli.line_no`,
    [f.voucher_no]
  );
  return {
    columns: [
      { key: 'line_no', label: '#' },
      { key: 'category_name', label: 'Category' },
      { key: 'description', label: 'Description' },
      { key: 'amount', label: 'Amount', type: 'money', align: 'right' },
    ],
    rows: result.rows,
    detail: result.rows[0] || null,
    summary: { recordCount: result.rows.length, totalAmount: moneySummary(result.rows, 'amount') },
  };
}

async function getExpenseByCategory(f) {
  const result = await pool.query(
    `SELECT ec.id AS category_id, ec.category_name, COUNT(eli.id)::INT AS expense_line_count,
            SUM(eli.amount) AS total_expense,
            ROUND(SUM(eli.amount) * 100.0 / NULLIF(SUM(SUM(eli.amount)) OVER (), 0), 2) AS percentage_of_total
     FROM expense_voucher ev
     JOIN expense_line_item eli ON eli.voucher_id = ev.id
     JOIN expense_category ec ON ec.id = eli.category_id
     WHERE ev.voucher_date BETWEEN $1::date AND $2::date
     GROUP BY ec.id, ec.category_name
     ORDER BY total_expense DESC`,
    [f.from_date, f.to_date]
  );
  return {
    columns: [
      { key: 'category_id', label: 'Category ID' },
      { key: 'category_name', label: 'Category' },
      { key: 'expense_line_count', label: 'Lines', align: 'right' },
      { key: 'total_expense', label: 'Total Expense', type: 'money', align: 'right' },
      { key: 'percentage_of_total', label: '% of Total', align: 'right' },
    ],
    rows: result.rows,
    summary: { recordCount: result.rows.length, totalAmount: moneySummary(result.rows, 'total_expense') },
  };
}

async function getActiveSubscriptionsAsOf(f) {
  const result = await pool.query(
    `SELECT s.id AS subscription_no, m.id AS member_id, m.member_name,
            p.package_name, sli.start_date, sli.end_date,
            (sli.end_date - $1::date) AS remaining_days,
            s.status, sli.extended_price
     FROM subscription s
     JOIN member m ON m.id = s.member_id
     JOIN subscription_line_item sli ON sli.subscription_id = s.id
     JOIN package p ON p.id = sli.package_id
     WHERE sli.start_date <= $1::date
       AND sli.end_date >= $1::date
       AND s.status = 'ACTIVE'
     ORDER BY sli.end_date, m.member_name`,
    [f.as_of_date]
  );
  return {
    columns: [
      { key: 'subscription_no', label: 'Subscription No' },
      { key: 'member_name', label: 'Member' },
      { key: 'package_name', label: 'Package' },
      { key: 'start_date', label: 'Start Date', type: 'date' },
      { key: 'end_date', label: 'End Date', type: 'date' },
      { key: 'remaining_days', label: 'Remaining Days', align: 'right' },
      { key: 'status', label: 'Status' },
      { key: 'extended_price', label: 'Amount', type: 'money', align: 'right' },
    ],
    rows: result.rows,
    summary: {
      recordCount: result.rows.length,
      label: 'Active Subscriptions',
      value: result.rows.length,
      type: 'number',
    },
  };
}

async function getSubscriptionsExpiring30Days(f) {
  const result = await pool.query(
    `SELECT s.id AS subscription_no, m.id AS member_id, m.member_name, m.phone,
            p.package_name, sli.start_date, sli.end_date,
            (sli.end_date - $1::date) AS days_remaining, s.status
     FROM subscription s
     JOIN member m ON m.id = s.member_id
     JOIN subscription_line_item sli ON sli.subscription_id = s.id
     JOIN package p ON p.id = sli.package_id
     WHERE sli.end_date BETWEEN $1::date AND ($1::date + INTERVAL '30 days')
       AND s.status = 'ACTIVE'
     ORDER BY sli.end_date, m.member_name`,
    [f.as_of_date]
  );
  return {
    columns: [
      { key: 'subscription_no', label: 'Subscription No' },
      { key: 'member_name', label: 'Member' },
      { key: 'phone', label: 'Phone' },
      { key: 'package_name', label: 'Package' },
      { key: 'end_date', label: 'End Date', type: 'date' },
      { key: 'days_remaining', label: 'Days Remaining', align: 'right' },
      { key: 'status', label: 'Status' },
    ],
    rows: result.rows,
    summary: { recordCount: result.rows.length },
  };
}

async function getMonthlyBusinessPerformance(f) {
  const result = await pool.query(
    `WITH monthly_subscription AS (
       SELECT DATE_TRUNC('month', subscription_date)::date AS month_start, SUM(total_amount) AS subscription_revenue
       FROM subscription WHERE subscription_date BETWEEN $1::date AND $2::date GROUP BY DATE_TRUNC('month', subscription_date)
     ),
     monthly_training AS (
       SELECT DATE_TRUNC('month', booking_date)::date AS month_start, SUM(total_session_cost) AS training_revenue
       FROM training_booking WHERE booking_date BETWEEN $1::date AND $2::date GROUP BY DATE_TRUNC('month', booking_date)
     ),
     monthly_merchandise AS (
       SELECT DATE_TRUNC('month', invoice_date)::date AS month_start, SUM(total_amount) AS merchandise_revenue
       FROM merchandise_invoice WHERE invoice_date BETWEEN $1::date AND $2::date GROUP BY DATE_TRUNC('month', invoice_date)
     ),
     monthly_expense AS (
       SELECT DATE_TRUNC('month', voucher_date)::date AS month_start, SUM(total_expense) AS operational_expense
       FROM expense_voucher WHERE voucher_date BETWEEN $1::date AND $2::date GROUP BY DATE_TRUNC('month', voucher_date)
     ),
     monthly_equipment_purchase AS (
       SELECT DATE_TRUNC('month', purchase_date)::date AS month_start, SUM(total_purchase_cost) AS equipment_purchase
       FROM equipment_purchase WHERE purchase_date BETWEEN $1::date AND $2::date GROUP BY DATE_TRUNC('month', purchase_date)
     ),
     monthly_trainer_commission AS (
       SELECT DATE_TRUNC('month', tb.booking_date)::date AS month_start,
              SUM(ts.session_cost * t.commission_rate / 100) AS trainer_commission
       FROM training_booking tb
       JOIN training_session ts ON ts.booking_id = tb.id
       JOIN trainer t ON t.id = tb.trainer_id
       WHERE tb.booking_date BETWEEN $1::date AND $2::date
       GROUP BY DATE_TRUNC('month', tb.booking_date)
     ),
     months AS (
       SELECT month_start FROM monthly_subscription
       UNION SELECT month_start FROM monthly_training
       UNION SELECT month_start FROM monthly_merchandise
       UNION SELECT month_start FROM monthly_expense
       UNION SELECT month_start FROM monthly_equipment_purchase
       UNION SELECT month_start FROM monthly_trainer_commission
     )
     SELECT m.month_start,
            COALESCE(ms.subscription_revenue, 0) AS subscription_revenue,
            COALESCE(mt.training_revenue, 0) AS training_revenue,
            COALESCE(mm.merchandise_revenue, 0) AS merchandise_revenue,
            COALESCE(ms.subscription_revenue, 0) + COALESCE(mt.training_revenue, 0) + COALESCE(mm.merchandise_revenue, 0) AS total_revenue,
            COALESCE(me.operational_expense, 0) AS operational_expense,
            COALESCE(mep.equipment_purchase, 0) AS equipment_purchase,
            COALESCE(mtc.trainer_commission, 0) AS trainer_commission,
            COALESCE(me.operational_expense, 0) + COALESCE(mep.equipment_purchase, 0) + COALESCE(mtc.trainer_commission, 0) AS total_expense,
            COALESCE(ms.subscription_revenue, 0) + COALESCE(mt.training_revenue, 0) + COALESCE(mm.merchandise_revenue, 0)
              - (COALESCE(me.operational_expense, 0) + COALESCE(mep.equipment_purchase, 0) + COALESCE(mtc.trainer_commission, 0)) AS net_profit
     FROM months m
     LEFT JOIN monthly_subscription ms ON ms.month_start = m.month_start
     LEFT JOIN monthly_training mt ON mt.month_start = m.month_start
     LEFT JOIN monthly_merchandise mm ON mm.month_start = m.month_start
     LEFT JOIN monthly_expense me ON me.month_start = m.month_start
     LEFT JOIN monthly_equipment_purchase mep ON mep.month_start = m.month_start
     LEFT JOIN monthly_trainer_commission mtc ON mtc.month_start = m.month_start
     ORDER BY m.month_start`,
    [f.from_date, f.to_date]
  );
  return {
    columns: [
      { key: 'month_start', label: 'Month', type: 'date' },
      { key: 'subscription_revenue', label: 'Subscription', type: 'money', align: 'right' },
      { key: 'training_revenue', label: 'Training', type: 'money', align: 'right' },
      { key: 'merchandise_revenue', label: 'Merchandise', type: 'money', align: 'right' },
      { key: 'total_revenue', label: 'Total Revenue', type: 'money', align: 'right' },
      { key: 'operational_expense', label: 'Operational Expense', type: 'money', align: 'right' },
      { key: 'equipment_purchase', label: 'Equipment Purchase', type: 'money', align: 'right' },
      { key: 'trainer_commission', label: 'Trainer Commission', type: 'money', align: 'right' },
      { key: 'total_expense', label: 'Total Expense', type: 'money', align: 'right' },
      { key: 'net_profit', label: 'Net Profit', type: 'money', align: 'right' },
    ],
    rows: result.rows,
    summary: { recordCount: result.rows.length, totalAmount: moneySummary(result.rows, 'net_profit') },
  };
}

const reportQueries = {
  'membership-subscriptions-list': getMembershipSubscriptionsList,
  'membership-subscription-print': getMembershipSubscriptionPrint,
  'revenue-by-package': getRevenueByPackage,
  'training-bookings-list': getTrainingBookingsList,
  'training-booking-print': getTrainingBookingPrint,
  'revenue-by-trainer': getRevenueByTrainer,
  'merchandise-invoices-list': getMerchandiseInvoicesList,
  'merchandise-invoice-print': getMerchandiseInvoicePrint,
  'revenue-by-product': getRevenueByProduct,
  'payment-receipts-list': getPaymentReceiptsList,
  'payment-receipt-detail': getPaymentReceiptDetail,
  'payments-by-method': getPaymentsByMethod,
  'expense-vouchers-list': getExpenseVouchersList,
  'expense-voucher-print': getExpenseVoucherPrint,
  'expense-by-category': getExpenseByCategory,
  'active-subscriptions-as-of': getActiveSubscriptionsAsOf,
  'subscriptions-expiring-30-days': getSubscriptionsExpiring30Days,
  'monthly-business-performance': getMonthlyBusinessPerformance,
};

async function getReportById(reportId, query = {}) {
  const found = findReport(reportId);
  if (!found) return null;

  const { group, report } = found;
  const filters = filtersFor(report, query);
  const filterDefinitions = await hydrateFilterOptions(report);
  const data = await reportQueries[reportId](filters);

  return {
    ...report,
    filters: filterDefinitions,
    groupId: group.id,
    groupName: group.groupName,
    memberId: group.memberId,
    appliedFilters: filters,
    ...data,
  };
}

module.exports = {
  getReportGroups,
  getReportById,
};
