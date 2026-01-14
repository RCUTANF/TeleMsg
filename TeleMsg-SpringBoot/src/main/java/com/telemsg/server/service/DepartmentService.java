package com.telemsg.server.service;

import com.telemsg.server.entity.Department;
import com.telemsg.server.entity.User;
import com.telemsg.server.repository.DepartmentRepository;
import com.telemsg.server.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 部门服务层
 *
 * @author TeleMsg Team
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;

    /**
     * 创建部门
     */
    @Transactional
    public Department createDepartment(String name, String description, String managerId, String parentDepartmentId) {
        // 检查部门名称是否已存在
        if (departmentRepository.findByDeletedFalse().stream()
                .anyMatch(d -> d.getName().equals(name))) {
            throw new RuntimeException("部门名称已存在");
        }

        Department department = new Department();
        department.setDepartmentId(generateDepartmentId());
        department.setName(name);
        department.setDescription(description);
        department.setManagerId(managerId);
        department.setParentDepartmentId(parentDepartmentId);

        Department savedDepartment = departmentRepository.save(department);
        log.info("部门创建成功: departmentId={}, name={}", savedDepartment.getDepartmentId(), savedDepartment.getName());

        return savedDepartment;
    }

    /**
     * 更新部门
     */
    @Transactional
    public Department updateDepartment(String departmentId, String name, String description, String managerId, String parentDepartmentId) {
        Optional<Department> departmentOpt = departmentRepository.findByDepartmentId(departmentId);
        if (departmentOpt.isEmpty()) {
            throw new RuntimeException("部门不存在");
        }

        Department department = departmentOpt.get();
        if (name != null) department.setName(name);
        if (description != null) department.setDescription(description);
        if (managerId != null) department.setManagerId(managerId);
        if (parentDepartmentId != null) department.setParentDepartmentId(parentDepartmentId);
        department.setUpdateTime(LocalDateTime.now());

        Department updatedDepartment = departmentRepository.save(department);
        log.info("部门更新成功: departmentId={}", departmentId);

        return updatedDepartment;
    }

    /**
     * 删除部门
     */
    @Transactional
    public void deleteDepartment(String departmentId) {
        int updated = departmentRepository.softDeleteByDepartmentId(departmentId, LocalDateTime.now());
        if (updated > 0) {
            log.info("部门删除成功: departmentId={}", departmentId);
        } else {
            throw new RuntimeException("部门删除失败");
        }
    }

    /**
     * 根据ID查找部门
     */
    public Optional<Department> findByDepartmentId(String departmentId) {
        return departmentRepository.findByDepartmentId(departmentId);
    }

    /**
     * 获取所有部门
     */
    public List<Department> findAllDepartments() {
        return departmentRepository.findByDeletedFalse();
    }

    /**
     * 获取子部门
     */
    public List<Department> findSubDepartments(String parentDepartmentId) {
        return departmentRepository.findByParentDepartmentIdAndDeletedFalse(parentDepartmentId);
    }

    /**
     * 获取部门成员
     */
    public List<User> findDepartmentMembers(String departmentId) {
        return userRepository.findByDepartmentIdAndDeletedFalse(departmentId);
    }

    /**
     * 获取部门成员数量
     */
    public long getDepartmentMemberCount(String departmentId) {
        return userRepository.countByDepartmentIdAndDeletedFalse(departmentId);
    }

    /**
     * 批量添加部门成员
     */
    @Transactional
    public void addDepartmentMembers(String departmentId, List<String> userIds) {
        // 验证部门是否存在
        Optional<Department> departmentOpt = departmentRepository.findByDepartmentId(departmentId);
        if (departmentOpt.isEmpty()) {
            throw new RuntimeException("部门不存在");
        }

        // 批量更新用户的部门ID
        for (String userId : userIds) {
            Optional<User> userOpt = userRepository.findByUserId(userId);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                user.setDepartmentId(departmentId);
                userRepository.save(user);
            } else {
                log.warn("用户不存在，跳过添加: userId={}", userId);
            }
        }

        log.info("批量添加部门成员成功: departmentId={}, count={}", departmentId, userIds.size());
    }

    /**
     * 移除部门成员
     */
    @Transactional
    public void removeDepartmentMember(String departmentId, String userId) {
        Optional<User> userOpt = userRepository.findByUserId(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (departmentId.equals(user.getDepartmentId())) {
                user.setDepartmentId(null);
                userRepository.save(user);
                log.info("移除部门成员成功: departmentId={}, userId={}", departmentId, userId);
            } else {
                log.warn("用户不属于该部门: userId={}, departmentId={}", userId, departmentId);
            }
        } else {
            throw new RuntimeException("用户不存在");
        }
    }

    /**
     * 生成唯一的部门ID
     */
    private String generateDepartmentId() {
        String departmentId;
        do {
            departmentId = "D" + System.currentTimeMillis() + String.valueOf((int) (Math.random() * 1000));
        } while (departmentRepository.findByDepartmentId(departmentId).isPresent());

        return departmentId;
    }
}
