#!/bin/bash

# TeleMsg SpringBoot Server 启动脚本

echo "=========================================="
echo "    TeleMsg SpringBoot Server 启动中..."
echo "=========================================="

# 检查Java环境
if ! command -v java &> /dev/null; then
    echo "错误: 未找到Java运行环境，请先安装Java 21+"
    exit 1
fi

# 检查Java版本
JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2 | cut -d'.' -f1)
if [ "$JAVA_VERSION" -lt 21 ]; then
    echo "错误: 需要Java 21或更高版本，当前版本: $JAVA_VERSION"
    exit 1
fi

# 设置环境变量
export JAVA_OPTS="-Xmx2048m -Xms512m -XX:+UseG1GC"
export SPRING_PROFILES_ACTIVE=${SPRING_PROFILES_ACTIVE:-dev}

# 输出配置信息
echo "Java版本: $(java -version 2>&1 | head -n 1)"
echo "运行环境: $SPRING_PROFILES_ACTIVE"
echo "JVM参数: $JAVA_OPTS"
echo "=========================================="

# 构建项目
echo "正在构建项目..."
if ! ./gradlew build -q; then
    echo "错误: 项目构建失败"
    exit 1
fi

# 启动服务
echo "正在启动TeleMsg服务..."
exec java $JAVA_OPTS -jar build/libs/telemsg-server.jar \
    --spring.profiles.active=$SPRING_PROFILES_ACTIVE \
    "$@"
