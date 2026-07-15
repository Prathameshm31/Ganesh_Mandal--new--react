import { Card, CardContent, Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' },
  }),
};

const colorMap = {
  orange: { bg: 'linear-gradient(135deg, #FF6F00 0%, #FFB74D 100%)', light: 'rgba(255,111,0,0.12)' },
  green: { bg: 'linear-gradient(135deg, #2E7D32 0%, #66BB6A 100%)', light: 'rgba(46,125,50,0.12)' },
  blue: { bg: 'linear-gradient(135deg, #0288D1 0%, #4FC3F7 100%)', light: 'rgba(2,136,209,0.12)' },
  purple: { bg: 'linear-gradient(135deg, #7B1FA2 0%, #BA68C8 100%)', light: 'rgba(123,31,162,0.12)' },
  teal: { bg: 'linear-gradient(135deg, #00796B 0%, #4DB6AC 100%)', light: 'rgba(0,121,107,0.12)' },
  red: { bg: 'linear-gradient(135deg, #D32F2F 0%, #EF5350 100%)', light: 'rgba(211,47,47,0.12)' },
  amber: { bg: 'linear-gradient(135deg, #F57F17 0%, #FBC02D 100%)', light: 'rgba(245,127,23,0.12)' },
  indigo: { bg: 'linear-gradient(135deg, #283593 0%, #5C6BC0 100%)', light: 'rgba(40,53,147,0.12)' },
};

function formatIndian(n) {
  const num = Number(n);
  if (isNaN(num)) return '₹0';
  const str = Math.round(Math.abs(num)).toString();
  const lastThree = str.slice(-3);
  const rest = str.slice(0, -3);
  const formatted = rest ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree : lastThree;
  return num < 0 ? `-₹${formatted}` : `₹${formatted}`;
}

export default function StatsCard({ title, value, icon, color = 'orange', loading, index = 0, subtitle, suffix, onClick }) {
  const themeColor = colorMap[color] || colorMap.orange;

  if (loading) {
    return (
      <Card sx={{ height: '100%', borderRadius: 3, overflow: 'hidden' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box
              sx={{
                width: 48, height: 48, borderRadius: 2,
                bgcolor: 'action.hover',
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
            <Box sx={{ flex: 1 }}>
              <Box sx={{ width: '70%', height: 12, bgcolor: 'action.hover', borderRadius: 1, mb: 1, animation: 'pulse 1.5s ease-in-out infinite' }} />
              <Box sx={{ width: '50%', height: 10, bgcolor: 'action.hover', borderRadius: 1, animation: 'pulse 1.5s ease-in-out infinite' }} />
            </Box>
          </Box>
          <Box sx={{ width: '40%', height: 28, bgcolor: 'action.hover', borderRadius: 1, animation: 'pulse 1.5s ease-in-out infinite' }} />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      style={{ height: '100%' }}
    >
      <Card
        component={motion.div}
        whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.12)' }}
        whileTap={onClick ? { scale: 0.97 } : undefined}
        onClick={onClick}
        sx={{
          height: '100%',
          borderRadius: 3,
          overflow: 'hidden',
          position: 'relative',
          transition: 'box-shadow 0.3s ease',
          border: '1px solid',
          borderColor: 'divider',
          cursor: onClick ? 'pointer' : 'default',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 120,
            height: 120,
            borderRadius: '50%',
            transform: 'translate(30%, -30%)',
            background: themeColor.bg,
            opacity: 0.08,
          }}
        />
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: themeColor.light,
                color: color === 'orange' ? 'primary.main' : themeColor.bg,
                fontSize: 22,
              }}
            >
              {icon}
            </Box>
          </Box>
          <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mb: 0.5 }}>
            {title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
            <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1.2 }}>
              {typeof value === 'number' ? (title.toLowerCase().includes('collection') || title.toLowerCase().includes('contribution') || title.toLowerCase().includes('goal') ? formatIndian(value) : value.toLocaleString('en-IN')) : value}
            </Typography>
            {suffix && (
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                {suffix}
              </Typography>
            )}
          </Box>
          {subtitle && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {subtitle}
            </Typography>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
