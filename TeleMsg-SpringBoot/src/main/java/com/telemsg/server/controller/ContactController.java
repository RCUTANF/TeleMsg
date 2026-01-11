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
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;
import java.util.Optional;

/**
 * 联系人相关REST API
 *
 * @author TeleMsg Team
 */
@Slf4j
@RestController
@RequestMapping("/contacts")
@RequiredArgsConstructor
@Validated
public class ContactController {

    private final UserService userService;
    private final JwtService jwtService;

    /**
     * 获取联系人列表
     */
    @GetMapping
    public ResponseEntity<?> getContacts(@RequestHeader("Authorization") String authHeader) {
        try {
            String currentUserId = extractUserIdFromToken(authHeader);

            // 暂时返回所有用户作为联系人（除了自己）
            List<User> allUsers = userService.findAllUsers();
            List<Map<String, Object>> contacts = allUsers.stream()
                .filter(user -> !user.getUserId().equals(currentUserId))
                .map(this::convertToContactResponse)
                .collect(Collectors.toList());

            return ResponseEntity.ok(contacts);

        } catch (Exception e) {
            log.error("获取联系人列表失败", e);
            return ResponseEntity.badRequest().body(Map.of("error", "获取联系人失败"));
        }
    }

    /**
     * 添加联系人
     */
    @PostMapping
    public ResponseEntity<?> addContact(@RequestHeader("Authorization") String authHeader,
                                      @RequestBody @Validated AddContactRequest request) {
        try {
            String currentUserId = extractUserIdFromToken(authHeader);

            Optional<User> userOpt = userService.findByUserId(request.getUserId());
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "用户不存在"));
            }

            User user = userOpt.get();
            Map<String, Object> contact = convertToContactResponse(user);

            return ResponseEntity.ok(contact);

        } catch (Exception e) {
            log.error("添加联系人失败", e);
            return ResponseEntity.badRequest().body(Map.of("error", "添加联系人失败"));
        }
    }

    /**
     * 删除联系人
     */
    @DeleteMapping("/{contactId}")
    public ResponseEntity<?> deleteContact(@RequestHeader("Authorization") String authHeader,
                                         @PathVariable String contactId) {
        try {
            String currentUserId = extractUserIdFromToken(authHeader);

            // 这里应该实现删除联系人的逻辑
            // 暂时直接返回成功

            return ResponseEntity.ok(Map.of("message", "联系人删除成功"));

        } catch (Exception e) {
            log.error("删除联系人失败", e);
            return ResponseEntity.badRequest().body(Map.of("error", "删除联系人失败"));
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
     * 转换为联系人响应格式
     */
    private Map<String, Object> convertToContactResponse(User user) {
        Map<String, Object> contact = new HashMap<>();
        contact.put("id", user.getUserId());
        contact.put("name", user.getUsername());
        contact.put("avatar", user.getAvatar() != null ? user.getAvatar() : "");
        contact.put("status", user.getStatus().name().toLowerCase());
        contact.put("lastMessage", "");
        contact.put("unreadCount", 0);
        contact.put("lastSeen", "");
        return contact;
    }

    // 请求对象
    public static class AddContactRequest {
        @NotBlank(message = "用户ID不能为空")
        private String userId;

        // Getters and Setters
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
    }
}
