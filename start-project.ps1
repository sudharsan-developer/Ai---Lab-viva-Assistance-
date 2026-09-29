#Requires -Version 5.0
<#
.SYNOPSIS
    One-command startup for AI-Powered Viva System.
.DESCRIPTION
    Starts MongoDB, Backend (Node.js), and Frontend (React) automatically.
    Run this after every PC restart.
.EXAMPLE
    .\start-project.ps1
#>

Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force

$Host.UI.RawUI.WindowTitle = "Viva System Launcher"
$projectRoot = "D:\Demo project\viva-system"

Write-Host ""
Write-Host "  ============================================================" -ForegroundColor Cyan
Write-Host "    AI-Powered Viva Preparation System - Auto Startup" -ForegroundColor Cyan
Write-Host "  ============================================================" -ForegroundColor Cyan
Write-Host ""

# ─── Helper: Check if a port is in use ───────────────────────────
function Test-Port($port) {
    $conn = Test-NetConnection -ComputerName 127.0.0.1 -Port $port -InformationLevel Quiet -WarningAction SilentlyContinue 2>$null
    return $conn
}

# ─── Helper: Kill process on a port ──────────────────────────────
function Stop-ProcessOnPort($port) {
    $pids = (netstat -aon 2>$null | Select-String ":$port ") |
            ForEach-Object { ($_ -split '\s+')[-1] } | 
            Select-Object -Unique
    foreach ($pid in $pids) {
        if ($pid -match '^\d+$' -and $pid -ne '0') {
            try {
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                Write-Host "    Stopped PID $pid on port $port" -ForegroundColor Yellow
            } catch {}
        }
    }
}

# ─── STEP 1: MongoDB ─────────────────────────────────────────────
Write-Host "  [1/4] Checking MongoDB..." -ForegroundColor White
if (Test-Port 27017) {
    Write-Host "        MongoDB already running on port 27017 ✓" -ForegroundColor Green
} else {
    Write-Host "        Starting MongoDB..." -ForegroundColor Yellow
    $mongodPath = "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe"
    if (Test-Path $mongodPath) {
        if (-not (Test-Path "C:\data\db")) { New-Item -ItemType Directory -Path "C:\data\db" -Force | Out-Null }
        Start-Process -FilePath $mongodPath `
            -ArgumentList "--dbpath `"C:\data\db`" --port 27017 --logpath `"C:\data\mongod.log`"" `
            -WindowStyle Minimized
        Start-Sleep -Seconds 5
        if (Test-Port 27017) {
            Write-Host "        MongoDB started successfully ✓" -ForegroundColor Green
        } else {
            Write-Host "  [WARNING] MongoDB may not have started. Check manually." -ForegroundColor Red
        }
    } else {
        Write-Host "  [WARNING] MongoDB not found at expected path." -ForegroundColor Red
        Write-Host "            Please start MongoDB manually." -ForegroundColor Red
    }
}

# ─── STEP 2: Clear port 5000 ─────────────────────────────────────
Write-Host ""
Write-Host "  [2/4] Checking port 5000 (Backend)..." -ForegroundColor White
if (Test-Port 5000) {
    Write-Host "        Port 5000 in use. Freeing it..." -ForegroundColor Yellow
    Stop-ProcessOnPort 5000
    Start-Sleep -Seconds 2
}
Write-Host "        Port 5000 ready ✓" -ForegroundColor Green

# ─── STEP 3: Clear port 3000 ─────────────────────────────────────
Write-Host ""
Write-Host "  [3/4] Checking port 3000 (Frontend)..." -ForegroundColor White
if (Test-Port 3000) {
    Write-Host "        Port 3000 in use. Freeing it..." -ForegroundColor Yellow
    Stop-ProcessOnPort 3000
    Start-Sleep -Seconds 2
}
Write-Host "        Port 3000 ready ✓" -ForegroundColor Green

# ─── STEP 4: Start Backend ───────────────────────────────────────
Write-Host ""
Write-Host "  [4/4] Launching Backend and Frontend..." -ForegroundColor White

$backendCmd = @"
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
`$Host.UI.RawUI.WindowTitle = 'Viva Backend - Port 5000'
`$Host.UI.RawUI.BackgroundColor = 'DarkBlue'
`$Host.UI.RawUI.ForegroundColor = 'Cyan'
Clear-Host
Write-Host '  ================================' -ForegroundColor Cyan
Write-Host '   VIVA BACKEND  (Port 5000)' -ForegroundColor Cyan
Write-Host '  ================================' -ForegroundColor Cyan
Write-Host ''
Set-Location 'D:\Demo project\viva-system\backend'
node server.js
Read-Host 'Backend stopped. Press Enter to close'
"@

$frontendCmd = @"
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
`$Host.UI.RawUI.WindowTitle = 'Viva Frontend - Port 3000'
`$Host.UI.RawUI.BackgroundColor = 'DarkMagenta'
`$Host.UI.RawUI.ForegroundColor = 'White'
Clear-Host
Write-Host '  ================================' -ForegroundColor Yellow
Write-Host '   VIVA FRONTEND  (Port 3000)' -ForegroundColor Yellow
Write-Host '  ================================' -ForegroundColor Yellow
Write-Host ''
Set-Location 'D:\Demo project\viva-system\frontend'
`$env:BROWSER = 'none'
npm start
Read-Host 'Frontend stopped. Press Enter to close'
"@

# Launch backend window
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd

Write-Host "        Backend window launched ✓" -ForegroundColor Green
Write-Host "        Waiting 5s for backend to connect to MongoDB..." -ForegroundColor Gray
Start-Sleep -Seconds 5

# Launch frontend window  
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd

Write-Host "        Frontend window launched ✓" -ForegroundColor Green
Write-Host "        Waiting 20s for React to compile..." -ForegroundColor Gray
Start-Sleep -Seconds 20

# ─── STEP 5: Open browser ────────────────────────────────────────
Write-Host ""
Write-Host "  Opening http://localhost:3000 in browser..." -ForegroundColor White
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "  ============================================================" -ForegroundColor Cyan
Write-Host "    All services started!" -ForegroundColor Green
Write-Host "  ============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "    Backend:  http://localhost:5000  (Blue window)" -ForegroundColor Cyan
Write-Host "    Frontend: http://localhost:3000  (Purple window)" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Login Credentials:" -ForegroundColor White
Write-Host "    Staff:   srinivasan / staff123" -ForegroundColor Yellow
Write-Host "    Staff:   revathi / staff123" -ForegroundColor Yellow
Write-Host "    Student: 25pca04001 / student123  (reg number as username)" -ForegroundColor Yellow
Write-Host ""
Write-Host "  This window can be closed. The Backend and Frontend" -ForegroundColor Gray
Write-Host "  continue running in their own windows." -ForegroundColor Gray
Write-Host ""
Read-Host "  Press Enter to close this launcher"
