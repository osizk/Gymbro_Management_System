-- 02_seed.sql

-- Import data into the Member table
COPY member
FROM '/docker-entrypoint-initdb.d/csv/member.csv'
DELIMITER ',' CSV HEADER;

COPY staff
FROM '/docker-entrypoint-initdb.d/csv/staff.csv'
DELIMITER ',' CSV HEADER;

COPY payment_method
FROM '/docker-entrypoint-initdb.d/csv/payment_method.csv'
DELIMITER ',' CSV HEADER;

COPY product_category
FROM '/docker-entrypoint-initdb.d/csv/product_category.csv'
DELIMITER ',' CSV HEADER;

COPY package
FROM '/docker-entrypoint-initdb.d/csv/package.csv'
DELIMITER ',' CSV HEADER;

COPY expense_category
FROM '/docker-entrypoint-initdb.d/csv/expense_category.csv'
DELIMITER ',' CSV HEADER;

-- Import data into the Product table
COPY product
FROM '/docker-entrypoint-initdb.d/csv/product.csv'
DELIMITER ',' CSV HEADER;

COPY merchandise_invoice
FROM '/docker-entrypoint-initdb.d/csv/merchandise_invoice.csv'
DELIMITER ',' CSV HEADER;

COPY expense_voucher
FROM '/docker-entrypoint-initdb.d/csv/expense_voucher.csv'
DELIMITER ',' CSV HEADER;

COPY subscription
FROM '/docker-entrypoint-initdb.d/csv/subscription.csv'
DELIMITER ',' CSV HEADER;

-- Import data into the Line Item tables
COPY merchandise_line_item
FROM '/docker-entrypoint-initdb.d/csv/merchandise_line_item.csv'
DELIMITER ',' CSV HEADER;

COPY expense_line_item
FROM '/docker-entrypoint-initdb.d/csv/expense_line_item.csv'
DELIMITER ',' CSV HEADER;

COPY subscription_line_item
FROM '/docker-entrypoint-initdb.d/csv/subscription_line_item.csv'
DELIMITER ',' CSV HEADER;

-- (Add more COPY commands here for any other CSV files you have)