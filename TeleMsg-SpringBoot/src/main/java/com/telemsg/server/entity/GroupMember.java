package com.telemsg.server.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 群组成员实体类
 *
 * @author TeleMsg Team
 */
@Data
@Entity
@Table(name = "tm_group_members",
       uniqueConstraints = @UniqueConstraint(columnNames = {"groupId", "userId"}))
public class GroupMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String groupId;

    @Column(nullable = false, length = 50)
    private String userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MemberRole role = MemberRole.MEMBER;

    @Column(length = 100)
    private String nickname; // 群内昵称

    @Column(nullable = false)
    private Boolean muted = false; // 是否被禁言

    private LocalDateTime mutedUntil; // 禁言结束时间

    @Column(nullable = false)
    private LocalDateTime joinTime = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updateTime = LocalDateTime.now();

    // 成员角色
    public enum MemberRole {
        OWNER,      // 群主
        ADMIN,      // 管理员
        MEMBER      // 普通成员
    }
}
