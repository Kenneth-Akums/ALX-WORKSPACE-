import { useEffect } from "react";
import "./Toast.css";

export default function Toast({ toasts = [], onRemove }) {
  useEffect(() => {
    // Auto-dismiss toasts after duration
    const timers = toasts.map((t) => {
      if (t.duration === 0) return null;
      return setTimeout(() => onRemove && onRemove(t.id), t.duration || 4000);
    });
    return () => timers.forEach(t => t && clearTimeout(t));
  }, [toasts, onRemove]);

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite" aria-atomic="true">
      {toasts.map(t => (
        <div key={t.id} className={`toast-item ${t.type || ''}`} role="status">
          <div className="toast-body">
            <div className="toast-title">{t.title}</div>
            {t.message && <div className="toast-message">{t.message}</div>}
          </div>
          <button className="toast-close" onClick={() => onRemove && onRemove(t.id)} aria-label="Dismiss">×</button>
        </div>
      ))}
    </div>
  );
}
