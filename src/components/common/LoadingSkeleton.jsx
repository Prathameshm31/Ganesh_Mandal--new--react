import { Skeleton, Box, Card, CardContent } from '@mui/material';

export default function LoadingSkeleton({ type = 'card', count = 1 }) {
  if (type === 'table') {
    return (
      <Box>
        {Array.from({ length: count }).map((_, i) => (
          <Box
            key={i}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              mb: 1.5,
              p: 1.5,
              bgcolor: 'background.paper',
              borderRadius: 2,
            }}
          >
            <Skeleton variant="circular" width={40} height={40} />
            <Box sx={{ flex: 1 }}>
              <Skeleton width="80%" height={14} sx={{ mb: 0.5 }} />
              <Skeleton width="50%" height={12} />
            </Box>
            <Skeleton width={60} height={32} variant="rounded" />
          </Box>
        ))}
      </Box>
    );
  }

  if (type === 'text') {
    return (
      <Box>
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton
            key={i}
            width={i % 2 === 0 ? '100%' : '75%'}
            height={14}
            sx={{ mb: 1 }}
          />
        ))}
      </Box>
    );
  }

  if (type === 'profile') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
        <Skeleton variant="circular" width={80} height={80} />
        <Box sx={{ flex: 1 }}>
          <Skeleton width="60%" height={20} sx={{ mb: 0.5 }} />
          <Skeleton width="40%" height={14} sx={{ mb: 0.5 }} />
          <Skeleton width="30%" height={14} />
        </Box>
      </Box>
    );
  }

  if (type === 'chart') {
    return (
      <Box sx={{ p: 2, height: 300, display: 'flex', alignItems: 'flex-end', gap: 1 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton
            key={i}
            width={`${100 / 8}%`}
            height={`${30 + Math.random() * 60}%`}
            variant="rounded"
            sx={{ borderRadius: '4px 4px 0 0' }}
          />
        ))}
      </Box>
    );
  }

  if (type === 'statCard') {
    return (
      <Card sx={{ height: '100%', borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Skeleton variant="rounded" width={48} height={48} sx={{ mb: 2, borderRadius: 2 }} />
          <Skeleton width="60%" height={12} sx={{ mb: 1 }} />
          <Skeleton width="80%" height={28} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} sx={{ width: { xs: '100%', sm: 280 } }}>
          <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 0 }} />
          <CardContent>
            <Skeleton width="80%" height={18} sx={{ mb: 1 }} />
            <Skeleton width="60%" height={14} sx={{ mb: 1 }} />
            <Skeleton width="40%" height={14} />
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
