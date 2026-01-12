package com.telemsg.server.controller;

import com.telemsg.server.entity.User;
import com.telemsg.server.service.UserService;
import com.telemsg.server.service.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.constraints.NotBlank;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;

/**
 * 用户管理REST API
 *
 * @author TeleMsg Team
 */
@Slf4j
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Validated
public class UserController {

    private final UserService userService;
    private final JwtService jwtService;





    /**
     * 获取当前用户信息
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        try {
            // 从JWT token中提取用户ID (这里简化处理，实际应该通过JWT服务)
            String userId = extractUserIdFromToken(authHeader);

            Optional<User> userOpt = userService.findByUserId(userId);

            if (userOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok(convertToClientResponse(userOpt.get()));

        } catch (Exception e) {
            log.error("获取当前用户信息失败", e);
            return ResponseEntity.badRequest().body("获取用户信息失败");
        }
    }

    /**
     * 更新用户资料
     */
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestHeader("Authorization") String authHeader,
                                         @RequestBody UpdateProfileRequest request) {
        try {
            String userId = extractUserIdFromToken(authHeader);

            User user = userService.updateUserProfile(userId, request.getName(), request.getUsername());

            return ResponseEntity.ok(convertToClientResponse(user));

        } catch (Exception e) {
            log.error("更新用户资料失败", e);
            return ResponseEntity.badRequest().body("更新资料失败: " + e.getMessage());
        }
    }

    /**
     * 获取用户信息
     */
    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserInfo(@PathVariable String userId) {
        try {
            Optional<User> userOpt = userService.findByUserId(userId);

            if (userOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            UserResponse response = convertToResponse(userOpt.get());

            return ResponseEntity.ok(ApiResponse.success("获取成功", response));

        } catch (Exception e) {
            log.error("获取用户信息失败: userId={}", userId, e);
            return ResponseEntity.badRequest().body(ApiResponse.error("获取用户信息失败"));
        }
    }

    /**
     * 更新用户信息
     */
    @PutMapping("/{userId}")
    public ResponseEntity<?> updateUserInfo(@PathVariable String userId,
                                           @RequestBody @Validated UserUpdateRequest request) {
        try {
            User user = userService.updateUserInfo(
                userId,
                request.getEmail(),
                request.getPhone(),
                request.getAvatar(),
                request.getSignature()
            );

            UserResponse response = convertToResponse(user);

            return ResponseEntity.ok(ApiResponse.success("更新成功", response));

        } catch (Exception e) {
            log.error("更新用户信息失败: userId={}", userId, e);
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * 修改密码
     */
    @PutMapping("/{userId}/password")
    public ResponseEntity<?> changePassword(@PathVariable String userId,
                                          @RequestBody @Validated ChangePasswordRequest request) {
        try {
            userService.changePassword(userId, request.getOldPassword(), request.getNewPassword());

            return ResponseEntity.ok(ApiResponse.success("密码修改成功", null));

        } catch (Exception e) {
            log.error("修改密码失败: userId={}", userId, e);
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * 删除用户
     */
    @DeleteMapping("/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable String userId) {
        try {
            userService.deleteUser(userId);

            return ResponseEntity.ok(ApiResponse.success("用户删除成功", null));

        } catch (Exception e) {
            log.error("删除用户失败: userId={}", userId, e);
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * 转换为响应对象
     */
    private UserResponse convertToResponse(User user) {
        UserResponse response = new UserResponse();
        response.setUserId(user.getUserId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        response.setAvatar(user.getAvatar());
        response.setSignature(user.getSignature());
        response.setStatus(user.getStatus().name());
        response.setCreateTime(user.getCreateTime());
        response.setLastLoginTime(user.getLastLoginTime());
        return response;
    }

    // ===== 请求/响应对象 =====





    public static class UserUpdateRequest {
        private String email;
        private String phone;
        private String avatar;
        private String signature;

        // Getters and Setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public String getAvatar() { return avatar; }
        public void setAvatar(String avatar) { this.avatar = avatar; }

        public String getSignature() { return signature; }
        public void setSignature(String signature) { this.signature = signature; }
    }

    public static class ChangePasswordRequest {
        @NotBlank(message = "原密码不能为空")
        private String oldPassword;

        @NotBlank(message = "新密码不能为空")
        private String newPassword;

        // Getters and Setters
        public String getOldPassword() { return oldPassword; }
        public void setOldPassword(String oldPassword) { this.oldPassword = oldPassword; }

        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }

    public static class UserResponse {
        private String userId;
        private String username;
        private String email;
        private String phone;
        private String avatar;
        private String signature;
        private String status;
        private java.time.LocalDateTime createTime;
        private java.time.LocalDateTime lastLoginTime;

        // Getters and Setters
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public String getAvatar() { return avatar; }
        public void setAvatar(String avatar) { this.avatar = avatar; }

        public String getSignature() { return signature; }
        public void setSignature(String signature) { this.signature = signature; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public java.time.LocalDateTime getCreateTime() { return createTime; }
        public void setCreateTime(java.time.LocalDateTime createTime) { this.createTime = createTime; }

        public java.time.LocalDateTime getLastLoginTime() { return lastLoginTime; }
        public void setLastLoginTime(java.time.LocalDateTime lastLoginTime) { this.lastLoginTime = lastLoginTime; }
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
     * 转换为客户端期望的响应格式
     */
    private Object convertToClientResponse(User user) {
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("id", user.getUserId());
        response.put("name", user.getUsername());
        response.put("username", user.getUsername());
        response.put("avatar", user.getAvatar() != null ? user.getAvatar() : "");
        response.put("role", "user");
        return response;
    }

    public static class UpdateProfileRequest {
        @NotBlank(message = "姓名不能为空")
        private String name;

        @NotBlank(message = "用户名不能为空")
        private String username;

        // Getters and Setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
    }
}
