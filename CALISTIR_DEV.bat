@echo off
chcp 65001 >nul
title YKS Kocluk Platformu - Asama 29
cd /d "%~dp0"
echo.
echo YKS Kocluk Platformu - Asama 29 Panel Ayristirma
echo.
echo Paketler kontrol ediliyor...
if not exist node_modules (
  echo node_modules bulunamadi. npm install calistiriliyor...
  npm install
) else (
  echo node_modules mevcut.
)
echo.
echo Gelistirme sunucusu baslatiliyor...
echo Tarayici adresi: http://localhost:5173
echo.
npm run dev
pause
