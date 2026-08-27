import { useCallback, useRef, type KeyboardEvent } from "react";

/**
 * Attach to a <form> (or any container) to make Enter move focus to the next
 * field instead of doing nothing, Shift+Enter move to the previous field, and
 * Enter on the last field submit the form.
 *
 * Deliberately skips: <textarea> (Enter inserts a newline), Radix Select
 * triggers (role="combobox" — they handle Enter themselves), anything inside
 * an open popover/menu, buttons (native activation is already correct), and
 * anything marked data-enter-skip (escape hatch for custom widgets).
 */
export function useEnterKeyNav<T extends HTMLElement = HTMLFormElement>() {
  const ref = useRef<T>(null);

  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key !== "Enter") return;
    const target = e.target as HTMLElement;

    if (target.tagName === "TEXTAREA") return;
    if (target.getAttribute("role") === "combobox") return;
    if (target.closest('[data-radix-popper-content-wrapper]')) return;
    if (target.closest("[data-enter-skip]")) return;
    if (target.tagName === "BUTTON") return;

    const container = ref.current;
    if (!container) return;

    const focusables = Array.from(
      container.querySelectorAll<HTMLElement>(
        'input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), [role="combobox"]:not([disabled])',
      ),
    ).filter((el) => el.offsetParent !== null);

    const idx = focusables.indexOf(target);
    if (idx === -1) return;

    e.preventDefault();

    if (e.shiftKey) {
      focusables[idx - 1]?.focus();
      return;
    }

    const next = focusables[idx + 1];
    if (next) {
      next.focus();
    } else if (container instanceof HTMLFormElement) {
      container.requestSubmit();
    }
  }, []);

  return { ref, onKeyDown };
}
