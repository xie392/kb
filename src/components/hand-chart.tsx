"use client";

import { useEffect, useRef } from "react";
import rough from "roughjs";

export interface TrendItem {
  date: string;
  count: number;
}

const GRID_STROKE = "rgba(49,48,46,0.18)";
const LABEL_FILL = "rgba(49,48,46,0.6)";

/**
 * 手绘风格柱状+折线趋势图，基于真实数据渲染
 * - 含 Y 轴刻度网格、X 轴日期标签、峰值标注
 * - 数据极端不均时仍可读（线性比例 + 峰值数字）
 */
export default function HandChart({
  data,
  barFill = "#0075de",
  lineStroke = "#213183",
}: {
  data: TrendItem[];
  barFill?: string;
  lineStroke?: string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    svg.innerHTML = "";
    const rc = rough.svg(svg);

    const W = 640;
    const H = 240;
    const M = { top: 20, right: 16, bottom: 34, left: 42 };
    const cw = W - M.left - M.right;
    const ch = H - M.top - M.bottom;

    const items = data.slice(-30);
    const n = items.length;
    const max = Math.max(...items.map((d) => d.count), 1);

    const xAt = (i: number) => M.left + (cw / n) * i + cw / n / 2;
    const yAt = (v: number) => M.top + ch - (v / max) * ch;

    // Y 轴网格 + 刻度（网格用原生虚线，坐标轴用 roughjs 手绘）
    const ticks = 4;
    for (let i = 0; i <= ticks; i++) {
      const y = M.top + ch - (i / ticks) * ch;
      const val = Math.round((max * i) / ticks);
      if (i > 0) {
        const g = document.createElementNS("http://www.w3.org/2000/svg", "line");
        g.setAttribute("x1", String(M.left));
        g.setAttribute("y1", String(y));
        g.setAttribute("x2", String(M.left + cw));
        g.setAttribute("y2", String(y));
        g.setAttribute("stroke", GRID_STROKE);
        g.setAttribute("stroke-width", "1");
        g.setAttribute("stroke-dasharray", "4,4");
        svg.appendChild(g);
      }
      const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
      t.setAttribute("x", String(M.left - 8));
      t.setAttribute("y", String(y + 4));
      t.setAttribute("text-anchor", "end");
      t.setAttribute("font-size", "11");
      t.setAttribute("fill", LABEL_FILL);
      t.setAttribute("font-family", "inherit");
      t.textContent = String(val);
      svg.appendChild(t);
    }
    // X 轴
    svg.appendChild(
      rc.line(M.left, M.top + ch, M.left + cw, M.top + ch, {
        stroke: "rgba(49,48,46,0.45)",
        strokeWidth: 1.4,
        roughness: 0.6,
      }),
    );

    if (n === 0) return;

    const slot = cw / n;
    const barW = Math.max(5, Math.min(18, slot * 0.58));

    // 柱子
    items.forEach((it, i) => {
      if (it.count <= 0) return;
      const h = Math.max((it.count / max) * ch, 3);
      const x = xAt(i) - barW / 2;
      const y = yAt(it.count);
      svg.appendChild(
        rc.rectangle(x, y, barW, h, {
          fill: barFill,
          fillStyle: "hachure",
          hachureAngle: 45,
          hachureGap: 4,
          roughness: 1.3,
          stroke: barFill,
          strokeWidth: 1,
        }),
      );
    });

    // 折线（连接全部点，0 值也落点）
    const pts: [number, number][] = items.map((it, i) => [xAt(i), yAt(it.count)]);
    svg.appendChild(
      rc.linearPath(pts, {
        stroke: lineStroke,
        strokeWidth: 2,
        roughness: 1.1,
        fill: "none",
      }),
    );

    // 数据点（仅 > 0）
    items.forEach((it, i) => {
      if (it.count <= 0) return;
      svg.appendChild(
        rc.circle(xAt(i), yAt(it.count), 5, {
          fill: "#fff",
          fillStyle: "solid",
          stroke: lineStroke,
          strokeWidth: 1.5,
          roughness: 1.1,
        }),
      );
    });

    // 峰值数字标注
    if (max > 0) {
      const peakIdx = items.findIndex((it) => it.count === max);
      if (peakIdx >= 0) {
        const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
        t.setAttribute("x", String(xAt(peakIdx)));
        t.setAttribute("y", String(yAt(max) - 8));
        t.setAttribute("text-anchor", "middle");
        t.setAttribute("font-size", "12");
        t.setAttribute("font-weight", "700");
        t.setAttribute("fill", lineStroke);
        t.setAttribute("font-family", "inherit");
        t.textContent = String(max);
        svg.appendChild(t);
      }
    }

    // X 轴日期（每 5 天 + 最后一天）
    items.forEach((it, i) => {
      if (i % 5 !== 0 && i !== n - 1) return;
      const parts = it.date.split("-");
      const label = `${parts[1]}/${parts[2]}`;
      const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
      t.setAttribute("x", String(xAt(i)));
      t.setAttribute("y", String(H - M.bottom + 18));
      t.setAttribute("text-anchor", "middle");
      t.setAttribute("font-size", "10");
      t.setAttribute("fill", LABEL_FILL);
      t.setAttribute("font-family", "inherit");
      t.textContent = label;
      svg.appendChild(t);
    });
  }, [data, barFill, lineStroke]);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 640 240"
      className="w-full h-auto"
      aria-label="近 30 天笔记增长"
    />
  );
}
