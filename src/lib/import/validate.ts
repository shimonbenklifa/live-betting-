/**
 * Pure, deterministic validation for bulk imports. Takes already-parsed rows
 * (array of header→value records) plus a field mapping, and returns a row-level
 * report with errors, warnings, and duplicate detection — everything the
 * preview/error screens need before anything is written to the database.
 */

import { IMPORT_TEMPLATES } from "./templates";
import {
  FieldDef,
  ImportType,
  RowIssue,
  ValidatedRow,
  ValidationReport
} from "./types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+0-9()\-.\s]{7,20}$/;

/** Suggest a header→canonical-field mapping using exact and alias matches. */
export function autoMap(headers: string[], type: ImportType): Record<string, string> {
  const fields = IMPORT_TEMPLATES[type].fields;
  const norm = (s: string) => s.trim().toLowerCase().replace(/[\s\-]+/g, "_");
  const mapping: Record<string, string> = {};
  for (const h of headers) {
    const nh = norm(h);
    const match = fields.find(
      (f) => norm(f.key) === nh || norm(f.label) === nh || (f.aliases ?? []).some((a) => norm(a) === nh)
    );
    if (match) mapping[h] = match.key;
  }
  return mapping;
}

function coerce(field: FieldDef, raw: unknown): { value: unknown; issue?: string } {
  const str = raw == null ? "" : String(raw).trim();
  if (str === "") return { value: null };

  switch (field.type) {
    case "int": {
      const n = Number(str);
      if (!Number.isInteger(n)) return { value: str, issue: `"${str}" is not a whole number` };
      return { value: n };
    }
    case "number": {
      const n = Number(str);
      if (!Number.isFinite(n)) return { value: str, issue: `"${str}" is not a number` };
      return { value: n };
    }
    case "email":
      if (!EMAIL_RE.test(str)) return { value: str, issue: `"${str}" is not a valid email` };
      return { value: str.toLowerCase() };
    case "phone":
      if (!PHONE_RE.test(str)) return { value: str, issue: `"${str}" is not a valid phone number` };
      return { value: str };
    case "enum":
      if (field.values && !field.values.includes(str.toLowerCase())) {
        return { value: str, issue: `"${str}" must be one of: ${field.values.join(", ")}` };
      }
      return { value: str.toLowerCase() };
    case "date": {
      const d = new Date(str);
      if (Number.isNaN(d.getTime())) return { value: str, issue: `"${str}" is not a valid date` };
      return { value: d.toISOString() };
    }
    default:
      return { value: str };
  }
}

function dedupeSignature(type: ImportType, data: Record<string, unknown>): string {
  const fields = IMPORT_TEMPLATES[type].fields.filter((f) => f.dedupeKey);
  const keys = fields.length ? fields : IMPORT_TEMPLATES[type].fields.filter((f) => f.required);
  return keys
    .map((f) => String(data[f.key] ?? "").toLowerCase().trim())
    .join("|");
}

/**
 * Validate parsed rows for an import type.
 * @param rawRows   array of header→value objects (header keys, original casing)
 * @param mapping   header → canonical field key (from autoMap or the UI)
 * @param existingSignatures  dedupe signatures already present in the DB
 */
export function validateRows(
  type: ImportType,
  rawRows: Record<string, unknown>[],
  mapping: Record<string, string>,
  existingSignatures: Set<string> = new Set()
): ValidationReport {
  const template = IMPORT_TEMPLATES[type];
  const reverse: Record<string, string> = {}; // canonicalKey -> header
  for (const [header, key] of Object.entries(mapping)) reverse[key] = header;

  const seen = new Set<string>();
  const rows: ValidatedRow[] = [];
  const allIssues: RowIssue[] = [];

  rawRows.forEach((raw, i) => {
    const rowNum = i + 1;
    const data: Record<string, unknown> = {};
    const issues: RowIssue[] = [];

    for (const field of template.fields) {
      const header = reverse[field.key];
      const rawVal = header != null ? raw[header] : undefined;
      const { value, issue } = coerce(field, rawVal);
      data[field.key] = value;

      if (field.required && (value === null || value === undefined || value === "")) {
        issues.push({ row: rowNum, field: field.key, severity: "error", message: `${field.label} is required` });
      } else if (issue) {
        issues.push({ row: rowNum, field: field.key, severity: "error", message: issue });
      }
    }

    const sig = dedupeSignature(type, data);
    const isDuplicateInFile = sig !== "" && seen.has(sig);
    if (isDuplicateInFile) {
      issues.push({ row: rowNum, severity: "warning", message: "Duplicate of an earlier row in this file" });
    } else {
      seen.add(sig);
    }
    if (sig !== "" && existingSignatures.has(sig)) {
      issues.push({ row: rowNum, severity: "warning", message: "Matches an existing record (will be skipped or updated)" });
    }

    allIssues.push(...issues);
    rows.push({ row: rowNum, data, dedupeSignature: sig, isDuplicateInFile, issues });
  });

  const errorRows = rows.filter((r) => r.issues.some((i) => i.severity === "error")).length;
  const warningRows = rows.filter((r) => r.issues.some((i) => i.severity === "warning")).length;
  const duplicateRows = rows.filter((r) => r.isDuplicateInFile).length;

  return {
    type,
    totalRows: rows.length,
    validRows: rows.length - errorRows,
    errorRows,
    warningRows,
    duplicateRows,
    rows,
    issues: allIssues
  };
}
