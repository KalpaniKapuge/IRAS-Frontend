import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export function AuthLayout({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-primary via-primary to-indigo-700 p-10 text-primary-foreground lg:flex">
        <div className="absolute inset-0 bg-grid opacity-[0.07]" />
        <div className="relative z-10">
          <Logo className="text-primary-foreground [&_p]:text-primary-foreground/70 [&_p:first-child]:text-primary-foreground" />
        </div>
        <div className="relative z-10 space-y-4">
          <h2 className="text-3xl font-semibold leading-tight text-balance">
            Recruitment, reimagined with AI — for employers and candidates alike.
          </h2>
          <p className="max-w-md text-sm text-primary-foreground/80">
            Generate unbiased job descriptions, rank candidates with explainable scoring, surface skill gaps, and
            deliver constructive feedback — all from one platform.
          </p>
        </div>
        <p className="relative z-10 text-xs text-primary-foreground/60">
          © {new Date().getFullYear()} Intelligent Recruitment Automation System
        </p>
      </div>

      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Logo />
            <ThemeToggle />
          </div>
          <div className="hidden justify-end lg:flex">
            <ThemeToggle />
          </div>
          <div className="mt-2 space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
