import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { month: 'يناير', revenue: 40000 },
  { month: 'فبراير', revenue: 42000 },
  { month: 'مارس', revenue: 38000 },
  { month: 'أبريل', revenue: 45000 },
  { month: 'مايو', revenue: 48000 },
  { month: 'يونيو', revenue: 45000 },
];

export default function RevenueChart() {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip
          formatter={(value: number) => [`${value.toLocaleString()} ج.م`, 'الإيرادات']}
        />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#0ea5e9"
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

