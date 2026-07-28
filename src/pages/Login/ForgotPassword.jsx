import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import { toast } from 'react-toastify';
import apiClient, { extractErrorMessage } from '../../api/apiClient';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Invalid email format');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await apiClient.post('/auth/forgot-password', { email: email.trim() });
      setSent(true);
      toast.success('Password reset link has been sent to your email');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary" mb={3}>
          If the email is registered, you will receive a password reset link shortly.
        </Typography>
        <Typography
          component={Link}
          to="/login"
          variant="body2"
          color="primary"
          sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
        >
          Back to Login
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
        Enter your registered email to receive a password reset link
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <TextField
          label="Email Address"
          type="email"
          value={email}
          onChange={e => { setEmail(e.target.value); setError(''); }}
          fullWidth
          autoFocus
          disabled={loading}
          error={!!error}
          helperText={error}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Reset Link'}
        </Button>
        <Typography
          component={Link}
          to="/login"
          variant="body2"
          color="primary"
          textAlign="center"
          sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
        >
          Back to Login
        </Typography>
      </Box>
    </Box>
  );
}
