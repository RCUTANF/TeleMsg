FROM openjdk:21-jdk-slim

LABEL maintainer="TeleMsg Team"
LABEL description="Production-ready IM server with group chat and message persistence"

# 设置工作目录
WORKDIR /app

# 创建应用用户
RUN groupadd -r telemsg && useradd -r -g telemsg telemsg

# 复制Gradle构建文件
COPY build.gradle settings.gradle gradlew ./
COPY gradle ./gradle

# 复制源代码
COPY src ./src

# 构建应用
RUN chmod +x gradlew && \
    ./gradlew bootJar --no-daemon && \
    cp build/libs/telemsg-server.jar app.jar && \
    rm -rf build gradle src gradlew build.gradle settings.gradle

# 修改文件权限
RUN chown -R telemsg:telemsg /app

# 切换到应用用户
USER telemsg

# 暴露端口
EXPOSE 8080 8901 3000 7901/udp

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/api/actuator/health || exit 1

# 启动应用
ENTRYPOINT ["java", "-jar", "app.jar"]

# 默认参数
CMD ["--spring.profiles.active=prod"]
