"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface CounterProps {
  value: number;
  suffix?: string;
  label: string;
  index?: number;
}

export default function Counter({
  value,
  suffix = "",
  label,
  index = 0,
}: CounterProps) {
  const numRef = useRef<HTMLSpanElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = numRef.current;
      if (!el) return;

      const obj = { v: 0 };
      const tween = gsap.to(obj, {
        v: value,
        duration: 1.6,
        ease: "power3.out",
        delay: index * 0.12,
        scrollTrigger: {
          trigger: wrapRef.current,
          start: "top 85%",
          once: true,
        },
        onUpdate: () => {
          el.textContent = String(Math.round(obj.v));
        },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    },
    { scope: wrapRef }
  );

  return (
    <div ref={wrapRef} className="text-center relative">
      <div className="text-[42px] font-bold tracking-[-1px] text-ink tabular-nums leading-none">
        <span ref={numRef}>0</span>
        <span className="text-[20px] text-ink-faint ml-0.5">{suffix}</span>
      </div>
      <div className="mt-2.5 text-[11px] tracking-[0.125px] text-ink-faint uppercase">
        {label}
      </div>
    </div>
  );
}
