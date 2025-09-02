# Git Commit Message Convention

## 1. Commit Types

- **feat**: A new feature for the user.
- **fix**: A bug fix for the user.
- **docs**: Changes to documentation only (e.g., README, code comments, Wiki).
- **style**: Changes that do not affect the meaning of the code (e.g., white-space, formatting, missing semi-colons).
- **refactor**: A code change that neither fixes a bug nor adds a feature.
- **chore**: Repetitive tasks that don't affect production code (e.g., build scripts, package manager configurations).
- **perf**: A code change that improves performance.
- **ci**: Changes to CI configuration files and scripts.
- **release**: Used when creating a new release (e.g., version tagging).

---

## 2. Commit Message Structure

A commit message consists of a header, an optional body, and an optional footer.
```text
<type>(optional scope): <subject>

(optional) body

(optional) footer (e.g., issue tracking numbers, breaking change notices)
```
### Rules

1.  **Subject**: The subject line must not end with a period.
2.  **Body**: The body is optional. When used, it should explain the *what* and *why* of the change, not the *how*.
3.  **Footer**: The footer is optional. It should contain references to any issues the commit addresses (e.g., `Closes #123`, `Fixes #456`).
4.  **Language**: All commit messages must be written in Korean.