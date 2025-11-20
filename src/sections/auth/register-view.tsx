import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';

// auth API base
const rawBase = import.meta.env.VITE_API_BASE as string | undefined;
const API_AUTH = rawBase ? `${rawBase.replace(/\/$/, '')}/api/auth/register` : '/api/auth/register';

// ----------------------------------------------------------------------

export function RegisterView() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('Admin');
  const [email, setEmail] = useState('hello@gmail.com');
  const [password, setPassword] = useState('@demo1234');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message?: string; severity?: 'success' | 'error' }>({ open: false });

  const handleSignIn = useCallback(async () => {
    try {
      const res = await fetch(`${API_AUTH}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.message || `Register failed (${res.status})`);
      // if backend returns token, save and go home, otherwise redirect to sign-in
      const token = body.token ?? body.data?.token ?? body.accessToken;
      if (token) localStorage.setItem('token', token);
      setSnackbar({ open: true, message: 'Registered', severity: 'success' });
      router.push('/');
    } catch (err: any) {
      console.error('register error', err);
      setSnackbar({ open: true, message: err?.message ?? 'Register failed', severity: 'error' });
    }
  }, [router, name, email, password]);

  const renderForm = (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-end',
        flexDirection: 'column',
      }}
    >

    <TextField
        fullWidth
        name="name"
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        sx={{ mb: 3 }}
        slotProps={{
          inputLabel: { shrink: true },
        }}
      />    

      <TextField
        fullWidth
        name="email"
        label="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        sx={{ mb: 3 }}
        slotProps={{
          inputLabel: { shrink: true },
        }}
      />


      <TextField
        fullWidth
        name="password"
        label="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type={showPassword ? 'text' : 'password'}
        slotProps={{
          inputLabel: { shrink: true },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        sx={{ mb: 3 }}
      />

      <Button
        fullWidth
        size="large"
        type="submit"
        color="inherit"
        variant="contained"
        onClick={handleSignIn}
      >
        Register
      </Button>
    </Box>
  );

  return (
    <>
      <Box
        sx={{
          gap: 1.5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 5,
        }}
      >
        <Typography variant="h5">Register</Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
          }}
        >
          Don’t have an account?
          <Link variant="subtitle2" sx={{ ml: 0.5 }}>
            Get started
          </Link>
        </Typography>
      </Box>
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
      {renderForm}
      <Divider sx={{ my: 3, '&::before, &::after': { borderTopStyle: 'dashed' } }}>
        <Typography
          variant="overline"
          sx={{ color: 'text.secondary', fontWeight: 'fontWeightMedium' }}
        >
          OR
        </Typography>
      </Divider>
      <Box
        sx={{
          gap: 1,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <IconButton color="inherit">
          <Iconify width={22} icon="socials:google" />
        </IconButton>
        <IconButton color="inherit">
          <Iconify width={22} icon="socials:github" />
        </IconButton>
        <IconButton color="inherit">
          <Iconify width={22} icon="socials:twitter" />
        </IconButton>
      </Box>
    </>
  );
}
