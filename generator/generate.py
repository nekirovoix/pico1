#!/usr/bin/env python3
"""Validate a firmware config and generate board/build assets."""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import shutil
from datetime import datetime, timezone
from pathlib import Path

ASCII_RE = re.compile(r"^[\x20-\x7e]+$")
HEX16_RE = re.compile(r"^0x[0-9A-Fa-f]{4}$")
BOARD_RE = re.compile(r"^[a-z0-9][a-z0-9_]{1,63}$")
LABEL_RE = re.compile(r"^[A-Z0-9_-]{1,11}$")
PIN_RE = re.compile(r"^GP(?:[0-9]|1[0-9]|2[0-9])$")
LANG_RE = re.compile(r"^[a-z]{2}_[A-Z]{2}$")
VERSION_RE = re.compile(r"^[0-9]+\.[0-9]+\.[0-9]+(?:[-+][0-9A-Za-z.-]+)?$")
MODES = {"always", "hidden", "maintenance"}
RUNTIME_PROFILES = {"standard", "classroom_guard"}


def _ascii(name: str, value: object, maximum: int) -> str:
    if not isinstance(value, str) or not value or len(value) > maximum or not ASCII_RE.fullmatch(value):
        raise ValueError(f"{name} must be 1-{maximum} printable ASCII characters")
    return value


def validate_config(raw: dict) -> dict:
    required = {
        "circuitpython_version", "source_board", "target_board",
        "usb_manufacturer", "usb_product", "usb_vid", "usb_pid",
        "serial_prefix", "drive_label", "maintenance_pin",
        "drive_mode", "language",
    }
    allowed = required | {"runtime_profile"}
    missing = sorted(required - raw.keys())
    unknown = sorted(raw.keys() - allowed)
    if missing:
        raise ValueError("missing fields: " + ", ".join(missing))
    if unknown:
        raise ValueError("unknown fields: " + ", ".join(unknown))

    cfg = dict(raw)
    cfg["runtime_profile"] = cfg.get("runtime_profile", "standard")
    if not isinstance(cfg["circuitpython_version"], str) or not VERSION_RE.fullmatch(cfg["circuitpython_version"]):
        raise ValueError("circuitpython_version must look like 10.3.0")
    for key in ("source_board", "target_board"):
        if not isinstance(cfg[key], str) or not BOARD_RE.fullmatch(cfg[key]):
            raise ValueError(f"{key} must contain lowercase letters, digits, and underscores")
    if cfg["source_board"] == cfg["target_board"]:
        raise ValueError("target_board must differ from source_board")

    cfg["usb_manufacturer"] = _ascii("usb_manufacturer", cfg["usb_manufacturer"], 126)
    cfg["usb_product"] = _ascii("usb_product", cfg["usb_product"], 126)
    cfg["serial_prefix"] = _ascii("serial_prefix", cfg["serial_prefix"], 24)
    for key in ("usb_vid", "usb_pid"):
        if not isinstance(cfg[key], str) or not HEX16_RE.fullmatch(cfg[key]):
            raise ValueError(f"{key} must be exactly 0x0000 through 0xFFFF")
        if cfg[key].upper() in {"0X0000", "0XFFFF"}:
            raise ValueError(f"{key} uses a reserved value")
        cfg[key] = "0x" + cfg[key][2:].upper()
    if not isinstance(cfg["drive_label"], str) or not LABEL_RE.fullmatch(cfg["drive_label"]):
        raise ValueError("drive_label must be 1-11 uppercase ASCII letters, digits, _ or -")
    if not isinstance(cfg["maintenance_pin"], str) or not PIN_RE.fullmatch(cfg["maintenance_pin"]):
        raise ValueError("maintenance_pin must be GP0 through GP29")
    if cfg["maintenance_pin"] in {"GP23", "GP24", "GP25", "GP29"}:
        raise ValueError("maintenance_pin conflicts with common Pico onboard functions")
    if cfg["drive_mode"] not in MODES:
        raise ValueError("drive_mode must be always, hidden, or maintenance")
    if cfg["runtime_profile"] not in RUNTIME_PROFILES:
        raise ValueError("runtime_profile must be standard or classroom_guard")
    if cfg["runtime_profile"] == "classroom_guard" and cfg["drive_mode"] == "always":
        raise ValueError("classroom_guard cannot use drive_mode=always because runtime and host writes would conflict")
    if not isinstance(cfg["language"], str) or not LANG_RE.fullmatch(cfg["language"]):
        raise ValueError("language must look like en_US")
    return cfg


def _py(value: str) -> str:
    return repr(value)


def _maintenance_probe(cfg: dict) -> list[str]:
    if cfg["drive_mode"] == "maintenance":
        return [
            "import board",
            "import digitalio",
            "",
            f"maintenance = digitalio.DigitalInOut(board.{cfg['maintenance_pin']})",
            "maintenance.switch_to_input(pull=digitalio.Pull.UP)",
            "show_drive = not maintenance.value  # hold pin to GND during reset",
            "maintenance.deinit()",
            "",
        ]
    return [f"show_drive = {cfg['drive_mode'] == 'always'}", ""]


def _safe_label_transaction(label: str, indent: str = "") -> list[str]:
    return [
        indent + "filesystem_writable = False",
        indent + "try:",
        indent + "    storage.remount('/', readonly=False)",
        indent + "    filesystem_writable = True",
        indent + f"    storage.getmount('/').label = {_py(label)}",
        indent + "except Exception as exc:",
        indent + "    print('Drive label update skipped:', exc)",
        indent + "finally:",
        indent + "    if filesystem_writable:",
        indent + "        try:",
        indent + "            storage.remount('/', readonly=True)",
        indent + "        except Exception as exc:",
        indent + "            print('Filesystem safety remount failed:', exc)",
    ]


def render_boot_py(cfg: dict) -> str:
    cfg = validate_config(cfg)
    guard = cfg["runtime_profile"] == "classroom_guard"
    lines = ['"""Generated by pico1. Runs before code.py."""', "import storage"]
    if guard:
        lines += ["import usb_cdc", "import usb_hid"]
    lines += [""] + _maintenance_probe(cfg)

    if guard:
        lines += [
            "# Classroom Guard requires a dedicated CDC data channel; HID stays enabled.",
            "usb_cdc.enable(console=True, data=True)",
            "",
            "if show_drive:",
            "    # Maintenance mode: host-visible storage stays read-only to CircuitPython.",
        ]
        lines += _safe_label_transaction(cfg["drive_label"], "    ")
        lines += [
            "else:",
            "    # Normal runtime: hide mass storage, then keep the filesystem writable",
            "    # for calibration JSON, bounded logs, and atomic manifest updates.",
            "    storage.disable_usb_drive()",
            "    try:",
            "        storage.remount('/', readonly=False)",
            f"        storage.getmount('/').label = {_py(cfg['drive_label'])}",
            "    except Exception as exc:",
            "        print('Runtime filesystem setup failed:', exc)",
        ]
    else:
        lines += ["if not show_drive:", "    storage.disable_usb_drive()", ""]
        lines += _safe_label_transaction(cfg["drive_label"])
    lines.append("")
    return "\n".join(lines)


def render_board_mk(cfg: dict) -> str:
    product = json.dumps(cfg["usb_product"], ensure_ascii=True)
    manufacturer = json.dumps(cfg["usb_manufacturer"], ensure_ascii=True)
    return "\n".join([
        "# Generated by pico1; included after the source board configuration.",
        f"USB_VID = {cfg['usb_vid']}",
        f"USB_PID = {cfg['usb_pid']}",
        f"USB_PRODUCT = {product}",
        f"USB_MANUFACTURER = {manufacturer}",
        "",
    ])


def write_outputs(config_path: Path, out_dir: Path, circuitpython_dir: Path | None = None) -> None:
    cfg = validate_config(json.loads(config_path.read_text(encoding="utf-8")))
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "boot.py").write_text(render_boot_py(cfg), encoding="utf-8", newline="\n")
    (out_dir / "mpconfigboard.generated.mk").write_text(render_board_mk(cfg), encoding="utf-8", newline="\n")
    canonical = json.dumps(cfg, ensure_ascii=True, indent=2, sort_keys=True) + "\n"
    (out_dir / "build-config.json").write_text(canonical, encoding="utf-8", newline="\n")

    if circuitpython_dir:
        boards = circuitpython_dir / "ports" / "raspberrypi" / "boards"
        source = boards / cfg["source_board"]
        target = boards / cfg["target_board"]
        if not source.is_dir():
            raise ValueError(f"CircuitPython source board not found: {source}")
        if target.exists():
            shutil.rmtree(target)
        shutil.copytree(source, target)
        with (target / "mpconfigboard.mk").open("a", encoding="utf-8", newline="\n") as handle:
            handle.write("\n" + render_board_mk(cfg))

    manifest = {
        "schema": 2,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "configuration": cfg,
        "config_sha256": hashlib.sha256(canonical.encode()).hexdigest(),
    }
    (out_dir / "build-manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=True, indent=2, sort_keys=True) + "\n",
        encoding="utf-8", newline="\n",
    )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--circuitpython-dir", type=Path)
    args = parser.parse_args()
    try:
        write_outputs(args.config, args.out, args.circuitpython_dir)
    except (OSError, json.JSONDecodeError, ValueError) as exc:
        parser.error(str(exc))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
