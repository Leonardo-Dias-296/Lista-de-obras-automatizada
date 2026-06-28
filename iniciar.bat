@echo off
title SSM Solar - Iniciando servidor...
color 0A
echo.
echo  ============================================
echo   SSM Solar - Sistema de Separacao de Materiais
echo  ============================================
echo.
echo  Instalando dependencias (se necessario)...
pip install flask openpyxl -q
echo.
echo  Iniciando servidor em http://localhost:5000
echo  Pressione CTRL+C para parar.
echo.
start "" http://localhost:5000
python server.py
pause
