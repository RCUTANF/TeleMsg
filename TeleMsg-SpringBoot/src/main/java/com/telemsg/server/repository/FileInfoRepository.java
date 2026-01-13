package com.telemsg.server.repository;

import com.telemsg.server.entity.FileInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 文件信息 Repository
 *
 * @author TeleMsg Team
 * @since 1.0.0
 */
@Repository
public interface FileInfoRepository extends JpaRepository<FileInfo, Long> {

    /**
     * 根据文件ID查找文件信息
     */
    Optional<FileInfo> findByFileId(String fileId);

    /**
     * 根据上传者ID查找文件列表
     */
    List<FileInfo> findByUploaderIdOrderByCreatedTimeDesc(String uploaderId);

    /**
     * 查找图片类型文件
     */
    @Query("SELECT f FROM FileInfo f WHERE f.isImage = true ORDER BY f.createdTime DESC")
    List<FileInfo> findAllImages();

    /**
     * 根据上传者ID查找图片文件
     */
    @Query("SELECT f FROM FileInfo f WHERE f.uploaderId = :uploaderId AND f.isImage = true ORDER BY f.createdTime DESC")
    List<FileInfo> findImagesByUploaderId(@Param("uploaderId") String uploaderId);

    /**
     * 根据文件大小范围查询文件
     */
    List<FileInfo> findByFileSizeBetween(Long minSize, Long maxSize);

    /**
     * 删除指定上传者的所有文件记录
     */
    void deleteByUploaderId(String uploaderId);
}
