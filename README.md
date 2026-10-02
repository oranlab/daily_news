# 每日新闻 · Astro 博客

用 Astro 和 TypeScript 构建的中文静态博客，整理国际要闻与 AI 动态。直接读取仓库根目录的 `YYYY-MM-DD/每日新闻.md`，保留原有归档和写作方式。

包含首页最新一期、文章阅读与目录、前后期导航、日期归档、月份筛选、全文搜索、国际 / AI 分类、深浅主题、RSS、SEO 元信息、结构化数据、站点地图和 404 页面。无需数据库或服务端运行时。

## 本地开发

需要 Node.js **22.12.0 以上的 22.x 版本**，项目和 Vercel 均使用 Node.js 22。

```bash
# 安装并使用项目指定的 Node.js（已安装 nvm 时）
nvm install
nvm use

npm ci
npm run dev
```

打开 `http://localhost:4321`。

```bash
npm run check    # Astro / TypeScript 检查
npm run build    # 生成静态网站到 dist/
npm run preview  # 预览构建结果
```

## 发布日报

继续按北京时间新建一个日期文件夹，每天一个文件：

```text
YYYY-MM-DD/
└── 每日新闻.md
```

文件内容示例：

```markdown
# 每日新闻｜YYYY-MM-DD

> 整理截止：YYYY-MM-DD HH:mm（北京时间，UTC+8）。

## 国际新闻

### 1. 新闻标题

**事件/报道日期：YYYY-MM-DD。** 新闻摘要。

来源：[报道机构](https://news.example.com/article)

## AI 新闻

### 1. 新闻标题

**事件/报道日期：YYYY-MM-DD。** 新闻摘要。

来源：[官方公告](https://news.example.com/announcement)
```

- 文件夹日期决定文章 URL（`/posts/YYYY-MM-DD/`）和倒序排序；日期必须真实有效。文件名固定为 `每日新闻.md`。
- `#` 标题自动用作文章标题，`##` 为分类，`###` 为新闻条目。分类标题可写成「国际新闻（10 条）」或「AI 新闻（10 条）」。页面会自动生成目录、条目数量和阅读时长。
- 每类原则上至少 10 条；每条保留事件或报道日期、可核对的来源，并标注全篇整理截止时间。
- 现有文章无需添加 frontmatter。首页摘要从新闻条目自动提取。
- 新增、修改或删除日报后重新构建，首页、分类、归档、搜索、RSS 和站点地图会一起更新。
- 首页展示最近一期与最多六份往期，全部内容可从归档查看。搜索按空格拆分关键词，所有关键词均需匹配；支持正文和日期搜索。

需要自定义标题、摘要或保存草稿时，可在文件顶部加可选的 YAML frontmatter：

```yaml
---
title: 自定义标题
description: 用于 SEO 和 RSS 的摘要
draft: true
---
```

`draft` 默认 `false`；设为 `true` 时，该日报不会出现在公开页面、搜索、RSS 或站点地图中，也不会生成文章路由。准备发布时改成 `false` 或移除这一行。文章原始一级标题由网站布局展示一次，不会重复。

## GitHub 镜像 → Vercel 自动部署

1. 将当前仓库镜像到你的 GitHub 仓库，包含源码、`package.json`、`package-lock.json` 和 `.github/workflows/ci.yml`。镜像配置在当前 Git 服务中完成。
2. 在 Vercel 中选择 **Add New → Project**，导入该 GitHub 仓库，并授权 Vercel 访问它。
3. 根目录选仓库根目录，Framework Preset 为 **Astro**，Node.js Version 为 **22.x**。仓库中的 `vercel.json` 已设置：

   | 配置 | 值 |
   | --- | --- |
   | Install Command | `npm ci` |
   | Build Command | `npm run check && npm run build` |
   | Output Directory | `dist` |
   | Production Branch | 在 Vercel 选择 `main` |

4. 建议在 Vercel 的项目环境变量中设置 `PUBLIC_SITE_URL` 为正式网站的完整根地址，例如 `https://your-blog.vercel.app` 或自定义域名，并重新部署。地址用于 canonical、结构化数据、RSS 与站点地图。
5. 首次部署完成后，每次提交日报并镜像到 GitHub 的 `main`，Vercel 的 Git 集成会自动构建并发布。GitHub PR 可生成 Vercel 预览部署。

本项目使用静态输出，可直接部署，无需 `@astrojs/vercel` 适配器或 Vercel API Token。GitHub Actions 只负责检查与构建，发布由 Vercel Git 集成完成；首次连接 GitHub、镜像设置与 Vercel 项目需要在对应平台配置。

未设置 `PUBLIC_SITE_URL` 时，自动使用 `VERCEL_PROJECT_PRODUCTION_URL`，其次使用 `VERCEL_URL`；本地构建则使用 `http://localhost:4321`。自定义域名请显式设置 `PUBLIC_SITE_URL`。在本地模拟生产链接时可运行：

```bash
PUBLIC_SITE_URL=https://your-blog.vercel.app npm run build
```

配置依据：[Astro 部署到 Vercel](https://docs.astro.build/en/guides/deploy/vercel/)、[Vercel 的 Astro 集成](https://vercel.com/docs/frameworks/frontend/astro)。

## 项目结构

```text
daily_news/
├── YYYY-MM-DD/每日新闻.md      # 原有日报，继续在这里写
├── public/favicon.svg
├── src/
│   ├── content.config.ts      # 日期目录内容集合与可选 frontmatter
│   ├── lib/news.ts            # 标题、摘要、分类与日期处理
│   ├── components/            # 图标与日报卡片
│   ├── layouts/BaseLayout.astro
│   ├── styles/global.css      # 响应式样式与深浅主题
│   └── pages/
│       ├── index.astro
│       ├── archive.astro
│       ├── about.astro
│       ├── posts/[date].astro
│       ├── topics/[topic].astro
│       ├── rss.xml.ts
│       ├── search-index.json.ts
│       ├── robots.txt.ts
│       └── 404.astro
├── .github/workflows/ci.yml
├── astro.config.mjs
├── package.json
├── package-lock.json
└── vercel.json
```

## 内容入口

- 最新一期：[2026-10-02 每日新闻](2026-10-02/每日新闻.md)
- 首份归档：[2026-09-27 每日新闻](2026-09-27/每日新闻.md)

新闻内容保留来源归属。持续事件的数字和结论发生变化时，更新对应日报并保留来源，未经证实的信息不写成定论。
