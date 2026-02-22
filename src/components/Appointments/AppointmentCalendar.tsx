import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';
import { AppointmentStatus } from '@/types';
import { mockAppointments, getPatientById } from '@/data/mockData';

interface AppointmentCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export default function AppointmentCalendar({
  selectedDate,
  onDateSelect,
}: AppointmentCalendarProps) {
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const appointments = mockAppointments
    .filter((apt) => apt.date === selectedDateStr)
    .map((apt) => ({
      ...apt,
      patientName: getPatientById(apt.patientId)?.name ?? 'مريضة',
    }))
    .sort((a, b) => a.time.localeCompare(b.time));

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.CONFIRMED:
        return 'border-green-500 bg-green-50';
      case AppointmentStatus.IN_PROGRESS:
        return 'border-blue-500 bg-blue-50';
      case AppointmentStatus.SCHEDULED:
        return 'border-yellow-500 bg-yellow-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <div className="card">
          <Calendar
            onChange={(date) => onDateSelect(date as Date)}
            value={selectedDate}
            locale="ar"
            className="w-full border-0"
          />
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">
            مواعيد {format(selectedDate, 'yyyy-MM-dd')}
          </h2>

          {appointments.length > 0 ? (
            <div className="space-y-3">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className={`p-4 border-r-4 rounded-lg ${getStatusColor(apt.status)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900">{apt.patientName}</p>
                        <p className="text-sm text-gray-600">{apt.time}</p>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 bg-white rounded">
                      {apt.status === AppointmentStatus.CONFIRMED && 'مؤكد'}
                      {apt.status === AppointmentStatus.IN_PROGRESS && 'قيد التنفيذ'}
                      {apt.status === AppointmentStatus.SCHEDULED && 'مجدول'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">لا توجد مواعيد في هذا التاريخ</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

