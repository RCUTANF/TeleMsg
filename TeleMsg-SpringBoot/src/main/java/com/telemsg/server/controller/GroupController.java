package com.telemsg.server.controller;

import com.telemsg.server.entity.Group;
import com.telemsg.server.entity.GroupMember;
import com.telemsg.server.service.GroupService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 群组管理REST API
 *
 * @author TeleMsg Team
 */
@Slf4j
@RestController
@RequestMapping("/groups")
@RequiredArgsConstructor
@Validated
public class GroupController {

    private final GroupService groupService;

    /**
     * 创建群组
     */
    @PostMapping
    public ResponseEntity<?> createGroup(@RequestBody @Validated CreateGroupRequest request) {
        try {
            Group group = groupService.createGroup(
                request.getGroupName(),
                request.getDescription(),
                request.getOwnerId()
            );

            GroupResponse response = convertToResponse(group);

            return ResponseEntity.ok(ApiResponse.success("群组创建成功", response));

        } catch (Exception e) {
            log.error("创建群组失败", e);
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * 获取群组信息
     */
    @GetMapping("/{groupId}")
    public ResponseEntity<?> getGroupInfo(@PathVariable String groupId) {
        try {
            Optional<Group> groupOpt = groupService.findByGroupId(groupId);

            if (groupOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            GroupResponse response = convertToResponse(groupOpt.get());

            return ResponseEntity.ok(ApiResponse.success("获取成功", response));

        } catch (Exception e) {
            log.error("获取群组信息失败: groupId={}", groupId, e);
            return ResponseEntity.badRequest().body(ApiResponse.error("获取群组信息失败"));
        }
    }

    /**
     * 加入群组
     */
    @PostMapping("/{groupId}/members")
    public ResponseEntity<?> joinGroup(@PathVariable String groupId,
                                     @RequestBody @Validated JoinGroupRequest request) {
        try {
            groupService.joinGroup(groupId, request.getUserId(), request.getNickname());

            return ResponseEntity.ok(ApiResponse.success("加入群组成功", null));

        } catch (Exception e) {
            log.error("加入群组失败: groupId={}, userId={}", groupId, request.getUserId(), e);
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * 离开群组
     */
    @DeleteMapping("/{groupId}/members/{userId}")
    public ResponseEntity<?> leaveGroup(@PathVariable String groupId,
                                      @PathVariable String userId) {
        try {
            groupService.leaveGroup(groupId, userId);

            return ResponseEntity.ok(ApiResponse.success("离开群组成功", null));

        } catch (Exception e) {
            log.error("离开群组失败: groupId={}, userId={}", groupId, userId, e);
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * 踢出群成员
     */
    @DeleteMapping("/{groupId}/members/{targetUserId}/kick")
    public ResponseEntity<?> kickMember(@PathVariable String groupId,
                                      @PathVariable String targetUserId,
                                      @RequestParam String operatorId) {
        try {
            groupService.kickMember(groupId, operatorId, targetUserId);

            return ResponseEntity.ok(ApiResponse.success("踢出成员成功", null));

        } catch (Exception e) {
            log.error("踢出成员失败: groupId={}, operatorId={}, targetUserId={}",
                     groupId, operatorId, targetUserId, e);
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * 设置管理员
     */
    @PutMapping("/{groupId}/members/{targetUserId}/admin")
    public ResponseEntity<?> setAdmin(@PathVariable String groupId,
                                    @PathVariable String targetUserId,
                                    @RequestParam String ownerId,
                                    @RequestParam boolean isAdmin) {
        try {
            groupService.setAdmin(groupId, ownerId, targetUserId, isAdmin);

            String action = isAdmin ? "设置" : "取消";
            return ResponseEntity.ok(ApiResponse.success(action + "管理员成功", null));

        } catch (Exception e) {
            log.error("设置管理员失败: groupId={}, ownerId={}, targetUserId={}, isAdmin={}",
                     groupId, ownerId, targetUserId, isAdmin, e);
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * 转让群主
     */
    @PutMapping("/{groupId}/owner")
    public ResponseEntity<?> transferOwnership(@PathVariable String groupId,
                                             @RequestBody @Validated TransferOwnerRequest request) {
        try {
            groupService.transferOwnership(groupId, request.getCurrentOwnerId(), request.getNewOwnerId());

            return ResponseEntity.ok(ApiResponse.success("群主转让成功", null));

        } catch (Exception e) {
            log.error("群主转让失败: groupId={}, currentOwnerId={}, newOwnerId={}",
                     groupId, request.getCurrentOwnerId(), request.getNewOwnerId(), e);
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * 获取群成员列表
     */
    @GetMapping("/{groupId}/members")
    public ResponseEntity<?> getGroupMembers(@PathVariable String groupId) {
        try {
            List<GroupMember> members = groupService.getGroupMembers(groupId);
            List<GroupMemberResponse> response = members.stream()
                .map(this::convertToMemberResponse)
                .collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success("获取成功", response));

        } catch (Exception e) {
            log.error("获取群成员失败: groupId={}", groupId, e);
            return ResponseEntity.badRequest().body(ApiResponse.error("获取群成员失败"));
        }
    }

    /**
     * 获取用户加入的群组列表
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserGroups(@PathVariable String userId) {
        try {
            List<GroupMember> userGroups = groupService.getUserGroups(userId);
            List<GroupMemberResponse> response = userGroups.stream()
                .map(this::convertToMemberResponse)
                .collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success("获取成功", response));

        } catch (Exception e) {
            log.error("获取用户群组失败: userId={}", userId, e);
            return ResponseEntity.badRequest().body(ApiResponse.error("获取用户群组失败"));
        }
    }

    /**
     * 解散群组
     */
    @DeleteMapping("/{groupId}")
    public ResponseEntity<?> dissolveGroup(@PathVariable String groupId,
                                         @RequestParam String ownerId) {
        try {
            groupService.dissolveGroup(groupId, ownerId);

            return ResponseEntity.ok(ApiResponse.success("群组解散成功", null));

        } catch (Exception e) {
            log.error("解散群组失败: groupId={}, ownerId={}", groupId, ownerId, e);
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * 转换为群组响应对象
     */
    private GroupResponse convertToResponse(Group group) {
        GroupResponse response = new GroupResponse();
        response.setGroupId(group.getGroupId());
        response.setGroupName(group.getGroupName());
        response.setDescription(group.getDescription());
        response.setAvatar(group.getAvatar());
        response.setOwnerId(group.getOwnerId());
        response.setType(group.getType().name());
        response.setMaxMembers(group.getMaxMembers());
        response.setCreateTime(group.getCreateTime());
        return response;
    }

    /**
     * 转换为群成员响应对象
     */
    private GroupMemberResponse convertToMemberResponse(GroupMember member) {
        GroupMemberResponse response = new GroupMemberResponse();
        response.setGroupId(member.getGroupId());
        response.setUserId(member.getUserId());
        response.setRole(member.getRole().name());
        response.setNickname(member.getNickname());
        response.setMuted(member.getMuted());
        response.setMutedUntil(member.getMutedUntil());
        response.setJoinTime(member.getJoinTime());
        return response;
    }

    // ===== 请求/响应对象 =====

    public static class CreateGroupRequest {
        @NotBlank(message = "群组名称不能为空")
        private String groupName;

        private String description;

        @NotBlank(message = "群主ID不能为空")
        private String ownerId;

        // Getters and Setters
        public String getGroupName() { return groupName; }
        public void setGroupName(String groupName) { this.groupName = groupName; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getOwnerId() { return ownerId; }
        public void setOwnerId(String ownerId) { this.ownerId = ownerId; }
    }

    public static class JoinGroupRequest {
        @NotBlank(message = "用户ID不能为空")
        private String userId;

        private String nickname;

        // Getters and Setters
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }

        public String getNickname() { return nickname; }
        public void setNickname(String nickname) { this.nickname = nickname; }
    }

    public static class TransferOwnerRequest {
        @NotBlank(message = "当前群主ID不能为空")
        private String currentOwnerId;

        @NotBlank(message = "新群主ID不能为空")
        private String newOwnerId;

        // Getters and Setters
        public String getCurrentOwnerId() { return currentOwnerId; }
        public void setCurrentOwnerId(String currentOwnerId) { this.currentOwnerId = currentOwnerId; }

        public String getNewOwnerId() { return newOwnerId; }
        public void setNewOwnerId(String newOwnerId) { this.newOwnerId = newOwnerId; }
    }

    public static class GroupResponse {
        private String groupId;
        private String groupName;
        private String description;
        private String avatar;
        private String ownerId;
        private String type;
        private Integer maxMembers;
        private java.time.LocalDateTime createTime;

        // Getters and Setters
        public String getGroupId() { return groupId; }
        public void setGroupId(String groupId) { this.groupId = groupId; }

        public String getGroupName() { return groupName; }
        public void setGroupName(String groupName) { this.groupName = groupName; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getAvatar() { return avatar; }
        public void setAvatar(String avatar) { this.avatar = avatar; }

        public String getOwnerId() { return ownerId; }
        public void setOwnerId(String ownerId) { this.ownerId = ownerId; }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public Integer getMaxMembers() { return maxMembers; }
        public void setMaxMembers(Integer maxMembers) { this.maxMembers = maxMembers; }

        public java.time.LocalDateTime getCreateTime() { return createTime; }
        public void setCreateTime(java.time.LocalDateTime createTime) { this.createTime = createTime; }
    }

    public static class GroupMemberResponse {
        private String groupId;
        private String userId;
        private String role;
        private String nickname;
        private Boolean muted;
        private java.time.LocalDateTime mutedUntil;
        private java.time.LocalDateTime joinTime;

        // Getters and Setters
        public String getGroupId() { return groupId; }
        public void setGroupId(String groupId) { this.groupId = groupId; }

        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }

        public String getNickname() { return nickname; }
        public void setNickname(String nickname) { this.nickname = nickname; }

        public Boolean getMuted() { return muted; }
        public void setMuted(Boolean muted) { this.muted = muted; }

        public java.time.LocalDateTime getMutedUntil() { return mutedUntil; }
        public void setMutedUntil(java.time.LocalDateTime mutedUntil) { this.mutedUntil = mutedUntil; }

        public java.time.LocalDateTime getJoinTime() { return joinTime; }
        public void setJoinTime(java.time.LocalDateTime joinTime) { this.joinTime = joinTime; }
    }
}
