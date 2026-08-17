"use client";

import { useEffect, useRef } from "react";
import rough from "roughjs";

export interface TrendItem {
  date: string;
  count: number;
}

const BAR_COLORS = ["#62aef0", "#d6b6f6", "#ff64c8", "#2a9d99", "#62aef0", "#d6b6f6", "#ff64c8"];

/**
 * 手绘风格柱状+折线趋势图，基于真实数据渲染
 */
export default function HandChart({ data }: { data: TrendItem[] }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    svg.innerHTML = "";
    const rc = rough.svg(svg);

    const W = 300;
    const H = 140;
    const items = data.slice(-30);
    const n = items.length;
    const max = Math.max(...items.map((d) => d.count), 1);

    // 坐标轴外框
    rc.rectangle(4, 10, W - 14, H - 25, {
      fill: "rgba(255,255,255,0.4)",
      fillStyle: "solid",
      roughness: 1.2,
      stroke: "rgba(49,48,46,0.6)",
    });

    if (n === 0) return;

    const barW = Math.max(4, Math.min(14, (W - 40) / n - 3));
    const gap = (W - 20 - n * barW) / (n + 1);
    const chartBottom = H - 25;

    // 柱状图
    items.forEach((it, i) => {
      const x = 10 + gap + i * (barW + gap);
      const h = (it.count / max) * (H - 45);
      const y = chartBottom - h;
      rc.rectangle(x, y, barW, Math.max(h, it.count > 0 ? 2 : 0), {
        fill: BAR_COLORS[i % BAR_COLORS.length],
        fillStyle: "hachure",
        hachureAngle: 45,
        hachureGap: 5,
        roughness: 1.6,
        stroke: "rgba(49,48,46,0.6)",
        strokeWidth: 1.2,
      });
    });

    // 手绘折线（跨有数据的点，避免全 0 时折线贴底）
    const active = items.map((it, i) => ({ it, i })).filter(({ it }) => it.count > 0);
    if (active.length > 1) {
      const pts = active.map(({ it, i }) => {
        const x = 10 + gap + i * (barW + gap) + barW / 2;
        const y = chartBottom - (it.count / max) * (H - 45);
        return [x, y] as [number, number];
      });
      rc.linearPath(pts, {
        stroke: "#213183",
        strokeWidth: 2,
        roughness: 1.8,
        fill: "none",
      });
      pts.forEach(([x, y]) => {
        rc.circle(x, y, 4, {
          fill: "#fff",
          fillStyle: "solid",
          stroke: "#213183",
          strokeWidth: 1.5,
          roughness: 1.4,
        });
      });
    }
  }, [data]);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 300 140"
      className="w-full h-auto"
      aria-label="近 30 天笔记增长"
    />
  );
}
