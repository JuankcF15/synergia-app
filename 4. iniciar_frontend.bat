@echo off
echo =============================
echo Iniciando frontend React...
echo =============================

cd frontend

if exist node_modules (
    npm start
) else (
    echo Error: Las dependencias no están instaladas.
    echo Ejecuta primero: 2. instalar_npm.bat
)

pause
