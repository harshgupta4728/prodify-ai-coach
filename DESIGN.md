# Prodify design guide

Prodify looks like a developer tool: dark, calm, dense, with one accent colour. Follow these rules for any
new screen or change, so the app stays consistent.

## Colour
Use the tokens from `src/index.css` through Tailwind classes. Never use Tailwind's fixed hues
(`bg-blue-100`, `text-orange-500`, `border-green-200`, ...), `text-white`/`bg-white`, or gradients.

| Use | Classes |
| --- | --- |
| Page / panels | `bg-background`, `bg-card` (via `<Card>`), `bg-muted` for inset fills |
| Text | `text-foreground`, `text-muted-foreground` |
| Borders | `border` (1px, `border-border`) |
| Hover / selected | `bg-accent` |
| The one main action of a view, progress, focus | `primary` (`<Button>` default, `text-primary`, `bg-primary/15`) |
| Solved, accepted, easy, correct | `text-success`, `bg-success/10`, `border-success/30` |
| Medium, due soon, in progress | `text-warning`, `bg-warning/10`, `border-warning/30` |
| Hard, errors, overdue, delete | `text-destructive`, `bg-destructive/10`, `border-destructive/30` |

Colour must mean something. Categories, tags and topics are neutral (`chip`). The accent can be changed in
Settings, so never hard-code green.

## Building blocks
- `PageHeader` (title, description, actions) at the top of every page.
- `StatTile` for numbers in a `grid grid-cols-2 lg:grid-cols-4 gap-3` row.
- `DifficultyBadge` / `difficultyTextClass` for Easy / Medium / Hard.
- `EmptyState` for empty lists.
- `ActivityHeatmap` for solve history.
- `Logo` / `LogoMark` for the brand.
- Classes: `eyebrow` (small mono label), `chip` (tag), `kbd` (keyboard key).
- Editor-style tabs: `TAB_STRIP` / `TAB_STRIP_TRIGGER` from `src/components/common/tabStrip.ts`.
- shadcn/ui components (`src/components/ui`) as they are.

## Type and shape
- Fonts: Inter for text, JetBrains Mono (`font-mono`) for code, numbers, dates and labels.
  Numbers use `font-mono tabular-nums`.
- Sizes: body `text-sm`, card titles `text-base font-semibold`, page titles come from `PageHeader`.
- Cards `rounded-lg`, controls and small boxes `rounded-md`. No `rounded-xl` or larger; `rounded-full`
  only for avatars and dots.
- Spacing: pages `space-y-6`, card grids `gap-6`, stat rows `gap-3`.
- Lists are rows with `divide-y` inside one card, not a stack of coloured cards.

## Don't
Emoji in the interface, mascots or decorative images, gradients, glows, bouncing or floating
animations, more than one primary button per view.

## Check
Every screen must work at 390px wide without sideways scrolling.
