# AXIOM Developer Guide

This document outlines development practices, setup workflows, and engineering standards for building and extending AXIOM.

---

## 1. Core Engineering Principles

1. **Inspect Before Modifying**: Always read and verify existing architecture before adding or editing code.
2. **Small Modular Components**: Avoid giant multi-thousand-line files. Decompose responsibilities into dedicated packages.
3. **No Fake Functionality**: Never simulate success, fake tool results, or mock metrics in production pathways.
4. **Verification-First**: Every tool must have a post-condition verification strategy. Never assume a command succeeded.
5. **No Hardcoded Machine Paths**: Never hardcode user directories, machine-specific absolute paths, or credentials.
6. **Hardware Awareness**: Respect target hardware budgets (16GB RAM, 2GB VRAM). Never default to unquantized heavy models.
7. **Offline-Capable Core**: Core tools, memory, filesystem, and model runtime must function without active internet.
8. **Replaceable Providers**: AI models, voice engines, and tools must sit behind abstract interfaces.

---

## 2. Prerequisites & Environment

- **Operating System**: Windows 10/11
- **Node.js**: `v20.0.0` or higher (`v24.x` recommended)
- **npm**: `v10.0.0` or higher
- **Python**: `3.10+` (for optional voice and vision workers)
- **Git**: `2.40+`
- **GitHub CLI**: (`gh`) for repository management

---

## 3. Monorepo Scripts

```bash
# Install workspace dependencies
npm install

# Run strict TypeScript check across all packages
npm run typecheck

# Run unit and integration test suite
npm run test

# Launch desktop development shell (Vite + Electron)
npm run desktop:dev

# Build production distribution
npm run desktop:build
```

---

## 4. How to Add a New Tool

1. Create a new tool file in `packages/tools/src/tools/my_tool.ts`.
2. Define the tool adhering to the `ExecutableTool` interface:
   ```typescript
   export const MyTool: ExecutableTool = {
     name: 'my_tool',
     description: 'Clear description of tool purpose',
     tier: 'SAFE', // or 'LOW_RISK', 'CONFIRMATION_REQUIRED', 'DANGEROUS'
     async execute(params) {
       // Real execution logic
     },
     async verify(params, result) {
       // Independent post-condition check
       return { verified: true, evidence: 'Verified evidence' };
     }
   };
   ```
3. Register the tool in `packages/tools/src/index.ts` within `ToolRegistry.registerDefaults()`.
4. Add a unit test verifying both execution and post-condition evidence in `tests/unit/tools.test.ts`.
