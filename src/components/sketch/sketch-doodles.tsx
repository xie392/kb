import type { CSSProperties } from "react"

/**
 * 手绘装饰图元（doodle）通用属性。
 * 所有图元渲染在 1440x900 的 SVG 画布坐标系中，通过 x/y/rotate 定位，
 * delay 控制入场动画延迟，color 控制描边/填充色。
 */
export interface SketchDoodleProps {
  x?: number
  y?: number
  rotate?: number
  delay?: number
  color?: string
  className?: string
}

/** 通用入场动画（淡入上浮），延迟单位秒 */
export function doodleAnimation(delay = 0): CSSProperties {
  return {
    animation: `fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s both`,
  }
}

function doodleTransform(x = 0, y = 0, rotate = 0, extra = "") {
  return `translate(${x},${y}) rotate(${rotate})${extra}`
}

/** 四角星 */
export function SketchStar({
  x = 0,
  y = 0,
  rotate = 0,
  delay,
  color = "#0075de",
  className,
}: SketchDoodleProps) {
  return (
    <g
      stroke={color}
      strokeWidth={2.8}
      strokeLinecap="round"
      fill="none"
      transform={doodleTransform(x, y, rotate)}
      style={doodleAnimation(delay)}
      className={className}
    >
      <path d="M 0 -18 L 0 18 M -18 0 L 18 0" />
      <path d="M -11 -11 L 11 11 M -11 11 L 11 -11" strokeWidth={1.8} opacity={0.65} />
    </g>
  )
}

/** 手绘小圆圈（椭圆） */
export function SketchCircle({
  x = 0,
  y = 0,
  rotate = 0,
  delay,
  color = "#2a9d99",
  className,
}: SketchDoodleProps) {
  return (
    <g
      stroke={color}
      strokeWidth={2.8}
      fill="none"
      transform={doodleTransform(x, y, rotate)}
      style={doodleAnimation(delay)}
      className={className}
    >
      <ellipse cx="0" cy="0" rx="24" ry="18" transform="rotate(-20)" />
    </g>
  )
}

/** 加号 */
export function SketchPlus({
  x = 0,
  y = 0,
  rotate = 0,
  delay,
  color = "#213183",
  className,
}: SketchDoodleProps) {
  return (
    <g
      stroke={color}
      strokeWidth={2.8}
      strokeLinecap="round"
      fill="none"
      transform={doodleTransform(x, y, rotate)}
      style={doodleAnimation(delay)}
      className={className}
    >
      <path d="M 0 -13 L 0 13 M -13 0 L 13 0" />
    </g>
  )
}

/** 对勾 */
export function SketchCheck({
  x = 0,
  y = 0,
  rotate = 0,
  delay,
  color = "#1aae39",
  className,
}: SketchDoodleProps) {
  return (
    <g
      stroke={color}
      strokeWidth={3}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      transform={doodleTransform(x, y, rotate)}
      style={doodleAnimation(delay)}
      className={className}
    >
      <path d="M -12 2 L -3 12 L 14 -10" />
    </g>
  )
}

/** 纸飞机 */
export function SketchPaperPlane({
  x = 0,
  y = 0,
  rotate = 0,
  delay,
  color = "#dd5b00",
  className,
}: SketchDoodleProps) {
  return (
    <g transform={doodleTransform(x, y, rotate)} style={doodleAnimation(delay)} className={className}>
      <path
        d="M 0 0 L 36 14 L 28 18 L 0 4 Z M 0 0 L 28 18 L 20 22 L 0 4 Z"
        fill={color}
        fillOpacity={0.15}
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
      />
    </g>
  )
}

/** 虚线手绘方框 */
export function SketchDashedBox({
  x = 0,
  y = 0,
  rotate = 0,
  delay,
  color = "#31302e",
  className,
}: SketchDoodleProps) {
  return (
    <g transform={doodleTransform(x, y, rotate)} style={doodleAnimation(delay)} className={className}>
      <rect
        x={-30}
        y={-22}
        width={60}
        height={44}
        rx={6}
        fill="none"
        stroke={color}
        strokeWidth={1.8}
        strokeDasharray="5 4"
        opacity={0.35}
      />
    </g>
  )
}

/** 散落圆点 */
export function SketchDot({
  x = 0,
  y = 0,
  delay,
  color = "#0075de",
  r = 4,
  opacity = 0.5,
  className,
}: SketchDoodleProps & { r?: number; opacity?: number }) {
  return (
    <circle cx={x} cy={y} r={r} fill={color} opacity={opacity} style={doodleAnimation(delay)} className={className} />
  )
}

/** 手绘波浪虚线 */
export function SketchWave({
  x = 0,
  y = 0,
  delay,
  color = "#31302e",
  className,
}: SketchDoodleProps) {
  const d = `M ${440 + x} ${800 + y} Q ${500 + x} ${775 + y}, ${560 + x} ${800 + y} T ${680 + x} ${800 + y} T ${800 + x} ${800 + y}`
  return (
    <path
      d={d}
      stroke={color}
      strokeWidth={1.6}
      fill="none"
      strokeLinecap="round"
      opacity={0.22}
      strokeDasharray="3 6"
      style={doodleAnimation(delay)}
      className={className}
    />
  )
}

/** 对话气泡（含文字） */
export function SketchSpeechBubble({
  x = 0,
  y = 0,
  rotate = 0,
  delay,
  text = "Hi!",
  textColor = "#213183",
  color = "#31302e",
  filterId = "sketch-pencil",
  className,
}: SketchDoodleProps & { text?: string; textColor?: string; filterId?: string }) {
  return (
    <g transform={doodleTransform(x, y, rotate)} style={doodleAnimation(delay)} className={className}>
      <path
        d="M 0 0 Q 0 -34, 46 -34 Q 92 -34, 92 0 Q 92 24, 56 26 L 48 42 L 44 26 Q 0 24, 0 0 Z"
        fill="#fff"
        stroke={color}
        strokeWidth={1.8}
        opacity={0.9}
        filter={`url(#${filterId})`}
      />
      <text
        x={46}
        y={-4}
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="var(--font-hand-display), Caveat, cursive"
        fontSize={22}
        fontWeight={700}
        fill={textColor}
      >
        {text}
      </text>
    </g>
  )
}

/** 螺旋小涂鸦 */
export function SketchSpiral({
  x = 0,
  y = 0,
  rotate = 0,
  delay,
  color = "#62aef0",
  className,
}: SketchDoodleProps) {
  return (
    <g
      stroke={color}
      strokeWidth={2}
      fill="none"
      strokeLinecap="round"
      opacity={0.5}
      transform={doodleTransform(x, y, rotate)}
      style={doodleAnimation(delay)}
      className={className}
    >
      <path d="M 0 0 C 10 -10, 22 -5, 20 8 C 18 20, 2 22, -6 12 C -14 2, -8 -16, 8 -18" />
    </g>
  )
}

/** 小心心 */
export function SketchHeart({
  x = 0,
  y = 0,
  rotate = 0,
  delay,
  color = "#ff64c8",
  className,
}: SketchDoodleProps) {
  return (
    <g transform={doodleTransform(x, y, rotate)} style={doodleAnimation(delay)} className={className}>
      <path
        d="M 0 6 C -10 -4, -20 4, 0 16 C 20 4, 10 -4, 0 6 Z"
        fill={color}
        fillOpacity={0.2}
        stroke={color}
        strokeWidth={1.8}
        opacity={0.6}
      />
    </g>
  )
}

/** 手写标注（文字 + 曲线下划线） */
export function SketchAnnotation({
  x = 0,
  y = 0,
  rotate = 0,
  delay,
  text,
  color = "#523410",
  underline = true,
  underlineColor = "#dd5b00",
  filterId = "sketch-pencil",
  fontSize = 26,
  className,
}: SketchDoodleProps & {
  text: string
  underline?: boolean
  underlineColor?: string
  filterId?: string
  fontSize?: number
}) {
  return (
    <g style={doodleAnimation(delay)} transform={doodleTransform(x, y, rotate)} className={className}>
      <text
        x={0}
        y={0}
        fontFamily="var(--font-hand-display), Caveat, cursive"
        fontSize={fontSize}
        fontWeight={700}
        fill={color}
      >
        {text}
      </text>
      {underline && (
        <path
          d={`M ${-2} ${20} Q ${70} ${10}, ${150} ${22}`}
          stroke={underlineColor}
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
          opacity={0.6}
          filter={`url(#${filterId})`}
        />
      )}
    </g>
  )
}

/** 主弧形箭头（铅笔质感，带手绘描边动画） */
export function SketchArrow({
  delay = 0.3,
  color = "#615d59",
  filterId = "sketch-pencil",
  className,
}: Pick<SketchDoodleProps, "delay" | "color" | "className"> & { filterId?: string }) {
  return (
    <g
      style={{
        stroke: color,
        strokeWidth: 2.6,
        fill: "none",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        animation: `sketch-draw 1.4s cubic-bezier(0.65, 0, 0.35, 1) ${delay}s both`,
      }}
      className={className}
    >
      <path d="M 560 490 C 650 390, 740 370, 820 410" filter={`url(#${filterId})`} />
      <path d="M 810 398 L 834 416 L 810 428" filter={`url(#${filterId})`} />
    </g>
  )
}
