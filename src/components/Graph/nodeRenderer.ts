import type { ContentNode } from "../../types";
import { getNodeBorderColor, getGenreColor } from "../../utils/colors";

export const NODE_WIDTH = 120;
export const NODE_HEIGHT = 190;
const POSTER_HEIGHT = 140;
const TEXT_HEIGHT = 50;
const SMALL_NODE_RADIUS = 6;

export function paintNode(
  node: ContentNode & { x?: number; y?: number },
  ctx: CanvasRenderingContext2D,
  globalScale: number,
  selectedId: string | null,
  hoveredId: string | null,
  imageCache: Map<string, HTMLImageElement>
) {
  const x = node.x ?? 0;
  const y = node.y ?? 0;
  const isSelected = node.id === selectedId;
  const isHovered = node.id === hoveredId;

  const borderColor = getNodeBorderColor(node.genres);

  if (globalScale < 0.6) {
    // Zoomed out: draw dot + label (unchanged)
    const r = SMALL_NODE_RADIUS / globalScale;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fillStyle = borderColor;
    ctx.globalAlpha = isSelected ? 1 : 0.8;
    ctx.fill();

    if (globalScale > 0.3) {
      ctx.font = `${11 / globalScale}px -apple-system, sans-serif`;
      ctx.fillStyle = "#e2e8f0";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.globalAlpha = isSelected ? 1 : 0.7;
      ctx.fillText(node.title, x, y + r + 2 / globalScale);
    }
    ctx.globalAlpha = 1;
    return;
  }

  const w = NODE_WIDTH / globalScale;
  const h = NODE_HEIGHT / globalScale;
  const posterH = POSTER_HEIGHT / globalScale;
  const textH = TEXT_HEIGHT / globalScale;
  const r = 6 / globalScale;

  const left = x - w / 2;
  const top = y - h / 2;

  // Glow for selected/hovered
  if (isSelected || isHovered) {
    ctx.shadowColor = borderColor;
    ctx.shadowBlur = isSelected ? 25 / globalScale : 15 / globalScale;
  }

  // Full card background
  ctx.beginPath();
  roundRect(ctx, left, top, w, h, r);
  ctx.fillStyle = isSelected ? "rgba(20, 20, 50, 0.95)" : "rgba(15, 15, 35, 0.9)";
  ctx.fill();

  // Border
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = (isSelected ? 2.5 : isHovered ? 2 : 1.5) / globalScale;
  ctx.stroke();

  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;

  // --- Poster area (top portion) ---
  const img = imageCache.get(node.id);
  const imgReady = img && img.complete && img.naturalWidth > 0;

  if (imgReady) {
    // Clip to rounded top corners
    ctx.save();
    ctx.beginPath();
    roundRectTop(ctx, left, top, w, posterH, r);
    ctx.clip();
    ctx.drawImage(img, left, top, w, posterH);
    ctx.restore();
  } else {
    // Gradient fallback with initials
    ctx.save();
    ctx.beginPath();
    roundRectTop(ctx, left, top, w, posterH, r);
    ctx.clip();

    const genreColor = node.genres.length > 0 ? getGenreColor(node.genres[0]) : "#8b5cf6";
    const grad = ctx.createLinearGradient(left, top, left, top + posterH);
    grad.addColorStop(0, genreColor + "55");
    grad.addColorStop(1, genreColor + "22");
    ctx.fillStyle = grad;
    ctx.fillRect(left, top, w, posterH);

    // Initials
    const initials = node.title
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();
    const initialsFontSize = 28 / globalScale;
    ctx.font = `bold ${initialsFontSize}px -apple-system, sans-serif`;
    ctx.fillStyle = genreColor + "99";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(initials, x, top + posterH / 2);

    ctx.restore();
  }

  // --- Text area (bottom portion) ---
  const textTop = top + posterH;
  const textCenterY = textTop + textH / 2;

  // Title
  const titleFontSize = 10 / globalScale;
  ctx.font = `bold ${titleFontSize}px -apple-system, sans-serif`;
  ctx.fillStyle = "#f1f5f9";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const maxTextWidth = w - 10 / globalScale;
  let displayTitle = node.title;
  if (ctx.measureText(displayTitle).width > maxTextWidth) {
    while (ctx.measureText(displayTitle + "...").width > maxTextWidth && displayTitle.length > 0) {
      displayTitle = displayTitle.slice(0, -1);
    }
    displayTitle += "...";
  }
  ctx.fillText(displayTitle, x, textCenterY - 8 / globalScale);

  // Genre + Year line
  if (node.genres.length > 0) {
    const subFontSize = 7.5 / globalScale;
    ctx.font = `${subFontSize}px -apple-system, sans-serif`;
    ctx.fillStyle = "#94a3b8";

    const genreText = node.genres.slice(0, 2).join(" / ");
    const yearText = String(node.year);
    const fullText = `${genreText}  ${yearText}`;

    // Measure and potentially truncate
    if (ctx.measureText(fullText).width <= maxTextWidth) {
      // Draw genre left-aligned, year right-aligned
      ctx.textAlign = "left";
      ctx.fillText(genreText, left + 5 / globalScale, textCenterY + 7 / globalScale);
      ctx.textAlign = "right";
      ctx.fillStyle = "#64748b";
      ctx.fillText(yearText, left + w - 5 / globalScale, textCenterY + 7 / globalScale);
    } else {
      // Too wide, just center the genres
      ctx.textAlign = "center";
      ctx.fillText(genreText, x, textCenterY + 7 / globalScale);
    }
  }
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/** Rounded rect with only top corners rounded (for poster clip) */
function roundRectTop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export function getNodeBBox(globalScale: number) {
  if (globalScale < 0.6) return { width: 12, height: 12 };
  return { width: NODE_WIDTH / globalScale, height: NODE_HEIGHT / globalScale };
}
