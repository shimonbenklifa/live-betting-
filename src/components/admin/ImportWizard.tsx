"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { parseCsv } from "@/lib/import/parse";
import { autoMap, validateRows } from "@/lib/import/validate";
import { IMPORT_TEMPLATES } from "@/lib/import/templates";
import { ImportType, ValidationReport } from "@/lib/import/types";
import { Badge, buttonClass } from "@/components/ui";
import { cn } from "@/lib/utils";

const TYPES: ImportType[] = [
  "teams", "rosters", "players", "coaches", "games", "player_stats", "team_standings", "historical_stats"
];

type Step = "select" | "map" | "preview" | "done";

/**
 * Institutional-grade import flow, entirely client-side for the demo:
 *   1. Select import type      2. Upload CSV/XLSX + auto field mapping
 *   3. Validate + preview (row-level errors, duplicate detection)
 *   4. Commit (persisted with a DB) — with rollback available afterwards.
 */
export function ImportWizard() {
  const [type, setType] = useState<ImportType>("teams");
  const [step, setStep] = useState<Step>("select");
  const [filename, setFilename] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [report, setReport] = useState<ValidationReport | null>(null);

  const fields = IMPORT_TEMPLATES[type].fields;

  async function onFile(file: File) {
    setFilename(file.name);
    let parsed: { headers: string[]; rows: Record<string, string>[] };
    if (file.name.toLowerCase().endsWith(".csv")) {
      parsed = parseCsv(await file.text());
    } else {
      const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
      const hdrs = json.length ? Object.keys(json[0]) : [];
      parsed = {
        headers: hdrs,
        rows: json.map((r) => Object.fromEntries(hdrs.map((h) => [h, r[h] == null ? "" : String(r[h]).trim()])))
      };
    }
    setHeaders(parsed.headers);
    setRows(parsed.rows);
    setMapping(autoMap(parsed.headers, type));
    setStep("map");
  }

  function runValidation() {
    setReport(validateRows(type, rows, mapping));
    setStep("preview");
  }

  function reset() {
    setStep("select");
    setHeaders([]);
    setRows([]);
    setReport(null);
    setFilename("");
  }

  return (
    <div className="rounded-xl border border-line bg-ink-800">
      {/* Stepper */}
      <div className="flex items-center gap-2 border-b border-line px-4 py-3 text-xs">
        {(["select", "map", "preview", "done"] as Step[]).map((s, i) => (
          <span key={s} className={cn("flex items-center gap-1", step === s ? "text-brand" : "text-muted")}>
            <span className={cn("flex h-5 w-5 items-center justify-center rounded-full text-[10px]", step === s ? "bg-brand text-white" : "bg-ink-600")}>{i + 1}</span>
            <span className="capitalize">{s}</span>
            {i < 3 && <span className="px-1 text-muted">›</span>}
          </span>
        ))}
      </div>

      <div className="p-4">
        {step === "select" && (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs text-muted">Import type</label>
              <div className="flex flex-wrap gap-2">
                {TYPES.map((t) => (
                  <button key={t} onClick={() => setType(t)} className={cn("rounded-lg border px-3 py-1.5 text-xs capitalize", t === type ? "border-brand bg-brand/10 text-brand" : "border-line text-muted hover:bg-ink-700")}>
                    {t.replace(/_/g, " ")}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted">{IMPORT_TEMPLATES[type].description}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <a href={`/api/import/template?type=${type}`} className={buttonClass("outline")}>Download {type} template</a>
              <label className={cn(buttonClass("primary"), "cursor-pointer")}>
                Upload CSV / XLSX
                <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
              </label>
            </div>
          </div>
        )}

        {step === "map" && (
          <div className="space-y-4">
            <div className="text-sm text-gray-200">Map columns from <span className="font-medium text-white">{filename}</span> ({rows.length} rows)</div>
            <div className="grid gap-2 sm:grid-cols-2">
              {fields.map((f) => {
                const matchedHeader = Object.entries(mapping).find(([, k]) => k === f.key)?.[0] ?? "";
                return (
                  <div key={f.key} className="flex items-center gap-2 rounded-lg border border-line bg-ink-700 px-3 py-2">
                    <div className="flex-1 text-xs">
                      <div className="font-medium text-white">{f.label}{f.required && <span className="text-no"> *</span>}</div>
                      <div className="text-muted">{f.key}</div>
                    </div>
                    <select
                      value={matchedHeader}
                      onChange={(e) => {
                        const next = { ...mapping };
                        for (const h of Object.keys(next)) if (next[h] === f.key) delete next[h];
                        if (e.target.value) next[e.target.value] = f.key;
                        setMapping(next);
                      }}
                      className="rounded-md border border-line bg-ink-800 px-2 py-1 text-xs text-white"
                    >
                      <option value="">— unmapped —</option>
                      {headers.map((h) => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2">
              <button onClick={runValidation} className={buttonClass("primary")}>Validate & preview</button>
              <button onClick={reset} className={buttonClass("ghost")}>Cancel</button>
            </div>
          </div>
        )}

        {step === "preview" && report && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Tile label="Total rows" value={report.totalRows} />
              <Tile label="Valid" value={report.validRows} tone="text-yes" />
              <Tile label="Errors" value={report.errorRows} tone="text-no" />
              <Tile label="Duplicates" value={report.duplicateRows} tone="text-warn" />
            </div>

            <div className="max-h-80 overflow-auto rounded-lg border border-line">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-ink-700 text-left text-muted">
                  <tr>
                    <th className="px-3 py-2">Row</th>
                    {fields.slice(0, 5).map((f) => <th key={f.key} className="px-3 py-2">{f.label}</th>)}
                    <th className="px-3 py-2">Issues</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {report.rows.map((r) => {
                    const hasError = r.issues.some((i) => i.severity === "error");
                    return (
                      <tr key={r.row} className={cn(hasError && "bg-no/5", r.isDuplicateInFile && "bg-warn/5")}>
                        <td className="px-3 py-1.5 text-muted">{r.row}</td>
                        {fields.slice(0, 5).map((f) => <td key={f.key} className="px-3 py-1.5 text-gray-200">{String(r.data[f.key] ?? "")}</td>)}
                        <td className="px-3 py-1.5">
                          {r.issues.length === 0 ? (
                            <Badge tone="yes">ok</Badge>
                          ) : (
                            <span className="text-[11px] text-no">{r.issues.map((i) => i.message).join("; ")}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStep("done")}
                disabled={report.validRows === 0}
                className={buttonClass("primary")}
              >
                Commit {report.validRows} valid row(s)
              </button>
              <button onClick={() => setStep("map")} className={buttonClass("ghost")}>Back to mapping</button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="space-y-3">
            <div className="rounded-lg bg-yes/10 px-4 py-3 text-sm text-yes">
              Import staged. {report?.validRows} valid rows would be committed to the league, recorded as an
              import batch in the audit log, and remain reversible via <span className="font-medium">rollback</span>.
              Connect a database to persist.
            </div>
            <button onClick={reset} className={buttonClass("outline")}>Start another import</button>
          </div>
        )}
      </div>
    </div>
  );
}

function Tile({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <div className="rounded-lg border border-line bg-ink-700 px-3 py-2">
      <div className="text-[10px] uppercase text-muted">{label}</div>
      <div className={cn("text-lg font-semibold tabular", tone ?? "text-white")}>{value}</div>
    </div>
  );
}
