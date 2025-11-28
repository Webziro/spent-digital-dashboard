import type { Research } from 'src/sections/research/view/manage-research-view';

export type Publication = {
  _id?: string;
  title: string;
  summary: string;
  abstract: string;
  description?: string;
  category?: string;
  tags: string[];
  authors: string[];
  pdfUrl: string;
  coverImageUrl?: string;
  publishedDate: string;
  doi?: string;
  citations?: number;
  downloads?: number;
  isFeatured?: boolean;
  createdBy?: string;
  createdAt?: string;
};

const rawBase = import.meta.env.VITE_PUBLICATIONS_API_BASE as string | undefined;
export const API_BASE = rawBase ? `${rawBase.replace(/\/$/, '')}` : 'https://innovation-lab-qhgb.onrender.com/api/publications';

async function parseJsonSafe(res: Response) {
  const text = await res.text().catch(() => '');
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}

export async function fetchPublications(): Promise<Publication[]> {
  try {
    const res = await fetch(API_BASE);
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Failed to fetch (${res.status} ${res.statusText}) ${text}`);
    }
    const body = await res.json().catch(() => null);

    if (Array.isArray(body)) return body as Publication[];
    if (body && Array.isArray(body.data)) return body.data as Publication[];
    if (body && Array.isArray(body.items)) return body.items as Publication[];
    if (body && typeof body === 'object') return [body as Publication];
    return [];
  } catch (err: any) {
    throw new Error(`Network error when fetching ${API_BASE}: ${err?.message ?? err}`);
  }
}

export async function createPublication(payload: Publication) {
  try {
    const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('accessToken')) : null;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    const bodyPayload: Publication = { ...payload };

    const res = await fetch(API_BASE, {
      method: 'POST',
      headers,
      body: JSON.stringify(bodyPayload),
    });

    const text = await res.text().catch(() => '');
    let parsed: any = text;
    try {
      if (text) {
        parsed = JSON.parse(text);
      }
    } catch (e) {
      console.debug('Failed to parse JSON response', e);
    }

    // Debug: log response for easier diagnosis
    if (typeof console !== 'undefined' && typeof console.debug === 'function')
      console.debug('createPublication response:', { status: res.status, statusText: res.statusText, body: parsed });

    if (!res.ok) {
      if (res.status === 401) throw new Error(`Not authorized (401): ${((parsed?.message || parsed) ?? text) || 'Please login as admin'}`);
      throw new Error(`Failed to create (${res.status} ${res.statusText}) ${((parsed?.message || parsed) ?? text)}`);
    }

    return parsed ?? text;
  } catch (err: any) {
    throw new Error(`Network error when creating ${API_BASE}: ${err?.message ?? err}`);
  }
}

export async function updatePublication(id: string, payload: Publication) {
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

export async function deletePublication(id: string) {
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
