# 今日微光

无构建依赖的静态网站。运行 python -m http.server 5173 --directory dist，然后访问 http://localhost:5173。

内容位于 dist/content.json，使用北京时间筛选发布日期。每条详情的地址为 #/day/day-001 形式。修改日期即可排期，不需要模型 API。

当前包含 14 条 AI 辅助短句和 7 张自行绘制的 SVG 渐变山影背景。Unsplash 下载被站点验证拦截，摄影素材尚待补充，因此摄影作者和授权链接留空。原创背景可随项目使用。

替换摄影时，将图片放在 dist/images，填写 image、imageAlt、imageAuthor、imageSourceUrl、imageLicenseUrl、imageDownloadedAt，并保留原始授权记录。同步调整海报底部的来源文字。

示例排期从 2026-11-11 到 2026-11-24。日期超过示例范围后会显示最近已发布内容和实际日期。
