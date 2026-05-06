@echo off
echo ===================================================
echo   Atualizacao do Sistema - Prefeitura Hub
echo ===================================================

echo.
echo [1/6] Parando sistema para manutencao...
:: Paramos o PM2 para liberar arquivos e o banco de dados
call pm2 stop "Gestao-Integrada"
echo Aguardando processos finalizarem...
timeout /t 3 /nobreak > nul

echo.
echo [2/6] Baixando novidades do GitHub...
git pull origin antigravity

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
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Falha ao compilar o frontend.
    pause
    exit /b %ERRORLEVEL%
)
cd ..

echo.
echo [6/6] Reiniciando o sistema no PM2...
:: Tenta iniciar. Se ja existir, ele apenas inicia; se nao, cria o processo.
call pm2 start backend/src/server.js --name "Gestao-Integrada"
call pm2 save

echo.
echo ===================================================
echo   ATUALIZACAO CONCLUIDA COM SUCESSO!
echo   O sistema ja deve estar acessivel.
echo ===================================================
pause
