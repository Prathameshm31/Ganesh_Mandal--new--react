import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { MdLock } from 'react-icons/md';

export default function Forbidden() {
  const navigate = useNavigate();
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
      <MdLock size={80} style={{ opacity: 0.3, marginBottom: 16 }} />
      <Typography variant="h3" fontWeight={700} mb={1}>403</Typography>
      <Typography variant="h6" color="text.secondary" mb={3}>Access Denied</Typography>
      <Typography variant="body1" color="text.disabled" mb={3} maxWidth={400}>
        You do not have permission to access this page. Please contact your administrator if you believe this is an error.
      </Typography>
      <Button variant="contained" onClick={() => navigate('/')}>Go to Dashboard</Button>
    </Box>
  );
}
