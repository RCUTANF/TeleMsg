package com.telemsg.server.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 角色权限关联实体
 *
 * @author TeleMsg Team
 */
@Entity
@Table(name = "role_permissions",
       uniqueConstraints = @UniqueConstraint(columnNames = {"role_id", "permission_code"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RolePermission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 角色ID（对应 User.UserRole 枚举值）
     */
    @Column(name = "role_id", nullable = false, length = 50)
    private String roleId;

    /**
     * 权限代码
     */
    @Column(name = "permission_code", nullable = false, length = 100)
    private String permissionCode;

    /**
     * 是否启用该权限
     */
    @Column(nullable = false)
    private Boolean enabled;

    /**
     * 创建时间
     */
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}

