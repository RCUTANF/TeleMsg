package com.telemsg.server.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfigurationSource;

/**
 * Spring Security 配置
 *
 * @author TeleMsg Team
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private CorsConfigurationSource corsConfigurationSource;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource)) // 启用CORS
            .csrf(csrf -> csrf.disable()) // 禁用CSRF，因为是API服务
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/auth/**").permitAll() // 允许认证相关端点
                .requestMatchers("/users/register", "/users/login").permitAll() // 允许注册和登录
                .requestMatchers("/actuator/**").permitAll() // 允许监控端点
                .requestMatchers("/h2-console/**").permitAll() // 允许H2控制台（开发环境）
                .requestMatchers("/ws/**").permitAll() // 允许WebSocket连接
                .requestMatchers("/files/**").permitAll() // 允许文件访问
                .anyRequest().permitAll() // 临时允许所有请求，实际项目中应该配置具体的权限
            )
            .headers(headers -> headers.frameOptions(frameOptions -> frameOptions.disable())); // 禁用frame选项，允许H2控制台

        return http.build();
    }
}
