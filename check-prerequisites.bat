@echo off
setlocal enabledelayedexpansion

:: BDO Combat Logger - Prerequisites Checker
:: Run this first to verify everything is set up correctly

title Prerequisites Checker

color 0E
echo.
echo ============================================================
echo    BDO Combat Logger - Prerequisites Check
echo ============================================================
echo.
echo This script checks if all required software is installed.
echo.

set "ALL_GOOD=1"

:: Check Python
echo [1/4] Checking Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo [X] Python NOT FOUND
    echo     Download from: https://www.python.org/downloads/
    echo     IMPORTANT: Check "Add Python to PATH" during install
    set "ALL_GOOD=0"
) else (
    for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYTHON_VER=%%i
    echo [OK] Python !PYTHON_VER! found
)

echo.

:: Check Node.js
echo [2/4] Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [X] Node.js NOT FOUND
    echo     Download from: https://nodejs.org/
    set "ALL_GOOD=0"
) else (
    for /f "tokens=1" %%i in ('node --version') do set NODE_VER=%%i
    echo [OK] Node.js !NODE_VER! found
)

echo.

:: Check Inno Setup
echo [3/4] Checking Inno Setup...
set "INNO_FOUND=0"
if exist "C:\Program Files (x86)\Inno Setup 6\ISCC.exe" (
    set "INNO_FOUND=1"
    set "INNO_PATH=C:\Program Files (x86)\Inno Setup 6\ISCC.exe"
) else if exist "C:\Program Files\Inno Setup 6\ISCC.exe" (
    set "INNO_FOUND=1"
    set "INNO_PATH=C:\Program Files\Inno Setup 6\ISCC.exe"
) else if exist "C:\Program Files (x86)\Inno Setup 5\ISCC.exe" (
    set "INNO_FOUND=1"
    set "INNO_PATH=C:\Program Files (x86)\Inno Setup 5\ISCC.exe"
)

if "!INNO_FOUND!"=="1" (
    echo [OK] Inno Setup found
    echo     Location: !INNO_PATH!
) else (
    echo [X] Inno Setup NOT FOUND
    echo     Download from: https://jrsoftware.org/isdl.php
    echo     Install Inno Setup 6
    set "ALL_GOOD=0"
)

echo.

:: Check Npcap
echo [4/4] Checking Npcap installer...
if exist "dependencies\npcap-1.84.exe" (
    echo [OK] Npcap installer found
    for %%A in ("dependencies\npcap-1.84.exe") do (
        echo     Size: %%~zA bytes
    )
) else (
    echo [!] Npcap installer NOT FOUND (optional)
    echo     The installer will download it automatically
    echo     For offline installs, run: download-npcap.bat
    echo.
    echo     This is OPTIONAL - installer will still work
)

echo.
echo ============================================================
echo    Check Complete
echo ============================================================
echo.

if "!ALL_GOOD!"=="1" (
    echo [SUCCESS] All required prerequisites are installed!
    echo.
    echo You're ready to build the installer.
    echo Run: build-complete.bat
    echo.
) else (
    echo [WARNING] Some prerequisites are missing!
    echo.
    echo Please install the missing software and run this check again.
    echo.
    echo Quick Links:
    echo   Python:     https://www.python.org/downloads/
    echo   Node.js:    https://nodejs.org/
    echo   Inno Setup: https://jrsoftware.org/isdl.php
    echo.
)

:: Additional helpful info
echo ============================================================
echo    Additional Information
echo ============================================================
echo.

:: Check if running as admin
net session >nul 2>&1
if errorlevel 1 (
    echo [!] NOT running as Administrator
    echo     Some operations may fail without admin rights
    echo     Right-click and "Run as Administrator" is recommended
) else (
    echo [OK] Running with Administrator privileges
)

echo.

:: Check if git is available (optional but nice to have)
git --version >nul 2>&1
if errorlevel 1 (
    echo [i] Git not found (optional - only needed for development)
) else (
    for /f "tokens=3" %%i in ('git --version') do set GIT_VER=%%i
    echo [OK] Git !GIT_VER! found (optional)
)

echo.
echo Press any key to exit...
pause >nul