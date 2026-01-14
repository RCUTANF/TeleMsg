package com.telemsg.server.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 权限检查注解
 * 用于标记需要特定权限才能访问的方法
 *
 * @author TeleMsg Team
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RequirePermission {

    /**
     * 所需权限代码
     * 例如: "file.send", "user.create"
     */
    String value();

    /**
     * 权限描述（可选，用于错误提示）
     */
    String description() default "";
}

