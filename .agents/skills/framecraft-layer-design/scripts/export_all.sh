#!/bin/zsh
# Optional geometry-per-locale export. Use this only when headline auto-fit or script-specific
# font metrics require separate projects. Normal Framecraft projects can keep every locale in
# layer `translations` maps and export them in one command.
set -e
cd "$(dirname "$0")"
TMP=${TMPDIR:-/tmp}/framecraft-locales; mkdir -p "$TMP"
LOCALES=(${LOCALES:-en-US en-GB es-ES es-MX fr-FR de-DE it-IT pt-BR nl-NL tr-TR ru-RU ar-SA hi-IN id-ID ja-JP ko-KR zh-Hans zh-Hant})
for l in "${LOCALES[@]}"; do
  out="$TMP/$l.json"; [[ $l == en-US ]] && out=framecraft.json
  LOCALE=$l OUT=$out python3 build.py
  rm -rf "export/$l"; framecraft export "$out" --out "export/$l" --flat --simple-names
done
echo ALL-DONE
