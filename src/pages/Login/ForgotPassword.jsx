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

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    toast.success('Reset link sent to your email');
    setEmail('');
  };

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
        Enter your email/username to reset password
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <TextField
          label="Email / Username"
          value={email}
          onChange={e => setEmail(e.target.value)}
          fullWidth
          autoFocus
          disabled={loading}
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
