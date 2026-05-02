-- 02_seed.sql

-- Import data into the Member table
COPY member 
FROM '/docker-entrypoint-initdb.d/csv/member.csv' 
DELIMITER ',' 
CSV HEADER;

COPY product_category
FROM '/docker-entrypoint-initdb.d/csv/product_category.csv' 
DELIMITER ',' 
CSV HEADER;

-- Import data into the Product table
COPY product 
FROM '/docker-entrypoint-initdb.d/csv/product.csv' 
DELIMITER ',' 
CSV HEADER;


COPY merchandise_invoice
FROM '/docker-entrypoint-initdb.d/csv/merchandise_invoice.csv' 
DELIMITER ',' 
CSV HEADER;

-- (Add more COPY commands here for any other CSV files you have)