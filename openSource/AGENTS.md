# 开源汇总页配图约定

本目录遵循仓库根目录约定，并补充以下用户指定的配图规则。

1. 每张开源卡片必须配图，不改动项目文案、链接与卡片顺序。
2. 有 GitHub 仓库链接的算法、视觉、电控与中间件开源统一使用 `generate-repo-covers.py` 生成的仓库配图。新增卡片后必须运行生成脚本；脚本自动识别 `.os-card` 内的仓库链接，不需要单独维护仓库清单。
3. 仓库配图参考原 `sp-vision-2025.png`：蓝紫渐变背景、半透明圆角面板、队徽、仓库所有者与名称、简介，以及 Stars、Forks 两项统计。蓝紫渐变是用户对此配图的明确要求，只限仓库配图，不扩展到页面其他组件。字体沿用全站字体栈，图标用单色 SVG，不使用 Emoji。
4. Stars 读取 GitHub API 的 `stargazers_count`；Forks 读取 `forks_count`。必须显示查询日期，计数是生成时的快照，不称为实时数据。不用 watcher 数代替 star，不虚构或补零。接口失败时保留现有配图和数据；使用缓存重绘时保留原日期。
5. 非仓库配图使用 RoboMaster 论坛首页/搜索列表中的该帖封面，保存本地图片，并在 `cover-sources.json` 记录原帖、原图 URL 和校验值。不得把作者头像、战队头像、正文随机配图当成帖子封面。
6. 论坛没有封面的条目，按用户确认使用战队合影备用。2026 赛季统一使用 `/images/team/seasons/2026-gs.jpeg`；已有2025赛季规划保留其对应赛季合影，避免赛季混淆。用户指定“2026赛季战队传承分析”也使用2026赛季战队合影，优先于论坛封面。
7. 新图片存于 `images/open-source/`，小写 kebab-case 命名，扩展名与真实格式一致。原素材不因换图而删除。仓库配图使用 `object-fit: contain`，不得裁掉仓库名称、star/fork 数或统计日期；照片可使用 `cover`。竖版海报、文字截图使用 `.document-cover` 完整显示，避免裁断标题或图中文字。
8. 更新后检查18张现有卡片（及后续新增卡片）的图片加载、来源对应关系、手机/iPad/桌面布局、浏览器控制台和 `git diff --check`。
9. 有可核实的作者博客或 RoboMaster 论坛原帖时，提供“博客原文”入口；原帖中另有独立文档时，可并列提供技术、规划或传承文档入口。同一张卡片不重复添加相同链接，不将仓库 README 充作博客原文，未找到来源时不虚构链接。

## 更新命令

从仓库根目录运行（Python 3.9+，需要 `curl`，无需 GitHub token）：

```sh
python3 openSource/generate-repo-covers.py
```

脚本先获取全部仓库数据，再生成本地 SVG、保存 `repo-stats.json` 并更新 HTML 图片引用和替代文本。网页本身不请求 GitHub API，不受访客侧限流影响。发布页面时一并提交 SVG、JSON 和 HTML。

调整模板后，只用现有快照重绘：

```sh
python3 openSource/generate-repo-covers.py --offline
```
