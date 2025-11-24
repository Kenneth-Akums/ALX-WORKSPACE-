import { X, Check, XCircle } from "lucide-react";
import { useEffect, useRef } from "react";
import "./ConfirmModal.css";

export default function ConfirmModal({
  isOpen,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
  onCancel,
}) {
  const dialogRef = useRef(null);
  const confirmRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    // focus the confirm button on open
    const prevActive = document.activeElement;
    const confirmEl = confirmRef.current;
    if (confirmEl) confirmEl.focus();

    const onKey = (e) => {
      if (e.key === 'Escape') onCancel && onCancel();
      // basic focus trap
      if (e.key === 'Tab') {
        const focusable = dialogRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }
    };

    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      if (prevActive && prevActive.focus) prevActive.focus();
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const handleContentClick = (e) => e.stopPropagation();

  return (
    <div className="cm-overlay" onClick={onCancel}>
      <div ref={dialogRef} className={`cm-content ${destructive ? 'cm-destructive' : ''}`} onClick={handleContentClick} role="dialog" aria-modal="true" aria-labelledby="cm-title" aria-describedby="cm-desc">
        <button className="cm-close" onClick={onCancel} aria-label="Close">
          <X />
        </button>
        <div className="cm-icon-wrapper">
          {destructive ? <XCircle className="cm-icon" /> : <Check className="cm-icon" />}
        </div>
        <h3 id="cm-title" className="cm-title">{title}</h3>
        <p id="cm-desc" className="cm-desc">{description}</p>
        <div className="cm-actions">
          <button className="button button-outline" onClick={onCancel}>{cancelLabel}</button>
          <button
            ref={confirmRef}
            className={destructive ? "button button-danger" : "button button-primary"}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
