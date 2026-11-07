# artemis.agent Design System

Editorial design language (light by default, with a matching dark theme) for the Artemis AI job hunting agent. Inspired by Vercel Geist typography and getdesign.md's precision aesthetic.

## Brand Identity
- **Name**: `artemis.agent` — lowercase, monospace, dot-separated agent branding
- **Mood**: AI agent that works for you — proactive, precise
- **Tagline**: "The job hunting agent"
- **Voice**: Artemis doesn't browse. It hunts. It matches. It delivers. You just show up.

## Typography
- **Sans**: Geist Sans (400, 500, 600, 700)
- **Mono**: Geist Mono (400, 500, 600)
- **Logo**: Mono with `tracking-[0.12em]` uppercase, pink accent on middle letters
- **Scale**: Very compact — `text-[10px]` badges, `text-[13px]` body, `text-xl` section heads, `text-5xl` hero

## Color Palette
All colours are CSS custom properties in `src/app/globals.css`. `:root` holds the light theme (the default); the `.dark` class on an ancestor (e.g. `<html class="dark">`) switches to the dark theme. Components use tokens only; never hardcode `white`/`black` or hex values.

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--background` | `#fafafa` | `#141416` | Page background |
| `--card` | `#ffffff` | `#0d0d0d` | Card/surface backgrounds |
| `--foreground` | `#161618` | `#ededed` | Primary text |
| `--muted-foreground` | `#6b6b70` | `#8f8f8f` | Secondary text, labels |
| `--primary` | `#141416` | `#fafafa` | Primary button bg |
| `--primary-foreground` | `#fafafa` | `#141416` | Primary button text |
| `--secondary` | `rgba(0,0,0,0.05)` | `rgba(255,255,255,0.08)` | Secondary bg |
| `--accent` | `#c0168f` | `#ffb1ee` | Links, badges, focus rings |
| `--border` | `rgba(0,0,0,0.10)` | `rgba(255,255,255,0.10)` | All borders |
| `--input` | `rgba(0,0,0,0.14)` | `rgba(255,255,255,0.12)` | Input borders |
| `--ring` | `#c0168f` | `#ffb1ee` | Focus ring |
| `--nav` | `#ffffff` | `#000000` | Sticky nav, used as `bg-nav/85` |
| `--overlay` | `#000000` | `#ffffff` | Hover tints: `hover:bg-overlay/5`, `hover:border-overlay/20` |
| `--card-shadow`, `--popover-shadow` | soft drop | deep drop + inset | `shadow-(--card-shadow)` |
| `--scanline` | `rgba(0,0,0,0.035)` | `rgba(255,255,255,0.03)` | Landing hero texture |

## Components

### Buttons
- `rounded-sm` (sharp corners)
- `text-xs` default size, `h-8`
- Variants: default (white bg), outline (border), ghost (transparent), secondary (subtle bg)
- Active: `translate-y-px` press-down effect
- Focus: `ring-2 ring-ring/50`

### Cards
- `rounded-lg`, `border border-border`
- `bg-card` with `shadow-(--card-shadow)`
- Hover: `hover:border-overlay/20`
- Size variants: default, sm

### Badges
- `rounded-full`, `text-[10px]` font-semibold
- Variant `accent`: `border-accent text-accent bg-transparent` (pink outline)
- Variant `secondary`: subtle bg
- Variant `outline`: `border-border bg-transparent`

### Inputs
- `rounded-sm`, `h-8`, `bg-card`, `border border-border`
- Focus: `border-accent ring-1 ring-accent/30`
- Placeholder: `text-muted-foreground`

### Header/Nav
- Height: `h-[68px]`
- `bg-nav/85 backdrop-blur-sm`
- `border-b border-border`
- Logo: Mono font, `tracking-[0.12em]`, pink accent on middle letters

### Data Display
- Hover rows: `hover:bg-overlay/[0.04]`
- Separators: `border-t border-border`
- Small uppercase labels: `text-[11px] uppercase tracking-wider text-muted-foreground`

## Layout
- Content max-width: `max-w-5xl`
- Auth forms: `max-w-sm`, centered
- Dashboard: `max-w-5xl mx-auto px-6`
- Two-column: `flex flex-col md:flex-row gap-12` (sidebar 240px + content)

## Tech Stack
- **Next.js 16.2** (App Router) + **React 19**
- **Tailwind CSS v4** with CSS custom properties via `@theme inline`
- **shadcn/ui** (Base UI components, base-nova style)
- Fonts loaded via `@fontsource/geist-sans` and `@fontsource/geist-mono`
- All color tokens defined as CSS custom properties in `src/app/globals.css`
