-- Run this in MySQL Workbench or MySQL CLI before starting the backend

CREATE DATABASE IF NOT EXISTS job_portal_db;
USE job_portal_db;

-- The tables will be auto-created by Hibernate (spring.jpa.hibernate.ddl-auto=update)
-- But you can run this to create an admin user manually after first startup:

-- STEP 1: Start the Spring Boot app once (it creates the tables)
-- STEP 2: Run the INSERT below to create your admin account
-- STEP 3: Use admin@jobportal.com / admin123 to login

-- Admin user (password = admin123, BCrypt encoded)
INSERT INTO users (full_name, email, password, role, enabled, created_at, updated_at)
VALUES (
  'Admin User',
  'admin@jobportal.com',
  '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8RDkfCO.WhJeSBmG3y',
  'ROLE_ADMIN',
  1,
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE email = email;

-- Sample Employer
INSERT INTO users (full_name, email, password, role, company_name, enabled, created_at, updated_at)
VALUES (
  'Tech Corp HR',
  'employer@techcorp.com',
  '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8RDkfCO.WhJeSBmG3y',
  'ROLE_EMPLOYER',
  'Tech Corp',
  1,
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE email = email;

-- Sample Seeker
INSERT INTO users (full_name, email, password, role, skills, enabled, created_at, updated_at)
VALUES (
  'John Dev',
  'seeker@example.com',
  '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8RDkfCO.WhJeSBmG3y',
  'ROLE_SEEKER',
  'java, spring boot, react, mysql',
  1,
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE email = email;

-- All sample users have password: admin123
