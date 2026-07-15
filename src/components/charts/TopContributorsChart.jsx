import { Box, Typography, useTheme } from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

function formatIndian(n) {
  if (!n && n !== 0) return '₹0';
  const str = Math.round(n).toString();
  const lastThree = str.slice(-3);
  const rest = str.slice(0, -3);
  const formatted = rest ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree : lastThree;
  return `₹${formatted}`;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <Box
        sx={{
          bgcolor: 'background.paper',
          px: 1.75,
          py: 1.25,
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          boxShadow: 4,
        }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>{d.fullName}</Typography>
        <Typography variant="body2" color="primary.main" fontWeight={700}>
          {formatIndian(payload[0].value)}
        </Typography>
      </Box>
    );
  }
  return null;
};

const BAR_COLORS = ['#FF6F00', '#FF8F00', '#FFB74D', '#FFD54F', '#E65100', '#F57F17', '#FBC02D', '#F9A825', '#F57F17', '#E65100'];

export default function TopContributorsChart({ data, height = 340 }) {
  const theme = useTheme();

  if (!data || data.length === 0) {
    return null;
  }

  const chartData = data.map((d) => ({
    name: d.memberName?.length > 14 ? d.memberName.substring(0, 14) + '…' : d.memberName,
    amount: d.totalAmount,
    fullName: d.memberName,
  }));

  return (
    <Box sx={{ width: '100%', height }}>
      <ResponsiveContainer>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 4, right: 12, left: 44, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} horizontal={false} />
          <XAxis
            type="number"
            tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
            tick={{ fontSize: 10, fill: theme.palette.text.secondary }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 10, fill: theme.palette.text.secondary }}
            width={68}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: theme.palette.action.hover }} />
          <Bar
            dataKey="amount"
            radius={[0, 4, 4, 0]}
            maxBarSize={18}
            isAnimationActive
            animationDuration={700}
            animationEasing="ease-out"
          >
            {chartData.map((_, index) => (
              <rect key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
