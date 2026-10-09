# 用户提供的手绘留言墙与便签

2026-10-09 接入用户提供的石墙、藤蔓和木框背景，以及黄、绿、蓝、粉、紫五色空白纸张。网页文字、作者、时间、回复和删除按钮仍由 HTML 生成。WebP 仅用于网页压缩，原始桌面文件未修改。

`css/message-wall-art.css` 用 CSS 九宫格边框展示素材，让板面和纸张可以随内容变高，保留胶带、卷角和外围装饰。颜色按留言 ID 固定分配，刷新不会变色。

绿色原图的棋盘格是实际 RGB 像素，已通过内置 imagegen 工具转换为真正透明的 PNG，保存在 `note-sage-transparent.png`，网页使用它的 WebP 副本 `note-sage.webp`。其余四张便签使用用户原有 alpha 通道。

绿色便签处理提示词：

> Use case: background-extraction. Remove ONLY the opaque white/gray checkerboard outside the paper and tape, replacing it with actual alpha transparency, NOT a painted checkerboard. Preserve the original sage green paper, handmade watercolor fibers, torn edges, curled lower right corner, pale beige tape at top, original front view and composition. Do not redesign, recolor, add text, add icons, or add other objects. Keep the entire paper and tape with margins; output one transparent PNG asset for a website. Keep the original square 1254 × 1254 composition. This is a cutout operation, not a new illustration.
