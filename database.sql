-- Traffic Management System Database Schema

-- Create database
CREATE DATABASE IF NOT EXISTS traffic_management;
USE traffic_management;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Traffic data table
CREATE TABLE traffic_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    location VARCHAR(255) NOT NULL,
    level ENUM('low', 'medium', 'high') NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Reports table
CREATE TABLE reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    location VARCHAR(255) NOT NULL,
    issue_type ENUM('accident', 'jam', 'signal', 'roadwork', 'other') NOT NULL,
    description TEXT NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'resolved') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Violations/Challans table
CREATE TABLE challans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    vehicle_number VARCHAR(20) NOT NULL,
    violation_type VARCHAR(100) NOT NULL,
    fine_amount DECIMAL(10,2) NOT NULL,
    status ENUM('paid', 'unpaid') DEFAULT 'unpaid',
    location VARCHAR(255),
    violation_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Notifications table
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    type ENUM('user', 'broadcast') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    urgent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert sample data
INSERT INTO users (name, email, password, role) VALUES
('John Doe', 'john@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user'),
('Jane Smith', 'jane@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user'),
('Admin User', 'admin@traffic.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

INSERT INTO traffic_data (location, level, description) VALUES
('Main Street & 1st Avenue', 'low', 'Light traffic flow'),
('Highway 101 - Exit 25', 'medium', 'Moderate congestion'),
('Downtown Circle', 'high', 'Heavy traffic, avoid if possible'),
('Airport Road', 'medium', 'Normal rush hour traffic');

INSERT INTO reports (user_id, location, issue_type, description, status) VALUES
(1, 'Main Street & 2nd Avenue', 'accident', 'Minor accident blocking one lane', 'pending'),
(2, 'Highway 101 - Exit 20', 'jam', 'Heavy traffic due to rush hour', 'approved'),
(1, 'Traffic Signal - City Center', 'signal', 'Traffic light not working properly', 'resolved');

INSERT INTO challans (user_id, vehicle_number, violation_type, fine_amount, status, location, violation_date) VALUES
(1, 'MH-12-AB-1234', 'Speeding', 500.00, 'unpaid', 'Highway 101', '2024-01-15'),
(2, 'MH-12-XY-5678', 'No Parking', 200.00, 'paid', 'Downtown Circle', '2024-01-10'),
(1, 'MH-12-AB-1234', 'Red Light Violation', 1000.00, 'unpaid', 'Main Street', '2024-01-20');

INSERT INTO notifications (user_id, type, title, message, urgent) VALUES
(NULL, 'broadcast', 'Traffic Alert', 'Heavy traffic reported on Highway 101 - Exit 25', TRUE),
(1, 'user', 'New Challan', 'A new challan has been issued for your vehicle MH-12-AB-1234', FALSE),
(NULL, 'broadcast', 'System Update', 'New features have been added to the traffic management system', FALSE);
