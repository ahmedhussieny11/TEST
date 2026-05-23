import { Link } from 'react-router-dom';
import { Calendar, Clock } from 'lucide-react';
import { AppointmentStatus, VisitType } from '@/types';
import { Appointment } from '@/types';

interface Props {
  appointments?: Appointment[];
}

export default function TodayAppointments({ appointments: propAppointments }: Props) {
  const appointments = (propAppointments ?? []).slice(0, 5);

  const getTypeText = (type: VisitType) => {
    switch (type) {
      case VisitType.PREGNANCY_CHECK:
        return 'متابعة حمل';
      case VisitType.NEW:
        return 'كشف جديد';
      case VisitType.FOLLOW_UP:
        return 'متابعة';
      case VisitType.POST_DELIVERY:
        return 'بعد الولادة';
      default:
        return type;
    }
  };

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.CONFIRMED:
        return 'bg-green-100 text-green-800';
      case AppointmentStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800';
      case AppointmentStatus.SCHEDULED:
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          مواعيد اليوم
        </h2>
        <Link
          to="/app/appointments"
          className="text-sm text-primary-600 hover:text-primary-700"
        >
          عرض الكل
        </Link>
      </div>

      <div className="space-y-3">
        {appointments.length > 0 ? (
          appointments.map((appointment) => {
            const patient = appointment.patient;
            if (!patient) return null;

            return (
              <Link
                key={appointment.id}
                to={`/app/visit/${appointment.id}`}
                className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <Clock className="w-4 h-4 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{patient.name}</p>
                      <p className="text-sm text-gray-600">
                        {getTypeText(appointment.type)}
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {appointment.time}
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                        appointment.status
                      )}`}
                    >
                      {appointment.status === AppointmentStatus.CONFIRMED && 'مؤكد'}
                      {appointment.status === AppointmentStatus.IN_PROGRESS && 'قيد التنفيذ'}
                      {appointment.status === AppointmentStatus.SCHEDULED && 'مجدول'}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">لا توجد مواعيد اليوم</p>
          </div>
        )}
      </div>
    </div>
  );
}

