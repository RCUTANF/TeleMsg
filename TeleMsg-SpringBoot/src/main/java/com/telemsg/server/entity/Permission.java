package com.telemsg.server.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * 权限实体
 *
 * @author TeleMsg Team
 */
@Entity
@Table(name = "permissions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Permission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 权限代码（唯一标识符，如 file.send）
     */
    @Column(unique = true, nullable = false, length = 100)
    private String code;

    /**
     * 权限名称
     */
    @Column(nullable = false, length = 100)
    private String name;

    /**
     * 权限描述
     */
    @Column(length = 255)
    private String description;

    /**
     * 权限分类（如：文件管理、音视频通话）
     */
    @Column(nullable = false, length = 50)
    private String category;

    /**
     * 创建时间
     */
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}

