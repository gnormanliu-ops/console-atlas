@echo off
cd /d "%~dp0"
echo Keep this window open, then open http://localhost:8000/ in your browser.
where py >nul 2>nul
if not errorlevel 1 (
  py -m http.server 8000
) else (
  where python >nul 2>nul
  if not errorlevel 1 (
    python -m http.server 8000
  ) else (
    echo Python 3 was not found. Install Python 3, then try again.
  )
)
pause
