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

COPY training_type
FROM '/docker-entrypoint-initdb.d/csv/training_type.csv'
DELIMITER ',' CSV HEADER;

COPY trainer
FROM '/docker-entrypoint-initdb.d/csv/trainer.csv'
DELIMITER ',' CSV HEADER;

COPY training_booking
FROM '/docker-entrypoint-initdb.d/csv/training_booking.csv'
DELIMITER ',' CSV HEADER;

COPY training_session
FROM '/docker-entrypoint-initdb.d/csv/training_session.csv'
DELIMITER ',' CSV HEADER;

COPY class
FROM '/docker-entrypoint-initdb.d/csv/class.csv'
DELIMITER ',' CSV HEADER;

COPY class_booking
FROM '/docker-entrypoint-initdb.d/csv/class_booking.csv'
DELIMITER ',' CSV HEADER;

COPY equipment_category
FROM '/docker-entrypoint-initdb.d/csv/equipment_category.csv'
DELIMITER ',' CSV HEADER;

COPY equipment
FROM '/docker-entrypoint-initdb.d/csv/equipment.csv'
DELIMITER ',' CSV HEADER;

COPY maintenance_ticket
FROM '/docker-entrypoint-initdb.d/csv/maintenance_ticket.csv'
DELIMITER ',' CSV HEADER;

COPY equipment_purchase
FROM '/docker-entrypoint-initdb.d/csv/equipment_purchase.csv'
DELIMITER ',' CSV HEADER;

COPY equipment_purchase_item
FROM '/docker-entrypoint-initdb.d/csv/equipment_purchase_item.csv'
DELIMITER ',' CSV HEADER;


COPY payment_receipt
FROM '/docker-entrypoint-initdb.d/csv/payment_receipt.csv'
DELIMITER ',' CSV HEADER;

COPY receipt_line_item
FROM '/docker-entrypoint-initdb.d/csv/receipt_line_item.csv'
DELIMITER ',' CSV HEADER;
-- (Add more COPY commands here for any other CSV files you have)