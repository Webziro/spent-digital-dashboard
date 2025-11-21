import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Snackbar from '@mui/material/Snackbar';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import Autocomplete from '@mui/material/Autocomplete';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';
 
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

type Research = {
  _id?: string;
  title: string;
  summary: string;
  description?: string;
  category?: string;
  tags: string[];
  author: string;
  pdfUrl: string;
  createdAt?: string;
};

// Connect Backend Mongo DB hosted on Render
// If VITE_API_BASE is set use it (normalize trailing slash), otherwise use local proxy path `/api/research`.
const rawBase = import.meta.env.VITE_API_BASE as string | undefined;
const API_BASE = rawBase
  ? `${rawBase.replace(/\/$/, '')}/api/research`
  : '/api/research';

async function fetchResearch(): Promise<Research[]> {
  try {
    const res = await fetch(API_BASE);
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Failed to fetch (${res.status} ${res.statusText}) ${text}`);
    }
    const body = await res.json().catch(() => null);
    // Normalize responses that wrap data in an object: { success, data: [...] }
    if (Array.isArray(body)) return body as Research[];
    if (body && Array.isArray(body.data)) return body.data as Research[];
    // Sometimes API returns { items: [...] }
    if (body && Array.isArray(body.items)) return body.items as Research[];
    // If server returns a single object, return it as single-element array
    if (body && typeof body === 'object') return [body as Research];
    return [];
  } catch (err: any) {
    throw new Error(`Network error when fetching ${API_BASE}: ${err?.message ?? err}`);
  }
}

// Lightweight JWT payload parser (no external deps). Returns null on failure.
function parseJwt(token: string | null) {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    // base64url -> base64
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(payload.replace(/=+$/, ''));
    return JSON.parse(decodeURIComponent(
      decoded
        .split('')
        .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join('')
    ));
  } catch {
    return null;
  }
}

async function createResearch(payload: Research) {
  try {
    // include auth header if token exists
    const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('accessToken')) : null;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    // If author is missing, try to fill it from the JWT so records are searchable by author
    const bodyPayload: Research = { ...payload };
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const claims = parseJwt(stored);
      const email = claims?.email || claims?.sub || claims?.username || null;
      if ((!bodyPayload.author || !bodyPayload.author.trim()) && email) bodyPayload.author = email;
    } catch {
      // ignore parse errors
    }

    // Debug: log request details so we can compare with Postman
    if (typeof console !== 'undefined' && typeof console.debug === 'function')
      console.debug('createResearch: URL=', API_BASE, 'payload=', bodyPayload, 'headers=', headers ? Object.keys(headers) : headers);

    const res = await fetch(API_BASE, {
      method: 'POST',
      headers,
      body: JSON.stringify(bodyPayload),
    });

    const text = await res.text().catch(() => '');
    // Try to parse JSON body (for logging) but keep raw text as fallback
    let parsed: any = null;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      parsed = text;
    }

    // Debug: log response for easier diagnosis
    if (typeof console !== 'undefined' && typeof console.debug === 'function')
      console.debug('createResearch response:', { status: res.status, statusText: res.statusText, body: parsed });

    if (!res.ok) {
      if (res.status === 401) throw new Error(`Not authorized (401): ${((parsed ?? text) || 'Please login as admin')}`);
      throw new Error(`Failed to create (${res.status} ${res.statusText}) ${parsed ?? text}`);
    }

    // Return parsed JSON if available, otherwise raw text
    return parsed ?? text;
  } catch (err: any) {
    throw new Error(`Network error when creating ${API_BASE}: ${err?.message ?? err}`);
  }
}

async function updateResearch(id: string, payload: Research) {
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

async function deleteResearch(id: string) {
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

export function ManageResearchView() {
  const [items, setItems] = useState<Research[]>([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Research | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Research | null>(null);

  const [snackbar, setSnackbar] = useState<{ open: boolean; message?: string; severity?: 'success' | 'error' }>({
    open: false,
  });

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    // Determine if logged-in user is admin (look at JWT payload). If admin -> fetch all.
    // Otherwise, try server-side filtering by author (query param), fall back to client-side filter.
    (async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const payload = parseJwt(token);
        const email = payload?.email || payload?.sub || payload?.username || null;
        const isAdmin = Boolean(payload && (payload.role === 'admin' || (Array.isArray(payload.roles) && payload.roles.includes('admin')) || payload.isAdmin));

        if (isAdmin) {
          const data = await fetchResearch();
          if (mounted) setItems(data);
        } else if (email) {
          // Try server-side filtered fetch first
          try {
            const url = `${API_BASE}?author=${encodeURIComponent(email)}`;
            const res = await fetch(url);
            if (!res.ok) {
              // fallback to full fetch and filter client-side
              const all = await fetchResearch();
              if (mounted) setItems(all.filter((it) => it.author === email));
            } else {
              const body = await res.json().catch(() => null);
              let list: Research[] = [];
              if (Array.isArray(body)) list = body;
              else if (body && Array.isArray(body.data)) list = body.data;
              else if (body && Array.isArray(body.items)) list = body.items;
              else if (body && typeof body === 'object') list = [body as Research];
              if (mounted) setItems(list);
            }
          } catch (inner) {
            console.warn('filtered fetch failed, falling back to client filter', inner);
            const all = await fetchResearch();
            if (mounted) setItems(all.filter((it) => it.author === email));
          }
        } else {
          // No token/email found — fetch public list (server decides what to return)
          const data = await fetchResearch();
          if (mounted) setItems(data);
        }
      } catch (err: any) {
        console.error('fetchResearch error', err);
        if (mounted) setSnackbar({ open: true, message: err?.message ?? 'Failed to load', severity: 'error' });
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const handleOpenCreate = useCallback(() => {
    setEditing({ title: '', summary: '', description: '', category: '', tags: [], author: '', pdfUrl: '' });
    setOpen(true);
  }, []);

  const handleEdit = useCallback((item: Research) => {
    setEditing(item);
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    setEditing(null);
  }, []);

  const handleSave = useCallback(async () => {
    if (!editing) return;
    try {
      if (editing._id) {
        await updateResearch(editing._id, editing);
        // refresh list from server to ensure UI matches DB
        const fresh = await fetchResearch();
        setItems(fresh);
        setSnackbar({ open: true, message: 'Updated', severity: 'success' });
      } else {
        await createResearch(editing);
        // refresh list from server to ensure we show what is actually persisted in DB
        const fresh = await fetchResearch();
        setItems(fresh);
        setSnackbar({ open: true, message: 'Created', severity: 'success' });
      }
      handleClose();
    } catch (err: any) {
      console.error('save error', err);
      setSnackbar({ open: true, message: err?.message ?? 'Save failed', severity: 'error' });
    }
  }, [editing, handleClose]);

  const isSaveDisabled = !(editing?.title && editing?.category && editing?.description);

  const handleDelete = useCallback(async () => {
    if (!toDelete || !toDelete._id) return;
    try {
      await deleteResearch(toDelete._id);
      setItems((prev) => prev.filter((p) => p._id !== toDelete._id));
      setSnackbar({ open: true, message: 'Deleted', severity: 'success' });
    } catch (err: any) {
      console.error('delete error', err);
      setSnackbar({ open: true, message: err?.message ?? 'Delete failed', severity: 'error' });
    } finally {
      setConfirmOpen(false);
      setToDelete(null);
    }
  }, [toDelete]);

  const tagsOptions = useMemo(() => {
    const set = new Set<string>();
    items.forEach((it) => it.tags?.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [items]);

  return (
    <DashboardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Manage Research</Typography>
        <Button variant="contained" startIcon={<Iconify icon="mingcute:add-line" width={18} />} onClick={handleOpenCreate}>
          Add Research
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Author</TableCell>
                <TableCell>Tags</TableCell>
                <TableCell>PDF</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item._id ?? item.title}>
                  <TableCell>
                    <Typography variant="subtitle2">{item.title}</Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {item.summary}
                    </Typography>
                  </TableCell>
                  <TableCell>{item.author}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      {item.tags?.map((t) => (
                        <Chip key={t} label={t} size="small" />
                      ))}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    {item.pdfUrl ? (
                      <a href={item.pdfUrl} target="_blank" rel="noreferrer">
                        Open PDF
                      </a>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleEdit(item)}>
                      <Iconify icon="solar:pen-bold" width={16} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setToDelete(item);
                        setConfirmOpen(true);
                      }}
                    >
                      <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editing?._id ? 'Edit Research' : 'Add Research'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1, display: 'grid', gap: 2 }}>
            <TextField
              label="Title"
              value={editing?.title ?? ''}
              onChange={(e) => setEditing((prev) => (prev ? { ...prev, title: e.target.value } : prev))}
              fullWidth
            />
            <TextField
              label="Summary"
              value={editing?.summary ?? ''}
              multiline
              minRows={3}
              onChange={(e) => setEditing((prev) => (prev ? { ...prev, summary: e.target.value } : prev))}
              fullWidth
            />
            <TextField
              label="Description"
              value={editing?.description ?? ''}
              multiline
              minRows={3}
              onChange={(e) => setEditing((prev) => (prev ? { ...prev, description: e.target.value } : prev))}
              helperText="More detailed description (required)"
              fullWidth
            />
            <TextField
              label="Category"
              value={editing?.category ?? ''}
              onChange={(e) => setEditing((prev) => (prev ? { ...prev, category: e.target.value } : prev))}
              helperText="Category (required)"
              fullWidth
            />
            <Autocomplete
              multiple
              freeSolo
              options={tagsOptions}
              value={editing?.tags ?? []}
              onChange={(e, value) => setEditing((prev) => (prev ? { ...prev, tags: value as string[] } : prev))}
              renderTags={(value: string[], getTagProps) =>
                value.map((option: string, index: number) => (
                  <Chip variant="outlined" label={option} size="small" {...getTagProps({ index })} />
                ))
              }
              renderInput={(params) => <TextField {...params} label="Tags" />}
            />
            <TextField
              label="Author"
              value={editing?.author ?? ''}
              onChange={(e) => setEditing((prev) => (prev ? { ...prev, author: e.target.value } : prev))}
              fullWidth
            />
            <TextField
              label="PDF URL"
              value={editing?.pdfUrl ?? ''}
              onChange={(e) => setEditing((prev) => (prev ? { ...prev, pdfUrl: e.target.value } : prev))}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={isSaveDisabled}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm delete */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm deletion</DialogTitle>
        <DialogContent>
          <Typography>{`Are you sure you want to delete "${toDelete?.title}"?`}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ open: false })}
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
      >
        <Alert severity={snackbar.severity ?? 'success'} onClose={() => setSnackbar({ open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardContent>
  );
}
