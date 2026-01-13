package com.telemsg.server.service;

import com.telemsg.server.config.MinIOConfig;
import com.telemsg.server.dto.FileUploadResponse;
import com.telemsg.server.entity.FileInfo;
import com.telemsg.server.repository.FileInfoRepository;
import io.minio.*;
import io.minio.http.Method;
import lombok.extern.slf4j.Slf4j;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

/**
 * MinIO 文件存储服务
 *
 * @author TeleMsg Team
 * @since 1.0.0
 */
@Service
@Slf4j
public class MinIOService {

    @Autowired
    private MinioClient minioClient;

    @Autowired
    private MinIOConfig minioConfig;

    @Autowired
    private FileInfoRepository fileInfoRepository;

    // 支持的图片格式
    private static final List<String> IMAGE_TYPES = Arrays.asList(
        "image/jpeg", "image/jpg", "image/png", "image/gif", "image/bmp", "image/webp"
    );

    // 支持的文档格式
    private static final List<String> DOCUMENT_TYPES = Arrays.asList(
        "application/pdf", "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/plain", "text/csv"
    );

    // 最大文件大小限制 (50MB)
    private static final long MAX_FILE_SIZE = 50 * 1024 * 1024;

    /**
     * 初始化MinIO存储桶
     */
    public void initializeBucket() {
        try {
            // 检查存储桶是否存在
            boolean bucketExists = minioClient.bucketExists(
                BucketExistsArgs.builder()
                    .bucket(minioConfig.getBucketName())
                    .build()
            );

            if (!bucketExists) {
                // 创建存储桶
                minioClient.makeBucket(
                    MakeBucketArgs.builder()
                        .bucket(minioConfig.getBucketName())
                        .region(minioConfig.getRegion())
                        .build()
                );
                log.info("Created MinIO bucket: {}", minioConfig.getBucketName());
            } else {
                log.info("MinIO bucket already exists: {}", minioConfig.getBucketName());
            }
        } catch (Exception e) {
            log.error("Failed to initialize MinIO bucket: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to initialize MinIO bucket", e);
        }
    }

    /**
     * 上传文件
     */
    public FileUploadResponse uploadFile(MultipartFile file, String uploaderId) {
        try {
            // 验证文件
            validateFile(file);

            // 生成文件ID和路径
            String fileId = UUID.randomUUID().toString();
            String originalFilename = file.getOriginalFilename();
            String fileExtension = getFileExtension(originalFilename);
            String filename = generateFilename(fileId, fileExtension);
            String objectKey = generateObjectKey(filename);

            // 上传原文件
            minioClient.putObject(
                PutObjectArgs.builder()
                    .bucket(minioConfig.getBucketName())
                    .object(objectKey)
                    .stream(file.getInputStream(), file.getSize(), -1)
                    .contentType(file.getContentType())
                    .build()
            );

            // 生成文件访问URL
            String fileUrl = getFileUrl(objectKey);

            // 保存文件信息到数据库
            FileInfo fileInfo = FileInfo.create(
                fileId, originalFilename, filename, file.getContentType(),
                file.getSize(), minioConfig.getBucketName(), objectKey,
                fileUrl, uploaderId
            );

            // 如果是图片，生成缩略图
            String thumbnailUrl = null;
            if (isImageFile(file.getContentType())) {
                thumbnailUrl = generateThumbnail(file, fileId);
                fileInfo.setThumbnailUrl(thumbnailUrl);
            }

            fileInfoRepository.save(fileInfo);

            log.info("File uploaded successfully: {} -> {}", originalFilename, objectKey);

            return FileUploadResponse.success(fileId, filename, originalFilename,
                                            fileUrl, file.getSize(), file.getContentType(),
                                            minioConfig.getBucketName(), objectKey)
                                   .withThumbnail(thumbnailUrl);

        } catch (Exception e) {
            log.error("Failed to upload file: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to upload file: " + e.getMessage(), e);
        }
    }

    /**
     * 获取文件下载URL (预签名URL，有效期1小时)
     */
    public String getDownloadUrl(String fileId) {
        try {
            Optional<FileInfo> fileInfoOpt = fileInfoRepository.findByFileId(fileId);
            if (fileInfoOpt.isEmpty()) {
                throw new RuntimeException("File not found: " + fileId);
            }

            FileInfo fileInfo = fileInfoOpt.get();
            return minioClient.getPresignedObjectUrl(
                GetPresignedObjectUrlArgs.builder()
                    .method(Method.GET)
                    .bucket(fileInfo.getBucketName())
                    .object(fileInfo.getObjectKey())
                    .expiry(1, TimeUnit.HOURS)
                    .build()
            );
        } catch (Exception e) {
            log.error("Failed to generate download URL for file: {}", fileId, e);
            throw new RuntimeException("Failed to generate download URL", e);
        }
    }

    /**
     * 获取文件流
     */
    public InputStream getFileStream(String fileId) {
        try {
            Optional<FileInfo> fileInfoOpt = fileInfoRepository.findByFileId(fileId);
            if (fileInfoOpt.isEmpty()) {
                throw new RuntimeException("File not found: " + fileId);
            }

            FileInfo fileInfo = fileInfoOpt.get();
            return minioClient.getObject(
                GetObjectArgs.builder()
                    .bucket(fileInfo.getBucketName())
                    .object(fileInfo.getObjectKey())
                    .build()
            );
        } catch (Exception e) {
            log.error("Failed to get file stream for file: {}", fileId, e);
            throw new RuntimeException("Failed to get file stream", e);
        }
    }

    /**
     * 删除文件
     */
    public boolean deleteFile(String fileId) {
        try {
            Optional<FileInfo> fileInfoOpt = fileInfoRepository.findByFileId(fileId);
            if (fileInfoOpt.isEmpty()) {
                return false;
            }

            FileInfo fileInfo = fileInfoOpt.get();

            // 从MinIO删除文件
            minioClient.removeObject(
                RemoveObjectArgs.builder()
                    .bucket(fileInfo.getBucketName())
                    .object(fileInfo.getObjectKey())
                    .build()
            );

            // 删除缩略图（如果存在）
            if (fileInfo.getThumbnailUrl() != null) {
                String thumbnailKey = extractObjectKeyFromUrl(fileInfo.getThumbnailUrl());
                minioClient.removeObject(
                    RemoveObjectArgs.builder()
                        .bucket(fileInfo.getBucketName())
                        .object(thumbnailKey)
                        .build()
                );
            }

            // 从数据库删除记录
            fileInfoRepository.delete(fileInfo);

            log.info("File deleted successfully: {}", fileId);
            return true;

        } catch (Exception e) {
            log.error("Failed to delete file: {}", fileId, e);
            return false;
        }
    }

    /**
     * 获取文件信息
     */
    public Optional<FileInfo> getFileInfo(String fileId) {
        return fileInfoRepository.findByFileId(fileId);
    }

    // ============ 私有辅助方法 ============

    /**
     * 验证文件
     */
    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be null or empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds maximum limit (50MB)");
        }

        String contentType = file.getContentType();
        if (!isAllowedFileType(contentType)) {
            throw new IllegalArgumentException("File type not supported: " + contentType);
        }
    }

    /**
     * 检查是否为允许的文件类型
     */
    private boolean isAllowedFileType(String contentType) {
        return IMAGE_TYPES.contains(contentType) || DOCUMENT_TYPES.contains(contentType);
    }

    /**
     * 检查是否为图片文件
     */
    private boolean isImageFile(String contentType) {
        return IMAGE_TYPES.contains(contentType);
    }

    /**
     * 获取文件扩展名
     */
    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf("."));
    }

    /**
     * 生成文件名
     */
    private String generateFilename(String fileId, String extension) {
        return fileId + extension;
    }

    /**
     * 生成对象键（包含日期路径）
     */
    private String generateObjectKey(String filename) {
        String datePath = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
        return datePath + "/" + filename;
    }

    /**
     * 生成文件访问URL
     */
    private String getFileUrl(String objectKey) {
        return minioConfig.getUrl() + "/" + minioConfig.getBucketName() + "/" + objectKey;
    }

    /**
     * 生成缩略图
     */
    private String generateThumbnail(MultipartFile file, String fileId) {
        try {
            BufferedImage originalImage = ImageIO.read(file.getInputStream());
            if (originalImage == null) {
                return null;
            }

            // 生成 200x200 缩略图
            ByteArrayOutputStream thumbnailStream = new ByteArrayOutputStream();
            Thumbnails.of(originalImage)
                    .size(200, 200)
                    .keepAspectRatio(true)
                    .toOutputStream(thumbnailStream);

            // 上传缩略图
            String thumbnailKey = generateObjectKey("thumb_" + fileId + ".jpg");
            byte[] thumbnailBytes = thumbnailStream.toByteArray();

            minioClient.putObject(
                PutObjectArgs.builder()
                    .bucket(minioConfig.getBucketName())
                    .object(thumbnailKey)
                    .stream(new ByteArrayInputStream(thumbnailBytes), thumbnailBytes.length, -1)
                    .contentType("image/jpeg")
                    .build()
            );

            return getFileUrl(thumbnailKey);

        } catch (Exception e) {
            log.warn("Failed to generate thumbnail for file: {}, error: {}", fileId, e.getMessage());
            return null;
        }
    }

    /**
     * 从URL提取对象键
     */
    private String extractObjectKeyFromUrl(String url) {
        String bucketPath = "/" + minioConfig.getBucketName() + "/";
        int index = url.indexOf(bucketPath);
        if (index != -1) {
            return url.substring(index + bucketPath.length());
        }
        return null;
    }
}
