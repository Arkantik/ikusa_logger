@echo off
setlocal

if "%~1"=="" (
    echo Error: Version number argument is missing.
    exit /B 1
)

set "VERSION=%~1"
set "INSTALL_DIR=%~dp0"

echo.
echo Updating to v%VERSION%...
echo.

REM Wait for application to close
timeout /t 3 /nobreak >nul
taskkill /F /IM ikusa-logger-win_x64.exe 2>nul
timeout /t 2 /nobreak >nul

REM Create temp directory
set "TEMP_DIR=%TEMP%\ikusa_update_%RANDOM%"
mkdir "%TEMP_DIR%"

REM Download executable from releases
echo Downloading executable...
curl -L -o "%TEMP_DIR%\ikusa-logger-win_x64.exe" "https://github.com/Arkantik/ikusa_logger/releases/download/v%VERSION%/ikusa-logger-win_x64.exe"
if errorlevel 1 (
    echo ERROR: Failed to download executable
    pause
    goto :cleanup
)

REM Download resources.neu from main branch version folder
echo Downloading resources...
curl -L -o "%TEMP_DIR%\resources.neu" "https://raw.githubusercontent.com/Arkantik/ikusa_logger/main/version/resources.neu"
if errorlevel 1 (
    echo ERROR: Failed to download resources
    pause
    goto :cleanup
)

REM Install update
echo Installing update...

REM Backup current executable
if exist "%INSTALL_DIR%ikusa-logger-win_x64.exe.backup" (
    del "%INSTALL_DIR%ikusa-logger-win_x64.exe.backup"
)
if exist "%INSTALL_DIR%ikusa-logger-win_x64.exe" (
    move "%INSTALL_DIR%ikusa-logger-win_x64.exe" "%INSTALL_DIR%ikusa-logger-win_x64.exe.backup" >nul
)

REM Copy new files
copy /Y "%TEMP_DIR%\ikusa-logger-win_x64.exe" "%INSTALL_DIR%ikusa-logger-win_x64.exe" >nul
if errorlevel 1 (
    echo ERROR: Failed to replace executable
    if exist "%INSTALL_DIR%ikusa-logger-win_x64.exe.backup" (
        move "%INSTALL_DIR%ikusa-logger-win_x64.exe.backup" "%INSTALL_DIR%ikusa-logger-win_x64.exe" >nul
    )
    pause
    goto :cleanup
)

copy /Y "%TEMP_DIR%\resources.neu" "%INSTALL_DIR%resources.neu" >nul

REM Clean up backup
if exist "%INSTALL_DIR%ikusa-logger-win_x64.exe.backup" (
    del "%INSTALL_DIR%ikusa-logger-win_x64.exe.backup"
)

echo.
echo Update completed successfully!
echo Restarting application...
timeout /t 2 /nobreak >nul

start "" "%INSTALL_DIR%ikusa-logger-win_x64.exe"

:cleanup
if exist "%TEMP_DIR%" (
    rmdir /s /q "%TEMP_DIR%" 2>nul
)
exit