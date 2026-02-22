import { Link } from 'react-router-dom';
import { Clock, User, Calendar, Phone, Eye } from 'lucide-react';
import { AppointmentStatus, VisitType } from '@/types';
import { format } from 'date-fns';
import { mockAppointments, getPatientById } from '@/data/mockData';

interface AppointmentListProps {
  searchQuery: string;
}

const getStatusColor = (status: AppointmentStatus) => {
  switch (status) {
    case AppointmentStatus.CONFIRMED:
      return 'bg-green-100 text-green-800';
    case AppointmentStatus.IN_PROGRESS:
      return 'bg-blue-100 text-blue-800';
    case AppointmentStatus.SCHEDULED:
      return 'bg-yellow-100 text-yellow-800';
    case AppointmentStatus.COMPLETED:
      return 'bg-gray-100 text-gray-800';
    case AppointmentStatus.CANCELLED:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
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

const getTypeText = (type: VisitType) => {
  switch (type) {
    case VisitType.NEW:
      return 'كشف جديد';
    case VisitType.FOLLOW_UP:
      return 'متابعة';
    case VisitType.PREGNANCY_CHECK:
      return 'متابعة حمل';
    case VisitType.POST_DELIVERY:
      return 'بعد الولادة';
    default:
      return type;
  }
};

export default function AppointmentList({ searchQuery }: AppointmentListProps) {
  const appointments = mockAppointments
    .map((apt) => ({
      ...apt,
      patient: apt.patient ?? getPatientById(apt.patientId),
    }))
    .sort(
      (a, b) =>
        new Date(`${a.date}T${a.time}`).getTime() -
        new Date(`${b.date}T${b.time}`).getTime()
    );

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredAppointments = appointments.filter((apt) => {
    if (!normalizedQuery) return true;
    const patientName = apt.patient?.name?.toLowerCase() ?? '';
    const patientPhone = apt.patient?.phone ?? '';
    return (
      patientName.includes(normalizedQuery) ||
      patientPhone.includes(normalizedQuery) ||
      apt.id.includes(normalizedQuery)
    );
  });

  return (
    <div className="card">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                المريضة
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                التاريخ والوقت
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                النوع
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                الحالة
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                إجراءات
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.map((appointment) => (
              <tr
                key={appointment.id}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {appointment.patient?.name}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {appointment.patient?.phone}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(appointment.date), 'yyyy-MM-dd')}</span>
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{appointment.time}</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className="text-sm text-gray-700">
                    {getTypeText(appointment.type)}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span
                    className={`text-xs px-3 py-1 rounded-full ${getStatusColor(
                      appointment.status
                    )}`}
                  >
                    {getStatusText(appointment.status)}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <Link
                    to={`/app/visit/${appointment.id}`}
                    className="btn-secondary text-sm py-1 px-3 flex items-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    عرض
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAppointments.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">لا توجد مواعيد</p>
        </div>
      )}
    </div>
  );
}

