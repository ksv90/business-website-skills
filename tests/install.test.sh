#!/usr/bin/env bash
set -euo pipefail
repo_root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
mkdir -p "$repo_root/.build"
test_root=$(mktemp -d "$repo_root/.build/install-test.XXXXXX")
trap 'rm -rf -- "$test_root"' EXIT
mkdir "$test_root/tmp"
export TMPDIR="$test_root/tmp"
installer="$repo_root/dist/install.sh"
assets="$repo_root/dist"
destination="$test_root/skills with spaces"
bash "$installer" --source-dir "$assets" --destination "$destination"
for name in business-lead-research business-website-delivery; do
  cmp "$repo_root/skills/$name/SKILL.md" "$destination/$name/SKILL.md"
done
printf 'user edit\n' > "$destination/business-lead-research/SKILL.md"
if bash "$installer" --source-dir "$assets" --destination "$destination" > "$test_root/retry.log" 2>&1; then
  printf '%s\n' 'Existing installation was not rejected' >&2; exit 1
fi
[[ $(cat "$destination/business-lead-research/SKILL.md") == 'user edit' ]]
mkdir "$test_root/corrupt"
cp "$assets/"*.zip "$assets/"*.zip.sha256 "$test_root/corrupt/"
printf 'tampered' >> "$test_root/corrupt/business-website-delivery.zip"
if bash "$installer" --source-dir "$test_root/corrupt" --destination "$test_root/must-not-install" > "$test_root/corrupt.log" 2>&1; then
  printf '%s\n' 'Corrupt archive was not rejected' >&2; exit 1
fi
[[ ! -e "$test_root/must-not-install" ]]
bash "$installer" --source-dir "$assets" --destination "$test_root/single" --skill business-website-delivery
[[ -f "$test_root/single/business-website-delivery/SKILL.md" && ! -e "$test_root/single/business-lead-research" ]]
printf '%s\n' 'OK native installer: both skills, paths with spaces, preservation, checksum failure, single skill'
