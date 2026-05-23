import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useAuthStore } from '@/store/authStore';
import { UserRole, Appointment, AppointmentStatus } from '@/types';
import { Calendar, Users, FlaskConical, Baby, AlertCircle, TrendingUp, Bell } from 'lucide-react';
import StatsCard from '@/components/Dashboard/StatsCard';
import TodayAppointments from '@/components/Dashboard/TodayAppointments';
import PendingLabs from '@/components/Dashboard/PendingLabs';
import OverdueFollowUps from '@/components/Dashboard/OverdueFollowUps';
import RevenueChart from '@/components/Dashboard/RevenueChart';
import WaitingList from '@/components/Doctor/WaitingList';
import { dashboardApi } from '@/api/dashboard';
import { appointmentsApi } from '@/api/appointments';
import { queueApi } from '@/api/queue';
import { toast } from 'react-toastify';

export default function Dashboard() {
  const { user, hasPermission } = useAuthStore();
  const navigate = useNavigate();

  const { data: todayAppointments = [] } = useQuery('appointments-today', () =>
    appointmentsApi.today().then((r) => r.data)
  );

  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
    refetch: refetchStats,
  } = useQuery('dashboard-summary', () =>
    dashboardApi.summary().then((r) => r.data),
    { staleTime: 60_000, retry: 1 }
  );

  const displayStats = stats ?? {
    todayAppointments: todayAppointments.length,
    completedVisits: 0,
    pendingLabs: 0,
    activePregnancies: 0,
    overdueFollowUps: 0,
    monthlyRevenue: 0,
  };

  const { data: queueEntries = [], refetch: refetchQueue } = useQuery('queue-today', () =>
    queueApi.today().then((r) => r.data)
  );

  const waitingAppointments: Appointment[] = queueEntries
    .filter((q: { status: string }) => q.status !== 'done')
    .map((q: { appointment: Appointment; status: string }) => ({
      ...q.appointment,
      status:
        q.status === 'in_exam'
          ? AppointmentStatus.IN_PROGRESS
          : AppointmentStatus.CONFIRMED,
    }));

  const handleStartVisit = async (appointmentId: string) => {
    try {
      const entry = queueEntries.find(
        (q: { appointment: { id: string }; id: string }) => q.appointment.id === appointmentId
      );
      if (entry) {
        await queueApi.updateStatus(entry.id, 'in_exam');
        await refetchQueue();
      }
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance('مريضة جديدة');
        utterance.lang = 'ar';
        speechSynthesis.speak(utterance);
      }
      toast.success('تم بدء الكشف');
      navigate(`/app/visit/${appointmentId}`);
    } catch {
      toast.error('تعذر بدء الكشف');
    }
  };

  const handleNextPatient = () => {
    const next = waitingAppointments.find(
      (apt) => apt.status === AppointmentStatus.CONFIRMED
    );
    if (next) handleStartVisit(next.id);
    else toast.info('لا توجد مريضة في الانتظار');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">مرحباً، {user?.name}</h1>
        <p className="text-sm text-gray-500 mt-1">نظرة عامة على العيادة اليوم</p>
      </div>

      {statsError && (
        <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-center justify-between gap-3">
          <p className="text-sm text-red-800">
            تعذر تحميل إحصائيات لوحة التحكم — تأكدي أن الخادم يعمل (npm run start:dev في backend)
          </p>
          <button type="button" onClick={() => refetchStats()} className="btn-secondary text-sm shrink-0">
            إعادة المحاولة
          </button>
        </div>
      )}

      {statsLoading && hasPermission([UserRole.DOCTOR, UserRole.ADMIN]) && (
        <p className="text-gray-500 text-sm">جاري تحميل الإحصائيات...</p>
      )}

      {hasPermission([UserRole.DOCTOR, UserRole.ADMIN]) && (
        <>
          {waitingAppointments.length > 0 && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleNextPatient}
                className="btn-primary flex items-center gap-2"
              >
                <Bell className="w-5 h-5" />
                نداء المريضة التالية
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard title="مواعيد اليوم" value={displayStats.todayAppointments} icon={Calendar} color="blue" />
            <StatsCard title="زيارات مكتملة" value={displayStats.completedVisits} icon={Users} color="green" />
            <StatsCard title="تحاليل معلقة" value={displayStats.pendingLabs} icon={FlaskConical} color="yellow" />
            <StatsCard title="حالات حمل نشطة" value={displayStats.activePregnancies} icon={Baby} color="pink" />
          </div>

          {displayStats.pendingLabs > 0 && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-center gap-3">
              <FlaskConical className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-blue-900">{displayStats.pendingLabs} تحليل يحتاج متابعة</p>
            </div>
          )}

          {displayStats.overdueFollowUps > 0 && (
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <p className="text-sm text-amber-900">{displayStats.overdueFollowUps} متابعة متأخرة</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <WaitingList
                appointments={waitingAppointments}
                onStartVisit={(id) => handleStartVisit(id)}
              />
            </div>
            <div className="lg:col-span-2 space-y-6">
              <div className="card border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">الإيرادات الشهرية</h2>
                  <span className="text-green-600 font-medium flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    {displayStats.monthlyRevenue.toLocaleString()} ج.م
                  </span>
                </div>
                <RevenueChart />
              </div>
              <TodayAppointments appointments={todayAppointments} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PendingLabs />
                <OverdueFollowUps count={displayStats.overdueFollowUps} />
              </div>
            </div>
          </div>
        </>
      )}

      {hasPermission(UserRole.RECEPTION) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard title="مواعيد اليوم" value={displayStats.todayAppointments} icon={Calendar} color="blue" />
          <StatsCard title="إيرادات الشهر" value={displayStats.monthlyRevenue} icon={TrendingUp} color="green" isCurrency />
        </div>
      )}
    </div>
  );
}
