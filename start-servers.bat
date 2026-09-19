@echo off
echo Starting DOH JAWDA KPI Dashboard...

echo Starting Express API on port 3000...
start "Express API" /B node server.js

timeout /t 3 /nobreak >nul

echo Starting Vite on port 5173...
start "Vite Dev Server" /B npx vite --host 0.0.0.0 --port 5173

timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo Servers started!
echo Express API:  http://localhost:3000
echo Vite Frontend: http://localhost:5173
echo ========================================
echo.
echo Press any key to stop servers...
pause

taskkill /F /IM node.exe >nul 2>&1
echo Servers stopped.