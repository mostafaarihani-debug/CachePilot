# cache-cleanup Skill

## Purpose
Help the agent scan, classify, explain, and clean cache data safely.

## Responsibilities
- Identify cache categories.
- Explain each cache in simple language.
- Suggest safe cleanup actions.
- Warn about side effects.
- Keep scans persistent and structured.

## Rules
- Prefer known safe cache types.
- Never treat all cache as identical.
- Separate safe actions from conditional actions.
- Use user-friendly labels.
- Always explain what changes after cleanup.

## Output format
When asked to produce cache-related work:
- Show category name.
- Show plain-language explanation.
- Show benefit.
- Show side effect.
- Show safety level.

## Safety levels
- Safe.
- Conditional.
- Sensitive.

## Examples
- Browser cache: Safe.
- Cookies: Conditional.
- Windows Update cache: Conditional.
- User files: Not allowed.

## Success definition
The user should understand what the app found and why cleanup is useful.