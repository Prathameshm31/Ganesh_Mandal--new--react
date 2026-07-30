import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, Button,
} from '@mui/material';
import {
  MdPayments, MdCheckCircle, MdHourglassEmpty, MdError,
  MdUndo, MdToday, MdDateRange, MdArrowForward,
} from 'react-icons/md';
import { getPaymentDashboard } from '../../services/paymentService';

const statusColors = {
  PENDING: 'warning', PROCESSING: 'info', SUCCESS: 'success',
  FAILED: 'error', CANCELLED: 'default', REFUNDED: 'secondary',
};

export default function PaymentManagement() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await getPaymentDashboard();
      setDashboard(data);
    } catch (e) {
      console.error('Failed to load payment dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  const statCards = dashboard ? [
    { label: 'Total Payments', value: dashboard.totalPayments, icon: MdPayments, color: '#1976d2', filter: null },
    { label: 'Successful', value: dashboard.successfulPayments, icon: MdCheckCircle, color: '#2e7d32', filter: 'SUCCESS' },
    { label: 'Pending', value: dashboard.pendingPayments, icon: MdHourglassEmpty, color: '#ed6c02', filter: 'PENDING' },
    { label: 'Failed', value: dashboard.failedPayments, icon: MdError, color: '#d32f2f', filter: 'FAILED' },
    { label: 'Refunded', value: dashboard.refundedPayments, icon: MdUndo, color: '#9c27b0', filter: 'REFUNDED' },
    { label: `Today (₹${dashboard.todayCollection?.toLocaleString() || '0'})`, value: '', icon: MdToday, color: '#00796b', filter: null },
    { label: `Monthly (₹${dashboard.monthlyCollection?.toLocaleString() || '0'})`, value: '', icon: MdDateRange, color: '#e65100', filter: null },
  ] : [];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>Payment Management</Typography>

      <Grid container spacing={2} mb={4}>
        {statCards.map((card, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card
              sx={{
                cursor: card.filter ? 'pointer' : 'default',
                transition: '0.2s', '&:hover': card.filter ? { transform: 'translateY(-2px)', boxShadow: 4 } : {},
              }}
              onClick={() => card.filter && navigate(`/admin/payments?status=${card.filter}`)}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: card.color + '15', color: card.color, fontSize: 32, display: 'flex' }}>
                  <card.icon />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">{card.label}</Typography>
                  {card.value !== '' && (
                    <Typography variant="h5" fontWeight={700}>{card.value.toLocaleString()}</Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button variant="contained" onClick={() => navigate('/admin/payments')}>
          View All Payments
        </Button>
        <Button variant="contained" color="success" onClick={() => navigate('/donate')}>
          New Online Donation
        </Button>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={2}>Recent Payments</Typography>
          {dashboard?.recentPayments?.length > 0 ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Receipt</strong></TableCell>
                    <TableCell><strong>Donor</strong></TableCell>
                    <TableCell><strong>Amount</strong></TableCell>
                    <TableCell><strong>Type</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Date</strong></TableCell>
                    <TableCell><strong>Action</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dashboard.recentPayments.map(p => (
                    <TableRow key={p.id} hover>
                      <TableCell>{p.receiptNumber || '-'}</TableCell>
                      <TableCell>{p.donorName || '-'}</TableCell>
                      <TableCell>₹{p.amount?.toLocaleString()}</TableCell>
                      <TableCell>{p.donationType || '-'}</TableCell>
                      <TableCell>
                        <Chip label={p.status} color={statusColors[p.status] || 'default'} size="small" />
                      </TableCell>
                      <TableCell>{p.paymentDate || (p.createdAt ? p.createdAt.substring(0, 10) : '-')}</TableCell>
                      <TableCell>
                        <Button size="small" variant="outlined"
                          onClick={() => navigate(`/admin/payments/${p.id}`)}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography color="text.secondary" textAlign="center" py={4}>No payments yet</Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
