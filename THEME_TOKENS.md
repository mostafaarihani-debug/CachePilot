# THEME_TOKENS.md

## Purpose
Define the theme tokens for CachePilot so CSS and Tailwind both use the same design language.

This file keeps color, spacing, radius, shadows, and state styles consistent across the app.

## Theme strategy
Use semantic design tokens instead of hardcoding colors in components.

Recommended flow:
1. Define raw values in CSS variables.
2. Map those variables into semantic tokens.
3. Reference the semantic tokens in Tailwind.
4. Override the values in dark mode using a `.dark` class or theme attribute.

## Dark mode approach
Use a class-based dark mode strategy.

Recommended selector:
- `.dark` on the root element.

This makes it easy to switch themes manually and keep styling predictable.

## CSS variables
Place these in your global CSS file.

```css
:root {
  --bg: 15 17 21;
  --bg-elevated: 21 26 33;
  --surface: 26 32 40;
  --surface-2: 33 40 53;
  --surface-3: 42 50 64;

  --text: 232 237 245;
  --text-secondary: 169 180 194;
  --text-muted: 116 130 148;
  --text-disabled: 85 96 110;

  --border: 43 52 65;
  --border-strong: 58 70 86;

  --primary: 77 163 255;
  --secondary: 39 211 181;
  --success: 56 210 122;
  --warning: 245 184 74;
  --danger: 255 107 107;

  --shadow: 0 0 0;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
}
```

```css
.dark {
  --bg: 15 17 21;
  --bg-elevated: 21 26 33;
  --surface: 26 32 40;
  --surface-2: 33 40 53;
  --surface-3: 42 50 64;

  --text: 232 237 245;
  --text-secondary: 169 180 194;
  --text-muted: 116 130 148;
  --text-disabled: 85 96 110;

  --border: 43 52 65;
  --border-strong: 58 70 86;

  --primary: 77 163 255;
  --secondary: 39 211 181;
  --success: 56 210 122;
  --warning: 245 184 74;
  --danger: 255 107 107;
}
```

## Semantic token mapping
Use semantic tokens in your components instead of raw values.

### Background tokens
- `--color-bg` → app background.
- `--color-bg-elevated` → raised panels.
- `--color-surface` → cards and containers.
- `--color-surface-2` → hover surfaces.
- `--color-surface-3` → strong surfaces.

### Text tokens
- `--color-text` → primary text.
- `--color-text-secondary` → helper text.
- `--color-text-muted` → metadata.
- `--color-text-disabled` → disabled text.

### Border tokens
- `--color-border` → default borders.
- `--color-border-strong` → active borders.

### Brand tokens
- `--color-primary` → main CTA, focus, charts.
- `--color-secondary` → support accent.
- `--color-success` → safe success states.
- `--color-warning` → caution states.
- `--color-danger` → risk and destructive states.

## Tailwind integration
Add these tokens to your Tailwind config so you can use classes like `bg-bg`, `text-text`, and `border-border`.

### Example Tailwind config
```js
export default {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--bg) / <alpha-value>)",
        "bg-elevated": "rgb(var(--bg-elevated) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        "surface-2": "rgb(var(--surface-2) / <alpha-value>)",
        "surface-3": "rgb(var(--surface-3) / <alpha-value>)",

        text: "rgb(var(--text) / <alpha-value>)",
        "text-secondary": "rgb(var(--text-secondary) / <alpha-value>)",
        "text-muted": "rgb(var(--text-muted) / <alpha-value>)",
        "text-disabled": "rgb(var(--text-disabled) / <alpha-value>)",

        border: "rgb(var(--border) / <alpha-value>)",
        "border-strong": "rgb(var(--border-strong) / <alpha-value>)",

        primary: "rgb(var(--primary) / <alpha-value>)",
        secondary: "rgb(var(--secondary) / <alpha-value>)",
        success: "rgb(var(--success) / <alpha-value>)",
        warning: "rgb(var(--warning) / <alpha-value>)",
        danger: "rgb(var(--danger) / <alpha-value>)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0, 0, 0, 0.18)",
        glow: "0 0 0 1px rgba(77, 163, 255, 0.18), 0 10px 30px rgba(77, 163, 255, 0.12)",
      },
    },
  },
};
```

## CSS usage examples
```css
.app-shell {
  background: rgb(var(--bg));
  color: rgb(var(--text));
}

.card {
  background: rgb(var(--surface));
  border: 1px solid rgb(var(--border));
  border-radius: var(--radius-lg);
}

.card-title {
  color: rgb(var(--text));
}

.card-subtitle {
  color: rgb(var(--text-secondary));
}
```

## Tailwind usage examples
```html
<div class="bg-bg text-text border border-border rounded-lg shadow-soft">
  <h2 class="text-text">Scan Summary</h2>
  <p class="text-text-secondary">Your cache results are ready.</p>
</div>
```

```html
<button class="bg-primary text-white rounded-md px-4 py-2 shadow-glow">
  Scan Now
</button>
```

## State styling rules
- Use `primary` for main actions and focus.
- Use `success` for completed cleanup.
- Use `warning` for conditional cleanup.
- Use `danger` for destructive actions.
- Never use red unless the action is truly risky.

## Accessibility rules
- Keep text contrast high.
- Use color plus label for status.
- Do not rely on color alone to explain meaning.
- Make focus states visible.
- Keep hover states subtle but noticeable.

## Component guidance
### Dashboard cards
Use `surface` with `border` and `text-secondary`.

### Primary actions
Use `primary` with strong contrast text.

### Risk panels
Use `warning` or `danger` only when needed.

### History items
Use muted surfaces and secondary text.

## Do not do
- Do not hardcode random hex colors in components.
- Do not mix Tailwind gray scales with semantic tokens without a reason.
- Do not use pure white backgrounds in the main app shell.
- Do not introduce too many accents.

## Implementation note
Keep all visual decisions tied to these tokens so future theme updates require only token changes, not component rewrites.