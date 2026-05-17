-- Add blood_group column to students table
ALTER TABLE students ADD COLUMN blood_group VARCHAR(5);

-- Add blood_group column to staff table
ALTER TABLE staff ADD COLUMN blood_group VARCHAR(5);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_type ENUM('student', 'staff') NOT NULL,
  patient_id VARCHAR(50) NOT NULL,
  appointment_date DATETIME NOT NULL,
  reason TEXT,
  status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
  nurse_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create prescriptions table
CREATE TABLE IF NOT EXISTS prescriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  appointment_id INT NOT NULL,
  medicine_name VARCHAR(255) NOT NULL,
  dosage VARCHAR(100),
  frequency VARCHAR(100),
  duration VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE
);

-- Create inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  item_name VARCHAR(255) NOT NULL,
  item_type ENUM('medicine', 'ointment', 'equipment') NOT NULL,
  stock_quantity INT NOT NULL DEFAULT 0,
  unit VARCHAR(50),
  expiry_date DATE,
  low_stock_threshold INT DEFAULT 10,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create blood_donation_requests table
CREATE TABLE IF NOT EXISTS blood_donation_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  blood_group VARCHAR(5) NOT NULL,
  urgency ENUM('low', 'medium', 'high', 'critical') NOT NULL,
  contact_person VARCHAR(255),
  contact_phone VARCHAR(15),
  message TEXT,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  type VARCHAR(50) DEFAULT 'general',
  target_audience VARCHAR(50) DEFAULT 'all',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
