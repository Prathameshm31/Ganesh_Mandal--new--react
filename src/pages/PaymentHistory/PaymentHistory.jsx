import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Pagination,
  CircularProgress, Alert
} from '@mui/material';
import { getAllDonations } from '../../services/donationService';

const onlineModes = ['UPI', 'Google Pay', 'PhonePe', 'Paytm', 'Bank Transfer'];

export default function PaymentHistory() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 15;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const all = await getAllDonations();
      const total = all.length;
      setTotalPages(Math.ceil(total / perPage) || 1);
      const start = (page - 1) * perPage;
      setDonations(all.slice(start, start + perPage));
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalOnline = donations.filter(d => onlineModes.includes(d.paymentMode)).reduce((s, d) => s + d.amount, 0);
  const totalCash = donations.filter(d => d.paymentMode === 'Cash').reduce((s, d) => s + d.amount, 0);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>Payment History</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Paper sx={{ p: 2, minWidth: 160, textAlign: 'center', flex: 1 }}>
          <Typography variant="h5" fontWeight={700} color="primary.main">₹{totalOnline.toLocaleString('en-IN')}</Typography>
          <Typography variant="caption" color="text.secondary">Online Payments</Typography>
        </Paper>
        <Paper sx={{ p: 2, minWidth: 160, textAlign: 'center', flex: 1 }}>
          <Typography variant="h5" fontWeight={700} color="success.main">₹{totalCash.toLocaleString('en-IN')}</Typography>
          <Typography variant="caption" color="text.secondary">Cash Payments</Typography>
        </Paper>
      </Box>
      {donations.length === 0 ? (
        <Alert severity="info">No payment records found.</Alert>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Receipt</TableCell>
                  <TableCell>Member</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Mode</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Collector</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {donations.map(d => (
                  <TableRow key={d.id}>
                    <TableCell>{d.receiptNumber}</TableCell>
                    <TableCell>{d.memberName}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>₹{d.amount.toLocaleString('en-IN')}</TableCell>
                    <TableCell>
                      <Chip
                        label={d.paymentMode}
                        size="small"
                        color={onlineModes.includes(d.paymentMode) ? 'info' : 'success'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{d.donationDate}</TableCell>
                    <TableCell>{d.collectorName}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
