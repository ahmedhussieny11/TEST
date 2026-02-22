import { useState } from 'react';
import { Plus, Calendar, User, Search, Filter, Grid } from 'lucide-react';
import { format } from 'date-fns';
import AppointmentCalendar from '@/components/Appointments/AppointmentCalendar';
import AppointmentList from '@/components/Appointments/AppointmentList';
import BookAppointmentModal from '@/components/Appointments/BookAppointmentModal';
import InteractiveCalendar from '@/components/Appointments/InteractiveCalendar';
import { mockAppointments } from '@/data/mockData';

export default function Appointments() {
  const [view, setView] = useState<'list' | 'calendar' | 'interactive'>('interactive');
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [appointments, setAppointments] = useState(mockAppointments);

  // فلترة المواعيد حسب التاريخ المحدد
  const filteredAppointments = appointments.filter((apt) => {
    const aptDate = format(new Date(apt.date), 'yyyy-MM-dd');
    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
    return aptDate === selectedDateStr;
  });

  const handleAppointmentUpdate = (appointmentId: string, newTime: string) => {
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === appointmentId ? { ...apt, time: newTime, updatedAt: new Date().toISOString() } : apt
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">المواعيد</h1>
          <p className="text-gray-600 mt-1">إدارة مواعيد المرضى</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-1">
            <button
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
            onClick={() => setShowBookModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            حجز موعد جديد
          </button>
        </div>
      </div>

      {/* شريط البحث والفلترة */}
      <div className="card">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="بحث عن مريضة أو رقم موعد..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>
          <button className="btn-secondary flex items-center gap-2">
            <Filter className="w-5 h-5" />
            فلترة
          </button>
        </div>
      </div>

      {/* عرض المواعيد */}
      {view === 'interactive' ? (
        <InteractiveCalendar
          appointments={filteredAppointments}
          selectedDate={selectedDate}
          onAppointmentUpdate={handleAppointmentUpdate}
        />
      ) : view === 'list' ? (
        <AppointmentList searchQuery={searchQuery} />
      ) : (
        <AppointmentCalendar
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
        />
      )}

      {/* نافذة حجز موعد */}
      {showBookModal && (
        <BookAppointmentModal
          onClose={() => setShowBookModal(false)}
          selectedDate={selectedDate}
        />
      )}
    </div>
  );
}

