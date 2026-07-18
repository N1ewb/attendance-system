import { useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function Modal({ isOpen, onClose, title, children, footer }) {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
  }, []);

  const trapFocus = useCallback((e) => {
    if (!modalRef.current || e.key !== "Tab") return;
    const focusable = modalRef.current.querySelectorAll(FOCUSABLE);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      trapFocus(e);
    };

    document.addEventListener("keydown", handleKeyDown);

    const timer = setTimeout(() => {
      const firstFocusable = modalRef.current?.querySelector(FOCUSABLE);
      if (firstFocusable) firstFocusable.focus();
    }, 50);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      clearTimeout(timer);
      previousFocusRef.current?.focus();
    };
  }, [isOpen, onClose, trapFocus]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const animClass = prefersReducedMotion.current
    ? ""
    : "transition-all duration-200";

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${animClass}`}
      onClick={handleBackdropClick}
    >
      <div className="fixed inset-0 bg-black/50" />

      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative z-10 w-[95vw] max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl ${animClass} ${
          prefersReducedMotion.current
            ? ""
            : "opacity-0 scale-95 data-[open]:opacity-100 data-[open]:scale-100"
        }`}
        data-open={isOpen ? "true" : undefined}
        style={
          isOpen && !prefersReducedMotion.current
            ? { opacity: 1, transform: "scale(1)" }
            : undefined
        }
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close modal"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="px-6 py-4">{children}</div>

        {footer && (
          <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
