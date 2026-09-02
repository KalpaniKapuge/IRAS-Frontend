import { CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";

interface AuthLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
  /** Left-panel headline. */
  panelHeadline?: string;
  /** Left-panel supporting line. */
  panelDescription?: string;
  /** Left-panel bullet points. */
  panelPoints?: string[];
}

const DEFAULT_HEADLINE = "Recruit with confidence";
const DEFAULT_DESCRIPTION =
  "Merito reads every résumé, ranks every applicant, and shows you exactly why — so hiring decisions are fast and defensible.";
const DEFAULT_POINTS = ["Automated résumé parsing", "Explainable candidate ranking", "Skill-gap analysis built in"];

// Split layout: a full-bleed recruitment photo on the left (the reference's "image on the
// left" pattern) with a brand-gradient wash for legibility, and the form on the right.
//
// The seam between the two halves is a smooth curve — an SVG whose right edge sits exactly
// on the column divider and whose left edge bows into the photo. It's filled with the
// `background` theme token, so it blends into the form panel in both light and dark mode.
// preserveAspectRatio="none" makes the bulge depth a fixed fraction of the SVG's width
// (≈7vw) regardless of viewport height, so it can't balloon out and cover the photo the
// way a viewport-sized circle would.
//
// The photo is served from Unsplash's CDN (free license) with alt="" (decorative). The
// gradient container sits behind it, so the panel still looks intentional if the image
// fails to load.
export function AuthLayout({
  title,
  description,
  children,
  panelHeadline = DEFAULT_HEADLINE,
  panelDescription = DEFAULT_DESCRIPTION,
  panelPoints = DEFAULT_POINTS,
}: AuthLayoutProps) {
  return (
    <div className="relative grid min-h-screen overflow-hidden bg-background lg:grid-cols-2">
      <div className="relative hidden flex-col overflow-hidden bg-gradient-to-br from-primary via-chart-2 to-chart-5 lg:flex">
        <img
          src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1000&h=1300&q=80"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Darkening stack so the white text stays readable over a bright photo:
            a brand-blue multiply tint + a bottom-weighted black gradient that still
            keeps some shade at the top for the logo. */}
        <div className="absolute inset-0 bg-primary/45 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/40" />

        <div className="absolute left-9 top-9 z-20">
          <Logo className="[&_p:first-child]:text-white [&_p:last-child]:text-white/80 [&_p]:[text-shadow:0_1px_10px_rgba(0,0,0,0.55)]" />
        </div>

        <div className="relative z-20 mt-auto max-w-md p-10 [&_*]:[text-shadow:0_1px_12px_rgba(0,0,0,0.55)] xl:p-14">
          <h2 className="text-3xl font-bold leading-tight text-white xl:text-4xl">{panelHeadline}</h2>
          <p className="mt-3 text-sm leading-relaxed text-white">{panelDescription}</p>
          <ul className="mt-6 space-y-2.5">
            {panelPoints.map((point) => (
              <li key={point} className="flex items-center gap-2.5 text-sm font-semibold text-white">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-white" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <svg
        aria-hidden="true"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-y-0 left-1/2 z-10 hidden h-full w-[16vw] -translate-x-1/2 text-background lg:block"
      >
        <path fill="currentColor" d="M50 0 H100 V100 H50 C6 74 6 26 50 0 Z" />
      </svg>

      <div className="relative z-30 flex flex-col justify-center bg-background px-6 py-12 sm:px-12 lg:px-16 xl:px-20">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex items-center justify-between lg:mb-10 lg:justify-end">
            <div className="lg:hidden">
              <Logo />
            </div>
            <ThemeToggle />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>

          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
