package com.telemsg.server.controller;

import com.telemsg.server.entity.User;
import com.telemsg.server.service.UserService;
import com.telemsg.server.service.MessageService;
import com.telemsg.server.service.JwtService;
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

    /**
     * 获取所有用户
     */
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(@RequestHeader("Authorization") String authHeader) {
        try {
            String adminId = extractUserIdFromToken(authHeader);

            // 这里应该验证是否为管理员权限

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
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@RequestHeader("Authorization") String authHeader,
                                      @PathVariable String userId) {
        try {
            String adminId = extractUserIdFromToken(authHeader);

            // 这里应该验证是否为管理员权限

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
    @PutMapping("/users/{userId}/role")
    public ResponseEntity<?> updateUserRole(@RequestHeader("Authorization") String authHeader,
                                          @PathVariable String userId,
                                          @RequestBody @Validated UpdateRoleRequest request) {
        try {
            String adminId = extractUserIdFromToken(authHeader);

            // 这里应该验证是否为管理员权限
            // 这里应该实现角色更新逻辑

            User user = userService.findByUserId(userId).orElse(null);
            if (user == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "用户不存在"));
            }

            Map<String, Object> response = convertToUserResponse(user);
            response.put("role", request.getRole());

            return ResponseEntity.ok(response);

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
            String adminId = extractUserIdFromToken(authHeader);

            // 这里应该验证是否为管理员权限

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
     * 转换为用户响应格式
     */
    private Map<String, Object> convertToUserResponse(User user) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getUserId());
        response.put("name", user.getUsername());
        response.put("username", user.getUsername());
        response.put("avatar", user.getAvatar() != null ? user.getAvatar() : "");
        response.put("role", "user"); // 默认角色
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
}
