import { Box, Typography, Paper, Skeleton } from '@mui/material';
import { motion } from 'framer-motion';

export default function ChartCard({ title, subtitle, children, loading, isEmpty, emptyMessage, action, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: 'easeOut' }}
      style={{ height: '100%' }}
    >
      <Paper
        component={motion.div}
        whileHover={{ y: -3, boxShadow: '0 12px 40px rgba(0,0,0,0.07)' }}
        sx={{
          p: 2.5,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 3,
          border: 1,
          borderColor: 'divider',
          borderTop: 3,
          borderTopColor: 'primary.main',
          overflow: 'hidden',
          transition: 'box-shadow 0.35s ease, transform 0.35s ease',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5, gap: 1.5 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ lineHeight: 1.3 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25, display: 'block' }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {action && (
            <Box sx={{ flexShrink: 0, mt: -0.5 }}>
              {action}
            </Box>
          )}
        </Box>

        {loading ? (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1, pt: 1 }}>
            <Skeleton variant="rounded" sx={{ flex: 1, minHeight: 200, borderRadius: 2 }} />
          </Box>
        ) : isEmpty ? (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 200,
              gap: 1,
            }}
          >
            <Typography color="text.disabled" variant="h5" sx={{ fontSize: 32, opacity: 0.4 }}>
              —
            </Typography>
            <Typography variant="body2" color="text.disabled">
              {emptyMessage || 'No data available'}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ flex: 1, minHeight: 0 }}>
            {children}
          </Box>
        )}
      </Paper>
    </motion.div>
  );
}
