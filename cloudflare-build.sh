#!/bin/bash

SCRIPT_DIR=$(dirname $0)

echo "Environment:"
set
echo "-------------------"

echo "executing frontend build"
cd frontend
bun install
bun run build

echo "-------------------"
echo "executing backend build"
cd ../api
pwd
bun install

if [ "$CF_PAGES" = "1" ]; then
  if [ "$CF_PAGES_BRANCH" = "main" ]; then
    echo "deploying to production"
    bun run deploy:production
  else
    echo "deploying to staging"
    bun run deploy:staging
  fi
fi

