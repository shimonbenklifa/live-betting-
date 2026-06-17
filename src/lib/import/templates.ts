import { ImportTemplate, ImportType } from "./types";

/**
 * Canonical import templates. Each drives: (1) the downloadable CSV template,
 * (2) the field-mapping screen's auto-detection, and (3) row validation.
 */
export const IMPORT_TEMPLATES: Record<ImportType, ImportTemplate> = {
  teams: {
    type: "teams",
    title: "Teams",
    description: "League teams with colors and captain contact.",
    fields: [
      { key: "team_name", label: "Team Name", type: "string", required: true, dedupeKey: true, aliases: ["team", "name"] },
      { key: "team_abbreviation", label: "Abbreviation", type: "string", required: true, aliases: ["abbr", "abbreviation", "code"] },
      { key: "division", label: "Division", type: "string", required: false, aliases: ["div", "conference"] },
      { key: "captain_name", label: "Captain Name", type: "string", required: false, aliases: ["captain"] },
      { key: "captain_email", label: "Captain Email", type: "email", required: false, aliases: ["email"] },
      { key: "home_color", label: "Home Color", type: "string", required: false },
      { key: "away_color", label: "Away Color", type: "string", required: false }
    ]
  },
  rosters: {
    type: "rosters",
    title: "Rosters",
    description: "Players assigned to teams with jersey and position.",
    fields: [
      { key: "team_name", label: "Team Name", type: "string", required: true, dedupeKey: true, aliases: ["team"] },
      { key: "player_first_name", label: "First Name", type: "string", required: true, dedupeKey: true, aliases: ["first_name", "first"] },
      { key: "player_last_name", label: "Last Name", type: "string", required: true, dedupeKey: true, aliases: ["last_name", "last"] },
      { key: "jersey_number", label: "Jersey #", type: "int", required: false, aliases: ["jersey", "number", "#"] },
      { key: "position", label: "Position", type: "string", required: false, aliases: ["pos"] },
      { key: "email", label: "Email", type: "email", required: false },
      { key: "phone_optional", label: "Phone", type: "phone", required: false, aliases: ["phone"] },
      { key: "height_optional", label: "Height", type: "string", required: false, aliases: ["height"] },
      {
        key: "status_active_injured_inactive",
        label: "Status",
        type: "enum",
        required: false,
        values: ["active", "injured", "inactive"],
        aliases: ["status"]
      }
    ]
  },
  players: {
    type: "players",
    title: "Players",
    description: "Player directory independent of roster assignment.",
    fields: [
      { key: "first_name", label: "First Name", type: "string", required: true, dedupeKey: true },
      { key: "last_name", label: "Last Name", type: "string", required: true, dedupeKey: true },
      { key: "email", label: "Email", type: "email", required: false, dedupeKey: true },
      { key: "position", label: "Position", type: "string", required: false },
      { key: "jersey_number", label: "Jersey #", type: "int", required: false }
    ]
  },
  coaches: {
    type: "coaches",
    title: "Coaches / Captains",
    description: "Team coaches and captains.",
    fields: [
      { key: "team_name", label: "Team Name", type: "string", required: true, dedupeKey: true },
      { key: "name", label: "Name", type: "string", required: true, dedupeKey: true },
      { key: "role", label: "Role", type: "enum", required: false, values: ["coach", "captain", "assistant"] },
      { key: "email", label: "Email", type: "email", required: false }
    ]
  },
  games: {
    type: "games",
    title: "Game Schedule",
    description: "Scheduled games between two teams.",
    fields: [
      { key: "game_date", label: "Date/Time", type: "date", required: true, dedupeKey: true, aliases: ["date", "datetime"] },
      { key: "home_team", label: "Home Team", type: "string", required: true, dedupeKey: true, aliases: ["home"] },
      { key: "away_team", label: "Away Team", type: "string", required: true, dedupeKey: true, aliases: ["away", "visitor"] },
      { key: "venue", label: "Venue", type: "string", required: false, aliases: ["location"] },
      { key: "week", label: "Week", type: "int", required: false, aliases: ["round"] }
    ]
  },
  player_stats: {
    type: "player_stats",
    title: "Player Stats",
    description: "Per-player statline for a week or game.",
    fields: [
      { key: "player_first_name", label: "First Name", type: "string", required: true, dedupeKey: true },
      { key: "player_last_name", label: "Last Name", type: "string", required: true, dedupeKey: true },
      { key: "week", label: "Week", type: "int", required: true, dedupeKey: true },
      { key: "points", label: "Points", type: "number", required: false },
      { key: "assists", label: "Assists", type: "number", required: false },
      { key: "rebounds", label: "Rebounds", type: "number", required: false },
      { key: "steals", label: "Steals", type: "number", required: false },
      { key: "blocks", label: "Blocks", type: "number", required: false }
    ]
  },
  team_standings: {
    type: "team_standings",
    title: "Team Standings",
    description: "Team win/loss record snapshot.",
    fields: [
      { key: "team_name", label: "Team Name", type: "string", required: true, dedupeKey: true },
      { key: "wins", label: "Wins", type: "int", required: true },
      { key: "losses", label: "Losses", type: "int", required: true },
      { key: "points_for", label: "Points For", type: "number", required: false },
      { key: "points_against", label: "Points Against", type: "number", required: false }
    ]
  },
  historical_stats: {
    type: "historical_stats",
    title: "Historical Stats",
    description: "Prior-season aggregate player stats.",
    fields: [
      { key: "player_first_name", label: "First Name", type: "string", required: true, dedupeKey: true },
      { key: "player_last_name", label: "Last Name", type: "string", required: true, dedupeKey: true },
      { key: "season", label: "Season", type: "string", required: true, dedupeKey: true },
      { key: "games_played", label: "Games Played", type: "int", required: false },
      { key: "points_per_game", label: "PPG", type: "number", required: false }
    ]
  }
};

/** Build a CSV template string (header + one example row of blanks). */
export function csvTemplate(type: ImportType): string {
  const fields = IMPORT_TEMPLATES[type].fields;
  const header = fields.map((f) => f.key).join(",");
  const example = fields.map(() => "").join(",");
  return `${header}\n${example}\n`;
}
