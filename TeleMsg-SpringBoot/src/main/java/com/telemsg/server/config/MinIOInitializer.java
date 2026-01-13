package com.telemsg.server.config;

import com.telemsg.server.service.MinIOService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/**
 * MinIO初始化配置
 * 在应用启动时初始化MinIO存储桶
 *
 * @author TeleMsg Team
 * @since 1.0.0
 */
@Component
@Order(1) // 确保在其他组件之前初始化
@Slf4j
public class MinIOInitializer implements CommandLineRunner {

    @Autowired
    private MinIOService minIOService;

    @Override
    public void run(String... args) throws Exception {
        try {
            log.info("正在初始化MinIO存储桶...");
            minIOService.initializeBucket();
            log.info("MinIO存储桶初始化成功！");
        } catch (Exception e) {
            log.error("MinIO初始化失败: {}", e.getMessage(), e);
            // 不抛出异常，允许应用继续启动，但会记录错误
            log.warn("MinIO服务不可用，文件上传功能可能无法正常工作");
        }
    }
}
