package com.telemsg.server.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.telemsg.server.service.JwtService;
import com.telemsg.server.websocket.TeleMsgWebSocketHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.constraints.NotBlank;
import java.util.Map;
import java.util.HashMap;
import java.util.UUID;

/**
 * 视频通话相关REST API
 *
 * @author TeleMsg Team
 */
@Slf4j
@RestController
@RequestMapping("/calls")
@RequiredArgsConstructor
@Validated
public class CallController {

    private final JwtService jwtService;
    private final TeleMsgWebSocketHandler webSocketHandler;
    private final ObjectMapper objectMapper;

    /**
     * 发起通话
     */
    @PostMapping("/initiate")
    public ResponseEntity<?> initiateCall(@RequestHeader("Authorization") String authHeader,
                                        @RequestBody @Validated InitiateCallRequest request) {
        try {
            String callerId = extractUserIdFromToken(authHeader);

            // 生成通话ID - 使用统一格式: call_U{timestamp}_{callerId}
            String callId = "call_U" + System.currentTimeMillis() + "_" + callerId;

            // 构建信令数据
            Map<String, Object> signalData = new HashMap<>();
            signalData.put("type", "offer");
            signalData.put("callerId", callerId);
            signalData.put("contactId", request.getContactId());
            signalData.put("isVoiceOnly", request.getIsVoiceOnly());

            // 通过WebSocket向被叫方发送通话请求
            sendCallNotification(request.getContactId(), callId, callerId, request.getIsVoiceOnly());

            Map<String, Object> response = new HashMap<>();
            response.put("callId", callId);
            response.put("signalData", signalData);

            log.info("通话已发起: callId={}, callerId={}, contactId={}", callId, callerId, request.getContactId());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("发起通话失败", e);
            return ResponseEntity.badRequest().body(Map.of("error", "发起通话失败"));
        }
    }

    /**
     * 接听通话
     */
    @PostMapping("/answer")
    public ResponseEntity<?> answerCall(@RequestHeader("Authorization") String authHeader,
                                      @RequestBody @Validated AnswerCallRequest request) {
        try {
            String userId = extractUserIdFromToken(authHeader);
            // 通知发起者通话已被接听（需要从callId获取发起者信息，这里简化处理）
            // 在实际应用中，应该维护一个callId到callerId的映射

            return ResponseEntity.ok(Map.of("message", "通话已接听", "callId", request.getCallId()));

        } catch (Exception e) {
            log.error("接听通话失败", e);
            return ResponseEntity.badRequest().body(Map.of("error", "接听通话失败"));
        }
    }

    /**
     * 结束通话
     */
    @PostMapping("/end")
    public ResponseEntity<?> endCall(@RequestHeader("Authorization") String authHeader,
                                   @RequestBody @Validated EndCallRequest request) {
        try {
            String userId = extractUserIdFromToken(authHeader);

            // 这里应该实现结束通话的逻辑

            return ResponseEntity.ok(Map.of("message", "通话已结束", "callId", request.getCallId()));

        } catch (Exception e) {
            log.error("结束通话失败", e);
            return ResponseEntity.badRequest().body(Map.of("error", "结束通话失败"));
        }
    }

    /**
     * 从JWT token中提���用户ID
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
     * 通过WebSocket发送通话通知
     */
    private void sendCallNotification(String recipientId, String callId, String callerId, Boolean isVoiceOnly) {
        try {
            Map<String, Object> notification = new HashMap<>();
            notification.put("type", "call_incoming");

            Map<String, Object> callData = new HashMap<>();
            callData.put("callId", callId);
            callData.put("callerId", callerId);
            callData.put("isVoiceOnly", isVoiceOnly != null ? isVoiceOnly : false);
            callData.put("timestamp", System.currentTimeMillis());

            notification.put("call", callData);

            String jsonMessage = objectMapper.writeValueAsString(notification);
            webSocketHandler.sendMessageToUser(recipientId, jsonMessage);

            log.info("通话通知已发送: recipientId={}, callId={}, callerId={}", recipientId, callId, callerId);
        } catch (Exception e) {
            log.error("发送通话通知失败: recipientId={}, error={}", recipientId, e.getMessage(), e);
        }
    }

    // 请求对象
    public static class InitiateCallRequest {
        @NotBlank(message = "联系人ID不能为空")
        private String contactId;

        private Boolean isVoiceOnly = false;

        // Getters and Setters
        public String getContactId() { return contactId; }
        public void setContactId(String contactId) { this.contactId = contactId; }

        public Boolean getIsVoiceOnly() { return isVoiceOnly; }
        public void setIsVoiceOnly(Boolean isVoiceOnly) { this.isVoiceOnly = isVoiceOnly; }
    }

    public static class AnswerCallRequest {
        @NotBlank(message = "通话ID不能为空")
        private String callId;

        private Object signalData;

        // Getters and Setters
        public String getCallId() { return callId; }
        public void setCallId(String callId) { this.callId = callId; }

        public Object getSignalData() { return signalData; }
        public void setSignalData(Object signalData) { this.signalData = signalData; }
    }

    public static class EndCallRequest {
        @NotBlank(message = "通话ID不能为空")
        private String callId;

        // Getters and Setters
        public String getCallId() { return callId; }
        public void setCallId(String callId) { this.callId = callId; }
    }
}
