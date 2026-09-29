<#
.SYNOPSIS
    Enterprise CI/CD Git Deployment Script for Nilasa Storefront
.DESCRIPTION
    Automates the production deployment lifecycle:
    1. Fetches and fast-forwards the latest code from Git
    2. Verifies environment configuration (.env / .env.production)
    3. Installs dependencies
    4. Executes Next.js production compilation (npm run build)
    5. Restarts application (IIS / iisnode / PM2)
.PARAMETER Branch
    The Git branch to pull from (default: "main")
#>

param(
    [string]$Branch = "main"
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   NILASA ENTERPRISE CI/CD GIT DEPLOYMENT PIPELINE       " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Working Directory: $ProjectRoot"
Write-Host "Target Branch:     $Branch"
Write-Host "Timestamp:         $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Host ""

Set-Location $ProjectRoot

# ── 1. GIT SYNC ─────────────────────────────────────────
Write-Host "[1/5] Fetching and updating code from Git..." -ForegroundColor Yellow
git fetch origin $Branch
$CurrentCommit = git rev-parse --short HEAD
git checkout $Branch
git pull origin $Branch
$NewCommit = git rev-parse --short HEAD
Write-Host "      Previous commit: $CurrentCommit"
Write-Host "      Updated to:      $NewCommit" -ForegroundColor Green

# ── 2. ENVIRONMENT CONFIGURATION CHECK ─────────────────
Write-Host "[2/5] Validating environment configuration..." -ForegroundColor Yellow
$EnvFile = Join-Path $ProjectRoot ".env"
$EnvProdFile = Join-Path $ProjectRoot ".env.production"

if (-not (Test-Path $EnvFile) -and -not (Test-Path $EnvProdFile)) {
    Write-Warning "No .env or .env.production file found! Copying from .env.example..."
    if (Test-Path (Join-Path $ProjectRoot ".env.example")) {
        Copy-Item (Join-Path $ProjectRoot ".env.example") $EnvFile
        Write-Host "      Created default .env from .env.example. Please review secrets." -ForegroundColor Magenta
    } else {
        Write-Error "CRITICAL: No environment configuration file found. Aborting deployment."
    }
} else {
    Write-Host "      Environment configuration found." -ForegroundColor Green
}

# ── 3. INSTALL DEPENDENCIES ─────────────────────────────
Write-Host "[3/5] Installing dependencies..." -ForegroundColor Yellow
npm install --prefer-offline --no-audit
Write-Host "      Dependencies installed successfully." -ForegroundColor Green

# ── 4. PRODUCTION BUILD ─────────────────────────────────
Write-Host "[4/5] Compiling Next.js production build..." -ForegroundColor Yellow
npm run build
Write-Host "      Next.js build completed successfully." -ForegroundColor Green

# ── 5. RECYCLE / RESTART APPLICATION ────────────────────
Write-Host "[5/5] Restarting application..." -ForegroundColor Yellow

# A. Touch web.config to trigger IIS/iisnode recycle without requiring administrator privileges
$WebConfigFile = Join-Path $ProjectRoot "web.config"
if (Test-Path $WebConfigFile) {
    (Get-Item $WebConfigFile).LastWriteTime = Get-Date
    Write-Host "      Touched web.config -> IIS application recycle triggered." -ForegroundColor Green
}

# B. If PM2 is running
try {
    $pm2Check = Get-Command pm2 -ErrorAction SilentlyContinue
    if ($pm2Check) {
        pm2 reload nilasa --update-env 2>$null
        Write-Host "      PM2 process reloaded." -ForegroundColor Green
    }
} catch {
    # PM2 not in use or not configured
}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "   DEPLOYMENT SUCCEEDED (Commit: $NewCommit)             " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
