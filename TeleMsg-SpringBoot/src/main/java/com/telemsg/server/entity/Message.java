package com.telemsg.server.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 消息实体类
 *
 * @author TeleMsg Team
 */
@Data
@Entity
@Table(name = "tm_messages", indexes = {
    @Index(name = "idx_sender", columnList = "senderId"),
    @Index(name = "idx_receiver", columnList = "receiverId"),
    @Index(name = "idx_group", columnList = "groupId"),
    @Index(name = "idx_create_time", columnList = "createTime")
})
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 100)
    private String messageId;

    @Column(nullable = false, length = 50)
    private String senderId;

    @Column(length = 50)
    private String receiverId; // 私聊时的接收者，群聊时为null

    @Column(length = 50)
    private String groupId; // 群聊时的群ID，私聊时为null

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MessageType messageType;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(length = 500)
    private String mediaUrl; // 媒体文件URL（图片、语音、文件等）

    @Column(length = 200)
    private String fileName; // 文件名

    private Long fileSize; // 文件大小（字节）

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MessageStatus status = MessageStatus.SENT;

    @Column(nullable = false)
    private Boolean deleted = false;

    @Column(nullable = false)
    private LocalDateTime createTime = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updateTime = LocalDateTime.now();

    // 消息类型
    public enum MessageType {
        TEXT,       // 文本消息
        IMAGE,      // 图片消息
        VOICE,      // 语音消息
        VIDEO,      // 视频消息
        FILE,       // 文件消息
        SYSTEM      // 系统消息
    }

    // 消息状态
    public enum MessageStatus {
        SENT,       // 已发送
        DELIVERED,  // 已送达
        READ,       // 已读
        FAILED      // 发送失败
    }

    /**
     * 判断是否为群聊消息
     */
    public boolean isGroupMessage() {
        return groupId != null && !groupId.isEmpty();
    }

    /**
     * 判断是否为私聊消息
     */
    public boolean isPrivateMessage() {
        return !isGroupMessage();
    }
}
