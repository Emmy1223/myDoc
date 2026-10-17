"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Paragraph from "@tiptap/extension-paragraph";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { getDocFontCss } from "@/lib/doc-data";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import CharacterCount from "@tiptap/extension-character-count";
import TextStyle from "@tiptap/extension-text-style";
import { Extension } from "@tiptap/core";
import { useEffect, useRef } from "react";
import type { RichDocNode } from "@/lib/doc-data";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";

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

const FontSize = Extension.create({
  name: "fontSize",
  addOptions() {
    return {
      types: ["textStyle"],
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize}` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        ({ chain }: any) =>
          chain().setMark("textStyle", { fontSize }).run(),
      unsetFontSize:
        () =>
        ({ chain }: any) =>
          chain().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run(),
    } as any;
  },
});

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (fontSize: string) => ReturnType;
      unsetFontSize: () => ReturnType;
    };
  }
}

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
  fontFamily,
}: {
  body: RichDocNode;
  onChange: (next: RichDocNode) => void;
  editable?: boolean;
  fontFamily?: string;
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
      TextStyle,
      FontSize,
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "doc-table",
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
      CharacterCount,
    ],
    content: body,
    editorProps: {
      attributes: {
        class:
          "doc-prose prose-neutral max-w-none px-4 py-6 md:min-h-[297mm] md:px-[20mm] md:py-[18mm] focus:outline-none",
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
        .doc-prose p[data-placeholder]:not(:has(br.ProseMirror-trailingBreak))::before {
          content: none;
        }
        .doc-prose span[style*="font-size"] {
          line-height: 1.3;
        }
              .doc-prose table {
          border-collapse: collapse;
          table-layout: fixed;
          width: 100%;
          margin: 1em 0;
          overflow: hidden;
        }
        .doc-prose table td,
        .doc-prose table th {
          border: 1px solid #d6d3d1;
          padding: 6px 10px;
          vertical-align: top;
          position: relative;
          min-width: 1em;
        }
        .doc-prose table th {
          background: #f5f5f4;
          font-weight: 700;
          text-align: left;
        }
        .doc-prose table .selectedCell::after {
          content: "";
          position: absolute;
          inset: 0;
          background: rgba(194, 65, 12, 0.08);
          pointer-events: none;
        }
        .doc-prose table .column-resize-handle {
          position: absolute;
          right: -2px;
          top: 0;
          bottom: 0;
          width: 4px;
          background: #c2410c;
          pointer-events: none;
        }
        .doc-prose table p {
          margin: 0;
        }
        .doc-prose .tableWrapper {
          overflow-x: auto;
        }
      `}</style>
      <div
        className="doc-editor"
        style={{ fontFamily: getDocFontCss(fontFamily) }}
      >
        <EditorContent editor={editor} />
        <ToolbarBridge editor={editor} />
      </div>
    </>
  );
}