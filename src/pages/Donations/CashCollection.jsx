import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import { MdAdd, MdEdit, MdDelete, MdReceipt } from 'react-icons/md';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { getAllDonations, deleteDonation } from '../../services/donationService';
import DonationForm from './DonationForm';

export default function CashCollection() {
  const navigate = useNavigate();
  const [allDonations, setAllDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editDonation, setEditDonation] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rawData = await getAllDonations();
      const data = Array.isArray(rawData) ? rawData : (rawData?.content || []);
      setAllDonations(data);
    } catch {
      toast.error('Failed to load donations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const cashDonations = allDonations.filter((d) => d.paymentMode === 'Cash');
  const totalCash = cashDonations.reduce((sum, d) => sum + (d.amount || 0), 0);

  const handleAdd = () => { setEditDonation(null); setFormOpen(true); };
  const handleEdit = (d) => { setEditDonation(d); setFormOpen(true); };
  const handleDeleteClick = (d) => { setDeleteTarget(d); setDeleteDialogOpen(true); };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteDonation(deleteTarget.id);
      toast.success('Cash donation deleted');
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
      load();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete';
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
            Cash Collections
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {cashDonations.length} cash donation{cashDonations.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<MdAdd />} onClick={handleAdd}>
          Add Cash Donation
        </Button>
      </Box>

      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #FF8F00 0%, #FFB300 100%)', color: '#fff' }}>
        <CardContent>
          <Typography variant="body2" sx={{ opacity: 0.85 }}>Total Cash Collected</Typography>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>₹{totalCash.toLocaleString('en-IN')}</Typography>
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : cashDonations.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            No cash collections yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Start by recording your first cash collection
          </Typography>
          <Button variant="contained" startIcon={<MdAdd />} onClick={handleAdd}>
            Add Cash Donation
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Receipt No</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Member</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Payment</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Colony</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Collector</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cashDonations.map((d) => (
                <TableRow key={d.id} hover>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{d.receiptNumber}</TableCell>
                  <TableCell>{d.memberName}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>₹{d.amount?.toLocaleString('en-IN')}</TableCell>
                  <TableCell>
                    <Chip label={d.paymentMode} size="small" sx={{ backgroundColor: '#FF8F00', color: '#fff', fontWeight: 500 }} />
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{d.collectionDate}</TableCell>
                  <TableCell>{d.colony}</TableCell>
                  <TableCell>{d.collectorName}</TableCell>
                  <TableCell>
                    <IconButton size="small" color="primary" onClick={() => handleEdit(d)}><MdEdit /></IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDeleteClick(d)}><MdDelete /></IconButton>
                    <IconButton size="small" color="default" onClick={() => navigate(`/receipt/${d.id}`)}><MdReceipt /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <DonationForm open={formOpen} onClose={() => { setFormOpen(false); setEditDonation(null); }} donation={editDonation} onSaved={load} />

      <Dialog open={deleteDialogOpen} onClose={() => { setDeleteDialogOpen(false); setDeleteTarget(null); }} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Cash Donation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete donation <strong>{deleteTarget?.receiptNumber}</strong> from <strong>{deleteTarget?.memberName}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDeleteDialogOpen(false); setDeleteTarget(null); }} disabled={deleting}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" disabled={deleting}>
            {deleting ? <CircularProgress size={20} color="inherit" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
