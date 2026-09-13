"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useRouter } from "next/navigation";

export interface GraphNodeInput {
  id: string;
  title: string;
  visibility: string;
  viewCount: number;
  degree: number;
  group: string;
}

export interface GraphLinkInput {
  source: string;
  target: string;
}

interface SimNode extends GraphNodeInput {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
}

interface SimLink {
  a: number;
  b: number;
}

/** 分组配色取自设计系统 sticker 调色板（暗色模式下自动读取覆盖后的变量） */
const PALETTE_VARS = [
  "--color-sticker-sky",
  "--color-sticker-purple",
  "--color-sticker-pink",
  "--color-sticker-teal",
  "--color-sticker-green",
  "--color-sticker-orange",
];
const PALETTE_FALLBACK = ["#62aef0", "#d6b6f6", "#ff64c8", "#2a9d99", "#1aae39", "#dd5b00"];

function readVar(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

// 物理参数（简化版 Fruchterman-Reingold）
const REPULSION = 2200;
const SPRING_LENGTH = 64;
const SPRING_K = 0.03;
const GRAVITY = 0.012;
const DAMPING = 0.86;

/**
 * 笔记关系图谱：节点=文章，边=[[双向链接]]。
 * 纯 canvas 力导向布局，支持拖拽固定、悬停高亮邻居、点击跳转。
 */
export default function KnowledgeGraph({
  nodes: inputNodes,
  links: inputLinks,
  truncated = false,
}: {
  nodes: GraphNodeInput[];
  links: GraphLinkInput[];
  truncated?: boolean;
}) {
  const router = useRouter();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simNodes = useRef<SimNode[]>([]);
  const simLinks = useRef<SimLink[]>([]);
  const alphaRef = useRef(1);
  const rafRef = useRef<number | null>(null);
  const sizeRef = useRef({ w: 0, h: 0 });
  const hoverRef = useRef<number>(-1);
  const dragRef = useRef<{ index: number; moved: boolean } | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; node: SimNode } | null>(null);
  const colorsRef = useRef({ link: "#e6e6e6", node: "#0075de", dim: "rgba(0,0,0,0.12)", label: "#615d59" });

  // 分组 -> 颜色（挂载后再从 CSS 变量读取，避免 SSR/CSR 配色不一致）
  const [colorMap, setColorMap] = useState<Map<string, string>>(() => new Map());

  // 初始化 / 重排：按分组扇形螺旋布点
  const layout = useCallback(() => {
    const { w, h } = sizeRef.current;
    const groups = [...new Set(inputNodes.map((n) => n.group))];
    const index = new Map(inputNodes.map((n, i) => [n.id, i]));
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(w, h) * 0.38;

    simNodes.current = inputNodes.map((n, i) => {
      const g = groups.indexOf(n.group);
      const angle = (g / Math.max(1, groups.length)) * Math.PI * 2 + i * 0.35;
      const ring = radius * (0.35 + 0.65 * ((i % 11) / 11));
      return {
        ...n,
        x: cx + Math.cos(angle) * ring + (Math.random() - 0.5) * 12,
        y: cy + Math.sin(angle) * ring + (Math.random() - 0.5) * 12,
        vx: 0,
        vy: 0,
        r: 4 + Math.min(12, n.degree * 1.7),
        color: colorMap.get(n.group) ?? colorsRef.current.node,
      };
    });

    simLinks.current = inputLinks
      .map((l) => ({ a: index.get(l.source) ?? -1, b: index.get(l.target) ?? -1 }))
      .filter((l) => l.a >= 0 && l.b >= 0 && l.a !== l.b);

    alphaRef.current = 1;
  }, [inputNodes, inputLinks, colorMap]);

  // 尺寸自适应
  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      sizeRef.current = { w: rect.width, h: rect.height };
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      alphaRef.current = 0.8; // 尺寸变化后重新收敛
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  // 主题切换时刷新颜色
  useEffect(() => {
    const sync = () => {
      colorsRef.current = {
        link: readVar("--color-hairline", "#e6e6e6"),
        node: readVar("--color-primary", "#0075de"),
        dim: "rgba(128,128,128,0.18)",
        label: readVar("--color-ink-muted", "#615d59"),
      };
      const groups = [...new Set(inputNodes.map((n) => n.group))];
      const map = new Map<string, string>();
      groups.forEach((g, i) => {
        const idx = i % PALETTE_VARS.length;
        map.set(g, readVar(PALETTE_VARS[idx], PALETTE_FALLBACK[idx]));
      });
      setColorMap(map);
      for (const n of simNodes.current) {
        n.color = map.get(n.group) ?? colorsRef.current.node;
      }
      alphaRef.current = Math.max(alphaRef.current, 0.35);
    };
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, [inputNodes]);

  // 首次布点
  useEffect(() => {
    if (sizeRef.current.w > 0) layout();
  }, [layout]);

  // 物理 + 绘制主循环
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const step = () => {
      const nodes = simNodes.current;
      const links = simLinks.current;
      const { w, h } = sizeRef.current;
      const alpha = alphaRef.current;

      if (alpha > 0.012 && w > 0 && h > 0) {
        const cx = w / 2;
        const cy = h / 2;
        const n = nodes.length;

        for (let i = 0; i < n; i++) {
          const a = nodes[i];
          for (let j = i + 1; j < n; j++) {
            const b = nodes[j];
            let dx = a.x - b.x;
            let dy = a.y - b.y;
            let d2 = dx * dx + dy * dy;
            if (d2 < 0.01) {
              dx = Math.random() - 0.5;
              dy = Math.random() - 0.5;
              d2 = 0.01;
            }
            const f = (REPULSION * alpha) / d2;
            const d = Math.sqrt(d2);
            const fx = (dx / d) * f;
            const fy = (dy / d) * f;
            a.vx += fx;
            a.vy += fy;
            b.vx -= fx;
            b.vy -= fy;
          }
        }

        for (const l of links) {
          const a = nodes[l.a];
          const b = nodes[l.b];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const d = Math.max(1, Math.hypot(dx, dy));
          const f = (d - SPRING_LENGTH) * SPRING_K * alpha;
          const fx = (dx / d) * f;
          const fy = (dy / d) * f;
          a.vx += fx;
          a.vy += fy;
          b.vx -= fx;
          b.vy -= fy;
        }

        for (const node of nodes) {
          node.vx += (cx - node.x) * GRAVITY;
          node.vy += (cy - node.y) * GRAVITY;
          node.vx *= DAMPING;
          node.vy *= DAMPING;
          const speed = Math.hypot(node.vx, node.vy);
          if (speed > 18) {
            node.vx = (node.vx / speed) * 18;
            node.vy = (node.vy / speed) * 18;
          }
          node.x += node.vx;
          node.y += node.vy;
          // 边界约束
          node.x = Math.max(node.r + 6, Math.min(w - node.r - 6, node.x));
          node.y = Math.max(node.r + 6, Math.min(h - node.r - 6, node.y));
        }

        alphaRef.current = alpha * 0.985;
      }

      draw();
    };

    const draw = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const { w, h } = sizeRef.current;
      const nodes = simNodes.current;
      const links = simLinks.current;
      const { link, dim } = colorsRef.current;
      const hover = hoverRef.current;

      // 悬停节点及其邻居集合
      let neighbors: Set<number> | null = null;
      if (hover >= 0) {
        neighbors = new Set([hover]);
        for (const l of links) {
          if (l.a === hover) neighbors.add(l.b);
          if (l.b === hover) neighbors.add(l.a);
        }
      }

      ctx.clearRect(0, 0, w, h);

      // 边
      for (const l of links) {
        const a = nodes[l.a];
        const b = nodes[l.b];
        const active = !neighbors || (neighbors.has(l.a) && neighbors.has(l.b));
        ctx.strokeStyle = active ? link : dim;
        ctx.lineWidth = active && neighbors ? 1.6 : 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      // 节点
      const dragged = dragRef.current?.index ?? -1;
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const active = !neighbors || neighbors.has(i);
        ctx.globalAlpha = active ? 1 : 0.22;
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        ctx.fill();

        if (i === hover || i === dragged) {
          ctx.strokeStyle = colorsRef.current.node;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.r + 3, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;

      // 高连接度节点常驻标签
      ctx.fillStyle = colorsRef.current.label;
      ctx.font = '12px ui-sans-serif, system-ui, "PingFang SC", sans-serif';
      ctx.textAlign = "center";
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node.degree >= 3 || i === hover) {
          const label = node.title.length > 14 ? `${node.title.slice(0, 14)}…` : node.title;
          ctx.fillText(label, node.x, node.y - node.r - 5);
        }
      }
    };

    const loop = () => {
      step();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, []);

  // 坐标换算与命中检测
  const toLocal = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const hitTest = (x: number, y: number): number => {
    const nodes = simNodes.current;
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i];
      if ((x - n.x) ** 2 + (y - n.y) ** 2 <= (n.r + 4) ** 2) return i;
    }
    return -1;
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const { x, y } = toLocal(e);
    const idx = hitTest(x, y);
    if (idx >= 0) {
      dragRef.current = { index: idx, moved: false };
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const { x, y } = toLocal(e);
    const drag = dragRef.current;
    if (drag) {
      const n = simNodes.current[drag.index];
      n.x = x;
      n.y = y;
      n.vx = 0;
      n.vy = 0;
      drag.moved = true;
      alphaRef.current = Math.max(alphaRef.current, 0.6);
      return;
    }
    const idx = hitTest(x, y);
    hoverRef.current = idx;
    if (idx >= 0) {
      const n = simNodes.current[idx];
      setTooltip({ x: n.x, y: n.y, node: n });
      e.currentTarget.style.cursor = "pointer";
    } else {
      setTooltip(null);
      e.currentTarget.style.cursor = "grab";
    }
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (drag && !drag.moved) {
      const node = simNodes.current[drag.index];
      if (node) router.push(`/article/${node.id}`);
    }
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <div ref={wrapRef} className="relative w-full h-[calc(100vh-260px)] min-h-100 bg-white sketch-border sketch-shadow overflow-hidden">
      <canvas
        ref={canvasRef}
        className="block w-full h-full touch-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={() => {
          hoverRef.current = -1;
          setTooltip(null);
        }}
      />

      {inputNodes.length === 0 && (
        <div className="absolute inset-0 grid place-items-center pointer-events-none">
          <div className="text-center">
            <div className="font-hand-display text-[24px] font-bold text-ink-faint rotate-[-1deg]">
              还没有可展示的笔记
            </div>
            <div className="mt-2 font-hand-body text-[14px] text-ink-faint">
              在正文里用 [[标题]] 把两篇笔记链接起来，这里就会出现连线
            </div>
          </div>
        </div>
      )}

      {inputNodes.length > 0 && colorMap.size > 0 && (
        <div className="absolute right-3 top-3 max-h-[70%] overflow-y-auto bg-white/85 px-3 py-2 sketch-border">
          <div className="font-hand-body text-[12px] text-ink-faint mb-1">分类</div>
          <div className="space-y-1">
            {[...colorMap.entries()].map(([group, color]) => (
              <div key={group} className="flex items-center gap-1.5 font-hand-body text-[12px] text-ink-muted">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
                <span className="line-clamp-1">{group}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tooltip && (
        <div
          className="absolute z-20 pointer-events-none -translate-x-1/2 -translate-y-full px-3 py-1.5 bg-white sketch-border sketch-shadow max-w-60"
          style={{ left: tooltip.x, top: tooltip.y - tooltip.node.r - 8 }}
        >
          <div className="font-hand-display text-[15px] font-bold text-ink-secondary line-clamp-2">
            {tooltip.node.title}
          </div>
          <div className="mt-0.5 font-hand-body text-[12px] text-ink-faint">
            {tooltip.node.group} · {tooltip.node.degree} 条链接
          </div>
        </div>
      )}

      <div className="absolute left-3 bottom-3 flex items-center gap-3 font-hand-body text-[12px] text-ink-faint">
        <span>节点 {inputNodes.length}</span>
        <span>连线 {inputLinks.length}</span>
        {truncated && <span className="text-sticker-orange">仅显示前 300 篇</span>}
      </div>
    </div>
  );
}
