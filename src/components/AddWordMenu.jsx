import { useEffect, useRef, useState } from "react";

export default function AddWordMenu({ onAdd, onImport }) {
  const [open, setOpen] = useState(false);
  const container = useRef(null);
  const trigger = useRef(null);

  useEffect(() => {
    if (!open) return;
    function closeOnOutsideClick(event) {
      if (!container.current.contains(event.target)) setOpen(false);
    }
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () =>
      document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [open]);

  function choose(action) {
    setOpen(false);
    action();
  }

  return (
    <div
      className="add-word-menu"
      ref={container}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setOpen(false);
          trigger.current.focus();
        }
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        ref={trigger}
        className="primary-button"
        aria-expanded={open}
        aria-controls="add-word-options"
        onClick={() => setOpen(!open)}
      >
        + Thêm từ ▾
      </button>
      {open && (
        <div id="add-word-options" className="add-word-options">
          <button onClick={() => choose(onAdd)}>Nhập thủ công</button>
          <button onClick={() => choose(onImport)}>Nhập danh sách</button>
        </div>
      )}
    </div>
  );
}
