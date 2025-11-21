// Lightweight API helper for research endpoints
import type { Research } from 'src/sections/research/view/manage-research-view';

// Normalize API base (same strategy as ManageResearchView)
const rawBase = import.meta.env.VITE_API_BASE as string | undefined;
export const API_BASE = rawBase ? `${rawBase.replace(/\/$/, '')}/api/research` : '/api/research';

async function parseJsonSafe(res: Response) {
  const text = await res.text().catch(() => '');
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}

export async function fetchResearch(params?: Record<string, string | number | boolean>): Promise<Research[]> {
  const qs = params
    ? '?' + Object.entries(params).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join('&')
    : '';
  const res = await fetch(`${API_BASE}${qs}`);
  if (!res.ok) {
    const body = await parseJsonSafe(res);
    throw new Error(`Failed to fetch research (${res.status}): ${body ?? res.statusText}`);
  }
  const body = await parseJsonSafe(res);
  if (Array.isArray(body)) return body as Research[];
  if (body && Array.isArray((body as any).data)) return (body as any).data as Research[];
  if (body && Array.isArray((body as any).items)) return (body as any).items as Research[];
  if (body && typeof body === 'object') return [body as Research];
  return [];
}

// Get newest posts, limited on client if API doesn't support sorting/limit
export async function getLatestResearch(limit = 5): Promise<Research[]> {
  // Try server-side limit/sort if backend supports it (common conventions)
  // attempt query that some backends accept
  try {
    const res = await fetch(`${API_BASE}?limit=${limit}&sort=createdAt:desc`);
    if (res.ok) {
      const body = await parseJsonSafe(res);
      if (Array.isArray(body)) return body as Research[];
      if (body && Array.isArray((body as any).data)) return (body as any).data as Research[];
    }
  } catch (err) {
    if (typeof console !== 'undefined' && typeof console.debug === 'function')
      console.debug('getLatestResearch server-side fetch failed', err);
  }

  // Fallback: fetch all and sort client-side
  const all = await fetchResearch();
  return all
    .slice()
    .sort((a, b) => (new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()))
    .slice(0, limit);
}
