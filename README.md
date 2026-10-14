# TongjiSuperPower.github.io

同济大学 SuperPower 战队官方网站，使用静态 HTML、CSS 和 JavaScript，无需构建即可部署到 GitHub Pages。

## 本地预览

从仓库根目录启动静态服务器（需要 Python 3）：

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

访问 <http://127.0.0.1:8765/>。站内资源使用根路径，请勿直接通过 `file://` 打开 HTML。部分页面依赖 Google Fonts 或 CDN 提供的 Swiper、抽奖动效库，需要网络连接。

## 文件分工

| 路径 | 用途 |
| --- | --- |
| `index.html`、`index.css` | 首页及基础样式 |
| `navigation.css` | 共享导航布局 |
| `hud.css`、`hud-icons.js` | 共享字体、圆角、回顶按钮和 SVG 图标 |
| `about/`、`competition/`、`communication/` | 战队介绍、赛事展示、联系我们 |
| `members/` | 优秀队员展示及轮播动效 |
| `robots/timeline.html` | 机器人赛季时间轴 |
| `robots/2025/robots.html`、`robots/2025/motion.css`、`robots/2025/script.js` | 2025 机器人展示及动效 |
| `robots/2026/robots.html`、`robots/2026/robots.css`、`robots/2026/script.js` | 2026 机器人展示及动效；图片使用同名 WebP 与 `-mobile` 版本，原始 JPG 保留在 `images/robots/2026/` |
| `openSource/` | 开源汇总、配图生成脚本及来源记录 |
| `surroundings/`、`lottery/` | 周边商城及抽奖页面 |
| `images/`、`fonts/` | 图片和本地字体；字体来源及许可随文件保留 |

修改页面前请遵循根目录 [AGENTS.md](AGENTS.md) 和对应目录内的约定。2025 机器人详情页独立使用样式，不引入 `hud.css`；优秀队员页保留浅色风格。首页、周边商城和联系我们固定为深色模式。

## 2026 机器人弹幕

弹幕内容统一在 `robots/2026/danmaku-messages.js` 的 `danmakuMessages` 数组中维护。添加时在数组中追加一行，例如：

```js
export const danmakuMessages = [
    '俞选涛，我的镖呢？',
    // 保留原有条目，在这里继续添加。
    '这里填写新的弹幕',
];
```

每条弹幕使用引号包住，条目之间使用英文逗号；保存后刷新 2026 机器人页面即可生效。弹幕随机选取、允许重复；系统启用减少动态效果时改为静态列表。展示逻辑在 `robots/2026/danmaku.js`，无需修改它来增加文字。

## 临时纪录片开屏

首页通过 `documentary-announcement.js` 与同名 CSS 展示 2026 赛季纪录片发布提示。每个标签页会话仅展示一次，关闭或刷新后不会重复出现；新标签页可重新预览。桌面使用横版海报，手机使用竖版海报，素材在 `images/team/documentary/`。

- 展示期限：按北京时间，仅在 2026 年内显示；2027 年 1 月 1 日 00:00 起自动停用，已打开的弹窗也会到期关闭。判断使用访客设备时间。
- 下线提示：将脚本顶部 `announcement.enabled` 改为 `false`，不会再创建弹窗或加载海报。
- 更新影片入口：修改 `announcement.url`；当前指向 B 站发布动态。
- 完全移除：删除首页对这两个文件的引用，再移除对应脚本、样式与海报。

## 更新开源项目配图

需要 Python 3.9+ 和 `curl`，无需 GitHub token：

```sh
python3 openSource/generate-repo-covers.py
```

脚本自动识别卡片中的 GitHub 仓库，更新本地 SVG、`repo-stats.json` 和 HTML 引用。Stars、Forks 为标注日期的快照。只修改模板、不更新统计数据时使用：

```sh
python3 openSource/generate-repo-covers.py --offline
```

配图来源、合照例外及原文入口规则见 [openSource/AGENTS.md](openSource/AGENTS.md)。提交时一并包含生成的图片、统计数据和来源记录。

## 提交前检查

- 执行 `git diff --check`，确认没有空白错误。
- 在 `390 × 844`、`820 × 1180`、`1440 × 1000` 检查受影响页面，确认图片、导航、轮播和回顶按钮正常。
- 检查浏览器控制台、404、图片加载，以及系统“减少动态效果”设置。
- 用残留的 `theme=light` 验证固定深色的页面不切换为浅色。
- 查看 `git status --short`，包含新增的正式资源；`.playwright-cli/`、`output/playwright/`、Python 缓存和 `.DS_Store` 已在 `.gitignore` 中排除。
