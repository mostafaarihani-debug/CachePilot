# TESTING.md

## Purpose
Define how to test scanning, cleanup, storage, and UI behavior.

## Functional tests
- Scan returns cache categories correctly.
- Scan results persist after navigation.
- Latest scan loads on startup.
- Cleanup removes only selected categories.
- Cleanup history is stored correctly.

## UI tests
- Dark theme stays consistent.
- Text is readable on all surfaces.
- Cards and buttons are easy to scan.
- Warning states are visible.
- Empty states explain what to do next.

## Safety tests
- Sensitive actions require confirmation.
- Cookies are not cleared unless selected.
- No user files are deleted.
- Unknown folders are not touched.
- Failed cleanup does not destroy scan history.

## Persistence tests
- Close and reopen app.
- Verify results still exist.
- Verify latest scan is restored.
- Verify history list remains intact.

## Performance tests
- Startup remains fast.
- Scan stays lightweight.
- UI remains responsive during scan.
- Large result sets render smoothly.

## Copy tests
- Each cache type has simple explanation text.
- No jargon without explanation.
- Labels are short and understandable.
- Buttons use clear verbs.

## Regression tests
- Theme does not break after data refresh.
- History still works after cleanup.
- Scan output does not disappear when leaving page.
- The same scan can be viewed again later.