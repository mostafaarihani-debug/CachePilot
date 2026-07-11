# CLAUDE.md

## Project
Build a modern desktop app that lets users clean cache files in one click.

## Product goal
Create a fast, trustworthy, easy-to-understand cache cleaner for PC users.

## Core principles
- Keep the UI dark, modern, and polished.
- Use simple language the average user understands.
- Explain every cache type clearly.
- Prefer safe defaults.
- Make cleanup actions reversible when possible.
- Store scan results locally so the user can see history.
- Never pretend a cache is harmless if it may sign the user out or reset preferences.

## Developer behavior
- Work in small, testable steps.
- Prefer clarity over cleverness.
- Do not add features without updating docs.
- Keep the app lightweight.
- Separate scanning, explanation, and cleanup logic.
- Use local-first storage.
- Treat safety and transparency as first-class features.

## UI direction
- Dark PC-optimizer style.
- Smooth cards, soft glow accents, clean typography.
- Strong contrast and readable text.
- Friendly but professional tone.
- No clutter, no white-heavy screens.

## Content rules
- Explain what each cache type is.
- Explain why it exists.
- Explain what the user gains by cleaning it.
- Explain possible side effects in plain language.
- Mark risky actions clearly.

## Output rules
When generating code or docs:
- Keep files modular.
- Keep names descriptive.
- Avoid massive files.
- Prefer reusable components.
- Keep copy short and clear.

## Priority order
1. Safety.
2. Understandability.
3. Visual quality.
4. Performance.
5. Extra polish.

## Default tech direction
- Desktop app.
- Local data storage.
- Modern web UI.
- Simple settings.
- One-click cleanup flow.