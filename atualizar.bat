@echo off
echo ===================================================
echo   Atualizacao do Sistema - Prefeitura Hub
echo ===================================================

echo.
echo [1/5] Baixando novidades do GitHub...
git pull origin main

echo.
echo [2/5] Instalando dependencias do Backend...
cd backend
call npm install

echo.
echo [3/5] Atualizando Banco de Dados...
call npx prisma generate
call npx prisma db push
cd ..

echo.
echo [4/5] Instalando e Compilando Frontend...
cd frontend
call npm install
call npm run build
cd ..

echo.
echo [5/5] Reiniciando o sistema no PM2...
call pm2 restart Gestao-Integrada

echo.
echo ===================================================
echo   ATUALIZACAO CONCLUIDA COM SUCESSO!
echo ===================================================
pause
