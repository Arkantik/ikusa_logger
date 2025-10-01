:: Build the logger
cd logger
CALL install.bat

:: Copy everything from logger/dist/logger to dist/ikusa-logger/logger/
cd .. 
xcopy logger\dist\logger dist\ikusa-logger\logger\ /E /Y

:: Install Dependencies for the Frontend (React)
cd client 
CALL npm i

:: Install Neutralino CLI globally
CALL npm i -g @neutralinojs/neu@11.3.1

:: Compile the React program
cd .. 
CALL neu update
CALL neu build

echo Build completed. Compiled files are in dist/ikusa-logger/