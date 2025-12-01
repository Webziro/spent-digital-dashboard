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

import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';
import { type Publication, createPublication, deletePublication, fetchPublications, updatePublication } from 'src/api/publications';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function ManagePublicationsView() {
  const router = useRouter();
  const [items, setItems] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  
  // Form state that persists even when dialog closes
  const [formData, setFormData] = useState<Publication | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Publication | null>(null);

  const [snackbar, setSnackbar] = useState<{ open: boolean; message?: string; severity?: 'success' | 'error' }>({
    open: false,
  });

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    (async () => {
      try {
        const data = await fetchPublications();
        if (mounted) setItems(data);
      } catch (err: any) {
        console.error('fetchPublications error', err);
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
    const newForm: Publication = {
      title: '',
      summary: '',
      abstract: '',
      description: '',
      category: '',
      tags: [],
      authors: [],
      pdfUrl: '',
      publishedDate: '',
    };
    setFormData(newForm);
    setOpen(true);
  }, []);

  const handleEdit = useCallback((item: Publication) => {
    setFormData(item);
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    // Form data persists in formData state even after closing
  }, []);

  const handleSave = useCallback(async () => {
    if (!formData) return;
    try {
      if (formData._id) {
        await updatePublication(formData._id, formData);
        const fresh = await fetchPublications();
        setItems(fresh);
        setSnackbar({ open: true, message: 'Updated', severity: 'success' });
      } else {
        await createPublication(formData);
        const fresh = await fetchPublications();
        setItems(fresh);
        setSnackbar({ open: true, message: 'Created', severity: 'success' });
      }
      handleClose();
      setFormData(null);
    } catch (err: any) {
      console.error('save error', err);
      setSnackbar({ open: true, message: err?.message ?? 'Save failed', severity: 'error' });
    }
  }, [formData, handleClose]);

  const isSaveDisabled = useMemo(() => {
    if (!formData) return true;
    const hasTitle = typeof formData.title === 'string' && formData.title.trim().length > 0;
    const hasSummary = typeof formData.summary === 'string' && formData.summary.trim().length > 0;
    const hasAbstract = typeof formData.abstract === 'string' && formData.abstract.trim().length > 0;
    const hasCategory = typeof formData.category === 'string' && formData.category.trim().length > 0;
    const hasPdfUrl = typeof formData.pdfUrl === 'string' && formData.pdfUrl.trim().length > 0;
    const hasPublishedDate = typeof formData.publishedDate === 'string' && formData.publishedDate.trim().length > 0;
    
    return !(hasTitle && hasSummary && hasAbstract && hasCategory && hasPdfUrl && hasPublishedDate);
  }, [formData]);

  const handleDelete = useCallback(async () => {
    if (!toDelete || !toDelete._id) return;
    try {
      await deletePublication(toDelete._id);
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

  const categoryOptions = [
    'Research Paper',
    'Whitepaper',
    'Policy Brief',
    'Case Study',
    'Technical Report',
  ];

  return (
    <DashboardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Manage Publications</Typography>
        <Button variant="contained" startIcon={<Iconify icon="mingcute:add-line" width={18} />} onClick={handleOpenCreate}>
          Add Publication
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
                <TableRow 
                  key={item._id ?? item.title}
                  onClick={() => item._id && router.push(`/publication/${item._id}`)}
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { 
                      backgroundColor: 'action.hover' 
                    }
                  }}
                >
                  <TableCell>
                    <Typography variant="subtitle2">{item.title}</Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {item.summary}
                    </Typography>
                  </TableCell>
                  <TableCell>{item.authors?.join(', ')}</TableCell>
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
                  <TableCell 
                    align="right"
                    onClick={(e) => e.stopPropagation()}
                  >
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
      <Dialog 
        open={open} 
        onClose={handleClose} 
        fullWidth 
        maxWidth="sm"
        keepMounted
        PaperProps={{
          sx: { minHeight: '600px' }
        }}
      >
        <DialogTitle>{formData?._id ? 'Edit Publication' : 'Add Publication'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1, display: 'grid', gap: 2 }}>
            <TextField
              label="Title"
              value={formData?.title ?? ''}
              onChange={(e) => setFormData((prev) => prev ? { ...prev, title: e.target.value } : null)}
              fullWidth
            />
            <TextField
              label="Summary"
              value={formData?.summary ?? ''}
              multiline
              minRows={3}
              onChange={(e) => setFormData((prev) => prev ? { ...prev, summary: e.target.value } : null)}
              fullWidth
            />
            <TextField
              label="Abstract"
              value={formData?.abstract ?? ''}
              multiline
              minRows={3}
              onChange={(e) => setFormData((prev) => prev ? { ...prev, abstract: e.target.value } : null)}
              helperText="Abstract (required)"
              fullWidth
            />
            <TextField
              label="Description"
              value={formData?.description ?? ''}
              multiline
              minRows={3}
              onChange={(e) => setFormData((prev) => prev ? { ...prev, description: e.target.value } : null)}
              fullWidth
            />
            <TextField
              select
              SelectProps={{ native: true }}
              label="Category"
              value={formData?.category ?? ''}
              onChange={(e) => setFormData((prev) => prev ? { ...prev, category: e.target.value } : null)}
              helperText="Category (required)"
              fullWidth
            >
              <option aria-label="None" value="" />
              {categoryOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </TextField>
            <Autocomplete
              multiple
              freeSolo
              options={tagsOptions}
              value={formData?.tags ?? []}
              onChange={(e, value) => setFormData((prev) => prev ? { ...prev, tags: value as string[] } : null)}
              renderTags={(value: string[], getTagProps) =>
                value.map((option: string, index: number) => (
                  <Chip variant="outlined" label={option} size="small" {...getTagProps({ index })} />
                ))
              }
              renderInput={(params) => <TextField {...params} label="Tags" />}
            />
            <Autocomplete
              multiple
              freeSolo
              options={[]}
              value={formData?.authors ?? []}
              onChange={(e, value) => setFormData((prev) => prev ? { ...prev, authors: value as string[] } : null)}
              renderTags={(value: string[], getTagProps) =>
                value.map((option: string, index: number) => (
                  <Chip variant="outlined" label={option} size="small" {...getTagProps({ index })} />
                ))
              }
              renderInput={(params) => <TextField {...params} label="Authors" helperText="Authors (required)" />}
            />
            <TextField
              label="Published Date"
              type="date"
              value={formData?.publishedDate ?? ''}
              onChange={(e) => setFormData((prev) => prev ? { ...prev, publishedDate: e.target.value } as Publication : null)}
              InputLabelProps={{
                shrink: true,
              }}
              helperText="Published Date (required)"
              fullWidth
            />
            <TextField
              label="PDF URL"
              value={formData?.pdfUrl ?? ''}
              onChange={(e) => setFormData((prev) => prev ? { ...prev, pdfUrl: e.target.value } as Publication : null)}
              fullWidth
            />
            <TextField
              label="Cover Image URL"
              value={formData?.coverImageUrl ?? ''}
              onChange={(e) => setFormData((prev) => prev ? { ...prev, coverImageUrl: e.target.value } as Publication : null)}
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

//Add Publication
//Title: 
//Summary: A brief overview of how AI is transforming research methodologies across various fields.
//Abstract: This publication explores the integration of artificial intelligence in research, highlighting its benefits and challenges.
//Description: The document delves into case studies where AI has significantly enhanced research outcomes, discussing tools and techniques employed.
//Category: Research Paper
//Tags: AI, Research, Technology
//Authors: Dr. Jane Smith, Dr. John Doe
//PDF URL: https://example.com/ai-research.pdf
//Published Date: 2024-05-15