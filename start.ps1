# Discord Bot Platform - Start Script
# This script helps you start the project with proper environment variables

Write-Host "🚀 Starting Discord Bot Platform..." -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ Error: .env file not found!" -ForegroundColor Red
    Write-Host "Please create a .env file in the root directory." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ .env file found" -ForegroundColor Green

# Load environment variables
Get-Content .env | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]*)\s*=\s*(.*)$') {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim()
        [Environment]::SetEnvironmentVariable($name, $value, "Process")
        Write-Host "  Loaded: $name" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "🔧 Starting all services..." -ForegroundColor Cyan
Write-Host ""

# Start the project
pnpm dev
