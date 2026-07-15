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
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>{label}</Typography>
        <Typography variant="body2" color="primary.main" fontWeight={700}>
          {formatIndian(payload[0].value)}
        </Typography>
      </Box>
    );
  }
  return null;
};

const formatMonth = (monthStr) => {
  if (!monthStr) return '';
  const [, m] = monthStr.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[parseInt(m, 10) - 1] || monthStr;
};

export default function MonthlyChart({ data, height = 300 }) {
  const theme = useTheme();

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <Box sx={{ width: '100%', height }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 2, bottom: 0 }}>
          <defs>
            <linearGradient id="monthlyBarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF6F00" stopOpacity={0.85} />
              <stop offset="100%" stopColor="#FFB74D" stopOpacity={0.45} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
          <XAxis
            dataKey="month"
            tickFormatter={formatMonth}
            tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
            interval={0}
            axisLine={false}
            tickLine={false}
            dy={6}
          />
          <YAxis
            tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
            tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: theme.palette.action.hover }} />
          <Bar
            dataKey="amount"
            fill="url(#monthlyBarGradient)"
            radius={[4, 4, 0, 0]}
            maxBarSize={24}
            isAnimationActive
            animationDuration={600}
            animationEasing="ease-out"
          />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
