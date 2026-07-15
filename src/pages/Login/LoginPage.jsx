import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(username, password);
      toast.success('Login successful');
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <TextField
          label="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          fullWidth
          autoFocus
          disabled={loading}
        />
        <TextField
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={e => setPassword(e.target.value)}
          fullWidth
          disabled={loading}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <FormControlLabel
            control={<Checkbox checked={remember} onChange={e => setRemember(e.target.checked)} disabled={loading} />}
            label="Remember me"
          />
          <Typography
            component={Link}
            to="/forgot-password"
            variant="body2"
            color="primary"
            sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            Forgot Password?
          </Typography>
        </Box>
        {error && (
          <Typography color="error" variant="body2" textAlign="center">
            {error}
          </Typography>
        )}
        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
        </Button>
      </Box>
    </Box>
  );
}
