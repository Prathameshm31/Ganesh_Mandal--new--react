import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box, Typography, Button, TextField, Table, TableHead, TableBody,
  TableRow, TableCell, TablePagination, Card, CardContent, Stack,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Chip, IconButton, Tooltip, InputAdornment, MenuItem, Grid,
  Avatar, FormControl, InputLabel, Select, TableSortLabel,
} from '@mui/material';
import { MdAdd, MdEdit, MdDelete, MdSearch, MdPhone, MdEmail, MdWhatsapp, MdVisibility } from 'react-icons/md';
import { toast } from 'react-toastify';
import volunteerService from '../../services/volunteerService';
import VolunteerForm from './VolunteerForm';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

const currentYear = new Date().getFullYear().toString();

const roleColors = {
  'President': '#2563eb', 'Vice President': '#3b82f6', 'Secretary': '#8b5cf6',
  'Treasurer': '#059669', 'Social Media Manager': '#db2777',
  'Decoration Head': '#d97706', 'Security Head': '#dc2626',
  'Prasad Coordinator': '#ea580c', 'Event Organizer': '#0891b2',
  'Anchor/Host': '#7c3aed', 'VIP Guest Coordinator': '#4f46e5',
};

function getRoleColor(role) { return roleColors[role] || '#6b7280'; }

export default function VolunteerList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [catFilter, setCatFilter] = useState(searchParams.get('category') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [yearFilter, setYearFilter] = useState(searchParams.get('festivalYear') || currentYear);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [orderBy, setOrderBy] = useState('name');
  const [orderDir, setOrderDir] = useState('asc');
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const rolesParam = searchParams.get('roles');
  const assignedDate = searchParams.get('assignedDate');
  const birthdayMonth = searchParams.get('birthdayMonth');
  const listTitle = searchParams.get('title') || (rolesParam ? listTitleFromRoles(rolesParam) : 'Volunteers');

  function listTitleFromRoles(roles) {
    const map = {
      'President,Vice President,Secretary,Joint Secretary,Treasurer,Joint Treasurer': 'Committee Members',
      'Event Organizer,Event Coordinator': 'Event Organizers',
      'Social Media Manager,Instagram Handler,Facebook Handler,YouTube Handler,WhatsApp Community Admin,Content Creator,Photographer,Videographer,Graphic Designer,Live Streaming Coordinator': 'Social Media Team',
      'Cash Collection Volunteer,Online Payment Coordinator,Receipt Management,Donation Collection,Sponsor Coordinator,Expense Management': 'Finance Team',
      'Decoration Head,Decoration Team,Lighting Team,Flower Decoration Team,Ganesh Murti Management,Visarjan Coordinator': 'Decoration Team',
      'Prasad Coordinator,Prasad Distribution Team,Food Arrangement Team,Drinking Water Management': 'Prasad Team',
      'Security Head,Crowd Management,Parking Coordinator,First Aid Volunteer,Emergency Response Team': 'Security Team',
      'Sound System Coordinator,Electrical Team,Generator Management,Seating Arrangement,Cleaning Team,Material Management': 'Logistics Team',
    };
    return map[roles] || 'Volunteers';
  }

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { festivalYear: yearFilter };
      if (rolesParam) params.roles = rolesParam;
      if (assignedDate) params.assignedDate = assignedDate;
      if (birthdayMonth) params.birthdayMonth = birthdayMonth;
      if (catFilter) params.category = catFilter;
      if (statusFilter) params.status = statusFilter;
      const data = await volunteerService.searchFiltered(params);
      setVolunteers(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [yearFilter, rolesParam, assignedDate, birthdayMonth, catFilter, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const sorted = [...volunteers].sort((a, b) => {
    const va = a[orderBy] || '';
    const vb = b[orderBy] || '';
    const cmp = typeof va === 'string' ? va.localeCompare(vb) : va - vb;
    return orderDir === 'asc' ? cmp : -cmp;
  });

  const filtered = sorted.filter((v) => {
    if (keyword && !v.name?.toLowerCase().includes(keyword.toLowerCase()) && !v.mobile?.includes(keyword) && !v.email?.toLowerCase().includes(keyword.toLowerCase())) return false;
    return true;
  });

  const handleSort = (col) => {
    if (orderBy === col) setOrderDir(orderDir === 'asc' ? 'desc' : 'asc');
    else { setOrderBy(col); setOrderDir('asc'); }
  };

  const openAdd = () => { setEditId(null); setEditData(null); setFormOpen(true); };
  const openEdit = (v) => { setEditId(v.id); setEditData(v); setFormOpen(true); };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await volunteerService.deleteVolunteer(deleteTarget.id);
      toast.success('Volunteer deleted');
      setVolunteers((prev) => prev.filter((v) => v.id !== deleteTarget.id));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleSaved = (v) => {
    setVolunteers((prev) => {
      const idx = prev.findIndex((x) => x.id === v.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = v; return next; }
      return [v, ...prev];
    });
  };

  const clearFilters = () => {
    setSearchParams({ festivalYear: yearFilter });
    setCatFilter('');
    setStatusFilter('');
    setKeyword('');
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h5" fontWeight={700}>{listTitle}</Typography>
          <Typography variant="body2" color="text.secondary">{filtered.length} volunteer{filtered.length !== 1 ? 's' : ''}</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" size="small" onClick={() => navigate('/volunteers')}>Dashboard</Button>
          <Button variant="contained" startIcon={<MdAdd />} onClick={openAdd}>Add Volunteer</Button>
        </Stack>
      </Stack>

      <Card variant="outlined" sx={{ borderRadius: 3, mb: 2 }}>
        <CardContent sx={{ pb: '8px !important' }}>
          <Grid container spacing={1.5} alignItems="center">
            <Grid item xs={12} sm={3}>
              <TextField size="small" fullWidth placeholder="Search by name, mobile, email..." value={keyword} onChange={(e) => setKeyword(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><MdSearch /></InputAdornment> }} />
            </Grid>
            <Grid item xs={6} sm={2}>
              <FormControl size="small" fullWidth><InputLabel>Category</InputLabel>
                <Select label="Category" value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
                  <MenuItem value="">All</MenuItem>
                  {volunteerService.CATEGORIES.map((c) => <MenuItem key={c.name} value={c.name}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={2}>
              <FormControl size="small" fullWidth><InputLabel>Status</InputLabel>
                <Select label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={2}>
              <TextField size="small" fullWidth select label="Year" value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
                {Array.from({ length: 10 }, (_, i) => String(Number(currentYear) - 5 + i)).map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6} sm={2}>
              <Button fullWidth variant="text" color="secondary" size="small" onClick={clearFilters}>Clear</Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {filtered.length === 0 && !loading ? (
        <Card variant="outlined" sx={{ borderRadius: 3, p: 6, textAlign: 'center' }}>
          <MdSearch size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
          <Typography variant="h6" color="text.secondary" mb={1}>No volunteers found</Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>Try adjusting your search or filters</Typography>
          <Button variant="contained" startIcon={<MdAdd />} onClick={openAdd}>Add a Volunteer</Button>
        </Card>
      ) : (
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          {loading ? <LoadingSkeleton rows={8} /> : (
            <>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, minWidth: 200 }}>
                      <TableSortLabel active={orderBy==='name'} direction={orderBy==='name'?orderDir:'asc'} onClick={()=>handleSort('name')}>Volunteer</TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      <TableSortLabel active={orderBy==='role'} direction={orderBy==='role'?orderDir:'asc'} onClick={()=>handleSort('role')}>Role</TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Committee</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Contact</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      <TableSortLabel active={orderBy==='experience'} direction={orderBy==='experience'?orderDir:'asc'} onClick={()=>handleSort('experience')}>Experience</TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      <TableSortLabel active={orderBy==='status'} direction={orderBy==='status'?orderDir:'asc'} onClick={()=>handleSort('status')}>Status</TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((v) => (
                    <TableRow key={v.id} hover sx={{ '&:last-child td': { border: 0 }, cursor: 'pointer' }} onClick={() => navigate('/volunteers/profile/' + v.id)}>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Avatar sx={{ width: 36, height: 36, bgcolor: getRoleColor(v.role), fontSize: 14 }}>{v.name?.charAt(0)?.toUpperCase()}</Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>{v.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{v.mobile}</Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell><Chip label={v.role||'N/A'} size="small" sx={{ bgcolor: `${getRoleColor(v.role)}18`, color: getRoleColor(v.role), fontWeight: 500 }} /></TableCell>
                      <TableCell><Chip label={v.category||'N/A'} size="small" variant="outlined" /></TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5}>
                          {v.mobile && <>
                            <Tooltip title="Call"><IconButton size="small" href={`tel:${v.mobile}`} onClick={e=>e.stopPropagation()}><MdPhone size={16}/></IconButton></Tooltip>
                            <Tooltip title="WhatsApp"><IconButton size="small" href={`https://wa.me/${v.mobile.replace(/[^0-9]/g,'')}`} target="_blank" onClick={e=>e.stopPropagation()}><MdWhatsapp size={16}/></IconButton></Tooltip>
                          </>}
                          {v.email && <Tooltip title="Email"><IconButton size="small" href={`mailto:${v.email}`} onClick={e=>e.stopPropagation()}><MdEmail size={16}/></IconButton></Tooltip>}
                        </Stack>
                      </TableCell>
                      <TableCell><Typography variant="body2">{v.experience||'-'}</Typography></TableCell>
                      <TableCell><Chip label={v.status} size="small" color={v.status==='Active'?'success':'default'} /></TableCell>
                      <TableCell align="right">
                        <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
                          <Tooltip title="View Profile"><IconButton size="small" onClick={e=>{e.stopPropagation();navigate('/volunteers/profile/'+v.id)}}><MdVisibility size={16}/></IconButton></Tooltip>
                          <Tooltip title="Edit"><IconButton size="small" onClick={e=>{e.stopPropagation();openEdit(v)}}><MdEdit size={16}/></IconButton></Tooltip>
                          <Tooltip title="Delete"><IconButton size="small" onClick={e=>{e.stopPropagation();setDeleteTarget(v)}}><MdDelete size={16}/></IconButton></Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filtered.length > rowsPerPage && (
                <TablePagination component="div" count={filtered.length} page={page} onPageChange={(_,p)=>setPage(p)} rowsPerPage={rowsPerPage} onRowsPerPageChange={e=>{setRowsPerPage(parseInt(e.target.value,10));setPage(0)}} rowsPerPageOptions={[10,15,25,50]} />
              )}
            </>
          )}
        </Card>
      )}

      <VolunteerForm open={formOpen} editId={editId} initial={editData} onClose={()=>setFormOpen(false)} onSaved={handleSaved} />
      <Dialog open={!!deleteTarget} onClose={()=>setDeleteTarget(null)}>
        <DialogTitle>Delete Volunteer?</DialogTitle>
        <DialogContent><DialogContentText>Are you sure you want to delete <b>{deleteTarget?.name}</b>?</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={()=>setDeleteTarget(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete} disabled={deleting}>{deleting?'Deleting...':'Delete'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
