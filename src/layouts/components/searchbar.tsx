import type { BoxProps } from '@mui/material/Box';

import { varAlpha } from 'minimal-shared/utils';
import { useRef, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Paper from '@mui/material/Paper';
import Slide from '@mui/material/Slide';
import Input from '@mui/material/Input';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import InputAdornment from '@mui/material/InputAdornment';
import ListItemButton from '@mui/material/ListItemButton';
import CircularProgress from '@mui/material/CircularProgress';
import ClickAwayListener from '@mui/material/ClickAwayListener';

import { useRouter } from 'src/routes/hooks';

import { fetchPrograms } from 'src/api/programs';
import { fetchResearch } from 'src/api/research';
import { fetchPublications } from 'src/api/publications';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function Searchbar({ sx, ...other }: BoxProps) {
  const theme = useTheme();

  const [open, setOpen] = useState(false);

  const router = useRouter();

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<{
    id: string;
    title: string;
    description?: string;
  }[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<number | null>(null);

  const handleOpen = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleSelect = useCallback(
    (id?: string, titleWithType?: string) => {
      setQuery('');
      setSuggestions([]);
      setOpen(false);
      
      if (!id && !titleWithType) return;
      
      // Extract resource type from title (format: "Title (type)")
      let type = 'publication';
      if (titleWithType && titleWithType.includes('(')) {
        const match = titleWithType.match(/\((\w+)\)$/);
        if (match) type = match[1];
      }
      
      // Route based on type
      if (type === 'research') {
        router.push(`/manage-research?selected=${encodeURIComponent(id || '')}`);
      } else if (type === 'program') {
        router.push(`/manage-programs?selected=${encodeURIComponent(id || '')}`);
      } else {
        router.push(`/publication/${id}`);
      }
    },
    [router]
  );

  const doSearch = useCallback(async (q: string) => {
    if (!q || q.length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);

      // Query publications, research, and programs in parallel
      const [pubs, res, progs] = await Promise.allSettled([
        fetchPublications(),
        fetchResearch(),
        fetchPrograms(),
      ]);

      const ql = q.toLowerCase();
      const results: { id: string; title: string; description?: string; type: string }[] = [];

      if (pubs.status === 'fulfilled' && Array.isArray(pubs.value)) {
        for (const p of pubs.value) {
          const title = String(p.title ?? '');
          const desc = String(p.description ?? p.summary ?? p.abstract ?? '');
          if (title.toLowerCase().includes(ql) || desc.toLowerCase().includes(ql)) {
            results.push({ id: p._id ?? p.title, title: title || 'Untitled Publication', description: desc, type: 'publication' });
          }
        }
      }

      if (res.status === 'fulfilled' && Array.isArray(res.value)) {
        for (const r of res.value) {
          const title = String(r.title ?? '');
          const desc = String(r.description ?? r.abstract ?? '');
          if (title.toLowerCase().includes(ql) || desc.toLowerCase().includes(ql)) {
            results.push({ id: r._id ?? r.title, title: title || 'Untitled Research', description: desc, type: 'research' });
          }
        }
      }

      if (progs.status === 'fulfilled' && Array.isArray(progs.value)) {
        for (const pr of progs.value) {
          const title = String(pr.title ?? '');
          const desc = String(pr.description ?? '');
          if (title.toLowerCase().includes(ql) || desc.toLowerCase().includes(ql)) {
            results.push({ id: pr._id ?? pr.title, title: title || 'Untitled Program', description: desc, type: 'program' });
          }
        }
      }

      // Deduplicate by id (keep first occurrence), then take top 8
      const seen = new Set<string>();
      const deduped: typeof results = [];
      for (const r of results) {
        if (!r.id) continue;
        if (!seen.has(r.id)) {
          seen.add(r.id);
          deduped.push(r);
        }
        if (deduped.length >= 8) break;
      }

      // Map to suggestion shape with type-aware titles
      const suggestionsReady = deduped.map((s) => ({
        id: s.id,
        title: s.title + (s.type ? ` (${s.type})` : ''),
        description: s.description,
      }));

      setSuggestions(suggestionsReady);
    } catch (err) {
      console.error('Search error', err);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setQuery(v);
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => doSearch(v), 300);
  }, [doSearch]);

  return (
    <ClickAwayListener onClickAway={handleClose}>
      <div>
        {!open && (
          <IconButton onClick={handleOpen}>
            <Iconify icon="eva:search-fill" />
          </IconButton>
        )}

        <Slide direction="down" in={open} mountOnEnter unmountOnExit>
          <Box
            sx={{
              top: 0,
              left: 0,
              zIndex: 99,
              width: '100%',
              display: 'flex',
              position: 'absolute',
              alignItems: 'center',
              px: { xs: 3, md: 5 },
              boxShadow: theme.vars.customShadows.z8,
              height: {
                xs: 'var(--layout-header-mobile-height)',
                md: 'var(--layout-header-desktop-height)',
              },
              backdropFilter: `blur(6px)`,
              WebkitBackdropFilter: `blur(6px)`,
              backgroundColor: varAlpha(theme.vars.palette.background.defaultChannel, 0.8),
              ...sx,
            }}
            {...other}
          >
            <Input
              value={query}
              onChange={handleInputChange}
              autoFocus
              fullWidth
              disableUnderline
              placeholder="Search publications, research, programs…"
              startAdornment={
                <InputAdornment position="start">
                  <Iconify width={20} icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              }
              sx={{ fontWeight: 'fontWeightBold' }}
            />
            <Button variant="contained" onClick={() => handleSelect(undefined, query)}>
              Search
            </Button>

            {/* Suggestions dropdown */}
            {open && (loading || (suggestions && suggestions.length > 0)) && (
              <Paper
                elevation={8}
                sx={{
                  position: 'absolute',
                  top: '100%',
                  left: 16,
                  right: 16,
                  mt: 1,
                  zIndex: 1300,
                  maxHeight: 300,
                  overflow: 'auto',
                }}
              >
                {loading ? (
                  <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress size={20} />
                  </Box>
                ) : (
                  <List dense>
                    {suggestions.map((s) => (
                      <ListItemButton key={s.id} onClick={() => handleSelect(s.id)}>
                        <ListItemText primary={s.title} secondary={s.description} />
                      </ListItemButton>
                    ))}
                  </List>
                )}
              </Paper>
            )}
          </Box>
        </Slide>
      </div>
    </ClickAwayListener>
  );
}
