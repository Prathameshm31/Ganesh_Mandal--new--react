import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, Card, CardContent
} from '@mui/material';
import {
  MdPeople, MdAdminPanelSettings, MdVpnKey, MdPersonPin,
  MdPersonAdd, MdUpdate
} from 'react-icons/md';
import * as userPermissionService from '../../services/userPermissionService';

export default function PermissionDashboard() {
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await userPermissionService.getPermissionDashboard();
      setStats(data);
    } catch (e) { /* ignore */ }
  };

  const cards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: MdPeople, color: '#1976d2', link: '/permissions/users' },
    { label: 'Total Roles', value: stats?.totalRoles || 0, icon: MdAdminPanelSettings, color: '#388e3c', link: '/roles' },
    { label: 'Total Permissions', value: stats?.totalPermissions || 0, icon: MdVpnKey, color: '#f57c00', link: null },
    { label: 'Active Users', value: stats?.activeUsers || 0, icon: MdPersonPin, color: '#7b1fa2', link: null },
    { label: 'Custom Permissions', value: stats?.usersWithCustomPermissions || 0, icon: MdPersonAdd, color: '#c62828', link: '/permissions' },
    { label: 'Last Updated', value: 'Today', icon: MdUpdate, color: '#00695c', link: null },
  ];

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>Permission Dashboard</Typography>

      <Grid container spacing={3}>
        {cards.map((card, idx) => (
          <Grid item xs={12} sm={6} md={4} key={idx}>
            <Card
              sx={{
                cursor: card.link ? 'pointer' : 'default',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': card.link ? { transform: 'translateY(-4px)', boxShadow: 6 } : {}
              }}
              onClick={() => card.link && navigate(card.link)}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: 56, height: 56, borderRadius: 2,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  bgcolor: card.color, color: '#fff', fontSize: 28
                }}>
                  <card.icon />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight={700}>{card.value}</Typography>
                  <Typography variant="body2" color="text.secondary">{card.label}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
