import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Pagination,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { MdAdd, MdEdit, MdDelete, MdClear, MdSearch, MdReceipt } from 'react-icons/md';
import { toast } from 'react-toastify';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  getAllDonations,
  deleteDonation,
} from '../../services/donationService';
import DonationForm from './DonationForm';

const paymentModes = ['Cash', 'UPI', 'Google Pay', 'PhonePe', 'Paytm', 'Bank Transfer'];
const onlineModes = ['UPI', 'Google Pay', 'PhonePe', 'Paytm', 'Bank Transfer'];

const paymentColors = {
  Cash: '#FF8F00',
  UPI: '#1565C0',
  'Google Pay': '#1A73E8',
  PhonePe: '#5F259F',
  Paytm: '#00BAF2',
  'Bank Transfer': '#2E7D32',
};

export default function DonationsList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('donationDate');
  const [sortOrder, setSortOrder] = useState('desc');

  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    paymentMode: '',
    colony: '',
    search: '',
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editDonation, setEditDonation] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const initialParamsApplied = useRef(false);

  const loadDonations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllDonations();
      setDonations(data);
    } catch {
      toast.error('Failed to load donations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDonations();
  }, [loadDonations]);

  useEffect(() => {
    if (initialParamsApplied.current) return;
    const pm = searchParams.get('paymentMode');
    const yr = searchParams.get('year');
    const newFilters = { ...filters };
    if (pm === 'Online') {
      newFilters.paymentMode = '';
    } else if (pm) {
      newFilters.paymentMode = pm;
    }
    if (yr) {
      newFilters.fromDate = `${yr}-01-01`;
      newFilters.toDate = `${yr}-12-31`;
    }
    setFilters(newFilters);
    initialParamsApplied.current = true;
  }, [searchParams]);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const colonies = [...new Set(donations.map((d) => d.colony).filter(Boolean))].sort();

  const filtered = donations.filter((d) => {
    if (filters.fromDate && d.donationDate < filters.fromDate) return false;
    if (filters.toDate && d.donationDate > filters.toDate) return false;
    const pmFilter = searchParams.get('paymentMode');
    if (pmFilter === 'Online') {
      if (!onlineModes.includes(d.paymentMode)) return false;
    } else if (pmFilter === 'Cash') {
      if (d.paymentMode !== 'Cash') return false;
    } else if (filters.paymentMode && d.paymentMode !== filters.paymentMode) return false;
    if (filters.colony && d.colony !== filters.colony) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!d.memberName?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    const aVal = a[sortBy] ?? '';
    const bVal = b[sortBy] ?? '';
    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / rowsPerPage) || 1;
  const paginated = sorted.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const totalAmount = filtered.reduce((sum, d) => sum + (d.amount || 0), 0);
  const cashTotal = filtered.filter((d) => d.paymentMode === 'Cash').reduce((sum, d) => sum + (d.amount || 0), 0);
  const onlineTotal = filtered.filter((d) => onlineModes.includes(d.paymentMode)).reduce((sum, d) => sum + (d.amount || 0), 0);

  const clearFilters = () => {
    setFilters({ fromDate: '', toDate: '', paymentMode: '', colony: '', search: '' });
    setPage(1);
    navigate('/donations', { replace: true });
    initialParamsApplied.current = true;
  };

  const hasFilters = Object.values(filters).some((v) => v !== '') || searchParams.get('paymentMode') || searchParams.get('year');

  const handleEdit = (donation) => {
    setEditDonation(donation);
    setFormOpen(true);
  };

  const handleAdd = () => {
    setEditDonation(null);
    setFormOpen(true);
  };

  const handleDeleteClick = (donation) => {
    setDeleteTarget(donation);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteDonation(deleteTarget.id);
      toast.success(`Donation deleted successfully`);
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
      loadDonations();
    } catch (err) {
      toast.error(err.message || 'Failed to delete donation');
    } finally {
      setDeleting(false);
    }
  };

  const handleFormSaved = () => {
    loadDonations();
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
            Donations
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {filtered.length} donation{filtered.length !== 1 ? 's' : ''} · ₹{totalAmount.toLocaleString('en-IN')} total
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<MdAdd />} onClick={handleAdd}>
          Add Donation
        </Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total Donations', value: filtered.length, color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
          { label: 'Total Amount', value: `₹${totalAmount.toLocaleString('en-IN')}`, color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
          { label: 'Cash Total', value: `₹${cashTotal.toLocaleString('en-IN')}`, color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
          { label: 'Online Total', value: `₹${onlineTotal.toLocaleString('en-IN')}`, color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
        ].map((card) => (
          <Grid item xs={6} sm={3} key={card.label}>
            <Card sx={{ background: card.color, color: '#fff' }}>
              <CardContent>
                <Typography variant="body2" sx={{ opacity: 0.85 }}>{card.label}</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>{card.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={6} sm={3} md={2}>
            <TextField
              label="From Date"
              type="date"
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={filters.fromDate}
              onChange={(e) => { setFilters((f) => ({ ...f, fromDate: e.target.value })); setPage(1); }}
            />
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <TextField
              label="To Date"
              type="date"
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={filters.toDate}
              onChange={(e) => { setFilters((f) => ({ ...f, toDate: e.target.value })); setPage(1); }}
            />
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <TextField
              label="Payment Mode"
              select
              size="small"
              fullWidth
              value={filters.paymentMode}
              onChange={(e) => { setFilters((f) => ({ ...f, paymentMode: e.target.value })); setPage(1); }}
            >
              <MenuItem value="">All</MenuItem>
              {paymentModes.map((m) => (
                <MenuItem key={m} value={m}>{m}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <TextField
              label="Colony"
              select
              size="small"
              fullWidth
              value={filters.colony}
              onChange={(e) => { setFilters((f) => ({ ...f, colony: e.target.value })); setPage(1); }}
            >
              <MenuItem value="">All</MenuItem>
              {colonies.map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <TextField
              label="Search Member"
              size="small"
              fullWidth
              value={filters.search}
              onChange={(e) => { setFilters((f) => ({ ...f, search: e.target.value })); setPage(1); }}
              InputProps={{ endAdornment: <MdSearch /> }}
            />
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <Button
              variant="outlined"
              startIcon={<MdClear />}
              onClick={clearFilters}
              disabled={!hasFilters}
              fullWidth
            >
              Clear
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Typography>Loading donations...</Typography>
      ) : paginated.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">No donations found</Typography>
          <Button variant="contained" startIcon={<MdAdd />} onClick={handleAdd} sx={{ mt: 2 }}>
            Add Donation
          </Button>
        </Paper>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  {[
                    { id: 'receiptNumber', label: 'Receipt No' },
                    { id: 'memberName', label: 'Member' },
                    { id: 'amount', label: 'Amount' },
                    { id: 'paymentMode', label: 'Payment Mode' },
                    { id: 'donationDate', label: 'Date' },
                    { id: 'colony', label: 'Colony' },
                    { id: 'collectorName', label: 'Collector' },
                  ].map((col) => (
                    <TableCell
                      key={col.id}
                      sx={{ cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }}
                      onClick={() => handleSort(col.id)}
                    >
                      {col.label}
                      {sortBy === col.id && (
                        <span style={{ marginLeft: 4 }}>{sortOrder === 'asc' ? '▲' : '▼'}</span>
                      )}
                    </TableCell>
                  ))}
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginated.map((donation) => (
                  <TableRow key={donation.id} hover>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{donation.receiptNumber}</TableCell>
                    <TableCell>{donation.memberName}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>₹{donation.amount?.toLocaleString('en-IN')}</TableCell>
                    <TableCell>
                      <Chip
                        label={donation.paymentMode}
                        size="small"
                        sx={{
                          backgroundColor: paymentColors[donation.paymentMode] || '#757575',
                          color: '#fff',
                          fontWeight: 500,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{donation.donationDate}</TableCell>
                    <TableCell>{donation.colony}</TableCell>
                    <TableCell>{donation.collectorName}</TableCell>
                    <TableCell>
                      <IconButton size="small" color="primary" onClick={() => handleEdit(donation)}>
                        <MdEdit />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteClick(donation)}>
                        <MdDelete />
                      </IconButton>
                      <IconButton size="small" color="default" onClick={() => navigate(`/receipt/${donation.id}`)}>
                        <MdReceipt />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, p) => setPage(p)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      <DonationForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditDonation(null); }}
        donation={editDonation}
        onSaved={handleFormSaved}
      />

      <Dialog open={deleteDialogOpen} onClose={() => { setDeleteDialogOpen(false); setDeleteTarget(null); }} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Donation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete donation <strong>{deleteTarget?.receiptNumber}</strong> from <strong>{deleteTarget?.memberName}</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDeleteDialogOpen(false); setDeleteTarget(null); }} disabled={deleting}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
