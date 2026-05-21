# AgroSat UZ — birinchi sozlash
$backend = Join-Path $PSScriptRoot "..\backend"
$envFile = Join-Path $backend ".env"

if (-not (Test-Path $envFile)) {
    $bytes = New-Object byte[] 48
    [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
    $secret = [Convert]::ToBase64String($bytes) -replace '\+','-' -replace '/','_' -replace '=',''
    @"
SECRET_KEY=$secret
DATABASE_URL=sqlite+aiosqlite:///./agrosat.db
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
ACCESS_TOKEN_EXPIRE_MINUTES=1440
"@ | Set-Content -Path $envFile -Encoding UTF8
    Write-Host "Created .env with random SECRET_KEY"
} else {
    Write-Host ".env already exists"
}

Write-Host "`nInstall Python 3.11+ from https://www.python.org/downloads/"
Write-Host "Then:"
Write-Host "  cd backend"
Write-Host "  python -m venv .venv"
Write-Host "  .\.venv\Scripts\Activate.ps1"
Write-Host "  pip install -r requirements.txt"
Write-Host "  uvicorn app.main:app --reload --port 8000"
Write-Host "`nFrontend:"
Write-Host "  cd frontend"
Write-Host "  npm install"
Write-Host "  npm run dev"
