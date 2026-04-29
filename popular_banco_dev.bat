@echo off

:: ==================================================
:: Popular Banco de Dados - Ambiente de Desenvolvimento
:: ==================================================

echo.
echo Este script popula o banco de dados de teste.
echo.

:: Navega até o backend
cd backend

:: Executa as seeds do Prisma
call npx.cmd prisma db seed
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Falha ao popular o banco de dados de teste.
    pause
    exit /b %ERRORLEVEL%
)

cd ..

echo.
echo ==================================================
echo   DADOS DE TESTE INSERIDOS COM SUCESSO!
echo ==================================================

pause
