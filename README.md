# Pico Firmware Generator

A validated, reproducible CircuitPython firmware generator and safe Windows preparation app for Raspberry Pi Pico.

## Live configurator

Open the Persian live form at **https://nekirovoix.github.io/pico1/** to customize, validate, preview, copy, and download the firmware configuration without installing anything.

## What it builds

- custom CircuitPython `.uf2`
- generated `boot.py`
- canonical configuration and auditable build manifest
- SHA-256 checksums
- packaged Electron application for Windows x64
- source archive for releases

See [README-fa.md](README-fa.md) for Persian instructions.

## Quick start

```bash
python3 -m unittest discover -s tests -v
python3 generator/generate.py --config config/default.json --out generator/dist
```

For a full UF2 build, run the **Build firmware and Windows app** GitHub Actions workflow. Linux builds CircuitPython; Windows packages the Electron application using the exact firmware artifact from the same run.

## Safety

The Windows app recognizes only `RPI-RP2`, `CIRCUITPY`, `CLASSROOM`, or the configured drive label. UF2 flashing is restricted to the exact `RPI-RP2` label and requires explicit confirmation. It verifies SHA-256 before copying, backs up an existing `boot.py` once, and performs no formatting or general deletion.

> [!WARNING]
> The example VID/PID `0x239A / 0x80F4` belongs to Adafruit. Production devices require a VID/PID you are legally permitted to use.

Drive hiding is not encryption or secure boot. BOOTSEL continues to expose `RPI-RP2` through the RP2040 ROM.

Never commit personal access tokens or other credentials.
