-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(50) NOT NULL UNIQUE,
  full_name VARCHAR(100) NOT NULL,
  department VARCHAR(100),
  shift VARCHAR(20),
  blood_group VARCHAR(10),
  dob VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create staff table
CREATE TABLE IF NOT EXISTS staff (
  id INT AUTO_INCREMENT PRIMARY KEY,
  staff_id VARCHAR(50) NOT NULL UNIQUE,
  full_name VARCHAR(100) NOT NULL,
  department VARCHAR(100),
  shift VARCHAR(20),
  blood_group VARCHAR(10),
  dob VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Alter tables to ensure columns exist if tables already existed
-- (This block is for safety if columns were missing in old schema)
-- Note: MySQL might error if column exists, so we use a procedure or just rely heavily on CREATE TABLE IF NOT EXISTS being correct for new setups.
-- For existing setups, we run manual ALTERS below ignoring errors if they exist.

DROP PROCEDURE IF EXISTS upgrade_database;

DELIMITER $$
CREATE PROCEDURE upgrade_database()
BEGIN
    -- Add dob to students
    IF NOT EXISTS(SELECT * FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='meditrack' AND TABLE_NAME='students' AND COLUMN_NAME='dob') THEN
        ALTER TABLE students ADD COLUMN dob VARCHAR(20);
    END IF;
    
    -- Add dob to staff
    IF NOT EXISTS(SELECT * FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='meditrack' AND TABLE_NAME='staff' AND COLUMN_NAME='dob') THEN
        ALTER TABLE staff ADD COLUMN dob VARCHAR(20);
    END IF;

    -- Add blood_group to students
    IF NOT EXISTS(SELECT * FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='meditrack' AND TABLE_NAME='students' AND COLUMN_NAME='blood_group') THEN
        ALTER TABLE students ADD COLUMN blood_group VARCHAR(10);
    END IF;

    -- Add blood_group to staff
    IF NOT EXISTS(SELECT * FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='meditrack' AND TABLE_NAME='staff' AND COLUMN_NAME='blood_group') THEN
        ALTER TABLE staff ADD COLUMN blood_group VARCHAR(10);
    END IF;
    
    -- Add shift to students
    IF NOT EXISTS(SELECT * FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='meditrack' AND TABLE_NAME='students' AND COLUMN_NAME='shift') THEN
        ALTER TABLE students ADD COLUMN shift VARCHAR(20);
    END IF;

    -- Add shift to staff
    IF NOT EXISTS(SELECT * FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='meditrack' AND TABLE_NAME='staff' AND COLUMN_NAME='shift') THEN
        ALTER TABLE staff ADD COLUMN shift VARCHAR(20);
    END IF;
END $$
DELIMITER ;

CALL upgrade_database();
DROP PROCEDURE upgrade_database;
