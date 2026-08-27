import { useCallback, useRef, type FocusEvent, type KeyboardEvent } from "react";

const FOCUSABLE_SELECTOR =
  'input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), [role="combobox"]:not([disabled])';

function getFocusables(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => el.offsetParent !== null,
  );
}

/** Moves focus from `current` to the next/previous field, or submits on the last one. */
function advance(container: HTMLElement, current: HTMLElement, backward: boolean) {
  const focusables = getFocusables(container);
  const idx = focusables.indexOf(current);
  if (idx === -1) return;

  if (backward) {
    focusables[idx - 1]?.focus();
    return;
  }

  const next = focusables[idx + 1];
  if (next) {
    next.focus();
  } else if (container instanceof HTMLFormElement) {
    container.requestSubmit();
  }
}

/**
 * Attach to a <form> (or any container) to make Enter move focus to the next
 * field instead of doing nothing, Shift+Enter move to the previous field, and
 * Enter on the last field submit the form.
 *
 * Bind the returned `onKeyDown` to `onKeyDownCapture` (not `onKeyDown`) and
 * the returned `onFocus` to `onFocus`. Radix Select's trigger has its own
 * built-in keydown handler that opens the listbox on Enter; that handler is
 * attached directly to the trigger and fires during the bubble phase before
 * an ancestor's `onKeyDown` would ever see the event, so a bubble-phase
 * listener can't override it. Capturing the event on the way down lets this
 * hook run first and decide what Enter means on a combobox trigger before
 * Radix gets a chance to.
 *
 * Comboboxes go through the same three keystrokes a mouse user gets for
 * free — open, pick, move on — rather than either skipping past the dropdown
 * or collapsing steps together:
 *  1. Enter on a freshly-focused, closed trigger opens it (untouched —
 *     Radix's own handler runs as normal).
 *  2. Enter while open confirms the highlighted option and closes it (also
 *     untouched — Radix moves real DOM focus onto the highlighted item while
 *     open, so this Enter actually lands on that item, not the trigger).
 *  3. Enter again, once the trigger has focus back, advances to the next
 *     field — it does not reopen the dropdown.
 *
 * Step 2→3 can't be timed with a fixed delay: Radix's listbox exits with a
 * CSS animation (see SelectContent's `animate-out`/`zoom-out-95` classes)
 * and only calls `trigger.focus()` once that animation finishes and the
 * content unmounts, which is well past a single animation frame. So instead
 * of guessing a delay, this hook flags "a selection was just confirmed" and
 * waits for the real focus event that follows — whenever it actually fires —
 * to mark the trigger as opened. A "visit" ends (and step 1 resets) whenever
 * the trigger is freshly re-focused (Tab, or advance() moving into it), so
 * tabbing back to a field later lets Enter open it again.
 *
 * Also skips (does nothing, event proceeds untouched): <textarea> (Enter
 * inserts a newline), plain buttons (native activation is already correct),
 * and anything marked data-enter-skip (escape hatch for custom widgets).
 */
export function useEnterKeyNav<T extends HTMLElement = HTMLFormElement>() {
  const ref = useRef<T>(null);
  const openedThisVisit = useRef<WeakSet<HTMLElement>>(new WeakSet());
  const awaitingSelectionFocus = useRef(false);

  const onFocus = useCallback((e: FocusEvent) => {
    const target = e.target as HTMLElement;
    const wasAwaitingSelection = awaitingSelectionFocus.current;
    awaitingSelectionFocus.current = false; // this focus event resolves the wait either way

    if (target.getAttribute("role") !== "combobox") return;

    if (wasAwaitingSelection) {
      // Radix just returned focus here after we confirmed an option inside
      // it — the next Enter should advance, not reopen it.
      openedThisVisit.current.add(target);
    } else {
      // A fresh visit (Tab, or advance() moving focus in) — Enter should
      // open it again.
      openedThisVisit.current.delete(target);
    }
  }, []);

  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key !== "Enter") return;
    const target = e.target as HTMLElement;
    const container = ref.current;
    if (!container) return;

    const isCombobox = target.getAttribute("role") === "combobox";

    if (isCombobox) {
      if (!openedThisVisit.current.has(target)) return; // first Enter here — let Radix open it
      e.preventDefault();
      e.stopPropagation(); // don't let the closed trigger's own handler reopen it
      advance(container, target, e.shiftKey);
      return;
    }

    if (target.closest('[data-radix-popper-content-wrapper]')) {
      // Confirming a highlighted option — let Radix select it and start
      // closing; the resulting focus event (whenever it lands) is handled
      // by onFocus above.
      awaitingSelectionFocus.current = true;
      return;
    }

    if (target.tagName === "TEXTAREA") return;
    if (target.closest("[data-enter-skip]")) return;
    if (target.tagName === "BUTTON") return;

    if (getFocusables(container).indexOf(target) === -1) return;

    e.preventDefault();
    e.stopPropagation();
    advance(container, target, e.shiftKey);
  }, []);

  return { ref, onKeyDown, onFocus };
}
