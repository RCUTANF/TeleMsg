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

    // ==========================================
    // 讨论空间相关方法
    // ==========================================

    /**
     * 创建讨论空间
     * 讨论空间本质上是一个特殊的群组，有父群组ID
     */
    @Transactional
    public Group createDiscussionSpace(String name, String parentGroupId, String creatorId, List<String> memberIds, String description) {
        // 验证父群组是否存在
        Optional<Group> parentGroupOpt = groupRepository.findByGroupId(parentGroupId);
        if (parentGroupOpt.isEmpty()) {
            throw new RuntimeException("父群组不存在");
        }

        // 验证创建者是否为父群组成员
        if (!isGroupMember(parentGroupId, creatorId)) {
            throw new RuntimeException("只有父群组成员才能创建讨论空间");
        }

        // 创建讨论空间（本质上是一个特殊的群组）
        Group discussionSpace = new Group();
        discussionSpace.setGroupId(generateGroupId());
        discussionSpace.setGroupName(name);
        discussionSpace.setDescription(description);
        discussionSpace.setOwnerId(creatorId);
        discussionSpace.setParentGroupId(parentGroupId);  // 设置父群组ID
        discussionSpace.setType(Group.GroupType.NORMAL);

        Group savedSpace = groupRepository.save(discussionSpace);

        // 添加创建者为群组成员
        GroupMember creatorMember = new GroupMember();
        creatorMember.setGroupId(savedSpace.getGroupId());
        creatorMember.setUserId(creatorId);
        creatorMember.setRole(GroupMember.MemberRole.OWNER);
        groupMemberRepository.save(creatorMember);

        // 添加其他成员
        if (memberIds != null) {
            for (String memberId : memberIds) {
                if (!memberId.equals(creatorId) && isGroupMember(parentGroupId, memberId)) {
                    GroupMember member = new GroupMember();
                    member.setGroupId(savedSpace.getGroupId());
                    member.setUserId(memberId);
                    member.setRole(GroupMember.MemberRole.MEMBER);
                    groupMemberRepository.save(member);
                }
            }
        }

        log.info("讨论空间创建成功: spaceId={}, name={}, parentGroupId={}, creatorId={}",
                savedSpace.getGroupId(), name, parentGroupId, creatorId);

        return savedSpace;
    }

    /**
     * 获取某个群组的所有讨论空间
     */
    public List<Group> getDiscussionSpacesByParentGroup(String parentGroupId) {
        return groupRepository.findByParentGroupIdAndDeletedFalse(parentGroupId);
    }

    /**
     * 获取用户有权访问的所有讨论空间
     * （用户是讨论空间的成员）
     */
    public List<Group> getUserDiscussionSpaces(String userId) {
        // 获取用户加入的所有群组
        List<GroupMember> userGroups = groupMemberRepository.findByUserId(userId);

        // 过滤出讨论空间（有父群组ID的）
        return userGroups.stream()
            .map(member -> groupRepository.findByGroupId(member.getGroupId()))
            .filter(Optional::isPresent)
            .map(Optional::get)
            .filter(group -> group.getParentGroupId() != null && !group.getDeleted())
            .collect(java.util.stream.Collectors.toList());
    }

    /**
     * 向讨论空间添加成员
     */
    @Transactional
    public void addDiscussionSpaceMembers(String spaceId, String operatorId, List<String> memberIds) {
        // 验证讨论空间是否存在
        Optional<Group> spaceOpt = groupRepository.findByGroupId(spaceId);
        if (spaceOpt.isEmpty()) {
            throw new RuntimeException("讨论空间不存在");
        }

        Group space = spaceOpt.get();

        // 验证是否为讨论空间
        if (space.getParentGroupId() == null) {
            throw new RuntimeException("该群组不是讨论空间");
        }

        // 验证操作者权限（是否为讨论空间的管理员或群主）
        if (!hasAdminPermission(spaceId, operatorId)) {
            throw new RuntimeException("权限不足，只有管理员可以添加成员");
        }

        // 验证新成员是否为父群组成员
        String parentGroupId = space.getParentGroupId();

        for (String memberId : memberIds) {
            // 检查是否为父群组成员
            if (!isGroupMember(parentGroupId, memberId)) {
                log.warn("用户 {} 不是父群组成员，跳过添加到讨论空间", memberId);
                continue;
            }

            // 检查是否已经是讨论空间成员
            if (isGroupMember(spaceId, memberId)) {
                log.warn("用户 {} 已经是讨论空间成员，跳过", memberId);
                continue;
            }

            // 添加成员
            GroupMember member = new GroupMember();
            member.setGroupId(spaceId);
            member.setUserId(memberId);
            member.setRole(GroupMember.MemberRole.MEMBER);
            groupMemberRepository.save(member);

            log.info("用户 {} 已添加到讨论空间 {}", memberId, spaceId);
        }
    }

    /**
     * 从讨论空间移除成员
     */
    @Transactional
    public void removeDiscussionSpaceMember(String spaceId, String operatorId, String memberId) {
        // 验证讨论空间是否存在
        Optional<Group> spaceOpt = groupRepository.findByGroupId(spaceId);
        if (spaceOpt.isEmpty()) {
            throw new RuntimeException("讨论空间不存在");
        }

        Group space = spaceOpt.get();

        // 验证是否为讨论空间
        if (space.getParentGroupId() == null) {
            throw new RuntimeException("该群组不是讨论空间");
        }

        // 验证操作者权限
        if (!hasAdminPermission(spaceId, operatorId)) {
            throw new RuntimeException("权限不足，只有管理员可以移除成员");
        }

        // 不能移除群主
        Optional<GroupMember> memberOpt = groupMemberRepository.findByGroupIdAndUserId(spaceId, memberId);
        if (memberOpt.isPresent() && memberOpt.get().getRole() == GroupMember.MemberRole.OWNER) {
            throw new RuntimeException("不能移除讨论空间的创建者");
        }

        // 移除成员
        groupMemberRepository.deleteByGroupIdAndUserId(spaceId, memberId);

        log.info("用户 {} 已从讨论空间 {} 移除", memberId, spaceId);
    }
}
