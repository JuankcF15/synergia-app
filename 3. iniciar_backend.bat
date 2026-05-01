@echo off
echo =============================
echo Iniciando backend Django...
echo =============================

cd backend
call venv\Scripts\activate

python manage.py makemigrations
python manage.py migrate
python manage.py load_questions
python manage.py runserver

pause