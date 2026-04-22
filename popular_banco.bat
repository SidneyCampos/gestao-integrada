@echo off
echo ===================================================
echo   Popular Banco de Dados - Prefeitura Hub
echo ===================================================
echo.
echo Este script ira criar os setores e usuarios iniciais.
echo.
cd backend
call npx prisma db seed
cd ..
echo.
echo ===================================================
echo   DADOS INSERIDOS COM SUCESSO!
echo ===================================================
pause
