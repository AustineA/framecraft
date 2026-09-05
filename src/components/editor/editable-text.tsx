"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

/**
 * Text edited directly on the canvas.
 *
 * Content is deliberately uncontrolled while focused — writing React state
 * back into a contentEditable on every keystroke resets the caret to the
 * start. The value is pushed in only when the field is idle, and read back
 * once on blur, which also keeps undo to one entry per edit.
 */
export function EditableText({
  value,
  onCommit,
  editable,
  multiline = false,
  className = "",
  style,
  label,
}: {
  value: string;
  onCommit: (next: string) => void;
  editable: boolean;
  multiline?: boolean;
  className?: string;
  style?: CSSProperties;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (node && !editing && node.innerText !== value) node.innerText = value;
  }, [value, editing]);

  if (!editable) {
    return (
      <div className={className} style={style}>
        {value}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      role="textbox"
      tabIndex={0}
      aria-label={label}
      aria-multiline={multiline}
      contentEditable="plaintext-only"
      suppressContentEditableWarning
      spellCheck={false}
      className={`cursor-text rounded-[3px] outline-none ring-offset-1 hover:ring-1 hover:ring-[#007AFF66] focus:ring-2 focus:ring-[var(--purple)] ${className}`}
      style={style}
      onFocus={() => setEditing(true)}
      onBlur={(event) => {
        setEditing(false);
        const next = event.currentTarget.innerText.replace(/\n$/, "");
        if (next !== value) onCommit(next);
      }}
      onKeyDown={(event) => {
        // Arrow keys belong to the caret here, not to any canvas shortcut.
        event.stopPropagation();
        if (event.key === "Escape") {
          event.preventDefault();
          if (ref.current) ref.current.innerText = value;
          ref.current?.blur();
        }
        if (event.key === "Enter" && !multiline) {
          event.preventDefault();
          ref.current?.blur();
        }
      }}
    />
  );
}
