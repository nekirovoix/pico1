import json
import tempfile
import unittest
from pathlib import Path

from generator.generate import render_board_mk, render_boot_py, validate_config, write_outputs

BASE = {
    "circuitpython_version": "10.3.0",
    "source_board": "raspberry_pi_pico",
    "target_board": "classroom_studio_pico",
    "usb_manufacturer": "Classroom Studio",
    "usb_product": "Classroom Studio",
    "usb_vid": "0x239A",
    "usb_pid": "0x80F4",
    "serial_prefix": "CLASSROOM-",
    "drive_label": "CLASSROOM",
    "maintenance_pin": "GP3",
    "drive_mode": "maintenance",
    "language": "en_US",
}


class ValidationTests(unittest.TestCase):
    def test_default_is_valid(self):
        self.assertEqual(validate_config(BASE)["usb_vid"], "0x239A")

    def test_rejects_non_ascii_usb_name(self):
        cfg = {**BASE, "usb_product": "کلاس"}
        with self.assertRaisesRegex(ValueError, "ASCII"):
            validate_config(cfg)

    def test_rejects_bad_vid(self):
        with self.assertRaisesRegex(ValueError, "usb_vid"):
            validate_config({**BASE, "usb_vid": "239A"})

    def test_rejects_bad_label(self):
        with self.assertRaisesRegex(ValueError, "drive_label"):
            validate_config({**BASE, "drive_label": "too long label"})

    def test_rejects_unsafe_pin(self):
        with self.assertRaisesRegex(ValueError, "conflicts"):
            validate_config({**BASE, "maintenance_pin": "GP25"})

    def test_drive_modes_are_distinct(self):
        maintenance = render_boot_py(BASE)
        hidden = render_boot_py({**BASE, "drive_mode": "hidden"})
        always = render_boot_py({**BASE, "drive_mode": "always"})
        self.assertIn("board.GP3", maintenance)
        self.assertIn("disable_usb_drive", hidden)
        self.assertNotIn("disable_usb_drive", always)

    def test_usb_strings_are_c_literals(self):
        board_mk = render_board_mk(BASE)
        self.assertIn('USB_PRODUCT = "Classroom Studio"', board_mk)
        self.assertIn('USB_MANUFACTURER = "Classroom Studio"', board_mk)

    def test_writes_auditable_outputs(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            config = root / "config.json"
            config.write_text(json.dumps(BASE), encoding="utf-8")
            out = root / "dist"
            write_outputs(config, out)
            self.assertTrue((out / "boot.py").is_file())
            manifest = json.loads((out / "build-manifest.json").read_text())
            self.assertEqual(manifest["configuration"]["target_board"], "classroom_studio_pico")


if __name__ == "__main__":
    unittest.main()
