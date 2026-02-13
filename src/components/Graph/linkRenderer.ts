import { getEdgeColor } from "../../utils/colors";

interface LinkObj {
  source: { x?: number; y?: number; id?: string } | string;
  target: { x?: number; y?: number; id?: string } | string;
  relationship: string;
  label: string;
  strength: number;
}

function getId(val: { id?: string } | string): string {
  return typeof val === "string" ? val : val.id ?? "";
}

function getCoords(val: { x?: number; y?: number } | string) {
  if (typeof val === "string") return { x: 0, y: 0 };
  return { x: val.x ?? 0, y: val.y ?? 0 };
}

export function paintLink(
  link: LinkObj,
  ctx: CanvasRenderingContext2D,
  globalScale: number,
  selectedId: string | null
) {
  const sourceId = getId(link.source);
  const targetId = getId(link.target);
  const src = getCoords(link.source);
  const tgt = getCoords(link.target);

  const isHighlighted = selectedId != null && (sourceId === selectedId || targetId === selectedId);
  const color = getEdgeColor(link.relationship);

  ctx.beginPath();
  ctx.moveTo(src.x, src.y);
  ctx.lineTo(tgt.x, tgt.y);

  if (isHighlighted) {
    ctx.strokeStyle = color;
    ctx.lineWidth = (link.strength * 0.8 + 0.5) / globalScale;
    ctx.globalAlpha = 0.85;
  } else {
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 0.8 / globalScale;
    ctx.globalAlpha = selectedId ? 0.3 : 0.45;
  }

  ctx.stroke();
  ctx.globalAlpha = 1;

  // Label on highlighted edges at sufficient zoom
  if (isHighlighted && globalScale > 0.7) {
    const mx = (src.x + tgt.x) / 2;
    const my = (src.y + tgt.y) / 2;
    const fontSize = 9 / globalScale;
    ctx.font = `${fontSize}px -apple-system, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const text = link.label;
    const textWidth = ctx.measureText(text).width;
    const pad = 3 / globalScale;

    ctx.fillStyle = "rgba(10, 10, 26, 0.85)";
    ctx.fillRect(mx - textWidth / 2 - pad, my - fontSize / 2 - pad, textWidth + pad * 2, fontSize + pad * 2);

    ctx.fillStyle = color;
    ctx.globalAlpha = 0.9;
    ctx.fillText(text, mx, my);
    ctx.globalAlpha = 1;
  }
}
