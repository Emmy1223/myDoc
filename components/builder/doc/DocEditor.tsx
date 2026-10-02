"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Paragraph from "@tiptap/extension-paragraph";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import CharacterCount from "@tiptap/extension-character-count";
import { useEffect, useRef } from "react";
import type { RichDocNode } from "@/lib/doc-data";

const ParagraphWithPlaceholder = Paragraph.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      placeholder: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-placeholder"),
        renderHTML: (attributes) => {
          if (!attributes.placeholder) return {};
          return { "data-placeholder": attributes.placeholder };
        },
      },
    };
  },
});

let currentEditor: Editor | null = null;
const listeners = new Set<(e: Editor | null) => void>();

export function subscribeEditor(fn: (e: Editor | null) => void) {
  listeners.add(fn);
  fn(currentEditor);
  return () => {
    listeners.delete(fn);
  };
}

function ToolbarBridge({ editor }: { editor: Editor | null }) {
  useEffect(() => {
    currentEditor = editor;
    listeners.forEach((fn) => fn(editor));
  }, [editor]);
  return null;
}

export default function DocEditor({
  body,
  onChange,
  editable = true,
}: {
  body: RichDocNode;
  onChange: (next: RichDocNode) => void;
  editable?: boolean;
}) {
  const lastAppliedRef = useRef<string>("");

  const editor = useEditor({
    editable,
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        paragraph: false,
      }),
      ParagraphWithPlaceholder,
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer" },
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (
            typeof node.attrs?.placeholder === "string" &&
            node.attrs.placeholder.length > 0
          ) {
            return node.attrs.placeholder;
          }
          return "Start writing…";
        },
        emptyEditorClass: "is-editor-empty",
        emptyNodeClass: "is-empty",
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      CharacterCount,
    ],
    content: body,
    editorProps: {
      attributes: {
        class:
          "doc-prose prose-neutral max-w-none min-h-[297mm] px-[20mm] py-[18mm] focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      const next = editor.getJSON() as RichDocNode;
      const nextJson = JSON.stringify(next);
      if (nextJson === lastAppliedRef.current) return;
      lastAppliedRef.current = nextJson;
      onChange(next);
    },
    onCreate: ({ editor }) => {
      const created = JSON.stringify(editor.getJSON());
      lastAppliedRef.current = created;
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(editable);
  }, [editor, editable]);

  useEffect(() => {
    if (!editor) return;
    const incoming = JSON.stringify(body);
    if (incoming === lastAppliedRef.current) return;
    editor.commands.setContent(body, false);
    lastAppliedRef.current = incoming;
  }, [body, editor]);

  return (
    <>
      {/* Inline style: cannot be stripped by Tailwind or cached. */}
      <style>{`
        .doc-prose p[data-placeholder]::before,
        .doc-prose h1[data-placeholder]::before,
        .doc-prose h2[data-placeholder]::before,
        .doc-prose h3[data-placeholder]::before,
        .doc-prose li[data-placeholder] > p::before {
          content: attr(data-placeholder);
          color: #a8a29e;
          pointer-events: none;
          font-style: italic;
          display: block;
          height: 0;
          overflow: visible;
        }
        /* Hide ghost when user has typed something */
        .doc-prose p[data-placeholder]:not(:has(br.ProseMirror-trailingBreak))::before {
          content: none;
        }
      `}</style>
      <div className="doc-editor">
        <EditorContent editor={editor} />
        <ToolbarBridge editor={editor} />
      </div>
    </>
  );
}