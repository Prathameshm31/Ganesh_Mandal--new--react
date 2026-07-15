import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Typography, Paper, Alert, Button, Chip,
} from '@mui/material';
import {
  Users, IndianRupee, Wallet, Wifi, Calendar,
  Target, Trophy, UserPlus, ArrowRight,
  BarChart3, Landmark, UtensilsCrossed,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import dashboardService from '../../services/dashboardService';
import prasadSponsorshipService from '../../services/prasadSponsorshipService';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import StatsCard from '../../components/common/StatsCard';
import ChartCard from '../../components/common/ChartCard';
import MonthlyChart from '../../components/charts/MonthlyChart';
import PaymentPieChart from '../../components/charts/PieChart';
import TrendChart from '../../components/charts/TrendChart';
import ColonyChart from '../../components/charts/ColonyChart';
import TopContributorsChart from '../../components/charts/TopContributorsChart';

function formatIndian(n) {
  if (n === null || n === undefined) return '₹0';
  const num = Number(n);
  if (isNaN(num)) return '₹0';
  const str = Math.round(num).toString();
  const lastThree = str.slice(-3);
  const rest = str.slice(0, -3);
  const formatted = rest ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree : lastThree;
  return `₹${formatted}`;
}

const statCardsConfig = [
  { title: 'Total Members', key: 'totalMembers', icon: Users, color: 'blue', format: (v) => v?.toLocaleString('en-IN'), nav: '/members' },
  { title: 'Total Collection', key: 'totalDonations', icon: IndianRupee, color: 'orange', format: (v) => formatIndian(v), nav: '/donations' },
  { title: 'Cash Collection', key: 'cashCollection', icon: Wallet, color: 'green', format: (v) => formatIndian(v), nav: '/donations?paymentMode=Cash' },
  { title: 'Online Collection', key: 'onlineCollection', icon: Wifi, color: 'purple', format: (v) => formatIndian(v), nav: '/donations?paymentMode=Online' },
  { title: 'This Year', key: 'thisYearCollection', icon: Calendar, color: 'indigo', format: (v) => formatIndian(v), nav: `/donations?year=${new Date().getFullYear()}` },
  { title: 'Collection Goal', key: 'goalProgress', icon: Target, color: 'amber', format: (v) => `${Math.round(v)}%` },
];

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <motion.div variants={sectionVariants}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5, mt: 1 }}>
        <Box sx={{ width: 36, height: 36, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'primary.main', color: '#fff', fontSize: 18 }}>
          <Icon size={18} />
        </Box>
        <Box>
          <Typography variant="h6" fontWeight={700}>{title}</Typography>
          {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
        </Box>
      </Box>
    </motion.div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [colonyData, setColonyData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [topDonors, setTopDonors] = useState([]);
  const [recentMembers, setRecentMembers] = useState([]);
  const [topContributor, setTopContributor] = useState(null);
  const [todayPrasad, setTodayPrasad] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, monthlyRes, pieRes, colonyRes, trendRes, topDonorsRes, activityRes] = await Promise.all([
        dashboardService.getDashboardStats(),
        dashboardService.getMonthlyCollection(),
        dashboardService.getPaymentModeBreakdown(),
        dashboardService.getColonyWiseCollection(),
        dashboardService.getYearlyTrend(),
        dashboardService.getTopDonors(10),
        dashboardService.getRecentActivity(),
      ]);
      setStats(statsRes);
      setMonthlyData(monthlyRes);
      setPieData(pieRes);
      setColonyData(colonyRes);
      setTrendData(trendRes);
      setTopDonors(topDonorsRes);
      setRecentMembers(activityRes.recentMembers);
      if (topDonorsRes.length > 0) {
        setTopContributor(topDonorsRes[0]);
      }
      const today = new Date().toISOString().split('T')[0];
      const prasadThisYear = await prasadSponsorshipService.getPrasadByYear(String(new Date().getFullYear()));
      setTodayPrasad(prasadThisYear.filter((p) => p.prasadDate === today));
    } catch (err) {
      const msg = err?.message || 'Failed to load dashboard data';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const collectionGoal = stats?.collectionGoal || 1000000;
  const goalProgress = stats ? Math.min(100, Math.round((stats.thisYearCollection / collectionGoal) * 100)) : 0;

  const enhancedStats = stats ? {
    ...stats,
    goalProgress,
  } : null;

  if (error && !stats) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>
        <Typography color="text.secondary">
          Something went wrong. Please try refreshing the page.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: -0.5 }}>
              Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Overview of your mandal&apos;s activities and collections
            </Typography>
          </Box>
        </Box>
      </motion.div>

      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {statCardsConfig.map((card, idx) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={card.key}>
            <StatsCard
              title={card.title}
              value={enhancedStats ? card.format(enhancedStats[card.key]) : '—'}
              icon={<card.icon size={22} />}
              color={card.color}
              loading={loading}
              index={idx}
              subtitle={card.key === 'goalProgress' ? `of ${formatIndian(collectionGoal)}` : card.subtitle}
              onClick={card.nav ? () => navigate(card.nav) : undefined}
            />
          </Grid>
        ))}

        {loading ? (
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <StatsCard loading index={5} />
          </Grid>
        ) : (
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <StatsCard
              title="Top Contributor"
              value={topContributor ? topContributor.memberName : '—'}
              icon={<Trophy size={22} />}
              color="red"
              subtitle={topContributor ? formatIndian(topContributor.totalAmount) : 'No data'}
              onClick={() => navigate('/members?sortBy=donations&sortOrder=desc')}
            />
          </Grid>
        )}

        {loading ? (
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <StatsCard loading index={6} />
          </Grid>
        ) : (
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <StatsCard
              title="Recently Added"
              value={recentMembers.length > 0 ? recentMembers[0]?.fullName || '—' : '—'}
              icon={<UserPlus size={22} />}
              color="teal"
              subtitle={recentMembers.length > 0 ? `+${recentMembers.length} this month` : 'No new members'}
              onClick={() => navigate('/members?sortBy=joinDate&sortOrder=desc')}
            />
          </Grid>
        )}
      </Grid>

      <motion.div variants={sectionVariants} initial="hidden" animate="visible">
        <SectionHeader icon={BarChart3} title="Charts &amp; Analytics" subtitle="Monthly trends, payment breakdown, colony-wise collection &amp; top contributors" />
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <ChartCard
              title="Monthly Collection"
              subtitle="Donations received per month"
              loading={loading}
              isEmpty={!loading && (!monthlyData || monthlyData.length === 0)}
              emptyMessage="No monthly data yet"
              index={0}
            >
              <MonthlyChart data={monthlyData} height={280} />
            </ChartCard>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <ChartCard
              title="Cash vs Online"
              subtitle="Payment method comparison"
              loading={loading}
              isEmpty={!loading && (!pieData || pieData.length === 0)}
              emptyMessage="No payment data yet"
              index={1}
            >
              <PaymentPieChart data={pieData} height={280} />
            </ChartCard>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <ChartCard
              title="Year-wise Collection Trend"
              subtitle="Annual donation totals"
              loading={loading}
              isEmpty={!loading && (!trendData || trendData.length === 0)}
              emptyMessage="No trend data yet"
              index={2}
            >
              <TrendChart data={trendData} height={280} />
            </ChartCard>
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <ChartCard
              title="Colony-wise Collection"
              subtitle="Total collections by colony"
              loading={loading}
              isEmpty={!loading && (!colonyData || colonyData.length === 0)}
              emptyMessage="No colony data yet"
              index={3}
            >
              <ColonyChart data={colonyData} height={300} />
            </ChartCard>
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <ChartCard
              title="Top 10 Contributors"
              subtitle="Ranked by total donation amount"
              loading={loading}
              isEmpty={!loading && (!topDonors || topDonors.length === 0)}
              emptyMessage="No contributor data yet"
              index={4}
            >
              <TopContributorsChart data={topDonors} height={300} />
            </ChartCard>
          </Grid>
        </Grid>
      </motion.div>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={600}>Collection Goal Progress</Typography>
              <Typography variant="h6" fontWeight={700} color="primary.main">
                {goalProgress}%
              </Typography>
            </Box>
            {loading ? (
              <LoadingSkeleton type="text" count={2} />
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={goalProgress}
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.5 }}
                >
                  <Box
                    sx={{
                      width: '100%',
                      height: 12,
                      bgcolor: 'action.hover',
                      borderRadius: 6,
                      overflow: 'hidden',
                      mb: 1.5,
                    }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${goalProgress}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                      style={{
                        height: '100%',
                        borderRadius: 6,
                        background: 'linear-gradient(90deg, #FF6F00, #FFB74D)',
                      }}
                    />
                  </Box>
                </motion.div>
              </AnimatePresence>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" color="text.secondary">
                Collected: {enhancedStats ? formatIndian(stats?.thisYearCollection) : '—'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Goal: {formatIndian(collectionGoal)}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={600}>Current Year's Ganesh Murti</Typography>
              <Button
                size="small"
                endIcon={<ArrowRight size={16} />}
                onClick={() => navigate('/murti')}
                sx={{ textTransform: 'none' }}
              >
                View All
              </Button>
            </Box>
            {loading ? (
              <LoadingSkeleton type="text" count={5} />
            ) : stats?.currentYearMurti ? (
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: 2,
                    bgcolor: stats.currentYearMurti.photoUrl ? 'transparent' : 'action.hover',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    overflow: 'hidden',
                  }}
                >
                  {stats.currentYearMurti.photoUrl ? (
                    <Box component="img" src={stats.currentYearMurti.photoUrl} alt={stats.currentYearMurti.murtiName}
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Landmark size={36} color="#ccc" />
                  )}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body1" fontWeight={700}>{stats.currentYearMurti.murtiName}</Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Donated by: {stats.currentYearMurti.donatedBy || '—'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Height: {stats.currentYearMurti.murtiHeight ? `${stats.currentYearMurti.murtiHeight} ft` : '—'} · Type: {stats.currentYearMurti.murtiType || '—'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Installation: {stats.currentYearMurti.installationDate || '—'}
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Typography color="text.secondary" variant="body2" sx={{ py: 3, textAlign: 'center' }}>
                No murti record for {new Date().getFullYear()}
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={600}>Today's Prasad</Typography>
              <Button
                size="small"
                endIcon={<ArrowRight size={16} />}
                onClick={() => navigate('/murti')}
                sx={{ textTransform: 'none' }}
              >
                View All
              </Button>
            </Box>
            {loading ? (
              <LoadingSkeleton type="text" count={3} />
            ) : todayPrasad.length > 0 ? (
              <Box>
                {todayPrasad.map((p, i) => (
                  <Box
                    key={p.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      py: 1.2,
                      borderBottom: i < todayPrasad.length - 1 ? '1px solid' : 'none',
                      borderColor: 'divider',
                    }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        bgcolor: 'rgba(234,88,12,0.1)',
                        color: '#ea580c',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <UtensilsCrossed size={20} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={600}>{p.prasadName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {p.sponsoredBy ? `Sponsored by: ${p.sponsoredBy}` : '—'}
                      </Typography>
                    </Box>
                    <Chip
                      label={p.status}
                      size="small"
                      color={p.status === 'Completed' ? 'success' : p.status === 'Pending' ? 'warning' : 'error'}
                    />
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography color="text.secondary" variant="body2" sx={{ py: 3, textAlign: 'center' }}>
                No prasad scheduled for today
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={600}>Recently Added Members</Typography>
              <Button
                size="small"
                endIcon={<ArrowRight size={16} />}
                onClick={() => navigate('/members?sortBy=joinDate&sortOrder=desc')}
                sx={{ textTransform: 'none' }}
              >
                View All
              </Button>
            </Box>
            {loading ? (
              <LoadingSkeleton type="table" count={4} />
            ) : recentMembers.length === 0 ? (
              <Typography color="text.secondary" variant="body2" sx={{ py: 3, textAlign: 'center' }}>
                No new members added yet
              </Typography>
            ) : (
              <Box>
                {recentMembers.slice(0, 5).map((m, i) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        py: 1.2,
                        borderBottom: i < Math.min(recentMembers.length, 5) - 1 ? '1px solid' : 'none',
                        borderColor: 'divider',
                        cursor: 'pointer',
                        borderRadius: 1,
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                      onClick={() => navigate(`/members/profile/${m.id}`)}
                    >
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          bgcolor: 'primary.main',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 16,
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {m.fullName?.charAt(0)?.toUpperCase() || '?'}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={600} noWrap>
                          {m.fullName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {m.colony || '—'} · {m.joinDate || '—'}
                        </Typography>
                      </Box>
                    </Box>
                  </motion.div>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
