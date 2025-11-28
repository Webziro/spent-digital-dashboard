import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
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
import { type Program, createProgram, deleteProgram, fetchPrograms, updateProgram } from 'src/api/programs';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function ManageProgramsView() {
  const [items, setItems] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Program | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Program | null>(null);

  const [snackbar, setSnackbar] = useState<{ open: boolean; message?: string; severity?: 'success' | 'error' }>({
    open: false,
  });

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    (async () => {
      try {
        const data = await fetchPrograms();
        if (mounted) setItems(data);
      } catch (err: any) {
        console.error('fetchPrograms error', err);
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
    const newForm: Program = {
      title: '',
      description: '',
      type: '',
      applicationLink: '',
      startDate: '',
      applicationDeadline: '',
      duration: '',
      tags: [],
      coverImageUrl: '',
    } as Program;
    setFormData(newForm);
    setOpen(true);
  }, []);

  const handleEdit = useCallback((item: Program) => {
    setFormData(item);
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleSave = useCallback(async () => {
    if (!formData) return;
    try {
      if (formData._id) {
        await updateProgram(formData._id, formData);
        const fresh = await fetchPrograms();
        setItems(fresh);
        setSnackbar({ open: true, message: 'Updated', severity: 'success' });
      } else {
        await createProgram(formData);
        const fresh = await fetchPrograms();
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
    const hasDescription = typeof formData.description === 'string' && formData.description.trim().length > 0;
    const hasType = typeof formData.type === 'string' && formData.type.trim().length > 0;
    const hasApplicationLink = typeof formData.applicationLink === 'string' && formData.applicationLink.trim().length > 0;
    const hasStartDate = typeof formData.startDate === 'string' && formData.startDate.trim().length > 0;
    const hasApplicationDeadline = typeof formData.applicationDeadline === 'string' && formData.applicationDeadline.trim().length > 0;
    const hasDuration = typeof formData.duration === 'string' && formData.duration.trim().length > 0;
    return !(hasTitle && hasDescription && hasType && hasApplicationLink && hasStartDate && hasApplicationDeadline && hasDuration);
  }, [formData]);

  const handleDelete = useCallback(async () => {
    if (!toDelete || !toDelete._id) return;
    try {
      await deleteProgram(toDelete._id);
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
        <Typography variant="h4">Manage Programs</Typography>
        <Button variant="contained" startIcon={<Iconify icon="mingcute:add-line" width={18} />} onClick={handleOpenCreate}>
          Add Program
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
                <TableCell>Type</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item._id ?? item.title}>
                  <TableCell>
                    <Typography variant="subtitle2">{item.title}</Typography>
                  </TableCell>
                  <TableCell>{item.type}</TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {item.description}
                    </Typography>
                  </TableCell>
                  <TableCell>{item.startDate}</TableCell>
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

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" keepMounted PaperProps={{ sx: { minHeight: '520px' } }}>
        <DialogTitle>{formData?._id ? 'Edit Program' : 'Add Program'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1, display: 'grid', gap: 2 }}>
            <TextField label="Title" value={formData?.title ?? ''} onChange={(e) => setFormData((prev) => prev ? { ...prev, title: e.target.value } : null)} fullWidth />
            <TextField label="Description" value={formData?.description ?? ''} multiline minRows={3} onChange={(e) => setFormData((prev) => prev ? { ...prev, description: e.target.value } : null)} fullWidth />
            <TextField select SelectProps={{ native: true }} label="Type" value={formData?.type ?? ''} onChange={(e) => setFormData((prev) => prev ? { ...prev, type: e.target.value } : null)} helperText="Program Type (required)" fullWidth>
              <option aria-label="None" value="" />
              <option value="fellowship">Fellowship</option>
              <option value="training">Training</option>
              <option value="bootcamp">Bootcamp</option>
              <option value="mentorship">Mentorship</option>
              <option value="internship">Internship</option>
              <option value="others">Others</option>
            </TextField>
            <TextField label="Application Link" value={formData?.applicationLink ?? ''} onChange={(e) => setFormData((prev) => prev ? { ...prev, applicationLink: e.target.value } : null)} fullWidth />
            <TextField label="Start Date" type="date" value={formData?.startDate ?? ''} onChange={(e) => setFormData((prev) => prev ? { ...prev, startDate: e.target.value } : null)} InputLabelProps={{ shrink: true }} fullWidth />
            <TextField label="Application Deadline" type="date" value={formData?.applicationDeadline ?? ''} onChange={(e) => setFormData((prev) => prev ? { ...prev, applicationDeadline: e.target.value } : null)} InputLabelProps={{ shrink: true }} fullWidth />
            <TextField label="Duration" value={formData?.duration ?? ''} onChange={(e) => setFormData((prev) => prev ? { ...prev, duration: e.target.value } : null)} fullWidth />
            <Autocomplete multiple freeSolo options={tagsOptions} value={formData?.tags ?? []} onChange={(e, value) => setFormData((prev) => prev ? { ...prev, tags: value as string[] } : null)} renderTags={(value: string[], getTagProps) => value.map((option: string, index: number) => (<Chip variant="outlined" label={option} size="small" {...getTagProps({ index })} />))} renderInput={(params) => <TextField {...params} label="Tags" />} />
            <TextField label="Cover Image URL" value={formData?.coverImageUrl ?? ''} onChange={(e) => setFormData((prev) => prev ? { ...prev, coverImageUrl: e.target.value } : null)} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={isSaveDisabled}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

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

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ open: false })} anchorOrigin={{ horizontal: 'right', vertical: 'top' }}>
        <Alert severity={snackbar.severity ?? 'success'} onClose={() => setSnackbar({ open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardContent>
  );
}    

