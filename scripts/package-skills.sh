#!/usr/bin/env bash
set -euo pipefail
repo_root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
cd "$repo_root"
node scripts/check-skills.ts "${1:-}"
mkdir -p .build dist
staging=$(mktemp -d "$repo_root/.build/package.XXXXXX")
for name in business-lead-research business-website-delivery; do
  cp -R "skills/$name" "$staging/$name"
  (cd "$staging" && zip -q -r -X "$name.zip" "$name")
  unzip -tqq "$staging/$name.zip"
  # Replace only this build's known output files, never arbitrary directories.
  mv "$staging/$name.zip" "dist/$name.zip"
  (cd dist && shasum -a 256 "$name.zip" > "$name.zip.sha256")
done
version=$(cat version.txt)
for installer in install.sh install.ps1; do
  sed "s/__RELEASE_VERSION__/$version/g" "scripts/$installer" > "dist/$installer"
  (cd dist && shasum -a 256 "$installer" > "$installer.sha256")
done
printf 'Built both skill ZIPs and SHA-256 checksums in dist/\n'
