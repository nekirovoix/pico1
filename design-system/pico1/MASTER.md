# Pico1 live configurator design system

## Direction

A trustworthy technical configurator for Persian-speaking makers and classroom operators. The interface uses a calm dark control-panel style, clear staged progression, and visible safety guidance without decorative distraction.

Design dials: variance 4/10, motion 2/10, density 5/10.

## Tokens

- Background: `#07111f`; elevated surface: `#101f34`; secondary surface: `#152840`.
- Primary action: `#50c8b4`; accent/link: `#8da8ff`.
- Text: `#f4f7fb`; muted text: `#aebdd0`; border: `#29405d`.
- Success: `#79ddb0`; warning: `#ffd27a`; error: `#ff7f87`; focus: `#f8dc75`.
- Base spacing unit: 8px. Radius: 10px controls, 16px panels.
- Typography: Tahoma/Segoe UI system stack; 16px body; 1.65 line height.

## Interaction

- Minimum control height is 46px and mobile actions become full width.
- Every field keeps a visible label, helper text, and adjacent error region.
- Keyboard focus uses a high-contrast 3px focus indicator.
- Validation runs locally and disables export actions until valid.
- User input persists only in browser local storage; no credentials are accepted.
- Reduced-motion preferences disable smooth scrolling and transitions.

## Responsive behavior

- Wide screens use a form plus sticky JSON preview.
- Below 960px, preview moves below the form.
- Below 680px, fields, modes, actions, and process steps collapse to one or two columns without horizontal scrolling.

## Anti-patterns

Do not add hidden labels, placeholder-only instructions, token collection, auto-flashing, color-only validation, tiny icon-only actions, or animations unrelated to state changes.
