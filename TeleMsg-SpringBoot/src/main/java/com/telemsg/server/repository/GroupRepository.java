package com.telemsg.server.repository;

import com.telemsg.server.entity.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 群组数据访问层
 *
 * @author TeleMsg Team
 */
@Repository
public interface GroupRepository extends JpaRepository<Group, Long> {

    /**
     * 根据群组ID查找群组
     */
    Optional<Group> findByGroupId(String groupId);

    /**
     * 根据群主ID查找群组列表
     */
    List<Group> findByOwnerIdAndDeletedFalse(String ownerId);

    /**
     * 根据群组名称模糊搜索
     */
    List<Group> findByGroupNameContainingAndDeletedFalse(String groupName);

    /**
     * 检查群组ID是否存在
     */
    boolean existsByGroupId(String groupId);

    /**
     * 检查群组名称是否存在
     */
    boolean existsByGroupName(String groupName);

    /**
     * 更新群组信息
     */
    @Modifying
    @Query("UPDATE Group g SET g.groupName = :groupName, g.description = :description, g.avatar = :avatar, g.updateTime = :updateTime WHERE g.groupId = :groupId")
    int updateGroupInfo(String groupId, String groupName, String description, String avatar, LocalDateTime updateTime);

    /**
     * 转让群主
     */
    @Modifying
    @Query("UPDATE Group g SET g.ownerId = :newOwnerId, g.updateTime = :updateTime WHERE g.groupId = :groupId")
    int transferGroupOwnership(String groupId, String newOwnerId, LocalDateTime updateTime);

    /**
     * 软删除群组
     */
    @Modifying
    @Query("UPDATE Group g SET g.deleted = true, g.updateTime = :updateTime WHERE g.groupId = :groupId")
    int softDeleteGroup(String groupId, LocalDateTime updateTime);
}
