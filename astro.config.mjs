import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';

const vercelDomain = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
const site = process.env.PUBLIC_SITE_URL || (vercelDomain ? `https://${vercelDomain}` : 'http://localhost:4321');
const siteUrl = new URL(site);
if (!['http:', 'https:'].includes(siteUrl.protocol) || siteUrl.pathname !== '/' || siteUrl.search || siteUrl.hash) {
  throw new Error('PUBLIC_SITE_URL 必须是 http(s) 站点根地址，例如 https://news.example.com');
}

// 正文的一级标题由文章布局展示，原始 Markdown 文件保持不变。
const removeTitle = {
  name: 'remove-edition-title',
  before(root, context) {
    const first = root.children.find((node) => node.type !== 'yaml' && node.type !== 'toml');
    if (first?.type === 'heading' && first.depth === 1) context.removeNode(first);
  },
};

export default defineConfig({
  site: siteUrl.origin,
  output: 'static',
  trailingSlash: 'always',
  integrations: [sitemap({ filter: (page) => !page.endsWith('/404/') })],
  markdown: { processor: satteri({ mdastPlugins: [removeTitle] }) },
});
