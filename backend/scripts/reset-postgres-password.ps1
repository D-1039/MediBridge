# Run as Administrator: resets local PostgreSQL "postgres" user password for MediBridge.
# Usage: Right-click PowerShell -> Run as administrator, then:
#   Set-ExecutionPolicy -Scope Process Bypass -Force
#   & "D:\project\QSKILL\,edibridge\backend\scripts\reset-postgres-password.ps1"

$ErrorActionPreference = "Stop"
$NewPassword = "MediBridge2026!"
$PgData = "C:\Program Files\PostgreSQL\18\data"
$PgBin = "C:\Program Files\PostgreSQL\18\bin"
$ServiceName = "postgresql-x64-18"
$HbaFile = Join-Path $PgData "pg_hba.conf"

if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "Re-launching as Administrator (approve UAC prompt)..." -ForegroundColor Yellow
    Start-Process powershell -Verb RunAs -ArgumentList @(
        "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", "`"$PSCommandPath`""
    )
    exit
}

Write-Host "Backing up pg_hba.conf..."
Copy-Item $HbaFile "$HbaFile.bak-medibridge" -Force

$content = Get-Content $HbaFile -Raw
$content = $content -replace 'scram-sha-256', 'trust'
Set-Content -Path $HbaFile -Value $content -NoNewline

Write-Host "Restarting PostgreSQL..."
Restart-Service $ServiceName
Start-Sleep -Seconds 4

$env:PGPASSWORD = ""
& "$PgBin\psql.exe" -U postgres -h localhost -d postgres -c "ALTER USER postgres WITH PASSWORD '$NewPassword';"
& "$PgBin\psql.exe" -U postgres -h localhost -d postgres -c "SELECT 1 FROM pg_database WHERE datname='medibridge'" -t | ForEach-Object {
    if ($_.Trim() -ne "1") {
        & "$PgBin\psql.exe" -U postgres -h localhost -d postgres -c "CREATE DATABASE medibridge;"
    }
}

Write-Host "Restoring pg_hba.conf security..."
Copy-Item "$HbaFile.bak-medibridge" $HbaFile -Force
Restart-Service $ServiceName
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "SUCCESS! PostgreSQL password for user 'postgres' is now:" -ForegroundColor Green
Write-Host "  $NewPassword" -ForegroundColor Cyan
Write-Host ""
Write-Host "DATABASE_URL=postgresql://postgres:${NewPassword}@localhost:5432/medibridge"
