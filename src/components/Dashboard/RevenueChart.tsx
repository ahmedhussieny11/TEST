import { useMemo } from 'react';
import { useQuery } from 'react-query';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { billingApi } from '@/api/billing';

const MONTH_NAMES = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
];

export default function RevenueChart() {
  const { data: invoices = [] } = useQuery('revenue-chart-invoices', () =>
    billingApi.invoices().then((r) => r.data)
  );

  const data = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const monthDate = subMonths(now, 5 - i);
      const start = startOfMonth(monthDate);
      const end = endOfMonth(monthDate);
      const revenue = invoices
        .filter((inv) => {
          const d = new Date(inv.createdAt);
          return d >= start && d <= end;
        })
        .reduce((sum, inv) => sum + inv.paid, 0);
      return {
        month: MONTH_NAMES[monthDate.getMonth()],
        revenue,
      };
    });
  }, [invoices]);

  const hasData = data.some((d) => d.revenue > 0);

  if (!hasData) {
    return (
      <p className="text-center text-gray-500 py-12 text-sm">
        لا توجد إيرادات مسجّلة بعد — ستظهر هنا عند إصدار فواتير.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip
          formatter={(value: number) => [`${value.toLocaleString()} ج.م`, 'الإيرادات']}
        />
        <Line type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}
