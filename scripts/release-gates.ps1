$ErrorActionPreference = "Stop"

Write-Host "Running ProjectMind v1.0 Quality Gates..."

Write-Host "1. Compiling TypeScript..."
npx tsc

Write-Host "2. Running Unit & Integration Tests..."
npm run test

Write-Host "3. Running Benchmark Suite..."
node dist/cli/cli.js benchmark

Write-Host "4. Generating Compatibility Report..."
node dist/cli/cli.js compatibility

Write-Host "✅ All Quality Gates Passed. ProjectMind is ready for release."
