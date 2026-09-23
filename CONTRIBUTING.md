# Contributing to AXIOM

Thank you for your interest in contributing to **AXIOM**! We welcome contributions that advance local-first, privacy-respecting AI desktop automation.

---

## 1. Development Principles

- **No Placeholders**: Never submit stub functions pretending to work.
- **Verification Mandatory**: Any new tool must implement an independent post-condition `verify()` method.
- **Respect Hardware Limits**: AXIOM is designed to run efficiently on standard consumer hardware (e.g. 16GB RAM, 2GB VRAM). Keep CPU/GPU overhead minimal.
- **Privacy First**: Never introduce cloud dependencies, telemetry, or external API calls for core functionality.

---

## 2. Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat(scope): add new filesystem batch search tool`
- `fix(agent): resolve permission retry race condition`
- `security(permissions): enforce strict path boundaries on deletion`
- `docs(readme): add voice pipeline architecture diagram`
- `test(memory): add tests for category queries`
- `chore(repo): update dependencies and build scripts`

---

## 3. Pull Request Process

1. Fork the repository and create your branch from `main`.
2. Ensure all tests and type checks pass:
   ```bash
   npm run typecheck
   npm run test
   ```
3. Submit your pull request with a concise description of the changes and how you verified them.
