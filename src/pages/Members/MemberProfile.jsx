import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Avatar, Chip, Card, CardContent,
  Grid, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, Divider,
  Stack, Alert, TextField, MenuItem, TablePagination,
  InputAdornment, IconButton, Skeleton,
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  AreaChart, Area,
} from 'recharts';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Edit, Trash2, Plus, Printer, Download,
  FileSpreadsheet, IndianRupee, Hash, TrendingUp,
  Award, Calendar, Search, X, Receipt,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { getMemberById } from '../../services/memberService';
import { getDonationsByMember } from '../../services/donationService';
import DeleteDialog from './DeleteDialog';
import MemberForm from './MemberForm';
import DonationForm from '../Donations/DonationForm';

function formatIndian(n) {
  const num = Number(n);
  if (isNaN(num)) return '₹0';
  const str = Math.round(num).toString();
  const lastThree = str.slice(-3);
  const rest = str.slice(0, -3);
  const formatted = rest ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree : lastThree;
  return `₹${formatted}`;
}

const CHART_COLORS = ['#FF6F00', '#0288D1', '#2E7D32', '#7B1FA2', '#F57F17', '#00796B'];
const PIE_COLORS = ['#FF6F00', '#0288D1'];

function getPaymentModeColor(mode) {
  switch (mode) {
    case 'Cash': return 'success';
    case 'UPI': case 'Google Pay': case 'PhonePe': case 'Paytm': return 'info';
    case 'Bank Transfer': return 'warning';
    default: return 'default';
  }
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

function StatCard({ icon, label, value, color }) {
  return (
    <motion.div variants={itemVariants}>
      <Card sx={{ height: '100%', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: `${color}12`, color }}>
              {icon}
            </Box>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>{label}</Typography>
          </Box>
          <Typography variant="h5" fontWeight={700}>{value}</Typography>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function MemberProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [donationFormOpen, setDonationFormOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState('all');
  const [modeFilter, setModeFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const printRef = useRef();

  useEffect(() => { loadData(); }, [id]);
  useEffect(() => { setPage(0); }, [search, yearFilter, modeFilter]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [memberData, donationsData] = await Promise.all([
        getMemberById(id),
        getDonationsByMember(id),
      ]);
      setMember(memberData);
      setDonations([...donationsData].sort((a, b) => new Date(b.donationDate) - new Date(a.donationDate)));
    } catch (err) {
      setError(err.message || 'Failed to load member');
    } finally {
      setLoading(false);
    }
  };

  const handleDonationSaved = () => {
    loadData();
    setDonationFormOpen(false);
  };

  const handleEditSaved = () => { loadData(); };
  const handleDeleted = () => { navigate('/members'); };

  const availableYears = useMemo(() => {
    const s = new Set();
    donations.forEach((d) => s.add(new Date(d.donationDate).getFullYear()));
    return Array.from(s).sort((a, b) => b - a);
  }, [donations]);

  const filteredDonations = useMemo(() => {
    let f = [...donations];
    if (search.trim()) {
      const q = search.toLowerCase();
      f = f.filter((d) =>
        (d.receiptNumber && d.receiptNumber.toLowerCase().includes(q)) ||
        (d.remarks && d.remarks.toLowerCase().includes(q)) ||
        (d.collectorName && d.collectorName.toLowerCase().includes(q)) ||
        d.paymentMode.toLowerCase().includes(q)
      );
    }
    if (yearFilter !== 'all') f = f.filter((d) => new Date(d.donationDate).getFullYear() === Number(yearFilter));
    if (modeFilter !== 'all') f = f.filter((d) => d.paymentMode === modeFilter);
    return f;
  }, [donations, search, yearFilter, modeFilter]);

  const stats = useMemo(() => {
    const amounts = donations.map((d) => d.amount);
    const total = amounts.reduce((s, v) => s + v, 0);
    const count = amounts.length;
    const avg = count > 0 ? total / count : 0;
    const highest = count > 0 ? Math.max(...amounts) : 0;
    const lastDate = count > 0 ? donations.reduce((a, b) => new Date(a.donationDate) > new Date(b.donationDate) ? a : b).donationDate : '—';
    const cy = new Date().getFullYear();
    const cyTotal = donations.filter((d) => new Date(d.donationDate).getFullYear() === cy).reduce((s, v) => s + v.amount, 0);
    return { total, count, avg, highest, lastDate, cyTotal };
  }, [donations]);

  const chartData = useMemo(() => {
    const yearMap = {};
    const monthMap = {};
    let cashTotal = 0;
    let onlineTotal = 0;
    const onlineModes = ['UPI', 'Google Pay', 'PhonePe', 'Paytm', 'Bank Transfer'];
    donations.forEach((d) => {
      const y = d.donationDate.substring(0, 4);
      yearMap[y] = (yearMap[y] || 0) + d.amount;
      const m = d.donationDate.substring(0, 7);
      monthMap[m] = (monthMap[m] || 0) + d.amount;
      if (onlineModes.includes(d.paymentMode)) onlineTotal += d.amount;
      else cashTotal += d.amount;
    });
    return {
      yearly: Object.entries(yearMap).map(([year, amount]) => ({ year: Number(year), amount })).sort((a, b) => a.year - b.year),
      monthly: Object.entries(monthMap).map(([month, amount]) => ({ month, amount })).sort((a, b) => a.month.localeCompare(b.month)),
      cashVsOnline: [
        { name: 'Cash', value: cashTotal },
        { name: 'Online', value: onlineTotal },
      ],
    };
  }, [donations]);

  const timeline = useMemo(() => {
    const items = [
      { date: member?.joinDate || '—', title: 'Member Registered', subtitle: member?.fullName, type: 'registration', icon: 'UserPlus' },
      ...donations.map((d) => ({
        date: d.donationDate,
        title: `Donation of ${formatIndian(d.amount)}`,
        subtitle: `${d.paymentMode} · ${d.receiptNumber || 'No receipt'}`,
        type: 'donation',
        icon: 'IndianRupee',
      })),
    ];
    return items.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [member, donations]);

  const paginated = filteredDonations.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleExportCSV = () => {
    if (filteredDonations.length === 0) {
      toast.error('No data to export');
      return;
    }
    const headers = 'Date,Amount,Payment Mode,Receipt Number,Collected By,Remarks';
    const rows = filteredDonations.map((d) =>
      `"${d.donationDate}","${d.amount}","${d.paymentMode}","${d.receiptNumber || ''}","${d.collectorName || ''}","${(d.remarks || '').replace(/"/g, '""')}"`
    ).join('\n');
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${member?.fullName || 'member'}_donations.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  const handlePrintHistory = () => {
    window.print();
  };

  const handlePrintReceipt = (donationId) => {
    navigate(`/receipt/${donationId}`);
  };

  const clearFilters = () => { setSearch(''); setYearFilter('all'); setModeFilter('all'); };
  const hasFilters = search || yearFilter !== 'all' || modeFilter !== 'all';

  if (loading) {
    return (
      <Box>
        <Skeleton width={120} height={36} sx={{ mb: 2, borderRadius: 1 }} />
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Skeleton variant="circular" width={64} height={64} />
            <Box sx={{ flex: 1 }}>
              <Skeleton width={200} height={28} sx={{ mb: 0.5 }} />
              <Skeleton width={100} height={18} />
            </Box>
          </Box>
        </Paper>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid item xs={12} sm={6} md={4} lg={2} key={i}>
              <Skeleton variant="rounded" height={110} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
        <Skeleton variant="rounded" height={300} sx={{ mb: 3, borderRadius: 3 }} />
        <Skeleton variant="rounded" height={250} sx={{ borderRadius: 3 }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Button startIcon={<ArrowLeft size={18} />} onClick={() => navigate('/members')} sx={{ mb: 2 }}>
          Back to Members
        </Button>
        <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
      </Box>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <Button startIcon={<ArrowLeft size={18} />} onClick={() => navigate('/members')} sx={{ mb: 2 }}>
          Back to Members
        </Button>
      </motion.div>

      {/* Member Info */}
      <motion.div variants={itemVariants}>
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, flexWrap: 'wrap' }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 72, height: 72, fontSize: 30, fontWeight: 700 }}>
              {member.fullName?.charAt(0)?.toUpperCase() || '?'}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <Typography variant="h5" fontWeight={700}>{member.fullName}</Typography>
              <Typography variant="body2" color="text.secondary">{member.id} · Member since {member.joinDate || '—'}</Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                <Typography variant="body2" color="text.secondary">{member.mobileNumber}</Typography>
                {member.colony && <Typography variant="body2" color="text.secondary">· {member.colony}</Typography>}
              </Box>
            </Box>
            <Chip label={member.status} color={member.status === 'Active' ? 'success' : 'default'} variant="outlined" sx={{ fontWeight: 600 }} />
          </Box>
        </Paper>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div variants={itemVariants}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Statistics</Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={4} md={2}>
            <StatCard icon={<IndianRupee size={18} />} label="Total Donations" value={formatIndian(stats.total)} color="#FF6F00" />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <StatCard icon={<Hash size={18} />} label="No. of Donations" value={stats.count} color="#0288D1" />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <StatCard icon={<TrendingUp size={18} />} label="Average" value={formatIndian(stats.avg)} color="#2E7D32" />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <StatCard icon={<Award size={18} />} label="Highest" value={formatIndian(stats.highest)} color="#7B1FA2" />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <StatCard icon={<Calendar size={18} />} label="Last Donation" value={stats.lastDate === '—' ? '—' : stats.lastDate} color="#F57F17" />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <StatCard icon={<Calendar size={18} />} label="Current Year" value={formatIndian(stats.cyTotal)} color="#00796B" />
          </Grid>
        </Grid>
      </motion.div>

      {/* Charts */}
      {donations.length > 0 && (
        <motion.div variants={itemVariants}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Charts</Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Year-wise Trend</Typography>
                {chartData.yearly.length === 0 ? (
                  <Typography color="text.secondary" variant="body2" sx={{ textAlign: 'center', py: 6 }}>No data</Typography>
                ) : (
                  <Box sx={{ width: '100%', height: 220 }}>
                    <ResponsiveContainer>
                      <AreaChart data={chartData.yearly} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="memTrend" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FF6F00" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#FF6F00" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                        <XAxis dataKey="year" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip formatter={(v) => formatIndian(v)} />
                        <Area type="monotone" dataKey="amount" stroke="#FF6F00" strokeWidth={2} fill="url(#memTrend)" dot={{ r: 3, fill: '#FF6F00' }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Monthly Donations</Typography>
                {chartData.monthly.length === 0 ? (
                  <Typography color="text.secondary" variant="body2" sx={{ textAlign: 'center', py: 6 }}>No data</Typography>
                ) : (
                  <Box sx={{ width: '100%', height: 220 }}>
                    <ResponsiveContainer>
                      <BarChart data={chartData.monthly} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                        <XAxis dataKey="month" tickFormatter={(v) => { const [, m] = v.split('-'); return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][parseInt(m, 10) - 1] || v; }} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip formatter={(v) => formatIndian(v)} />
                        <Bar dataKey="amount" fill="#FF6F00" radius={[4, 4, 0, 0]} maxBarSize={24} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Cash vs Online</Typography>
                {chartData.cashVsOnline.every((d) => d.value === 0) ? (
                  <Typography color="text.secondary" variant="body2" sx={{ textAlign: 'center', py: 6 }}>No data</Typography>
                ) : (
                  <Box sx={{ width: '100%', height: 220 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie data={chartData.cashVsOnline} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" nameKey="name" paddingAngle={3} stroke="none">
                          {chartData.cashVsOnline.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                        </Pie>
                        <Tooltip formatter={(v) => formatIndian(v)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </motion.div>
      )}

      {/* Donation History */}
      <motion.div variants={itemVariants}>
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="h6" fontWeight={600}>Donation History</Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              Total: {formatIndian(stats.total)}
            </Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={1.5} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={4} md={3}>
              <TextField
                fullWidth size="small" placeholder="Search history..."
                value={search} onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Search size={16} /></InputAdornment>,
                  endAdornment: search ? <InputAdornment position="end"><IconButton size="small" onClick={() => setSearch('')}><X size={14} /></IconButton></InputAdornment> : null,
                }}
              />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <TextField fullWidth size="small" select label="Year" value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
                <MenuItem value="all">All Years</MenuItem>
                {availableYears.map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <TextField fullWidth size="small" select label="Payment Mode" value={modeFilter} onChange={(e) => setModeFilter(e.target.value)}>
                <MenuItem value="all">All Modes</MenuItem>
                <MenuItem value="Cash">Cash</MenuItem>
                <MenuItem value="UPI">UPI</MenuItem>
                <MenuItem value="Google Pay">Google Pay</MenuItem>
                <MenuItem value="PhonePe">PhonePe</MenuItem>
                <MenuItem value="Paytm">Paytm</MenuItem>
                <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
              </TextField>
            </Grid>
            {hasFilters && (
              <Grid item xs={12} sm={6} md={2}>
                <Button fullWidth size="small" variant="text" color="error" onClick={clearFilters} startIcon={<X size={16} />}>
                  Clear
                </Button>
              </Grid>
            )}
          </Grid>

          {filteredDonations.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <Receipt size={48} style={{ color: '#aaa', marginBottom: 8 }} />
              <Typography variant="h6" color="text.secondary">No donations found</Typography>
              <Typography variant="body2" color="text.disabled">
                {hasFilters ? 'Try adjusting your filters' : 'This member has not made any donations yet'}
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Payment Mode</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Receipt No.</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Collected By</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Notes</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="center">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginated.map((d) => (
                      <TableRow key={d.id} hover>
                        <TableCell>{d.donationDate}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{formatIndian(d.amount)}</TableCell>
                        <TableCell>
                          <Chip label={d.paymentMode} size="small" color={getPaymentModeColor(d.paymentMode)} variant="outlined" />
                        </TableCell>
                        <TableCell>{d.receiptNumber || '—'}</TableCell>
                        <TableCell>{d.collectorName || '—'}</TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ maxWidth: 140 }} noWrap>{d.remarks || '—'}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton size="small" color="primary" onClick={() => handlePrintReceipt(d.id)} title="Print Receipt">
                            <Printer size={16} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={filteredDonations.length}
                page={page}
                onPageChange={(_, p) => setPage(p)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                rowsPerPageOptions={[5, 10, 25, 50]}
                labelRowsPerPage="Per page:"
              />
            </>
          )}
        </Paper>
      </motion.div>

      {/* Timeline */}
      <motion.div variants={itemVariants}>
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Member Timeline</Typography>
          <Divider sx={{ mb: 2 }} />
          {timeline.length === 0 ? (
            <Typography color="text.secondary" variant="body2" sx={{ textAlign: 'center', py: 3 }}>No timeline events</Typography>
          ) : (
            <Box sx={{ position: 'relative' }}>
              <Box sx={{ position: 'absolute', left: 15, top: 8, bottom: 8, width: 2, bgcolor: 'divider', borderRadius: 1 }} />
              {timeline.map((item, i) => (
                <motion.div
                  key={`${item.type}-${i}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Box sx={{ display: 'flex', gap: 2, pb: 2.5, position: 'relative', pl: 1 }}>
                    <Box
                      sx={{
                        width: 32, height: 32, borderRadius: '50%', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        zIndex: 1, mt: 0.3,
                        bgcolor: item.type === 'registration' ? 'success.main' : 'primary.main',
                        color: '#fff', fontSize: 14,
                      }}
                    >
                      {item.type === 'registration' ? <Calendar size={14} /> : <IndianRupee size={14} />}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={600}>{item.title}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.date} {item.subtitle ? `· ${item.subtitle}` : ''}
                      </Typography>
                    </Box>
                  </Box>
                </motion.div>
              ))}
            </Box>
          )}
        </Paper>
      </motion.div>

      {/* Actions */}
      <motion.div variants={itemVariants}>
        <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Actions</Typography>
          <Divider sx={{ mb: 2 }} />
          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
            <Button variant="contained" startIcon={<Edit size={16} />} onClick={() => setFormOpen(true)} sx={{ borderRadius: 2 }}>
              Edit Member
            </Button>
            <Button variant="contained" color="success" startIcon={<Plus size={16} />} onClick={() => setDonationFormOpen(true)} sx={{ borderRadius: 2 }}>
              Add Donation
            </Button>
            <Button variant="outlined" startIcon={<Printer size={16} />} onClick={handlePrintHistory} sx={{ borderRadius: 2 }}>
              Print History
            </Button>
            <Button variant="outlined" startIcon={<Download size={16} />} onClick={handleExportCSV} sx={{ borderRadius: 2 }}>
              Export CSV
            </Button>
            <Button variant="outlined" color="error" startIcon={<Trash2 size={16} />} onClick={() => setDeleteDialogOpen(true)} sx={{ borderRadius: 2 }}>
              Delete Member
            </Button>
          </Stack>
        </Paper>
      </motion.div>

      <MemberForm open={formOpen} onClose={() => setFormOpen(false)} member={member} onSaved={handleEditSaved} />
      <DeleteDialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} member={member} onDeleted={handleDeleted} />
      <DonationForm open={donationFormOpen} onClose={() => setDonationFormOpen(false)} onSaved={handleDonationSaved} />

      <div ref={printRef} />
    </motion.div>
  );
}
