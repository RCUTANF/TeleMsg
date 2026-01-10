package com.telemsg.server.controller;

import com.telemsg.server.entity.Message;
import com.telemsg.server.service.MessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 消息管理REST API
 *
 * @author TeleMsg Team
 */
@Slf4j
@RestController
@RequestMapping("/messages")
@RequiredArgsConstructor
@Validated
public class MessageController {

    private final MessageService messageService;

    /**
     * 发送私聊消息
     */
    @PostMapping("/private")
    public ResponseEntity<?> sendPrivateMessage(@RequestBody @Validated SendPrivateMessageRequest request) {
        try {
            Message message = messageService.sendPrivateMessage(
                request.getSenderId(),
                request.getReceiverId(),
                Message.MessageType.valueOf(request.getMessageType().toUpperCase()),
                request.getContent(),
                request.getMediaUrl()
            );

            MessageResponse response = convertToResponse(message);

            return ResponseEntity.ok(ApiResponse.success("消息发送成功", response));

        } catch (Exception e) {
            log.error("发送私聊消息失败", e);
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * 发送群聊消息
     */
    @PostMapping("/group")
    public ResponseEntity<?> sendGroupMessage(@RequestBody @Validated SendGroupMessageRequest request) {
        try {
            Message message = messageService.sendGroupMessage(
                request.getSenderId(),
                request.getGroupId(),
                Message.MessageType.valueOf(request.getMessageType().toUpperCase()),
                request.getContent(),
                request.getMediaUrl()
            );

            MessageResponse response = convertToResponse(message);

            return ResponseEntity.ok(ApiResponse.success("群聊消息发送成功", response));

        } catch (Exception e) {
            log.error("发送群聊消息失败", e);
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * 获取私聊消��记录
     */
    @GetMapping("/private")
    public ResponseEntity<?> getPrivateMessages(@RequestParam String user1,
                                              @RequestParam String user2,
                                              @RequestParam(defaultValue = "0") int page,
                                              @RequestParam(defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Message> messages = messageService.getPrivateMessages(user1, user2, pageable);

            List<MessageResponse> responseList = messages.getContent().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());

            PageResponse<MessageResponse> response = new PageResponse<>();
            response.setContent(responseList);
            response.setTotalElements(messages.getTotalElements());
            response.setTotalPages(messages.getTotalPages());
            response.setCurrentPage(page);
            response.setSize(size);

            return ResponseEntity.ok(ApiResponse.success("获取成功", response));

        } catch (Exception e) {
            log.error("获取私聊消息失败: user1={}, user2={}", user1, user2, e);
            return ResponseEntity.badRequest().body(ApiResponse.error("获取私聊消息失败"));
        }
    }

    /**
     * 获取群聊消息记录
     */
    @GetMapping("/group/{groupId}")
    public ResponseEntity<?> getGroupMessages(@PathVariable String groupId,
                                            @RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Message> messages = messageService.getGroupMessages(groupId, pageable);

            List<MessageResponse> responseList = messages.getContent().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());

            PageResponse<MessageResponse> response = new PageResponse<>();
            response.setContent(responseList);
            response.setTotalElements(messages.getTotalElements());
            response.setTotalPages(messages.getTotalPages());
            response.setCurrentPage(page);
            response.setSize(size);

            return ResponseEntity.ok(ApiResponse.success("获取成功", response));

        } catch (Exception e) {
            log.error("获取群聊消息失败: groupId={}", groupId, e);
            return ResponseEntity.badRequest().body(ApiResponse.error("获取群聊消息失败"));
        }
    }

    /**
     * 获取用户最近聊天列表
     */
    @GetMapping("/recent/{userId}")
    public ResponseEntity<?> getRecentChats(@PathVariable String userId) {
        try {
            List<Message> messages = messageService.getRecentChats(userId);
            List<MessageResponse> response = messages.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success("获取��功", response));

        } catch (Exception e) {
            log.error("获取最近聊天失败: userId={}", userId, e);
            return ResponseEntity.badRequest().body(ApiResponse.error("获取最近聊天失败"));
        }
    }

    /**
     * 标记私聊消息为已读
     */
    @PutMapping("/private/read")
    public ResponseEntity<?> markPrivateMessagesAsRead(@RequestBody @Validated MarkReadRequest request) {
        try {
            messageService.markPrivateMessagesAsRead(request.getSenderId(), request.getReceiverId());

            return ResponseEntity.ok(ApiResponse.success("标记已读成功", null));

        } catch (Exception e) {
            log.error("标记已读失败: senderId={}, receiverId={}", request.getSenderId(), request.getReceiverId(), e);
            return ResponseEntity.badRequest().body(ApiResponse.error("标记已读失败"));
        }
    }

    /**
     * 搜索消息
     */
    @GetMapping("/search")
    public ResponseEntity<?> searchMessages(@RequestParam String userId,
                                          @RequestParam String keyword) {
        try {
            List<Message> messages = messageService.searchMessages(userId, keyword);
            List<MessageResponse> response = messages.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success("搜索成功", response));

        } catch (Exception e) {
            log.error("搜索消息失败: userId={}, keyword={}", userId, keyword, e);
            return ResponseEntity.badRequest().body(ApiResponse.error("搜索消息失败"));
        }
    }

    /**
     * 删除消息
     */
    @DeleteMapping("/{messageId}")
    public ResponseEntity<?> deleteMessage(@PathVariable String messageId,
                                         @RequestParam String operatorId) {
        try {
            messageService.deleteMessage(messageId, operatorId);

            return ResponseEntity.ok(ApiResponse.success("消息删除成功", null));

        } catch (Exception e) {
            log.error("删除消息失败: messageId={}, operatorId={}", messageId, operatorId, e);
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * 撤回消息
     */
    @PutMapping("/{messageId}/recall")
    public ResponseEntity<?> recallMessage(@PathVariable String messageId,
                                         @RequestParam String operatorId) {
        try {
            messageService.recallMessage(messageId, operatorId);

            return ResponseEntity.ok(ApiResponse.success("消息��回成功", null));

        } catch (Exception e) {
            log.error("撤回消息失败: messageId={}, operatorId={}", messageId, operatorId, e);
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * 获取未读消息统计
     */
    @GetMapping("/unread/{userId}")
    public ResponseEntity<?> getUnreadCount(@PathVariable String userId) {
        try {
            long unreadCount = messageService.countUnreadPrivateMessages(userId);

            UnreadCountResponse response = new UnreadCountResponse();
            response.setUnreadCount(unreadCount);

            return ResponseEntity.ok(ApiResponse.success("获取成功", response));

        } catch (Exception e) {
            log.error("获取未读消息统计失败: userId={}", userId, e);
            return ResponseEntity.badRequest().body(ApiResponse.error("获取未读消息统计失败"));
        }
    }

    /**
     * 转换为响应对象
     */
    private MessageResponse convertToResponse(Message message) {
        MessageResponse response = new MessageResponse();
        response.setMessageId(message.getMessageId());
        response.setSenderId(message.getSenderId());
        response.setReceiverId(message.getReceiverId());
        response.setGroupId(message.getGroupId());
        response.setMessageType(message.getMessageType().name());
        response.setContent(message.getContent());
        response.setMediaUrl(message.getMediaUrl());
        response.setFileName(message.getFileName());
        response.setFileSize(message.getFileSize());
        response.setStatus(message.getStatus().name());
        response.setCreateTime(message.getCreateTime());
        return response;
    }

    // ===== 请求/响应对象 =====

    public static class SendPrivateMessageRequest {
        @NotBlank(message = "发送者ID不能为空")
        private String senderId;

        @NotBlank(message = "接收者ID不能为空")
        private String receiverId;

        @NotBlank(message = "消息类型不能为空")
        private String messageType;

        private String content;
        private String mediaUrl;

        // Getters and Setters
        public String getSenderId() { return senderId; }
        public void setSenderId(String senderId) { this.senderId = senderId; }

        public String getReceiverId() { return receiverId; }
        public void setReceiverId(String receiverId) { this.receiverId = receiverId; }

        public String getMessageType() { return messageType; }
        public void setMessageType(String messageType) { this.messageType = messageType; }

        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }

        public String getMediaUrl() { return mediaUrl; }
        public void setMediaUrl(String mediaUrl) { this.mediaUrl = mediaUrl; }
    }

    public static class SendGroupMessageRequest {
        @NotBlank(message = "发送者ID不能为空")
        private String senderId;

        @NotBlank(message = "群组ID不能为空")
        private String groupId;

        @NotBlank(message = "消息类型不能为空")
        private String messageType;

        private String content;
        private String mediaUrl;

        // Getters and Setters
        public String getSenderId() { return senderId; }
        public void setSenderId(String senderId) { this.senderId = senderId; }

        public String getGroupId() { return groupId; }
        public void setGroupId(String groupId) { this.groupId = groupId; }

        public String getMessageType() { return messageType; }
        public void setMessageType(String messageType) { this.messageType = messageType; }

        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }

        public String getMediaUrl() { return mediaUrl; }
        public void setMediaUrl(String mediaUrl) { this.mediaUrl = mediaUrl; }
    }

    public static class MarkReadRequest {
        @NotBlank(message = "发送者ID不能为空")
        private String senderId;

        @NotBlank(message = "接收者ID不能为空")
        private String receiverId;

        // Getters and Setters
        public String getSenderId() { return senderId; }
        public void setSenderId(String senderId) { this.senderId = senderId; }

        public String getReceiverId() { return receiverId; }
        public void setReceiverId(String receiverId) { this.receiverId = receiverId; }
    }

    public static class MessageResponse {
        private String messageId;
        private String senderId;
        private String receiverId;
        private String groupId;
        private String messageType;
        private String content;
        private String mediaUrl;
        private String fileName;
        private Long fileSize;
        private String status;
        private LocalDateTime createTime;

        // Getters and Setters
        public String getMessageId() { return messageId; }
        public void setMessageId(String messageId) { this.messageId = messageId; }

        public String getSenderId() { return senderId; }
        public void setSenderId(String senderId) { this.senderId = senderId; }

        public String getReceiverId() { return receiverId; }
        public void setReceiverId(String receiverId) { this.receiverId = receiverId; }

        public String getGroupId() { return groupId; }
        public void setGroupId(String groupId) { this.groupId = groupId; }

        public String getMessageType() { return messageType; }
        public void setMessageType(String messageType) { this.messageType = messageType; }

        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }

        public String getMediaUrl() { return mediaUrl; }
        public void setMediaUrl(String mediaUrl) { this.mediaUrl = mediaUrl; }

        public String getFileName() { return fileName; }
        public void setFileName(String fileName) { this.fileName = fileName; }

        public Long getFileSize() { return fileSize; }
        public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public LocalDateTime getCreateTime() { return createTime; }
        public void setCreateTime(LocalDateTime createTime) { this.createTime = createTime; }
    }

    public static class PageResponse<T> {
        private List<T> content;
        private long totalElements;
        private int totalPages;
        private int currentPage;
        private int size;

        // Getters and Setters
        public List<T> getContent() { return content; }
        public void setContent(List<T> content) { this.content = content; }

        public long getTotalElements() { return totalElements; }
        public void setTotalElements(long totalElements) { this.totalElements = totalElements; }

        public int getTotalPages() { return totalPages; }
        public void setTotalPages(int totalPages) { this.totalPages = totalPages; }

        public int getCurrentPage() { return currentPage; }
        public void setCurrentPage(int currentPage) { this.currentPage = currentPage; }

        public int getSize() { return size; }
        public void setSize(int size) { this.size = size; }
    }

    public static class UnreadCountResponse {
        private long unreadCount;

        // Getters and Setters
        public long getUnreadCount() { return unreadCount; }
        public void setUnreadCount(long unreadCount) { this.unreadCount = unreadCount; }
    }
}
