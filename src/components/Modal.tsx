"use client";

import { useEffect, useState, type ReactNode } from "react";
import { X } from "lucide-react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  widthClassName?: string;
  footer?: ReactNode;
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  widthClassName = "max-w-md",
  footer,
}: ModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setVisible(false);
      return;
    }
    const raf = requestAnimationFrame(() => setVisible(true));
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-5 sm:p-8 bg-[#2E2A5C]/45 backdrop-blur-[1px] transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        className={`w-full ${widthClassName} bg-white rounded-2xl shadow-xl transition-all duration-200 max-h-[min(90vh,720px)] flex flex-col ${
          visible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-7 sm:px-8 py-6 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-50"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-7 sm:px-8 py-7 overflow-y-auto">{children}</div>
        {footer ? (
          <div className="px-7 sm:px-8 py-6 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
