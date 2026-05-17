-- Direct column additions. The runner script will ignore "Duplicate column" errors.
ALTER TABLE students ADD COLUMN shift VARCHAR(20);
ALTER TABLE students ADD COLUMN dob VARCHAR(20);
ALTER TABLE students ADD COLUMN blood_group VARCHAR(10);

ALTER TABLE staff ADD COLUMN shift VARCHAR(20);
ALTER TABLE staff ADD COLUMN dob VARCHAR(20);
ALTER TABLE staff ADD COLUMN blood_group VARCHAR(10);
