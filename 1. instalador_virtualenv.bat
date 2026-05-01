@echo off
echo =============================
echo Creando entorno virtual...
echo =============================

cd backend
python -m venv venv

if exist venv (
    echo Entorno virtual creado con éxito.
) else (
    echo Error: No se pudo crear el entorno virtual.
    pause
    exit /b
)

echo =============================
echo Activando entorno virtual...
echo =============================

call venv\Scripts\activate

echo =============================
echo Instalando dependencias...
echo =============================

pip install --upgrade pip
pip install -r requirements.txt

echo =============================
echo Listo. Entorno backend preparado.
echo =============================

pause
