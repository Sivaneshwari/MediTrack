-- Remove email, password, and phone columns from students and staff tables

-- Drop columns from students
ALTER TABLE students
DROP COLUMN IF EXISTS email,
DROP COLUMN IF EXISTS password,
DROP COLUMN IF EXISTS phone,
DROP COLUMN IF EXISTS ph_no; -- Handling potential variation in column name

-- Drop columns from staff
ALTER TABLE staff
DROP COLUMN IF EXISTS email,
DROP COLUMN IF EXISTS password,
DROP COLUMN IF EXISTS phone,
DROP COLUMN IF EXISTS ph_no; -- Handling potential variation in column name
