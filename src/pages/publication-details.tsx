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
import CircularProgress from '@mui/material/CircularProgress';

import { CONFIG } from 'src/config-global';
import { fetchPublications } from 'src/api/publications';

// ----------------------------------------------------------------------

export default function PublicationDetailsPage() {
  const { id } = useParams();
  const [publication, setPublication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await fetchPublications();
        // Find publication by ID (check _id and title as fallback)
        const pub = Array.isArray(list)
          ? list.find((p: any) => p._id === id || p.title === id || p._id === decodeURIComponent(id || ''))
          : null;

        if (!mounted) return;

        if (pub) {
          setPublication(pub);
          setError(null);
        } else {
          setError('Publication not found');
          setPublication(null);
        }
      } catch (err: any) {
        if (mounted) {
          setError(`Failed to load publication: ${err?.message ?? 'Unknown error'}`);
          setPublication(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

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

  if (!publication) {
    return (
      <Container sx={{ py: 5 }}>
        <Alert severity="warning">Publication not found</Alert>
      </Container>
    );
  }

  const { title, description, abstract, authors, tags, pdfUrl, coverImageUrl, publishedDate, doi, citations, downloads, summary } = publication;

  return (
    <>
      <title>{`${title || 'Publication'} - ${CONFIG.appName}`}</title>
      <Container maxWidth="md" sx={{ py: 5 }}>
        {/* Cover Image */}
        {coverImageUrl && (
          <Box
            component="img"
            src={coverImageUrl}
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

        {/* Title */}
        <Typography variant="h3" gutterBottom sx={{ mb: 2 }}>
          {title || 'Untitled Publication'}
        </Typography>

        {/* Authors */}
        {authors && authors.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
              Authors
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {authors.join(', ')}
            </Typography>
          </Box>
        )}

        {/* Published Date & Metadata */}
        <Stack direction="row" spacing={3} sx={{ mb: 3, pb: 2, borderBottom: '1px solid #e0e0e0' }}>
          {publishedDate && (
            <Box>
              <Typography variant="caption" color="textSecondary">
                Published Date
              </Typography>
              <Typography variant="body2">{new Date(publishedDate).toLocaleDateString()}</Typography>
            </Box>
          )}
          {doi && (
            <Box>
              <Typography variant="caption" color="textSecondary">
                DOI
              </Typography>
              <Typography variant="body2">
                <Link href={`https://doi.org/${doi}`} target="_blank" rel="noopener noreferrer">
                  {doi}
                </Link>
              </Typography>
            </Box>
          )}
          {citations !== undefined && (
            <Box>
              <Typography variant="caption" color="textSecondary">
                Citations
              </Typography>
              <Typography variant="body2">{citations}</Typography>
            </Box>
          )}
          {downloads !== undefined && (
            <Box>
              <Typography variant="caption" color="textSecondary">
                Downloads
              </Typography>
              <Typography variant="body2">{downloads}</Typography>
            </Box>
          )}
        </Stack>

        {/* Abstract */}
        {(abstract || summary) && (
          <Paper sx={{ p: 3, mb: 4, backgroundColor: '#f5f5f5' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Abstract
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {abstract || summary}
            </Typography>
          </Paper>
        )}

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

        {/* Tags */}
        {tags && tags.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Tags
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {tags.map((tag: string, idx: number) => (
                <Chip key={idx} label={tag} variant="outlined" />
              ))}
            </Stack>
          </Box>
        )}

        {/* PDF Download Button */}
        {pdfUrl && (
          <Box sx={{ mb: 4 }}>
            <Button variant="contained" href={pdfUrl} target="_blank" rel="noopener noreferrer" size="large">
              Download PDF
            </Button>
          </Box>
        )}
      </Container>
    </>
  );
}
