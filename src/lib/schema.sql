-- Hospital Room Management System - Database Schema
-- Multi-Tenant (Multi-School) Architecture

CREATE DATABASE IF NOT EXISTS hospital_room_mgmt
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE hospital_room_mgmt;

-- Schools table (tenants)
CREATE TABLE IF NOT EXISTS schools (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(50),
  email VARCHAR(255),
  logo_url VARCHAR(500),
  status ENUM('pending', 'approved', 'rejected', 'suspended') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  school_id INT NULL,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role ENUM('super_admin', 'school_admin', 'staff', 'nurse') NOT NULL DEFAULT 'staff',
  phone VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  reset_token VARCHAR(255) NULL,
  reset_token_expires_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_email (email),
  UNIQUE KEY unique_username (username),
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Health rooms (ห้องพยาบาล)
CREATE TABLE IF NOT EXISTS health_rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  school_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  capacity INT DEFAULT 1,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  school_id INT NOT NULL,
  student_code VARCHAR(50),
  full_name VARCHAR(255) NOT NULL,
  class_name VARCHAR(100),
  grade_level VARCHAR(50),
  date_of_birth DATE,
  gender ENUM('male', 'female', 'other'),
  blood_type VARCHAR(10),
  allergies TEXT,
  parent_phone VARCHAR(50),
  parent_name VARCHAR(255),
  academic_year VARCHAR(10),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Symptom categories (ประเภทอาการ)
CREATE TABLE IF NOT EXISTS symptom_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  school_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Room visits (การใช้ห้องพยาบาล)
CREATE TABLE IF NOT EXISTS room_visits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  school_id INT NOT NULL,
  health_room_id INT NOT NULL,
  student_id INT NOT NULL,
  staff_id INT NOT NULL,
  visit_date DATE NOT NULL,
  visit_time TIME NOT NULL,
  leave_time TIME,
  symptom_category_id INT,
  symptoms TEXT NOT NULL,
  temperature DECIMAL(4,1),
  blood_pressure VARCHAR(20),
  treatment TEXT,
  medication TEXT,
  notes TEXT,
  status ENUM('in_room', 'treated', 'referred', 'sent_home') DEFAULT 'in_room',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  FOREIGN KEY (health_room_id) REFERENCES health_rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (symptom_category_id) REFERENCES symptom_categories(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Treatment records (ประวัติการรักษา)
CREATE TABLE IF NOT EXISTS treatment_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  school_id INT NOT NULL,
  visit_id INT NOT NULL,
  student_id INT NOT NULL,
  treated_by INT NOT NULL,
  treatment_type VARCHAR(255),
  treatment_detail TEXT,
  medication_given TEXT,
  follow_up_required BOOLEAN DEFAULT FALSE,
  follow_up_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  FOREIGN KEY (visit_id) REFERENCES room_visits(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (treated_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Password reset columns (run ALTER if table already exists)
-- ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) NULL;
-- ALTER TABLE users ADD COLUMN reset_token_expires_at DATETIME NULL;

-- NOTE: Super Admin is seeded via API or script, NOT hardcoded here.
-- Run: npx tsx scripts/seed-admin.ts
-- Or call POST /api/setup/seed in development
