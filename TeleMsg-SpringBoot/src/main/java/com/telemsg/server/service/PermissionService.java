package com.telemsg.server.service;

import com.telemsg.server.entity.Permission;
import com.telemsg.server.repository.PermissionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.LinkedHashMap;

/**
 * 权限服务
 *
 * @author TeleMsg Team
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PermissionService {

    private final PermissionRepository permissionRepository;

    /**
     * 获取所有权限
     */
    public List<Permission> getAllPermissions() {
        return permissionRepository.findAll();
    }

    /**
     * 根据分类获取权限
     */
    public List<Permission> getPermissionsByCategory(String category) {
        return permissionRepository.findByCategory(category);
    }

    /**
     * 根据代码获取权限
     */
    public Optional<Permission> getPermissionByCode(String code) {
        return permissionRepository.findByCode(code);
    }

    /**
     * 初始化默认权限数据
     */
    @Transactional
    public void initDefaultPermissions() {
        log.info("开始初始化默认权限数据...");

        // 定义默认权限 - 使用 LinkedHashMap 保持顺序
        Map<String, PermissionDefinition> defaultPermissions = new LinkedHashMap<>();

        // 文件管理
        defaultPermissions.put("file.send", new PermissionDefinition("发送文件", "上传并发送文件", "文件管理"));
        defaultPermissions.put("file.receive", new PermissionDefinition("接收文件", "接收并下载文件", "文件管理"));

        // 音视频通话
        defaultPermissions.put("call.voice", new PermissionDefinition("语音通话", "发起语音通话", "音视频通话"));
        defaultPermissions.put("call.video", new PermissionDefinition("视频通话", "发起视频通话", "音视频通话"));
        defaultPermissions.put("call.screen", new PermissionDefinition("屏幕共享", "共享屏幕内容", "音视频通话"));
        defaultPermissions.put("call.record", new PermissionDefinition("通话录制", "录制通话内容", "音视频通话"));

        // 群组功能
        defaultPermissions.put("group.create", new PermissionDefinition("创建群组", "创建新的群组", "群组功能"));
        defaultPermissions.put("group.manage", new PermissionDefinition("管理群组", "管理群组设置和成员", "群组功能"));

        // 用户管理
        defaultPermissions.put("user.create", new PermissionDefinition("创建用户", "添加新用户", "用户管理"));
        defaultPermissions.put("user.edit", new PermissionDefinition("编辑用户", "修改用户信息", "用户管理"));
        defaultPermissions.put("user.delete", new PermissionDefinition("删除用户", "删除用户账号", "用户管理"));

        // 创建或更新权限
        int created = 0;
        int existing = 0;

        for (Map.Entry<String, PermissionDefinition> entry : defaultPermissions.entrySet()) {
            String code = entry.getKey();
            PermissionDefinition def = entry.getValue();

            if (!permissionRepository.existsByCode(code)) {
                Permission permission = Permission.builder()
                        .code(code)
                        .name(def.name)
                        .description(def.description)
                        .category(def.category)
                        .build();
                permissionRepository.save(permission);
                created++;
                log.debug("创建权限: {}", code);
            } else {
                existing++;
            }
        }

        log.info("权限初始化完成 - 新建: {}, 已存在: {}, 总计: {}", created, existing, defaultPermissions.size());
    }

    /**
     * 权限定义辅助类
     */
    private static class PermissionDefinition {
        String name;
        String description;
        String category;

        PermissionDefinition(String name, String description, String category) {
            this.name = name;
            this.description = description;
            this.category = category;
        }
    }
}

