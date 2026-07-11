# ARCHITECTURE.md

## Overview
This app is a local-first desktop cache cleaner.

It scans common cache locations, explains them in simple language, lets the user choose what to clean, and stores scan results so history does not disappear when the page changes.

## Main goals
- One-click cleanup.
- Clear explanation of each cache type.
- Dark modern UI.
- Persistent scan history.
- Safe actions only.
- Fast and lightweight operation.

## High-level structure
- UI layer: dashboard, scan results, explanations, settings, history.
- Logic layer: scan engine, classification, cleanup engine, scoring.
- Storage layer: local database for scans, actions, and settings.
- Safety layer: warnings, confirmations, exclusions, rollback support where possible.

## Recommended data flow
1. User clicks "Scan Now".
2. App scans known cache categories.
3. App normalizes results into structured records.
4. App stores results locally.
5. UI reads the stored scan and renders the dashboard.
6. User selects items or clicks one-click cleanup.
7. Cleanup engine performs safe actions.
8. App writes action results back to storage.

## Core modules
### Scanner
Finds cache files and cache-like data across known locations.

### Cache classifier
Groups findings into user-friendly categories such as browser cache, temporary files, DNS cache, shader cache, and app cache.

### Explanation engine
Turns technical findings into plain-language explanations.

### Cleanup engine
Runs safe deletion or reset actions.

### Storage engine
Saves scan results, cleanup history, settings, and summaries.

### UI renderer
Displays the dashboard, cards, history, details, and warning states.

## Safety boundary
System access should stay in the backend or service layer.
The UI should never directly modify system files.
Every cleanup action should pass through a safety check.

## Suggested database entities
- ScanSession.
- CacheItem.
- CacheCategory.
- CleanupAction.
- UserSetting.
- HistoryEvent.

## Cache categories to support
- Browser cache.
- Cookies and site data.
- Temporary files.
- Windows Update cache.
- DNS cache.
- Microsoft Store cache.
- Thumbnail cache.
- Icon cache.
- Prefetch cache.
- GPU and shader cache.
- App-specific cache.
- Log files.

## UX model
- Home dashboard shows health summary and cleanup button.
- Scan results show cards by cache type.
- Detail panels show explanation, impact, and side effects.
- History shows past scans and cleanup actions.
- Settings control scan behavior, exclusions, and startup behavior.

## Persistence requirements
Scan results must stay visible after leaving the scan page.
The latest scan should load automatically on app start.
The user should be able to review previous scans later.

## Performance requirements
- Scan only known safe paths.
- Keep file traversal efficient.
- Avoid heavy background work.
- Keep startup fast.
- Do not block the UI.

## Extension points
- Add new cache categories without changing the whole app.
- Add new cleanup actions with minimal UI changes.
- Add future export/report features.