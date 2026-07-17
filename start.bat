@echo off
cd /d "%~dp0"
echo Starting Attendance System...
echo Client: http://localhost:5173
echo Server: http://localhost:8000
start "Client" cmd /c "cd /d "%~dp0client" && npm run dev"
start "Server" cmd /c "cd /d "%~dp0" && python -m uvicorn server.main:app --reload --host :: --port 8000"
echo.
echo Both started in separate windows. Close them to stop.
pause
