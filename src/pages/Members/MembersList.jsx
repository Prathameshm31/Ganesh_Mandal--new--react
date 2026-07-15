import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  TextField,
  InputAdornment,
  Button,
  Chip,
  Avatar,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Typography,
  Card,
  CardContent,
  MenuItem,
  Stack,
  Pagination,
} from '@mui/material';
import { MdSearch, MdAdd, MdVisibility, MdEdit, MdDelete, MdClear } from 'react-icons/md';
import { toast } from 'react-toastify';
import { filterMembers, searchMembers } from '../../services/memberService';
import { getAllDonations } from '../../services/donationService';
import { colonyService } from '../../services';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import DeleteDialog from './DeleteDialog';
import MemberForm from './MemberForm';

const columns = [
  { id: 'photo', label: 'Photo', sortable: false },
  { id: 'id', label: 'Member ID', sortable: true },
  { id: 'fullName', label: 'Full Name', sortable: true },
  { id: 'mobileNumber', label: 'Mobile', sortable: true },
  { id: 'colony', label: 'Colony', sortable: true },
  { id: 'occupation', label: 'Occupation', sortable: true },
  { id: 'status', label: 'Status', sortable: true },
  { id: 'actions', label: 'Actions', sortable: false },
];

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
  const [formOpen, setFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingMember, setDeletingMember] = useState(null);
  const [allDonations, setAllDonations] = useState([]);
  const [colonies, setColonies] = useState([]);
  const debounceRef = useRef(null);
  const initialParamsApplied = useRef(false);

  useEffect(() => {
    getAllDonations().then(setAllDonations).catch(() => {});
    colonyService.getColonies().then(setColonies).catch(() => {});
  }, []);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const criteria = {};
      if (statusFilter) criteria.status = statusFilter;
      if (colonyFilter) criteria.colony = colonyFilter;

      const allMembers = searchQuery
        ? await searchMembers(searchQuery)
        : await filterMembers(criteria);

      const fullList = searchQuery
        ? allMembers.filter((m) => {
            if (statusFilter && m.status !== statusFilter) return false;
            if (colonyFilter && m.colony !== colonyFilter) return false;
            return true;
          })
        : allMembers;

      let sorted;
      if (sortBy === 'donations') {
        const donationTotals = {};
        allDonations.forEach((d) => {
          donationTotals[d.memberId] = (donationTotals[d.memberId] || 0) + d.amount;
        });
        sorted = [...fullList].sort((a, b) => {
          const aVal = donationTotals[a.id] || 0;
          const bVal = donationTotals[b.id] || 0;
          return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
        });
      } else {
        sorted = [...fullList].sort((a, b) => {
          const aVal = a[sortBy] ?? '';
          const bVal = b[sortBy] ?? '';
          if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
          if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
          return 0;
        });
      }

      setTotal(fullList.length);
      setActiveCount(fullList.filter((m) => m.status === 'Active').length);
      setInactiveCount(fullList.filter((m) => m.status === 'Inactive').length);
      setTotalPages(Math.ceil(fullList.length / 10) || 1);

      const start = (page - 1) * 10;
      setMembers(sorted.slice(start, start + 10));
    } catch (err) {
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, sortOrder, searchQuery, statusFilter, colonyFilter, allDonations]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter, colonyFilter, sortBy, sortOrder]);

  useEffect(() => {
    if (initialParamsApplied.current) return;
    const sb = searchParams.get('sortBy');
    const so = searchParams.get('sortOrder');
    if (sb) setSortBy(sb);
    if (so) setSortOrder(so);
    initialParamsApplied.current = true;
  }, [searchParams]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchQuery(value);
    }, 300);
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleClearFilters = () => {
    setStatusFilter('');
    setColonyFilter('');
    setSearchQuery('');
    setSearchInput('');
    navigate('/members', { replace: true });
    initialParamsApplied.current = true;
  };

  const handleAdd = () => {
    setEditingMember(null);
    setFormOpen(true);
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setFormOpen(true);
  };

  const handleDelete = (member) => {
    setDeletingMember(member);
    setDeleteDialogOpen(true);
  };

  const handleFormSaved = () => {
    fetchMembers();
  };

  const handleDeleted = () => {
    fetchMembers();
  };

  const hasFilters = statusFilter || colonyFilter || searchQuery;

  const stats = { total, active: activeCount, inactive: inactiveCount };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" fontWeight={700}>Members</Typography>
        <Button variant="contained" startIcon={<MdAdd />} onClick={handleAdd}>
          Add Member
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Search members..."
          value={searchInput}
          onChange={handleSearchChange}
          sx={{ minWidth: 280 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start"><MdSearch /></InputAdornment>
            ),
          }}
        />
        <TextField
          select
          size="small"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ minWidth: 140 }}
          label="Status"
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="Active">Active</MenuItem>
          <MenuItem value="Inactive">Inactive</MenuItem>
        </TextField>
        <TextField
          select
          size="small"
          value={colonyFilter}
          onChange={(e) => setColonyFilter(e.target.value)}
          sx={{ minWidth: 180 }}
          label="Colony"
        >
          <MenuItem value="">All</MenuItem>
          {colonies.map((c) => (
            <MenuItem key={c.id} value={c.name}>{c.name}</MenuItem>
          ))}
        </TextField>
        {hasFilters && (
          <Button size="small" startIcon={<MdClear />} onClick={handleClearFilters}>
            Clear
          </Button>
        )}
      </Box>

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Card sx={{ flex: 1 }}>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h4" fontWeight={700} color="primary.main">{total}</Typography>
            <Typography variant="body2" color="text.secondary">Total Members</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h4" fontWeight={700} color="success.main">{stats.active}</Typography>
            <Typography variant="body2" color="text.secondary">Active</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h4" fontWeight={700} color="error.main">{stats.inactive}</Typography>
            <Typography variant="body2" color="text.secondary">Inactive</Typography>
          </CardContent>
        </Card>
      </Stack>

      {loading ? (
        <LoadingSkeleton type="table" count={5} />
      ) : members.length === 0 ? (
        <Paper sx={{ textAlign: 'center', py: 6 }}>
          <MdSearch size={48} style={{ color: '#aaa' }} />
          <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>No members found</Typography>
          <Typography variant="body2" color="text.disabled">Try adjusting your search or filters</Typography>
        </Paper>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  {columns.map((col) => (
                    <TableCell key={col.id}>
                      {col.sortable ? (
                        <TableSortLabel
                          active={sortBy === col.id}
                          direction={sortBy === col.id ? sortOrder : 'asc'}
                          onClick={() => handleSort(col.id)}
                        >
                          {col.label}
                        </TableSortLabel>
                      ) : (
                        col.label
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id} hover>
                    <TableCell>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36, fontSize: 15 }}>
                        {member.fullName?.charAt(0)?.toUpperCase() || '?'}
                      </Avatar>
                    </TableCell>
                    <TableCell>{member.id}</TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, cursor: 'pointer', '&:hover': { color: 'primary.main', textDecoration: 'underline' } }}
                      onClick={() => navigate(`/members/profile/${member.id}`)}
                    >
                      {member.fullName}
                    </TableCell>
                    <TableCell>{member.mobileNumber}</TableCell>
                    <TableCell>{member.colony}</TableCell>
                    <TableCell>{member.occupation}</TableCell>
                    <TableCell>
                      <Chip
                        label={member.status}
                        size="small"
                        color={member.status === 'Active' ? 'success' : 'default'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => navigate(`/members/profile/${member.id}`)}>
                        <MdVisibility />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleEdit(member)}>
                        <MdEdit />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(member)}>
                        <MdDelete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, val) => setPage(val)}
              color="primary"
            />
          </Box>
        </>
      )}

      <MemberForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        member={editingMember}
        onSaved={handleFormSaved}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        member={deletingMember}
        onDeleted={handleDeleted}
      />
    </Box>
  );
}
