/* Pure-SVG charts — no dependency, scale to container, accessible via role/label. */

export function Sparkline({ data, up }: { data: number[]; up: boolean }) {
  const W = 100, H = 28, min = Math.min(...data), max = Math.max(...data);
  const span = max - min || 1;
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * W,
    H - ((v - min) / span) * (H - 4) - 2,
  ]);
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const stroke = up ? "var(--color-success)" : "var(--color-danger)";
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-7 w-full" aria-hidden="true">
      <path d={d} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** Smooth area chart via Catmull-Rom → Bézier. */
export function AreaChart({
  data,
  label,
}: {
  data: { day: string; value: number }[];
  label: string;
}) {
  const W = 680, H = 240, padX = 8, padTop = 16, padBot = 28;
  const values = data.map((d) => d.value);
  const min = Math.min(...values) * 0.9;
  const max = Math.max(...values) * 1.05;
  const span = max - min || 1;
  const x = (i: number) => padX + (i / (data.length - 1)) * (W - padX * 2);
  const y = (v: number) => padTop + (1 - (v - min) / span) * (H - padTop - padBot);

  const pts = data.map((d, i) => [x(i), y(d.value)] as [number, number]);
  // Catmull-Rom to cubic Bézier
  let line = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    line += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  const area = `${line} L ${pts[pts.length - 1][0]} ${H - padBot} L ${pts[0][0]} ${H - padBot} Z`;
  const gridYs = [0.25, 0.5, 0.75].map((t) => padTop + t * (H - padTop - padBot));
  const ticks = [0, Math.floor((data.length - 1) / 2), data.length - 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" role="img" aria-label={label}>
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {gridYs.map((gy, i) => (
        <line key={i} x1={padX} x2={W - padX} y1={gy} y2={gy} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      ))}
      <path d={area} fill="url(#areaFill)" />
      <path d={line} fill="none" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      {pts.map((p, i) => (i === pts.length - 1 ? (
        <circle key={i} cx={p[0]} cy={p[1]} r="3.5" fill="var(--color-accent)" stroke="var(--color-background)" strokeWidth="2" />
      ) : null))}
      {ticks.map((ti) => (
        <text key={ti} x={x(ti)} y={H - 8} fill="var(--color-muted-2)" fontSize="11" textAnchor={ti === 0 ? "start" : ti === data.length - 1 ? "end" : "middle"}>
          {data[ti].day}
        </text>
      ))}
    </svg>
  );
}
