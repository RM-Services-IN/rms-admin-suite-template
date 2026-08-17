#!/usr/bin/env bash
# ============================================================
# RM SERVICES — compile Tailwind to a static CSS file.
# Replaces the tailwind.js runtime for faster production loads.
# Usage:  bash build/build-css.sh
# ============================================================
set -e
cd "$(dirname "$0")/.."

BIN="build/tailwindcss"
if [ ! -f "$BIN" ]; then
  OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
  ARCH="$(uname -m)"
  [ "$ARCH" = "x86_64" ] && ARCH="x64"
  [ "$ARCH" = "aarch64" ] && ARCH="arm64"
  echo "Downloading Tailwind standalone CLI (tailwindcss-$OS-$ARCH)..."
  curl -sL "https://github.com/tailwindlabs/tailwindcss/releases/download/v3.4.16/tailwindcss-$OS-$ARCH" -o "$BIN"
  chmod +x "$BIN"
fi

"$BIN" -c build/tailwind.config.js -i build/tailwind-input.css -o assets/css/tailwind.compiled.css --minify

echo ""
echo "Done → assets/css/tailwind.compiled.css"
echo ""
echo "To use it, in EVERY .html file replace these two lines:"
echo '    <script src="assets/js/tailwind.js"></script>'
echo '    <script src="assets/js/theme-config.js"></script>'
echo "with:"
echo '    <link rel="stylesheet" href="assets/css/tailwind.compiled.css"/>'
