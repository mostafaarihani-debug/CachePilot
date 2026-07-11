# FIX_ACTIONS.md

## Purpose
Define safe, understandable actions the app can offer after a scan.

## Safe actions
- Clear browser cache.
- Clear temporary files.
- Clear DNS cache.
- Clear thumbnail cache.
- Clear Microsoft Store cache.
- Clear selected app cache.
- Clear shader cache when relevant.

## Conditional actions
- Clear cookies only if the user chooses it.
- Clear update cache only when update issues exist.
- Clear prefetch only when the user accepts the possible slowdown.
- Clear icon cache only when icon display issues exist.

## Actions to avoid by default
- Deleting unknown system folders.
- Removing personal files.
- Changing security settings.
- Running silent cleanup without user awareness.
- Clearing cookies without warning.

## Action rules
- Each action needs a plain-language explanation.
- Show expected benefit.
- Show possible side effects.
- Ask for confirmation on sensitive actions.
- Log the result.

## Safety UX pattern
Use this structure:
1. What will happen.
2. Why it matters.
3. What may change.
4. Confirm or cancel.

## Repair flow
If cleanup fails:
- Show the reason.
- Do not panic the user.
- Suggest a safe retry or skip.
- Keep previous scan data intact.