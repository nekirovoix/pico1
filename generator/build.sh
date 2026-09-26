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
UF2_OUT="$OUT/${TARGET}.uf2"
if [[ ! -s "$UF2_SRC" ]]; then
  echo "Expected UF2 was not produced: $UF2_SRC" >&2
  exit 1
fi
cp "$UF2_SRC" "$UF2_OUT"

CP_COMMIT="$(git -C "$CP_DIR" rev-parse HEAD)"
PICO1_COMMIT="${GITHUB_SHA:-$(git -C "$ROOT" rev-parse HEAD 2>/dev/null || printf unknown)}"
TOOLCHAIN_VERSION="$(arm-none-eabi-gcc -dumpfullversion -dumpversion)"
TOOLCHAIN_BANNER="$(arm-none-eabi-gcc --version | head -n 1)"

python3 - "$OUT/build-manifest.json" "$CP_COMMIT" "$PICO1_COMMIT" "$TOOLCHAIN_VERSION" "$TOOLCHAIN_BANNER" "$ROOT" "$UF2_OUT" <<'PY'
from datetime import datetime, timezone
from pathlib import Path
import hashlib
import json
import os
import sys

manifest_path, cp_commit, pico1_commit, toolchain_version, toolchain_banner, root_arg, uf2_arg = sys.argv[1:]
root = Path(root_arg)
uf2 = Path(uf2_arg)

def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()

data = json.loads(Path(manifest_path).read_text(encoding="utf-8"))
run_id = os.environ.get("GITHUB_RUN_ID")
repository = os.environ.get("GITHUB_REPOSITORY")
server = os.environ.get("GITHUB_SERVER_URL", "https://github.com")
run_url = f"{server}/{repository}/actions/runs/{run_id}" if repository and run_id else None
source_files = [
    "generator/generate.py",
    "generator/patch_circuitpython.py",
    "generator/build.sh",
]
data.update({
    "build_completed_at": datetime.now(timezone.utc).isoformat(),
    "source": {
        "circuitpython_commit": cp_commit,
        "circuitpython_state": "patched",
        "pico1_commit": pico1_commit,
        "repository": repository,
        "generator_sha256": {name: digest(root / name) for name in source_files},
    },
    "build": {
        "toolchain": "arm-none-eabi-gcc",
        "toolchain_version": toolchain_version,
        "toolchain_banner": toolchain_banner,
        "github_run_id": run_id,
        "github_run_url": run_url,
    },
    "customizations": [
        "source board cloned to target board",
        "USB VID, PID, manufacturer, and product overridden",
        "USB serial prefix patch applied",
        "configured CircuitPython translation selected",
        "boot.py drive visibility and maintenance policy generated",
    ],
    "artifacts": {
        uf2.name: {
            "size_bytes": uf2.stat().st_size,
            "sha256": digest(uf2),
        }
    },
})
Path(manifest_path).write_text(json.dumps(data, indent=2, sort_keys=True) + "\n", encoding="utf-8", newline="\n")
PY

(
  cd "$OUT"
  sha256sum "${TARGET}.uf2" boot.py build-config.json build-manifest.json mpconfigboard.generated.mk > SHA256SUMS.txt
  sha256sum -c SHA256SUMS.txt
)
echo "Firmware artifacts written to $OUT"
