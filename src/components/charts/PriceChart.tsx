import { ChartSeries } from "@/lib/demo/history";

/**
 * Dependency-free SVG line chart for implied probability over time. Pure /
 * server-renderable (no client JS). Y axis is fixed 0–100% so multiple markets
 * are visually comparable; X axis spans the demo's ~28-tick lookback window.
 */
export function PriceChart({
  series,
  height = 220,
  showLegend = true
}: {
  series: ChartSeries[];
  height?: number;
  showLegend?: boolean;
}) {
  const W = 720;
  const H = height;
  const padL = 34;
  const padR = 12;
  const padT = 12;
  const padB = 22;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const n = Math.max(...series.map((s) => s.points.length), 2);

  const x = (i: number) => padL + (i / (n - 1)) * plotW;
  const y = (v: number) => padT + (1 - v / 100) * plotH;

  const gridY = [0, 25, 50, 75, 100];
  const xTicks = [
    { i: 0, label: "28d" },
    { i: Math.floor((n - 1) / 2), label: "14d" },
    { i: n - 1, label: "now" }
  ];

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }} preserveAspectRatio="none" role="img">
        {/* gridlines + y labels */}
        {gridY.map((g) => (
          <g key={g}>
            <line x1={padL} x2={W - padR} y1={y(g)} y2={y(g)} stroke="#eaeef4" strokeWidth={1} />
            <text x={padL - 6} y={y(g) + 3} textAnchor="end" fontSize="10" fill="#9aa5b6">
              {g}%
            </text>
          </g>
        ))}
        {/* x labels */}
        {xTicks.map((t) => (
          <text key={t.label} x={x(t.i)} y={H - 6} textAnchor="middle" fontSize="10" fill="#9aa5b6">
            {t.label}
          </text>
        ))}
        {/* series */}
        {series.map((s) => {
          const d = s.points.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
          const last = s.points.length - 1;
          return (
            <g key={s.label}>
              {series.length === 1 && (
                <path
                  d={`${d} L${x(last)},${y(0)} L${x(0)},${y(0)} Z`}
                  fill={s.color}
                  fillOpacity={0.08}
                  stroke="none"
                />
              )}
              <path d={d} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
              <circle cx={x(last)} cy={y(s.points[last])} r={3} fill={s.color} />
            </g>
          );
        })}
      </svg>

      {showLegend && (
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 px-1">
          {series.map((s) => (
            <div key={s.label} className="flex items-center gap-1.5 text-xs">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-slate-700">{s.label}</span>
              <span className="tabular font-semibold text-body">{s.currentCents}¢</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Compact inline sparkline (single series), scales to its container width. */
export function Sparkline({ points, color = "#2563eb", width = 320, height = 40 }: { points: number[]; color?: string; width?: number; height?: number }) {
  const n = Math.max(points.length, 2);
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = Math.max(max - min, 1);
  const x = (i: number) => (i / (n - 1)) * width;
  const y = (v: number) => height - 2 - ((v - min) / span) * (height - 4);
  const d = points.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const last = points.length - 1;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }} preserveAspectRatio="none" aria-hidden>
      <path d={`${d} L${x(last)},${height} L0,${height} Z`} fill={color} fillOpacity={0.1} stroke="none" />
      <path d={d} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
