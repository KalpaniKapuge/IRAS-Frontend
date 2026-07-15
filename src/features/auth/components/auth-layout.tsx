import { BarChart3, MessageSquareText, ShieldCheck, Sparkles, Target } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { cn } from "@/lib/utils";

const HIGHLIGHTS = [
  { icon: Sparkles, text: "AI-drafted, bias-checked job descriptions" },
  { icon: Target, text: "Explainable candidate ranking & skill-gap coaching" },
  { icon: MessageSquareText, text: "Every rejection comes with real, actionable feedback" },
  { icon: ShieldCheck, text: "A human always makes the final call — AI only assists" },
];

interface AuthLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
  /** Optional photo for the side panel (e.g. `/auth/hero.jpg` in `public/`). Falls back
   *  to a pure CSS gradient/mesh design when omitted. */
  imageSrc?: string;
}

export function AuthLayout({ title, description, children, imageSrc }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-slate-950 p-10 text-white lg:flex">
        {imageSrc ? (
          <>
            <img src={imageSrc} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/30" />
          </>
        ) : (
          <>
            <div
              className="absolute inset-0 opacity-40"
              style={{
                background:
                  "radial-gradient(60% 50% at 15% 10%, hsl(var(--primary) / 0.55), transparent), radial-gradient(50% 40% at 90% 80%, hsl(199 89% 46% / 0.45), transparent)",
              }}
            />
            <div className="absolute inset-0 bg-grid opacity-[0.08]" />
          </>
        )}

        <div className="relative z-10">
          <Logo className="[&_p:first-child]:text-white [&_p:last-child]:text-white/60" />
        </div>

        <div className="relative z-10 max-w-md space-y-8">
          <h2 className="text-3xl font-semibold leading-tight text-balance">
            Recruitment, reimagined with AI — for employers and candidates alike.
          </h2>

          <ul className="space-y-3.5">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-sm text-white/85">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                {text}
              </li>
            ))}
          </ul>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between text-xs text-white/60">
              <span className="flex items-center gap-1.5">
                <BarChart3 className="h-3.5 w-3.5" /> Sample match score
              </span>
              <span className="font-semibold text-white">87%</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-[87%] rounded-full bg-gradient-to-r from-primary to-sky-400" />
            </div>
          </div>
        </div>

        <p className="relative z-10 text-xs text-white/50">
          © {new Date().getFullYear()} Intelligent Recruitment Automation System
        </p>
      </div>

      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          <div className={cn("mb-8 flex items-center justify-between lg:mb-10 lg:justify-end")}>
            <div className="lg:hidden">
              <Logo />
            </div>
            <ThemeToggle />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>

          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
