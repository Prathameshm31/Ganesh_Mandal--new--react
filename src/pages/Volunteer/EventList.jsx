import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, TextField, Table, TableHead, TableBody,
  TableRow, TableCell, TablePagination, Card, CardContent, Stack,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Chip, IconButton, Tooltip, InputAdornment, MenuItem, Grid,
  FormControl, InputLabel, Select,
} from '@mui/material';
import { MdAdd, MdEdit, MdDelete, MdSearch, MdPeople } from 'react-icons/md';
import { toast } from 'react-toastify';
import eventService from '../../services/eventService';
import EventForm from './EventForm';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

const currentYear = new Date().getFullYear().toString();

const categoryColors = {
  'Before Festival': '#0891b2', 'Day 1': '#7c3aed', 'Daily': '#059669',
  'Special Days': '#d97706', 'Final Day': '#dc2626',
};

export default function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [dayFilter, setDayFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [yearFilter, setYearFilter] = useState(currentYear);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(25);
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = events.filter((e) => {
    if (keyword && !e.eventName?.toLowerCase().includes(keyword.toLowerCase()) && !e.organizer?.toLowerCase().includes(keyword.toLowerCase())) return false;
    if (catFilter && e.eventCategory !== catFilter) return false;
    if (dayFilter && e.festivalDay !== dayFilter) return false;
    if (statusFilter && e.status !== statusFilter) return false;
    return true;
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await eventService.searchEvents({ festivalYear: yearFilter });
      setEvents(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [yearFilter]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditId(null); setEditData(null); setFormOpen(true); };
  const openEdit = (e) => { setEditId(e.id); setEditData(e); setFormOpen(true); };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await eventService.deleteEvent(deleteTarget.id);
      toast.success('Event deleted');
      setEvents((prev) => prev.filter((e) => e.id !== deleteTarget.id));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleSaved = (e) => {
    setEvents((prev) => {
      const idx = prev.findIndex((x) => x.id === e.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = e; return next; }
      return [...prev, e];
    });
  };

  const statusChip = (s) => {
    const m = { 'Planned': 'default', 'In Progress': 'info', 'Completed': 'success', 'Cancelled': 'error' };
    return <Chip label={s} size="small" color={m[s] || 'default'} />;
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Events</Typography>
          <Typography variant="body2" color="text.secondary">{events.length} total</Typography>
        </Box>
        <Button variant="contained" startIcon={<MdAdd />} onClick={openAdd}>Add Event</Button>
      </Stack>

      <Card variant="outlined" sx={{ borderRadius: 3, mb: 2 }}>
        <CardContent sx={{ pb: '8px !important' }}>
          <Grid container spacing={1.5} alignItems="center">
            <Grid item xs={12} sm={3}>
              <TextField size="small" fullWidth placeholder="Search events..." value={keyword} onChange={(e) => setKeyword(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><MdSearch /></InputAdornment> }} />
            </Grid>
            <Grid item xs={6} sm={2}>
              <FormControl size="small" fullWidth>
                <InputLabel>Category</InputLabel>
                <Select label="Category" value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
                  <MenuItem value="">All</MenuItem>
                  {eventService.EVENT_CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={2}>
              <FormControl size="small" fullWidth>
                <InputLabel>Day</InputLabel>
                <Select label="Day" value={dayFilter} onChange={(e) => setDayFilter(e.target.value)}>
                  <MenuItem value="">All</MenuItem>
                  {['Pre-Festival', 'Day 1', 'Daily', 'Final Day'].map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={2}>
              <FormControl size="small" fullWidth>
                <InputLabel>Status</InputLabel>
                <Select label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <MenuItem value="">All</MenuItem>
                  {eventService.STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={2}>
              <TextField size="small" fullWidth select label="Year" value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
                {Array.from({ length: 10 }, (_, i) => String(Number(currentYear) - 5 + i)).map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        {loading ? <LoadingSkeleton rows={8} /> : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Event</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Day</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date / Time</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Organizer</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((e) => (
                  <TableRow key={e.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>{e.eventName}</Typography>
                      {e.venue && <Typography variant="caption" color="text.secondary">{e.venue}</Typography>}
                    </TableCell>
                    <TableCell>
                      <Chip label={e.eventCategory || 'N/A'} size="small" sx={{ bgcolor: `${categoryColors[e.eventCategory] || '#6b7280'}18`, color: categoryColors[e.eventCategory] || '#6b7280', fontWeight: 500 }} />
                    </TableCell>
                    <TableCell><Chip label={e.festivalDay || 'N/A'} size="small" variant="outlined" /></TableCell>
                    <TableCell>
                      <Typography variant="body2">{e.date || '-'}</Typography>
                      {e.startTime && <Typography variant="caption" color="text.secondary">{e.startTime}{e.endTime ? ` - ${e.endTime}` : ''}</Typography>}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{e.organizer || '-'}</Typography>
                      {e.coordinator && <Typography variant="caption" color="text.secondary">Coord: {e.coordinator}</Typography>}
                    </TableCell>
                    <TableCell>{statusChip(e.status)}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
                        <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(e)}><MdEdit size={16} /></IconButton></Tooltip>
                        <Tooltip title="Delete"><IconButton size="small" onClick={() => setDeleteTarget(e)}><MdDelete size={16} /></IconButton></Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center"><Typography color="text.secondary" py={4}>No events found</Typography></TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {filtered.length > rowsPerPage && (
              <TablePagination component="div" count={filtered.length} page={page} onPageChange={(_, p) => setPage(p)} rowsPerPage={rowsPerPage} rowsPerPageOptions={[]} />
            )}
          </>
        )}
      </Card>

      <EventForm open={formOpen} editId={editId} initial={editData} onClose={() => setFormOpen(false)} onSaved={handleSaved} />

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete Event?</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete <b>{deleteTarget?.eventName}</b>? This action cannot be undone.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete} disabled={deleting}>{deleting ? 'Deleting...' : 'Delete'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
