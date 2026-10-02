import type { APIRoute } from 'astro';
import { getNews, getMetadata, plainText } from '../lib/news';

export const GET: APIRoute = async () => new Response(JSON.stringify((await getNews()).map((entry) => ({
  id: entry.id,
  text: `${entry.id} ${getMetadata(entry).title} ${plainText(entry.body ?? '')}`,
}))), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
