-- ============================================
-- Internal Job Portal - Simple Schema
-- Run this entire file in MySQL Workbench or CLI
-- ============================================

CREATE DATABASE IF NOT EXISTS internal_job_portal
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE internal_job_portal;

DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS user_sessions;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS users;

-- Users table (employees + 1 admin)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(256) NOT NULL,
    employee_id VARCHAR(50) NOT NULL UNIQUE,
    department VARCHAR(80) NOT NULL,
    role ENUM('admin', 'employee') NOT NULL DEFAULT 'employee',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Jobs table
CREATE TABLE jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    department VARCHAR(80) NOT NULL,
    location VARCHAR(100) NOT NULL,
    work_type ENUM('Remote', 'Hybrid', 'On-site') NOT NULL DEFAULT 'Hybrid',
    description TEXT NOT NULL,
    status ENUM('Open', 'Closed') NOT NULL DEFAULT 'Open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Applications table
CREATE TABLE applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    user_id INT NOT NULL,
    cover_note TEXT,
    status ENUM('Submitted', 'Under Review', 'Interview Scheduled', 'Offered', 'Rejected')
        NOT NULL DEFAULT 'Submitted',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_app_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    CONSTRAINT fk_app_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_application (job_id, user_id)
);

-- Sessions table (for simple token auth)
CREATE TABLE user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(128) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- Default Admin Account
-- Email: admin@company.com
-- Password: Admin@123
-- password_hash is SHA256 of "Admin@123"
-- ============================================
INSERT INTO users (name, email, password_hash, employee_id, department, role)
VALUES (
    'Admin',
    'admin@company.com',
    '85bf5341512d34e9af9b472d202c26eb1e00472157271a0a2122372cb0944a9a',
    'EMP-0001',
    'Administration',
    'admin'
);
-- NOTE: The actual SHA256 hash will be computed by the API.
-- After running this script, use the /api/auth/seed-admin endpoint once
-- (or manually update the hash using the helper in the API).
