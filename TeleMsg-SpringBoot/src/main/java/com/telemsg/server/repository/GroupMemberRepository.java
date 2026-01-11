package com.telemsg.server.repository;

import com.telemsg.server.entity.GroupMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 群组成员数据访问层
 *
 * @author TeleMsg Team
 */
@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {

    /**
     * 查找群组成员
     */
    Optional<GroupMember> findByGroupIdAndUserId(String groupId, String userId);

    /**
     * 获取群组所有成员
     */
    List<GroupMember> findByGroupId(String groupId);

    /**
     * 获取用户加入的所有群组
     */
    List<GroupMember> findByUserId(String userId);

    /**
     * 获取群组成员数量
     */
    long countByGroupId(String groupId);

    /**
     * 检查用户是否为群组成员
     */
    boolean existsByGroupIdAndUserId(String groupId, String userId);

    /**
     * 获取群组管理员列表（群主+管理员）
     */
    @Query("SELECT gm FROM GroupMember gm WHERE gm.groupId = :groupId AND gm.role IN ('OWNER', 'ADMIN')")
    List<GroupMember> findGroupAdmins(String groupId);

    /**
     * 更新成员角色
     */
    @Modifying
    @Query("UPDATE GroupMember gm SET gm.role = :role, gm.updateTime = :updateTime WHERE gm.groupId = :groupId AND gm.userId = :userId")
    int updateMemberRole(String groupId, String userId, GroupMember.MemberRole role, LocalDateTime updateTime);

    /**
     * 更新成员昵称
     */
    @Modifying
    @Query("UPDATE GroupMember gm SET gm.nickname = :nickname, gm.updateTime = :updateTime WHERE gm.groupId = :groupId AND gm.userId = :userId")
    int updateMemberNickname(String groupId, String userId, String nickname, LocalDateTime updateTime);

    /**
     * 禁言/取消禁言成员
     */
    @Modifying
    @Query("UPDATE GroupMember gm SET gm.muted = :muted, gm.mutedUntil = :mutedUntil, gm.updateTime = :updateTime WHERE gm.groupId = :groupId AND gm.userId = :userId")
    int updateMemberMuteStatus(String groupId, String userId, Boolean muted, LocalDateTime mutedUntil, LocalDateTime updateTime);

    /**
     * 删除群组成员
     */
    void deleteByGroupIdAndUserId(String groupId, String userId);

    /**
     * 删除群组所有成员
     */
    void deleteByGroupId(String groupId);
}
