import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const news = defineCollection({
  loader: glob({
    base: './src/content',
    pattern: '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]/每日新闻.md',
    retainBody: true,
    generateId: ({ entry }) => {
      const date = entry.split('/')[0];
      const parsed = new Date(`${date}T00:00:00Z`);
      if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
        throw new Error(`无效的日报日期目录：${entry}`);
      }
      return date;
    },
  }),
  schema: z.object({
    title: z.string().trim().min(1).optional(),
    description: z.string().trim().min(1).optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { news };
