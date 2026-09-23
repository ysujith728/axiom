# AXIOM Voice Worker Subsystem

This worker handles offline voice processing for AXIOM on Windows.

## Pipeline Architecture
- **Wake Word Detection**: `openWakeWord` configured with the wake phrase **"Axiom"**.
- **Speech-to-Text (STT)**: `faster-whisper` (utilizing CPU int8 or GPU float16 based on resource detection).
- **Text-to-Speech (TTS)**: `piper-tts` with high-speed local onnx neural voices.

## Communication
- Operates as a child process managed by `@axiom/voice`.
- Communicates via JSON-RPC over stdin/stdout pipes.
