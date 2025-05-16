-- Create users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('teacher', 'student') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create journals table
CREATE TABLE journals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    teacher_id INT NOT NULL,
    description TEXT NOT NULL,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create attachment types table
CREATE TABLE attachment_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name ENUM('image', 'video', 'url', 'pdf') NOT NULL
);

-- Insert attachment types
INSERT INTO attachment_types (name) VALUES 
('image'), 
('video'), 
('pdf'), 
('url');

-- Create attachments table
CREATE TABLE attachments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    journal_id INT NOT NULL,
    attachment_type_id INT NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (journal_id) REFERENCES journals(id) ON DELETE CASCADE,
    FOREIGN KEY (attachment_type_id) REFERENCES attachment_types(id)
);

-- Create student_journal_tags table for tagging students in journals
CREATE TABLE student_journal_tags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    journal_id INT NOT NULL,
    student_id INT NOT NULL,
    notification_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (journal_id) REFERENCES journals(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (journal_id, student_id)
);

-- Create notifications table (for bonus part)
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    journal_id INT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (journal_id) REFERENCES journals(id) ON DELETE CASCADE
);
