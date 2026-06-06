# MediBridge Google Vision setup
# Usage: .\scripts\setup-vision.ps1 -ApiKey "AIza..."
#    or: .\scripts\setup-vision.ps1 -JsonPath "C:\Downloads\key.json"

param(
  [string]$ApiKey,
  [string]$JsonPath
)

function Update-EnvLine($file, $key, $newLine) {
  if (-not (Test-Path $file)) {
    Set-Content $file $newLine
    return
  }
  $lines = Get-Content $file
  $found = $false
  $out = foreach ($line in $lines) {
    if ($line -match "^$key=") {
      $found = $true
      $newLine
    } else {
      $line
    }
  }
  if (-not $found) {
    $out += $newLine
  }
  Set-Content $file $out
}

$backendRoot = Split-Path $PSScriptRoot -Parent
$envFile = Join-Path $backendRoot ".env"

Write-Host "`n=== MediBridge Google Vision Setup ===`n" -ForegroundColor Cyan

if ($ApiKey) {
  $key = $ApiKey.Trim()
  Update-EnvLine $envFile "GOOGLE_VISION_API_KEY" "GOOGLE_VISION_API_KEY=$key"
  Set-Content (Join-Path $backendRoot "google-vision-api-key.txt") $key
  Write-Host "API key saved to .env and google-vision-api-key.txt" -ForegroundColor Green
}
elseif ($JsonPath) {
  if (-not (Test-Path $JsonPath)) {
    Write-Host "File not found: $JsonPath" -ForegroundColor Red
    exit 1
  }
  $dest = Join-Path $backendRoot "service-account-vision.json"
  Copy-Item $JsonPath $dest -Force
  Write-Host "Copied key to service-account-vision.json" -ForegroundColor Green

  $json = Get-Content $dest -Raw | ConvertFrom-Json
  if ($json.project_id) {
    Update-EnvLine $envFile "GOOGLE_CLOUD_PROJECT" "GOOGLE_CLOUD_PROJECT=$($json.project_id)"
  }
  Update-EnvLine $envFile "GOOGLE_APPLICATION_CREDENTIALS" "GOOGLE_APPLICATION_CREDENTIALS=./service-account-vision.json"
}
else {
  Start-Process "https://console.cloud.google.com/apis/credentials"
  Write-Host "Opened GCP Credentials page in browser.`n" -ForegroundColor Yellow
  Write-Host "1. Create Credentials -> API key"
  Write-Host "2. Edit key -> Restrict to 'Cloud Vision API'"
  Write-Host "3. Copy the key`n"
  $key = Read-Host "Paste your API key here"
  if ($key.Trim()) {
    $k = $key.Trim()
    Update-EnvLine $envFile "GOOGLE_VISION_API_KEY" "GOOGLE_VISION_API_KEY=$k"
    Set-Content (Join-Path $backendRoot "google-vision-api-key.txt") $k
    Write-Host "API key saved to .env and google-vision-api-key.txt" -ForegroundColor Green
  } else {
    Write-Host "No key entered. Edit backend/.env manually: GOOGLE_VISION_API_KEY=..." -ForegroundColor Red
    exit 1
  }
}

Push-Location $backendRoot
node scripts/check-vision.js
$code = $LASTEXITCODE
Pop-Location
exit $code
