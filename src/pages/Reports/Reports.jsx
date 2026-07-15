import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Card,
  CardContent,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  CircularProgress,
  Button,
  Stack,
} from '@mui/material';
import { toast } from 'react-toastify';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { donationService, dashboardService } from '../../services';
import { getAllMembers } from '../../services/memberService';

const tabs = ['Daily', 'Monthly', 'Yearly', 'Colony-wise', 'Cash', 'Online', 'Pending', 'Top Donors'];

const onlineModes = ['UPI', 'Google Pay', 'PhonePe', 'Paytm', 'Bank Transfer'];

export default function Reports() {
  const [activeTab, setActiveTab] = useState('Daily');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({});
  const [allMembers, setAllMembers] = useState([]);

  const [dailyDate, setDailyDate] = useState(new Date().toISOString().split('T')[0]);
  const [month, setMonth] = useState(new Date().toISOString().substring(0, 7));
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    getAllMembers().then(setAllMembers).catch(() => {});
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        let result;
        switch (activeTab) {
          case 'Daily': {
            const donations = await donationService.getDonationsByDateRange(dailyDate, dailyDate);
            const total = donations.reduce((s, d) => s + d.amount, 0);
            result = { donations, total };
            break;
          }
          case 'Monthly': {
            const start = `${month}-01`;
            const endDate = new Date(new Date(start).getFullYear(), new Date(start).getMonth() + 1, 0).toISOString().split('T')[0];
            const donations = await donationService.getDonationsByDateRange(start, endDate);
            const total = donations.reduce((s, d) => s + d.amount, 0);
            const dailyMap = {};
            donations.forEach(d => {
              dailyMap[d.donationDate] = (dailyMap[d.donationDate] || 0) + d.amount;
            });
            const chartData = Object.entries(dailyMap).sort((a, b) => a[0].localeCompare(b[0])).map(([date, amount]) => ({ date, amount }));
            result = { donations, total, chartData };
            break;
          }
          case 'Yearly': {
            const start = `${year}-01-01`;
            const end = `${year}-12-31`;
            const donations = await donationService.getDonationsByDateRange(start, end);
            const total = donations.reduce((s, d) => s + d.amount, 0);
            const monthlyMap = {};
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            donations.forEach(d => {
              const m = d.donationDate.substring(0, 7);
              monthlyMap[m] = (monthlyMap[m] || 0) + d.amount;
            });
            const chartData = Object.entries(monthlyMap).sort((a, b) => a[0].localeCompare(b[0])).map(([ym, amount]) => {
              const monthIndex = parseInt(ym.split('-')[1], 10) - 1;
              return { month: monthNames[monthIndex] || ym, amount };
            });
            result = { donations, total, chartData };
            break;
          }
          case 'Colony-wise': {
            const colData = await dashboardService.getColonyWiseCollection();
            const colonies = await (await import('../../services/colonyService')).getColonies();
            const merged = colData.map(c => {
              const col = colonies.find(co => co.name === c.colonyName);
              return { ...c, totalMembers: col?.totalMembers || 0, average: col?.totalMembers ? Math.round(c.amount / col.totalMembers) : 0 };
            });
            result = { data: merged };
            break;
          }
          case 'Cash': {
            const donations = await donationService.getDonationsByPaymentMode('Cash');
            const total = donations.reduce((s, d) => s + d.amount, 0);
            result = { donations, total };
            break;
          }
          case 'Online': {
            const all = await donationService.getAllDonations();
            const donations = all.filter(d => onlineModes.includes(d.paymentMode));
            const total = donations.reduce((s, d) => s + d.amount, 0);
            result = { donations, total };
            break;
          }
          case 'Pending': {
            const members = allMembers.length ? allMembers : await getAllMembers();
            const allDonations = await donationService.getAllDonations();
            const currentYear = new Date().getFullYear().toString();
            const pending = members.filter(m => !allDonations.some(d => d.memberId === m.id && d.donationDate.startsWith(currentYear)));
            const withLastDonation = pending.map(m => {
              const last = allDonations.filter(d => d.memberId === m.id).sort((a, b) => b.donationDate.localeCompare(a.donationDate))[0];
              return { ...m, lastDonationYear: last?.donationDate?.substring(0, 4) || 'Never' };
            });
            result = { members: withLastDonation };
            break;
          }
          case 'Top Donors': {
            const top20 = await dashboardService.getTopDonors(20);
            result = { donors: top20 };
            break;
          }
        }
        setData(result || {});
      } catch (err) {
        toast.error(err.message || 'Failed to load report');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [activeTab, dailyDate, month, year, allMembers]);

  const renderTable = (columns, rows, rowKey) => (
    <Table size="small">
      <TableHead>
        <TableRow>
          {columns.map(col => <TableCell key={col.key} sx={{ fontWeight: 700 }}>{col.label}</TableCell>)}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row, i) => (
          <TableRow key={row[rowKey] || i}>
            {columns.map(col => (
              <TableCell key={col.key}>{col.render ? col.render(row, i) : row[col.key]}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderContent = () => {
    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;

    switch (activeTab) {
      case 'Daily':
        return (
          <Box>
            <TextField
              label="Select Date"
              type="date"
              value={dailyDate}
              onChange={e => setDailyDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            <Card sx={{ mb: 2, bgcolor: 'primary.main', color: '#fff' }}>
              <CardContent>
                <Typography variant="h6">Total Collection: ₹{data.total?.toLocaleString() || 0}</Typography>
                <Typography variant="body2">{data.donations?.length || 0} donations</Typography>
              </CardContent>
            </Card>
            {data.donations?.length > 0 ? renderTable(
              [
                { key: 'memberName', label: 'Member' },
                { key: 'amount', label: 'Amount', render: (r) => `₹${r.amount}` },
                { key: 'paymentMode', label: 'Mode' },
                { key: 'collectorName', label: 'Collector' },
              ],
              data.donations, 'id'
            ) : <Typography color="text.secondary" textAlign="center" py={4}>No donations for this date</Typography>}
          </Box>
        );

      case 'Monthly':
        return (
          <Box>
            <TextField
              label="Select Month"
              type="month"
              value={month}
              onChange={e => setMonth(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            <Card sx={{ mb: 2, bgcolor: 'primary.main', color: '#fff' }}>
              <CardContent>
                <Typography variant="h6">Total Collection: ₹{data.total?.toLocaleString() || 0}</Typography>
                <Typography variant="body2">{data.donations?.length || 0} donations</Typography>
              </CardContent>
            </Card>
            {data.chartData?.length > 0 && (
              <Card sx={{ mb: 2, p: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} mb={2}>Daily Collection Trend</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={60} />
                    <YAxis />
                    <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
                    <Bar dataKey="amount" fill="#ff6f00" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            )}
            {data.donations?.length > 0 && renderTable(
              [{ key: 'memberName', label: 'Member' }, { key: 'amount', label: 'Amount', render: (r) => `₹${r.amount}` }, { key: 'donationDate', label: 'Date' }, { key: 'paymentMode', label: 'Mode' }],
              data.donations, 'id'
            )}
          </Box>
        );

      case 'Yearly':
        return (
          <Box>
            <TextField
              label="Select Year"
              type="number"
              value={year}
              onChange={e => setYear(Number(e.target.value))}
              sx={{ mb: 2 }}
            />
            <Card sx={{ mb: 2, bgcolor: 'primary.main', color: '#fff' }}>
              <CardContent>
                <Typography variant="h6">Total Collection: ₹{data.total?.toLocaleString() || 0}</Typography>
              </CardContent>
            </Card>
            {data.chartData?.length > 0 && (
              <Card sx={{ mb: 2, p: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} mb={2}>Monthly Breakdown</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis />
                    <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
                    <Bar dataKey="amount" fill="#1976d2" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            )}
            {data.chartData?.length > 0 && renderTable(
              [{ key: 'month', label: 'Month' }, { key: 'amount', label: 'Collection', render: (r) => `₹${r.amount.toLocaleString()}` }],
              data.chartData, 'month'
            )}
          </Box>
        );

      case 'Colony-wise':
        return (
          <Box>
            {data.data?.length > 0 && (
              <Card sx={{ mb: 2, p: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} mb={2}>Colony Collection Chart</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="colonyName" tick={{ fontSize: 11 }} />
                    <YAxis />
                    <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
                    <Bar dataKey="amount" fill="#388e3c" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            )}
            {renderTable(
              [
                { key: 'colonyName', label: 'Colony' },
                { key: 'totalMembers', label: 'Total Members' },
                { key: 'amount', label: 'Total Collection', render: (r) => `₹${r.amount.toLocaleString()}` },
                { key: 'average', label: 'Average', render: (r) => `₹${r.average.toLocaleString()}` },
              ],
              data.data || [], 'colonyName'
            )}
          </Box>
        );

      case 'Cash':
        return (
          <Box>
            <Card sx={{ mb: 2, bgcolor: 'warning.main', color: '#fff' }}>
              <CardContent>
                <Typography variant="h6">Total Cash Collected: ₹{data.total?.toLocaleString() || 0}</Typography>
                <Typography variant="body2">{data.donations?.length || 0} cash donations</Typography>
              </CardContent>
            </Card>
            {data.donations?.length > 0 ? renderTable(
              [{ key: 'memberName', label: 'Member' }, { key: 'amount', label: 'Amount', render: (r) => `₹${r.amount}` }, { key: 'donationDate', label: 'Date' }, { key: 'receiptNumber', label: 'Receipt' }],
              data.donations, 'id'
            ) : <Typography color="text.secondary" textAlign="center" py={4}>No cash donations found</Typography>}
          </Box>
        );

      case 'Online':
        return (
          <Box>
            <Card sx={{ mb: 2, bgcolor: 'info.main', color: '#fff' }}>
              <CardContent>
                <Typography variant="h6">Total Online Collection: ₹{data.total?.toLocaleString() || 0}</Typography>
                <Typography variant="body2">{data.donations?.length || 0} online donations</Typography>
              </CardContent>
            </Card>
            {data.donations?.length > 0 ? renderTable(
              [{ key: 'memberName', label: 'Member' }, { key: 'amount', label: 'Amount', render: (r) => `₹${r.amount}` }, { key: 'paymentMode', label: 'Mode' }, { key: 'donationDate', label: 'Date' }],
              data.donations, 'id'
            ) : <Typography color="text.secondary" textAlign="center" py={4}>No online donations found</Typography>}
          </Box>
        );

      case 'Pending':
        return (
          <Box>
            <Card sx={{ mb: 2, bgcolor: 'error.main', color: '#fff' }}>
              <CardContent>
                <Typography variant="h6">{data.members?.length || 0} members haven't donated this year</Typography>
              </CardContent>
            </Card>
            {data.members?.length > 0 ? renderTable(
              [{ key: 'id', label: 'ID' }, { key: 'fullName', label: 'Name' }, { key: 'mobileNumber', label: 'Mobile' }, { key: 'colony', label: 'Colony' }, { key: 'lastDonationYear', label: 'Last Donation' }],
              data.members, 'id'
            ) : <Typography color="text.secondary" textAlign="center" py={4}>All members have donated this year</Typography>}
          </Box>
        );

      case 'Top Donors':
        return (
          <Box>
            <Card sx={{ mb: 2, bgcolor: 'success.main', color: '#fff' }}>
              <CardContent>
                <Typography variant="h6">Top 20 Donors</Typography>
              </CardContent>
            </Card>
            {data.donors?.length > 0 ? renderTable(
              [
                { key: 'rank', label: 'Rank', render: (_, i) => i + 1 },
                { key: 'memberName', label: 'Name' },
                { key: 'totalAmount', label: 'Total Donated', render: (r) => `₹${r.totalAmount.toLocaleString()}` },
              ],
              data.donors, 'memberId'
            ) : <Typography color="text.secondary" textAlign="center" py={4}>No donor data available</Typography>}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" fontWeight={700}>Reports</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={() => toast.info('PDF export coming soon')}>Export PDF</Button>
          <Button variant="outlined" onClick={() => toast.info('Excel export coming soon')}>Export Excel</Button>
        </Stack>
      </Box>

      <ToggleButtonGroup
        value={activeTab}
        exclusive
        onChange={(_, v) => v && setActiveTab(v)}
        size="small"
        sx={{ mb: 3, flexWrap: 'wrap' }}
      >
        {tabs.map(t => (
          <ToggleButton key={t} value={t} sx={{ px: 2 }}>{t}</ToggleButton>
        ))}
      </ToggleButtonGroup>

      {renderContent()}
    </Box>
  );
}
