package com.telemsg.server.repository;

import com.telemsg.server.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 部门数据访问层
 *
 * @author TeleMsg Team
 */
@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {

    Optional<Department> findByDepartmentId(String departmentId);

    List<Department> findByDeletedFalse();

    @Query("SELECT d FROM Department d WHERE d.parentDepartmentId = :parentId AND d.deleted = false")
    List<Department> findByParentDepartmentIdAndDeletedFalse(@Param("parentId") String parentId);

    @Modifying
    @Query("UPDATE Department d SET d.deleted = true, d.updateTime = :updateTime WHERE d.departmentId = :departmentId")
    int softDeleteByDepartmentId(@Param("departmentId") String departmentId, @Param("updateTime") LocalDateTime updateTime);
}
