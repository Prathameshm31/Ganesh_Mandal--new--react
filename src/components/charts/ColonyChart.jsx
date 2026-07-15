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

export default function ColonyChart({ data, height = 260 }) {
  const theme = useTheme();

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <Box sx={{ width: '100%', height }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 12, left: 40, bottom: 4 }}
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
            dataKey="colonyName"
            tick={{ fontSize: 10, fill: theme.palette.text.secondary }}
            width={76}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: theme.palette.action.hover }} />
          <Bar
            dataKey="amount"
            fill="#E65100"
            radius={[0, 4, 4, 0]}
            maxBarSize={16}
            isAnimationActive
            animationDuration={600}
            animationEasing="ease-out"
          />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
