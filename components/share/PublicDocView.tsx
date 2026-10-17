import type { RichDocNode } from "@/lib/doc-data";
import { getDocFontCss } from "@/lib/doc-data";

function renderMarks(
  text: string,
  marks: RichDocNode["marks"],
  key: number,
): React.ReactNode {
  if (!marks || marks.length === 0) {
    return text;
  }

  let element: React.ReactNode = text;

  for (const mark of marks) {
    switch (mark.type) {
      case "bold":
        element = <strong key={key}>{element}</strong>;
        break;
      case "italic":
        element = <em key={key}>{element}</em>;
        break;
      case "underline":
        element = <u key={key}>{element}</u>;
        break;
      case "strike":
        element = <s key={key}>{element}</s>;
        break;
      case "code":
        element = <code key={key}>{element}</code>;
        break;
      case "link": {
        const href = (mark.attrs?.href as string) || "#";
        element = (
          <a key={key} href={href} rel="noopener noreferrer" target="_blank">
            {element}
          </a>
        );
        break;
      }
      case "textStyle": {
        const fontSize = mark.attrs?.fontSize as string | undefined;
        if (fontSize) {
          element = (
            <span key={key} style={{ fontSize }}>
              {element}
            </span>
          );
        }
        break;
      }
    }
  }

  return element;
}

function renderNode(node: RichDocNode, key: number): React.ReactNode {
  if (node.type === "text") {
    return renderMarks(node.text ?? "", node.marks, key);
  }

  const children = node.content?.map((child, i) => renderNode(child, i));

  switch (node.type) {
    case "doc":
      return <>{children}</>;
    case "paragraph":
      return <p key={key}>{children}</p>;
    case "heading": {
      const level = (node.attrs?.level as number) ?? 1;
      const fontSize = node.attrs?.fontSize as string | undefined;
      const style = fontSize ? { fontSize } : undefined;
      if (level === 1) return <h1 key={key} style={style}>{children}</h1>;
      if (level === 2) return <h2 key={key} style={style}>{children}</h2>;
      return <h3 key={key} style={style}>{children}</h3>;
    }
    case "bulletList":
      return <ul key={key}>{children}</ul>;
    case "orderedList":
      return <ol key={key}>{children}</ol>;
    case "listItem":
      return <li key={key}>{children}</li>;
    case "blockquote":
      return <blockquote key={key}>{children}</blockquote>;
    case "codeBlock":
      return (
        <pre key={key}>
          <code>{children}</code>
        </pre>
      );
    case "horizontalRule":
      return <hr key={key} />;
    case "hardBreak":
      return <br key={key} />;
    case "table":
      return (
        <table key={key} className="doc-table">
          <tbody>{children}</tbody>
        </table>
      );
    case "tableRow":
      return <tr key={key}>{children}</tr>;
    case "tableHeader":
      return <th key={key}>{children}</th>;
    case "tableCell":
      return <td key={key}>{children}</td>;
    default:
      return <span key={key}>{children}</span>;
  }
}

export default function PublicDocView({
  body,
  fontFamily,
}: {
  body: RichDocNode;
  fontFamily?: string;
}) {
  return (
    <>
      <style>{`
        .doc-prose table {
          border-collapse: collapse;
          width: 100%;
          margin: 1em 0;
        }
        .doc-prose table td,
        .doc-prose table th {
          border: 1px solid #d6d3d1;
          padding: 6px 10px;
          vertical-align: top;
        }
        .doc-prose table th {
          background: #f5f5f4;
          font-weight: 700;
          text-align: left;
        }
        .doc-prose table p {
          margin: 0;
        }
      `}</style>
      <div
        className="doc-prose prose-neutral max-w-none"
        style={{ fontFamily: getDocFontCss(fontFamily) }}
      >
        {body.content?.map((node, i) => renderNode(node, i))}
      </div>
    </>
  );
}