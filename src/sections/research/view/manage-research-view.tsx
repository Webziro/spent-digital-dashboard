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

async function createResearch(payload: Research) {
  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Failed to create (${res.status} ${res.statusText}) ${text}`);
    }
    return res.json();
  } catch (err: any) {
    throw new Error(`Network error when creating ${API_BASE}: ${err?.message ?? err}`);
  }
}

async function updateResearch(id: string, payload: Research) {
  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Failed to update (${res.status} ${res.statusText}) ${text}`);
    }
    return res.json();
  } catch (err: any) {
    throw new Error(`Network error when updating ${API_BASE}/${id}: ${err?.message ?? err}`);
  }
}

async function deleteResearch(id: string) {
  try {
    const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
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
    fetchResearch()
      .then((data) => mounted && setItems(data))
      .catch((err: any) => {
        // surface server error message for easier debugging
        console.error('fetchResearch error', err);
        if (mounted) setSnackbar({ open: true, message: err?.message ?? 'Failed to load', severity: 'error' });
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const handleOpenCreate = useCallback(() => {
    setEditing({ title: '', summary: '', tags: [], author: '', pdfUrl: '' });
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
        const updated = await updateResearch(editing._id, editing);
        setItems((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
        setSnackbar({ open: true, message: 'Updated', severity: 'success' });
      } else {
        const created = await createResearch(editing);
        setItems((prev) => [created, ...prev]);
        setSnackbar({ open: true, message: 'Created', severity: 'success' });
      }
      handleClose();
    } catch (err: any) {
      console.error('save error', err);
      setSnackbar({ open: true, message: err?.message ?? 'Save failed', severity: 'error' });
    }
  }, [editing, handleClose]);

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
          <Button variant="contained" onClick={handleSave}>
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
