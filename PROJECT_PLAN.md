# AXIOM Project Roadmap & Execution Plan

This document outlines the phased development roadmap for AXIOM, tracking progress from architecture foundation through to release engineering.

---

## Roadmap Phases & Current Status

| Phase | Subsystem / Objective | Key Deliverables | Status |
| :--- | :--- | :--- | :--- |
| **Phase 0** | **Repository & Architecture** | Monorepo structure, TypeScript configs, security & architecture documentation | **COMPLETED** |
| **Phase 1** | **Desktop Shell Foundation** | Electron main/preload separation, secure IPC channels, window lifecycle | **COMPLETED** |
| **Phase 2** | **Futuristic Command UI** | Liquid Intelligence Canvas Core, real-time activity stream, dark glass theme | **COMPLETED** |
| **Phase 3** | **Agent Runtime & Planner** | Multi-step execution loop, state machine, failure recovery, cancellation | **COMPLETED** |
| **Phase 4** | **Tool Registry & Verification** | Tool dispatcher, pre-condition validation, post-condition evidence verifiers | **COMPLETED** |
| **Phase 5** | **4-Tier Permission Engine** | SAFE auto-approval, CONFIRMATION_REQUIRED, DANGEROUS deletion gates, audit log | **COMPLETED** |
| **Phase 6** | **Filesystem & Terminal Tools** | Real file CRUD, search, PowerShell execution with safety boundaries | **COMPLETED** |
| **Phase 7** | **Windows & Desktop Control** | Active window enumeration, application launch adapters (VS Code, Chrome, etc.) | **COMPLETED** |
| **Phase 8** | **Local AI & Model Management** | Ollama integration, streaming completion, hardware-aware fallback | **COMPLETED** |
| **Phase 9** | **Browser Automation** | Playwright web automation contracts, read-only vs form submission gates | **IN PROGRESS** |
| **Phase 10** | **Git & GitHub Integration** | Working tree inspection, diffs, safe commits, push verification | **COMPLETED** |
| **Phase 11** | **Development Assistant** | Codebase inspection, automatic test detection, build error diagnostics | **COMPLETED** |
| **Phase 12** | **Voice Pipeline** | Wake-word ("Axiom") state machine, audio visualization, STT/TTS contracts | **COMPLETED** |
| **Phase 13** | **Vision & Screen OCR** | Desktop screenshots, window OCR inspection, visual evidence comparison | **IN PROGRESS** |
| **Phase 14** | **Persistent Local Memory** | SQLite/JSON persistent store, categorized memories, transparent privacy controls | **COMPLETED** |
| **Phase 15** | **Task Manager & Scheduler** | Immediate & background task tracking, reminders, progress telemetry | **COMPLETED** |
| **Phase 16** | **Self-Diagnostics & Health** | Hardware resource monitor (CPU, RAM, GPU, VRAM), Ollama health checks | **COMPLETED** |
| **Phase 17** | **Security Hardening** | Strict credential redaction, path traversal boundaries, sandboxed renderer | **COMPLETED** |
| **Phase 18** | **Performance Optimization** | Low-CPU fluid Canvas rendering, non-blocking asynchronous tool execution | **COMPLETED** |
| **Phase 19** | **Testing & Quality Gates** | Unit and integration test suites covering agent, tools, permissions, memory | **COMPLETED** |
| **Phase 20** | **Release & Windows Installer** | Electron builder packaging, Setup.exe distribution, clean uninstallation | **PLANNED** |

---

## Validation Milestones

- **Milestone A (Architecture & Core Foundation)**: Monorepo compiles under strict TypeScript; unit tests pass for permissions, tools, and memory.
- **Milestone B (Interactive Agent Loop)**: Agent decomposes natural-language commands, prompts for approval on risky operations, executes real tools, and verifies post-condition evidence.
- **Milestone C (Desktop Experience)**: Liquid Intelligence Core responds dynamically to agent states with fluid 60fps animations on target hardware.
