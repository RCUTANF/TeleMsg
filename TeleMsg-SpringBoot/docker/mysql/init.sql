CREATE DATABASE IF NOT EXISTS telemsg_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE telemsg_db;

-- 创建用户表
CREATE TABLE IF NOT EXISTS tm_users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    avatar VARCHAR(200),
    signature VARCHAR(500),
    status ENUM('ONLINE', 'OFFLINE', 'BUSY', 'AWAY') NOT NULL DEFAULT 'OFFLINE',
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login_time DATETIME,
    last_login_ip VARCHAR(50),
    INDEX idx_user_id (user_id),
    INDEX idx_username (username),
    INDEX idx_status (status)
);

-- 创建群组表
CREATE TABLE IF NOT EXISTS tm_groups (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    group_id VARCHAR(50) NOT NULL UNIQUE,
    group_name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    avatar VARCHAR(200),
    owner_id VARCHAR(50) NOT NULL,
    type ENUM('NORMAL', 'ANNOUNCE', 'PRIVATE') NOT NULL DEFAULT 'NORMAL',
    max_members INT NOT NULL DEFAULT 500,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_group_id (group_id),
    INDEX idx_owner_id (owner_id),
    INDEX idx_group_name (group_name)
);

-- 创建群组成员表
CREATE TABLE IF NOT EXISTS tm_group_members (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    group_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    role ENUM('OWNER', 'ADMIN', 'MEMBER') NOT NULL DEFAULT 'MEMBER',
    nickname VARCHAR(100),
    muted BOOLEAN NOT NULL DEFAULT FALSE,
    muted_until DATETIME,
    join_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_group_user (group_id, user_id),
    INDEX idx_group_id (group_id),
    INDEX idx_user_id (user_id),
    INDEX idx_role (role)
);

-- 创建消息表
CREATE TABLE IF NOT EXISTS tm_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    message_id VARCHAR(100) NOT NULL UNIQUE,
    sender_id VARCHAR(50) NOT NULL,
    receiver_id VARCHAR(50),
    group_id VARCHAR(50),
    message_type ENUM('TEXT', 'IMAGE', 'VOICE', 'VIDEO', 'FILE', 'SYSTEM') NOT NULL,
    content TEXT,
    media_url VARCHAR(500),
    file_name VARCHAR(200),
    file_size BIGINT,
    status ENUM('SENT', 'DELIVERED', 'READ', 'FAILED') NOT NULL DEFAULT 'SENT',
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_message_id (message_id),
    INDEX idx_sender_id (sender_id),
    INDEX idx_receiver_id (receiver_id),
    INDEX idx_group_id (group_id),
    INDEX idx_create_time (create_time),
    INDEX idx_private_chat (sender_id, receiver_id, create_time),
    INDEX idx_group_chat (group_id, create_time)
);

-- 插入测试数据
INSERT IGNORE INTO tm_users (user_id, username, password, email, status) VALUES
('admin', 'admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iGNEzBvW', 'admin@telemsg.com', 'OFFLINE'),
('test1', 'testuser1', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iGNEzBvW', 'test1@telemsg.com', 'OFFLINE'),
('test2', 'testuser2', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iGNEzBvW', 'test2@telemsg.com', 'OFFLINE');

-- 注释: 默认密码都是 "123456"
