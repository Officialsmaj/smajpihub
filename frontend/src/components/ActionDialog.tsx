import { useEffect, useId, useRef, useState } from "react";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

type Props = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  busy?: boolean;
  danger?: boolean;
  inputLabel?: string;
  initialValue?: string;
  minLength?: number;
  onCancel: () => void;
  onConfirm: (value: string) => void;
};

const ActionDialog = ({ open, title, description, confirmLabel, busy, danger, inputLabel, initialValue = "", minLength = 1, onCancel, onConfirm }: Props) => {
  const [value, setValue] = useState(initialValue);
  const titleId = useId();
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => {
      setValue(initialValue);
      inputRef.current?.focus();
    }, 0);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [busy, initialValue, onCancel, open]);
  if (!open) return null;
  const valid = !inputLabel || value.trim().length >= minLength;
  return (
    <div className="action-dialog-backdrop" role="presentation" onMouseDown={() => !busy && onCancel()}>
      <section className="action-dialog" role="dialog" aria-modal="true" aria-labelledby={titleId} onMouseDown={event => event.stopPropagation()}>
        <span className={`action-dialog-icon ${danger ? "danger" : ""}`}><WarningAmberRoundedIcon /></span>
        <h2 id={titleId}>{title}</h2>
        <p>{description}</p>
        {inputLabel ? <label>{inputLabel}<textarea ref={inputRef} rows={4} value={value} onChange={event => setValue(event.target.value)} /><small>{value.trim().length < minLength ? `Enter at least ${minLength} characters.` : " "}</small></label> : null}
        <div>
          <button type="button" onClick={onCancel} disabled={busy}>Cancel</button>
          <button type="button" className={danger ? "danger" : "primary"} disabled={busy || !valid} onClick={() => onConfirm(value.trim())}>{busy ? "Working…" : confirmLabel}</button>
        </div>
      </section>
    </div>
  );
};

export default ActionDialog;
