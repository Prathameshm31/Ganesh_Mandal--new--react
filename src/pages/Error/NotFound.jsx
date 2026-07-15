import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { MdErrorOutline } from 'react-icons/md';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 12 }}>
      <MdErrorOutline size={80} color="#FF6F00" />
      <Typography variant="h3" fontWeight={800} sx={{ mt: 2 }}>404</Typography>
      <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>Page Not Found</Typography>
      <Button variant="contained" onClick={() => navigate('/')}>Go to Dashboard</Button>
    </Box>
  );
}
