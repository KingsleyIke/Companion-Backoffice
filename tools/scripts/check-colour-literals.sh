#!/bin/sh
# Fails when a colour literal appears in the back office outside the token file (task 1.1.10).
# Styles use `@use 'tokens' as t` and the semantic aliases in styles/tokens.scss.
set -eu

root=apps/back-office/src
tokens=$root/styles/tokens.scss
colour='#[0-9a-fA-F]{3,8}\b|\b(rgba?|hsla?)\('

# Stylesheets: any colour literal. Templates and TypeScript: only in style-related properties,
# so anchors like href="#top" are not mistaken for colours.
found=$(
  {
    grep -rnE "$colour" "$root" --include='*.scss' --include='*.css' | grep -v "^$tokens:" || true
    grep -rnE "(color|background|border|fill|stroke|shadow|outline)[^;\"]*($colour)" "$root" \
      --include='*.html' --include='*.ts' || true
  }
)

if [ -n "$found" ]; then
  echo "Colour literals found. Use a token from $tokens instead:" >&2
  echo "$found" >&2
  exit 1
fi
echo "No colour literals outside $tokens."
