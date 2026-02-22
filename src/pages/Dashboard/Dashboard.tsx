import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { UserRole, AppointmentStatus } from '@/types';
import { Calendar, Users, FlaskConical, Baby, AlertCircle, TrendingUp, Bell } from 'lucide-react';
import StatsCard from '@/components/Dashboard/StatsCard';
import TodayAppointments from '@/components/Dashboard/TodayAppointments';
import PendingLabs from '@/components/Dashboard/PendingLabs';
import OverdueFollowUps from '@/components/Dashboard/OverdueFollowUps';
import RevenueChart from '@/components/Dashboard/RevenueChart';
import WaitingList from '@/components/Doctor/WaitingList';
import {
  getTodayAppointments,
  getWaitingPatients,
  getPendingLabTests,
  mockPatients,
  mockAppointments,
} from '@/data/mockData';
import { toast } from 'react-toastify';

export default function Dashboard() {
  const { user, hasPermission } = useAuthStore();
  const navigate = useNavigate();
  const [waitingAppointments, setWaitingAppointments] = useState(getWaitingPatients());

  const todayAppointments = getTodayAppointments();
  const pendingLabs = getPendingLabTests();
  const activePregnancies = mockPatients.filter((p) => p.isPregnant).length;

  const stats = {
    todayAppointments: todayAppointments.length,
    completedVisits: mockAppointments.filter(
      (apt) => apt.status === AppointmentStatus.COMPLETED
    ).length,
    pendingLabs: pendingLabs.length,
    activePregnancies,
    overdueFollowUps: 3,
    monthlyRevenue: 45000,
  };

  const handleStartVisit = (appointmentId: string) => {
    // تحديث حالة الموعد إلى IN_PROGRESS
    const updatedAppointments = waitingAppointments.map((apt) =>
      apt.id === appointmentId
        ? { ...apt, status: AppointmentStatus.IN_PROGRESS }
        : apt
    );
    setWaitingAppointments(updatedAppointments);
    
    // إشعار صوتي (محاكاة)
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('مريضة جديدة');
      utterance.lang = 'ar';
      speechSynthesis.speak(utterance);
    }
    
    toast.success('تم بدء الكشف');
    navigate(`/visit/${appointmentId}`);
  };

  const handleNextPatient = () => {
    const nextPatient = waitingAppointments.find(
      (apt) => apt.status === AppointmentStatus.CONFIRMED
    );
    if (nextPatient) {
      handleStartVisit(nextPatient.id);
    } else {
      toast.info('لا توجد مريضة في الانتظار');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          مرحباً، {user?.name}
        </h1>
        <p className="text-gray-600 mt-1">
          نظرة عامة على عيادة د. محمد عبدالحكيم اليوم
        </p>
      </div>

      {hasPermission([UserRole.DOCTOR, UserRole.ADMIN]) && (
        <>
          {/* زر نداء المريضة التالية */}
          {waitingAppointments.length > 0 && (
            <div className="flex items-center justify-end mb-4">
              <button
                onClick={handleNextPatient}
                className="btn-primary flex items-center gap-2 text-lg py-3 px-6"
              >
                <Bell className="w-5 h-5" />
                نداء المريضة التالية
              </button>
            </div>
          )}

          {/* إحصائيات سريعة */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="مواعيد اليوم"
              value={stats.todayAppointments}
              icon={Calendar}
              color="blue"
              change="+2 من أمس"
            />
            <StatsCard
              title="زيارات مكتملة"
              value={stats.completedVisits}
              icon={Users}
              color="green"
            />
            <StatsCard
              title="تحاليل معلقة"
              value={stats.pendingLabs}
              icon={FlaskConical}
              color="yellow"
            />
            <StatsCard
              title="حالات حمل نشطة"
              value={stats.activePregnancies}
              icon={Baby}
              color="pink"
            />
          </div>

          {/* تنبيهات التحاليل الجاهزة */}
          {pendingLabs.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
              <FlaskConical className="w-6 h-6 text-blue-600" />
              <div className="flex-1">
                <p className="font-medium text-blue-900">
                  {pendingLabs.length} تحليل جاهز للمراجعة
                </p>
                <p className="text-sm text-blue-700">
                  هناك تحاليل تحتاج لمراجعة وإضافة النتائج
                </p>
              </div>
            </div>
          )}

          {/* تنبيهات */}
          {stats.overdueFollowUps > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-900">
                  {stats.overdueFollowUps} متابعة متأخرة
                </p>
                <p className="text-sm text-yellow-700">
                  هناك حالات تحتاج متابعة عاجلة
                </p>
              </div>
            </div>
          )}

          {/* التخطيط الرئيسي: قائمة الانتظار + المحتوى */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* قائمة الانتظار */}
            <div className="lg:col-span-1">
              <WaitingList
                appointments={waitingAppointments}
                onStartVisit={handleStartVisit}
              />
            </div>

            {/* المحتوى الرئيسي */}
            <div className="lg:col-span-2 space-y-6">
              {/* المبيعات الشهرية */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">الإيرادات الشهرية</h2>
                  <div className="flex items-center gap-2 text-green-600">
                    <TrendingUp className="w-5 h-5" />
                    <span className="font-medium">{stats.monthlyRevenue.toLocaleString()} ج.م</span>
                  </div>
                </div>
                <RevenueChart />
              </div>

              {/* مواعيد اليوم */}
              <TodayAppointments />

              {/* قوائم سريعة */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PendingLabs />
                <OverdueFollowUps />
              </div>
            </div>
          </div>
        </>
      )}

      {hasPermission(UserRole.RECEPTION) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="مواعيد اليوم"
            value={stats.todayAppointments}
            icon={Calendar}
            color="blue"
          />
          <StatsCard
            title="فواتير اليوم"
            value={8}
            icon={TrendingUp}
            color="green"
          />
          <StatsCard
            title="إجمالي اليوم"
            value={stats.monthlyRevenue}
            icon={TrendingUp}
            color="purple"
            isCurrency
          />
        </div>
      )}
    </div>
  );
}

