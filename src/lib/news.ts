import { getCollection, type CollectionEntry } from 'astro:content';

export const topics = {
  world: { label: '国际新闻', english: 'WORLD', description: '看见世界的变化，记录政治、经济与社会的重要进展。' },
  ai: { label: 'AI 新闻', english: 'ARTIFICIAL INTELLIGENCE', description: '追踪模型、产品、研究与治理，读懂人工智能的新进展。' },
} as const;
export type Topic = keyof typeof topics;
export type NewsEntry = CollectionEntry<'news'>;
export interface Brief { title: string; summary: string; topic: Topic | null }

export function plainText(markdown: string): string {
  return markdown
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]*>/g, '')
    .replace(/[*_`#>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getBriefs(body: string): Brief[] {
  let topic: Topic | null = null;
  let current: { title: string; topic: Topic | null; lines: string[] } | undefined;
  const briefs: Brief[] = [];
  const flush = () => {
    if (current) briefs.push({ title: current.title, topic: current.topic, summary: plainText(current.lines.join('\n')) });
    current = undefined;
  };
  for (const line of body.split('\n')) {
    if (/^##\s/.test(line)) {
      flush();
      topic = /AI|人工智能/i.test(line) ? 'ai' : /国际/.test(line) ? 'world' : null;
    } else if (/^###\s/.test(line)) {
      flush();
      current = { title: plainText(line.replace(/^###\s+\d+[.、．]\s*/, '')), topic, lines: [] };
    } else if (current && !/^来源[：:]/.test(line.trim())) {
      current.lines.push(line);
    }
  }
  flush();
  return briefs;
}

export function getMetadata(entry: NewsEntry) {
  const body = entry.body ?? '';
  const briefs = getBriefs(body);
  const title = entry.data.title || plainText(body.match(/^#\s+(.+)$/m)?.[1] || `每日新闻｜${entry.id}`);
  const description = entry.data.description || briefs.slice(0, 3).map((brief) => brief.title).join('；') || `${entry.id} 的国际新闻与 AI 新闻日报。`;
  const cutoff = body.match(/^>\s*整理截止[：:]\s*(.+?)(?:。|$)/m)?.[1];
  return {
    title,
    description,
    date: entry.id,
    href: `/posts/${entry.id}/`,
    briefs,
    cutoff,
    worldCount: briefs.filter((brief) => brief.topic === 'world').length,
    aiCount: briefs.filter((brief) => brief.topic === 'ai').length,
    readingMinutes: Math.max(1, Math.ceil(plainText(body).length / 450)),
  };
}

export async function getNews() {
  return (await getCollection('news', ({ data }) => !data.draft))
    .sort((a, b) => b.id.localeCompare(a.id));
}

export function formatDate(date: string, withYear = true) {
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    ...(withYear ? { year: 'numeric' as const } : {}),
    month: 'long',
    day: 'numeric',
  }).format(new Date(`${date}T00:00:00+08:00`));
}

export function weekday(date: string) {
  return new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', weekday: 'long' })
    .format(new Date(`${date}T00:00:00+08:00`));
}
