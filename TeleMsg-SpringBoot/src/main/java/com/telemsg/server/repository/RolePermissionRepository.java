package com.telemsg.server.repository;

import com.telemsg.server.entity.RolePermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * 角色权限关联数据访问层
 *
 * @author TeleMsg Team
 */
@Repository
public interface RolePermissionRepository extends JpaRepository<RolePermission, Long> {

    /**
     * 根据角色ID查询所有权限
     */
    List<RolePermission> findByRoleId(String roleId);

    /**
     * 根据角色ID和权限代码查询
     */
    Optional<RolePermission> findByRoleIdAndPermissionCode(String roleId, String permissionCode);

    /**
     * 根据角色ID和启用状态查询权限
     */
    List<RolePermission> findByRoleIdAndEnabled(String roleId, Boolean enabled);

    /**
     * 删除角色的所有权限
     */
    @Modifying
    @Transactional
    void deleteByRoleId(String roleId);

    /**
     * 检查角色是否有某权限且已启用
     */
    boolean existsByRoleIdAndPermissionCodeAndEnabled(String roleId, String permissionCode, Boolean enabled);
}

