@echo off
echo =============================
echo Instalando dependencias del frontend (React)...
echo =============================

cd frontend

if exist package.json (
    npm install
    echo =============================
    echo Dependencias instaladas correctamente.
    echo =============================
) else (
    echo Error: No se encontró package.json.
)

pause
