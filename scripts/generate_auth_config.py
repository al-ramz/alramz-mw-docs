#!/usr/bin/env python3
"""Generate overrides/assets/auth/auth-config.js from DOCS_USERNAME / DOCS_PASSWORD.

Run before `mkdocs build`. Reads credentials from the environment (set from the
DOCS_USERNAME / DOCS_PASSWORD GitHub secrets in CI) and writes their salted
SHA-256 hashes into a JS file that the client-side login gate compares
against. Plaintext credentials are never written to disk or committed.
"""

import hashlib
import os
import sys

SALT = "alramz-mw-docs-v1"
OUTPUT_PATH = os.path.join("overrides", "assets", "auth", "auth-config.js")


def sha256_hex(value: str) -> str:
    return hashlib.sha256((SALT + value).encode("utf-8")).hexdigest()


def main() -> int:
    username = os.environ.get("DOCS_USERNAME")
    password = os.environ.get("DOCS_PASSWORD")

    if not username or not password:
        print(
            "ERROR: DOCS_USERNAME and DOCS_PASSWORD must be set in the environment.",
            file=sys.stderr,
        )
        return 1

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w") as f:
        f.write(
            "window.__MWDOCS_AUTH__ = {{\n"
            '  u: "{u}",\n'
            '  p: "{p}"\n'
            "}};\n".format(u=sha256_hex(username), p=sha256_hex(password))
        )

    print("Generated {}".format(OUTPUT_PATH))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
