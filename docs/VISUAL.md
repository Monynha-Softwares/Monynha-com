# Monynha Design System Refresh

This document captures the design direction introduced in the latest UI refresh. It serves as a quick reference for typography, colors, component treatments, and interaction guidelines.

## Typography

| Usage | Font family | Weights |
|-------|-------------|---------|
| Headings & brand accents | [Poppins](https://fonts.google.com/specimen/Poppins) | 500–800 |
| Body text & UI copy | [Open Sans](https://fonts.google.com/specimen/Open+Sans) | 400–700 |
| Code snippets | JetBrains Mono | 400–600 |

**Implementation notes**
- Fonts are loaded globally via `index.html` and configured in `tailwind.config.ts` as `font-heading`, `font-brand`, and `font-sans` utilities.
- Headings use tight tracking for a confident voice; paragraphs cap at `max-w-3xl` to protect readability.

## Color Palette

Brand hues focus on a purple→blue core with warm amber accents.

| Token | Light mode | Dark mode | Usage |
|-------|------------|-----------|-------|
| `--primary` | `hsl(262 70% 53%)` | `hsl(262 72% 60%)` | Primary actions, gradients |
| `--secondary` | `hsl(221 85% 56%)` | `hsl(220 70% 65%)` | Secondary buttons, supporting CTAs |
| `--accent` | `hsl(44 95% 52%)` | `hsl(44 95% 56%)` | Highlights and badges |
| `--foreground` | `hsl(232 35% 16%)` | `hsl(210 40% 96%)` | Base text colors |
| `--background` | `hsl(0 0% 100%)` | `hsl(235 32% 8%)` | Page background |

Gradients (`bg-gradient-hero`, `bg-gradient-brand`) blend the new brand purple `#5F2EEA` into vivid blues and cyan, while cards can opt-in to a gradient header via the new `variant="gradient"` on `CardHeader`.

## Buttons

Buttons are powered by `buttonVariants` with rounded-full silhouettes, elevated shadows, and motion feedback:

- **Default**: gradient from `--primary` to `--secondary`, with hover elevation and subtle scale.
- **Outline**: retains color contrast with `border-primary/40` and hover fill.
- **Secondary**: soft blue tint for complementary actions.
- **Accessibility**: `focus-visible` rings persist across variants, disabled state opacity is set to 40%.

Use `size="lg"` for hero CTAs and form submissions to respect the new `px-8 py-4` rhythm.

## Cards

`Card` now exposes variants (`default`, `bordered`, `elevated`, `subtle`) and animated hover states. Pair with:

- `CardHeader` variants including `gradient` for hero-like intros or `muted` for subdued sections.
- Uniform spacing via `px-8` padding and `space-y` utilities.
- `CardContent` and `CardFooter` apply consistent typography and layout gaps.

## Hero & Layout Guidance

- Hero headings scale from `text-4xl` on mobile to `text-6xl` on desktop and use gradient-highlighted spans for key phrases.
- Primary text blocks limit width to `max-w-2xl` or `max-w-3xl` to protect legibility on wide screens.
- Section wrappers should adopt `container` with `py-24` where possible, leveraging Tailwind's responsive spacing utilities (`gap-12`, `space-y-8`).

## Dark Mode

- Dark mode colors keep contrast ratios ≥ 4.5:1 for body text and ≥ 3:1 for UI elements.
- A dedicated `ThemeToggle` component persists preferences to `localStorage` (`monynha-theme`) and works across header, mobile sheet, and in-surface contexts.

## Motion & Interactions

- Buttons scale to 102% on hover and 98% on active, respecting a `duration-200` ease-out curve.
- Cards use `hover:-translate-y-1` and `hover:shadow-soft-lg` for subtle depth.
- Existing `animate-fade-in` keyframe remains available for staged reveals.

## Implementation Checklist

- Use `font-heading` and `font-sans` utilities consistently.
- Prefer `buttonVariants` over bespoke button classes.
- Reach for `Card` variants before crafting ad-hoc card styling.
- When introducing new surfaces, ensure both light and dark tokens meet WCAG AA contrast requirements.

For rapid prototyping, replicate the palette and typography in the [Tailwind Play](https://play.tailwindcss.com/) sandbox by copying `tailwind.config.ts` and `src/index.css` snippets.
