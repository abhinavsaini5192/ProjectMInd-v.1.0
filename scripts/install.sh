#!/bin/bash
set -e

echo "Installing ProjectMind..."

if ! command -v node &> /dev/null
then
    echo "Node.js could not be found. Please install Node 18+ first."
    exit 1
fi

npm i -g .
echo "ProjectMind successfully installed! Run 'projectmind init' to start."
