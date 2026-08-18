import {
  SketchAnnotation,
  SketchArrow,
  SketchCheck,
  SketchCircle,
  SketchDashedBox,
  SketchDot,
  SketchHeart,
  SketchPaperPlane,
  SketchPlus,
  SketchSpeechBubble,
  SketchSpiral,
  SketchStar,
  SketchWave,
} from "./sketch-doodles"

/**
 * 手绘装饰组合（登录页等大屏场景使用）。
 * 1440x900 画布，仅在大屏（lg+）双栏布局时显示，pointer-events-none 不干扰表单交互。
 */
export function SketchDecorations() {
  return (
    <div
      aria-hidden
      className="hidden lg:block pointer-events-none absolute inset-0 overflow-hidden"
    >
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full"
      >
        <defs>
          <filter id="sketch-pencil" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.035"
              numOctaves={2}
              seed={3}
              result="noise"
            />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale={2} />
          </filter>
        </defs>

        {/* 主弧形箭头：从左侧文案弯向登录卡片 */}
        <SketchArrow filterId="sketch-pencil" />

        {/* 手写标注 "从这里进入" */}
        <SketchAnnotation
          x={598}
          y={350}
          rotate={-6}
          delay={0.9}
          text="从这里进入"
          filterId="sketch-pencil"
        />

        {/* 四角星（顶部中间） */}
        <SketchStar x={690} y={190} rotate={12} delay={1.1} />

        {/* 手绘小圆圈（青色） */}
        <SketchCircle x={570} y={650} delay={1.2} />

        {/* 加号（深靛蓝） */}
        <SketchPlus x={760} y={690} delay={1.3} />

        {/* 对勾（绿色） */}
        <SketchCheck x={640} y={270} rotate={-8} delay={1.15} />

        {/* 纸飞机（橙色，右上） */}
        <SketchPaperPlane x={870} y={260} rotate={-20} delay={1.25} />

        {/* 虚线手绘方框（左下） */}
        <SketchDashedBox x={490} y={600} rotate={-4} delay={1.35} />

        {/* 散落圆点 */}
        <SketchDot x={540} y={560} r={5} color="#dd5b00" opacity={0.5} />
        <SketchDot x={740} y={290} r={4} color="#0075de" opacity={0.45} />
        <SketchDot x={590} y={270} r={4.5} color="#1aae39" opacity={0.45} />
        <SketchDot x={680} y={560} r={6} color="#d6b6f6" opacity={0.55} />
        <SketchDot x={620} y={730} r={4} color="#ff64c8" opacity={0.4} />
        <SketchDot x={780} y={560} r={3.5} color="#62aef0" opacity={0.5} />
        <SketchDot x={520} y={380} r={3.5} color="#0075de" opacity={0.35} />

        {/* 手绘波浪虚线 */}
        <SketchWave />

        {/* 对话气泡 "Hi!" */}
        <SketchSpeechBubble x={870} y={170} rotate={6} delay={1.4} filterId="sketch-pencil" />

        {/* 螺旋小涂鸦 */}
        <SketchSpiral x={470} y={210} delay={1.5} />

        {/* 小心心（粉色） */}
        <SketchHeart x={820} y={340} delay={1.45} />
      </svg>
    </div>
  )
}
