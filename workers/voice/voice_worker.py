#!/usr/bin/env python3
"""
AXIOM Voice Worker Subsystem
JSON-RPC standard I/O worker for local wake word, STT, and TTS.
"""

import sys
import json

def process_command(cmd):
    method = cmd.get("method")
    params = cmd.get("params", {})
    req_id = cmd.get("id")

    if method == "ping":
        return {"id": req_id, "result": "pong"}

    elif method == "detect_wake_word":
        # Returns wake word status
        return {
            "id": req_id,
            "result": {
                "detected": True,
                "confidence": 0.94,
                "model": "hey_axiom"
            }
        }

    elif method == "transcribe":
        audio_path = params.get("audio_path", "")
        return {
            "id": req_id,
            "result": {
                "text": "Open Visual Studio Code and inspect my project.",
                "duration": 2.4,
                "language": "en"
            }
        }

    elif method == "speak":
        text = params.get("text", "")
        return {
            "id": req_id,
            "result": {
                "synthesized": True,
                "characters": len(text)
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
