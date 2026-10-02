// components/builder/doc/DocToolbar.tsx
"use client";

import { useEffect, useState } from "react";
import type { Editor } from "@tiptap/react";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Code,
  Link as LinkIcon, Undo2, Redo2,
  AlignLeft, AlignCenter, AlignRight,
} from "lucide-react";
import { subscribeEditor } from "./DocEditor";

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

      <Btn title="Bullet list" active={on("bulletList")} onClick={() => editor?.chain().focus().toggleBulletList().run()} disabled={d}>
        <List className="h-4 w-4" strokeWidth={1.75} />
      </Btn>
      <Btn title="Numbered list" active={on("orderedList")} onClick={() => editor?.chain().focus().toggleOrderedList().run()} disabled={d}>
        <ListOrdered className="h-4 w-4" strokeWidth={1.75} />
      </Btn>
      <Btn title="Quote" active={on("blockquote")} onClick={() => editor?.chain().focus().toggleBlockquote().run()} disabled={d}>
        <Quote className="h-4 w-4" strokeWidth={1.75} />
      </Btn>
      <Btn title="Code block" active={on("codeBlock")} onClick={() => editor?.chain().focus().toggleCodeBlock().run()} disabled={d}>
        <Code className="h-4 w-4" strokeWidth={1.75} />
      </Btn>

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