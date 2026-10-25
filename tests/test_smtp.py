"""Exercise the real PHP endpoint against a local SMTP sink; never send externally."""
import json
import os
from pathlib import Path
import socketserver
import subprocess
import tempfile
import threading
import unittest


ROOT = Path(__file__).resolve().parents[1]


class SMTPHandler(socketserver.StreamRequestHandler):
    def handle(self):
        self.wfile.write(b"220 local-test ESMTP\r\n")
        while True:
            line = self.rfile.readline()
            if not line:
                return
            command = line.split(b" ", 1)[0].strip().upper()
            if command == b"RCPT" and self.server.reject:
                self.wfile.write(b"550 Recipient rejected for test\r\n")
            elif command == b"DATA":
                self.wfile.write(b"354 End with dot\r\n")
                chunks = []
                while True:
                    line = self.rfile.readline()
                    if line in (b".\r\n", b""):
                        break
                    chunks.append(line)
                self.server.messages.append(b"".join(chunks))
                self.wfile.write(b"250 Accepted\r\n")
            elif command == b"QUIT":
                self.wfile.write(b"221 Bye\r\n")
                return
            else:
                self.wfile.write(b"250 OK\r\n")


class SMTPTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.relay = socketserver.ThreadingTCPServer(("127.0.0.1", 0), SMTPHandler)
        cls.relay.daemon_threads = True
        cls.relay.reject = False
        cls.relay.messages = []
        threading.Thread(target=cls.relay.serve_forever, daemon=True).start()

    @classmethod
    def tearDownClass(cls):
        cls.relay.shutdown()
        cls.relay.server_close()

    def setUp(self):
        self.relay.reject = False
        self.relay.messages.clear()
        self.payload = {
            "enquiry_type": "contact", "name": "Test Visitor",
            "email": "visitor@example.com", "experience": "Safari & beach",
            "travelMonth": "2027-02", "travellers": "2", "message": "Enquiry test",
        }

    def submit(self, changes=None, config=None):
        environment = os.environ | {
            "SWATHONI_MAIL_TO": "swafric.wildfotografie@gmail.com",
            "SWATHONI_SMTP_HOST": "127.0.0.1",
            "SWATHONI_SMTP_PORT": str(self.relay.server_address[1]),
            "SWATHONI_SMTP_AUTH": "false",
            "SWATHONI_SMTP_ENCRYPTION": "none",
            "SWATHONI_SMTP_USERNAME": "",
            "SWATHONI_SMTP_PASSWORD": "",
        } | (config or {})
        code = ('$_SERVER["REQUEST_METHOD"]="POST"; '
                '$_POST=json_decode(stream_get_contents(STDIN),true); '
                'require "api/send-mail.php";')
        result = subprocess.run(
            ["php", "-r", code], cwd=ROOT,
            input=json.dumps(self.payload | (changes or {})),
            env=environment, capture_output=True, text=True, timeout=10, check=True,
        )
        return json.loads(result.stdout), result.stderr

    def test_contact_delivery_and_headers(self):
        response, _ = self.submit()
        self.assertTrue(response["ok"])
        self.assertEqual(len(self.relay.messages), 1)
        message = self.relay.messages[0]
        self.assertIn(b"To: swafric.wildfotografie@gmail.com", message)
        self.assertIn(b"From: Swathoni Travels <visitor@example.com>", message)
        self.assertIn(b"Reply-To: Test Visitor <visitor@example.com>", message)
        self.assertIn(b"Enquiry test", message)

    def test_config_reads_env_from_project_root(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            (root / "api").mkdir()
            (root / "api" / "mail-config.php").write_bytes(
                (ROOT / "api" / "mail-config.php").read_bytes()
            )
            (root / ".env").write_text("SWATHONI_SMTP_HOST=project-root.example\n")
            environment = os.environ.copy()
            environment.pop("SWATHONI_SMTP_HOST", None)
            result = subprocess.run(
                ["php", "-r", '$c=require $argv[1]; echo $c["SWATHONI_SMTP_HOST"];',
                 str(root / "api" / "mail-config.php")],
                env=environment, capture_output=True, text=True, check=True,
            )
            self.assertEqual(result.stdout, "project-root.example")

    def test_experiences_delivery(self):
        response, _ = self.submit({
            "enquiry_type": "experiences", "trip": "Safari & Beach",
            "date": "2027-02-28", "notes": "Experiences enquiry",
        })
        self.assertTrue(response["ok"])
        self.assertIn(b"Experiences enquiry", self.relay.messages[0])

    def test_server_rejection_is_not_reported_as_success(self):
        self.relay.reject = True
        response, log = self.submit()
        self.assertFalse(response["ok"])
        self.assertIn("SMTP", log)
        self.assertFalse(self.relay.messages)

    def test_incomplete_smtp_login_is_rejected(self):
        response, log = self.submit(config={
            "SWATHONI_SMTP_AUTH": "true", "SWATHONI_SMTP_ENCRYPTION": "tls",
            "SWATHONI_SMTP_USERNAME": "sender@example.com",
        })
        self.assertFalse(response["ok"])
        self.assertIn("app password", log)
        self.assertFalse(self.relay.messages)

    def test_invalid_configuration_and_fields_do_not_send(self):
        for field, value in [("email", "bad\r\nBcc: other@example.com"),
                             ("travellers", "0"), ("travelMonth", "2027-13"),
                             ("website", "spam"), ("name", ["array"])]:
            with self.subTest(field=field):
                response, _ = self.submit({field: value})
                self.assertEqual(response["code"], "invalid")
        for field, value in [("SWATHONI_SMTP_PORT", "70000"),
                             ("SWATHONI_SMTP_HOST", "bad;host"),
                             ("SWATHONI_SMTP_ENCRYPTION", "unknown"),
                             ("SWATHONI_SMTP_AUTH", "unknown")]:
            with self.subTest(setting=field):
                response, _ = self.submit(config={field: value})
                self.assertFalse(response["ok"])
        self.assertFalse(self.relay.messages)


if __name__ == "__main__":
    unittest.main()
