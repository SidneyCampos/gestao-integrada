@echo off
echo ===================================================
echo   Atualizacao do Sistema (DEV) - Prefeitura Hub
echo ===================================================

echo.
echo [!] IMPORTANTE: Feche todos os terminais que estao 
echo     rodando "npm run dev" antes de continuar.
echo.
pause

echo.
echo [1/4] Baixando novidades do GitHub (Branch: antigravity)...
git pull origin antigravity

echo.
echo [2/4] Atualizando Backend (npm install + Prisma)...
cd backend
call npm install
echo.
echo Atualizando esquema do banco e gerando cliente Prisma...
call npx prisma generate
call npx prisma db push
cd ..

echo.
echo [3/4] Atualizando Frontend (npm install)...
cd frontend
call npm install
cd ..

echo.
echo [4/4] Opcional: Popular banco de dados...
set /p runseed="Deseja rodar as seeds (dados iniciais/teste)? (s/n): "
if /i "%runseed%"=="s" (
    cd backend
    echo Populando banco...
    call npx prisma db seed
    cd ..
)

echo.
echo ===================================================
echo   ATUALIZACAO DE DESENVOLVIMENTO CONCLUIDA!
echo   Voce ja pode iniciar o backend e frontend novamente.
echo ===================================================
pause
