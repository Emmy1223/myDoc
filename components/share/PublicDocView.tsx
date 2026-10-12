import type { RichDocNode } from "@/lib/doc-data";

function renderNode(node: RichDocNode, key: number): React.ReactNode {
  if (node.type === "text") {
    return node.text ?? "";
  }

  const children = node.content?.map((child, i) => renderNode(child, i));

  switch (node.type) {
    case "doc":
      return <>{children}</>;
    case "paragraph":
      return <p key={key}>{children}</p>;
    case "heading": {
      const level = (node.attrs?.level as number) ?? 1;
      if (level === 1) return <h1 key={key}>{children}</h1>;
      if (level === 2) return <h2 key={key}>{children}</h2>;
      return <h3 key={key}>{children}</h3>;
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
    default:
      return <span key={key}>{children}</span>;
  }
}

export default function PublicDocView({ body }: { body: RichDocNode }) {
  return (
    <div className="doc-prose prose-neutral max-w-none">
      {body.content?.map((node, i) => renderNode(node, i))}
    </div>
  );
}