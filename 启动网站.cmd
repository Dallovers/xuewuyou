@echo off
chcp 65001 >nul
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Start-Website.ps1"
pause
