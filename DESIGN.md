# artemis.agent Design System

Dark-first editorial design language for the Artemis AI job hunting agent. Inspired by Vercel Geist typography and getdesign.md's precision aesthetic.

## Brand Identity
- **Name**: `artemis.agent` — lowercase, monospace, dot-separated agent branding
- **Mood**: AI agent that works for you — proactive, precise, dark
- **Tagline**: "The job hunting agent"
- **Voice**: Artemis doesn't browse. It hunts. It matches. It delivers. You just show up.

## Typography
- **Sans**: Geist Sans (400, 500, 600, 700)
- **Mono**: Geist Mono (400, 500, 600)
- **Logo**: Mono with `tracking-[0.12em]` uppercase, pink accent on middle letters
- **Scale**: Very compact — `text-[10px]` badges, `text-[13px]` body, `text-xl` section heads, `text-5xl` hero

## Color Palette
| Token | Color | Usage |
|-------|-------|-------|
| `--background` | `#141416` | Page background |
| `--card` | `#0d0d0d` | Card/surface backgrounds |
| `--foreground` | `#ededed` | Primary text |
| `--muted-foreground` | `#8f8f8f` | Secondary text, labels |
| `--primary` | `#fafafa` | Primary button bg |
| `--primary-foreground` | `#141416` | Primary button text |
| `--secondary` | `rgba(255,255,255,0.08)` | Secondary bg |
| `--accent` | `#ffb1ee` | Links, badges, focus rings |
| `--border` | `rgba(255,255,255,0.10)` | All borders |
| `--input` | `rgba(255,255,255,0.12)` | Input borders |
| `--ring` | `#ffb1ee` | Focus ring |

## Components

### Buttons
- `rounded-sm` (sharp corners)
- `text-xs` default size, `h-8`
- Variants: default (white bg), outline (border), ghost (transparent), secondary (subtle bg)
- Active: `translate-y-px` press-down effect
- Focus: `ring-2 ring-ring/50`

### Cards
- `rounded-lg`, `border border-border`
- `bg-card` with inset shadow: `shadow-[0_1px_2px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)]`
- Hover: `hover:border-white/20`
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
- `bg-black/85 backdrop-blur-sm`
- `border-b border-border`
- Logo: Mono font, `tracking-[0.12em]`, pink accent on middle letters

### Data Display
- Hover rows: `hover:bg-white/[0.04]`
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
