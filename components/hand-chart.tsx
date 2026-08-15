"use client";

import { useEffect, useRef } from "react";
import rough from "roughjs";

export default function HandChart() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    svg.innerHTML = "";
    const rc = rough.svg(svg);

    const W = 300;
    const H = 140;
    const bars = [42, 58, 36, 74, 61, 88, 52];
    const barW = 22;
    const gap = (W - bars.length * barW) / (bars.length + 1);

    // 坐标轴
    rc.rectangle(gap * 0.4, 10, W - gap * 1.2, H - 25, {
      fill: "rgba(255,255,255,0.4)",
      fillStyle: "solid",
      roughness: 1.2,
      stroke: "rgba(49,48,46,0.6)",
    });

    // 柱状图
    bars.forEach((v, i) => {
      const x = gap + i * (barW + gap);
      const h = (v / 100) * (H - 45);
      const y = H - 25 - h;
      rc.rectangle(x, y, barW, h, {
        fill: ["#62aef0", "#d6b6f6", "#ff64c8", "#2a9d99", "#62aef0", "#d6b6f6", "#ff64c8"][i],
        fillStyle: "hachure",
        hachureAngle: 45,
        hachureGap: 5,
        roughness: 1.6,
        stroke: "rgba(49,48,46,0.6)",
        strokeWidth: 1.2,
      });
    });

    // 手绘折线
    const lineData = [18, 30, 24, 42, 36, 55, 48, 66];
    const pts = lineData.map((v, i) => {
      const x = gap + 8 + (i * (W - gap * 2 - 16)) / (lineData.length - 1);
      const y = H - 25 - (v / 70) * (H - 45);
      return [x, y] as [number, number];
    });
    rc.linearPath(pts, {
      stroke: "#213183",
      strokeWidth: 2,
      roughness: 1.8,
      fill: "none",
    });

    // 点
    pts.forEach(([x, y]) => {
      rc.circle(x, y, 5, {
        fill: "#fff",
        fillStyle: "solid",
        stroke: "#213183",
        strokeWidth: 1.5,
        roughness: 1.4,
      });
    });

    // 手绘箭头（y 轴）
    rc.linearPath(
      [
        [gap * 0.4, 6],
        [gap * 0.4, 10],
      ],
      { stroke: "rgba(49,48,46,0.6)", strokeWidth: 1.2 }
    );
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 300 140"
      className="w-full h-auto"
      aria-label="手绘图表占位符"
    />
  );
}
