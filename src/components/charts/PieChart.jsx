import { Box, Typography, useTheme } from '@mui/material';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const COLORS = ['#FF6F00', '#0288D1', '#2E7D32', '#7B1FA2', '#F57F17'];

function formatIndian(n) {
  if (!n && n !== 0) return '₹0';
  const str = Math.round(n).toString();
  const lastThree = str.slice(-3);
  const rest = str.slice(0, -3);
  const formatted = rest ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree : lastThree;
  return `₹${formatted}`;
}

const CustomTooltip = ({ active, payload }) => {
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
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>{d.mode}</Typography>
        <Typography variant="body2" fontWeight={700} color="primary.main">{formatIndian(d.amount)}</Typography>
        <Typography variant="caption" color="text.secondary">{d.percentage}%</Typography>
      </Box>
    );
  }
  return null;
};

export default function PaymentPieChart({ data, height = 250 }) {
  const theme = useTheme();

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <Box sx={{ width: '100%', height }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={48}
            outerRadius={75}
            dataKey="amount"
            nameKey="mode"
            paddingAngle={2}
            stroke="none"
            isAnimationActive
            animationDuration={600}
            animationEasing="ease-out"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={30}
            formatter={(value) => (
              <Typography variant="caption" color="text.secondary" component="span" sx={{ fontSize: 11.5 }}>
                {value}
              </Typography>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
}
