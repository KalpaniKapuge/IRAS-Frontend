import { isRouteErrorResponse, Link, useRouteError } from "react-router-dom";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

function getErrorMessage(error: unknown) {
  if (isRouteErrorResponse(error)) {
    return error.status === 404 ? "The requested page could not be found." : error.statusText;
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong while loading this page.";
}

export function RouteErrorPage() {
  const error = useRouteError();
  const message = getErrorMessage(error);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-10">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 text-center shadow-elevated">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-2xl font-bold tracking-tight">Page could not be loaded</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {message.includes("dynamically imported module")
            ? "The development server served an old page module. Refresh the app or restart Vite if it keeps happening."
            : message}
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button onClick={() => window.location.reload()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Reload page
          </Button>
          <Button variant="outline" asChild>
            <Link to="/">Go to dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
