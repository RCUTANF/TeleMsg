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
import java.util.HashMap;
import java.util.Map;

/**
 * 认证相关REST API
 *
 * @author TeleMsg Team
 */
@Slf4j
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Validated
public class AuthController {

    private final UserService userService;
    private final JwtService jwtService;

    /**
     * 用户登录
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody @Validated LoginRequest request) {
        try {
            Optional<User> userOpt = userService.authenticateUser(request.getUsername(), request.getPassword());

            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "用户名或密码错误"));
            }

            User user = userOpt.get();
            String token = jwtService.generateToken(user.getUserId());

            // 更新用户在线状态
            userService.updateUserStatus(user.getUserId(), User.UserStatus.ONLINE);

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", convertToUserResponse(user));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("用户登录失败", e);
            return ResponseEntity.badRequest().body(Map.of("error", "登录失败: " + e.getMessage()));
        }
    }

    /**
     * 用户注册
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody @Validated RegisterRequest request) {
        try {
            User user = userService.registerUserWithDisplayName(
                request.getName(),
                request.getUsername(),
                request.getPassword(),
                null // email 暂时为空
            );

            String token = jwtService.generateToken(user.getUserId());

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", convertToUserResponse(user));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("用户注册失败", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 用户登出
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String userId = jwtService.extractUserId(token);

            if (userId != null) {
                userService.updateUserStatus(userId, User.UserStatus.OFFLINE);
            }

            return ResponseEntity.ok(Map.of("message", "登出成功"));

        } catch (Exception e) {
            log.error("用户登出失败", e);
            return ResponseEntity.badRequest().body(Map.of("error", "登出失败"));
        }
    }

    private Map<String, Object> convertToUserResponse(User user) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getUserId());
        response.put("name", user.getUsername());
        response.put("username", user.getUsername());
        response.put("avatar", user.getAvatar() != null ? user.getAvatar() : "");
        response.put("role", "user");
        // 添加 isAdmin 字段，默认为 false
        // TODO: 后续可以从 User 实体或角色表中获取真实的管理员状态
        response.put("isAdmin", false);
        return response;
    }

    // 请求对象
    public static class LoginRequest {
        @NotBlank(message = "用户名不能为空")
        private String username;

        @NotBlank(message = "密码不能为空")
        private String password;

        // Getters and Setters
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class RegisterRequest {
        @NotBlank(message = "姓名不能为空")
        private String name;

        @NotBlank(message = "用户名不能为空")
        private String username;

        @NotBlank(message = "密码不能为空")
        private String password;

        // Getters and Setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
}
