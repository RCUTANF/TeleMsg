package com.telemsg.server.controller;

import com.telemsg.server.annotation.RequirePermission;
import com.telemsg.server.entity.User;
import com.telemsg.server.entity.Department;
import com.telemsg.server.entity.Permission;
import com.telemsg.server.service.UserService;
import com.telemsg.server.service.MessageService;
import com.telemsg.server.service.JwtService;
import com.telemsg.server.service.DepartmentService;
import com.telemsg.server.service.PermissionService;
import com.telemsg.server.service.RolePermissionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

/**
 * 管理员相关REST API
 *
 * @author TeleMsg Team
 */
@Slf4j
@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@Validated
public class AdminController {

    private final UserService userService;
    private final MessageService messageService;
    private final JwtService jwtService;
    private final DepartmentService departmentService;
    private final PermissionService permissionService;
    private final RolePermissionService rolePermissionService;

    /**
     * 获取所有用户
     */
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(@RequestHeader("Authorization") String authHeader) {
        try {
            extractUserAndCheckAdmin(authHeader);

            List<User> users = userService.findAllUsers();
            List<Map<String, Object>> userResponses = users.stream()
                .map(this::convertToUserResponse)
                .collect(Collectors.toList());

            return ResponseEntity.ok(userResponses);

        } catch (Exception e) {
            log.error("获取用户列表失败", e);
            return ResponseEntity.badRequest().body(Map.of("error", "获取用户列表失败"));
        }
    }

    /**
     * 删除用户
     */
    @RequirePermission(value = "user.delete", description = "删除用户")
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@RequestHeader("Authorization") String authHeader,
                                      @PathVariable String userId) {
        try {
            extractUserAndCheckAdmin(authHeader);

            userService.deleteUser(userId);

            return ResponseEntity.ok(Map.of("message", "用户删除成功"));

        } catch (Exception e) {
            log.error("删除用户失败", e);
            return ResponseEntity.badRequest().body(Map.of("error", "删除用户失败"));
        }
    }

    /**
     * 更新用户角色
     */
    @RequirePermission(value = "user.edit", description = "编辑用户")
    @PutMapping("/users/{userId}/role")
    public ResponseEntity<?> updateUserRole(@RequestHeader("Authorization") String authHeader,
                                          @PathVariable String userId,
                                          @RequestBody @Validated UpdateRoleRequest request) {
        try {
            extractUserAndCheckAdmin(authHeader);

            User.UserRole role = User.UserRole.valueOf(request.getRole().toUpperCase());
            Boolean isAdmin = role == User.UserRole.DIRECTOR; // 假设DIRECTOR是管理员

            User updatedUser = userService.updateUserRoleAndPermission(userId, role, isAdmin);

            return ResponseEntity.ok(convertToUserResponse(updatedUser));

        } catch (Exception e) {
            log.error("更新用户角色失败", e);
            return ResponseEntity.badRequest().body(Map.of("error", "更新角色失败"));
        }
    }

    /**
     * 获取系统统计信息
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getSystemStats(@RequestHeader("Authorization") String authHeader) {
        try {
            extractUserAndCheckAdmin(authHeader);

            long totalUsers = userService.getTotalUserCount();
            long onlineUsers = userService.getOnlineUserCount();
            long totalMessages = messageService.getTotalMessageCount();

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalUsers", totalUsers);
            stats.put("onlineUsers", onlineUsers);
            stats.put("totalMessages", totalMessages);
            stats.put("storageUsed", 0); // 暂时返回0

            return ResponseEntity.ok(stats);

        } catch (Exception e) {
            log.error("获取系统统计失败", e);
            return ResponseEntity.badRequest().body(Map.of("error", "获取统计信息失败"));
        }
    }

    /**
     * 获取部门列表
     */
    @GetMapping("/departments")
    public ResponseEntity<?> getDepartments(@RequestHeader("Authorization") String authHeader) {
        try {
            extractUserAndCheckAdmin(authHeader);

            List<Department> departments = departmentService.findAllDepartments();
            List<Map<String, Object>> departmentResponses = departments.stream()
                .map(this::convertToDepartmentResponse)
                .collect(Collectors.toList());

            return ResponseEntity.ok(departmentResponses);

        } catch (Exception e) {
            log.error("获取部门列表失败", e);
            return ResponseEntity.badRequest().body(Map.of("error", "获取部门列表失败"));
        }
    }

    /**
     * 创建部门
     */
    @PostMapping("/departments")
    public ResponseEntity<?> createDepartment(@RequestHeader("Authorization") String authHeader,
                                            @RequestBody @Validated CreateDepartmentRequest request) {
        try {
            extractUserAndCheckAdmin(authHeader);

            Department department = departmentService.createDepartment(
                request.getName(),
                null, // description
                request.getManager(),
                request.getParent()
            );

            return ResponseEntity.ok(convertToDepartmentResponse(department));

        } catch (Exception e) {
            log.error("创建部门失败", e);
            return ResponseEntity.badRequest().body(Map.of("error", "创建部门失败"));
        }
    }

    /**
     * 获取部门成员
     */
    @GetMapping("/departments/{departmentId}/members")
    public ResponseEntity<?> getDepartmentMembers(@RequestHeader("Authorization") String authHeader,
                                                @PathVariable String departmentId) {
        try {
            extractUserAndCheckAdmin(authHeader);

            List<User> members = departmentService.findDepartmentMembers(departmentId);
            List<Map<String, Object>> memberResponses = members.stream()
                .map(this::convertToUserResponse)
                .collect(Collectors.toList());

            return ResponseEntity.ok(memberResponses);

        } catch (Exception e) {
            log.error("获取部门成员失败", e);
            return ResponseEntity.badRequest().body(Map.of("error", "获取部门成员失败"));
        }
    }

    /**
     * 添加部门成员
     */
    @PostMapping("/departments/{departmentId}/members")
    public ResponseEntity<?> addDepartmentMembers(@RequestHeader("Authorization") String authHeader,
                                                 @PathVariable String departmentId,
                                                 @RequestBody @Validated AddDepartmentMembersRequest request) {
        try {
            extractUserAndCheckAdmin(authHeader);

            departmentService.addDepartmentMembers(departmentId, request.getUserIds());

            return ResponseEntity.ok(Map.of("message", "成功添加 " + request.getUserIds().size() + " 名成员"));

        } catch (Exception e) {
            log.error("添加部门成员失败", e);
            return ResponseEntity.badRequest().body(Map.of("error", "添加部门成员失败: " + e.getMessage()));
        }
    }

    /**
     * 移除部门成员
     */
    @DeleteMapping("/departments/{departmentId}/members/{userId}")
    public ResponseEntity<?> removeDepartmentMember(@RequestHeader("Authorization") String authHeader,
                                                   @PathVariable String departmentId,
                                                   @PathVariable String userId) {
        try {
            extractUserAndCheckAdmin(authHeader);

            departmentService.removeDepartmentMember(departmentId, userId);

            return ResponseEntity.ok(Map.of("message", "成功移除成员"));

        } catch (Exception e) {
            log.error("移除部门成员失败", e);
            return ResponseEntity.badRequest().body(Map.of("error", "移除部门成员失败: " + e.getMessage()));
        }
    }

    /**
     * 获取角色列表
     */
    @GetMapping("/roles")
    public ResponseEntity<?> getRoles(@RequestHeader("Authorization") String authHeader) {
        try {
            extractUserAndCheckAdmin(authHeader);

            List<Map<String, Object>> roles = List.of(
                Map.of("id", "DIRECTOR", "name", "系统管理员", "description", "全局审批 + 最终决策权", "userCount", userService.getUsersByRole(User.UserRole.DIRECTOR).size(), "permissions", List.of("全系统审批", "最终决策权", "人员管理", "数据管理")),
                Map.of("id", "MANAGER", "name", "部门主管", "description", "本部门审批 + 跨部门申请发起", "userCount", userService.getUsersByRole(User.UserRole.MANAGER).size(), "permissions", List.of("本部门审批", "跨部门申请", "群聊创建")),
                Map.of("id", "EMPLOYEE", "name", "普通员工", "description", "基础聊天功能", "userCount", userService.getUsersByRole(User.UserRole.EMPLOYEE).size(), "permissions", List.of("发起申请", "查看个人数据"))
            );

            return ResponseEntity.ok(roles);

        } catch (Exception e) {
            log.error("获取角色列表失败", e);
            return ResponseEntity.badRequest().body(Map.of("error", "获取角色列表失败"));
        }
    }

    /**
     * 获取所有权限列表
     */
    @GetMapping("/permissions")
    public ResponseEntity<?> getAllPermissions(@RequestHeader("Authorization") String authHeader) {
        try {
            extractUserAndCheckAdmin(authHeader);

            List<Permission> permissions = permissionService.getAllPermissions();
            List<Map<String, Object>> permissionResponses = permissions.stream()
                .map(this::convertToPermissionResponse)
                .collect(Collectors.toList());

            return ResponseEntity.ok(permissionResponses);

        } catch (Exception e) {
            log.error("获取权限列表失败", e);
            return ResponseEntity.badRequest().body(Map.of("error", "获取权限列表失败: " + e.getMessage()));
        }
    }

    /**
     * 获取角色权限详情
     */
    @GetMapping("/roles/{roleId}/permissions")
    public ResponseEntity<?> getRolePermissions(@RequestHeader("Authorization") String authHeader,
                                               @PathVariable String roleId) {
        try {
            extractUserAndCheckAdmin(authHeader);

            // 验证角色ID是否有效
            User.UserRole.valueOf(roleId.toUpperCase());

            List<String> enabledPermissions = rolePermissionService.getEnabledPermissionCodes(roleId.toUpperCase());

            return ResponseEntity.ok(Map.of("permissions", enabledPermissions));

        } catch (IllegalArgumentException e) {
            log.error("无效的角色ID: {}", roleId);
            return ResponseEntity.badRequest().body(Map.of("error", "无效的角色ID"));
        } catch (Exception e) {
            log.error("获取角色权限失败", e);
            return ResponseEntity.badRequest().body(Map.of("error", "获取角色权限失败: " + e.getMessage()));
        }
    }

    /**
     * 更新角色权限配置
     */
    @PutMapping("/roles/{roleId}/permissions")
    public ResponseEntity<?> updateRolePermissions(@RequestHeader("Authorization") String authHeader,
                                                  @PathVariable String roleId,
                                                  @RequestBody @Validated UpdateRolePermissionsRequest request) {
        try {
            extractUserAndCheckAdmin(authHeader);

            // 验证角色ID是否有效
            User.UserRole.valueOf(roleId.toUpperCase());

            rolePermissionService.updateRolePermissions(roleId.toUpperCase(), request.getPermissions());

            return ResponseEntity.ok(Map.of(
                "message", "权限配置更新成功",
                "roleId", roleId.toUpperCase(),
                "permissionCount", request.getPermissions().size()
            ));

        } catch (IllegalArgumentException e) {
            log.error("无效的角色ID: {}", roleId);
            return ResponseEntity.badRequest().body(Map.of("error", "无效的角色ID"));
        } catch (Exception e) {
            log.error("更新角色权限失败", e);
            return ResponseEntity.badRequest().body(Map.of("error", "更新角色权限失败: " + e.getMessage()));
        }
    }

    /**
     * 获取角色成员
     */
    @GetMapping("/roles/{roleId}/members")
    public ResponseEntity<?> getRoleMembers(@RequestHeader("Authorization") String authHeader,
                                          @PathVariable String roleId) {
        try {
            extractUserAndCheckAdmin(authHeader);

            User.UserRole role = User.UserRole.valueOf(roleId.toUpperCase());
            List<User> members = userService.getUsersByRole(role);
            List<Map<String, Object>> memberResponses = members.stream()
                .map(this::convertToUserResponse)
                .collect(Collectors.toList());

            return ResponseEntity.ok(memberResponses);

        } catch (Exception e) {
            log.error("获取角色成员失败", e);
            return ResponseEntity.badRequest().body(Map.of("error", "获取角色成员失败"));
        }
    }

    /**
     * 从JWT token中提取用户ID
     */
    private String extractUserIdFromToken(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                return jwtService.extractUserId(token);
            } catch (Exception e) {
                log.error("解析JWT token失败", e);
                throw new RuntimeException("无效的认证token");
            }
        }
        throw new RuntimeException("无效的认证token");
    }

    /**
     * 从JWT token中提取用户ID并验证管理员权限
     */
    private User extractUserAndCheckAdmin(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                String userId = jwtService.extractUserId(token);
                User user = userService.findByUserId(userId).orElseThrow(() -> new RuntimeException("用户不存在"));
                if (!Boolean.TRUE.equals(user.getIsAdmin())) {
                    throw new RuntimeException("需要管理员权限");
                }
                return user;
            } catch (Exception e) {
                log.error("解析JWT token失败", e);
                throw new RuntimeException("无效的认证token");
            }
        }
        throw new RuntimeException("无效的认证token");
    }

    /**
     * 转换为权限响应格式
     */
    private Map<String, Object> convertToPermissionResponse(Permission permission) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", permission.getCode());
        response.put("name", permission.getName());
        response.put("description", permission.getDescription());
        response.put("category", permission.getCategory());
        return response;
    }

    /**
     * 转换为用户响应格式
     */
    private Map<String, Object> convertToUserResponse(User user) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getUserId());
        response.put("name", user.getUsername());
        response.put("username", user.getUsername());
        response.put("avatar", user.getAvatar() != null ? user.getAvatar() : "");
        response.put("role", user.getRole().name().toLowerCase());
        response.put("isAdmin", user.getIsAdmin());

        // 添加部门信息
        String departmentName = "未分配";
        if (user.getDepartmentId() != null && !user.getDepartmentId().isEmpty()) {
            try {
                var deptOpt = departmentService.findByDepartmentId(user.getDepartmentId());
                if (deptOpt.isPresent()) {
                    departmentName = deptOpt.get().getName();
                }
            } catch (Exception e) {
                log.warn("获取用户部门信息失败, userId={}, departmentId={}", user.getUserId(), user.getDepartmentId(), e);
            }
        }
        response.put("department", departmentName);
        response.put("departmentId", user.getDepartmentId());

        // 添加状态信息
        response.put("status", user.getStatus().name().toLowerCase());
        response.put("lastActive", user.getLastLoginTime() != null ? user.getLastLoginTime().toString() : null);
        response.put("createdAt", user.getCreateTime() != null ? user.getCreateTime().toString() : null);

        return response;
    }

    /**
     * 转换为部门响应格式
     */
    private Map<String, Object> convertToDepartmentResponse(Department department) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", department.getDepartmentId());
        response.put("name", department.getName());
        response.put("manager", department.getManagerId());
        response.put("memberCount", departmentService.getDepartmentMemberCount(department.getDepartmentId()));
        response.put("parent", department.getParentDepartmentId());
        return response;
    }

    // 请求对象
    public static class UpdateRoleRequest {
        @NotBlank(message = "角色不能为空")
        private String role;

        // Getters and Setters
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }

    // 创建部门请求对象
    public static class CreateDepartmentRequest {
        @NotBlank(message = "部门名称不能为空")
        private String name;

        @NotBlank(message = "部门经理不能为空")
        private String manager;

        private String parent; // 上级部门ID，可选

        // Getters and Setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getManager() { return manager; }
        public void setManager(String manager) { this.manager = manager; }

        public String getParent() { return parent; }
        public void setParent(String parent) { this.parent = parent; }
    }

    // 添加部门成员请求对象
    public static class AddDepartmentMembersRequest {
        private List<String> userIds;

        // Getters and Setters
        public List<String> getUserIds() { return userIds; }
        public void setUserIds(List<String> userIds) { this.userIds = userIds; }
    }

    // 更新角色权限请求对象
    public static class UpdateRolePermissionsRequest {
        private List<String> permissions;

        // Getters and Setters
        public List<String> getPermissions() { return permissions; }
        public void setPermissions(List<String> permissions) { this.permissions = permissions; }
    }
}
