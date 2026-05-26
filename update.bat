@echo off
setlocal
echo ===================================================
echo   Atualizacao do Sistema (PRODUCAO) - Prefeitura Hub
echo ===================================================

echo.
echo [1/6] Parando sistema para manutencao...
:: Tentamos parar o PM2. O || echo ignora erro se o processo nao existir.
call pm2 stop "Gestao-Integrada" || echo [INFO] Processo nao estava rodando.
echo Aguardando processos finalizarem...
timeout /t 2 /nobreak > nul

echo.
echo [2/6] Baixando novidades do GitHub (Branch: antigravity)...
git pull origin antigravity
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Falha ao baixar atualizacoes do Git.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [3/6] Instalando dependencias do Backend...
cd backend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Falha ao instalar dependencias do backend.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [4/6] Atualizando Banco de Dados e Prisma...
call npx prisma generate
call npx prisma db push
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Falha ao atualizar o banco de dados.
    pause
    exit /b %ERRORLEVEL%
)
cd ..

echo.
echo [5/6] Instalando e Compilando Frontend...
cd frontend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Falha ao instalar dependencias do frontend.
    pause
    exit /b %ERRORLEVEL%
)
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Falha ao compilar o frontend.
    pause
    exit /b %ERRORLEVEL%
)
cd ..

echo.
echo [6/6] Reiniciando o sistema no PM2...
:: Inicia ou Reinicia o processo via Ecosystem para auto-reload
call pm2 start ecosystem.config.js
call pm2 save

echo.
echo ===================================================
echo   ATUALIZACAO CONCLUIDA COM SUCESSO!
echo   O sistema ja deve estar acessivel em producao.
echo ===================================================
pause
endlocal
