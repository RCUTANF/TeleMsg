package com.telemsg.server.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 文件上传响应 DTO
 *
 * @author TeleMsg Team
 * @since 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FileUploadResponse {

    private String fileId;
    private String fileName;
    private String originalFileName;
    private String fileUrl;
    private String thumbnailUrl;
    private Long fileSize;
    private String contentType;
    private String bucketName;
    private String objectKey;
    private Long uploadTime;

    public static FileUploadResponse success(String fileId, String fileName,
                                           String originalFileName, String fileUrl,
                                           Long fileSize, String contentType,
                                           String bucketName, String objectKey) {
        return new FileUploadResponse(fileId, fileName, originalFileName,
                                    fileUrl, null, fileSize, contentType,
                                    bucketName, objectKey, System.currentTimeMillis());
    }

    public FileUploadResponse withThumbnail(String thumbnailUrl) {
        this.thumbnailUrl = thumbnailUrl;
        return this;
    }
}
