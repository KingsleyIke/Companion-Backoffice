#!/bin/sh
# Usage: pnpm migration:generate <Name>   (diff entities against the database)
#        pnpm migration:create <Name>     (empty migration to write by hand)
set -eu

command=migration:generate
if [ "${1:-}" = "--empty" ]; then
  command=migration:create
  shift
fi
# pnpm forwards a literal "--" when invoked as `pnpm migration:generate -- <Name>`.
if [ "${1:-}" = "--" ]; then
  shift
fi

name="${1:-}"
if [ -z "$name" ]; then
  echo "usage: pnpm $command <PascalCaseName>" >&2
  exit 1
fi

if [ "$command" = migration:create ]; then
  exec node node_modules/typeorm/cli.js migration:create "migrations/$name"
fi
exec pnpm typeorm migration:generate --pretty "migrations/$name"
