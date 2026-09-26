#!/usr/bin/env python3
"""Apply the configured USB serial prefix to a CircuitPython source checkout."""
import argparse
import json
from pathlib import Path


def patch(source: Path, prefix: str) -> None:
    path = source / "supervisor" / "shared" / "usb" / "usb_desc.c"
    text = path.read_text(encoding="utf-8")
    marker = "// pico1 serial-prefix patch"
    if marker in text:
        raise ValueError("serial-prefix patch is already present")

    old_decl = "static char serial_number_hex_string[COMMON_HAL_MCU_PROCESSOR_UID_LENGTH * 2 + 1];"
    c_prefix = json.dumps(prefix, ensure_ascii=True)
    new_decl = "\n".join([
        marker,
        f"#define PICO1_USB_SERIAL_PREFIX {c_prefix}",
        "static char serial_number_hex_string[(sizeof(PICO1_USB_SERIAL_PREFIX) - 1) + COMMON_HAL_MCU_PROCESSOR_UID_LENGTH * 2 + 1];",
    ])
    if old_decl not in text:
        raise ValueError("unsupported CircuitPython usb_desc.c declaration")
    text = text.replace(old_decl, new_decl, 1)

    old_loop = """    for (int i = 0; i < COMMON_HAL_MCU_PROCESSOR_UID_LENGTH; i++) {
        for (int j = 0; j < 2; j++) {
            uint8_t nibble = (raw_id[i] >> (j * 4)) & 0xf;
            serial_number_hex_string[i * 2 + (1 - j)] = nibble_to_hex_upper[nibble];
        }
    }

    // Null-terminate the string.
    serial_number_hex_string[sizeof(serial_number_hex_string) - 1] = '\\0';"""
    new_loop = """    const size_t pico1_prefix_length = sizeof(PICO1_USB_SERIAL_PREFIX) - 1;
    memcpy(serial_number_hex_string, PICO1_USB_SERIAL_PREFIX, pico1_prefix_length);
    for (int i = 0; i < COMMON_HAL_MCU_PROCESSOR_UID_LENGTH; i++) {
        for (int j = 0; j < 2; j++) {
            uint8_t nibble = (raw_id[i] >> (j * 4)) & 0xf;
            serial_number_hex_string[pico1_prefix_length + i * 2 + (1 - j)] = nibble_to_hex_upper[nibble];
        }
    }

    // Null-terminate the string.
    serial_number_hex_string[sizeof(serial_number_hex_string) - 1] = '\\0';"""
    if old_loop not in text:
        raise ValueError("unsupported CircuitPython serial-number generation code")
    path.write_text(text.replace(old_loop, new_loop, 1), encoding="utf-8", newline="\n")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", type=Path, required=True)
    parser.add_argument("--circuitpython-dir", type=Path, required=True)
    args = parser.parse_args()
    config = json.loads(args.config.read_text(encoding="utf-8"))
    patch(args.circuitpython_dir, config["serial_prefix"])
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
