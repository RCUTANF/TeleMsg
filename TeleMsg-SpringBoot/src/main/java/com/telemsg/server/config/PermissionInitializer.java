package com.telemsg.server.config;

import com.telemsg.server.service.PermissionService;
import com.telemsg.server.service.RolePermissionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

/**
 * 权限数据初始化配置
 *
 * @author TeleMsg Team
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
public class PermissionInitializer {

    private final PermissionService permissionService;
    private final RolePermissionService rolePermissionService;

    /**
     * 在应用启动时初始化权限数据
     */
    @Bean
    @Order(100) // 确保在其他初始化之后执行
    public CommandLineRunner initPermissions() {
        return args -> {
            try {
                log.info("=== 开始初始化权限系统 ===");

                // 1. 初始化权限定义
                permissionService.initDefaultPermissions();

                // 2. 初始化角色权限配置
                rolePermissionService.initDefaultRolePermissions();

                log.info("=== 权限系统初始化完成 ===");
            } catch (Exception e) {
                log.error("权限系统初始化失败", e);
                // 不抛出异常，允许应用继续启动
            }
        };
    }
}

