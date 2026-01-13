@echo off
set MINIO_ROOT_USER=admin
set MINIO_ROOT_PASSWORD=password123
echo Starting MinIO...
cd /d "E:\project\TeleMsg\TeleMsg-SpringBoot\lib\minio"
"E:\project\TeleMsg\TeleMsg-SpringBoot\lib\minio\minio.exe" server "E:\project\TeleMsg\TeleMsg-SpringBoot\lib\minio\data" --console-address ":9001"
pause
