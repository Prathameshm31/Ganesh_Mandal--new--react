import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, TextField, Table, TableHead, TableBody,
  TableRow, TableCell, TablePagination, Card, CardContent, Stack,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Chip, IconButton, Tooltip, InputAdornment, MenuItem, Tabs, Tab,
  Grid, Select, FormControl, InputLabel,
} from '@mui/material';
import { MdAdd, MdEdit, MdDelete, MdSearch, MdImage } from 'react-icons/md';
import { toast } from 'react-toastify';
import murtiService from '../../services/murtiService';
import prasadSponsorshipService from '../../services/prasadSponsorshipService';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

const murtiTypes = ['Clay', 'POP', 'Eco-Friendly', 'Fiber', 'Wood', 'Brass', 'Marble', 'Other'];
const festivalDays = Array.from({ length: 11 }, (_, i) => `Day ${i + 1}`);
const prasadStatuses = ['Pending', 'Completed', 'Cancelled'];

const currentYear = new Date().getFullYear().toString();
const years = Array.from({ length: 10 }, (_, i) => String(currentYear - 5 + i));

function TabPanel({ children, value, index }) {
  return value === index ? <Box>{children}</Box> : null;
}

function PrasadSection() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [yearSel, setYearSel] = useState(currentYear);
  const [dayFilter, setDayFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({
    festivalYear: currentYear, festivalDay: '', prasadDate: '',
    prasadName: '', sponsoredBy: '', mobileNumber: '', address: '',
    quantity: '', estimatedCost: '', donationAmount: '', preparedBy: '',
    distributionTime: '', status: 'Pending', notes: '',
  });

  const loadRecords = useCallback(async () => {
    setLoading(true);
    try {
      let data;
      if (searchTerm.trim()) {
        data = await prasadSponsorshipService.searchPrasad(searchTerm.trim());
      } else if (dayFilter) {
        data = await prasadSponsorshipService.getPrasadByYearAndDay(yearSel, dayFilter);
      } else {
        data = await prasadSponsorshipService.getPrasadByYear(yearSel);
      }
      setRecords(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, yearSel, dayFilter]);

  useEffect(() => { loadRecords(); }, [loadRecords]);

  const openAdd = () => {
    setEditId(null);
    setForm({ festivalYear: yearSel, festivalDay: '', prasadDate: '', prasadName: '', sponsoredBy: '', mobileNumber: '', address: '', quantity: '', estimatedCost: '', donationAmount: '', preparedBy: '', distributionTime: '', status: 'Pending', notes: '' });
    setFormOpen(true);
  };

  const openEdit = async (id) => {
    try {
      const data = await prasadSponsorshipService.getPrasadById(id);
      setEditId(id);
      setForm({
        ...data,
        estimatedCost: data.estimatedCost != null ? String(data.estimatedCost) : '',
        donationAmount: data.donationAmount != null ? String(data.donationAmount) : '',
      });
      setFormOpen(true);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        estimatedCost: form.estimatedCost ? Number(form.estimatedCost) : null,
        donationAmount: form.donationAmount ? Number(form.donationAmount) : null,
      };
      if (editId) {
        await prasadSponsorshipService.updatePrasad(editId, payload);
        toast.success('Prasad record updated');
      } else {
        await prasadSponsorshipService.createPrasad(payload);
        toast.success('Prasad record created');
      }
      setFormOpen(false);
      loadRecords();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await prasadSponsorshipService.deletePrasad(deleteTarget.id);
      toast.success('Prasad record deleted');
      setDeleteTarget(null);
      loadRecords();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h6" fontWeight={600}>Prasad Sponsorship</Typography>
        <Button variant="contained" size="small" startIcon={<MdAdd />} onClick={openAdd}>Add Prasad</Button>
      </Box>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField size="small" placeholder="Search sponsor or prasad..." value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); }} sx={{ minWidth: 240 }}
              InputProps={{ startAdornment: <InputAdornment position="start"><MdSearch /></InputAdornment> }} />
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <InputLabel>Year</InputLabel>
              <Select value={yearSel} label="Year" onChange={e => { setYearSel(e.target.value); }}>
                {years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <InputLabel>Day</InputLabel>
              <Select value={dayFilter} label="Day" onChange={e => { setDayFilter(e.target.value); }}>
                <MenuItem value="">All Days</MenuItem>
                {festivalDays.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
              </Select>
            </FormControl>
          </Stack>
        </CardContent>
      </Card>

      {loading ? <LoadingSkeleton /> : (
        <Card>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Day</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Prasad Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Sponsored By</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Qty</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Time</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records.length === 0 ? (
                <TableRow><TableCell colSpan={8} align="center"><Typography color="text.secondary" py={4}>No prasad records for {yearSel}</Typography></TableCell></TableRow>
              ) : records.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell>{r.festivalDay || '—'}</TableCell>
                  <TableCell>{r.prasadDate || '—'}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{r.prasadName}</TableCell>
                  <TableCell>{r.sponsoredBy || '—'}</TableCell>
                  <TableCell>{r.quantity || '—'}</TableCell>
                  <TableCell>{r.distributionTime || '—'}</TableCell>
                  <TableCell>
                    <Chip label={r.status} size="small" color={r.status === 'Completed' ? 'success' : r.status === 'Cancelled' ? 'error' : 'warning'} />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => openEdit(r.id)}><MdEdit /></IconButton>
                    <IconButton size="small" color="error" onClick={() => setDeleteTarget(r)}><MdDelete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editId ? 'Edit Prasad Sponsorship' : 'Add Prasad Sponsorship'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Year</InputLabel>
                <Select value={form.festivalYear} label="Year" onChange={e => setForm(f => ({ ...f, festivalYear: e.target.value }))}>
                  {years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Festival Day</InputLabel>
                <Select value={form.festivalDay} label="Festival Day" onChange={e => setForm(f => ({ ...f, festivalDay: e.target.value }))}>
                  {festivalDays.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField label="Date" type="date" size="small" fullWidth value={form.prasadDate}
                onChange={e => setForm(f => ({ ...f, prasadDate: e.target.value }))} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField label="Distribution Time" size="small" fullWidth value={form.distributionTime}
                onChange={e => setForm(f => ({ ...f, distributionTime: e.target.value }))} placeholder="e.g. 12:00 PM" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Prasad Name" size="small" fullWidth required value={form.prasadName}
                onChange={e => setForm(f => ({ ...f, prasadName: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Sponsored By" size="small" fullWidth value={form.sponsoredBy}
                onChange={e => setForm(f => ({ ...f, sponsoredBy: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="Mobile Number" size="small" fullWidth value={form.mobileNumber}
                onChange={e => setForm(f => ({ ...f, mobileNumber: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="Quantity" size="small" fullWidth value={form.quantity}
                onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} placeholder="e.g. 200 plates" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select value={form.status} label="Status" onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  {prasadStatuses.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField label="Address" size="small" fullWidth multiline rows={2} value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="Estimated Cost (₹)" type="number" size="small" fullWidth value={form.estimatedCost}
                onChange={e => setForm(f => ({ ...f, estimatedCost: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="Donation Amount (₹)" type="number" size="small" fullWidth value={form.donationAmount}
                onChange={e => setForm(f => ({ ...f, donationAmount: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="Prepared By" size="small" fullWidth value={form.preparedBy}
                onChange={e => setForm(f => ({ ...f, preparedBy: e.target.value }))} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Notes" size="small" fullWidth multiline rows={2} value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>
            {saving ? 'Saving...' : (editId ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Prasad Record</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>{deleteTarget?.prasadName}</strong> ({deleteTarget?.festivalDay})? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default function MurtiList() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);

  // Murti tab state
  const [murtis, setMurtis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadMurtis = useCallback(async () => {
    setLoading(true);
    try {
      let data;
      if (search.trim()) {
        data = await murtiService.searchMurtiByDonor(search.trim());
      } else if (yearFilter) {
        data = await murtiService.filterMurtiByYear(yearFilter);
      } else {
        data = await murtiService.getAllMurtis();
      }
      setMurtis(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, yearFilter]);

  useEffect(() => { if (tab === 0) loadMurtis(); }, [tab, loadMurtis]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await murtiService.deleteMurti(deleteTarget.id);
      toast.success(`Murti "${deleteTarget.murtiName}" deleted`);
      setDeleteTarget(null);
      loadMurtis();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const paginated = murtis.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={2}>Ganesh Murti Management</Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }} textColor="primary" indicatorColor="primary">
        <Tab label="Ganesh Murti Details" />
        <Tab label="Prasad Sponsorship" />
      </Tabs>

      <TabPanel value={tab} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h6" fontWeight={600}>Murti Records</Typography>
          <Button variant="contained" size="small" startIcon={<MdAdd />} onClick={() => navigate('/murti/add')}>
            Add Murti Record
          </Button>
        </Box>

        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField size="small" placeholder="Search by donor name..." value={search}
                onChange={e => { setSearch(e.target.value); setPage(0); }}
                InputProps={{ startAdornment: <InputAdornment position="start"><MdSearch /></InputAdornment> }}
                sx={{ minWidth: 260 }} />
              <TextField size="small" select label="Filter by Year" value={yearFilter}
                onChange={e => { setYearFilter(e.target.value); setPage(0); }} sx={{ minWidth: 160 }}>
                <MenuItem value="">All Years</MenuItem>
                {years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
              </TextField>
            </Stack>
          </CardContent>
        </Card>

        {loading ? <LoadingSkeleton /> : (
          <Card>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Year</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Murti Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Donated By</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Height</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Photo</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow><TableCell colSpan={7} align="center"><Typography color="text.secondary" py={4}>No murti records found</Typography></TableCell></TableRow>
                ) : paginated.map((m) => (
                  <TableRow key={m.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/murti/${m.id}`)}>
                    <TableCell><Chip label={m.festivalYear} size="small" color="primary" variant="outlined" /></TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{m.murtiName}</TableCell>
                    <TableCell>{m.donatedBy || '—'}</TableCell>
                    <TableCell>{m.murtiHeight ? `${m.murtiHeight} ft` : '—'}</TableCell>
                    <TableCell><Chip label={m.murtiType || '—'} size="small" /></TableCell>
                    <TableCell>{m.photoUrl ? (
                      <Tooltip title="View Photo"><IconButton size="small" onClick={(e) => { e.stopPropagation(); window.open(m.photoUrl, '_blank'); }}><MdImage /></IconButton></Tooltip>
                    ) : '—'}</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/murti/edit/${m.id}`); }}><MdEdit /></IconButton>
                      <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); setDeleteTarget(m); }}><MdDelete /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination component="div" count={murtis.length} page={page}
              onPageChange={(_, p) => setPage(p)} rowsPerPage={rowsPerPage}
              onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} />
          </Card>
        )}

        <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
          <DialogTitle>Delete Murti Record</DialogTitle>
          <DialogContent><DialogContentText>Are you sure you want to delete <strong>{deleteTarget?.murtiName}</strong> ({deleteTarget?.festivalYear})? This action cannot be undone.</DialogContentText></DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</Button>
            <Button onClick={handleDelete} color="error" variant="contained" disabled={deleting}>{deleting ? 'Deleting...' : 'Delete'}</Button>
          </DialogActions>
        </Dialog>
      </TabPanel>

      <TabPanel value={tab} index={1}>
        <PrasadSection />
      </TabPanel>
    </Box>
  );
}
