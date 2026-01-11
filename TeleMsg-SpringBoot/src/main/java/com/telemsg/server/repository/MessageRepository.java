package com.telemsg.server.repository;

import com.telemsg.server.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 消息数据访问层
 *
 * @author TeleMsg Team
 */
@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    /**
     * 根据消息ID查找消息
     */
    Optional<Message> findByMessageId(String messageId);

    /**
     * 获取私聊消息记录（分页）
     */
    @Query("SELECT m FROM Message m WHERE m.groupId IS NULL AND " +
           "((m.senderId = :user1 AND m.receiverId = :user2) OR " +
           "(m.senderId = :user2 AND m.receiverId = :user1)) AND " +
           "m.deleted = false ORDER BY m.createTime DESC")
    Page<Message> findPrivateMessages(String user1, String user2, Pageable pageable);

    /**
     * 获取群聊消息记录（分页）
     */
    @Query("SELECT m FROM Message m WHERE m.groupId = :groupId AND m.deleted = false ORDER BY m.createTime DESC")
    Page<Message> findGroupMessages(String groupId, Pageable pageable);

    /**
     * 获取用户的所有私聊消息
     */
    @Query("SELECT m FROM Message m WHERE m.groupId IS NULL AND " +
           "(m.senderId = :userId OR m.receiverId = :userId) AND " +
           "m.deleted = false ORDER BY m.createTime DESC")
    List<Message> findUserPrivateMessages(String userId);

    /**
     * 获取用户最近的聊天列表
     */
    @Query(value = "SELECT * FROM (" +
           "SELECT *, ROW_NUMBER() OVER (PARTITION BY " +
           "CASE WHEN group_id IS NOT NULL THEN group_id " +
           "ELSE CASE WHEN sender_id = :userId THEN receiver_id ELSE sender_id END END " +
           "ORDER BY create_time DESC) as rn " +
           "FROM tm_messages WHERE deleted = false AND " +
           "(sender_id = :userId OR receiver_id = :userId OR " +
           "group_id IN (SELECT group_id FROM tm_group_members WHERE user_id = :userId))" +
           ") t WHERE rn = 1 ORDER BY create_time DESC",
           nativeQuery = true)
    List<Message> findRecentChats(String userId);

    /**
     * 统计未读消息数量（私聊）
     */
    @Query("SELECT COUNT(m) FROM Message m WHERE m.receiverId = :userId AND m.groupId IS NULL AND " +
           "m.status != 'READ' AND m.deleted = false")
    long countUnreadPrivateMessages(String userId);

    /**
     * 统计群聊未读消息数量
     */
    @Query("SELECT COUNT(m) FROM Message m WHERE m.groupId = :groupId AND m.senderId != :userId AND " +
           "m.createTime > :lastReadTime AND m.deleted = false")
    long countUnreadGroupMessages(String groupId, String userId, LocalDateTime lastReadTime);

    /**
     * 更新消息状态
     */
    @Modifying
    @Query("UPDATE Message m SET m.status = :status, m.updateTime = :updateTime WHERE m.messageId = :messageId")
    int updateMessageStatus(String messageId, Message.MessageStatus status, LocalDateTime updateTime);

    /**
     * 批量更新私聊消息为已读状态
     */
    @Modifying
    @Query("UPDATE Message m SET m.status = 'READ', m.updateTime = :updateTime WHERE " +
           "m.senderId = :senderId AND m.receiverId = :receiverId AND m.groupId IS NULL AND " +
           "m.status != 'read' AND m.deleted = false")
    int markPrivateMessagesAsRead(String senderId, String receiverId, LocalDateTime updateTime);

    /**
     * 软删除消息
     */
    @Modifying
    @Query("UPDATE Message m SET m.deleted = true, m.updateTime = :updateTime WHERE m.messageId = :messageId")
    int softDeleteMessage(String messageId, LocalDateTime updateTime);

    /**
     * 根据关键词搜索消息
     */
    @Query("SELECT m FROM Message m WHERE m.content LIKE %:keyword% AND m.deleted = false AND " +
           "((m.groupId IS NULL AND (m.senderId = :userId OR m.receiverId = :userId)) OR " +
           "(m.groupId IN (SELECT gm.groupId FROM GroupMember gm WHERE gm.userId = :userId))) " +
           "ORDER BY m.createTime DESC")
    List<Message> searchMessages(String userId, String keyword);
}
