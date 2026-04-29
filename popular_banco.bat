@echo off
echo ===================================================
echo   Popular Banco de Dados - Prefeitura Hub
echo ===================================================
echo.
echo Este script ira criar os setores e usuarios iniciais.
echo.
echo.
echo Parando sistema temporariamente...
call pm2 stop Gestao-Integrada

cd backend
echo.
echo Rodando sementes (Seeds)...
call npx.cmd prisma db seed
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Falha ao popular o banco de dados.
    pause
    exit /b %ERRORLEVEL%
)
cd ..
call pm2 start backend/src/server.js --name "Gestao-Integrada"
echo.
echo Reiniciando sistema...

echo.
echo ===================================================
echo   DADOS INSERIDOS COM SUCESSO!
echo ===================================================
pause
