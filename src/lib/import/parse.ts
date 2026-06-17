/**
 * File parsing for bulk imports. CSV is parsed with a small dependency-free
 * reader (handles quoted fields and embedded commas/newlines); XLSX is parsed
 * via the `xlsx` package. Both return an array of header→value records, which
 * feed directly into `validateRows`.
 */

import * as XLSX from "xlsx";
import { ImportType } from "./types";
import { autoMap } from "./validate";

/** Minimal RFC-4180-ish CSV parser. */
export function parseCsv(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const records: string[][] = [];
  let field = "";
  let record: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      record.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      record.push(field);
      field = "";
      if (record.some((f) => f.trim() !== "")) records.push(record);
      record = [];
    } else {
      field += c;
    }
  }
  if (field !== "" || record.length) {
    record.push(field);
    if (record.some((f) => f.trim() !== "")) records.push(record);
  }

  if (records.length === 0) return { headers: [], rows: [] };
  const headers = records[0].map((h) => h.trim());
  const rows = records.slice(1).map((r) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => (obj[h] = (r[idx] ?? "").trim()));
    return obj;
  });
  return { headers, rows };
}

/** Parse an XLSX/XLS workbook buffer (first sheet) into header→value records. */
export function parseWorkbook(buffer: ArrayBuffer | Buffer): {
  headers: string[];
  rows: Record<string, string>[];
} {
  const wb = XLSX.read(buffer, { type: "buffer" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  const headers = json.length ? Object.keys(json[0]) : [];
  const rows = json.map((r) => {
    const obj: Record<string, string> = {};
    for (const h of headers) obj[h] = r[h] == null ? "" : String(r[h]).trim();
    return obj;
  });
  return { headers, rows };
}

export function parseFile(
  filename: string,
  data: string | ArrayBuffer | Buffer
): { headers: string[]; rows: Record<string, string>[] } {
  const isCsv = filename.toLowerCase().endsWith(".csv");
  if (isCsv) {
    const text = typeof data === "string" ? data : Buffer.from(data as ArrayBuffer).toString("utf8");
    return parseCsv(text);
  }
  return parseWorkbook(typeof data === "string" ? Buffer.from(data) : data);
}

/** Parse + suggest a field mapping in one step. */
export function parseAndMap(filename: string, data: string | ArrayBuffer | Buffer, type: ImportType) {
  const parsed = parseFile(filename, data);
  return { ...parsed, mapping: autoMap(parsed.headers, type) };
}
