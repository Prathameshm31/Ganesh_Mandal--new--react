import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Card, CardContent, Chip, Avatar, Stack,
} from '@mui/material';
import {
  Users, UserCheck, Shield, Calendar, Camera, DollarSign,
  Bell, Gift, Palette, UtensilsCrossed, ShieldAlert, Truck, Clock,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import volunteerService from '../../services/volunteerService';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

const currentYear = new Date().getFullYear().toString();

const iconMap = {
  Users, UserCheck, Shield, Calendar, Camera, DollarSign,
  Bell, Gift, Palette, UtensilsCrossed, ShieldAlert, Truck, Clock,
};

const colorMap = {
  blue: { bg: 'rgba(59,130,246,0.1)', text: '#2563eb', border: '#93c5fd' },
  green: { bg: 'rgba(16,185,129,0.1)', text: '#059669', border: '#6ee7b7' },
  purple: { bg: 'rgba(139,92,246,0.1)', text: '#7c3aed', border: '#c4b5fd' },
  orange: { bg: 'rgba(249,115,22,0.1)', text: '#d97706', border: '#fdba74' },
  pink: { bg: 'rgba(236,72,153,0.1)', text: '#db2777', border: '#f9a8d4' },
  indigo: { bg: 'rgba(99,102,241,0.1)', text: '#4f46e5', border: '#a5b4fc' },
  amber: { bg: 'rgba(245,158,11,0.1)', text: '#d97706', border: '#fcd34d' },
  teal: { bg: 'rgba(20,184,166,0.1)', text: '#0d9488', border: '#5eead4' },
  red: { bg: 'rgba(239,68,68,0.1)', text: '#dc2626', border: '#fca5a5' },
  cyan: { bg: 'rgba(6,182,212,0.1)', text: '#0891b2', border: '#67e8f9' },
};

function StatCard({ title, value, icon: Icon, color, onClick }) {
  const c = colorMap[color] || colorMap.blue;
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.02 }}>
      <Paper
        elevation={0}
        sx={{
          p: 2.5, borderRadius: 3, cursor: 'pointer',
          border: '1px solid', borderColor: 'divider',
          transition: 'all 0.2s',
          '&:hover': { borderColor: c.border, boxShadow: `0 4px 12px ${c.bg}`, bgcolor: c.bg },
        }}
        onClick={onClick}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar sx={{ bgcolor: c.bg, color: c.text, width: 48, height: 48 }}>
            <Icon size={22} />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={500}>{title}</Typography>
            <Typography variant="h5" fontWeight={700}>{value ?? 0}</Typography>
          </Box>
        </Stack>
      </Paper>
    </motion.div>
  );
}

function buildNavParams(filter, year) {
  if (!filter) return { path: '/volunteers/list', params: { festivalYear: year } };
  if (filter.type === 'assignedDate') {
    const today = new Date().toISOString().split('T')[0];
    return { path: '/volunteers/list', params: { assignedDate: today, festivalYear: year, title: "Today's Duty" } };
  }
  if (filter.type === 'upcoming') {
    return { path: '/volunteers/list', params: { type: 'upcoming', festivalYear: year, title: 'Upcoming Duties' } };
  }
  if (filter.type === 'birthdayMonth') {
    return { path: '/volunteers/list', params: { birthdayMonth: new Date().getMonth() + 1, festivalYear: year, title: 'Birthdays This Month' } };
  }
  if (filter.roles) {
    return { path: '/volunteers/list', params: { roles: filter.roles, festivalYear: year } };
  }
  return { path: '/volunteers/list', params: { ...filter, festivalYear: year } };
}

export default function VolunteerDashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [dash, setDash] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, d] = await Promise.all([
        volunteerService.getDashboardSummary(currentYear),
        volunteerService.getVolunteerDashboard(currentYear),
      ]);
      setSummary(s);
      setDash(d);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingSkeleton rows={10} />;

  const handleCardClick = (cardConfig) => {
    const { path, params } = buildNavParams(cardConfig.filter, currentYear);
    navigate(path + '?' + new URLSearchParams(params).toString());
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={0.5}>Volunteer & Committee Dashboard</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>Festival Year {currentYear}</Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 2, mb: 3 }}>
        {volunteerService.CARD_CONFIGS.map((cfg) => {
          const val = summary?.[cfg.key] ?? dash?.[cfg.key] ?? 0;
          const Icon = iconMap[cfg.icon];
          return (
            <StatCard
              key={cfg.key}
              title={cfg.label}
              value={val}
              icon={Icon}
              color={cfg.color}
              onClick={() => handleCardClick(cfg)}
            />
          );
        })}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        {dash?.todayAssignments?.length > 0 && (
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} mb={1.5}>Today's Assignments</Typography>
              <Stack spacing={1}>
                {dash.todayAssignments.map((a) => (
                  <Stack key={a.id} direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body2" fontWeight={500}>{a.volunteerName}</Typography>
                      <Typography variant="caption" color="text.secondary">{a.eventName} — {a.role}</Typography>
                    </Box>
                    <Chip label={a.startTime || 'N/A'} size="small" variant="outlined" />
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        )}
        {dash?.upcomingAssignments?.length > 0 && (
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} mb={1.5}>Upcoming Duties</Typography>
              <Stack spacing={1}>
                {dash.upcomingAssignments.map((a) => (
                  <Stack key={a.id} direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body2" fontWeight={500}>{a.volunteerName}</Typography>
                      <Typography variant="caption" color="text.secondary">{a.eventName} — {a.dutyDate}</Typography>
                    </Box>
                    <Chip label={a.role} size="small" color="primary" variant="outlined" />
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        )}
        {dash?.birthdayVolunteers?.length > 0 && (
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} mb={1.5}>Birthdays This Month</Typography>
              <Stack spacing={1}>
                {dash.birthdayVolunteers.map((v) => (
                  <Stack key={v.id} direction="row" alignItems="center" spacing={1.5}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'error.light' }}>{v.name?.charAt(0)}</Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>{v.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{v.role} — {v.dateOfBirth}</Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
}
