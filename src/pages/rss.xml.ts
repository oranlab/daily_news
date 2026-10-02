import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { getNews, getMetadata } from '../lib/news';

export const GET: APIRoute = async ({ site }) => rss({
  title: '每日新闻',
  description: '按北京时间归档的国际新闻与 AI 动态。',
  site: site!,
  items: (await getNews()).map((entry) => {
    const post = getMetadata(entry);
    return { title: post.title, description: post.description, pubDate: new Date(`${entry.id}T00:00:00+08:00`), link: post.href };
  }),
  customData: '<language>zh-CN</language>',
});
