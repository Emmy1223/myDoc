"use client";

import { useEffect, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Undo2,
  Redo2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Table as TableIcon,
  Rows3,
  Columns3,
  Trash2,
  Merge,
  SplitSquareHorizontal,
} from "lucide-react";
import { subscribeEditor } from "./DocEditor";

const FONT_SIZES = [
  "9pt",
  "10pt",
  "11pt",
  "12pt",
  "14pt",
  "16pt",
  "18pt",
  "20pt",
  "24pt",
  "28pt",
  "32pt",
];

type BtnProps = {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
};

function Btn({ onClick, active, disabled, title, children }: BtnProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={`flex h-8 w-8 items-center justify-center border transition-colors ${
        active
          ? "border-rust bg-rust/10 text-rust"
          : "border-transparent text-stone-600 hover:border-stone-300 hover:text-ink"
      } ${disabled ? "cursor-not-allowed opacity-40 hover:border-transparent" : ""}`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-stone-300" />;
}

function FontSizePicker({
  editor,
  disabled,
}: {
  editor: Editor | null;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const current = editor?.getAttributes("textStyle").fontSize as
    | string
    | undefined;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled || !editor}
        title="Font size"
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex h-8 items-center gap-1 border px-2 text-xs font-semibold transition-colors ${
          current
            ? "border-rust bg-rust/10 text-rust"
            : "border-transparent text-stone-600 hover:border-stone-300 hover:text-ink"
        } ${disabled ? "cursor-not-allowed opacity-40" : ""}`}
      >
        <Type className="h-3.5 w-3.5" strokeWidth={2} />
        <span className="tabular-nums">{current ?? "11pt"}</span>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 top-full z-30 mt-1 grid max-h-64 w-40 grid-cols-2 gap-0.5 overflow-y-auto border border-stone-200 bg-white p-1 shadow-lg"
        >
          {FONT_SIZES.map((size) => {
            const selected = current === size;
            return (
              <button
                key={size}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  editor
                    ?.chain()
                    .focus()
                    .setFontSize(size)
                    .run();
                  setOpen(false);
                }}
                className={`px-2 py-1.5 text-left text-xs transition-colors ${
                  selected
                    ? "bg-orange-50 font-medium text-rust"
                    : "text-stone-700 hover:bg-stone-50 hover:text-ink"
                }`}
              >
                {size}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => {
              editor?.chain().focus().unsetFontSize().run();
              setOpen(false);
            }}
            className="col-span-2 mt-0.5 border-t border-stone-200 px-2 py-1.5 text-left text-xs font-medium text-stone-600 hover:bg-stone-50 hover:text-ink"
          >
            Reset to default
          </button>
        </div>
      )}
    </div>
  );
}

function TablePicker({
  editor,
  disabled,
}: {
  editor: Editor | null;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const inTable = editor?.isActive("table") ?? false;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled || !editor}
        title="Table"
        aria-haspopup="menu"
        aria-expanded={open}
        className={`flex h-8 w-8 items-center justify-center border transition-colors ${
          inTable
            ? "border-rust bg-rust/10 text-rust"
            : "border-transparent text-stone-600 hover:border-stone-300 hover:text-ink"
        } ${disabled ? "cursor-not-allowed opacity-40" : ""}`}
      >
        <TableIcon className="h-4 w-4" strokeWidth={1.75} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 w-56 border border-stone-200 bg-white py-1 shadow-lg">
          {!inTable ? (
            <button
              type="button"
              onClick={() => {
                editor
                  ?.chain()
                  .focus()
                  .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                  .run();
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-ink hover:bg-stone-50"
            >
              <TableIcon className="h-4 w-4" strokeWidth={2} />
              Insert 3×3 table
            </button>
          ) : (
            <>
              <MenuItem
                onClick={() => editor?.chain().focus().addRowBefore().run()}
                icon={Rows3}
                label="Add row above"
              />
              <MenuItem
                onClick={() => editor?.chain().focus().addRowAfter().run()}
                icon={Rows3}
                label="Add row below"
              />
              <MenuItem
                onClick={() => editor?.chain().focus().addColumnBefore().run()}
                icon={Columns3}
                label="Add column left"
              />
              <MenuItem
                onClick={() => editor?.chain().focus().addColumnAfter().run()}
                icon={Columns3}
                label="Add column right"
              />

              <div className="my-1 border-t border-stone-100" />

              <MenuItem
                onClick={() => editor?.chain().focus().mergeCells().run()}
                icon={Merge}
                label="Merge cells"
              />
              <MenuItem
                onClick={() => editor?.chain().focus().splitCell().run()}
                icon={SplitSquareHorizontal}
                label="Split cell"
              />
              <MenuItem
                onClick={() => editor?.chain().focus().toggleHeaderRow().run()}
                icon={Rows3}
                label="Toggle header row"
              />

              <div className="my-1 border-t border-stone-100" />

              <MenuItem
                onClick={() => editor?.chain().focus().deleteRow().run()}
                icon={Trash2}
                label="Delete row"
              />
              <MenuItem
                onClick={() => editor?.chain().focus().deleteColumn().run()}
                icon={Trash2}
                label="Delete column"
              />
              <MenuItem
                onClick={() => editor?.chain().focus().deleteTable().run()}
                icon={Trash2}
                label="Delete table"
                danger
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}

function MenuItem({
  onClick,
  icon: Icon,
  label,
  danger,
}: {
  onClick: () => void;
  icon: typeof TableIcon;
  label: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium transition-colors ${
        danger
          ? "text-red-700 hover:bg-red-50"
          : "text-stone-700 hover:bg-stone-50 hover:text-ink"
      }`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
      {label}
    </button>
  );
}

export default function DocToolbar({ disabled = false }: { disabled?: boolean }) {
  const [editor, setEditor] = useState<Editor | null>(null);

  useEffect(() => subscribeEditor(setEditor), []);

  const on = (name: string, attrs?: Record<string, unknown>) =>
    editor?.isActive(name, attrs) ?? false;

  const setLink = () => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const d = disabled || !editor;

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-stone-200 bg-white px-4 py-2 print-hidden">
      <Btn title="Undo" onClick={() => editor?.chain().focus().undo().run()} disabled={d || !editor?.can().undo()}>
        <Undo2 className="h-4 w-4" strokeWidth={1.75} />
      </Btn>
      <Btn title="Redo" onClick={() => editor?.chain().focus().redo().run()} disabled={d || !editor?.can().redo()}>
        <Redo2 className="h-4 w-4" strokeWidth={1.75} />
      </Btn>

      <Divider />

      <Btn title="Bold" active={on("bold")} onClick={() => editor?.chain().focus().toggleBold().run()} disabled={d}>
        <Bold className="h-4 w-4" strokeWidth={2} />
      </Btn>
      <Btn title="Italic" active={on("italic")} onClick={() => editor?.chain().focus().toggleItalic().run()} disabled={d}>
        <Italic className="h-4 w-4" strokeWidth={2} />
      </Btn>
      <Btn title="Underline" active={on("underline")} onClick={() => editor?.chain().focus().toggleUnderline().run()} disabled={d}>
        <UnderlineIcon className="h-4 w-4" strokeWidth={2} />
      </Btn>
      <Btn title="Strikethrough" active={on("strike")} onClick={() => editor?.chain().focus().toggleStrike().run()} disabled={d}>
        <Strikethrough className="h-4 w-4" strokeWidth={2} />
      </Btn>

      <Divider />

      <Btn title="Heading 1" active={on("heading", { level: 1 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} disabled={d}>
        <Heading1 className="h-4 w-4" strokeWidth={1.75} />
      </Btn>
      <Btn title="Heading 2" active={on("heading", { level: 2 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} disabled={d}>
        <Heading2 className="h-4 w-4" strokeWidth={1.75} />
      </Btn>
      <Btn title="Heading 3" active={on("heading", { level: 3 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} disabled={d}>
        <Heading3 className="h-4 w-4" strokeWidth={1.75} />
      </Btn>

      <Divider />

      <FontSizePicker editor={editor} disabled={d} />

      <Divider />

      <TablePicker editor={editor} disabled={d} />

      <Divider />

      <Btn title="Left align" active={on("textAlign", { textAlign: "left" })} onClick={() => editor?.chain().focus().setTextAlign("left").run()} disabled={d}>
        <AlignLeft className="h-4 w-4" strokeWidth={1.75} />
      </Btn>
      <Btn title="Center align" active={on("textAlign", { textAlign: "center" })} onClick={() => editor?.chain().focus().setTextAlign("center").run()} disabled={d}>
        <AlignCenter className="h-4 w-4" strokeWidth={1.75} />
      </Btn>
      <Btn title="Right align" active={on("textAlign", { textAlign: "right" })} onClick={() => editor?.chain().focus().setTextAlign("right").run()} disabled={d}>
        <AlignRight className="h-4 w-4" strokeWidth={1.75} />
      </Btn>

      <Divider />

      <Btn title="Link" active={on("link")} onClick={setLink} disabled={d}>
        <LinkIcon className="h-4 w-4" strokeWidth={1.75} />
      </Btn>
    </div>
  );
}