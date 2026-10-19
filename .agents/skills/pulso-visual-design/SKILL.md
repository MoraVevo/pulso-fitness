---
name: pulso-visual-design
description: Use when creating or changing Pulso screens, layout, controls, color, type, charts, or responsive styling. Follow the existing calm, botanical visual language in the app.
---

# Pulso visual language

Pulso should look like a calm personal wellness journal: bright, approachable, and grounded in muted botanical colors. Training visuals may use stronger blue, while still feeling part of the same app. Avoid an aggressive bodybuilding aesthetic, clinical dashboards, decorative gradients, heavy shadows, and dense panels that compete with the user’s records.

## Existing design tokens

`dist/styles.css` is the source of truth. Reuse its custom properties and type before adding new values:

- Background `--bg` `#f6f7f3`; surfaces `--paper` `#fff`; text `--ink` `#263b32`; secondary text `--muted` `#7b847e`; borders `--line` `#e8ece5`.
- Forest primary `--green` `#315b46`, pale lime `--lime` `#deedb7`, soft sage `--soft` `#edf3e6`, restrained orange `--orange` `#df9b6c`, and blue `--blue` `#8da5b8`.
- Body text uses DM Sans and display headings use Manrope. Both load through the stylesheet with system fallback behavior.
- Cards use the existing white surface, subtle border, generous internal spacing, and `--radius` of 20px. Preserve a clear hierarchy between page title, section title, short helper text, and data.

## Layout and interaction

- Keep desktop navigation and page composition consistent with the existing sidebar and content region. On small screens, respect the current compact layout and bottom navigation instead of shrinking desktop panels into a narrow column.
- Prefer existing buttons, cards, tags, form fields, and icon helpers over introducing parallel styles. Use the existing SVG icon system and the current Pulso mark.
- Keep form controls readable on phones. Existing input sizing and viewport behavior are deliberate; check surrounding mobile rules before changing them.
- The workout set editor is designed for one-handed use while tired. Show compact Carga, Reps, and RIR fields in each set; tapping a field opens a vertical, inertial scroll wheel in a modal bottom sheet on phones. The user should swipe to move directly through values (for example, from 10 kg to 100 kg), then confirm with Listo; do not require repeated increment clicks. Keep kg/lb selection inside the load picker, preserve empty values where supported, and keep generous targets for adding or removing a set.
- Use color as a signal alongside text, shape, or position. Preserve clear keyboard focus and readable contrast.
- Charts should answer a specific diary question and remain legible at mobile width. Don’t turn missing days into zero values simply to fill a chart.
- Avoid adding ornament that makes recording slower or obscures the data. Small illustrations can add warmth when they still explain the exercise at the size shown.

## Before editing

Inspect the relevant CSS and its rendered screen so the change fits the real component. Extend the existing tokens or component styles where possible; keep component specific additions local and responsive. If the change substantially alters the visual language, explain the decision in context instead of silently replacing the palette or typography.
