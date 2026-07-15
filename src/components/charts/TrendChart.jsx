import { Box, Typography, useTheme } from '@mui/material';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
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
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>Year {label}</Typography>
        <Typography variant="body2" color="primary.main" fontWeight={700}>
          {formatIndian(payload[0].value)}
        </Typography>
      </Box>
    );
  }
  return null;
};

export default function TrendChart({ data, height = 260 }) {
  const theme = useTheme();

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <Box sx={{ width: '100%', height }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 2, bottom: 0 }}>
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FF6F00" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#FF6F00" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
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
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#FF6F00"
            strokeWidth={2.5}
            fill="url(#trendGradient)"
            dot={{ fill: '#FF6F00', r: 3.5, strokeWidth: 2, stroke: theme.palette.background.paper }}
            activeDot={{ r: 5.5, fill: '#FF6F00', stroke: theme.palette.background.paper, strokeWidth: 2 }}
            isAnimationActive
            animationDuration={700}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
}
