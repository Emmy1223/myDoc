import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
} from "docx";
import { createWorker } from "tesseract.js";

type RawItem = {
  text: string;
  fontSize: number;
  y: number;
  x: number;
};

type LineItem = {
  text: string;
  fontSize: number;
  y: number;
  x: number;
  rightX: number;
  pageNum: number;
  gapAbove: number;
  isRightAligned: boolean;
  isStandalone: boolean;
};

type DetectedTable = {
  pageNum: number;
  startY: number;
  endY: number;
  rows: string[][];
  colCount: number;
};

const PARAGRAPH_BREAK_RATIO = 1.4;
const INDENT_THRESHOLD = 18;
const RIGHT_ALIGN_MARGIN = 30;
const STANDALONE_MAX_LEN = 60;
const OCR_MIN_CHARS_PER_PAGE = 40;

export async function convertPdfToDocx(
  file: File,
  onProgress?: (message: string) => void,
): Promise<Blob> {
  onProgress?.("Reading PDF…");

  const isIOS =
    typeof navigator !== "undefined" &&
    /iPhone|iPad|iPod/.test(navigator.userAgent);

  const pdfjs = isIOS
    ? await import("pdfjs-dist/legacy/build/pdf.mjs")
    : await import("pdfjs-dist");

  if (isIOS) {
    pdfjs.GlobalWorkerOptions.workerSrc = "disabled";
    // @ts-ignore
    pdfjs.GlobalWorkerOptions.workerPort = null;
  } else {
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  }

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  const allLines: LineItem[] = [];
  const detectedTables: DetectedTable[] = [];
  let paragraphBreakThreshold = 20;

  let ocrWorker: any = null;

  const getOcrWorker = async (): Promise<any> => {
    if (ocrWorker) return ocrWorker;
    onProgress?.("Preparing OCR engine…");
    ocrWorker = await createWorker("eng");
    return ocrWorker;
  };

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    onProgress?.(`Reading page ${pageNum} of ${pdf.numPages}…`);
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const viewport = page.getViewport({ scale: 1 });
    const pageWidth = viewport.width;

    const rawItems: RawItem[] = [];
    for (const item of content.items as any[]) {
      if (!item.str || item.str.trim().length === 0) continue;
      const y = item.transform[5];
      const x = item.transform[4];
      const fontSize = Math.abs(item.transform[0]) || item.height || 12;
      rawItems.push({ text: item.str, fontSize, y, x });
    }

    const nativeTextLength = rawItems.reduce(
      (sum, item) => sum + item.text.length,
      0,
    );
    const shouldRunOcr = nativeTextLength < OCR_MIN_CHARS_PER_PAGE;

    if (shouldRunOcr) {
      onProgress?.(`Scanning page ${pageNum} with OCR…`);
      try {
        const ocrScale = 2;
        const ocrViewport = page.getViewport({ scale: ocrScale });
        const canvas = document.createElement("canvas");
        canvas.width = ocrViewport.width;
        canvas.height = ocrViewport.height;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          await page.render({
            canvas,
            canvasContext: ctx,
            viewport: ocrViewport,
          } as any).promise;

          const worker = await getOcrWorker();
          const ocrResult = await worker.recognize(canvas);

          const ocrText: string[] = ((ocrResult.data.text || "") as string)
            .split(/\n/)
            .map((line: string) => line.trim())
            .filter((line: string) => line.length > 0);

          for (let i = 0; i < ocrText.length; i++) {
            const line = ocrText[i];
            const syntheticY = (ocrText.length - i) * 20;
            const fontSize = 12;
            allLines.push({
              text: line,
              fontSize,
              y: syntheticY,
              x: 0,
              rightX: line.length * fontSize * 0.5,
              pageNum,
              gapAbove: i === 0 ? 0 : 20,
              isRightAligned: false,
              isStandalone: false,
            });
          }

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          canvas.width = 0;
          canvas.height = 0;

          continue;
        }
      } catch (ocrError) {
        console.error("OCR failed on page", pageNum, ocrError);
        onProgress?.(
          `OCR failed on page ${pageNum}, using native text if any…`,
        );
      }
    }

    if (rawItems.length === 0) continue;

    rawItems.sort((a, b) => {
      if (Math.abs(a.y - b.y) > 0.5) return b.y - a.y;
      return a.x - b.x;
    });

    const TOLERANCE = 4;
    const lineGroups: RawItem[][] = [];
    for (const item of rawItems) {
      const last = lineGroups[lineGroups.length - 1];
      if (last && Math.abs(last[0].y - item.y) <= TOLERANCE) {
        last.push(item);
      } else {
        lineGroups.push([item]);
      }
    }

    const pageTables = detectTablesOnPage(lineGroups, pageNum);

    const isInsideTable = (item: RawItem) => {
      for (const t of pageTables) {
        if (item.y <= t.startY && item.y >= t.endY) return true;
      }
      return false;
    };

    const pageLines: {
      text: string;
      fontSize: number;
      y: number;
      x: number;
      rightX: number;
    }[] = [];

    for (const group of lineGroups) {
      if (group.every((item) => isInsideTable(item))) continue;

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
      const x = Math.min(...group.map((g) => g.x));
      const rightX = Math.max(
        ...group.map((g) => g.x + g.text.length * g.fontSize * 0.5),
      );
      const y = group[0].y;

      const last = pageLines[pageLines.length - 1];
      if (last && last.text === text && Math.abs(last.y - y) < 1) continue;

      pageLines.push({ text, fontSize, y, x, rightX });
    }

    if (pageLines.length === 0) continue;

    const gaps: number[] = [];
    for (let i = 1; i < pageLines.length; i++) {
      gaps.push(Math.abs(pageLines[i - 1].y - pageLines[i].y));
    }
    const sortedGaps = [...gaps].sort((a, b) => a - b);
    const medianGap =
      sortedGaps.length > 0
        ? sortedGaps[Math.floor(sortedGaps.length / 2)]
        : 14;

    paragraphBreakThreshold =
      (medianGap > 0 ? medianGap : 14) * PARAGRAPH_BREAK_RATIO;

    for (let i = 0; i < pageLines.length; i++) {
      const line = pageLines[i];
      const gapAbove = i === 0 ? 0 : Math.abs(pageLines[i - 1].y - line.y);

      const isRightAligned =
        pageWidth - line.rightX <= RIGHT_ALIGN_MARGIN &&
        line.x > pageWidth * 0.4;

      const isStandalone =
        line.text.length <= STANDALONE_MAX_LEN &&
        (line.text.endsWith(",") ||
          line.text.endsWith(":") ||
          /^[A-Z\s]+$/.test(line.text) ||
          /^(Dear|Yours|Sincerely|Regards|Best|Warm|Faithfully)/i.test(
            line.text,
          ));

      allLines.push({
        text: line.text,
        fontSize: line.fontSize,
        y: line.y,
        x: line.x,
        rightX: line.rightX,
        pageNum,
        gapAbove,
        isRightAligned,
        isStandalone,
      });
    }

    detectedTables.push(...pageTables);
  }

  if (ocrWorker) {
    await ocrWorker.terminate();
  }

  onProgress?.("Building Word document…");

  const sizeCounts = new Map<number, number>();
  for (const line of allLines) {
    const rounded = Math.round(line.fontSize);
    sizeCounts.set(rounded, (sizeCounts.get(rounded) ?? 0) + 1);
  }
  const bodySize =
    [...sizeCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 11;

  const elements: (Paragraph | Table)[] = [];
  let lastPage = 1;
  let lastLine: LineItem | null = null;
  let pendingParagraph = "";

  const flushParagraph = () => {
    if (pendingParagraph.trim().length > 0) {
      elements.push(
        new Paragraph({
          children: [
            new TextRun({
              text: pendingParagraph.trim(),
              size: bodySize * 2,
            }),
          ],
        }),
      );
      pendingParagraph = "";
    }
  };

  const sortedTables = [...detectedTables].sort((a, b) => {
    if (a.pageNum !== b.pageNum) return a.pageNum - b.pageNum;
    return b.startY - a.startY;
  });
  let tableCursor = 0;

  const flushDueTables = (line: LineItem) => {
    while (
      tableCursor < sortedTables.length &&
      (sortedTables[tableCursor].pageNum < line.pageNum ||
        (sortedTables[tableCursor].pageNum === line.pageNum &&
          sortedTables[tableCursor].startY > line.y))
    ) {
      flushParagraph();
      elements.push(buildDocxTable(sortedTables[tableCursor]));
      tableCursor++;
    }
  };

  for (const line of allLines) {
    flushDueTables(line);

    if (line.pageNum !== lastPage) {
      flushParagraph();
      elements.push(
        new Paragraph({ children: [new TextRun({ text: "", break: 1 })] }),
      );
      lastPage = line.pageNum;
      lastLine = null;
    }

    const isParagraphBreak =
      lastLine !== null && line.gapAbove > paragraphBreakThreshold;

    if (isParagraphBreak) {
      flushParagraph();
      elements.push(new Paragraph({ children: [] }));
    }

    const continueIntoPrevious =
      lastLine !== null &&
      !isParagraphBreak &&
      !line.isStandalone &&
      lastLine.x === line.x &&
      !/[.!?:;]$/.test(lastLine.text);

    if (continueIntoPrevious) {
      pendingParagraph = `${pendingParagraph} ${line.text}`.trim();
      lastLine = line;
      continue;
    }

    flushParagraph();

    const rounded = Math.round(line.fontSize);
    const isBullet = /^[•\-–—*·]\s+/.test(line.text);
    const bulletText = isBullet
      ? line.text.replace(/^[•\-–—*·]\s+/, "")
      : line.text;

    let heading: (typeof HeadingLevel)[keyof typeof HeadingLevel] | undefined;
    if (rounded >= bodySize + 8) heading = HeadingLevel.HEADING_1;
    else if (rounded >= bodySize + 4) heading = HeadingLevel.HEADING_2;
    else if (rounded >= bodySize + 2) heading = HeadingLevel.HEADING_3;

    if (!isBullet && line.isStandalone) {
      elements.push(
        new Paragraph({
          alignment: line.isRightAligned ? AlignmentType.RIGHT : undefined,
          children: [
            new TextRun({
              text: line.text,
              size: rounded * 2,
            }),
          ],
        }),
      );
      lastLine = line;
      continue;
    }

    pendingParagraph = bulletText;
    if (isBullet) {
      flushParagraph();
      elements.push(
        new Paragraph({
          bullet: { level: 0 },
          children: [
            new TextRun({
              text: bulletText,
              size: rounded * 2,
            }),
          ],
        }),
      );
      pendingParagraph = "";
    } else if (heading) {
      flushParagraph();
      elements.push(
        new Paragraph({
          heading,
          alignment: line.isRightAligned ? AlignmentType.RIGHT : undefined,
          children: [
            new TextRun({
              text: line.text,
              size: rounded * 2,
            }),
          ],
        }),
      );
      pendingParagraph = "";
    }

    lastLine = line;
  }

  flushParagraph();

  while (tableCursor < sortedTables.length) {
    elements.push(buildDocxTable(sortedTables[tableCursor]));
    tableCursor++;
  }

  if (elements.length === 0) {
    elements.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "[No readable text found in this PDF. It may be a scanned document that OCR could not process.]",
            italics: true,
          }),
        ],
      }),
    );
  }

  onProgress?.("Packaging .docx…");

  const doc = new Document({
    sections: [{ properties: {}, children: elements }],
  });

  const blob = await Packer.toBlob(doc);
  return blob;
}

function detectTablesOnPage(
  lineGroups: RawItem[][],
  pageNum: number,
): DetectedTable[] {
  if (lineGroups.length < 3) return [];

  const lines = lineGroups.map((group) => {
    const sorted = [...group].sort((a, b) => a.x - b.x);
    const y = sorted[0].y;
    const minY = Math.min(...sorted.map((i) => i.y));
    const maxY = Math.max(...sorted.map((i) => i.y));
    const xStarts = clusterValues(
      sorted.map((i) => i.x),
      12,
    ).sort((a, b) => a - b);
    const text = sorted
      .map((i) => i.text)
      .join(" ")
      .trim();
    return { y, minY, maxY, xStarts, text, items: sorted };
  });

  const tables: DetectedTable[] = [];
  const used = new Array(lines.length).fill(false);

  let i = 0;
  while (i < lines.length) {
    if (used[i]) {
      i++;
      continue;
    }

    const seed = lines[i];
    if (seed.xStarts.length < 2) {
      i++;
      continue;
    }

    let j = i + 1;
    const members = [i];
    while (j < lines.length) {
      const candidate = lines[j];
      if (candidate.xStarts.length < 2) break;

      const sharedCols = countSharedColumns(
        seed.xStarts,
        candidate.xStarts,
        12,
      );
      if (sharedCols < 2) break;

      const prevY = lines[j - 1].y;
      if (Math.abs(prevY - candidate.y) > 40) break;

      members.push(j);
      j++;
    }

    if (members.length >= 3) {
      const memberLines = members.map((idx) => lines[idx]);
      const allXStarts = memberLines.flatMap((l) => l.xStarts);
      const colBoundaries = clusterValues(allXStarts, 12).sort((a, b) => a - b);

      if (colBoundaries.length < 2) {
        i = j;
        continue;
      }

      const colCount = colBoundaries.length;
      const rows: string[][] = memberLines.map((line) => {
        const row = new Array(colCount).fill("");
        for (const item of line.items) {
          const colIdx = findColumn(item.x, colBoundaries);
          if (colIdx >= 0) {
            row[colIdx] = row[colIdx]
              ? `${row[colIdx]} ${item.text}`
              : item.text;
          }
        }
        return row;
      });

      const allFilled = rows.every(
        (row) => row.filter((c) => c.trim().length > 0).length >= 2,
      );

      if (allFilled) {
        const startY = Math.max(...memberLines.map((l) => l.maxY));
        const endY = Math.min(...memberLines.map((l) => l.minY));
        tables.push({ pageNum, startY, endY, rows, colCount });
        for (const m of members) used[m] = true;
      }
    }

    i = j;
  }

  return tables;
}

function clusterValues(values: number[], tolerance: number): number[] {
  if (values.length === 0) return [];
  const sorted = [...values].sort((a, b) => a - b);
  const clusters: number[] = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    const last = clusters[clusters.length - 1];
    if (Math.abs(sorted[i] - last) > tolerance) {
      clusters.push(sorted[i]);
    }
  }
  return clusters;
}

function countSharedColumns(
  a: number[],
  b: number[],
  tolerance: number,
): number {
  let count = 0;
  for (const x of a) {
    if (b.some((y) => Math.abs(x - y) <= tolerance)) count++;
  }
  return count;
}

function findColumn(x: number, boundaries: number[]): number {
  let best = -1;
  let bestDist = Infinity;
  for (let i = 0; i < boundaries.length; i++) {
    const dist = Math.abs(x - boundaries[i]);
    if (dist < bestDist && dist <= 20) {
      bestDist = dist;
      best = i;
    }
  }
  return best;
}

function buildDocxTable(table: DetectedTable): Table {
  const rows = table.rows.map(
    (row) =>
      new TableRow({
        children: row.map(
          (cellText) =>
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: cellText || "",
                      size: 22,
                    }),
                  ],
                }),
              ],
            }),
        ),
      }),
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
      left: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
      right: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: "E5E5E5" },
      insideVertical: { style: BorderStyle.SINGLE, size: 4, color: "E5E5E5" },
    },
    rows,
  });
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
