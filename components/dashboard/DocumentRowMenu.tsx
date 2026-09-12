"use client";

import { useEffect, useRef } from "react";
import {
  Copy,
  Download,
  ExternalLink,
  FileJson,
  LoaderCircle,
  Pencil,
  Trash2,
} from "lucide-react";

export type RowAction =
  | "rename"
  | "duplicate"
  | "download"
  | "open"
  | "export-json"
  | "delete";

export default function DocumentRowMenu({
  open,
  workingAction,
  onAction,
  onClose,
}: {
  open: boolean;
  workingAction: RowAction | null;
  onAction: (action: RowAction) => void;
  onClose: () => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const items: {
    action: RowAction;
    label: string;
    icon: typeof Pencil;
    danger?: boolean;
  }[] = [
    { action: "rename", label: "Rename", icon: Pencil },
    { action: "duplicate", label: "Duplicate", icon: Copy },
    { action: "download", label: "Download PDF", icon: Download },
    { action: "open", label: "Open in new tab", icon: ExternalLink },
    { action: "export-json", label: "Export as JSON", icon: FileJson },
    { action: "delete", label: "Delete", icon: Trash2, danger: true },
  ];

  return (
    <div
      ref={menuRef}
      role="menu"
      className="absolute right-0 top-full z-30 mt-1 w-48 border border-stone-200 bg-white py-1 shadow-lg"
    >
      {items.map((item, index) => {
        const Icon = item.icon;
        const isWorking = workingAction === item.action;
        const isDanger = item.danger;
        return (
          <div key={item.action}>
            {isDanger && index > 0 && (
              <div className="my-1 border-t border-stone-100" />
            )}
            <button
              type="button"
              role="menuitem"
              disabled={workingAction !== null}
              onClick={() => onAction(item.action)}
              className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm font-medium transition-colors disabled:cursor-wait disabled:opacity-60 ${
                isDanger
                  ? "text-red-700 hover:bg-red-50"
                  : "text-stone-700 hover:bg-stone-50 hover:text-ink"
              }`}
            >
              {isWorking ? (
                <LoaderCircle
                  className="h-3.5 w-3.5 animate-spin"
                  strokeWidth={2}
                />
              ) : (
                <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
              )}
              {item.label}
            </button>
          </div>
        );
      })}
    </div>
  );
}