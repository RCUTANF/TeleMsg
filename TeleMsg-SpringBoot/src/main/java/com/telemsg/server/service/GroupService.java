package com.telemsg.server.service;

import com.telemsg.server.entity.Group;
import com.telemsg.server.entity.GroupMember;
import com.telemsg.server.repository.GroupRepository;
import com.telemsg.server.repository.GroupMemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 群组服务层
 *
 * @author TeleMsg Team
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserService userService;

    /**
     * 创建群组
     */
    @Transactional
    public Group createGroup(String groupName, String description, String ownerId) {
        // 验证群主是否存在
        if (userService.findByUserId(ownerId).isEmpty()) {
            throw new RuntimeException("群主用户不存在");
        }

        // 检查群名是否已存在
        if (groupRepository.existsByGroupName(groupName)) {
            throw new RuntimeException("群组名称已存在");
        }

        // 创建群组
        Group group = new Group();
        group.setGroupId(generateGroupId());
        group.setGroupName(groupName);
        group.setDescription(description);
        group.setOwnerId(ownerId);
        group.setType(Group.GroupType.NORMAL);

        Group savedGroup = groupRepository.save(group);

        // 添加群主为群组成员
        GroupMember ownerMember = new GroupMember();
        ownerMember.setGroupId(savedGroup.getGroupId());
        ownerMember.setUserId(ownerId);
        ownerMember.setRole(GroupMember.MemberRole.OWNER);
        groupMemberRepository.save(ownerMember);

        log.info("群组创建成功: groupId={}, groupName={}, ownerId={}",
                savedGroup.getGroupId(), savedGroup.getGroupName(), ownerId);

        return savedGroup;
    }

    /**
     * 根据群组ID查找群组
     */
    public Optional<Group> findByGroupId(String groupId) {
        return groupRepository.findByGroupId(groupId);
    }

    /**
     * 加入群组
     */
    @Transactional
    public void joinGroup(String groupId, String userId, String nickname) {
        // 验证群组是否存在
        Optional<Group> groupOpt = groupRepository.findByGroupId(groupId);
        if (groupOpt.isEmpty()) {
            throw new RuntimeException("群组不存在");
        }

        // 验证用户是否存在
        if (userService.findByUserId(userId).isEmpty()) {
            throw new RuntimeException("用户不存在");
        }

        // 检查是否已经是群成员
        if (groupMemberRepository.existsByGroupIdAndUserId(groupId, userId)) {
            throw new RuntimeException("已经是群成员");
        }

        Group group = groupOpt.get();

        // 检查群组人数限制
        long memberCount = groupMemberRepository.countByGroupId(groupId);
        if (memberCount >= group.getMaxMembers()) {
            throw new RuntimeException("群组人数已达上限");
        }

        // 添加群成员
        GroupMember member = new GroupMember();
        member.setGroupId(groupId);
        member.setUserId(userId);
        member.setRole(GroupMember.MemberRole.MEMBER);
        member.setNickname(nickname);
        groupMemberRepository.save(member);

        log.info("用户加入群组成功: groupId={}, userId={}", groupId, userId);
    }

    /**
     * 离开群组
     */
    @Transactional
    public void leaveGroup(String groupId, String userId) {
        // 验证是否为群成员
        Optional<GroupMember> memberOpt = groupMemberRepository.findByGroupIdAndUserId(groupId, userId);
        if (memberOpt.isEmpty()) {
            throw new RuntimeException("不是群成员");
        }

        GroupMember member = memberOpt.get();

        // 群主不能直接离开群组，需要先转让群主
        if (member.getRole() == GroupMember.MemberRole.OWNER) {
            throw new RuntimeException("群主不能直接离开群组，请先转让群主权限");
        }

        // 删除群成员
        groupMemberRepository.deleteByGroupIdAndUserId(groupId, userId);

        log.info("用户离开群组成功: groupId={}, userId={}", groupId, userId);
    }

    /**
     * 踢出群成员
     */
    @Transactional
    public void kickMember(String groupId, String operatorId, String targetUserId) {
        // 验证操作者权限
        Optional<GroupMember> operatorOpt = groupMemberRepository.findByGroupIdAndUserId(groupId, operatorId);
        if (operatorOpt.isEmpty()) {
            throw new RuntimeException("操作者不是群成员");
        }

        GroupMember operator = operatorOpt.get();
        if (operator.getRole() == GroupMember.MemberRole.MEMBER) {
            throw new RuntimeException("权限不足，无法踢出成员");
        }

        // 验证被踢用户
        Optional<GroupMember> targetOpt = groupMemberRepository.findByGroupIdAndUserId(groupId, targetUserId);
        if (targetOpt.isEmpty()) {
            throw new RuntimeException("被踢用户不是群成员");
        }

        GroupMember target = targetOpt.get();

        // 不能踢出群主
        if (target.getRole() == GroupMember.MemberRole.OWNER) {
            throw new RuntimeException("不能踢出群主");
        }

        // 管理员只能踢出普通成员
        if (operator.getRole() == GroupMember.MemberRole.ADMIN && target.getRole() == GroupMember.MemberRole.ADMIN) {
            throw new RuntimeException("管理员不能踢出其他管理员");
        }

        // 删除群成员
        groupMemberRepository.deleteByGroupIdAndUserId(groupId, targetUserId);

        log.info("踢出群成员成功: groupId={}, operatorId={}, targetUserId={}", groupId, operatorId, targetUserId);
    }

    /**
     * 设置管理员
     */
    @Transactional
    public void setAdmin(String groupId, String ownerId, String targetUserId, boolean isAdmin) {
        // 验证群主权限
        Optional<GroupMember> ownerOpt = groupMemberRepository.findByGroupIdAndUserId(groupId, ownerId);
        if (ownerOpt.isEmpty() || ownerOpt.get().getRole() != GroupMember.MemberRole.OWNER) {
            throw new RuntimeException("只有群主才能设置管理员");
        }

        // 验证目标用户
        Optional<GroupMember> targetOpt = groupMemberRepository.findByGroupIdAndUserId(groupId, targetUserId);
        if (targetOpt.isEmpty()) {
            throw new RuntimeException("目标用户不是群成员");
        }

        GroupMember.MemberRole newRole = isAdmin ? GroupMember.MemberRole.ADMIN : GroupMember.MemberRole.MEMBER;
        groupMemberRepository.updateMemberRole(groupId, targetUserId, newRole, LocalDateTime.now());

        log.info("设置管理员成功: groupId={}, targetUserId={}, isAdmin={}", groupId, targetUserId, isAdmin);
    }

    /**
     * 转让群主
     */
    @Transactional
    public void transferOwnership(String groupId, String currentOwnerId, String newOwnerId) {
        // 验证当前群主权限
        Optional<GroupMember> currentOwnerOpt = groupMemberRepository.findByGroupIdAndUserId(groupId, currentOwnerId);
        if (currentOwnerOpt.isEmpty() || currentOwnerOpt.get().getRole() != GroupMember.MemberRole.OWNER) {
            throw new RuntimeException("只有群主才能转让群主权限");
        }

        // 验证新群主
        Optional<GroupMember> newOwnerOpt = groupMemberRepository.findByGroupIdAndUserId(groupId, newOwnerId);
        if (newOwnerOpt.isEmpty()) {
            throw new RuntimeException("新群主不是群成员");
        }

        // 更新群组的群主
        groupRepository.transferGroupOwnership(groupId, newOwnerId, LocalDateTime.now());

        // 更新成员角色
        groupMemberRepository.updateMemberRole(groupId, currentOwnerId, GroupMember.MemberRole.MEMBER, LocalDateTime.now());
        groupMemberRepository.updateMemberRole(groupId, newOwnerId, GroupMember.MemberRole.OWNER, LocalDateTime.now());

        log.info("群主转让成功: groupId={}, oldOwnerId={}, newOwnerId={}", groupId, currentOwnerId, newOwnerId);
    }

    /**
     * 获取群组成员列表
     */
    public List<GroupMember> getGroupMembers(String groupId) {
        return groupMemberRepository.findByGroupId(groupId);
    }

    /**
     * 获取用户加入的群组列表
     */
    public List<GroupMember> getUserGroups(String userId) {
        return groupMemberRepository.findByUserId(userId);
    }

    /**
     * 检查用户是否为群成员
     */
    public boolean isGroupMember(String groupId, String userId) {
        return groupMemberRepository.existsByGroupIdAndUserId(groupId, userId);
    }

    /**
     * 检查用户是否有管理员权限
     */
    public boolean hasAdminPermission(String groupId, String userId) {
        Optional<GroupMember> memberOpt = groupMemberRepository.findByGroupIdAndUserId(groupId, userId);
        if (memberOpt.isEmpty()) {
            return false;
        }

        GroupMember.MemberRole role = memberOpt.get().getRole();
        return role == GroupMember.MemberRole.OWNER || role == GroupMember.MemberRole.ADMIN;
    }

    /**
     * 解散群组
     */
    @Transactional
    public void dissolveGroup(String groupId, String ownerId) {
        // 验证群主权限
        Optional<GroupMember> ownerOpt = groupMemberRepository.findByGroupIdAndUserId(groupId, ownerId);
        if (ownerOpt.isEmpty() || ownerOpt.get().getRole() != GroupMember.MemberRole.OWNER) {
            throw new RuntimeException("只有群主才能解散群组");
        }

        // 删除所有群成员
        groupMemberRepository.deleteByGroupId(groupId);

        // 软删除群组
        groupRepository.softDeleteGroup(groupId, LocalDateTime.now());

        log.info("群组解散成功: groupId={}, ownerId={}", groupId, ownerId);
    }

    /**
     * 生成唯一的群组ID
     */
    private String generateGroupId() {
        String groupId;
        do {
            groupId = "G" + System.currentTimeMillis() + String.valueOf((int) (Math.random() * 1000));
        } while (groupRepository.existsByGroupId(groupId));

        return groupId;
    }
}
