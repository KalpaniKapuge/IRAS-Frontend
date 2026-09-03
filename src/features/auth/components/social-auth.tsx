import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { GOOGLE_CLIENT_ID, googleSignInEnabled, loadGoogleIdentity } from "../google";

// Google's four-colour "G" on transparent — no white disc behind it, so it sits cleanly on
// our pill button in both themes. Inline so the marks keep their brand colours.
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.76c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path fill="#FBBC05" d="M5.84 13.11a6.6 6.6 0 0 1 0-4.22V6.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z" />
      <path
        fill="#EA4335"
        d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.29 14.97 0 12 0A11 11 0 0 0 2.18 6.05l3.66 2.84C6.71 6.29 9.14 4.75 12 4.75Z"
      />
    </svg>
  );
}

interface SocialAuthProps {
  /** Verb shown to the user: "Sign in" / "Sign up". */
  action: string;
  /** Called with the Google ID token once the user completes the Google flow. */
  onGoogleCredential: (idToken: string) => void | Promise<void>;
  /** Optional line under the Google button (e.g. which role the sign-up will use). */
  note?: string;
  /** Disable the button while an auth request is in flight. */
  busy?: boolean;
}

// Social sign-in row + "or … with email" divider, shared by the login and register pages.
//
// Renders Google's own Identity Services button directly and visibly (outline/pill theme,
// chosen to match the rest of the form as closely as Google's widget allows) rather than
// layering it invisibly on top of a separate custom-styled button — that overlay trick
// depends on the two elements staying perfectly aligned and the overlay's hit-testing
// working in every browser, and was a real source of "renders but can't be clicked" bugs.
// A plain custom button with a toast is shown instead when there's no client ID configured
// or the Google script fails to load.
export function SocialAuth({ action, onGoogleCredential, note, busy = false }: SocialAuthProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [ready, setReady] = useState(false);

  // The login/register pages recreate onGoogleCredential more often than the identity of
  // "what to do with the token" actually changes (their own useCallback depends on
  // react-router's location.state, which isn't as stable as it looks). Reading it through a
  // ref keeps this effect from tearing down and re-running Google's full initialize/render
  // sequence on every one of those — that double-init was exactly the
  // "google.accounts.id.initialize() is called multiple times" race that could leave the
  // invisible overlay button empty and unclickable.
  const credentialRef = useRef(onGoogleCredential);
  useEffect(() => {
    credentialRef.current = onGoogleCredential;
  }, [onGoogleCredential]);

  useEffect(() => {
    if (!googleSignInEnabled) return;
    let cancelled = false;

    loadGoogleIdentity()
      .then((id) => {
        if (cancelled || !containerRef.current) return;
        id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => {
            if (response?.credential) void credentialRef.current(response.credential);
          },
          cancel_on_tap_outside: true,
        });
        containerRef.current.innerHTML = "";
        id.renderButton(containerRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          shape: "pill",
          text: action.toLowerCase().startsWith("sign up") ? "signup_with" : "signin_with",
          logo_alignment: "center",
          width: Math.min(containerRef.current.offsetWidth || 384, 400),
        });
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [action]);

  const googleActive = googleSignInEnabled && !loadFailed;

  return (
    <div className="space-y-4">
      {googleActive ? (
        // Fixed height matches the fallback button below so there's no layout jump while
        // Google's script is still loading — the container starts empty and ready=false
        // hides it, then Google fills it in and it fades into view.
        <div className="relative h-12">
          {!ready && (
            <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-full border border-border text-sm text-muted-foreground">
              <GoogleIcon />
              {action} with Google
            </div>
          )}
          <div
            ref={containerRef}
            className={`flex h-12 items-center justify-center overflow-hidden rounded-full transition-opacity ${
              ready ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={() =>
            toast.info(
              googleSignInEnabled
                ? "Google sign-in is temporarily unavailable — please use your email."
                : "Google sign-in is coming soon — please use your email for now.",
            )
          }
          className="h-12 w-full rounded-full"
        >
          <GoogleIcon />
          {action} with Google
        </Button>
      )}

      {note && <p className="text-center text-xs text-muted-foreground">{note}</p>}

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="whitespace-nowrap text-xs font-medium uppercase tracking-wide text-muted-foreground">
          or {action.toLowerCase()} with email
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>
    </div>
  );
}
