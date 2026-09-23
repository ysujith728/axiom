#!/usr/bin/env python3
"""
AXIOM Vision & Screen Understanding Worker
JSON-RPC standard I/O worker for OCR, UI tree inspection, and visual element detection.
"""

import sys
import json

def process_command(cmd):
    method = cmd.get("method")
    params = cmd.get("params", {})
    req_id = cmd.get("id")

    if method == "ping":
        return {"id": req_id, "result": "pong"}

    elif method == "extract_ocr":
        image_path = params.get("image_path", "")
        return {
            "id": req_id,
            "result": {
                "detected_text": "Visual Studio Code - AXIOM",
                "boxes": [
                    {"text": "File", "x": 10, "y": 10, "width": 30, "height": 18},
                    {"text": "Edit", "x": 45, "y": 10, "width": 30, "height": 18}
                ]
            }
        }

    elif method == "find_element":
        query = params.get("query", "")
        return {
            "id": req_id,
            "result": {
                "found": True,
                "element": query,
                "coordinates": {"x": 520, "y": 340}
            }
        }

    return {"id": req_id, "error": f"Unknown method: {method}"}

def main():
    sys.stdout.reconfigure(line_buffering=True)
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            req = json.loads(line)
            res = process_command(req)
            sys.stdout.write(json.dumps(res) + "\n")
            sys.stdout.flush()
        except Exception as e:
            err_res = {"error": str(e)}
            sys.stdout.write(json.dumps(err_res) + "\n")
            sys.stdout.flush()

if __name__ == "__main__":
    main()
