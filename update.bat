@echo off
setlocal

:: Check for admin rights
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Requesting administrator privileges...
    powershell -Command "Start-Process '%~f0' -ArgumentList '%*' -Verb RunAs"
    exit /B
)

if "%~1"=="" (
    echo Error: Version number argument is missing.
    exit /B 1
)

set "VERSION=%~1"
set "INSTALL_DIR=%~dp0"
set "EXE_NAME=bdo-combat-logger-win_x64.exe"

echo.
echo Updating to v%VERSION%...
echo.

REM Wait for application to close
timeout /t 3 /nobreak >nul
taskkill /F /IM "%EXE_NAME%" 2>nul
timeout /t 2 /nobreak >nul

REM Create temp directory
set "TEMP_DIR=%TEMP%\bdo_update_%RANDOM%"
mkdir "%TEMP_DIR%"

REM Download executable from releases
echo Downloading executable...
curl -L -o "%TEMP_DIR%\%EXE_NAME%" "https://github.com/Arkantik/ikusa_logger/releases/download/v%VERSION%/%EXE_NAME%"
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
if exist "%INSTALL_DIR%%EXE_NAME%.backup" (
    del "%INSTALL_DIR%%EXE_NAME%.backup"
)
if exist "%INSTALL_DIR%%EXE_NAME%" (
    move "%INSTALL_DIR%%EXE_NAME%" "%INSTALL_DIR%%EXE_NAME%.backup" >nul
)

REM Copy new files
copy /Y "%TEMP_DIR%\%EXE_NAME%" "%INSTALL_DIR%%EXE_NAME%" >nul
if errorlevel 1 (
    echo ERROR: Failed to replace executable
    if exist "%INSTALL_DIR%%EXE_NAME%.backup" (
        move "%INSTALL_DIR%%EXE_NAME%.backup" "%INSTALL_DIR%%EXE_NAME%" >nul
    )
    pause
    goto :cleanup
)

copy /Y "%TEMP_DIR%\resources.neu" "%INSTALL_DIR%resources.neu" >nul

REM Clean up backup
if exist "%INSTALL_DIR%%EXE_NAME%.backup" (
    del "%INSTALL_DIR%%EXE_NAME%.backup"
)

echo.
echo Update completed successfully!
echo Restarting application...
timeout /t 1 /nobreak >nul

cmd /c start "" /d "%INSTALL_DIR%" "%EXE_NAME%"

:cleanup
if exist "%TEMP_DIR%" (
    rmdir /s /q "%TEMP_DIR%" 2>nul
)

exit