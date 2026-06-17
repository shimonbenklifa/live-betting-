import { TopBar } from "@/components/layout/TopBar";
import { Badge, Card, CardHeader } from "@/components/ui";
import { ImportWizard } from "@/components/admin/ImportWizard";
import { getCurrentUser, getImportBatches, getPortfolio } from "@/lib/data";
import { formatDateTime } from "@/lib/utils";

const statusTone: Record<string, "yes" | "warn" | "no" | "muted"> = {
  committed: "yes",
  previewed: "warn",
  rolled_back: "muted",
  failed: "no",
  pending: "muted"
};

export default async function ImportCenterPage() {
  const [user, portfolio, batches] = await Promise.all([getCurrentUser(), getPortfolio(), getImportBatches()]);

  return (
    <div className="pb-16 md:pb-0">
      <TopBar title="Bulk Import Center" subtitle="Upload · map · validate · preview · commit · rollback" cash={portfolio.cash} userName={user.displayName} />
      <div className="space-y-6 px-4 py-5 md:px-6">
        <ImportWizard />

        <Card>
          <CardHeader title="Import history" subtitle="Every batch is auditable and reversible" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-muted">
                <tr className="border-b border-line">
                  <th className="px-4 py-2 font-medium">When</th>
                  <th className="px-4 py-2 font-medium">Type</th>
                  <th className="px-4 py-2 font-medium">File</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 text-right font-medium">Rows</th>
                  <th className="px-4 py-2 text-right font-medium">Errors</th>
                  <th className="px-4 py-2 text-right font-medium">Committed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {batches.map((b) => (
                  <tr key={b.id} className="hover:bg-ink-700">
                    <td className="px-4 py-2.5 text-muted">{formatDateTime(b.createdAt)}</td>
                    <td className="px-4 py-2.5 capitalize text-slate-700">{b.type.replace(/_/g, " ")}</td>
                    <td className="px-4 py-2.5 text-slate-700">{b.filename}</td>
                    <td className="px-4 py-2.5"><Badge tone={statusTone[b.status] ?? "muted"}>{b.status}</Badge></td>
                    <td className="px-4 py-2.5 text-right tabular text-slate-700">{b.totalRows}</td>
                    <td className="px-4 py-2.5 text-right tabular text-no">{b.errorRows}</td>
                    <td className="px-4 py-2.5 text-right tabular text-yes">{b.committedRows}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
