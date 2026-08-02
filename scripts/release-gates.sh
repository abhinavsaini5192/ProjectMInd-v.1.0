#!/bin/bash
set -e

echo "Running ProjectMind v1.0 Quality Gates..."

echo "1. Compiling TypeScript..."
npx tsc

echo "2. Running Unit & Integration Tests..."
npm run test

echo "3. Running Benchmark Suite..."
node dist/cli/cli.js benchmark

echo "4. Generating Compatibility Report..."
node dist/cli/cli.js compatibility

echo "✅ All Quality Gates Passed. ProjectMind is ready for release."
