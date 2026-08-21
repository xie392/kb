"use client";

import { memo, useCallback, useEffect, useState } from "react";

/* ─── ImageBlock 宽度滑块（照搬 demo，UI 调成手绘风格） ─── */
export interface ImageBlockWidthProps {
  onChange: (value: number) => void;
  value: number;
}

export const ImageBlockWidth = memo(({ onChange, value }: ImageBlockWidthProps) => {
  const [currentValue, setCurrentValue] = useState(value);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = parseInt(e.target.value, 10);
      onChange(next);
      setCurrentValue(next);
    },
    [onChange],
  );

  return (
    <div className="flex items-center gap-2 px-1">
      <input
        className="kb-ib-range"
        type="range"
        min={25}
        max={100}
        step={5}
        onChange={handleChange}
        value={currentValue}
      />
      <span className="text-[11px] font-semibold text-ink-muted select-none font-hand-display">
        {value}%
      </span>
    </div>
  );
});

ImageBlockWidth.displayName = "ImageBlockWidth";

export default ImageBlockWidth;
