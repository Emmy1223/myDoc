// lib/pdf-table-parser.ts
import { PdfTableExtractor } from "pdftables-ts";

export interface ExtractedTable {
  pageIndex: number;
  rows: string[][];
}

export async function extractTablesFromPdf(
  arrayBuffer: ArrayBuffer
): Promise<ExtractedTable[]> {
  const extractor = new PdfTableExtractor();
  
  // Extract tables using default tolerances (good for most text-based PDFs)
  const tables = await extractor.extractTables(arrayBuffer, {
    xTolerance: 4,
    yTolerance: 4,
  });

  return tables.map((table) => ({
    pageIndex: table.pageIndex,
    // Convert cells to plain string grid
    rows: table.rows.map((row) => row.cells.map((c) => c.text.trim())),
  }));
}