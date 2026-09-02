// Google Identity Services (GIS) integration.
//
// `VITE_GOOGLE_CLIENT_ID` is optional: when it's blank, `googleSignInEnabled` is false and
// the UI falls back to a "coming soon" notice — nothing here runs. When it's set, we lazy-
// load Google's official script once and let callers render the standard Google button.

export const GOOGLE_CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "").trim();
export const googleSignInEnabled = GOOGLE_CLIENT_ID.length > 0;

// `hl=en` keeps the rendered button's label in English to match the rest of the UI,
// regardless of the browser's locale.
const GIS_SRC = "https://accounts.google.com/gsi/client?hl=en";

interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleAccountsId {
  initialize(config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
  }): void;
  renderButton(
    parent: HTMLElement,
    options: {
      type?: "standard" | "icon";
      theme?: "outline" | "filled_blue" | "filled_black";
      size?: "large" | "medium" | "small";
      text?: "signin_with" | "signup_with" | "continue_with" | "signin";
      shape?: "rectangular" | "pill" | "circle" | "square";
      logo_alignment?: "left" | "center";
      width?: number;
    },
  ): void;
  disableAutoSelect(): void;
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleAccountsId } };
  }
}

let scriptPromise: Promise<GoogleAccountsId> | null = null;

/** Loads the GIS script once and resolves with `google.accounts.id`. */
export function loadGoogleIdentity(): Promise<GoogleAccountsId> {
  if (!googleSignInEnabled) {
    return Promise.reject(new Error("Google sign-in is not configured."));
  }
  if (window.google?.accounts?.id) {
    return Promise.resolve(window.google.accounts.id);
  }
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<GoogleAccountsId>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GIS_SRC}"]`);
    const script = existing ?? document.createElement("script");
    script.src = GIS_SRC;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", () => {
      if (window.google?.accounts?.id) resolve(window.google.accounts.id);
      else reject(new Error("Google Identity Services failed to initialise."));
    });
    script.addEventListener("error", () => {
      scriptPromise = null;
      reject(new Error("Could not load Google Identity Services."));
    });
    if (!existing) document.head.appendChild(script);
  });

  return scriptPromise;
}
