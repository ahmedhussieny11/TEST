import { Link } from 'react-router-dom';
import { Clock, User, Baby, Play } from 'lucide-react';
import { Appointment, AppointmentStatus, VisitType } from '@/types';

interface WaitingListProps {
  appointments: Appointment[];
  onStartVisit: (appointmentId: string) => void;
}

export default function WaitingList({ appointments, onStartVisit }: WaitingListProps) {
  const waitingAppointments = appointments.filter(
    (apt) =>
      apt.status === AppointmentStatus.CONFIRMED ||
      apt.status === AppointmentStatus.IN_PROGRESS ||
      apt.status === AppointmentStatus.SCHEDULED
  );

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
      case AppointmentStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case AppointmentStatus.CONFIRMED:
        return 'bg-green-100 text-green-800 border-green-300';
      case AppointmentStatus.SCHEDULED:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (waitingAppointments.length === 0) {
    return (
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          قائمة الانتظار
        </h2>
        <div className="text-center py-8">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">لا توجد مرضى في الانتظار</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5" />
          قائمة الانتظار ({waitingAppointments.length})
        </h2>
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {waitingAppointments.map((appointment) => {
          const patient = appointment.patient;
          if (!patient) return null;

          return (
            <div
              key={appointment.id}
              className={`border-2 rounded-lg p-4 hover:shadow-md transition-shadow ${getStatusColor(
                appointment.status
              )}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-gray-900 truncate">
                      {patient.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-1 rounded-full bg-white">
                        {getTypeText(appointment.type)}
                      </span>
                      {patient.isPregnant && (
                        <span className="text-xs px-2 py-1 rounded-full bg-pink-200 text-pink-800 flex items-center gap-1">
                          <Baby className="w-3 h-3" />
                          أسبوع {patient.pregnancyWeek}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{appointment.time}</span>
                </div>
                <div className="flex items-center gap-2">
                {appointment.status === AppointmentStatus.IN_PROGRESS ? (
                  <Link
                    to={`/app/visit/${appointment.id}`}
                      className="btn-primary text-sm py-1.5 px-3 flex items-center gap-1"
                    >
                      <Play className="w-4 h-4" />
                      استمرار الكشف
                    </Link>
                  ) : (
                    <button
                      onClick={() => onStartVisit(appointment.id)}
                      className="btn-primary text-sm py-1.5 px-3 flex items-center gap-1"
                    >
                      <Play className="w-4 h-4" />
                      ابدأ الكشف
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

