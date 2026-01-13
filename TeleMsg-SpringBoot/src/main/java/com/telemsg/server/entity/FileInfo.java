package com.telemsg.server.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

/**
 * 文件信息实体
 *
 * @author TeleMsg Team
 * @since 1.0.0
 */
@Entity
@Table(name = "files")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FileInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "file_id", unique = true, nullable = false)
    private String fileId;

    @Column(name = "original_filename")
    private String originalFilename;

    @Column(name = "filename")
    private String filename;

    @Column(name = "content_type")
    private String contentType;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "bucket_name")
    private String bucketName;

    @Column(name = "object_key")
    private String objectKey;

    @Column(name = "file_url")
    private String fileUrl;

    @Column(name = "thumbnail_url")
    private String thumbnailUrl;

    @Column(name = "uploader_id")
    private String uploaderId;

    @Column(name = "created_time")
    private LocalDateTime createdTime;

    @Column(name = "is_image")
    private Boolean isImage;

    @PrePersist
    protected void onCreate() {
        createdTime = LocalDateTime.now();
    }

    public static FileInfo create(String fileId, String originalFilename, String filename,
                                 String contentType, Long fileSize, String bucketName,
                                 String objectKey, String fileUrl, String uploaderId) {
        FileInfo fileInfo = new FileInfo();
        fileInfo.setFileId(fileId);
        fileInfo.setOriginalFilename(originalFilename);
        fileInfo.setFilename(filename);
        fileInfo.setContentType(contentType);
        fileInfo.setFileSize(fileSize);
        fileInfo.setBucketName(bucketName);
        fileInfo.setObjectKey(objectKey);
        fileInfo.setFileUrl(fileUrl);
        fileInfo.setUploaderId(uploaderId);
        fileInfo.setIsImage(isImageType(contentType));
        return fileInfo;
    }

    private static boolean isImageType(String contentType) {
        return contentType != null && contentType.startsWith("image/");
    }
}
