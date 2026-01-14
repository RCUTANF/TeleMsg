package com.telemsg.server.service;

import com.telemsg.server.entity.RolePermission;
import com.telemsg.server.entity.User;
import com.telemsg.server.repository.RolePermissionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 角色权限服务
 *
 * @author TeleMsg Team
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RolePermissionService {

    private final RolePermissionRepository rolePermissionRepository;
    private final UserService userService;
    private final EntityManager entityManager;

    /**
     * 获取角色的所有权限
     */
    public List<RolePermission> getRolePermissions(String roleId) {
        return rolePermissionRepository.findByRoleId(roleId);
    }

    /**
     * 获取角色的已启用权限代码列表
     */
    public List<String> getEnabledPermissionCodes(String roleId) {
        return rolePermissionRepository.findByRoleIdAndEnabled(roleId, true)
                .stream()
                .map(RolePermission::getPermissionCode)
                .collect(Collectors.toList());
    }

    /**
     * 更新角色权限
     */
    @Transactional
    public void updateRolePermissions(String roleId, List<String> enabledPermissionCodes) {
        log.info("更新角色 {} 的权限配置", roleId);

        // 删除现有权限配置
        rolePermissionRepository.deleteByRoleId(roleId);

        // 立即刷新到数据库并清除持久化上下文，避免唯一约束冲突
        entityManager.flush();
        entityManager.clear();

        // 创建新的权限配置
        for (String permissionCode : enabledPermissionCodes) {
            RolePermission rolePermission = RolePermission.builder()
                    .roleId(roleId)
                    .permissionCode(permissionCode)
                    .enabled(true)
                    .build();
            rolePermissionRepository.save(rolePermission);
        }

        log.info("角色 {} 权限更新完成，共 {} 项权限", roleId, enabledPermissionCodes.size());
    }

    /**
     * 检查用户是否有某权限
     */
    public boolean checkPermission(String userId, String permissionCode) {
        try {
            User user = userService.findByUserId(userId).orElse(null);
            if (user == null) {
                return false;
            }

            String roleId = user.getRole().name();
            return rolePermissionRepository.existsByRoleIdAndPermissionCodeAndEnabled(
                    roleId, permissionCode, true);
        } catch (Exception e) {
            log.error("检查用户权限失败: userId={}, permission={}", userId, permissionCode, e);
            return false;
        }
    }

    /**
     * 初始化默认角色权限配置
     */
    @Transactional
    public void initDefaultRolePermissions() {
        log.info("开始初始化默认角色权限配置...");

        // DIRECTOR（系统管理员）- 所有权限
        List<String> directorPermissions = Arrays.asList(
                "file.send", "file.receive",
                "call.voice", "call.video", "call.screen", "call.record",
                "group.create", "group.manage",
                "user.create", "user.edit", "user.delete"
        );
        initRolePermissionsIfNotExists("DIRECTOR", directorPermissions);

        // MANAGER（部门主管）- 除用户管理外的所有权限
        List<String> managerPermissions = Arrays.asList(
                "file.send", "file.receive",
                "call.voice", "call.video", "call.screen", "call.record",
                "group.create", "group.manage"
        );
        initRolePermissionsIfNotExists("MANAGER", managerPermissions);

        // EMPLOYEE（普通员工）- 基础权限
        List<String> employeePermissions = Arrays.asList(
                "file.send", "file.receive",
                "call.voice", "call.video",
                "group.create"
        );
        initRolePermissionsIfNotExists("EMPLOYEE", employeePermissions);

        log.info("默认角色权限配置初始化完成");
    }

    /**
     * 如果角色权限不存在则初始化
     */
    private void initRolePermissionsIfNotExists(String roleId, List<String> permissionCodes) {
        List<RolePermission> existing = rolePermissionRepository.findByRoleId(roleId);

        if (existing.isEmpty()) {
            log.info("初始化角色 {} 的权限配置，共 {} 项", roleId, permissionCodes.size());

            for (String permissionCode : permissionCodes) {
                RolePermission rolePermission = RolePermission.builder()
                        .roleId(roleId)
                        .permissionCode(permissionCode)
                        .enabled(true)
                        .build();
                rolePermissionRepository.save(rolePermission);
            }
        } else {
            log.info("角色 {} 的权限配置已存在，跳过初始化", roleId);
        }
    }

    /**
     * 获取用户的所有权限
     */
    public List<String> getUserPermissions(String userId) {
        try {
            User user = userService.findByUserId(userId).orElse(null);
            if (user == null) {
                return Collections.emptyList();
            }

            String roleId = user.getRole().name();
            return getEnabledPermissionCodes(roleId);
        } catch (Exception e) {
            log.error("获取用户权限失败: userId={}", userId, e);
            return Collections.emptyList();
        }
    }
}

