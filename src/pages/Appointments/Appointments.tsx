import { useMemo, useState } from 'react';
import { Plus, Calendar, User, Search, Filter, Grid, Banknote } from 'lucide-react';
import TodayCollectionsPanel from '@/components/Appointments/TodayCollectionsPanel';
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';
import { useQuery, useQueryClient } from 'react-query';
import AppointmentCalendar from '@/components/Appointments/AppointmentCalendar';
import AppointmentList from '@/components/Appointments/AppointmentList';
import BookAppointmentModal from '@/components/Appointments/BookAppointmentModal';
import InteractiveCalendar from '@/components/Appointments/InteractiveCalendar';
import { appointmentsApi } from '@/api/appointments';
import { appointmentDateKey, mapApiAppointment } from '@/utils/appointments';

export default function Appointments() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<'list' | 'calendar' | 'interactive' | 'collections'>(
    'collections'
  );
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');

  const rangeFrom = format(startOfMonth(subMonths(selectedDate, 1)), 'yyyy-MM-dd');
  const rangeTo = format(endOfMonth(addMonths(selectedDate, 2)), 'yyyy-MM-dd');

  const { data: appointments = [], isLoading, refetch } = useQuery(
    ['appointments', rangeFrom, rangeTo],
    () =>
      appointmentsApi.list(rangeFrom, rangeTo).then((r) => r.data.map(mapApiAppointment)),
    { refetchOnWindowFocus: true }
  );

  const selectedDateStr = appointmentDateKey(selectedDate);

  const filteredAppointments = useMemo(() => {
    const dayAppointments = appointments.filter(
      (apt) => appointmentDateKey(apt.date) === selectedDateStr
    );
    const q = searchQuery.trim().toLowerCase();
    if (!q) return dayAppointments;
    return dayAppointments.filter((apt) => {
      const name = apt.patient?.name?.toLowerCase() ?? '';
      const phone = apt.patient?.phone ?? '';
      return name.includes(q) || phone.includes(q) || apt.id.includes(q);
    });
  }, [appointments, selectedDateStr, searchQuery]);

  const appointmentsByDate = useMemo(() => {
    const map: Record<string, number> = {};
    for (const apt of appointments) {
      const key = appointmentDateKey(apt.date);
      map[key] = (map[key] ?? 0) + 1;
    }
    return map;
  }, [appointments]);

  const handleAppointmentUpdate = async (appointmentId: string, newTime: string) => {
    await appointmentsApi.update(appointmentId, { time: newTime });
    queryClient.invalidateQueries(['appointments']);
  };

  const handleBookSuccess = () => {
    queryClient.invalidateQueries(['appointments']);
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">المواعيد</h1>
          <p className="text-gray-600 mt-1">إدارة مواعيد المرضى — من قاعدة البيانات</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-1 bg-white">
            <button
              type="button"
              onClick={() => setView('collections')}
              className={`px-3 py-1.5 rounded text-sm flex items-center gap-1 ${
                view === 'collections'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Banknote className="w-4 h-4" />
              تحصيل اليوم
            </button>
            <button
              type="button"
              onClick={() => setView('interactive')}
              className={`px-3 py-1.5 rounded text-sm flex items-center gap-1 ${
                view === 'interactive'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Grid className="w-4 h-4" />
              تفاعلي
            </button>
            <button
              type="button"
              onClick={() => setView('list')}
              className={`px-3 py-1.5 rounded text-sm flex items-center gap-1 ${
                view === 'list'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <User className="w-4 h-4" />
              قائمة
            </button>
            <button
              type="button"
              onClick={() => setView('calendar')}
              className={`px-3 py-1.5 rounded text-sm flex items-center gap-1 ${
                view === 'calendar'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Calendar className="w-4 h-4" />
              تقويم
            </button>
          </div>
          <button
            type="button"
            onClick={() => setShowBookModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            حجز موعد جديد
          </button>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="بحث عن مريضة أو رقم موعد..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>
          <button type="button" className="btn-secondary flex items-center gap-2">
            <Filter className="w-5 h-5" />
            فلترة
          </button>
        </div>
      </div>

      {view === 'collections' ? (
        <TodayCollectionsPanel />
      ) : isLoading ? (
        <p className="text-center text-gray-500 py-12">جاري تحميل المواعيد...</p>
      ) : view === 'interactive' ? (
        <InteractiveCalendar
          appointments={filteredAppointments}
          selectedDate={selectedDate}
          onAppointmentUpdate={handleAppointmentUpdate}
        />
      ) : view === 'list' ? (
        <AppointmentList appointments={appointments} searchQuery={searchQuery} />
      ) : (
        <AppointmentCalendar
          appointments={appointments}
          appointmentsByDate={appointmentsByDate}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
        />
      )}

      {showBookModal && (
        <BookAppointmentModal
          onClose={() => setShowBookModal(false)}
          selectedDate={selectedDate}
          onSuccess={handleBookSuccess}
        />
      )}
    </div>
  );
}
