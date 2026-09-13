"use client";

import { useLayoutEffect } from "react";

/**
 * 骨架屏挂载时把视口拉回顶部。
 *
 * 背景：客户端跳转时，Next 的「滚动到顶部」要等真实内容提交才执行，
 * 而 segment 级 loading 骨架（静态壳 / 预取结果）会先渲染一帧。这一帧里
 * 浏览器仍保留上一页的 scrollY，若骨架比上一页的滚动位置矮，滚动条会被
 * 钳到骨架页的底部 —— 表现就是「只看到骨架的下半部分」（首页滚到中间
 * 再点文章最典型）。这里在骨架出现时归零，结果与 Next 随后的滚动重置一致，
 * 不会互相打架；视口已在顶部时直接跳过，避免多余的重排。
 *
 * 用 useLayoutEffect（Next 自己的 LayoutRouter 滚动处理也是这个时机）：
 * 保证归零和骨架在同一帧提交前完成，不会闪一帧"停在旧位置"的骨架。
 */
export function ScrollResetOnMount() {
  useLayoutEffect(() => {
    if (window.scrollY !== 0) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, []);

  return null;
}
