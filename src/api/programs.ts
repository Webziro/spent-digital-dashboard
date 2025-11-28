// Lightweight API helper for programs endpoints
export type Program = {
  _id?: string;
  title: string;
  description: string;
  type: string;
  applicationLink: string;
  startDate: string;
  applicationDeadline: string;
  duration: string;
  tags?: string[];
  coverImageUrl?: string;
  isFeatured?: boolean;
  createdAt?: string;
  createdBy?: string;
  publishedDate?: string;
  abstract?: string;
  category?: string;
  pdfUrl?: string;
};

const rawBase = import.meta.env.VITE_API_BASE as string | undefined;
export const API_BASE = rawBase ? `${rawBase.replace(/\/$/, '')}/api/programs` : '/api/programs';

async function parseJsonSafe(res: Response) {
  const text = await res.text().catch(() => '');
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}

export async function fetchPrograms(params?: Record<string, string | number | boolean>): Promise<Program[]> {
  const qs = params
    ? '?' + Object.entries(params).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join('&')
    : '';
  const res = await fetch(`${API_BASE}${qs}`);
  if (!res.ok) {
    const body = await parseJsonSafe(res);
    throw new Error(`Failed to fetch programs (${res.status}): ${body ?? res.statusText}`);
  }
  const body = await parseJsonSafe(res);
  if (Array.isArray(body)) return body as Program[];
  if (body && Array.isArray((body as any).data)) return (body as any).data as Program[];
  if (body && Array.isArray((body as any).items)) return (body as any).items as Program[];
  if (body && typeof body === 'object') return [body as Program];
  return [];
}

export async function createProgram(payload: Program) {
  try {
    const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('accessToken')) : null;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(API_BASE, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const text = await res.text().catch(() => '');
    let parsed: any = text;
    try {
      if (text) parsed = JSON.parse(text);
    } catch (e) {
      console.debug('Failed to parse JSON response', e);
    }

    if (!res.ok) {
      if (res.status === 401) throw new Error(`Not authorized (401): ${((parsed?.message || parsed) ?? text) || 'Please login as admin'}`);
      throw new Error(`Failed to create (${res.status} ${res.statusText}) ${((parsed?.message || parsed) ?? text)}`);
    }

    return parsed ?? text;
  } catch (err: any) {
    throw new Error(`Network error when creating ${API_BASE}: ${err?.message ?? err}`);
  }
}

export async function updateProgram(id: string, payload: Program) {
  try {
    const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('accessToken')) : null;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      if (res.status === 401) throw new Error(`Not authorized (401): ${text || 'Please login as admin'}`);
      throw new Error(`Failed to update (${res.status} ${res.statusText}) ${text}`);
    }
    return res.json();
  } catch (err: any) {
    throw new Error(`Network error when updating ${API_BASE}/${id}: ${err?.message ?? err}`);
  }
}

export async function deleteProgram(id: string) {
  try {
    const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('accessToken')) : null;
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE', headers });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      if (res.status === 401) throw new Error(`Not authorized (401): ${text || 'Please login as admin'}`);
      throw new Error(`Failed to delete (${res.status} ${res.statusText}) ${text}`);
    }
    return res.json();
  } catch (err: any) {
    throw new Error(`Network error when deleting ${API_BASE}/${id}: ${err?.message ?? err}`);
  }
}
