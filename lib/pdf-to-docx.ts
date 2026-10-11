import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
} from "docx";

type LineItem = {
  text: string;
  fontSize: number;
  y: number;
  pageNum: number;
};

export async function convertPdfToDocx(
  file: File,
  onProgress?: (message: string) => void,
): Promise<Blob> {
  onProgress?.("Reading PDF…");

  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  console.log("[pdf] total pages:", pdf.numPages);

  const allLines: LineItem[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    onProgress?.(`Reading page ${pageNum} of ${pdf.numPages}…`);
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();

    console.log(
      `[pdf] page ${pageNum} items:`,
      content.items.length,
      "sample:",
      content.items.slice(0, 5),
    );

    const rawItems: { text: string; fontSize: number; y: number; x: number }[] = [];
    for (const item of content.items as any[]) {
      if (!item.str || item.str.trim().length === 0) continue;
      const y = item.transform[5];
      const x = item.transform[4];
      const fontSize = Math.abs(item.transform[0]) || item.height || 12;
      rawItems.push({ text: item.str, fontSize, y, x });
    }

    rawItems.sort((a, b) => {
      if (Math.abs(a.y - b.y) > 0.5) return b.y - a.y;
      return a.x - b.x;
    });

    const TOLERANCE = 4;
    const lineGroups: typeof rawItems[] = [];
    for (const item of rawItems) {
      const last = lineGroups[lineGroups.length - 1];
      if (last && Math.abs(last[0].y - item.y) <= TOLERANCE) {
        last.push(item);
      } else {
        lineGroups.push([item]);
      }
    }

    for (const group of lineGroups) {
      group.sort((a, b) => a.x - b.x);

      let text = "";
      let prevEndX = -Infinity;
      for (const g of group) {
        const currentEndX = g.x + g.text.length * g.fontSize * 0.5;
        const needsSpace =
          text.length > 0 && g.x - prevEndX > g.fontSize * 0.15;
        if (needsSpace && !text.endsWith(" ")) text += " ";
        text += g.text;
        prevEndX = currentEndX;
      }
      text = text.replace(/\s+/g, " ").trim();
      if (!text) continue;

      const fontSize = Math.max(...group.map((g) => g.fontSize));
      const y = group[0].y;

      const last = allLines[allLines.length - 1];
      if (last && last.pageNum === pageNum && last.text === text) continue;

      allLines.push({ text, fontSize, y, pageNum });
    }
  }

  onProgress?.("Building Word document…");

  const sizeCounts = new Map<number, number>();
  for (const line of allLines) {
    const rounded = Math.round(line.fontSize);
    sizeCounts.set(rounded, (sizeCounts.get(rounded) ?? 0) + 1);
  }
  const bodySize =
    [...sizeCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 11;

  const paragraphs: Paragraph[] = [];
  let lastPage = 1;

  for (const line of allLines) {
    if (line.pageNum !== lastPage) {
      paragraphs.push(
        new Paragraph({ children: [new TextRun({ text: "", break: 1 })] }),
      );
      lastPage = line.pageNum;
    }

    const rounded = Math.round(line.fontSize);
    const isBullet = /^[•\-–—*·]\s+/.test(line.text);
    const bulletText = isBullet
      ? line.text.replace(/^[•\-–—*·]\s+/, "")
      : line.text;

    let heading: (typeof HeadingLevel)[keyof typeof HeadingLevel] | undefined;
    if (rounded >= bodySize + 8) heading = HeadingLevel.HEADING_1;
    else if (rounded >= bodySize + 4) heading = HeadingLevel.HEADING_2;
    else if (rounded >= bodySize + 2) heading = HeadingLevel.HEADING_3;

    paragraphs.push(
      new Paragraph({
        heading,
        bullet: isBullet ? { level: 0 } : undefined,
        children: [
          new TextRun({
            text: bulletText,
            size: rounded * 2,
          }),
        ],
      }),
    );
  }

  if (paragraphs.length === 0) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "[No readable text found in this PDF. It may be a scanned document.]",
            italics: true,
          }),
        ],
      }),
    );
  }

  onProgress?.("Packaging .docx…");

  const doc = new Document({
    sections: [{ properties: {}, children: paragraphs }],
  });

  const blob = await Packer.toBlob(doc);
  return blob;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}