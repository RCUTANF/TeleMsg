package com.telemsg.server.service;

import com.telemsg.server.entity.Message;
import com.telemsg.server.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * 消息服务层
 *
 * @author TeleMsg Team
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserService userService;
    private final GroupService groupService;

    /**
     * 发送私聊消息
     */
    @Transactional
    public Message sendPrivateMessage(String senderId, String receiverId,
                                    Message.MessageType messageType, String content, String mediaUrl) {
        // 验证发送者和接收者
        if (userService.findByUserId(senderId).isEmpty()) {
            throw new RuntimeException("发送者不存在");
        }
        if (userService.findByUserId(receiverId).isEmpty()) {
            throw new RuntimeException("接收者不存在");
        }

        // 创建消息
        Message message = new Message();
        message.setMessageId(generateMessageId());
        message.setSenderId(senderId);
        message.setReceiverId(receiverId);
        message.setMessageType(messageType);
        message.setContent(content);
        message.setMediaUrl(mediaUrl);
        message.setStatus(Message.MessageStatus.SENT);

        Message savedMessage = messageRepository.save(message);

        log.info("私聊消息发送成功: messageId={}, senderId={}, receiverId={}",
                savedMessage.getMessageId(), senderId, receiverId);

        return savedMessage;
    }

    /**
     * 发送群聊消息
     */
    @Transactional
    public Message sendGroupMessage(String senderId, String groupId,
                                  Message.MessageType messageType, String content, String mediaUrl) {
        // 验证发送者
        if (userService.findByUserId(senderId).isEmpty()) {
            throw new RuntimeException("发送者不存在");
        }

        // 验证群组和成员身份
        if (!groupService.isGroupMember(groupId, senderId)) {
            throw new RuntimeException("���是群组成员，无法发送消息");
        }

        // 创建消息
        Message message = new Message();
        message.setMessageId(generateMessageId());
        message.setSenderId(senderId);
        message.setGroupId(groupId);
        message.setMessageType(messageType);
        message.setContent(content);
        message.setMediaUrl(mediaUrl);
        message.setStatus(Message.MessageStatus.SENT);

        Message savedMessage = messageRepository.save(message);

        log.info("群聊消息发送成功: messageId={}, senderId={}, groupId={}",
                savedMessage.getMessageId(), senderId, groupId);

        return savedMessage;
    }

    /**
     * 获取私聊消息记录
     */
    public Page<Message> getPrivateMessages(String user1, String user2, Pageable pageable) {
        return messageRepository.findPrivateMessages(user1, user2, pageable);
    }

    /**
     * 获取群聊消息记录
     */
    public Page<Message> getGroupMessages(String groupId, Pageable pageable) {
        // 验证群组是否存在
        if (groupService.findByGroupId(groupId).isEmpty()) {
            throw new RuntimeException("群组不存在");
        }

        return messageRepository.findGroupMessages(groupId, pageable);
    }

    /**
     * 获取用户最近的聊天列表
     */
    public List<Message> getRecentChats(String userId) {
        return messageRepository.findRecentChats(userId);
    }

    /**
     * 标记私聊消息为已读
     */
    @Transactional
    public void markPrivateMessagesAsRead(String senderId, String receiverId) {
        LocalDateTime updateTime = LocalDateTime.now();
        int updated = messageRepository.markPrivateMessagesAsRead(senderId, receiverId, updateTime);

        if (updated > 0) {
            log.debug("标记私聊消息为已读: senderId={}, receiverId={}, count={}", senderId, receiverId, updated);
        }
    }

    /**
     * 更新消息状态
     */
    @Transactional
    public void updateMessageStatus(String messageId, Message.MessageStatus status) {
        LocalDateTime updateTime = LocalDateTime.now();
        int updated = messageRepository.updateMessageStatus(messageId, status, updateTime);

        if (updated > 0) {
            log.debug("消息状态更新成功: messageId={}, status={}", messageId, status);
        }
    }

    /**
     * 根据消息ID查找消息
     */
    public Optional<Message> findByMessageId(String messageId) {
        return messageRepository.findByMessageId(messageId);
    }

    /**
     * 统计未读消息数量
     */
    public long countUnreadPrivateMessages(String userId) {
        return messageRepository.countUnreadPrivateMessages(userId);
    }

    /**
     * 统计群聊未读消息数量
     */
    public long countUnreadGroupMessages(String groupId, String userId, LocalDateTime lastReadTime) {
        return messageRepository.countUnreadGroupMessages(groupId, userId, lastReadTime);
    }

    /**
     * 搜索消息
     */
    public List<Message> searchMessages(String userId, String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return List.of();
        }

        return messageRepository.searchMessages(userId, keyword.trim());
    }

    /**
     * 删除消息（软删除）
     */
    @Transactional
    public void deleteMessage(String messageId, String operatorId) {
        Optional<Message> messageOpt = messageRepository.findByMessageId(messageId);
        if (messageOpt.isEmpty()) {
            throw new RuntimeException("消息不存在");
        }

        Message message = messageOpt.get();

        // 只有消息发送者或群管理员可以删除消息
        boolean canDelete = false;

        if (message.getSenderId().equals(operatorId)) {
            canDelete = true;
        } else if (message.isGroupMessage()) {
            // 群管理员可以删除群消息
            canDelete = groupService.hasAdminPermission(message.getGroupId(), operatorId);
        }

        if (!canDelete) {
            throw new RuntimeException("权限不足，无法删除消息");
        }

        LocalDateTime updateTime = LocalDateTime.now();
        int updated = messageRepository.softDeleteMessage(messageId, updateTime);

        if (updated > 0) {
            log.info("消息删除成功: messageId={}, operatorId={}", messageId, operatorId);
        } else {
            throw new RuntimeException("消息删除失败");
        }
    }

    /**
     * 消息撤回（只能撤回2分钟内的消息）
     */
    @Transactional
    public void recallMessage(String messageId, String operatorId) {
        Optional<Message> messageOpt = messageRepository.findByMessageId(messageId);
        if (messageOpt.isEmpty()) {
            throw new RuntimeException("消息不存在");
        }

        Message message = messageOpt.get();

        // 只有消息发送者可以撤回消息
        if (!message.getSenderId().equals(operatorId)) {
            throw new RuntimeException("只能撤回自己发送的消息");
        }

        // 检查是否在撤回时限内（2分钟）
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime deadline = message.getCreateTime().plusMinutes(2);
        if (now.isAfter(deadline)) {
            throw new RuntimeException("消息发送超过2分钟，无法撤回");
        }

        // 将消息内容改为撤回提示
        message.setContent("[消息已撤回]");
        message.setMessageType(Message.MessageType.SYSTEM);
        message.setUpdateTime(now);
        messageRepository.save(message);

        log.info("消息撤回成功: messageId={}, operatorId={}", messageId, operatorId);
    }

    /**
     * 获取私聊消息列表
     */
    public List<Message> getPrivateMessages(String userId1, String userId2, int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return messageRepository.findPrivateMessagesByUsers(userId1, userId2, pageable);
    }

    /**
     * 标记消息为已读
     */
    @Transactional
    public void markMessageAsRead(String messageId, String userId) {
        Optional<Message> messageOpt = messageRepository.findByMessageId(messageId);
        if (messageOpt.isPresent()) {
            Message message = messageOpt.get();
            // 只有接收者可以标记消息为已读
            if (message.getReceiverId() != null && message.getReceiverId().equals(userId)) {
                message.setStatus(Message.MessageStatus.READ);
                message.setUpdateTime(LocalDateTime.now());
                messageRepository.save(message);
                log.debug("消息已标记为已读: messageId={}, userId={}", messageId, userId);
            }
        }
    }

    /**
     * 获取消息总数
     */
    public long getTotalMessageCount() {
        return messageRepository.count();
    }

    /**
     * 生成唯一的消息ID
     */
    private String generateMessageId() {
        return UUID.randomUUID().toString().replace("-", "").toUpperCase();
    }
}
