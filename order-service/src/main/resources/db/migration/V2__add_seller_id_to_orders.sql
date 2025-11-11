-- Migration script to add seller_id column to orders table
-- This allows tracking which seller's products are in each order

-- Add seller_id column to orders table
ALTER TABLE orders ADD COLUMN seller_id VARCHAR(255);

-- Add index for better query performance
CREATE INDEX idx_orders_seller_id ON orders(seller_id);

-- Note: For existing orders, seller_id will be NULL
-- You may need to populate this field based on the products in each order
-- by querying the product-service to get the seller_id for each product

-- Example query to update existing orders (requires product-service integration):
-- UPDATE orders o
-- SET seller_id = (
--     SELECT p.seller_id 
--     FROM order_items oi
--     JOIN products p ON oi.product_id = p.id
--     WHERE oi.order_id = o.id
--     LIMIT 1
-- )
-- WHERE seller_id IS NULL;
