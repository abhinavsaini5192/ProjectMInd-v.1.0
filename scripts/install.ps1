$ErrorActionPreference = "Stop"

Write-Host "Installing ProjectMind..."

if (-not (Get-Command "node" -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js could not be found. Please install Node 18+ first."
    exit 1
}

npm i -g .
Write-Host "ProjectMind successfully installed! Run 'projectmind init' to start."
