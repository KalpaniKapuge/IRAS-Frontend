// CSS custom properties resolve fine as SVG/style color values in all evergreen
// browsers, so charts stay perfectly in sync with the light/dark theme tokens
// defined in index.css without needing a JS-side color palette to maintain.
export const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export const CHART_GRID_COLOR = "hsl(var(--border))";
export const CHART_TEXT_COLOR = "hsl(var(--muted-foreground))";
