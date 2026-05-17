-- Ensure DOB is VARCHAR to support custom formats like DD/MM/YYYY
ALTER TABLE students MODIFY dob VARCHAR(20);
ALTER TABLE staff MODIFY dob VARCHAR(20);
