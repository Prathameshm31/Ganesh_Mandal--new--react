import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Typography, Paper, Alert, Button, Chip, CircularProgress,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
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

function useStatCards(filterFn) {
  const allStatCards = [
    { title: 'Total Members', key: 'totalMembers', icon: Users, color: 'blue', format: (v) => v?.toLocaleString('en-IN'), nav: '/members', perm: 'USERS:VIEW' },
    { title: 'Total Collection', key: 'totalCollection', icon: IndianRupee, color: 'orange', format: (v) => formatIndian(v), nav: '/donations', perm: 'DONATIONS:VIEW' },
    { title: 'Cash Collection', key: 'cashCollection', icon: Wallet, color: 'green', format: (v) => formatIndian(v), nav: '/donations?paymentMode=Cash', perm: 'DONATIONS:VIEW' },
    { title: 'Online Collection', key: 'onlineCollection', icon: Wifi, color: 'purple', format: (v) => formatIndian(v), nav: '/donations?paymentMode=Online', perm: 'DONATIONS:VIEW' },
    { title: 'This Year', key: 'thisYearCollection', icon: Calendar, color: 'indigo', format: (v) => formatIndian(v), nav: `/donations?year=${new Date().getFullYear()}`, perm: 'DONATIONS:VIEW' },
    { title: 'Collection Goal', key: 'goalProgress', icon: Target, color: 'amber', format: (v) => `${Math.round(v)}%`, perm: 'DONATIONS:VIEW' },
  ];
  return allStatCards.filter(filterFn);
}

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

function SectionError({ message }) {
  return (
    <Alert severity="error" sx={{ borderRadius: 2, mb: 2 }}>
      {message}
    </Alert>
  );
}

function SectionEmpty({ message }) {
  return (
    <Box sx={{ py: 4, textAlign: 'center' }}>
      <Typography color="text.secondary" variant="body2">{message}</Typography>
    </Box>
  );
}

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
  const { hasPermission } = useAuth();
  const statCardsConfig = useStatCards(c => !c.perm || hasPermission(c.perm));

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [monthlyData, setMonthlyData] = useState([]);
  const [monthlyLoading, setMonthlyLoading] = useState(true);

  const [pieData, setPieData] = useState([]);
  const [pieLoading, setPieLoading] = useState(true);

  const [colonyData, setColonyData] = useState([]);
  const [colonyLoading, setColonyLoading] = useState(true);

  const [trendData, setTrendData] = useState([]);
  const [trendLoading, setTrendLoading] = useState(true);

  const [topDonors, setTopDonors] = useState([]);
  const [topDonorsLoading, setTopDonorsLoading] = useState(true);

  const [recentMembers, setRecentMembers] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);

  const [todayPrasad, setTodayPrasad] = useState([]);
  const [prasadLoading, setPrasadLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    setStatsLoading(true);
    setMonthlyLoading(true);
    setPieLoading(true);
    setColonyLoading(true);
    setTrendLoading(true);
    setTopDonorsLoading(true);
    setActivityLoading(true);
    setPrasadLoading(true);

    const settle = async (label, setter, setterLoading, fn) => {
      try {
        const result = await fn();
        setter(result);
      } catch (err) {
        const msg = err?.message || `Failed to load ${label}`;
        toast.error(msg);
      } finally {
        setterLoading(false);
      }
    };

    await Promise.allSettled([
      settle('stats', setStats, setStatsLoading, () => dashboardService.getDashboardStats()),
      settle('monthly collection', setMonthlyData, setMonthlyLoading, () => dashboardService.getMonthlyCollection()),
      settle('payment breakdown', setPieData, setPieLoading, () => dashboardService.getPaymentModeBreakdown()),
      settle('colony collection', setColonyData, setColonyLoading, () => dashboardService.getColonyWiseCollection()),
      settle('yearly trend', setTrendData, setTrendLoading, () => dashboardService.getYearlyTrend()),
      settle('top donors', setTopDonors, setTopDonorsLoading, () => dashboardService.getTopDonors(10)),
      settle('recent activity', setRecentMembers, setActivityLoading, async () => {
        const res = await dashboardService.getRecentActivity();
        return res.recentMembers || [];
      }),
      settle('prasad', setTodayPrasad, setPrasadLoading, async () => {
        const today = new Date().toISOString().split('T')[0];
        const all = await prasadSponsorshipService.getPrasadByYear(String(new Date().getFullYear()));
        return all.filter((p) => p.prasadDate === today);
      }),
    ]);
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

  const topContributor = topDonors.length > 0 ? topDonors[0] : null;

  if (statsLoading && !stats) {
    return (
      <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (!statsLoading && !stats) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          Failed to load dashboard data. Please try refreshing the page.
        </Alert>
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <CircularProgress size={24} />
          <Typography color="text.secondary" sx={{ mt: 2 }}>
            Retrying...
          </Typography>
        </Box>
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
          <Button variant="contained" size="large"
            onClick={() => navigate('/donate')}
            sx={{ height: 48, px: 4, borderRadius: 3, fontWeight: 700, fontSize: 15, gap: 1 }}>
            <IndianRupee size={20} /> Donate Now
          </Button>
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
              loading={statsLoading}
              index={idx}
              subtitle={card.key === 'goalProgress' ? `of ${formatIndian(collectionGoal)}` : card.subtitle}
              onClick={card.nav ? () => navigate(card.nav) : undefined}
            />
          </Grid>
        ))}

        {topDonorsLoading ? (
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

        {activityLoading ? (
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <StatsCard loading index={6} />
          </Grid>
        ) : (
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <StatsCard
              title="Recently Added"
              value={recentMembers.length > 0 ? recentMembers[0]?.name || '—' : '—'}
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
              loading={monthlyLoading}
              isEmpty={!monthlyLoading && (!monthlyData || monthlyData.length === 0)}
              emptyMessage="No monthly data available"
              index={0}
            >
              <MonthlyChart data={monthlyData} height={280} />
            </ChartCard>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <ChartCard
              title="Cash vs Online"
              subtitle="Payment method comparison"
              loading={pieLoading}
              isEmpty={!pieLoading && (!pieData || pieData.length === 0)}
              emptyMessage="No payment data available"
              index={1}
            >
              <PaymentPieChart data={pieData} height={280} />
            </ChartCard>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <ChartCard
              title="Year-wise Collection Trend"
              subtitle="Annual donation totals"
              loading={trendLoading}
              isEmpty={!trendLoading && (!trendData || trendData.length === 0)}
              emptyMessage="No trend data available"
              index={2}
            >
              <TrendChart data={trendData} height={280} />
            </ChartCard>
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <ChartCard
              title="Colony-wise Collection"
              subtitle="Total collections by colony"
              loading={colonyLoading}
              isEmpty={!colonyLoading && (!colonyData || colonyData.length === 0)}
              emptyMessage="No colony data available"
              index={3}
            >
              <ColonyChart data={colonyData} height={300} />
            </ChartCard>
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <ChartCard
              title="Top 10 Contributors"
              subtitle="Ranked by total donation amount"
              loading={topDonorsLoading}
              isEmpty={!topDonorsLoading && (!topDonors || topDonors.length === 0)}
              emptyMessage="No contributor data available"
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
            {statsLoading ? (
              <LoadingSkeleton type="text" count={2} />
            ) : !stats ? (
              <SectionEmpty message="No goal data available" />
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
            {statsLoading ? (
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
              <SectionEmpty message={`No murti record for ${new Date().getFullYear()}`} />
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
            {prasadLoading ? (
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
              <SectionEmpty message="No prasad scheduled for today" />
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
            {activityLoading ? (
              <LoadingSkeleton type="table" count={4} />
            ) : recentMembers.length === 0 ? (
              <SectionEmpty message="No new members added yet" />
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
                        {m.name?.charAt(0)?.toUpperCase() || '?'}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={600} noWrap>
                          {m.name}
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
