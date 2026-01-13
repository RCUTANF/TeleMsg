package com.telemsg.server.controller;

import com.telemsg.server.dto.FileUploadResponse;
import com.telemsg.server.entity.FileInfo;
import com.telemsg.server.service.JwtService;
import com.telemsg.server.service.MinIOService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.Map;
import java.util.Optional;

/**
 * 文件上传相关REST API (使用MinIO存储)
 *
 * @author TeleMsg Team
 * @since 1.0.0
 */
@Slf4j
@RestController
@RequestMapping("/files")
@RequiredArgsConstructor
public class FileController {

    private final JwtService jwtService;
    private final MinIOService minIOService;

    /**
     * 文件上传
     */
    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestHeader("Authorization") String authHeader,
                                      @RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "文件不能为空"));
            }

            String userId = extractUserIdFromToken(authHeader);

            // 使用MinIO服务上传文件
            FileUploadResponse response = minIOService.uploadFile(file, userId);

            log.info("File uploaded successfully by user {}: {}", userId, response.getOriginalFileName());

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "文件上传成功",
                "data", response
            ));

        } catch (IllegalArgumentException e) {
            log.warn("File upload validation failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));

        } catch (Exception e) {
            log.error("File upload failed: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "文件上传失败: " + e.getMessage()));
        }
    }

    /**
     * 获取文件下载链接
     */
    @GetMapping("/{fileId}/url")
    public ResponseEntity<?> getFileDownloadUrl(@RequestHeader("Authorization") String authHeader,
                                               @PathVariable String fileId) {
        try {
            extractUserIdFromToken(authHeader); // 验证token

            String downloadUrl = minIOService.getDownloadUrl(fileId);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of("downloadUrl", downloadUrl)
            ));

        } catch (Exception e) {
            log.error("Failed to get download URL for file {}: {}", fileId, e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "获取文件下载链接失败"));
        }
    }

    /**
     * 直接下载文件
     */
    @GetMapping("/{fileId}")
    public ResponseEntity<?> downloadFile(@RequestHeader(value = "Authorization", required = false) String authHeader,
                                         @PathVariable String fileId) {
        try {
            // 如果有认证头，验证token
            if (authHeader != null && !authHeader.isEmpty()) {
                extractUserIdFromToken(authHeader);
            }

            Optional<FileInfo> fileInfoOpt = minIOService.getFileInfo(fileId);
            if (fileInfoOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            FileInfo fileInfo = fileInfoOpt.get();
            InputStream fileStream = minIOService.getFileStream(fileId);

            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION,
                       "attachment; filename=\"" + fileInfo.getOriginalFilename() + "\"");
            headers.add(HttpHeaders.CONTENT_TYPE, fileInfo.getContentType());
            headers.add(HttpHeaders.CONTENT_LENGTH, String.valueOf(fileInfo.getFileSize()));

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(new InputStreamResource(fileStream));

        } catch (Exception e) {
            log.error("Failed to download file {}: {}", fileId, e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "文件下载失败"));
        }
    }

    /**
     * 获取文件信息
     */
    @GetMapping("/{fileId}/info")
    public ResponseEntity<?> getFileInfo(@RequestHeader("Authorization") String authHeader,
                                        @PathVariable String fileId) {
        try {
            extractUserIdFromToken(authHeader); // 验证token

            Optional<FileInfo> fileInfoOpt = minIOService.getFileInfo(fileId);
            if (fileInfoOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "文件不存在"));
            }

            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", fileInfoOpt.get()
            ));

        } catch (Exception e) {
            log.error("Failed to get file info for {}: {}", fileId, e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "获取文件信息失败"));
        }
    }

    /**
     * 删除文件
     */
    @DeleteMapping("/{fileId}")
    public ResponseEntity<?> deleteFile(@RequestHeader("Authorization") String authHeader,
                                       @PathVariable String fileId) {
        try {
            String userId = extractUserIdFromToken(authHeader);

            // 检查文件是否存在以及是否有删除权限
            Optional<FileInfo> fileInfoOpt = minIOService.getFileInfo(fileId);
            if (fileInfoOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "文件不存在"));
            }

            FileInfo fileInfo = fileInfoOpt.get();
            // 只允许文件上传者删除文件 (后续可以扩展管理员权限)
            if (!userId.equals(fileInfo.getUploaderId())) {
                return ResponseEntity.status(403).body(Map.of("error", "无权限删除此文件"));
            }

            boolean deleted = minIOService.deleteFile(fileId);
            if (deleted) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "文件删除成功"
                ));
            } else {
                return ResponseEntity.internalServerError()
                        .body(Map.of("error", "文件删除失败"));
            }

        } catch (Exception e) {
            log.error("Failed to delete file {}: {}", fileId, e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "文件删除失败"));
        }
    }

    /**
     * 从JWT token中提取用户ID
     */
    private String extractUserIdFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("无效的认证信息");
        }

        String token = authHeader.substring(7);
        return jwtService.extractUserId(token);
    }
}

