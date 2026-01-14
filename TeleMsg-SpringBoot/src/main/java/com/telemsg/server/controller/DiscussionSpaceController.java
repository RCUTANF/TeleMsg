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
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 讨论空间管理REST API
 * 讨论空间是特殊的群组，有父群组ID
 *
 * @author TeleMsg Team
 */
@Slf4j
@RestController
@RequestMapping("/discussion-spaces")
@RequiredArgsConstructor
@Validated
public class DiscussionSpaceController {

    private final GroupService groupService;

    /**
     * 创建讨论空间
     */
    @PostMapping
    public ResponseEntity<?> createDiscussionSpace(@RequestBody @Validated CreateDiscussionSpaceRequest request) {
        try {
            Group discussionSpace = groupService.createDiscussionSpace(
                request.getName(),
                request.getGroupId(),
                request.getCreatorId(),
                request.getMembers(),
                request.getDescription()
            );

            DiscussionSpaceResponse response = convertToResponse(discussionSpace);

            return ResponseEntity.ok(ApiResponse.success("讨论空间创建成功", response));

        } catch (Exception e) {
            log.error("创建讨论空间失败", e);
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * 获取讨论空间列表
     * 如果提供 groupId 参数，则返回该群组的所有讨论空间
     * 否则返回用户有权访问的所有讨论空间
     */
    @GetMapping
    public ResponseEntity<?> getDiscussionSpaces(
        @RequestParam(required = false) String groupId,
        @RequestParam(required = false) String userId
    ) {
        try {
            List<Group> spaces;

            if (groupId != null) {
                // 获取指定群组的所有讨论空间
                spaces = groupService.getDiscussionSpacesByParentGroup(groupId);
            } else if (userId != null) {
                // 获取用户有权访问的所有讨论空间
                spaces = groupService.getUserDiscussionSpaces(userId);
            } else {
                // 如果没有提供任何参数，返回空列表
                spaces = List.of();
            }

            List<DiscussionSpaceResponse> response = spaces.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success("获取成功", response));

        } catch (Exception e) {
            log.error("获取讨论空间列表失败", e);
            return ResponseEntity.badRequest().body(ApiResponse.error("获取讨论空间列表失败"));
        }
    }

    /**
     * 获取讨论空间详情
     */
    @GetMapping("/{spaceId}")
    public ResponseEntity<?> getDiscussionSpaceInfo(@PathVariable String spaceId) {
        try {
            var spaceOpt = groupService.findByGroupId(spaceId);

            if (spaceOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Group space = spaceOpt.get();

            // 验证是否为讨论空间
            if (space.getParentGroupId() == null) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("该群组不是讨论空间"));
            }

            DiscussionSpaceResponse response = convertToResponse(space);

            return ResponseEntity.ok(ApiResponse.success("获取成功", response));

        } catch (Exception e) {
            log.error("获取讨论空间信息失败: spaceId={}", spaceId, e);
            return ResponseEntity.badRequest().body(ApiResponse.error("获取讨论空间信息失败"));
        }
    }

    /**
     * 向讨论空间添加成员
     */
    @PostMapping("/{spaceId}/members")
    public ResponseEntity<?> addMembers(
        @PathVariable String spaceId,
        @RequestBody @Validated AddMembersRequest request
    ) {
        try {
            groupService.addDiscussionSpaceMembers(spaceId, request.getOperatorId(), request.getMemberIds());

            // 返回更新后的讨论空间信息
            var spaceOpt = groupService.findByGroupId(spaceId);
            if (spaceOpt.isPresent()) {
                DiscussionSpaceResponse response = convertToResponse(spaceOpt.get());
                return ResponseEntity.ok(ApiResponse.success("添加成员成功", response));
            }

            return ResponseEntity.ok(ApiResponse.success("添加成员成功", null));

        } catch (Exception e) {
            log.error("添加讨论空间成员失败: spaceId={}", spaceId, e);
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * 从讨论空间移除成员
     */
    @DeleteMapping("/{spaceId}/members/{memberId}")
    public ResponseEntity<?> removeMember(
        @PathVariable String spaceId,
        @PathVariable String memberId,
        @RequestParam String operatorId
    ) {
        try {
            groupService.removeDiscussionSpaceMember(spaceId, operatorId, memberId);

            // 返回更新后的讨论空间信息
            var spaceOpt = groupService.findByGroupId(spaceId);
            if (spaceOpt.isPresent()) {
                DiscussionSpaceResponse response = convertToResponse(spaceOpt.get());
                return ResponseEntity.ok(ApiResponse.success("移除成员成功", response));
            }

            return ResponseEntity.ok(ApiResponse.success("移除成员成功", null));

        } catch (Exception e) {
            log.error("移除讨论空间成员失败: spaceId={}, memberId={}", spaceId, memberId, e);
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * 删除讨论空间
     */
    @DeleteMapping("/{spaceId}")
    public ResponseEntity<?> deleteDiscussionSpace(
        @PathVariable String spaceId,
        @RequestParam String ownerId
    ) {
        try {
            // 验证是否为讨论空间
            var spaceOpt = groupService.findByGroupId(spaceId);
            if (spaceOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Group space = spaceOpt.get();
            if (space.getParentGroupId() == null) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("该群组不是讨论空间"));
            }

            // 使用群组的解散方法
            groupService.dissolveGroup(spaceId, ownerId);

            return ResponseEntity.ok(ApiResponse.success("讨论空间已删除", null));

        } catch (Exception e) {
            log.error("删除讨论空间失败: spaceId={}", spaceId, e);
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * 获取讨论空间成员列表
     */
    @GetMapping("/{spaceId}/members")
    public ResponseEntity<?> getMembers(@PathVariable String spaceId) {
        try {
            List<GroupMember> members = groupService.getGroupMembers(spaceId);

            return ResponseEntity.ok(ApiResponse.success("获取成功", members));

        } catch (Exception e) {
            log.error("获取讨论空间成员失败: spaceId={}", spaceId, e);
            return ResponseEntity.badRequest().body(ApiResponse.error("获取成员列表失败"));
        }
    }

    /**
     * 转换为讨论空间响应对象
     */
    private DiscussionSpaceResponse convertToResponse(Group space) {
        DiscussionSpaceResponse response = new DiscussionSpaceResponse();
        response.setId(space.getGroupId());
        response.setName(space.getGroupName());
        response.setGroupId(space.getParentGroupId());
        response.setCreatorId(space.getOwnerId());
        response.setDescription(space.getDescription());
        response.setCreatedAt(space.getCreateTime());

        // 获取成员ID列表
        List<GroupMember> members = groupService.getGroupMembers(space.getGroupId());
        List<String> memberIds = members.stream()
            .map(GroupMember::getUserId)
            .collect(Collectors.toList());
        response.setMembers(memberIds);

        return response;
    }

    // ===== 请求/响应对象 =====

    public static class CreateDiscussionSpaceRequest {
        @NotBlank(message = "讨论空间名称不能为空")
        private String name;

        @NotBlank(message = "群组ID不能为空")
        private String groupId;

        @NotBlank(message = "创建者ID不能为空")
        private String creatorId;

        @NotNull(message = "成员列表不能为空")
        private List<String> members;

        private String description;

        // Getters and Setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getGroupId() { return groupId; }
        public void setGroupId(String groupId) { this.groupId = groupId; }

        public String getCreatorId() { return creatorId; }
        public void setCreatorId(String creatorId) { this.creatorId = creatorId; }

        public List<String> getMembers() { return members; }
        public void setMembers(List<String> members) { this.members = members; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }

    public static class AddMembersRequest {
        @NotBlank(message = "操作者ID不能为空")
        private String operatorId;

        @NotNull(message = "成员ID列表不能为空")
        private List<String> memberIds;

        // Getters and Setters
        public String getOperatorId() { return operatorId; }
        public void setOperatorId(String operatorId) { this.operatorId = operatorId; }

        public List<String> getMemberIds() { return memberIds; }
        public void setMemberIds(List<String> memberIds) { this.memberIds = memberIds; }
    }

    public static class DiscussionSpaceResponse {
        private String id;
        private String name;
        private String groupId;  // 父群组ID
        private String creatorId;
        private List<String> members;
        private java.time.LocalDateTime createdAt;
        private String description;

        // Getters and Setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getGroupId() { return groupId; }
        public void setGroupId(String groupId) { this.groupId = groupId; }

        public String getCreatorId() { return creatorId; }
        public void setCreatorId(String creatorId) { this.creatorId = creatorId; }

        public List<String> getMembers() { return members; }
        public void setMembers(List<String> members) { this.members = members; }

        public java.time.LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(java.time.LocalDateTime createdAt) { this.createdAt = createdAt; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }
}

