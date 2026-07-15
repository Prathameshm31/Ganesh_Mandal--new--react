import { Box, Paper, Typography } from '@mui/material';
import BrandLogo from '../components/common/BrandLogo';

export default function AuthLayout({ children }) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4 },
          maxWidth: 440,
          width: '100%',
          border: 1,
          borderColor: 'divider',
          borderRadius: 3,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <BrandLogo size="lg" />
        </Box>
        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          mb={3}
        >
          Ganesh Mandal Management
        </Typography>
        {children}
      </Paper>
    </Box>
  );
}
