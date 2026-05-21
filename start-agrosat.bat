@echo off
title AgroSat UZ
echo AgroSat UZ ishga tushirilmoqda...

start "AgroSat Backend" cmd /k "cd /d C:\Users\Xayrullo\Projects\agrosat-uz\backend && .venv\Scripts\activate && set SECRET_KEY=DRMTdcR-e2zEKtBHSdT8mWFHD7APDQ0mNKJbl2mHa3O6sLkBsbVZm-xbGhZZ_CHx && uvicorn app.main:app --host 127.0.0.1 --port 8000"

timeout /t 3 /nobreak >nul

start "AgroSat Frontend" cmd /k "cd /d C:\Users\Xayrullo\Projects\agrosat-uz\frontend && npm run dev"

timeout /t 5 /nobreak >nul
start http://127.0.0.1:5173/

echo Brauzer ochildi: http://127.0.0.1:5173
pause

