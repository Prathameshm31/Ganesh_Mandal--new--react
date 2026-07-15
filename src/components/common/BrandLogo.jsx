import { useNavigate } from 'react-router-dom';
import { Box, Typography, Tooltip } from '@mui/material';
import branding from '../../config/branding';
import logoImg from '../../assets/logo/hindavi-swarajya-logo.png';

const sizeMap = {
  sm: 28,
  md: 36,
  lg: 48,
  xl: 64,
};

export default function BrandLogo({ size = 'md', showText = true, linkTo = '/' }) {
  const navigate = useNavigate();
  const px = sizeMap[size] || sizeMap.md;

  return (
    <Tooltip title={branding.name} arrow>
      <Box
        onClick={() => navigate(linkTo)}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1.5,
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <Box
          component="img"
          src={logoImg}
          alt={branding.name}
          sx={{
            width: px,
            height: px,
            objectFit: 'contain',
            borderRadius: 1,
            flexShrink: 0,
          }}
        />
        {showText && (
          <Typography
            variant="h5"
            color="primary.main"
            fontWeight={800}
            letterSpacing={1}
            sx={{ lineHeight: 1 }}
          >
            {branding.name}
          </Typography>
        )}
      </Box>
    </Tooltip>
  );
}
