import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, TextField, Button, Grid,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, TableSortLabel, Chip, IconButton, InputAdornment,
  FormControl, InputLabel, Select, MenuItem, Collapse,
} from '@mui/material';
import {
  MdSearch, MdFilterList, MdVisibility, MdRefresh, MdClose,
} from 'react-icons/md';
import { searchPayments } from '../../services/paymentService';

const statusColors = {
  PENDING: 'warning', PROCESSING: 'info', SUCCESS: 'success',
  FAILED: 'error', CANCELLED: 'default', REFUNDED: 'secondary',
};

const donationTypes = ['GENERAL', 'GANESH_MURTI', 'PRASAD', 'DECORATION', 'CULTURAL_PROGRAMS', 'ANNADAN', 'VOLUNTEER_SUPPORT', 'OTHER'];
const paymentGateways = ['RAZORPAY', 'PHONEPE', 'CASHFREE', 'PAYU'];
const statuses = ['PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED'];

export default function PaymentList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState({ content: [], totalPages: 0, totalElements: 0 });
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    search: '',
    startDate: '',
    endDate: '',
    donationType: '',
    paymentGateway: '',
    donorName: '',
    mobile: '',
    email: '',
    page: 0,
    size: 10,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      if (!params.search) delete params.search;
      if (!params.status) delete params.status;
      if (!params.startDate) delete params.startDate;
      if (!params.endDate) delete params.endDate;
      if (!params.donationType) delete params.donationType;
      if (!params.paymentGateway) delete params.paymentGateway;
      if (!params.donorName) delete params.donorName;
      if (!params.mobile) delete params.mobile;
      if (!params.email) delete params.email;
      const result = await searchPayments(params);
      setData(result);
    } catch (e) {
      console.error('Failed to load payments:', e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSort = (column) => {
    setFilters(f => ({
      ...f,
      sortBy: column,
      sortOrder: f.sortBy === column && f.sortOrder === 'DESC' ? 'ASC' : 'DESC',
    }));
  };

  const handlePageChange = (event, newPage) => {
    setFilters(f => ({ ...f, page: newPage }));
  };

  const handleRowsPerPageChange = (event) => {
    setFilters(f => ({ ...f, size: parseInt(event.target.value), page: 0 }));
  };

  const clearFilters = () => {
    setFilters({
      status: '', search: '', startDate: '', endDate: '', donationType: '',
      paymentGateway: '', donorName: '', mobile: '', email: '',
      page: 0, size: 10, sortBy: 'createdAt', sortOrder: 'DESC',
    });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Payments</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<MdFilterList />}
            onClick={() => setShowFilters(!showFilters)}>
            Filters
          </Button>
          <Button variant="outlined" startIcon={<MdRefresh />} onClick={loadData}>Refresh</Button>
        </Box>
      </Box>

      <Collapse in={showFilters}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <TextField fullWidth size="small" label="Search (Order/Payment/Donor/Mobile)"
                  value={filters.search}
                  onChange={e => setFilters(f => ({ ...f, search: e.target.value, page: 0 }))}
                  InputProps={{ startAdornment: <InputAdornment position="start"><MdSearch /></InputAdornment> }} />
              </Grid>
              <Grid item xs={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select value={filters.status} label="Status"
                    onChange={e => setFilters(f => ({ ...f, status: e.target.value, page: 0 }))}>
                    <MenuItem value="">All</MenuItem>
                    {statuses.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Type</InputLabel>
                  <Select value={filters.donationType} label="Type"
                    onChange={e => setFilters(f => ({ ...f, donationType: e.target.value, page: 0 }))}>
                    <MenuItem value="">All</MenuItem>
                    {donationTypes.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Gateway</InputLabel>
                  <Select value={filters.paymentGateway} label="Gateway"
                    onChange={e => setFilters(f => ({ ...f, paymentGateway: e.target.value, page: 0 }))}>
                    <MenuItem value="">All</MenuItem>
                    {paymentGateways.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} md={2}>
                <TextField fullWidth size="small" label="Start Date" type="date"
                  InputLabelProps={{ shrink: true }}
                  value={filters.startDate}
                  onChange={e => setFilters(f => ({ ...f, startDate: e.target.value, page: 0 }))} />
              </Grid>
              <Grid item xs={6} md={1}>
                <TextField fullWidth size="small" label="End" type="date"
                  InputLabelProps={{ shrink: true }}
                  value={filters.endDate}
                  onChange={e => setFilters(f => ({ ...f, endDate: e.target.value, page: 0 }))} />
              </Grid>
              <Grid item xs={6} md={2}>
                <TextField fullWidth size="small" label="Donor Name"
                  value={filters.donorName}
                  onChange={e => setFilters(f => ({ ...f, donorName: e.target.value, page: 0 }))} />
              </Grid>
              <Grid item xs={6} md={1}>
                <TextField fullWidth size="small" label="Mobile"
                  value={filters.mobile}
                  onChange={e => setFilters(f => ({ ...f, mobile: e.target.value, page: 0 }))} />
              </Grid>
              <Grid item xs={6} md={2}>
                <TextField fullWidth size="small" label="Email"
                  value={filters.email}
                  onChange={e => setFilters(f => ({ ...f, email: e.target.value, page: 0 }))} />
              </Grid>
              <Grid item xs={6} md={1}>
                <Button fullWidth variant="text" color="error" startIcon={<MdClose />} onClick={clearFilters}>
                  Clear
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Collapse>

      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><TableSortLabel active={filters.sortBy === 'receiptNumber'} direction={filters.sortBy === 'receiptNumber' ? filters.sortOrder : 'desc'} onClick={() => handleSort('receiptNumber')}>Receipt</TableSortLabel></TableCell>
                  <TableCell><TableSortLabel active={filters.sortBy === 'donorName'} direction={filters.sortBy === 'donorName' ? filters.sortOrder : 'desc'} onClick={() => handleSort('donorName')}>Donor</TableSortLabel></TableCell>
                  <TableCell><TableSortLabel active={filters.sortBy === 'amount'} direction={filters.sortBy === 'amount' ? filters.sortOrder : 'desc'} onClick={() => handleSort('amount')}>Amount</TableSortLabel></TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Gateway</TableCell>
                  <TableCell><TableSortLabel active={filters.sortBy === 'status'} direction={filters.sortBy === 'status' ? filters.sortOrder : 'desc'} onClick={() => handleSort('status')}>Status</TableSortLabel></TableCell>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Payment ID</TableCell>
                  <TableCell><TableSortLabel active={filters.sortBy === 'paymentDate'} direction={filters.sortBy === 'paymentDate' ? filters.sortOrder : 'desc'} onClick={() => handleSort('paymentDate')}>Date</TableSortLabel></TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={10} align="center" sx={{ py: 4 }}>Loading...</TableCell></TableRow>
                ) : data.content?.length > 0 ? data.content.map(p => (
                  <TableRow key={p.id} hover>
                    <TableCell>{p.receiptNumber || '-'}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>{p.donorName || 'Anonymous'}</Typography>
                      <Typography variant="caption" color="text.secondary">{p.donorEmail || p.donorMobile || ''}</Typography>
                    </TableCell>
                    <TableCell>₹{p.amount?.toLocaleString()}</TableCell>
                    <TableCell><Chip label={p.donationType || '-'} size="small" variant="outlined" /></TableCell>
                    <TableCell>{p.paymentGateway || '-'}</TableCell>
                    <TableCell><Chip label={p.status} color={statusColors[p.status] || 'default'} size="small" /></TableCell>
                    <TableCell><Typography variant="caption" sx={{ wordBreak: 'break-all' }}>{p.orderId || '-'}</Typography></TableCell>
                    <TableCell><Typography variant="caption" sx={{ wordBreak: 'break-all' }}>{p.paymentId || '-'}</Typography></TableCell>
                    <TableCell>{p.paymentDate || (p.createdAt?.substring(0, 10))}</TableCell>
                    <TableCell>
                      <IconButton size="small" color="primary" onClick={() => navigate(`/admin/payments/${p.id}`)}>
                        <MdVisibility />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={10} align="center" sx={{ py: 4 }}>No payments found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div" count={data.totalElements || 0}
            page={filters.page} onPageChange={handlePageChange}
            rowsPerPage={filters.size} onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </CardContent>
      </Card>
    </Box>
  );
}
