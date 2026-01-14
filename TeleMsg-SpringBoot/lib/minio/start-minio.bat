@echo off
set MINIO_ROOT_USER=admin
set MINIO_ROOT_PASSWORD=password123
echo Starting MinIO...
cd /d "D:\Java_workplace\TeleMsg\TeleMsg-SpringBoot\lib\minio"
"D:\Java_workplace\TeleMsg\TeleMsg-SpringBoot\lib\minio\minio.exe" server "D:\Java_workplace\TeleMsg\TeleMsg-SpringBoot\lib\minio\data" --console-address ":9001"
pause
