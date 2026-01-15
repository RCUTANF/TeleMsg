/*
 Navicat Premium Dump SQL

 Source Server         : myconn
 Source Server Type    : MySQL
 Source Server Version : 80041 (8.0.41)
 Source Host           : localhost:3306
 Source Schema         : telemsg_db

 Target Server Type    : MySQL
 Target Server Version : 80041 (8.0.41)
 File Encoding         : 65001

 Date: 15/01/2026 10:10:51
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for files
-- ----------------------------
DROP TABLE IF EXISTS `files`;
CREATE TABLE `files`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `file_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `original_filename` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `filename` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `content_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `file_size` bigint NULL DEFAULT NULL,
  `bucket_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `object_key` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `file_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `thumbnail_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `uploader_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_image` tinyint(1) NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `file_id`(`file_id` ASC) USING BTREE,
  INDEX `idx_file_id`(`file_id` ASC) USING BTREE,
  INDEX `idx_uploader_id`(`uploader_id` ASC) USING BTREE,
  INDEX `idx_content_type`(`content_type` ASC) USING BTREE,
  INDEX `idx_created_time`(`created_time` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 21 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of files
-- ----------------------------
INSERT INTO `files` VALUES (7, '0e36e6e8-1484-43cd-9911-09d5048b29ab', '软件需求.docx', '0e36e6e8-1484-43cd-9911-09d5048b29ab.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 349401, 'telemsg-files', '2026/01/13/0e36e6e8-1484-43cd-9911-09d5048b29ab.docx', 'http://localhost:9000/telemsg-files/2026/01/13/0e36e6e8-1484-43cd-9911-09d5048b29ab.docx', NULL, 'U1768272900080722', '2026-01-13 18:47:13', 0);
INSERT INTO `files` VALUES (8, 'e3f095e1-be40-42d8-877c-fcc24791f3d3', '5305f62216d5ff7462.jpg', 'e3f095e1-be40-42d8-877c-fcc24791f3d3.jpg', 'image/jpeg', 106120, 'telemsg-files', '2026/01/13/e3f095e1-be40-42d8-877c-fcc24791f3d3.jpg', 'http://localhost:9000/telemsg-files/2026/01/13/e3f095e1-be40-42d8-877c-fcc24791f3d3.jpg', NULL, 'U1768272900080722', '2026-01-13 20:58:57', 1);
INSERT INTO `files` VALUES (9, 'b0156b2e-df72-408d-a5c6-7067d7e2616e', '计算机网络实验报告.doc', 'b0156b2e-df72-408d-a5c6-7067d7e2616e.doc', 'application/msword', 37888, 'telemsg-files', '2026/01/14/b0156b2e-df72-408d-a5c6-7067d7e2616e.doc', '/api/files/b0156b2e-df72-408d-a5c6-7067d7e2616e/view', NULL, 'U1768211575664873', '2026-01-14 17:06:52', 0);
INSERT INTO `files` VALUES (10, 'f8f6943e-69f2-4fb1-a3e4-a92f84856a1d', '9fa994156b4ecf0172c3cd0971caec4c26633150.jpg', 'f8f6943e-69f2-4fb1-a3e4-a92f84856a1d.jpg', 'image/jpeg', 77724, 'telemsg-files', '2026/01/14/f8f6943e-69f2-4fb1-a3e4-a92f84856a1d.jpg', '/api/files/f8f6943e-69f2-4fb1-a3e4-a92f84856a1d/view', NULL, 'U1768211575664873', '2026-01-14 17:07:07', 1);
INSERT INTO `files` VALUES (11, 'ebc116a9-90c3-43d1-bc02-518ebaef1a59', '崩坏：星穹铁道 2025_2_26 23_44_15.png', 'ebc116a9-90c3-43d1-bc02-518ebaef1a59.png', 'image/png', 8159384, 'telemsg-files', '2026/01/14/ebc116a9-90c3-43d1-bc02-518ebaef1a59.png', '/api/files/ebc116a9-90c3-43d1-bc02-518ebaef1a59/view', NULL, 'U1768272900080722', '2026-01-14 18:31:05', 1);
INSERT INTO `files` VALUES (12, '2003d510-be46-4570-9df1-923fe5417331', '计算机网络复习题及答案.doc', '2003d510-be46-4570-9df1-923fe5417331.doc', 'application/msword', 1313280, 'telemsg-files', '2026/01/14/2003d510-be46-4570-9df1-923fe5417331.doc', '/api/files/2003d510-be46-4570-9df1-923fe5417331/view', NULL, 'U1768272900080722', '2026-01-14 18:31:31', 0);
INSERT INTO `files` VALUES (13, '65ebbd1a-1a9c-4454-98d8-e5a248adf16c', '实验 1.pdf', '65ebbd1a-1a9c-4454-98d8-e5a248adf16c.pdf', 'application/pdf', 241013, 'telemsg-files', '2026/01/14/65ebbd1a-1a9c-4454-98d8-e5a248adf16c.pdf', '/api/files/65ebbd1a-1a9c-4454-98d8-e5a248adf16c/view', NULL, 'U1768272900080722', '2026-01-14 18:31:37', 0);
INSERT INTO `files` VALUES (14, '3e5dc7fe-0e59-4ca6-93b2-8f72f1fd708f', '计算机网络课程设计动员+成绩评定标准.docx', '3e5dc7fe-0e59-4ca6-93b2-8f72f1fd708f.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 1298330, 'telemsg-files', '2026/01/14/3e5dc7fe-0e59-4ca6-93b2-8f72f1fd708f.docx', '/api/files/3e5dc7fe-0e59-4ca6-93b2-8f72f1fd708f/view', NULL, 'U1768211575664873', '2026-01-14 18:32:50', 0);
INSERT INTO `files` VALUES (15, '11c82ca0-da15-48ed-869e-848e1561d8d4', '计算机网络课程设计报告（二版）.docx', '11c82ca0-da15-48ed-869e-848e1561d8d4.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 203973, 'telemsg-files', '2026/01/14/11c82ca0-da15-48ed-869e-848e1561d8d4.docx', '/api/files/11c82ca0-da15-48ed-869e-848e1561d8d4/view', NULL, 'U1768211575664873', '2026-01-14 18:33:16', 0);
INSERT INTO `files` VALUES (16, 'd5b853fb-4d95-434c-9aa6-99cb2efaca7e', '《崩坏：星穹铁道》走近星穹——「银狼：宇宙第一天才骇客！」.mp4_20231231_225452.437.jpg', 'd5b853fb-4d95-434c-9aa6-99cb2efaca7e.jpg', 'image/jpeg', 140735, 'telemsg-files', '2026/01/15/d5b853fb-4d95-434c-9aa6-99cb2efaca7e.jpg', '/api/files/d5b853fb-4d95-434c-9aa6-99cb2efaca7e/view', NULL, 'U1768188726977338', '2026-01-15 09:02:53', 1);
INSERT INTO `files` VALUES (17, 'fe9f8b69-097e-4d9a-9d48-21609a9fb028', '9fa994156b4ecf0172c3cd0971caec4c26633150.jpg', 'fe9f8b69-097e-4d9a-9d48-21609a9fb028.jpg', 'image/jpeg', 77724, 'telemsg-files', '2026/01/15/fe9f8b69-097e-4d9a-9d48-21609a9fb028.jpg', '/api/files/fe9f8b69-097e-4d9a-9d48-21609a9fb028/view', NULL, 'U1768272900080722', '2026-01-15 09:17:09', 1);
INSERT INTO `files` VALUES (18, '959c320f-e316-4dbc-8a3e-2c624fbdc0c0', '测试计划.docx', '959c320f-e316-4dbc-8a3e-2c624fbdc0c0.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 39300, 'telemsg-files', '2026/01/15/959c320f-e316-4dbc-8a3e-2c624fbdc0c0.docx', '/api/files/959c320f-e316-4dbc-8a3e-2c624fbdc0c0/view', NULL, 'U1768188726977338', '2026-01-15 09:24:02', 0);
INSERT INTO `files` VALUES (19, '0fe07a91-ab4e-47a5-bce2-61e353dafd67', '测试计划.docx', '0fe07a91-ab4e-47a5-bce2-61e353dafd67.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 39300, 'telemsg-files', '2026/01/15/0fe07a91-ab4e-47a5-bce2-61e353dafd67.docx', '/api/files/0fe07a91-ab4e-47a5-bce2-61e353dafd67/view', NULL, 'U1768188726977338', '2026-01-15 09:37:44', 0);
INSERT INTO `files` VALUES (20, '8bb26dc2-de9b-4756-b2da-6387a9c0be1c', '32d334c3eda45a9444.jpg', '8bb26dc2-de9b-4756-b2da-6387a9c0be1c.jpg', 'image/jpeg', 505146, 'telemsg-files', '2026/01/15/8bb26dc2-de9b-4756-b2da-6387a9c0be1c.jpg', '/api/files/8bb26dc2-de9b-4756-b2da-6387a9c0be1c/view', NULL, 'U1768211575664873', '2026-01-15 09:55:45', 1);

-- ----------------------------
-- Table structure for permissions
-- ----------------------------
DROP TABLE IF EXISTS `permissions`;
CREATE TABLE `permissions`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `category` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `UK_7lcb6glmvwlro3p2w2cewxtvd`(`code` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 12 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of permissions
-- ----------------------------
INSERT INTO `permissions` VALUES (1, '文件管理', 'file.send', '2026-01-15 08:58:26.118938', '上传并发送文件', '发送文件');
INSERT INTO `permissions` VALUES (2, '文件管理', 'file.receive', '2026-01-15 08:58:26.155321', '接收并下载文件', '接收文件');
INSERT INTO `permissions` VALUES (3, '音视频通话', 'call.voice', '2026-01-15 08:58:26.163048', '发起语音通话', '语音通话');
INSERT INTO `permissions` VALUES (4, '音视频通话', 'call.video', '2026-01-15 08:58:26.168565', '发起视频通话', '视频通话');
INSERT INTO `permissions` VALUES (5, '音视频通话', 'call.screen', '2026-01-15 08:58:26.178617', '共享屏幕内容', '屏幕共享');
INSERT INTO `permissions` VALUES (6, '音视频通话', 'call.record', '2026-01-15 08:58:26.185627', '录制通话内容', '通话录制');
INSERT INTO `permissions` VALUES (7, '群组功能', 'group.create', '2026-01-15 08:58:26.192630', '创建新的群组', '创建群组');
INSERT INTO `permissions` VALUES (8, '群组功能', 'group.manage', '2026-01-15 08:58:26.200454', '管理群组设置和成员', '管理群组');
INSERT INTO `permissions` VALUES (9, '用户管理', 'user.create', '2026-01-15 08:58:26.207735', '添加新用户', '创建用户');
INSERT INTO `permissions` VALUES (10, '用户管理', 'user.edit', '2026-01-15 08:58:26.220111', '修改用户信息', '编辑用户');
INSERT INTO `permissions` VALUES (11, '用户管理', 'user.delete', '2026-01-15 08:58:26.228751', '删除用户账号', '删除用户');

-- ----------------------------
-- Table structure for role_permissions
-- ----------------------------
DROP TABLE IF EXISTS `role_permissions`;
CREATE TABLE `role_permissions`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `enabled` bit(1) NOT NULL,
  `permission_code` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `role_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `UKf89priw0vs2tr5da75mve3qp6`(`role_id` ASC, `permission_code` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 28 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of role_permissions
-- ----------------------------
INSERT INTO `role_permissions` VALUES (1, '2026-01-15 08:58:26.334939', b'1', 'file.send', 'DIRECTOR', '2026-01-15 08:58:26.334939');
INSERT INTO `role_permissions` VALUES (2, '2026-01-15 08:58:26.347611', b'1', 'file.receive', 'DIRECTOR', '2026-01-15 08:58:26.347611');
INSERT INTO `role_permissions` VALUES (3, '2026-01-15 08:58:26.350492', b'1', 'call.voice', 'DIRECTOR', '2026-01-15 08:58:26.350492');
INSERT INTO `role_permissions` VALUES (4, '2026-01-15 08:58:26.353559', b'1', 'call.video', 'DIRECTOR', '2026-01-15 08:58:26.353559');
INSERT INTO `role_permissions` VALUES (5, '2026-01-15 08:58:26.357100', b'1', 'call.screen', 'DIRECTOR', '2026-01-15 08:58:26.357605');
INSERT INTO `role_permissions` VALUES (6, '2026-01-15 08:58:26.360637', b'1', 'call.record', 'DIRECTOR', '2026-01-15 08:58:26.360637');
INSERT INTO `role_permissions` VALUES (7, '2026-01-15 08:58:26.364028', b'1', 'group.create', 'DIRECTOR', '2026-01-15 08:58:26.364028');
INSERT INTO `role_permissions` VALUES (8, '2026-01-15 08:58:26.367028', b'1', 'group.manage', 'DIRECTOR', '2026-01-15 08:58:26.367028');
INSERT INTO `role_permissions` VALUES (9, '2026-01-15 08:58:26.371108', b'1', 'user.create', 'DIRECTOR', '2026-01-15 08:58:26.371108');
INSERT INTO `role_permissions` VALUES (10, '2026-01-15 08:58:26.376106', b'1', 'user.edit', 'DIRECTOR', '2026-01-15 08:58:26.376106');
INSERT INTO `role_permissions` VALUES (11, '2026-01-15 08:58:26.379107', b'1', 'user.delete', 'DIRECTOR', '2026-01-15 08:58:26.379107');
INSERT INTO `role_permissions` VALUES (12, '2026-01-15 08:58:26.388999', b'1', 'file.send', 'MANAGER', '2026-01-15 08:58:26.388999');
INSERT INTO `role_permissions` VALUES (13, '2026-01-15 08:58:26.391999', b'1', 'file.receive', 'MANAGER', '2026-01-15 08:58:26.391999');
INSERT INTO `role_permissions` VALUES (14, '2026-01-15 08:58:26.394997', b'1', 'call.voice', 'MANAGER', '2026-01-15 08:58:26.394997');
INSERT INTO `role_permissions` VALUES (15, '2026-01-15 08:58:26.397086', b'1', 'call.video', 'MANAGER', '2026-01-15 08:58:26.397086');
INSERT INTO `role_permissions` VALUES (16, '2026-01-15 08:58:26.400109', b'1', 'call.screen', 'MANAGER', '2026-01-15 08:58:26.400109');
INSERT INTO `role_permissions` VALUES (17, '2026-01-15 08:58:26.402112', b'1', 'call.record', 'MANAGER', '2026-01-15 08:58:26.403111');
INSERT INTO `role_permissions` VALUES (18, '2026-01-15 08:58:26.404113', b'1', 'group.create', 'MANAGER', '2026-01-15 08:58:26.404113');
INSERT INTO `role_permissions` VALUES (19, '2026-01-15 08:58:26.406631', b'1', 'group.manage', 'MANAGER', '2026-01-15 08:58:26.406631');
INSERT INTO `role_permissions` VALUES (25, '2026-01-15 09:40:41.741785', b'1', 'call.video', 'EMPLOYEE', '2026-01-15 09:40:41.741785');
INSERT INTO `role_permissions` VALUES (26, '2026-01-15 09:40:41.746880', b'1', 'call.voice', 'EMPLOYEE', '2026-01-15 09:40:41.746880');
INSERT INTO `role_permissions` VALUES (27, '2026-01-15 09:40:41.749887', b'1', 'group.create', 'EMPLOYEE', '2026-01-15 09:40:41.750787');

-- ----------------------------
-- Table structure for tm_departments
-- ----------------------------
DROP TABLE IF EXISTS `tm_departments`;
CREATE TABLE `tm_departments`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `create_time` datetime(6) NOT NULL,
  `deleted` bit(1) NOT NULL,
  `department_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `manager_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `parent_department_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `update_time` datetime(6) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `UK_k4wv888cbrh862c0j504229mp`(`department_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of tm_departments
-- ----------------------------
INSERT INTO `tm_departments` VALUES (1, '2026-01-14 18:42:02.536103', b'0', 'D1768387322536400', NULL, '123', '技术部', NULL, '2026-01-14 18:42:02.536103');

-- ----------------------------
-- Table structure for tm_discussion_spaces
-- ----------------------------
DROP TABLE IF EXISTS `tm_discussion_spaces`;
CREATE TABLE `tm_discussion_spaces`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `create_time` datetime(6) NOT NULL,
  `creator_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `deleted` bit(1) NOT NULL,
  `description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `group_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `members` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `space_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `space_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `update_time` datetime(6) NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `UK_pd4uhulg0ijwek9no3qomkdsy`(`space_id` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of tm_discussion_spaces
-- ----------------------------

-- ----------------------------
-- Table structure for tm_group_members
-- ----------------------------
DROP TABLE IF EXISTS `tm_group_members`;
CREATE TABLE `tm_group_members`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `group_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('OWNER','ADMIN','MEMBER') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MEMBER',
  `nickname` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `muted` tinyint(1) NOT NULL DEFAULT 0,
  `muted_until` datetime NULL DEFAULT NULL,
  `join_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_group_user`(`group_id` ASC, `user_id` ASC) USING BTREE,
  UNIQUE INDEX `UKivroh7b19cba1f4qp6mshldox`(`group_id` ASC, `user_id` ASC) USING BTREE,
  INDEX `idx_group_id`(`group_id` ASC) USING BTREE,
  INDEX `idx_user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_role`(`role` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 33 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of tm_group_members
-- ----------------------------
INSERT INTO `tm_group_members` VALUES (1, 'G1768314950541978', 'U1768272900080722', 'OWNER', NULL, 0, NULL, '2026-01-13 22:35:51', '2026-01-13 22:35:51');
INSERT INTO `tm_group_members` VALUES (2, 'G1768314950541978', 'U1768211575664873', 'MEMBER', '', 0, NULL, '2026-01-13 22:35:51', '2026-01-13 22:35:51');
INSERT INTO `tm_group_members` VALUES (3, 'G1768314950541978', 'U1768188726977338', 'MEMBER', '', 0, NULL, '2026-01-13 22:35:51', '2026-01-13 22:35:51');
INSERT INTO `tm_group_members` VALUES (4, 'G176831667846315', 'U1768211575664873', 'OWNER', NULL, 0, NULL, '2026-01-13 23:04:39', '2026-01-13 23:04:39');
INSERT INTO `tm_group_members` VALUES (5, 'G176831667846315', 'U1768272900080722', 'MEMBER', NULL, 0, NULL, '2026-01-13 23:04:39', '2026-01-13 23:04:39');
INSERT INTO `tm_group_members` VALUES (6, 'G176831667846315', 'U1768188726977338', 'MEMBER', NULL, 0, NULL, '2026-01-13 23:04:39', '2026-01-13 23:04:39');
INSERT INTO `tm_group_members` VALUES (7, 'G176831667846315', 'test1', 'MEMBER', NULL, 0, NULL, '2026-01-13 23:04:39', '2026-01-13 23:04:39');
INSERT INTO `tm_group_members` VALUES (8, 'G176831667846315', 'test2', 'MEMBER', NULL, 0, NULL, '2026-01-13 23:04:39', '2026-01-13 23:04:39');
INSERT INTO `tm_group_members` VALUES (9, 'G1768356563512165', 'U1768272900080722', 'OWNER', NULL, 0, NULL, '2026-01-14 10:09:24', '2026-01-14 10:09:24');
INSERT INTO `tm_group_members` VALUES (10, 'G1768356563512165', 'U1768188726977338', 'MEMBER', NULL, 0, NULL, '2026-01-14 10:09:24', '2026-01-14 10:09:24');
INSERT INTO `tm_group_members` VALUES (11, 'G1768359009167593', 'U1768272900080722', 'OWNER', NULL, 0, NULL, '2026-01-14 10:50:09', '2026-01-14 10:50:09');
INSERT INTO `tm_group_members` VALUES (12, 'G1768359009167593', 'U1768188726977338', 'MEMBER', NULL, 0, NULL, '2026-01-14 10:50:09', '2026-01-14 10:50:09');
INSERT INTO `tm_group_members` VALUES (13, 'G1768359009167593', 'U1768211575664873', 'MEMBER', NULL, 0, NULL, '2026-01-14 10:50:09', '2026-01-14 10:50:09');
INSERT INTO `tm_group_members` VALUES (14, 'G1768359141041351', 'U1768188726977338', 'OWNER', NULL, 0, NULL, '2026-01-14 10:52:21', '2026-01-14 10:52:21');
INSERT INTO `tm_group_members` VALUES (16, 'G1768359141041351', 'U1768211575664873', 'MEMBER', NULL, 0, NULL, '2026-01-14 10:52:40', '2026-01-14 10:52:40');
INSERT INTO `tm_group_members` VALUES (17, 'G1768359786891892', 'U1768272900080722', 'OWNER', NULL, 0, NULL, '2026-01-14 11:03:07', '2026-01-14 11:03:07');
INSERT INTO `tm_group_members` VALUES (18, 'G1768359786891892', 'U1768188726977338', 'MEMBER', NULL, 0, NULL, '2026-01-14 11:03:07', '2026-01-14 11:03:07');
INSERT INTO `tm_group_members` VALUES (19, 'G1768359786891892', 'U1768211575664873', 'MEMBER', NULL, 0, NULL, '2026-01-14 11:03:07', '2026-01-14 11:03:07');
INSERT INTO `tm_group_members` VALUES (20, 'G1768359813814174', 'U1768272900080722', 'OWNER', NULL, 0, NULL, '2026-01-14 11:03:34', '2026-01-14 11:03:34');
INSERT INTO `tm_group_members` VALUES (21, 'G1768359813814174', 'U1768211575664873', 'MEMBER', NULL, 0, NULL, '2026-01-14 11:03:34', '2026-01-14 11:03:34');
INSERT INTO `tm_group_members` VALUES (22, 'G1768359813814174', 'U1768188726977338', 'MEMBER', NULL, 0, NULL, '2026-01-14 11:03:34', '2026-01-14 11:03:34');
INSERT INTO `tm_group_members` VALUES (23, 'G1768359813814174', 'test1', 'MEMBER', NULL, 0, NULL, '2026-01-14 11:03:34', '2026-01-14 11:03:34');
INSERT INTO `tm_group_members` VALUES (24, 'G1768361478349861', 'U1768272900080722', 'OWNER', NULL, 0, NULL, '2026-01-14 11:31:19', '2026-01-14 11:31:19');
INSERT INTO `tm_group_members` VALUES (25, 'G1768361478349861', 'U1768211575664873', 'MEMBER', NULL, 0, NULL, '2026-01-14 11:31:19', '2026-01-14 11:31:19');
INSERT INTO `tm_group_members` VALUES (27, 'G1768441172171752', 'U1768211575664873', 'OWNER', NULL, 0, NULL, '2026-01-15 09:39:32', '2026-01-15 09:39:32');
INSERT INTO `tm_group_members` VALUES (28, 'G1768441172171752', 'U1768188726977338', 'MEMBER', NULL, 0, NULL, '2026-01-15 09:39:32', '2026-01-15 09:39:32');
INSERT INTO `tm_group_members` VALUES (31, 'G1768441309360211', 'U1768272900080722', 'OWNER', NULL, 0, NULL, '2026-01-15 09:41:49', '2026-01-15 09:41:49');
INSERT INTO `tm_group_members` VALUES (32, 'G1768441309360211', 'U1768188726977338', 'MEMBER', NULL, 0, NULL, '2026-01-15 09:41:49', '2026-01-15 09:41:49');

-- ----------------------------
-- Table structure for tm_groups
-- ----------------------------
DROP TABLE IF EXISTS `tm_groups`;
CREATE TABLE `tm_groups`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `group_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `group_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `avatar` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `owner_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('NORMAL','ANNOUNCE','PRIVATE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NORMAL',
  `max_members` int NOT NULL DEFAULT 500,
  `deleted` tinyint(1) NOT NULL DEFAULT 0,
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `parent_group_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '父群组ID - 用于讨论空间，如果为空则表示是普通群聊或父群聊',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `group_id`(`group_id` ASC) USING BTREE,
  INDEX `idx_group_id`(`group_id` ASC) USING BTREE,
  INDEX `idx_owner_id`(`owner_id` ASC) USING BTREE,
  INDEX `idx_group_name`(`group_name` ASC) USING BTREE,
  INDEX `idx_parent_group_id`(`parent_group_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 11 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of tm_groups
-- ----------------------------
INSERT INTO `tm_groups` VALUES (1, 'G1768314950541978', 'abcd', '由 123 创建的群组', NULL, 'U1768272900080722', 'NORMAL', 500, 0, '2026-01-13 22:35:51', '2026-01-13 22:35:51', NULL);
INSERT INTO `tm_groups` VALUES (2, 'G176831667846315', 'aa', '', NULL, 'U1768211575664873', 'NORMAL', 500, 0, '2026-01-13 23:04:38', '2026-01-13 23:04:38', NULL);
INSERT INTO `tm_groups` VALUES (3, 'G1768356563512165', 'aq', '', NULL, 'U1768272900080722', 'NORMAL', 500, 0, '2026-01-14 10:09:24', '2026-01-14 10:09:24', 'G1768314950541978');
INSERT INTO `tm_groups` VALUES (4, 'G1768359009167593', 'aw', '', NULL, 'U1768272900080722', 'NORMAL', 500, 0, '2026-01-14 10:50:09', '2026-01-14 10:50:09', 'G1768314950541978');
INSERT INTO `tm_groups` VALUES (5, 'G1768359141041351', 'zz', '', NULL, 'U1768188726977338', 'NORMAL', 500, 0, '2026-01-14 10:52:21', '2026-01-14 10:52:21', 'G1768359009167593');
INSERT INTO `tm_groups` VALUES (6, 'G1768359786891892', 'test1', '', NULL, 'U1768272900080722', 'NORMAL', 500, 0, '2026-01-14 11:03:07', '2026-01-14 11:03:07', 'G1768314950541978');
INSERT INTO `tm_groups` VALUES (7, 'G1768359813814174', 'test2', '', NULL, 'U1768272900080722', 'NORMAL', 500, 0, '2026-01-14 11:03:34', '2026-01-14 11:03:34', 'G176831667846315');
INSERT INTO `tm_groups` VALUES (8, 'G1768361478349861', 'n', '', NULL, 'U1768272900080722', 'NORMAL', 500, 0, '2026-01-14 11:31:18', '2026-01-14 11:31:18', 'G176831667846315');
INSERT INTO `tm_groups` VALUES (9, 'G1768441172171752', 'test', '', NULL, 'U1768211575664873', 'NORMAL', 500, 0, '2026-01-15 09:39:32', '2026-01-15 09:39:32', 'G1768314950541978');
INSERT INTO `tm_groups` VALUES (10, 'G1768441309360211', 'taolunqu1', '', NULL, 'U1768272900080722', 'NORMAL', 500, 0, '2026-01-15 09:41:49', '2026-01-15 09:41:49', 'G1768314950541978');

-- ----------------------------
-- Table structure for tm_messages
-- ----------------------------
DROP TABLE IF EXISTS `tm_messages`;
CREATE TABLE `tm_messages`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `message_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sender_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `receiver_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `group_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `message_type` enum('TEXT','IMAGE','VOICE','VIDEO','FILE','SYSTEM') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `media_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `file_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `file_size` bigint NULL DEFAULT NULL,
  `file_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'MinIO文件ID',
  `thumbnail_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '缩略图URL (仅图片类型)',
  `status` enum('SENT','DELIVERED','READ','FAILED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SENT',
  `deleted` tinyint(1) NOT NULL DEFAULT 0,
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `message_id`(`message_id` ASC) USING BTREE,
  INDEX `idx_message_id`(`message_id` ASC) USING BTREE,
  INDEX `idx_sender_id`(`sender_id` ASC) USING BTREE,
  INDEX `idx_receiver_id`(`receiver_id` ASC) USING BTREE,
  INDEX `idx_group_id`(`group_id` ASC) USING BTREE,
  INDEX `idx_create_time`(`create_time` ASC) USING BTREE,
  INDEX `idx_private_chat`(`sender_id` ASC, `receiver_id` ASC, `create_time` ASC) USING BTREE,
  INDEX `idx_group_chat`(`group_id` ASC, `create_time` ASC) USING BTREE,
  INDEX `idx_file_id`(`file_id` ASC) USING BTREE,
  INDEX `idx_sender`(`sender_id` ASC) USING BTREE,
  INDEX `idx_receiver`(`receiver_id` ASC) USING BTREE,
  INDEX `idx_group`(`group_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 122 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of tm_messages
-- ----------------------------
INSERT INTO `tm_messages` VALUES (1, '876F89D4D7DB4C96A73493B32C1B3FC6', 'U1768188726977338', 'admin', NULL, 'TEXT', '1', NULL, NULL, NULL, NULL, NULL, 'SENT', 0, '2026-01-12 11:48:23', '2026-01-12 11:48:23');
INSERT INTO `tm_messages` VALUES (2, '3C39873420EB4177907C2596118C5FD6', 'U1768188726977338', 'admin', NULL, 'TEXT', '12', NULL, NULL, NULL, NULL, NULL, 'SENT', 0, '2026-01-12 11:48:37', '2026-01-12 11:48:37');
INSERT INTO `tm_messages` VALUES (3, '936AF9F5F9FC41C59F4F0BEA4901CE1C', 'U1768188726977338', 'test1', NULL, 'TEXT', '111', NULL, NULL, NULL, NULL, NULL, 'SENT', 0, '2026-01-12 11:54:48', '2026-01-12 11:54:48');
INSERT INTO `tm_messages` VALUES (4, '8E013FB64D384F629970463D979C28E4', 'U1768188726977338', 'admin', NULL, 'TEXT', '111', NULL, NULL, NULL, NULL, NULL, 'SENT', 0, '2026-01-12 11:54:59', '2026-01-12 11:54:59');
INSERT INTO `tm_messages` VALUES (5, '2C8C0216980D4EAD91F020A1B328A6D0', 'U1768188726977338', 'admin', NULL, 'TEXT', '123456', NULL, NULL, NULL, NULL, NULL, 'SENT', 0, '2026-01-12 12:12:46', '2026-01-12 12:12:46');
INSERT INTO `tm_messages` VALUES (6, '6A973B5E62834725967624E72FEC1A9E', 'U1768188726977338', 'admin', NULL, 'TEXT', '1111', NULL, NULL, NULL, NULL, NULL, 'SENT', 0, '2026-01-12 12:13:48', '2026-01-12 12:13:48');
INSERT INTO `tm_messages` VALUES (7, '6129BF094FB146C7BAFC272D07BC27B5', 'U1768188726977338', 'admin', NULL, 'TEXT', '。', NULL, NULL, NULL, NULL, NULL, 'SENT', 0, '2026-01-12 12:14:41', '2026-01-12 12:14:41');
INSERT INTO `tm_messages` VALUES (8, 'C59013B30B7441AEB15780A5CF3EF8EE', 'U1768188726977338', 'admin', NULL, 'TEXT', '4', NULL, NULL, NULL, NULL, NULL, 'SENT', 0, '2026-01-12 12:21:38', '2026-01-12 12:21:38');
INSERT INTO `tm_messages` VALUES (9, '44CEBA7FC6A84E369E9F3944E7138EDE', 'U1768188726977338', 'admin', NULL, 'TEXT', 'hello', NULL, NULL, NULL, NULL, NULL, 'SENT', 0, '2026-01-12 17:51:22', '2026-01-12 17:51:22');
INSERT INTO `tm_messages` VALUES (10, 'DB5D63DCAE304F9F816C1737F4EA43F9', 'U1768188726977338', 'test1', NULL, 'TEXT', 'hello', NULL, NULL, NULL, NULL, NULL, 'SENT', 0, '2026-01-12 17:51:42', '2026-01-12 17:51:42');
INSERT INTO `tm_messages` VALUES (11, '72566333E64146E8B2821A4C435010E0', 'U1768211575664873', 'U1768188726977338', NULL, 'TEXT', 'hello', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-12 17:53:05', '2026-01-13 23:44:04');
INSERT INTO `tm_messages` VALUES (12, 'ECD233A84A6E49D48E62E5B933D63328', 'U1768188726977338', 'U1768211575664873', NULL, 'TEXT', 'bye', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-12 17:53:35', '2026-01-13 11:04:37');
INSERT INTO `tm_messages` VALUES (13, '4CF957A1FC83462E922808346920073A', 'U1768211575664873', 'U1768188726977338', NULL, 'TEXT', '你好', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-12 18:06:04', '2026-01-13 23:44:04');
INSERT INTO `tm_messages` VALUES (14, '84360C70B81742AAA3B54F3160AE2162', 'U1768188726977338', 'U1768211575664873', NULL, 'TEXT', 'test', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-12 18:07:13', '2026-01-13 11:04:37');
INSERT INTO `tm_messages` VALUES (15, 'A8B672AD610846C4A8376400CD7E2F6E', 'U1768188726977338', 'U1768211575664873', NULL, 'TEXT', '1', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-12 18:22:29', '2026-01-13 11:04:37');
INSERT INTO `tm_messages` VALUES (16, 'BC763682D3FC4D3E91C69CE639A52FF9', 'U1768211575664873', 'U1768188726977338', NULL, 'TEXT', '1', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-12 18:23:06', '2026-01-13 23:44:04');
INSERT INTO `tm_messages` VALUES (17, 'FCB9AC995ACE400BB11AE50B89FB4D91', 'U1768188726977338', 'U1768211575664873', NULL, 'TEXT', '1', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-13 09:38:00', '2026-01-13 11:04:37');
INSERT INTO `tm_messages` VALUES (18, '1D5AA6524EA740B097414CE8655F5ACA', 'U1768188726977338', 'U1768211575664873', NULL, 'TEXT', 'new', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-13 10:27:26', '2026-01-13 11:04:37');
INSERT INTO `tm_messages` VALUES (19, '82378C45945F49B0AA53E1731A7965E9', 'U1768211575664873', 'U1768188726977338', NULL, 'TEXT', 'new', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-13 10:31:16', '2026-01-13 23:44:04');
INSERT INTO `tm_messages` VALUES (20, 'A23F0E331DC547999631D3BA43D5C8FF', 'U1768188726977338', 'U1768211575664873', NULL, 'TEXT', '1', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-13 10:31:44', '2026-01-13 11:04:37');
INSERT INTO `tm_messages` VALUES (21, '42D31FE7BCAD478B80B5FE1CEBCAD9CF', 'U1768188726977338', 'U1768211575664873', NULL, 'TEXT', 'test', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-13 10:36:16', '2026-01-13 11:04:37');
INSERT INTO `tm_messages` VALUES (22, '7B583EB2573B4EB3A7A9927D3DEA2D7C', 'U1768211575664873', 'admin', NULL, 'TEXT', '？', NULL, NULL, NULL, NULL, NULL, 'SENT', 0, '2026-01-13 10:37:53', '2026-01-13 10:37:53');
INSERT INTO `tm_messages` VALUES (23, 'F86F00876DFA4DFA90FEA3E53D521D69', 'U1768272900080722', 'U1768211575664873', NULL, 'TEXT', '123', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-13 10:55:39', '2026-01-13 11:04:34');
INSERT INTO `tm_messages` VALUES (24, 'E3E53F104EDD45029A85CBA72B11F287', 'U1768211575664873', 'U1768272900080722', NULL, 'TEXT', '111', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-13 11:05:07', '2026-01-13 11:05:41');
INSERT INTO `tm_messages` VALUES (25, 'E54DEB75CF6F40C0B0B1F7CDA478C414', 'U1768211575664873', 'U1768272900080722', NULL, 'TEXT', '111', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-13 11:05:09', '2026-01-13 11:05:41');
INSERT INTO `tm_messages` VALUES (26, '2FA53A54B4A54EC7936942F6CBF07A8B', 'U1768211575664873', 'U1768272900080722', NULL, 'TEXT', '6', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-13 11:13:14', '2026-01-13 11:13:43');
INSERT INTO `tm_messages` VALUES (27, '71DB451967134E8380E54D0C7214B529', 'U1768211575664873', 'U1768272900080722', NULL, 'TEXT', '6', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-13 11:13:15', '2026-01-13 11:13:43');
INSERT INTO `tm_messages` VALUES (28, 'C9F08CC524184BC3BC5A9AB358DA352D', 'U1768272900080722', 'U1768211575664873', NULL, 'TEXT', '1', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-13 11:13:57', '2026-01-13 11:14:11');
INSERT INTO `tm_messages` VALUES (29, '7478C7087AA940DCBF5CEA62A943CF9E', 'U1768272900080722', 'U1768211575664873', NULL, 'TEXT', '1', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-13 11:13:57', '2026-01-13 11:14:11');
INSERT INTO `tm_messages` VALUES (30, 'CD34966242A2427A8C7A58DD1144E642', 'U1768272900080722', 'U1768211575664873', NULL, 'TEXT', '1', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-13 11:13:58', '2026-01-13 11:14:11');
INSERT INTO `tm_messages` VALUES (31, 'FBD3EA8DAB8342F69EDB3DF963D327EB', 'U1768211575664873', 'U1768272900080722', NULL, 'TEXT', 'new', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-13 11:18:27', '2026-01-13 11:18:52');
INSERT INTO `tm_messages` VALUES (32, 'F5FC4885B7334A57B01D6EE224FEA9C9', 'U1768211575664873', 'U1768272900080722', NULL, 'TEXT', 'hello', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-13 11:31:43', '2026-01-13 11:32:19');
INSERT INTO `tm_messages` VALUES (33, '27BAAFAA17E34C7185E3E744D11423C8', 'U1768211575664873', 'U1768272900080722', NULL, 'TEXT', 'nihao', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-13 16:10:23', '2026-01-13 16:10:52');
INSERT INTO `tm_messages` VALUES (34, 'D34145CB19F04BAAB75BE6D42B0813CD', 'U1768272900080722', 'U1768211575664873', NULL, 'FILE', '软件需求.docx', 'http://localhost:9000/telemsg-files/2026/01/13/0e36e6e8-1484-43cd-9911-09d5048b29ab.docx', '软件需求.docx', 349401, '0e36e6e8-1484-43cd-9911-09d5048b29ab', NULL, 'READ', 0, '2026-01-13 18:47:13', '2026-01-13 18:47:32');
INSERT INTO `tm_messages` VALUES (35, '0646BEA992EC4748BDA3C5F70115B5CE', 'U1768272900080722', 'U1768211575664873', NULL, 'IMAGE', '5305f62216d5ff7462.jpg', 'http://localhost:9000/telemsg-files/2026/01/13/e3f095e1-be40-42d8-877c-fcc24791f3d3.jpg', '5305f62216d5ff7462.jpg', 106120, 'e3f095e1-be40-42d8-877c-fcc24791f3d3', NULL, 'READ', 0, '2026-01-13 20:58:57', '2026-01-13 20:59:15');
INSERT INTO `tm_messages` VALUES (36, '6345ECA04D02420199A84E70927D9149', 'U1768272900080722', NULL, 'G1768314950541978', 'TEXT', '111', NULL, NULL, NULL, NULL, NULL, 'SENT', 0, '2026-01-13 22:36:02', '2026-01-13 22:36:02');
INSERT INTO `tm_messages` VALUES (37, '3C395A83BD1A4A70942776A4B087BAD5', 'U1768272900080722', NULL, 'G1768314950541978', 'TEXT', '123', NULL, NULL, NULL, NULL, NULL, 'SENT', 0, '2026-01-13 23:21:19', '2026-01-13 23:21:19');
INSERT INTO `tm_messages` VALUES (38, '6E61640705604FACAAD47E42D5F7E716', 'U1768272900080722', NULL, 'G1768314950541978', 'TEXT', 'hello', NULL, NULL, NULL, NULL, NULL, 'SENT', 0, '2026-01-13 23:34:49', '2026-01-13 23:34:49');
INSERT INTO `tm_messages` VALUES (39, 'CCA2EB89A04F4266AAB30D86813F8891', 'U1768211575664873', NULL, 'G1768314950541978', 'TEXT', '666', NULL, NULL, NULL, NULL, NULL, 'SENT', 0, '2026-01-13 23:35:25', '2026-01-13 23:35:25');
INSERT INTO `tm_messages` VALUES (40, '6C15E14B4BFF4A93B12986EE1149F581', 'U1768211575664873', NULL, 'G1768314950541978', 'TEXT', '666', NULL, NULL, NULL, NULL, NULL, 'SENT', 0, '2026-01-13 23:35:27', '2026-01-13 23:35:27');
INSERT INTO `tm_messages` VALUES (41, '2BB3536D41E3477B8FA9C3DC0BCAF039', 'U1768272900080722', NULL, 'G1768314950541978', 'TEXT', '11', NULL, NULL, NULL, NULL, NULL, 'SENT', 0, '2026-01-13 23:35:56', '2026-01-13 23:35:56');
INSERT INTO `tm_messages` VALUES (42, '9F38D346CDE747408B9E9284FAD79F68', 'U1768272900080722', NULL, 'G1768314950541978', 'TEXT', '11', NULL, NULL, NULL, NULL, NULL, 'SENT', 0, '2026-01-13 23:35:56', '2026-01-13 23:35:56');
INSERT INTO `tm_messages` VALUES (43, 'BEB11CA3B1784CB79F03B34D2359604B', 'U1768272900080722', NULL, 'G1768314950541978', 'TEXT', '11', NULL, NULL, NULL, NULL, NULL, 'SENT', 0, '2026-01-13 23:35:57', '2026-01-13 23:35:57');
INSERT INTO `tm_messages` VALUES (44, 'C3FAA12273534A458B2CE8FFB53796A8', 'U1768272900080722', NULL, 'G1768314950541978', 'TEXT', '11', NULL, NULL, NULL, NULL, NULL, 'SENT', 0, '2026-01-13 23:35:58', '2026-01-13 23:35:58');
INSERT INTO `tm_messages` VALUES (45, '3A882EF7162747D68A00ABA7571CA5F2', 'U1768272900080722', NULL, 'G1768314950541978', 'TEXT', '1111', NULL, NULL, NULL, NULL, NULL, 'SENT', 0, '2026-01-13 23:36:00', '2026-01-13 23:36:00');
INSERT INTO `tm_messages` VALUES (46, '1C91F00B1CAC4869A9212B32DAB85B01', 'U1768211575664873', NULL, 'G1768314950541978', 'TEXT', 'new', NULL, NULL, NULL, NULL, NULL, 'SENT', 0, '2026-01-13 23:43:27', '2026-01-13 23:43:27');
INSERT INTO `tm_messages` VALUES (47, '7FFCB0B7E9074F40A97A36992C9023B4', 'U1768211575664873', NULL, 'G1768314950541978', 'TEXT', 'new', NULL, NULL, NULL, NULL, NULL, 'SENT', 0, '2026-01-13 23:43:28', '2026-01-13 23:43:28');
INSERT INTO `tm_messages` VALUES (48, '6E6F8FD6D42A4ED7918E98A491A31C2F', 'U1768272900080722', NULL, 'G1768314950541978', 'TEXT', 'hello', NULL, NULL, NULL, NULL, NULL, 'SENT', 0, '2026-01-14 09:24:33', '2026-01-14 09:24:33');
INSERT INTO `tm_messages` VALUES (49, '5B9BE85F3BA548C3A7BDECE030C06972', 'U1768272900080722', NULL, 'G1768314950541978', 'TEXT', '引用 未知用户：\nhello\n\n引用 未知用户：\n11\n\n引用 123456：\n666', NULL, NULL, NULL, NULL, NULL, 'SENT', 0, '2026-01-14 10:09:48', '2026-01-14 10:09:48');
INSERT INTO `tm_messages` VALUES (50, 'BD1355DECA3845F8A4C1FE8E14A2EDCC', 'U1768272900080722', NULL, 'G1768314950541978', 'TEXT', '111', NULL, NULL, NULL, NULL, NULL, 'SENT', 0, '2026-01-14 10:09:53', '2026-01-14 10:09:53');
INSERT INTO `tm_messages` VALUES (51, '14A020FD8BDC4491B1AF09BAA8800025', 'U1768272900080722', NULL, 'G1768314950541978', 'TEXT', '123', NULL, NULL, NULL, NULL, NULL, 'SENT', 0, '2026-01-14 10:10:17', '2026-01-14 10:10:17');
INSERT INTO `tm_messages` VALUES (52, 'A3DBE9B69B9A491FA7A56AC3C0A350F9', 'U1768188726977338', NULL, 'G1768314950541978', 'TEXT', '11', NULL, NULL, NULL, NULL, NULL, 'SENT', 0, '2026-01-14 10:10:59', '2026-01-14 10:10:59');
INSERT INTO `tm_messages` VALUES (53, '548F03D0107C46B79B2D06C0379C942C', 'U1768188726977338', NULL, 'G1768314950541978', 'TEXT', 'yh', NULL, NULL, NULL, NULL, NULL, 'SENT', 0, '2026-01-14 10:11:16', '2026-01-14 10:11:16');
INSERT INTO `tm_messages` VALUES (54, 'F8E7673D84A640E0B851460218FCF3B3', 'U1768272900080722', NULL, 'G1768356563512165', 'TEXT', '111', NULL, NULL, NULL, NULL, NULL, 'SENT', 0, '2026-01-14 10:25:40', '2026-01-14 10:25:40');
INSERT INTO `tm_messages` VALUES (55, 'D08B66EE6163496C890D34874AE72276', 'U1768188726977338', NULL, 'G1768356563512165', 'TEXT', '引用 123：\n111\n\n引用 123：\n123\n\n引用 123：\nhello', NULL, NULL, NULL, NULL, NULL, 'SENT', 0, '2026-01-14 10:27:11', '2026-01-14 10:27:11');
INSERT INTO `tm_messages` VALUES (56, '35DB7F324E014CC788C2E6B4923A27A5', 'U1768272900080722', NULL, 'G1768359009167593', 'TEXT', 'qwe', NULL, NULL, NULL, NULL, NULL, 'SENT', 0, '2026-01-14 10:50:41', '2026-01-14 10:50:41');
INSERT INTO `tm_messages` VALUES (57, 'C3B6D59BBAB647188C36E329B4F8B95A', 'U1768272900080722', NULL, 'G1768359786891892', 'TEXT', '1', NULL, NULL, NULL, NULL, NULL, 'SENT', 0, '2026-01-14 11:55:11', '2026-01-14 11:55:11');
INSERT INTO `tm_messages` VALUES (58, 'C0AE4C17941E42DFA953FE20ECE3D2B8', 'U1768272900080722', 'U1768211575664873', NULL, 'TEXT', '1', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-14 12:03:38', '2026-01-14 12:16:07');
INSERT INTO `tm_messages` VALUES (59, '3E7A239AE6294E7BAE35002CF35375A6', 'U1768272900080722', NULL, 'G1768314950541978', 'TEXT', '1', NULL, NULL, NULL, NULL, NULL, 'SENT', 0, '2026-01-14 12:03:47', '2026-01-14 12:03:47');
INSERT INTO `tm_messages` VALUES (60, 'F4FE35ABDB814461BA98D6B408BC42C5', 'U1768272900080722', 'U1768211575664873', NULL, 'TEXT', '111', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-14 12:16:25', '2026-01-14 12:16:35');
INSERT INTO `tm_messages` VALUES (61, 'EFA5AA4DF94A4FDA8D5C07D37F2B697D', 'U1768272900080722', 'U1768211575664873', NULL, 'TEXT', 'new', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-14 12:17:15', '2026-01-14 14:55:25');
INSERT INTO `tm_messages` VALUES (62, '5F192D07376F4DF38D069EBBF7F34DC7', 'U1768211575664873', 'U1768272900080722', NULL, 'TEXT', 'nihao', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-14 12:17:26', '2026-01-14 14:55:05');
INSERT INTO `tm_messages` VALUES (63, '3DEB509F6CE44EB6892DEDEB5FF0F404', 'U1768272900080722', 'U1768211575664873', NULL, 'TEXT', 'hello', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-14 14:55:49', '2026-01-14 14:56:02');
INSERT INTO `tm_messages` VALUES (64, '4A04B83DC2DA4D6FA530DF761544886D', 'U1768272900080722', 'U1768211575664873', NULL, 'TEXT', 'hello', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-14 15:19:46', '2026-01-14 15:20:11');
INSERT INTO `tm_messages` VALUES (65, '9612BE8E6C9043C59C315C3EF174F49A', 'U1768211575664873', 'U1768272900080722', NULL, 'TEXT', 'new', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-14 15:39:25', '2026-01-14 15:39:27');
INSERT INTO `tm_messages` VALUES (66, '0734635E8ADB4F0ABF4C39EBF460D0BA', 'U1768272900080722', 'U1768211575664873', NULL, 'TEXT', 'hello', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-14 15:49:49', '2026-01-14 15:49:55');
INSERT INTO `tm_messages` VALUES (67, '1104D7353CC04DA8AE716E7402F52709', 'U1768211575664873', 'U1768272900080722', NULL, 'TEXT', 'yes', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-14 15:50:08', '2026-01-14 15:50:23');
INSERT INTO `tm_messages` VALUES (68, 'EA8F5D7840BF41AC90D94ACB2DF46A8A', 'U1768211575664873', 'U1768272900080722', NULL, 'TEXT', 'now', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-14 16:01:07', '2026-01-14 16:01:16');
INSERT INTO `tm_messages` VALUES (69, '224E20D88D094BB08C4A8910A350FFCB', 'U1768272900080722', 'U1768211575664873', NULL, 'TEXT', 'hello', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-14 16:27:03', '2026-01-14 16:28:24');
INSERT INTO `tm_messages` VALUES (70, 'EA016D35F637413F999DA8DD6DCD74F7', 'U1768272900080722', 'U1768211575664873', NULL, 'TEXT', 'hello', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-14 16:27:28', '2026-01-14 16:28:24');
INSERT INTO `tm_messages` VALUES (71, '7606AF024B104D15ACB66CE09C130741', 'U1768211575664873', 'U1768272900080722', NULL, 'TEXT', 'yes', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-14 16:28:03', '2026-01-14 16:28:34');
INSERT INTO `tm_messages` VALUES (72, 'BB61BBA5C2894E4D8091444A28E8EA1B', 'U1768272900080722', 'U1768211575664873', NULL, 'TEXT', '新消息', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-14 16:44:23', '2026-01-14 17:06:09');
INSERT INTO `tm_messages` VALUES (73, '1FE4D62521174AAF9D4D552AFDA729B4', 'U1768211575664873', 'U1768272900080722', NULL, 'TEXT', '收到', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-14 16:44:31', '2026-01-14 16:52:57');
INSERT INTO `tm_messages` VALUES (74, '4390383372A54D72B71150D7300BDA46', 'U1768211575664873', NULL, 'G1768314950541978', 'FILE', '计算机网络实验报告.doc', '/api/files/b0156b2e-df72-408d-a5c6-7067d7e2616e/view', '计算机网络实验报告.doc', 37888, 'b0156b2e-df72-408d-a5c6-7067d7e2616e', NULL, 'SENT', 0, '2026-01-14 17:06:52', '2026-01-14 17:06:52');
INSERT INTO `tm_messages` VALUES (75, 'EE770AB3966A4E18A69D6C284702A334', 'U1768211575664873', NULL, 'G1768314950541978', 'IMAGE', '9fa994156b4ecf0172c3cd0971caec4c26633150.jpg', '/api/files/f8f6943e-69f2-4fb1-a3e4-a92f84856a1d/view', '9fa994156b4ecf0172c3cd0971caec4c26633150.jpg', 77724, 'f8f6943e-69f2-4fb1-a3e4-a92f84856a1d', NULL, 'SENT', 0, '2026-01-14 17:07:07', '2026-01-14 17:07:07');
INSERT INTO `tm_messages` VALUES (76, '7EAF9867356D4F288EEBEDE4F2DDB57D', 'U1768272900080722', NULL, 'G1768314950541978', 'TEXT', '收到', NULL, NULL, NULL, NULL, NULL, 'SENT', 0, '2026-01-14 17:07:45', '2026-01-14 17:07:45');
INSERT INTO `tm_messages` VALUES (77, '47D3F6A2630E426E8CC16079F7AC1081', 'U1768211575664873', NULL, 'G1768314950541978', 'TEXT', '111', NULL, NULL, NULL, NULL, NULL, 'SENT', 0, '2026-01-14 18:30:19', '2026-01-14 18:30:19');
INSERT INTO `tm_messages` VALUES (78, '67F277E063EC4AD59B2139C67E3D2AAA', 'U1768272900080722', NULL, 'G1768314950541978', 'TEXT', 'hello', NULL, NULL, NULL, NULL, NULL, 'SENT', 0, '2026-01-14 18:30:57', '2026-01-14 18:30:57');
INSERT INTO `tm_messages` VALUES (79, '7B32E947C2DF41628AD10DAC582D4E08', 'U1768272900080722', NULL, 'G1768314950541978', 'IMAGE', '崩坏：星穹铁道 2025_2_26 23_44_15.png', '/api/files/ebc116a9-90c3-43d1-bc02-518ebaef1a59/view', '崩坏：星穹铁道 2025_2_26 23_44_15.png', 8159384, 'ebc116a9-90c3-43d1-bc02-518ebaef1a59', NULL, 'SENT', 0, '2026-01-14 18:31:05', '2026-01-14 18:31:05');
INSERT INTO `tm_messages` VALUES (80, 'FA91F9A3448E4396B8C0C04F31F57CA7', 'U1768272900080722', NULL, 'G1768314950541978', 'FILE', '计算机网络复习题及答案.doc', '/api/files/2003d510-be46-4570-9df1-923fe5417331/view', '计算机网络复习题及答案.doc', 1313280, '2003d510-be46-4570-9df1-923fe5417331', NULL, 'SENT', 0, '2026-01-14 18:31:31', '2026-01-14 18:31:31');
INSERT INTO `tm_messages` VALUES (81, '692AC7F3332D47DAB86D0047C581BE9D', 'U1768272900080722', NULL, 'G1768314950541978', 'FILE', '实验 1.pdf', '/api/files/65ebbd1a-1a9c-4454-98d8-e5a248adf16c/view', '实验 1.pdf', 241013, '65ebbd1a-1a9c-4454-98d8-e5a248adf16c', NULL, 'SENT', 0, '2026-01-14 18:31:37', '2026-01-14 18:31:37');
INSERT INTO `tm_messages` VALUES (82, '12B9A0E453E24D16B4F803C73BFD925F', 'U1768272900080722', 'U1768211575664873', NULL, 'TEXT', '123', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-14 18:32:23', '2026-01-14 18:35:15');
INSERT INTO `tm_messages` VALUES (83, '153DF872DA5C450480C563CD7D97DCE6', 'U1768211575664873', NULL, 'G1768314950541978', 'FILE', '计算机网络课程设计动员+成绩评定标准.docx', '/api/files/3e5dc7fe-0e59-4ca6-93b2-8f72f1fd708f/view', '计算机网络课程设计动员+成绩评定标准.docx', 1298330, '3e5dc7fe-0e59-4ca6-93b2-8f72f1fd708f', NULL, 'SENT', 0, '2026-01-14 18:32:50', '2026-01-14 18:32:50');
INSERT INTO `tm_messages` VALUES (84, '347C5BAB141642A994FF8967A0943CC8', 'U1768211575664873', NULL, 'G1768314950541978', 'FILE', '计算机网络课程设计报告（二版）.docx', '/api/files/11c82ca0-da15-48ed-869e-848e1561d8d4/view', '计算机网络课程设计报告（二版）.docx', 203973, '11c82ca0-da15-48ed-869e-848e1561d8d4', NULL, 'SENT', 0, '2026-01-14 18:33:16', '2026-01-14 18:33:16');
INSERT INTO `tm_messages` VALUES (85, '2596F1B41CF7431A854428C113D3A9A2', 'U1768211575664873', NULL, 'G1768359009167593', 'TEXT', 'w', NULL, NULL, NULL, NULL, NULL, 'SENT', 0, '2026-01-14 18:34:26', '2026-01-14 18:34:26');
INSERT INTO `tm_messages` VALUES (86, 'A2A3EAFA5724498C92B33EDDAAFF74D5', 'U1768211575664873', NULL, 'G1768356563512165', 'TEXT', 'w', NULL, NULL, NULL, NULL, NULL, 'SENT', 0, '2026-01-14 18:35:27', '2026-01-14 18:35:27');
INSERT INTO `tm_messages` VALUES (87, '81C35F868C79457F82D507867A0F1574', 'U1768272900080722', 'U1768211575664873', NULL, 'TEXT', '直接用这个通信我觉得可行', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-14 23:59:43', '2026-01-15 00:00:41');
INSERT INTO `tm_messages` VALUES (88, '18A113BB119347CD9345D9B70E5D481B', 'U1768211575664873', 'U1768272900080722', NULL, 'TEXT', '还真是', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-14 23:59:52', '2026-01-15 00:04:28');
INSERT INTO `tm_messages` VALUES (89, '877A52F5ABD24FE4974177D74B03F746', 'U1768272900080722', 'U1768211575664873', NULL, 'TEXT', '111', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-15 00:02:29', '2026-01-15 00:14:19');
INSERT INTO `tm_messages` VALUES (90, '5B76A806FAF44D9A9072501F9C11FA7E', 'U1768211575664873', 'U1768272900080722', NULL, 'TEXT', '进度怎样', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-15 00:47:06', '2026-01-15 00:53:28');
INSERT INTO `tm_messages` VALUES (91, 'B0A6198F8C28483C8C8931FE2CBDF13D', 'U1768211575664873', 'U1768272900080722', NULL, 'TEXT', '听不到', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-15 00:52:42', '2026-01-15 00:53:28');
INSERT INTO `tm_messages` VALUES (92, 'ED9F7B438A664600AC3628F804568E1A', 'U1768211575664873', 'U1768272900080722', NULL, 'TEXT', '看不到', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-15 00:52:59', '2026-01-15 00:53:28');
INSERT INTO `tm_messages` VALUES (93, '8FD8C44E7AF840C18781E402AB828543', 'U1768211575664873', 'U1768272900080722', NULL, 'TEXT', '准备好打1', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-15 00:54:10', '2026-01-15 00:55:57');
INSERT INTO `tm_messages` VALUES (94, '908EDEEA1EA04335B97CD02123C40A7A', 'U1768272900080722', 'U1768211575664873', NULL, 'TEXT', '1', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-15 00:54:14', '2026-01-15 01:05:52');
INSERT INTO `tm_messages` VALUES (95, '74F320D0A8504378809E549AC6B12F54', 'U1768272900080722', 'U1768211575664873', NULL, 'TEXT', '没声', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-15 00:55:20', '2026-01-15 01:05:52');
INSERT INTO `tm_messages` VALUES (96, '6EF70FFE8A684C1AAD7CDECADE6F5225', 'U1768272900080722', 'U1768211575664873', NULL, 'TEXT', '视频我这里是等待画面', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-15 00:55:30', '2026-01-15 01:05:52');
INSERT INTO `tm_messages` VALUES (97, '05021787FC774F4B8AC518B66CE3E832', 'U1768211575664873', 'U1768272900080722', NULL, 'TEXT', '不行', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-15 00:55:30', '2026-01-15 00:55:57');
INSERT INTO `tm_messages` VALUES (98, '95F9D583BD424DABA3C7CFBA9E2658AA', 'U1768211575664873', 'U1768272900080722', NULL, 'TEXT', '再发起一次', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-15 00:56:06', '2026-01-15 01:05:37');
INSERT INTO `tm_messages` VALUES (99, '5707EE939CD14202A2C6B210103D5786', 'U1768272900080722', 'U1768211575664873', NULL, 'TEXT', '还是老问题', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-15 00:56:08', '2026-01-15 01:05:52');
INSERT INTO `tm_messages` VALUES (100, '3FC484A7EC22469F997E37B66FA86B63', 'U1768211575664873', 'U1768272900080722', NULL, 'TEXT', '艹', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-15 00:56:15', '2026-01-15 01:05:37');
INSERT INTO `tm_messages` VALUES (101, '5AC3F4D2564147398D5966FC8C2453DD', 'U1768211575664873', 'U1768272900080722', NULL, 'TEXT', '吞掉了，我在打字', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-15 00:56:25', '2026-01-15 01:05:37');
INSERT INTO `tm_messages` VALUES (102, '50D9F5C721B3438EA3C0F9BC2D786D11', 'U1768211575664873', 'U1768272900080722', NULL, 'TEXT', '日志抓到了，我分析下吧', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-15 00:56:53', '2026-01-15 01:05:37');
INSERT INTO `tm_messages` VALUES (103, '75D7C214F65042A0A5B06496C16C5296', 'U1768272900080722', 'U1768211575664873', NULL, 'TEXT', '我这里甚至放到视频上有显示画中画什么的', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-15 00:57:27', '2026-01-15 01:05:52');
INSERT INTO `tm_messages` VALUES (104, '003FA6E7496B48C484A90BE41EE24E6B', 'U1768272900080722', 'U1768211575664873', NULL, 'TEXT', '就是没有具体画面', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-15 00:57:35', '2026-01-15 01:05:52');
INSERT INTO `tm_messages` VALUES (105, 'E44E9C5D97FD411DB7AFC65B421D9AF2', 'U1768272900080722', 'U1768211575664873', NULL, 'TEXT', '绝对是连上了的我感觉', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-15 00:57:49', '2026-01-15 01:05:52');
INSERT INTO `tm_messages` VALUES (106, '80621998A1674AB18A5C2EBFFBB31329', 'U1768211575664873', 'U1768272900080722', NULL, 'TEXT', '看qq', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-15 00:58:59', '2026-01-15 01:05:37');
INSERT INTO `tm_messages` VALUES (107, '45232EC944D44BBDA1E1214C861F25BB', 'U1768272900080722', 'U1768211575664873', NULL, 'TEXT', '登上了扣1', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-15 01:05:54', '2026-01-15 01:11:38');
INSERT INTO `tm_messages` VALUES (108, '046D643596144F1BA95FD25D1AF7F11C', 'U1768211575664873', 'U1768272900080722', NULL, 'TEXT', '1', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-15 01:05:58', '2026-01-15 01:06:33');
INSERT INTO `tm_messages` VALUES (109, '469F339A9ECC4D8ABC85ECA0C161A7FD', 'U1768211575664873', 'U1768272900080722', NULL, 'TEXT', '有报错', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-15 01:06:46', '2026-01-15 01:08:45');
INSERT INTO `tm_messages` VALUES (110, 'F070DAC202AC411D8D5320D571A258BF', 'U1768211575664873', 'U1768272900080722', NULL, 'TEXT', '我分析下', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-15 01:06:49', '2026-01-15 01:08:45');
INSERT INTO `tm_messages` VALUES (111, 'E133160150B04430897BA83763AA1CE5', 'U1768272900080722', 'U1768211575664873', NULL, 'TEXT', '出事了，给我弄的消息显示也有问题了', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-15 01:09:59', '2026-01-15 01:11:38');
INSERT INTO `tm_messages` VALUES (112, '57A4F5FAC0AC45DCB9958A6E4AB4514F', 'U1768211575664873', 'U1768272900080722', NULL, 'TEXT', '出了什么问题', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-15 01:11:14', '2026-01-15 01:11:38');
INSERT INTO `tm_messages` VALUES (113, 'A42F5B034C56433AA6E7DD61465E7AAC', 'U1768188726977338', NULL, 'G1768314950541978', 'IMAGE', '《崩坏：星穹铁道》走近星穹——「银狼：宇宙第一天才骇客！」.mp4_20231231_225452.437.jpg', '/api/files/d5b853fb-4d95-434c-9aa6-99cb2efaca7e/view', '《崩坏：星穹铁道》走近星穹——「银狼：宇宙第一天才骇客！」.mp4_20231231_225452.437.jpg', 140735, 'd5b853fb-4d95-434c-9aa6-99cb2efaca7e', NULL, 'SENT', 0, '2026-01-15 09:02:53', '2026-01-15 09:02:53');
INSERT INTO `tm_messages` VALUES (114, 'E58CD418416846AA8B0A4F765C530069', 'U1768272900080722', NULL, 'G1768314950541978', 'IMAGE', '9fa994156b4ecf0172c3cd0971caec4c26633150.jpg', '/api/files/fe9f8b69-097e-4d9a-9d48-21609a9fb028/view', '9fa994156b4ecf0172c3cd0971caec4c26633150.jpg', 77724, 'fe9f8b69-097e-4d9a-9d48-21609a9fb028', NULL, 'SENT', 0, '2026-01-15 09:17:09', '2026-01-15 09:17:09');
INSERT INTO `tm_messages` VALUES (115, '9B039A937C6342E79AC2E61DC4478CF4', 'U1768188726977338', NULL, 'G1768314950541978', 'FILE', '测试计划.docx', '/api/files/959c320f-e316-4dbc-8a3e-2c624fbdc0c0/view', '测试计划.docx', 39300, '959c320f-e316-4dbc-8a3e-2c624fbdc0c0', NULL, 'SENT', 0, '2026-01-15 09:24:02', '2026-01-15 09:24:02');
INSERT INTO `tm_messages` VALUES (116, '2B9D2BEED28E498E8B92DABA7CD8DA03', 'U1768211575664873', NULL, 'G1768359009167593', 'TEXT', '引用 123456：\n计算机网络实验报告.doc', NULL, NULL, NULL, NULL, NULL, 'SENT', 0, '2026-01-15 09:28:46', '2026-01-15 09:28:46');
INSERT INTO `tm_messages` VALUES (117, '8F56ED8937164935A9C7BEBB21BADE64', 'U1768188726977338', 'U1768211575664873', NULL, 'TEXT', 'd', NULL, NULL, NULL, NULL, NULL, 'READ', 0, '2026-01-15 09:37:27', '2026-01-15 09:37:30');
INSERT INTO `tm_messages` VALUES (118, '849B1ABE8B8942D19DC258481FDF7909', 'U1768188726977338', 'U1768211575664873', NULL, 'FILE', '测试计划.docx', '/api/files/0fe07a91-ab4e-47a5-bce2-61e353dafd67/view', '测试计划.docx', 39300, '0fe07a91-ab4e-47a5-bce2-61e353dafd67', NULL, 'READ', 0, '2026-01-15 09:37:44', '2026-01-15 09:37:49');
INSERT INTO `tm_messages` VALUES (119, 'C628E2E3032041F8AE1B8573B7415505', 'U1768272900080722', NULL, 'G1768441309360211', 'TEXT', '引用 123：\n111\n\n引用 123：\n123\n\n引用 123：\nhello', NULL, NULL, NULL, NULL, NULL, 'SENT', 0, '2026-01-15 09:41:58', '2026-01-15 09:41:58');
INSERT INTO `tm_messages` VALUES (120, 'D69C902C0210440BA90D2E4CADD3F565', 'U1768272900080722', NULL, 'G1768441309360211', 'TEXT', '111', NULL, NULL, NULL, NULL, NULL, 'SENT', 0, '2026-01-15 09:42:07', '2026-01-15 09:42:07');
INSERT INTO `tm_messages` VALUES (121, '6D43E777088D4322B91D3F9770787873', 'U1768211575664873', 'U1768188726977338', NULL, 'IMAGE', '32d334c3eda45a9444.jpg', '/api/files/8bb26dc2-de9b-4756-b2da-6387a9c0be1c/view', '32d334c3eda45a9444.jpg', 505146, '8bb26dc2-de9b-4756-b2da-6387a9c0be1c', NULL, 'SENT', 0, '2026-01-15 09:55:45', '2026-01-15 09:55:45');

-- ----------------------------
-- Table structure for tm_users
-- ----------------------------
DROP TABLE IF EXISTS `tm_users`;
CREATE TABLE `tm_users`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `avatar` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `signature` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `status` enum('ONLINE','OFFLINE','BUSY','AWAY') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'OFFLINE',
  `deleted` tinyint(1) NOT NULL DEFAULT 0,
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_login_time` datetime NULL DEFAULT NULL,
  `last_login_ip` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `is_admin` bit(1) NULL DEFAULT NULL,
  `role` enum('DIRECTOR','MANAGER','EMPLOYEE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `department_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `user_id`(`user_id` ASC) USING BTREE,
  UNIQUE INDEX `username`(`username` ASC) USING BTREE,
  INDEX `idx_user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_username`(`username` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 7 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of tm_users
-- ----------------------------
INSERT INTO `tm_users` VALUES (1, 'admin', 'admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iGNEzBvW', 'admin@telemsg.com', NULL, NULL, NULL, 'OFFLINE', 0, '2026-01-12 11:27:17', '2026-01-13 17:38:23', NULL, NULL, NULL, 'DIRECTOR', NULL);
INSERT INTO `tm_users` VALUES (2, 'test1', 'testuser1', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iGNEzBvW', 'test1@telemsg.com', NULL, NULL, NULL, 'OFFLINE', 0, '2026-01-12 11:27:17', '2026-01-13 17:38:22', NULL, NULL, NULL, 'DIRECTOR', NULL);
INSERT INTO `tm_users` VALUES (3, 'test2', 'testuser2', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iGNEzBvW', 'test2@telemsg.com', NULL, NULL, NULL, 'OFFLINE', 0, '2026-01-12 11:27:17', '2026-01-13 17:38:21', NULL, NULL, NULL, 'DIRECTOR', NULL);
INSERT INTO `tm_users` VALUES (4, 'U1768188726977338', '12345678', '$2a$10$q/DfSDcbXLCWVXQl.o2tzumxujsW8fyxEeb5RnqXaMFkLMvtrXScq', NULL, NULL, NULL, NULL, 'ONLINE', 0, '2026-01-12 11:32:07', '2026-01-15 09:02:30', '2026-01-15 09:02:30', NULL, NULL, 'DIRECTOR', NULL);
INSERT INTO `tm_users` VALUES (5, 'U1768211575664873', '123456', '$2a$10$y5w7DVyYyW8sviDpnga/FumTgKcBOFfOZkYnF/2CAN68EZ2OHouOq', NULL, NULL, NULL, NULL, 'OFFLINE', 0, '2026-01-12 17:52:56', '2026-01-15 09:39:50', '2026-01-15 09:36:51', NULL, NULL, 'DIRECTOR', NULL);
INSERT INTO `tm_users` VALUES (6, 'U1768272900080722', '123', '$2a$10$JmAFgwBZSWiefOcs1gSJze8HUguLAWCfyb1J32bm9ejMDemrtUnuq', NULL, NULL, NULL, NULL, 'ONLINE', 0, '2026-01-13 10:55:00', '2026-01-15 09:40:11', '2026-01-15 09:40:11', NULL, b'1', 'DIRECTOR', NULL);

SET FOREIGN_KEY_CHECKS = 1;
