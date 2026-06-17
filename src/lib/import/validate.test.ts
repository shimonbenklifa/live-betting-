import { describe, it, expect } from "vitest";
import { validateRows, autoMap } from "./validate";
import { parseCsv } from "./parse";
import { csvTemplate } from "./templates";

describe("field mapping", () => {
  it("auto-maps headers via key, label and aliases", () => {
    const mapping = autoMap(["Team", "ABBR", "Captain Email", "home_color"], "teams");
    expect(mapping["Team"]).toBe("team_name");
    expect(mapping["ABBR"]).toBe("team_abbreviation");
    expect(mapping["Captain Email"]).toBe("captain_email");
    expect(mapping["home_color"]).toBe("home_color");
  });
});

describe("CSV parsing", () => {
  it("parses quoted fields with embedded commas", () => {
    const { headers, rows } = parseCsv('team_name,division\n"Brooklyn, NY Ballers",East\n');
    expect(headers).toEqual(["team_name", "division"]);
    expect(rows[0].team_name).toBe("Brooklyn, NY Ballers");
    expect(rows[0].division).toBe("East");
  });

  it("produces a header row for every template", () => {
    expect(csvTemplate("rosters").split("\n")[0]).toContain("jersey_number");
  });
});

describe("row validation", () => {
  const mapping = { team_name: "team_name", team_abbreviation: "team_abbreviation", captain_email: "captain_email" };

  it("flags missing required fields as errors", () => {
    const report = validateRows(
      "teams",
      [{ team_name: "", team_abbreviation: "BK" }],
      { team_name: "team_name", team_abbreviation: "team_abbreviation" }
    );
    expect(report.errorRows).toBe(1);
    expect(report.issues.some((i) => /Team Name is required/.test(i.message))).toBe(true);
  });

  it("validates email format", () => {
    const report = validateRows(
      "teams",
      [{ team_name: "Ballers", team_abbreviation: "BK", captain_email: "not-an-email" }],
      mapping
    );
    expect(report.issues.some((i) => /valid email/.test(i.message))).toBe(true);
  });

  it("detects in-file duplicates by dedupe key", () => {
    const report = validateRows(
      "teams",
      [
        { team_name: "Ballers", team_abbreviation: "BK" },
        { team_name: "ballers", team_abbreviation: "BK2" }
      ],
      { team_name: "team_name", team_abbreviation: "team_abbreviation" }
    );
    expect(report.duplicateRows).toBe(1);
    expect(report.rows[1].isDuplicateInFile).toBe(true);
  });

  it("flags rows that match existing DB records", () => {
    const existing = new Set(["ballers"]);
    const report = validateRows(
      "teams",
      [{ team_name: "Ballers", team_abbreviation: "BK" }],
      { team_name: "team_name", team_abbreviation: "team_abbreviation" },
      existing
    );
    expect(report.issues.some((i) => /existing record/.test(i.message))).toBe(true);
  });

  it("coerces ints and rejects non-integers for jersey numbers", () => {
    const report = validateRows(
      "rosters",
      [
        { team_name: "A", player_first_name: "Jay", player_last_name: "Z", jersey_number: "23" },
        { team_name: "A", player_first_name: "Bo", player_last_name: "X", jersey_number: "2.5" }
      ],
      {
        team_name: "team_name",
        player_first_name: "player_first_name",
        player_last_name: "player_last_name",
        jersey_number: "jersey_number"
      }
    );
    expect(report.rows[0].data.jersey_number).toBe(23);
    expect(report.issues.some((i) => /whole number/.test(i.message))).toBe(true);
  });

  it("validates enum status values", () => {
    const report = validateRows(
      "rosters",
      [{ team_name: "A", player_first_name: "Jay", player_last_name: "Z", status_active_injured_inactive: "hurt" }],
      {
        team_name: "team_name",
        player_first_name: "player_first_name",
        player_last_name: "player_last_name",
        status_active_injured_inactive: "status_active_injured_inactive"
      }
    );
    expect(report.issues.some((i) => /must be one of/.test(i.message))).toBe(true);
  });
});
