#!/usr/bin/env bash
set -euo pipefail

# Replaced when packaging release assets. Local tests use --source-dir.
release_version='__RELEASE_VERSION__'
destination="${HOME:?}/.agents/skills"
source_dir=''
skills=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    --destination) destination=${2:?Missing destination}; shift 2 ;;
    --source-dir) source_dir=${2:?Missing source directory}; shift 2 ;;
    --skill) skills+=("${2:?Missing skill name}"); shift 2 ;;
    --help)
      printf '%s\n' 'Usage: bash install.sh [--skill NAME] [--destination PATH] [--source-dir PATH]'
      exit 0 ;;
    *) printf 'Unknown argument: %s\n' "$1" >&2; exit 1 ;;
  esac
done
if [[ ${#skills[@]} -eq 0 ]]; then
  skills=(business-lead-research business-website-delivery)
fi
seen=' '
for name in "${skills[@]}"; do
  case "$name" in
    business-lead-research|business-website-delivery) ;;
    *) printf 'Unknown skill: %s\n' "$name" >&2; exit 1 ;;
  esac
  [[ "$seen" != *" $name "* ]] || { printf '%s\n' 'Duplicate skill name' >&2; exit 1; }
  seen="$seen$name "
  if [[ -e "$destination/$name" || -L "$destination/$name" ]]; then
    printf 'Already exists: %s. Back up and review it before replacing.\n' "$destination/$name" >&2
    exit 1
  fi
done
if [[ -z "$source_dir" && ! "$release_version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  printf '%s\n' 'Use install.sh from a GitHub Release, or --source-dir with local release assets.' >&2
  exit 1
fi
work_dir=$(mktemp -d "${TMPDIR:-/tmp}/business-website-install.XXXXXX")
trap 'rm -rf -- "$work_dir"' EXIT
for name in "${skills[@]}"; do
  for file in "$name.zip" "$name.zip.sha256"; do
    if [[ -n "$source_dir" ]]; then
      cp "$source_dir/$file" "$work_dir/$file"
    else
      curl --fail --silent --show-error --location --proto '=https' --tlsv1.2 \
        "https://github.com/ksv90/business-website-skills/releases/download/v$release_version/$file" \
        --output "$work_dir/$file"
    fi
  done
  # Verify only the expected filename; do not execute paths from the checksum file.
  expected=$(awk 'NR == 1 { print $1 }' "$work_dir/$name.zip.sha256")
  [[ "$expected" =~ ^[0-9a-fA-F]{64}$ ]] || { printf '%s\n' 'Invalid checksum' >&2; exit 1; }
  actual=$(shasum -a 256 "$work_dir/$name.zip" | awk '{print $1}')
  [[ "$actual" == "$expected" ]] || { printf 'SHA-256 mismatch: %s\n' "$name" >&2; exit 1; }
  unzip -Z1 "$work_dir/$name.zip" > "$work_dir/entries"
  while IFS= read -r entry; do
    [[ "$entry" == "$name/"* && "$entry" != *\\* && ! "$entry" =~ (^|/)\.\.(/|$) ]] || {
      printf '%s\n' 'Unexpected archive path' >&2; exit 1;
    }
  done < "$work_dir/entries"
  unzip -q "$work_dir/$name.zip" -d "$work_dir/unpacked"
  [[ -f "$work_dir/unpacked/$name/SKILL.md" ]] || { printf '%s\n' 'SKILL.md missing' >&2; exit 1; }
  [[ -z $(find "$work_dir/unpacked/$name" -type l -print -quit) ]] || { printf '%s\n' 'Symlink in archive' >&2; exit 1; }
done
# Both archives must pass before either skill is installed.
mkdir -p "$destination"
for name in "${skills[@]}"; do
  mv "$work_dir/unpacked/$name" "$destination/"
  printf 'Installed: %s\n' "$destination/$name"
done
