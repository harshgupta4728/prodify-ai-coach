@echo off
echo 🚀 Setting up GitHub repository for Prodify AI Coach...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

REM Run the Node.js setup script
echo 📋 Running GitHub setup script...
node setup-github.js

if %errorlevel% neq 0 (
    echo ❌ Setup failed. Please check the error messages above.
    pause
    exit /b 1
)

echo.
echo 🎉 Setup completed successfully!
echo.
echo 📝 Next steps:
echo 1. Go to https://github.com/new
echo 2. Create a new repository named "prodify-ai-coach"
echo 3. DO NOT initialize with README, .gitignore, or license
echo 4. Copy the repository URL
echo 5. Run the commands shown above
echo.
pause 