/* eslint-disable perfectionist/sort-imports */
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Pagination from '@mui/material/Pagination';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

import { PostItem } from '../post-item';
import { PostSort } from '../post-sort';
import { PostSearch } from '../post-search';
import { _posts as mockPosts } from 'src/_mock';
import type { EventItem } from 'src/api/events';
import * as EventsAPI from 'src/api/events';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import type { IPostItem } from '../post-item';

type EventForm = IPostItem & Partial<EventItem>;

// ----------------------------------------------------------------------

type Props = {
  posts: IPostItem[];
};

export function BlogView({ posts }: Props) {
  const [sortBy, setSortBy] = useState('latest');

  // local copy of posts so admin can create/edit/delete without changing props
  const [localPosts, setLocalPosts] = useState<IPostItem[]>(posts ?? mockPosts);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<EventForm | null>(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 6;

  const handleSort = useCallback((newSort: string) => {
    setSortBy(newSort);
  }, []);

  useEffect(() => {
    // initialize local posts when props change
    setLocalPosts(posts ?? mockPosts);
    setPage(1);
  }, [posts]);

  // Try to fetch live events from API and populate list (if available)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const evts = await EventsAPI.getAllEvents();
        if (!mounted) return;
        if (Array.isArray(evts) && evts.length) {
          const mapped = evts.map<IPostItem>((p) => ({
            id: p._id ?? (p as any).id ?? String(Math.random()),
            title: p.title ?? 'Untitled',
            coverUrl: (p as any).imageUrl ?? (p as any).image ?? '/assets/images/cover/cover-1.webp',
            totalViews: (p as any).views ?? 0,
            description: p.description ?? '',
            totalShares: 0,
            totalComments: 0,
            totalFavorites: 0,
            postedAt: p.startDate ?? p.createdAt ?? new Date().toISOString(),
            author: {
              name: (p as any).createdBy ?? 'Organizer',
              avatarUrl: '/assets/images/avatar/avatar-25.svg',
            },
          }));
          setLocalPosts(mapped);
          setPage(1);
        }
      } catch {
        // ignore — keep existing mock/local posts
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleOpenCreate = useCallback(() => {
    const newPost: EventForm = {
      id: `local-${Date.now()}`,
      title: '',
      coverUrl: '',
      totalViews: 0,
      description: '',
      totalShares: 0,
      totalComments: 0,
      totalFavorites: 0,
      postedAt: new Date().toISOString(),
      author: { name: 'Admin', avatarUrl: '/assets/images/avatar/avatar-25.svg' },
      // event defaults
      type: 'webinar',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      location: 'Online',
      registrationLink: '',
      capacity: 0,
    };
    setFormData(newPost);
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    setFormData(null);
  }, []);

  const handleSave = useCallback(() => {
    (async () => {
      if (!formData) return;
      // optimistic UI update
      setLocalPosts((prev) => {
        const exists = prev.find((p) => p.id === formData.id);
        if (exists) {
          return prev.map((p) => (p.id === formData.id ? formData : p));
        }
        return [formData, ...prev];
      });

      try {
        // If local id, create on server
        if (String(formData.id).startsWith('local-')) {
          const payload: EventItem = {
            title: formData.title,
            description: formData.description ?? '',
            type: (formData.type as string) ?? 'webinar',
            startDate: (formData.startDate as string) ?? new Date().toISOString(),
            endDate: (formData.endDate as string) ?? new Date().toISOString(),
            location: (formData.location as string) ?? 'Online',
            registrationLink: (formData.registrationLink as string) ?? '',
            imageUrl: formData.coverUrl,
            capacity: typeof formData.capacity === 'number' ? formData.capacity : Number(formData.capacity) || 0,
          };
          const created = await EventsAPI.createEvent(payload);
          const newId = (created && (created._id || created.id)) || undefined;
          if (newId) {
            setLocalPosts((prev) => prev.map((p) => (p.id === formData.id ? { ...p, id: newId } : p)));
          }
          setSnackbar({ open: true, message: 'Created', severity: 'success' });
        } else {
          // update existing event
          const serverId = String(formData.id);
          const payload: EventItem = {
            _id: serverId,
            title: formData.title,
            description: formData.description ?? '',
            type: (formData.type as string) ?? 'webinar',
            startDate: (formData.startDate as string) ?? new Date().toISOString(),
            endDate: (formData.endDate as string) ?? new Date().toISOString(),
            location: (formData.location as string) ?? 'Online',
            registrationLink: (formData.registrationLink as string) ?? '',
            imageUrl: formData.coverUrl,
            capacity: typeof formData.capacity === 'number' ? formData.capacity : Number(formData.capacity) || 0,
          };
          await EventsAPI.updateEvent(serverId, payload);
          setSnackbar({ open: true, message: 'Updated', severity: 'success' });
        }
      } catch (err: any) {
        // on error, show message
        setSnackbar({ open: true, message: err?.message ?? 'Save failed', severity: 'error' });
      } finally {
        handleClose();
      }
    })();
  }, [formData, handleClose]);

  const handleEdit = useCallback((post: IPostItem) => {
    setFormData(post);
    setOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    (async () => {
      // if local-only, just remove
      if (id.startsWith('local-')) {
        setLocalPosts((prev) => prev.filter((p) => p.id !== id));
        setSnackbar({ open: true, message: 'Deleted', severity: 'success' });
        return;
      }

      if (!window.confirm('Delete this publication?')) return;

      try {
        await EventsAPI.deleteEvent(id);
        setLocalPosts((prev) => prev.filter((p) => p.id !== id));
        setSnackbar({ open: true, message: 'Deleted', severity: 'success' });
      } catch (err: any) {
        setSnackbar({ open: true, message: err?.message ?? 'Delete failed', severity: 'error' });
      }
    })();
  }, []);

  const [snackbar, setSnackbar] = useState<{ open: boolean; message?: string; severity?: 'success' | 'error' }>({ open: false });

  // Pagination helpers
  const totalPages = Math.max(1, Math.ceil(localPosts.length / rowsPerPage));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const handlePageChange = useCallback((_: any, value: number) => {
    setPage(value);
    // scroll to top of list when changing page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <DashboardContent>
      <Box
        sx={{
          mb: 5,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Events
        </Typography>
        <Button variant="contained" color="inherit" startIcon={<Iconify icon="mingcute:add-line" />} onClick={handleOpenCreate}>
          New Event
        </Button>
      </Box>

      <Box
        sx={{
          mb: 5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <PostSearch posts={localPosts} />
        <PostSort
          sortBy={sortBy}
          onSort={handleSort}
          options={[
            { value: 'latest', label: 'Latest' },
            { value: 'popular', label: 'Popular' },
            { value: 'oldest', label: 'Oldest' },
          ]}
        />
      </Box>

      {localPosts.length === 0 ? (
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <Typography variant="h6">No event available yet, check back soon!</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
        {localPosts
          .slice((page - 1) * rowsPerPage, page * rowsPerPage)
          .map((post, index) => {
          const latestPostLarge = index === 0;
          const latestPost = index === 1 || index === 2;

          return (
            <Grid
              key={post.id}
              size={{
                xs: 12,
                sm: latestPostLarge ? 12 : 6,
                md: latestPostLarge ? 6 : 3,
              }}
            >
              <Box sx={{ position: 'relative' }}>
                <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 50 }}>
                  <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleEdit(post); }}>
                    <Iconify icon="solar:pen-bold" width={16} />
                  </IconButton>
                  <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDelete(post.id); }}>
                    <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                  </IconButton>
                </Box>
                <PostItem post={post} latestPost={latestPost} latestPostLarge={latestPostLarge} />
              </Box>
            </Grid>
          );
        })}
        </Grid>
      )}

      {localPosts.length > 0 && totalPages > 1 && (
        <Pagination page={page} count={totalPages} onChange={handlePageChange} color="primary" sx={{ mt: 8, mx: 'auto' }} />
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{formData && !formData.id.startsWith('local-') ? 'Edit Event' : 'Add Event'}</DialogTitle>
        <DialogContent>
            <Box sx={{ mt: 1, display: 'grid', gap: 2 }}>
              <TextField label="Title" value={formData?.title ?? ''} onChange={(e) => setFormData((prev) => prev ? { ...prev, title: e.target.value } : null)} fullWidth />
              <TextField label="Description" value={formData?.description ?? ''} multiline minRows={3} onChange={(e) => setFormData((prev) => prev ? { ...prev, description: e.target.value } : null)} fullWidth />
              <TextField label="Type" value={(formData as any)?.type ?? ''} onChange={(e) => setFormData((prev) => prev ? { ...prev, type: e.target.value } : null)} fullWidth />
              <TextField label="Start Date (ISO)" value={(formData as any)?.startDate ?? ''} onChange={(e) => setFormData((prev) => prev ? { ...prev, startDate: e.target.value } : null)} fullWidth />
              <TextField label="End Date (ISO)" value={(formData as any)?.endDate ?? ''} onChange={(e) => setFormData((prev) => prev ? { ...prev, endDate: e.target.value } : null)} fullWidth />
              <TextField label="Location" value={(formData as any)?.location ?? ''} onChange={(e) => setFormData((prev) => prev ? { ...prev, location: e.target.value } : null)} fullWidth />
              <TextField label="Registration Link" value={(formData as any)?.registrationLink ?? ''} onChange={(e) => setFormData((prev) => prev ? { ...prev, registrationLink: e.target.value } : null)} fullWidth />
              <TextField label="Capacity" type="number" value={(formData as any)?.capacity ?? ''} onChange={(e) => setFormData((prev) => prev ? { ...prev, capacity: Number(e.target.value) } : null)} fullWidth />
              <TextField label="Cover Image URL" value={formData?.coverUrl ?? ''} onChange={(e) => setFormData((prev) => prev ? { ...prev, coverUrl: e.target.value } : null)} fullWidth />
            </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
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
