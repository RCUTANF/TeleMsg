package com.telemsg.server.repository;

import com.telemsg.server.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 用户数据访问层
 *
 * @author TeleMsg Team
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * 根据用户ID查找用户
     */
    Optional<User> findByUserId(String userId);

    /**
     * 根据用户名查找用户
     */
    Optional<User> findByUsername(String username);

    /**
     * 根据邮箱查找用户
     */
    Optional<User> findByEmail(String email);

    /**
     * 根据手机号查找用户
     */
    Optional<User> findByPhone(String phone);

    /**
     * 检查用户ID是否存在
     */
    boolean existsByUserId(String userId);

    /**
     * 检查用户名是否存在
     */
    boolean existsByUsername(String username);

    /**
     * 检查邮箱是否存在
     */
    boolean existsByEmail(String email);

    /**
     * 更新用户在线状态
     */
    @Modifying
    @Query("UPDATE User u SET u.status = :status, u.updateTime = :updateTime WHERE u.userId = :userId")
    int updateUserStatus(String userId, User.UserStatus status, LocalDateTime updateTime);

    /**
     * 更新用户最后登录信息
     */
    @Modifying
    @Query("UPDATE User u SET u.lastLoginTime = :loginTime, u.lastLoginIp = :loginIp, u.updateTime = :updateTime WHERE u.userId = :userId")
    int updateLastLoginInfo(String userId, LocalDateTime loginTime, String loginIp, LocalDateTime updateTime);

    /**
     * 软删除用户
     */
    @Modifying
    @Query("UPDATE User u SET u.deleted = true, u.updateTime = :updateTime WHERE u.userId = :userId")
    int softDeleteUser(String userId, LocalDateTime updateTime);

    /**
     * 查找未被删除的所有用户
     */
    List<User> findByDeletedFalse();

    /**
     * 统计未删除的用户总数
     */
    long countByDeletedFalse();

    /**
     * 统计指定状态且未删除的用户数量
     */
    long countByStatusAndDeletedFalse(User.UserStatus status);
}
