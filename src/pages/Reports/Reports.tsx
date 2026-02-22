import { useState } from 'react';
import { DollarSign, Users, TrendingUp, Download } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { mockInvoices, mockAppointments, mockPatients } from '@/data/mockData';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

export default function Reports() {
  const [reportType, setReportType] = useState<'daily' | 'monthly'>('daily');
  const [selectedDate, _setSelectedDate] = useState(new Date());

  // بيانات تجريبية للتقارير
  const dailyData = eachDayOfInterval({
    start: startOfMonth(selectedDate),
    end: endOfMonth(selectedDate),
  }).map((date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayInvoices = mockInvoices.filter(
      (inv) => format(new Date(inv.createdAt), 'yyyy-MM-dd') === dateStr
    );
    const dayAppointments = mockAppointments.filter(
      (apt) => apt.date === dateStr
    );

    return {
      date: format(date, 'dd/MM'),
      revenue: dayInvoices.reduce((sum, inv) => sum + inv.total, 0),
      visits: dayAppointments.filter((apt) => apt.status === 'completed').length,
      appointments: dayAppointments.length,
    };
  });

  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return {
      month: `شهر ${month}`,
      revenue: Math.floor(Math.random() * 50000) + 30000,
      visits: Math.floor(Math.random() * 100) + 50,
    };
  });

  const totalRevenue = mockInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalVisits = mockAppointments.filter((apt) => apt.status === 'completed').length;
  const activePregnancies = mockPatients.filter((p) => p.isPregnant).length;
  const totalPatients = mockPatients.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">التقارير</h1>
          <p className="text-gray-600 mt-1">تقارير مالية وإحصائية</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as 'daily' | 'monthly')}
            className="input-field"
          >
            <option value="daily">تقرير يومي</option>
            <option value="monthly">تقرير شهري</option>
          </select>
          <button className="btn-secondary flex items-center gap-2">
            <Download className="w-5 h-5" />
            تصدير
          </button>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">إجمالي الإيرادات</p>
              <p className="text-2xl font-bold text-green-600">
                {totalRevenue.toLocaleString()} ج.م
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">عدد الزيارات</p>
              <p className="text-2xl font-bold text-blue-600">{totalVisits}</p>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="card bg-pink-50 border-pink-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">حالات حمل نشطة</p>
              <p className="text-2xl font-bold text-pink-600">{activePregnancies}</p>
            </div>
            <Users className="w-8 h-8 text-pink-400" />
          </div>
        </div>

        <div className="card bg-purple-50 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">إجمالي المرضى</p>
              <p className="text-2xl font-bold text-purple-600">{totalPatients}</p>
            </div>
            <Users className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* الرسوم البيانية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* رسم الإيرادات */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            الإيرادات
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            {reportType === 'daily' ? (
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => [`${value.toLocaleString()} ج.م`, 'الإيرادات']}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  name="الإيرادات"
                />
              </LineChart>
            ) : (
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => [`${value.toLocaleString()} ج.م`, 'الإيرادات']}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#0ea5e9" name="الإيرادات" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* رسم عدد الحالات */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            عدد الحالات
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            {reportType === 'daily' ? (
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="visits" fill="#10b981" name="الزيارات" />
                <Bar dataKey="appointments" fill="#f59e0b" name="المواعيد" />
              </BarChart>
            ) : (
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="visits" fill="#10b981" name="الزيارات" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* تقرير تفصيلي */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">التقرير التفصيلي</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  التاريخ
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  الإيرادات
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  عدد الزيارات
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  عدد المواعيد
                </th>
              </tr>
            </thead>
            <tbody>
              {dailyData.slice(-7).map((day, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-4 px-4">{day.date}</td>
                  <td className="py-4 px-4 font-medium">
                    {day.revenue.toLocaleString()} ج.م
                  </td>
                  <td className="py-4 px-4">{day.visits}</td>
                  <td className="py-4 px-4">{day.appointments}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

