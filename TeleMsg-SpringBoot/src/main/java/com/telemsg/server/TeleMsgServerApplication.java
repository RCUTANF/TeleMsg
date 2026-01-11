package com.telemsg.server;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.data.mongo.MongoDataAutoConfiguration;
import org.springframework.boot.autoconfigure.mongo.MongoAutoConfiguration;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * TeleMsg SpringBoot 服务端启动类
 *
 * @author TeleMsg Team
 * @since 2024-01-10
 */
@SpringBootApplication(exclude = {
    MongoAutoConfiguration.class,
    MongoDataAutoConfiguration.class
})
@EnableJpaRepositories(basePackages = "com.telemsg.server.repository")
@EnableAsync
@EnableScheduling
public class TeleMsgServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(TeleMsgServerApplication.class, args);
        System.out.println("""
            
            ████████╗███████╗██╗     ███████╗███╗   ███╗███████╗ ██████╗ 
            ╚══██╔══╝██╔════╝██║     ██╔════╝████╗ ████║██╔════╝██╔════╝ 
               ██║   █████╗  ██║     █████╗  ██╔████╔██║███████╗██║  ███╗
               ██║   ██╔══╝  ██║     ██╔══╝  ██║╚██╔╝██║╚════██║██║   ██║
               ██║   ███████╗███████╗███████╗██║ ╚═╝ ██║███████║╚██████╔╝
               ╚═╝   ╚══════╝╚══════╝╚══════╝╚═╝     ╚═╝╚═════���╝ ╚═════╝ 
            
            TeleMsg Server Started Successfully!
            Production-ready IM server with group chat and message persistence.
            """);
    }
}
