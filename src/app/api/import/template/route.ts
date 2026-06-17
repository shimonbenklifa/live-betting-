import { NextRequest } from "next/server";
import { csvTemplate } from "@/lib/import/templates";
import { ImportType } from "@/lib/import/types";

const VALID: ImportType[] = [
  "teams", "rosters", "players", "coaches", "games", "player_stats", "team_standings", "historical_stats"
];

export function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type") as ImportType | null;
  if (!type || !VALID.includes(type)) {
    return new Response("Unknown template type", { status: 400 });
  }
  return new Response(csvTemplate(type), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${type}_template.csv"`
    }
  });
}
