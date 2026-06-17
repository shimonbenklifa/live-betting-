/** Bulk-import domain types (CSV/XLSX → validated rows). */

export type ImportType =
  | "teams"
  | "rosters"
  | "players"
  | "coaches"
  | "games"
  | "player_stats"
  | "team_standings"
  | "historical_stats";

export type FieldType = "string" | "int" | "number" | "email" | "phone" | "enum" | "date";

export interface FieldDef {
  /** Canonical column key stored in the DB. */
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  /** Header aliases auto-detected by the field-mapping screen. */
  aliases?: string[];
  /** Allowed values for `enum` fields. */
  values?: string[];
  /** Field(s) that together identify a duplicate row. */
  dedupeKey?: boolean;
}

export interface ImportTemplate {
  type: ImportType;
  title: string;
  description: string;
  fields: FieldDef[];
}

export interface RowIssue {
  row: number; // 1-based, excluding header
  field?: string;
  severity: "error" | "warning";
  message: string;
}

export interface ValidatedRow {
  row: number;
  data: Record<string, unknown>;
  /** Stable key used for duplicate detection within the file and against DB. */
  dedupeSignature: string;
  isDuplicateInFile: boolean;
  issues: RowIssue[];
}

export interface ValidationReport {
  type: ImportType;
  totalRows: number;
  validRows: number;
  errorRows: number;
  warningRows: number;
  duplicateRows: number;
  rows: ValidatedRow[];
  issues: RowIssue[];
}
