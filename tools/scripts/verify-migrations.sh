#!/bin/sh
# Runs every migration, reverts them all, then runs them again — proves each one is reversible.
set -eu

count=$(ls migrations/*.ts | wc -l | tr -d ' ')

pnpm migration:run
i=0
while [ "$i" -lt "$count" ]; do
  pnpm migration:revert
  i=$((i + 1))
done
pnpm migration:run
