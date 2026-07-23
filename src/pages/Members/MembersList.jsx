import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box, TextField, InputAdornment, Button, Chip, Avatar, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TableSortLabel, Paper, Typography, Card, CardContent,
  MenuItem, Stack, Pagination,
} from '@mui/material';
import { MdSearch, MdAdd, MdVisibility, MdEdit, MdDelete, MdClear } from 'react-icons/md';
import { toast } from 'react-toastify';
import { getMembers, filterMembers, searchMembers } from '../../services/memberService';
import { roleService, colonyService } from '../../services';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import DeleteDialog from './DeleteDialog';
import MemberForm from './MemberForm';

const columns = [
  { id: 'photo', label: 'Photo', sortable: false },
  { id: 'name', label: 'Full Name', sortable: true },
  { id: 'mobile', label: 'Mobile', sortable: true },
  { id: 'roles', label: 'Role(s)', sortable: false },
  { id: 'committeeCategory', label: 'Category', sortable: true },
  { id: 'festivalYear', label: 'Year', sortable: true },
  { id: 'status', label: 'Status', sortable: true },
  { id: 'actions', label: 'Actions', sortable: false },
];

const PAGE_SIZE = 10;

export default function MembersList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [inactiveCount, setInactiveCount] = useState(0);
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [colonyFilter, setColonyFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingMember, setDeletingMember] = useState(null);
  const [colonies, setColonies] = useState([]);
  const [roles, setRoles] = useState([]);
  const debounceRef = useRef(null);

  useEffect(() => {
    colonyService.getColonies().then(setColonies).catch(() => {});
    roleService.getRoles().then(setRoles).catch(() => {});
  }, []);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const hasSearch = searchQuery || statusFilter || colonyFilter || roleFilter || yearFilter;

      if (searchQuery || hasSearch) {
        const criteria = {};
        if (searchQuery) criteria.keyword = searchQuery;
        if (statusFilter) criteria.status = statusFilter;
        if (colonyFilter) criteria.colony = colonyFilter;
        if (roleFilter) criteria.roleId = roleFilter;
        if (yearFilter) criteria.festivalYear = yearFilter;
        const allResults = searchQuery ? await searchMembers(searchQuery) : await filterMembers(criteria);
        const filtered = allResults.filter(m => {
          if (statusFilter && m.status !== statusFilter) return false;
          if (colonyFilter && m.colony !== colonyFilter) return false;
          if (yearFilter && m.festivalYear !== yearFilter) return false;
          if (roleFilter && (!m.roles || !m.roles.some(r => r === roles.find(ro => ro.id === Number(roleFilter))?.roleName))) return false;
          return true;
        });
        setTotal(filtered.length);
        setActiveCount(filtered.filter(m => m.status === 'Active').length);
        setInactiveCount(filtered.filter(m => m.status === 'Inactive').length);
        setTotalPages(Math.ceil(filtered.length / PAGE_SIZE) || 1);
        const start = (page - 1) * PAGE_SIZE;
        setMembers(filtered.slice(start, start + PAGE_SIZE));
      } else {
        const result = await getMembers({ page, limit: PAGE_SIZE, sortBy, sortOrder });
        setMembers(result.data);
        setTotal(result.total);
        setTotalPages(result.totalPages);
      }
    } catch (err) {
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, sortOrder, searchQuery, statusFilter, colonyFilter, roleFilter, yearFilter, roles]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);
  useEffect(() => { setPage(1); }, [searchQuery, statusFilter, colonyFilter, roleFilter, yearFilter, sortBy, sortOrder]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearchQuery(value), 300);
  };

  const handleSort = (column) => {
    if (sortBy === column) setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    else { setSortBy(column); setSortOrder('asc'); }
  };

  const handleClearFilters = () => {
    setStatusFilter(''); setColonyFilter(''); setRoleFilter(''); setYearFilter('');
    setSearchQuery(''); setSearchInput('');
  };

  const handleAdd = () => { setEditingMember(null); setFormOpen(true); };
  const handleEdit = (member) => { setEditingMember(member); setFormOpen(true); };
  const handleDelete = (member) => { setDeletingMember(member); setDeleteDialogOpen(true); };
  const handleFormSaved = () => fetchMembers();
  const handleDeleted = () => fetchMembers();

  const hasFilters = statusFilter || colonyFilter || roleFilter || searchQuery || yearFilter;
  const stats = { total, active: activeCount, inactive: inactiveCount };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" fontWeight={700}>Members</Typography>
        <Button variant="contained" startIcon={<MdAdd />} onClick={handleAdd}>Add Member</Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField size="small" placeholder="Search members..." value={searchInput} onChange={handleSearchChange}
          sx={{ minWidth: 220 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><MdSearch /></InputAdornment> }} />
        <TextField select size="small" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} sx={{ minWidth: 120 }} label="Status">
          <MenuItem value="">All</MenuItem>
          <MenuItem value="Active">Active</MenuItem>
          <MenuItem value="Inactive">Inactive</MenuItem>
        </TextField>
        <TextField select size="small" value={colonyFilter} onChange={e => setColonyFilter(e.target.value)} sx={{ minWidth: 160 }} label="Colony">
          <MenuItem value="">All</MenuItem>
          {colonies.map(c => <MenuItem key={c.id} value={c.name}>{c.name}</MenuItem>)}
        </TextField>
        <TextField select size="small" value={roleFilter} onChange={e => setRoleFilter(e.target.value)} sx={{ minWidth: 160 }} label="Role">
          <MenuItem value="">All Roles</MenuItem>
          {roles.map(r => <MenuItem key={r.id} value={r.id}>{r.roleName}</MenuItem>)}
        </TextField>
        <TextField select size="small" value={yearFilter} onChange={e => setYearFilter(e.target.value)} sx={{ minWidth: 110 }} label="Year">
          <MenuItem value="">All</MenuItem>
          {['2025', '2026', '2027', '2028'].map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
        </TextField>
        {hasFilters && <Button size="small" startIcon={<MdClear />} onClick={handleClearFilters}>Clear</Button>}
      </Box>

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Card sx={{ flex: 1 }}><CardContent sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="h4" fontWeight={700} color="primary.main">{total}</Typography>
          <Typography variant="body2" color="text.secondary">Total Members</Typography>
        </CardContent></Card>
        <Card sx={{ flex: 1 }}><CardContent sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="h4" fontWeight={700} color="success.main">{stats.active}</Typography>
          <Typography variant="body2" color="text.secondary">Active</Typography>
        </CardContent></Card>
        <Card sx={{ flex: 1 }}><CardContent sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="h4" fontWeight={700} color="error.main">{stats.inactive}</Typography>
          <Typography variant="body2" color="text.secondary">Inactive</Typography>
        </CardContent></Card>
      </Stack>

      {loading ? <LoadingSkeleton type="table" count={5} /> : members.length === 0 ? (
        <Paper sx={{ textAlign: 'center', py: 6 }}>
          <MdSearch size={48} style={{ color: '#aaa' }} />
          <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>No members found</Typography>
          <Typography variant="body2" color="text.disabled">
            {hasFilters ? 'Try adjusting your search or filters' : 'Get started by adding your first member'}
          </Typography>
          {!hasFilters && <Button variant="contained" startIcon={<MdAdd />} onClick={handleAdd} sx={{ mt: 2 }}>Add Member</Button>}
        </Paper>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  {columns.map(col => (
                    <TableCell key={col.id}>
                      {col.sortable ? (
                        <TableSortLabel active={sortBy === col.id} direction={sortBy === col.id ? sortOrder : 'asc'} onClick={() => handleSort(col.id)}>
                          {col.label}
                        </TableSortLabel>
                      ) : col.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {members.map(member => (
                  <TableRow key={member.id} hover>
                    <TableCell>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36, fontSize: 15 }}>
                        {member.name?.charAt(0)?.toUpperCase() || '?'}
                      </Avatar>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, cursor: 'pointer', '&:hover': { color: 'primary.main', textDecoration: 'underline' } }}
                      onClick={() => navigate(`/members/profile/${member.id}`)}>
                      {member.name}
                    </TableCell>
                    <TableCell>{member.mobile}</TableCell>
                    <TableCell>
                      {member.roles && member.roles.length > 0
                        ? member.roles.map((r, i) => (
                            <Chip key={i} label={r} size="small" color="primary" variant="outlined" sx={{ mr: 0.5, mb: 0.3 }} />
                          ))
                        : <Typography variant="caption" color="text.disabled">No role</Typography>
                      }
                    </TableCell>
                    <TableCell>{member.committeeCategory || '-'}</TableCell>
                    <TableCell>{member.festivalYear || '-'}</TableCell>
                    <TableCell>
                      <Chip label={member.status} size="small" color={member.status === 'Active' ? 'success' : 'default'} variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => navigate(`/members/profile/${member.id}`)}><MdVisibility /></IconButton>
                      <IconButton size="small" onClick={() => handleEdit(member)}><MdEdit /></IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(member)}><MdDelete /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination count={totalPages} page={page} onChange={(e, val) => setPage(val)} color="primary" />
          </Box>
        </>
      )}

      <MemberForm open={formOpen} onClose={() => setFormOpen(false)} member={editingMember} onSaved={handleFormSaved} />
      <DeleteDialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} member={deletingMember} onDeleted={handleDeleted} />
    </Box>
  );
}
