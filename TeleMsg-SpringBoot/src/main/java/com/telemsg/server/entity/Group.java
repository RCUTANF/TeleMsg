package com.telemsg.server.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 群组实体类
 *
 * @author TeleMsg Team
 */
@Data
@Entity
@Table(name = "tm_groups")
public class Group {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String groupId;

    @Column(nullable = false, length = 100)
    private String groupName;

    @Column(length = 500)
    private String description;

    @Column(length = 200)
    private String avatar;

    @Column(nullable = false, length = 50)
    private String ownerId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GroupType type = GroupType.NORMAL;

    @Column(nullable = false)
    private Integer maxMembers = 500;

    @Column(nullable = false)
    private Boolean deleted = false;

    @Column(nullable = false)
    private LocalDateTime createTime = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updateTime = LocalDateTime.now();

    // 群组类型
    public enum GroupType {
        NORMAL,     // 普通群
        ANNOUNCE,   // 公告群（只有管理员可发言）
        PRIVATE     // 私有群（需要邀请才能加入）
    }
}

