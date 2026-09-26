#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONFIG="${1:-$ROOT/config/default.json}"
WORK="${BUILD_WORK_DIR:-$ROOT/build-work}"
OUT="${OUTPUT_DIR:-$ROOT/generator/dist}"
CP_DIR="$WORK/circuitpython"

python3 "$ROOT/generator/generate.py" --config "$CONFIG" --out "$OUT"
VERSION="$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))["circuitpython_version"])' "$CONFIG")"
TARGET="$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))["target_board"])' "$CONFIG")"
LANGUAGE="$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))["language"])' "$CONFIG")"

mkdir -p "$WORK" "$OUT"
if [[ ! -d "$CP_DIR/.git" ]]; then
  git clone --depth 1 --branch "$VERSION" https://github.com/adafruit/circuitpython.git "$CP_DIR"
fi

git -C "$CP_DIR" fetch --depth 1 origin "refs/tags/$VERSION:refs/tags/$VERSION"
git -C "$CP_DIR" checkout --force --detach "$VERSION"
git -C "$CP_DIR" clean -ffd
make -C "$CP_DIR/ports/raspberrypi" fetch-port-submodules

python3 "$ROOT/generator/generate.py" --config "$CONFIG" --out "$OUT" --circuitpython-dir "$CP_DIR"
python3 "$ROOT/generator/patch_circuitpython.py" --config "$CONFIG" --circuitpython-dir "$CP_DIR"
arm-none-eabi-gcc --version | head -n 1
make -C "$CP_DIR/ports/raspberrypi" -j"${JOBS:-2}" BOARD="$TARGET" TRANSLATION="$LANGUAGE"

UF2_SRC="$CP_DIR/ports/raspberrypi/build-$TARGET/firmware.uf2"
if [[ ! -s "$UF2_SRC" ]]; then
  echo "Expected UF2 was not produced: $UF2_SRC" >&2
  exit 1
fi
cp "$UF2_SRC" "$OUT/${TARGET}.uf2"
CP_COMMIT="$(git -C "$CP_DIR" rev-parse HEAD)"
python3 - "$OUT/build-manifest.json" "$CP_COMMIT" <<'PY'
import json, sys
p, commit = sys.argv[1:]
data = json.load(open(p, encoding="utf-8"))
data["circuitpython_commit"] = commit
open(p, "w", encoding="utf-8", newline="\n").write(json.dumps(data, indent=2, sort_keys=True) + "\n")
PY
(
  cd "$OUT"
  sha256sum "${TARGET}.uf2" boot.py build-config.json build-manifest.json > SHA256SUMS.txt
)
echo "Firmware artifacts written to $OUT"
