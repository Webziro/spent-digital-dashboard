export type EventItem = {
  _id?: string;
  title: string;
  description: string;
  type: string;
  startDate: string; // ISO
  endDate: string; // ISO
  location?: string;
  registrationLink?: string;
  imageUrl?: string;
  capacity?: number;
  registeredCount?: number;
  isFeatured?: boolean;
  status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdBy?: string;
  createdAt?: string;
};

const rawBase = import.meta.env.VITE_EVENTS_API_BASE as string | undefined;
export const API_BASE = rawBase ? `${rawBase.replace(/\/$/, '')}` : 'https://innovation-lab-qhgb.onrender.com/api/events';

async function parseMaybeArray(res: Response) {
  const text = await res.text().catch(() => '');
  if (!text) return [];
  try {
    const body = JSON.parse(text);
    if (Array.isArray(body)) return body;
    if (body && Array.isArray(body.data)) return body.data;
    if (body && Array.isArray(body.items)) return body.items;
    if (body && typeof body === 'object') return [body];
    return [];
  } catch (e) {
    // not JSON — return empty
    return [];
  }
}

export async function getAllEvents(): Promise<EventItem[]> {
  try {
    const res = await fetch(API_BASE);
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Failed to fetch events (${res.status} ${res.statusText}) ${text}`);
    }
    return (await parseMaybeArray(res)) as EventItem[];
  } catch (err: any) {
    throw new Error(`Network error when fetching ${API_BASE}: ${err?.message ?? err}`);
  }
}

export async function getEventById(id: string) {
  try {
    const res = await fetch(`${API_BASE}/${id}`);
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Failed to fetch event (${res.status} ${res.statusText}) ${text}`);
    }
    return res.json();
  } catch (err: any) {
    throw new Error(`Network error when fetching ${API_BASE}/${id}: ${err?.message ?? err}`);
  }
}

export async function createEvent(payload: EventItem) {
  try {
    const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('accessToken')) : null;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(API_BASE, { method: 'POST', headers, body: JSON.stringify(payload) });
    const text = await res.text().catch(() => '');
    let parsed: any = text;
    try { if (text) parsed = JSON.parse(text); } catch (e) { /* ignore */ }

    if (!res.ok) {
      if (res.status === 401) throw new Error(`Not authorized (401): ${((parsed?.message || parsed) ?? text) || 'Please login as admin'}`);
      throw new Error(`Failed to create event (${res.status} ${res.statusText}) ${((parsed?.message || parsed) ?? text)}`);
    }
    return parsed ?? text;
  } catch (err: any) {
    throw new Error(`Network error when creating ${API_BASE}: ${err?.message ?? err}`);
  }
}

export async function updateEvent(id: string, payload: EventItem) {
  try {
    const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('accessToken')) : null;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/${id}`, { method: 'PUT', headers, body: JSON.stringify(payload) });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      if (res.status === 401) throw new Error(`Not authorized (401): ${text || 'Please login as admin'}`);
      throw new Error(`Failed to update event (${res.status} ${res.statusText}) ${text}`);
    }
    return res.json();
  } catch (err: any) {
    throw new Error(`Network error when updating ${API_BASE}/${id}: ${err?.message ?? err}`);
  }
}

export async function deleteEvent(id: string) {
  try {
    const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('accessToken')) : null;
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE', headers });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      if (res.status === 401) throw new Error(`Not authorized (401): ${text || 'Please login as admin'}`);
      throw new Error(`Failed to delete event (${res.status} ${res.statusText}) ${text}`);
    }
    return res.json();
  } catch (err: any) {
    throw new Error(`Network error when deleting ${API_BASE}/${id}: ${err?.message ?? err}`);
  }
}

export async function registerForEvent(id: string, attendee: { name?: string; email?: string; extra?: any }) {
  try {
    const res = await fetch(`${API_BASE}/${id}/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(attendee) });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Failed to register (${res.status} ${res.statusText}) ${text}`);
    }
    return res.json();
  } catch (err: any) {
    throw new Error(`Network error when registering for ${API_BASE}/${id}: ${err?.message ?? err}`);
  }
}

export async function getFeaturedEvents(): Promise<EventItem[]> {
  try {
    const res = await fetch(`${API_BASE}/featured`);
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Failed to fetch featured events (${res.status} ${res.statusText}) ${text}`);
    }
    return (await parseMaybeArray(res)) as EventItem[];
  } catch (err: any) {
    throw new Error(`Network error when fetching featured events ${API_BASE}/featured: ${err?.message ?? err}`);
  }
}

