@echo off
setlocal enabledelayedexpansion

:: ============================================================
::  BDO Combat Logger - Setup Wizard (Final Version)
:: ============================================================

title BDO Combat Logger - Setup Wizard
color 0B

set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"
set "DEBUG_LOG=%SCRIPT_DIR%\setup-debug.log"
echo. > "%DEBUG_LOG%"

cls

:menu
echo.
echo ============================================================
echo    BDO Combat Logger - Setup Wizard
echo ============================================================
echo.
echo What would you like to do?
echo.
echo    1. Check Prerequisites (Recommended First Step)
echo    2. Download Npcap Installer
echo    3. Build Application
echo    4. Create Installer (App Already Built)
echo    5. Clean Build (Remove all build files)
echo    6. Exit
echo.
echo ============================================================
echo.

set /p "CHOICE=Enter your choice (1-6): "

if "%CHOICE%"=="1" goto check_prereq
if "%CHOICE%"=="2" goto download_npcap
if "%CHOICE%"=="3" goto build_app_only
if "%CHOICE%"=="4" goto build_installer_only
if "%CHOICE%"=="5" goto clean_build
if "%CHOICE%"=="6" goto exit_script

echo Invalid choice. Please try again.
timeout /t 2 >nul
cls
goto menu

:: ------------------------------------------------------------
:check_prereq
cls
echo.
echo Running prerequisites check...
echo.
call "%SCRIPT_DIR%check-prerequisites.bat"
echo.
pause
cls
goto menu

:: ------------------------------------------------------------
:download_npcap
cls
echo.
echo Downloading Npcap installer...
echo.
call "%SCRIPT_DIR%download-npcap.bat"
echo.
pause
cls
goto menu

:: ------------------------------------------------------------
:build_app_only
cls
echo.
echo ============================================================
echo    Building Application Only
echo ============================================================
echo.

cd /d "%SCRIPT_DIR%"

:: Step 1: Build logger
echo [1/4] Building Python logger...
cd logger
if not exist "install.bat" (
    echo [ERROR] logger\install.bat not found!
    cd /d "%SCRIPT_DIR%"
    pause
    cls
    goto menu
)

call install.bat
if errorlevel 1 (
    echo [ERROR] Failed to build logger.
    cd /d "%SCRIPT_DIR%"
    pause
    cls
    goto menu
)
cd /d "%SCRIPT_DIR%"

:: Step 2: Copy files
echo [2/4] Copying logger files...
if not exist "dist\bdo-combat-logger" mkdir dist\bdo-combat-logger
xcopy logger\dist\logger dist\bdo-combat-logger\logger\ /E /Y /I /Q

:: Step 3: Build frontend
echo [3/4] Building frontend...
cd client
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install frontend dependencies.
    cd /d "%SCRIPT_DIR%"
    pause
    cls
    goto menu
)

call npm run build
if errorlevel 1 (
    echo [ERROR] Failed to build frontend.
    cd /d "%SCRIPT_DIR%"
    pause
    cls
    goto menu
)
cd /d "%SCRIPT_DIR%"

:: Step 4: Build Neutralino
echo [4/4] Building Neutralino app...
call npm install -g @neutralinojs/neu@11.3.1
call neu update
call neu build
if errorlevel 1 (
    echo [ERROR] Failed to build Neutralino app.
    pause
    cls
    goto menu
)

copy update.bat dist\bdo-combat-logger\update.bat /Y >nul
copy config.ini dist\bdo-combat-logger\config.ini /Y >nul
if not exist "version" mkdir version
copy dist\bdo-combat-logger\resources.neu version\resources.neu /Y >nul

echo.
echo ============================================================
echo Application built successfully!
echo ============================================================
echo Location: dist\bdo-combat-logger\
echo Executable: dist\bdo-combat-logger\bdo-combat-logger-win_x64.exe
pause
cls
goto menu

:: ------------------------------------------------------------
:build_installer_only
cls
echo.
echo ============================================================
echo    Creating Installer
echo ============================================================
echo.

cd /d "%SCRIPT_DIR%"

rem === Find Inno Setup ===
set "INNO_PATH="
if exist "C:\Program Files (x86)\Inno Setup 6\ISCC.exe" set "INNO_PATH=C:\Program Files (x86)\Inno Setup 6\ISCC.exe"
if exist "C:\Program Files\Inno Setup 6\ISCC.exe" set "INNO_PATH=C:\Program Files\Inno Setup 6\ISCC.exe"

if not defined INNO_PATH (
    echo [ERROR] Inno Setup not found!
    pause
    cls
    goto menu
)

rem === Verify app files ===
if not exist "dist\bdo-combat-logger\bdo-combat-logger-win_x64.exe" (
    echo [ERROR] Application not built yet!
    pause
    cls
    goto menu
)

rem === Verify Npcap ===
if not exist "dependencies\npcap-1.84.exe" (
    echo [ERROR] Missing dependencies\npcap-1.84.exe
    pause
    cls
    goto menu
)

if not exist "output" mkdir "output"

echo Compiling installer...
echo "%INNO_PATH%" "installer-full.iss" /O"output" /F"bdo-combat-installer" >> "%DEBUG_LOG%"
"%INNO_PATH%" "installer-full.iss" /O"output" /F"bdo-combat-installer" >> "%DEBUG_LOG%" 2>&1

echo Exit code: %ERRORLEVEL% >> "%DEBUG_LOG%"
if errorlevel 1 (
    echo Installer build failed! See %DEBUG_LOG%
) else (
    echo Installer built successfully!
)
pause
cls
goto menu

:: ------------------------------------------------------------
:clean_build
cls
echo.
echo ============================================================
echo    Clean Build
echo ============================================================
echo.
echo This will remove:
echo   - dist folder
echo   - logger build files
echo   - client build files
echo   - node_modules (optional)
set /p "CONFIRM=Are you sure? (Y/N): "
if /i not "%CONFIRM%"=="Y" (
    echo Cancelled.
    timeout /t 2 >nul
    cls
    goto menu
)

cd /d "%SCRIPT_DIR%"
echo.
echo Cleaning build files...

if exist "dist" rmdir /s /q dist
if exist "logger\dist" rmdir /s /q logger\dist
if exist "logger\build" rmdir /s /q logger\build
if exist "client\build" rmdir /s /q client\build
if exist "Output" rmdir /s /q Output

set /p "CLEAN_NODE=Remove node_modules? (Y/N): "
if /i "%CLEAN_NODE%"=="Y" (
    if exist "client\node_modules" rmdir /s /q client\node_modules
    if exist "node_modules" rmdir /s /q node_modules
)

echo.
echo ============================================================
echo Clean complete!
echo ============================================================
pause
cls
goto menu

:: ------------------------------------------------------------
:exit_script
cls
echo.
echo Thank you for using BDO Combat Logger Setup Wizard!
echo.
timeout /t 2 >nul
exit /b 0
