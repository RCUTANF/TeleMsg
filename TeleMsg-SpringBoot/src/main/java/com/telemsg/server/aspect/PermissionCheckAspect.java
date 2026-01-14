package com.telemsg.server.aspect;

import com.telemsg.server.annotation.RequirePermission;
import com.telemsg.server.service.JwtService;
import com.telemsg.server.service.RolePermissionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

/**
 * 权限检查切面
 * 拦截标注了 @RequirePermission 的方法，进行权限验证
 *
 * @author TeleMsg Team
 */
@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class PermissionCheckAspect {

    private final JwtService jwtService;
    private final RolePermissionService rolePermissionService;

    /**
     * 环绕通知：在方法执行前检查权限
     */
    @Around("@annotation(com.telemsg.server.annotation.RequirePermission)")
    public Object checkPermission(ProceedingJoinPoint joinPoint) throws Throwable {
        // 获取方法签名
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        RequirePermission annotation = signature.getMethod().getAnnotation(RequirePermission.class);

        if (annotation == null) {
            // 没有注解，直接放行
            return joinPoint.proceed();
        }

        String requiredPermission = annotation.value();
        String description = annotation.description();

        try {
            // 从请求中获取 Authorization header
            HttpServletRequest request = getCurrentRequest();
            if (request == null) {
                log.warn("无法获取当前请求，权限检查失败");
                return createForbiddenResponse("无法验证权限");
            }

            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                log.warn("缺少或无效的 Authorization header");
                return createForbiddenResponse("未提供有效的认证信息");
            }

            // 从 token 中提取用户ID
            String token = authHeader.substring(7);
            String userId = jwtService.extractUserId(token);

            if (userId == null || userId.isEmpty()) {
                log.warn("无法从 token 中提取用户ID");
                return createForbiddenResponse("无效的认证token");
            }

            // 检查用户是否有该权限
            boolean hasPermission = rolePermissionService.checkPermission(userId, requiredPermission);

            if (!hasPermission) {
                String errorMsg = description.isEmpty()
                    ? String.format("您没有执行此操作的权限 (需要权限: %s)", requiredPermission)
                    : String.format("您没有 %s 的权限", description);

                log.warn("用户 {} 尝试访问需要权限 {} 的操作，但权限不足", userId, requiredPermission);
                return createForbiddenResponse(errorMsg);
            }

            // 权限验证通过，继续执行方法
            log.debug("用户 {} 权限验证通过: {}", userId, requiredPermission);
            return joinPoint.proceed();

        } catch (Exception e) {
            log.error("权限检查过程中发生错误: {}", e.getMessage(), e);
            return createForbiddenResponse("权限验证失败");
        }
    }

    /**
     * 获取当前请求
     */
    private HttpServletRequest getCurrentRequest() {
        ServletRequestAttributes attributes =
            (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        return attributes != null ? attributes.getRequest() : null;
    }

    /**
     * 创建403禁止访问的响应
     */
    private ResponseEntity<?> createForbiddenResponse(String message) {
        return ResponseEntity.status(403).body(Map.of(
            "error", message,
            "code", 403,
            "message", "Forbidden"
        ));
    }
}

