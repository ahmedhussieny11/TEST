import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Clock, CalendarDays } from 'lucide-react';
import { Appointment, AppointmentStatus } from '@/types';
import { appointmentDateKey } from '@/utils/appointments';

interface AppointmentCalendarProps {
  appointments: Appointment[];
  appointmentsByDate: Record<string, number>;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export default function AppointmentCalendar({
  appointments,
  appointmentsByDate,
  selectedDate,
  onDateSelect,
}: AppointmentCalendarProps) {
  const selectedDateStr = appointmentDateKey(selectedDate);
  const dayAppointments = appointments
    .filter((apt) => appointmentDateKey(apt.date) === selectedDateStr)
    .sort((a, b) => a.time.localeCompare(b.time));

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.CONFIRMED:
        return 'border-green-500 bg-green-50';
      case AppointmentStatus.IN_PROGRESS:
        return 'border-blue-500 bg-blue-50';
      case AppointmentStatus.SCHEDULED:
        return 'border-yellow-500 bg-yellow-50';
      case AppointmentStatus.COMPLETED:
        return 'border-gray-400 bg-gray-50';
      case AppointmentStatus.CANCELLED:
        return 'border-red-300 bg-red-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  const getStatusText = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.CONFIRMED:
        return 'مؤكد';
      case AppointmentStatus.IN_PROGRESS:
        return 'قيد التنفيذ';
      case AppointmentStatus.SCHEDULED:
        return 'مجدول';
      case AppointmentStatus.COMPLETED:
        return 'مكتمل';
      case AppointmentStatus.CANCELLED:
        return 'ملغي';
      default:
        return status;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <div className="card overflow-hidden p-4">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary-600" />
            اختاري التاريخ
          </h3>
          <div className="clinic-calendar-wrapper">
            <Calendar
              onChange={(value) => {
                if (value instanceof Date) onDateSelect(value);
              }}
              value={selectedDate}
              locale="ar-EG"
              calendarType="gregory"
              className="clinic-calendar w-full border-0"
              tileContent={({ date, view }) => {
                if (view !== 'month') return null;
                const key = appointmentDateKey(date);
                const count = appointmentsByDate[key];
                if (!count) return null;
                return (
                  <span className="clinic-calendar-dot" title={`${count} موعد`}>
                    {count}
                  </span>
                );
              }}
            />
          </div>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="card min-h-[320px]">
          <h2 className="text-xl font-semibold mb-4">
            مواعيد {format(selectedDate, 'EEEE d MMMM yyyy', { locale: ar })}
          </h2>

          {dayAppointments.length > 0 ? (
            <div className="space-y-3">
              {dayAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className={`p-4 border-r-4 rounded-lg ${getStatusColor(apt.status)}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Clock className="w-5 h-5 text-gray-600 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {apt.patient?.name ?? 'مريضة'}
                        </p>
                        <p className="text-sm text-gray-600">{apt.time}</p>
                        {apt.notes && (
                          <p className="text-xs text-gray-500 mt-0.5">{apt.notes}</p>
                        )}
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 bg-white rounded shrink-0">
                      {getStatusText(apt.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CalendarDays className="w-14 h-14 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">لا توجد مواعيد في هذا التاريخ</p>
              <p className="text-sm text-gray-400 mt-1">
                الحجوزات من العيادة ومن صفحة /book تظهر هنا تلقائياً
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
