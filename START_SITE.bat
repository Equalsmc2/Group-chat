@echo off
setlocal
cd /d "%~dp0"
echo Soul Seekers - The Wounded Eternity
where py >nul 2>nul
if %errorlevel%==0 (
    start "Soul Seekers Server" cmd /k "py -3 -m http.server 8000 --bind 127.0.0.1"
    goto :open
)
where python >nul 2>nul
if %errorlevel%==0 (
    start "Soul Seekers Server" cmd /k "python -m http.server 8000 --bind 127.0.0.1"
    goto :open
)
echo.
echo Python 3 is required for the double-click launcher.
echo Install Python from python.org, then run this file again.
pause
exit /b 1
:open
timeout /t 2 /nobreak >nul
start "" "http://localhost:8000"
