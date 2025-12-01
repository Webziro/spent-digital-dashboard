import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar';
import Alert as AlertComponent from '@mui/material/Alert';

import { CONFIG } from 'src/config-global';
import { getEventById, getAllEvents, registerForEvent } from 'src/api/events';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function EventDetailsPage() {
  const { id } = useParams();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [registerFormData, setRegisterFormData] = useState({ name: '', email: '' });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message?: string; severity?: 'success' | 'error' }>({ open: false });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Try to fetch by ID first
        let foundEvent = null;
        try {
          foundEvent = await getEventById(id || '');
        } catch {
          // If not found by ID, fetch all and search
          const list = await getAllEvents();
          foundEvent = Array.isArray(list)
            ? list.find((e: any) => e._id === id || e.title === id || e._id === decodeURIComponent(id || ''))
            : null;
        }

        if (!mounted) return;

        if (foundEvent) {
          setEvent(foundEvent);
          setError(null);
        } else {
          setError('Event not found');
          setEvent(null);
        }
      } catch (err: any) {
        if (mounted) {
          setError(`Failed to load event: ${err?.message ?? 'Unknown error'}`);
          setEvent(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  const handleShare = () => {
    const eventUrl = `${window.location.origin}/event/${id}`;
    const text = `${event?.title || 'Check out this event'} - ${event?.description || ''}`;

    // Try Web Share API
    if (navigator.share) {
      navigator
        .share({
          title: event?.title || 'Event',
          text,
          url: eventUrl,
        })
        .catch((err) => console.debug('Share failed:', err));
    } else {
      // Fallback: copy to clipboard
      const shareText = `${text}\n\n${eventUrl}`;
      navigator.clipboard.writeText(shareText).then(() => {
        setSnackbar({ open: true, message: 'Event link copied to clipboard!', severity: 'success' });
      });
    }
    setShareDialogOpen(false);
  };

  const handleRegister = () => {
    (async () => {
      if (!registerFormData.name || !registerFormData.email) {
        setSnackbar({ open: true, message: 'Please fill in all fields', severity: 'error' });
        return;
      }

      try {
        await registerForEvent(event._id, {
          name: registerFormData.name,
          email: registerFormData.email,
        });
        setSnackbar({ open: true, message: 'Successfully registered for the event!', severity: 'success' });
        setRegisterDialogOpen(false);
        setRegisterFormData({ name: '', email: '' });
      } catch (err: any) {
        setSnackbar({ open: true, message: err?.message ?? 'Registration failed', severity: 'error' });
      }
    })();
  };

  if (loading) {
    return (
      <Container sx={{ py: 5, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 5 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!event) {
    return (
      <Container sx={{ py: 5 }}>
        <Alert severity="warning">Event not found</Alert>
      </Container>
    );
  }

  const { title, description, type, startDate, endDate, location, registrationLink, imageUrl, capacity, registeredCount, status, createdBy } = event;

  const startDateTime = new Date(startDate);
  const endDateTime = new Date(endDate);

  return (
    <>
      <title>{`${title || 'Event'} - ${CONFIG.appName}`}</title>
      <Container maxWidth="md" sx={{ py: 5 }}>
        {/* Cover Image */}
        {imageUrl && (
          <Box
            component="img"
            src={imageUrl}
            alt={title}
            sx={{
              width: '100%',
              maxHeight: 400,
              objectFit: 'cover',
              borderRadius: 2,
              mb: 4,
            }}
          />
        )}

        {/* Title & Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="h3" gutterBottom sx={{ mb: 1 }}>
              {title || 'Untitled Event'}
            </Typography>
            {status && (
              <Chip label={status} color={status === 'upcoming' ? 'warning' : status === 'ongoing' ? 'success' : 'default'} sx={{ mb: 2 }} />
            )}
          </Box>
          <IconButton
            color="primary"
            onClick={() => setShareDialogOpen(true)}
            title="Share event"
            sx={{ mt: 1 }}
          >
            <Iconify icon="solar:share-bold" width={24} />
          </IconButton>
        </Box>

        {/* Event Details */}
        <Paper sx={{ p: 3, mb: 4, backgroundColor: '#f5f5f5' }}>
          <Stack spacing={2}>
            {/* Type */}
            {type && (
              <Box>
                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>
                  Event Type
                </Typography>
                <Typography variant="body2">{type}</Typography>
              </Box>
            )}

            {/* Date & Time */}
            <Box>
              <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>
                Date & Time
              </Typography>
              <Typography variant="body2">
                {startDateTime.toLocaleDateString()} at {startDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                {endDateTime.toLocaleDateString()} at {endDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Typography>
            </Box>

            {/* Location */}
            {location && (
              <Box>
                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>
                  Location
                </Typography>
                <Typography variant="body2">{location}</Typography>
              </Box>
            )}

            {/* Capacity */}
            {capacity && (
              <Box>
                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>
                  Capacity
                </Typography>
                <Typography variant="body2">
                  {registeredCount ?? 0} / {capacity} registered
                </Typography>
              </Box>
            )}

            {/* Organizer */}
            {createdBy && (
              <Box>
                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>
                  Organizer
                </Typography>
                <Typography variant="body2">{createdBy}</Typography>
              </Box>
            )}
          </Stack>
        </Paper>

        {/* Description */}
        {description && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Description
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
              {description}
            </Typography>
          </Box>
        )}

        {/* Action Buttons */}
        <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
          <Button variant="contained" color="primary" size="large" onClick={() => setRegisterDialogOpen(true)}>
            Register for Event
          </Button>
          {registrationLink && (
            <Button variant="outlined" color="primary" size="large" href={registrationLink} target="_blank" rel="noopener noreferrer">
              External Registration Link
            </Button>
          )}
        </Stack>
      </Container>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Share Event</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Share this event with others:
            </Typography>
            <TextField
              fullWidth
              label="Event Link"
              value={`${window.location.origin}/event/${id}`}
              readOnly
              onClick={(e) => (e.target as HTMLInputElement).select()}
              sx={{ mb: 2 }}
            />
            <Stack direction="row" spacing={1}>
              <IconButton
                color="primary"
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Share on Facebook"
              >
                <Iconify icon="logos:facebook" width={20} />
              </IconButton>
              <IconButton
                color="primary"
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(title || '')}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Share on Twitter"
              >
                <Iconify icon="logos:twitter" width={20} />
              </IconButton>
              <IconButton
                color="primary"
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Share on LinkedIn"
              >
                <Iconify icon="logos:linkedin" width={20} />
              </IconButton>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Close</Button>
          <Button variant="contained" onClick={handleShare}>
            Copy Link
          </Button>
        </DialogActions>
      </Dialog>

      {/* Register Dialog */}
      <Dialog open={registerDialogOpen} onClose={() => setRegisterDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Register for Event</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'grid', gap: 2 }}>
            <TextField
              label="Full Name"
              value={registerFormData.name}
              onChange={(e) => setRegisterFormData((prev) => ({ ...prev, name: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={registerFormData.email}
              onChange={(e) => setRegisterFormData((prev) => ({ ...prev, email: e.target.value }))}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRegisterDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleRegister}>
            Register
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ open: false })}
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
      >
        <AlertComponent severity={snackbar.severity ?? 'success'} onClose={() => setSnackbar({ open: false })}>
          {snackbar.message}
        </AlertComponent>
      </Snackbar>
    </>
  );
}
