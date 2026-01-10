package com.telemsg.server.service;

import com.telemsg.server.entity.User;
import com.telemsg.server.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * 用户服务层
 *
 * @author TeleMsg Team
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * 用户注册
     */
    @Transactional
    public User registerUser(String username, String password, String email, String phone) {
        // 检查用户名是否已存在
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("用户名已存在");
        }

        // 检查邮箱是否已存在
        if (email != null && userRepository.existsByEmail(email)) {
            throw new RuntimeException("邮箱已被注册");
        }

        // 创建新用户
        User user = new User();
        user.setUserId(generateUserId());
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setEmail(email);
        user.setPhone(phone);
        user.setStatus(User.UserStatus.OFFLINE);

        User savedUser = userRepository.save(user);
        log.info("新用户注册成功: userId={}, username={}", savedUser.getUserId(), savedUser.getUsername());

        return savedUser;
    }

    /**
     * 用户登录验证
     */
    public Optional<User> authenticateUser(String username, String password) {
        Optional<User> userOpt = userRepository.findByUsername(username);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (passwordEncoder.matches(password, user.getPassword())) {
                return userOpt;
            }
        }

        return Optional.empty();
    }

    /**
     * 根据用户ID查找用户
     */
    public Optional<User> findByUserId(String userId) {
        return userRepository.findByUserId(userId);
    }

    /**
     * 根据用户名查找用户
     */
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    /**
     * 更新用户在线状态
     */
    @Transactional
    public void updateUserStatus(String userId, User.UserStatus status) {
        int updated = userRepository.updateUserStatus(userId, status, LocalDateTime.now());
        if (updated > 0) {
            log.debug("用户状态更新成功: userId={}, status={}", userId, status);
        }
    }

    /**
     * 更新用户最后登录信息
     */
    @Transactional
    public void updateLastLoginInfo(String userId, String loginIp) {
        LocalDateTime now = LocalDateTime.now();
        int updated = userRepository.updateLastLoginInfo(userId, now, loginIp, now);
        if (updated > 0) {
            log.debug("用户登录信息更新成功: userId={}, loginIp={}", userId, loginIp);
        }
    }

    /**
     * 更新用户信息
     */
    @Transactional
    public User updateUserInfo(String userId, String email, String phone, String avatar, String signature) {
        Optional<User> userOpt = userRepository.findByUserId(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("用户不存在");
        }

        User user = userOpt.get();
        if (email != null) user.setEmail(email);
        if (phone != null) user.setPhone(phone);
        if (avatar != null) user.setAvatar(avatar);
        if (signature != null) user.setSignature(signature);
        user.setUpdateTime(LocalDateTime.now());

        User updatedUser = userRepository.save(user);
        log.info("用户信息更新成功: userId={}", userId);

        return updatedUser;
    }

    /**
     * 修改密码
     */
    @Transactional
    public void changePassword(String userId, String oldPassword, String newPassword) {
        Optional<User> userOpt = userRepository.findByUserId(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("用户不存在");
        }

        User user = userOpt.get();
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("原密码错误");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdateTime(LocalDateTime.now());
        userRepository.save(user);

        log.info("用户密码修改成功: userId={}", userId);
    }

    /**
     * 软删除用户
     */
    @Transactional
    public void deleteUser(String userId) {
        int updated = userRepository.softDeleteUser(userId, LocalDateTime.now());
        if (updated > 0) {
            log.info("用户删除成功: userId={}", userId);
        } else {
            throw new RuntimeException("用户删除失败");
        }
    }

    /**
     * 生成唯一的用户ID
     */
    private String generateUserId() {
        String userId;
        do {
            userId = "U" + System.currentTimeMillis() + String.valueOf((int) (Math.random() * 1000));
        } while (userRepository.existsByUserId(userId));

        return userId;
    }
}
