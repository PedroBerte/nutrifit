@echo off
REM NutriFit - Node backend setup script
REM Run this once from the project root to scaffold all module files

echo === NutriFit Node backend setup ===
echo.

cd /d "%~dp0backend-node"

echo Step 1: Scaffold all module files...
node init-structure.js
if %ERRORLEVEL% NEQ 0 (echo FAILED: init-structure.js && exit /b 1)

echo.
echo Step 2: Add storage module, unit tests, patches...
node setup-add-modules.js
if %ERRORLEVEL% NEQ 0 (echo FAILED: setup-add-modules.js && exit /b 1)

echo.
echo Step 3: Install npm dependencies...
npm install
if %ERRORLEVEL% NEQ 0 (echo FAILED: npm install && exit /b 1)

echo.
echo Step 4: Generate Prisma client...
npx prisma generate
if %ERRORLEVEL% NEQ 0 (echo FAILED: prisma generate && exit /b 1)

echo.
echo === Setup complete! ===
echo.
echo Next steps:
echo   1. Start services: docker-compose up db redis minio -d
echo   2. cd backend-node
echo   3. npx prisma migrate dev --name init
echo   4. npx prisma db seed
echo   5. npm run test:unit
echo   6. npm run dev
echo.
pause
