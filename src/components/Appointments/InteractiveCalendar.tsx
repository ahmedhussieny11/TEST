import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Clock, User, GripVertical, Baby } from 'lucide-react';
import { Appointment, AppointmentStatus, VisitType, Patient } from '@/types';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from 'react-toastify';

interface InteractiveCalendarProps {
  appointments: Appointment[];
  selectedDate: Date;
  onAppointmentUpdate: (appointmentId: string, newTime: string) => void | Promise<void>;
}

interface AppointmentCardProps {
  appointment: Appointment;
  patient: Patient | undefined;
}

function AppointmentCard({ appointment, patient }: AppointmentCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: appointment.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (!patient) return null;

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.CONFIRMED:
        return 'bg-green-100 border-green-300 text-green-800';
      case AppointmentStatus.IN_PROGRESS:
        return 'bg-blue-100 border-blue-300 text-blue-800';
      case AppointmentStatus.SCHEDULED:
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case AppointmentStatus.COMPLETED:
        return 'bg-gray-100 border-gray-300 text-gray-800';
      case AppointmentStatus.CANCELLED:
        return 'bg-red-100 border-red-300 text-red-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border-2 rounded-lg p-3 mb-2 cursor-move ${getStatusColor(appointment.status)}`}
    >
      <div className="flex items-center gap-2">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="w-4 h-4 text-gray-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <p className="font-medium truncate">{patient.name}</p>
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs flex-wrap">
            <Clock className="w-3 h-3" />
            <span>{appointment.time}</span>
            <span>•</span>
            <span>{getTypeText(appointment.type)}</span>
            {patient.isPregnant && patient.pregnancyWeek != null && (
              <>
                <span>•</span>
                <Baby className="w-3 h-3" />
                <span>أسبوع {patient.pregnancyWeek}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InteractiveCalendar({
  appointments,
  selectedDate,
  onAppointmentUpdate,
}: InteractiveCalendarProps) {
  const navigate = useNavigate();
  const [sortedAppointments, setSortedAppointments] = useState(appointments);

  useEffect(() => {
    setSortedAppointments(appointments);
  }, [appointments]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const appointmentsByHour: Record<string, Appointment[]> = {};
  sortedAppointments.forEach((apt) => {
    const hour = apt.time.split(':')[0];
    if (!appointmentsByHour[hour]) appointmentsByHour[hour] = [];
    appointmentsByHour[hour].push(apt);
  });

  const workingHours = Array.from({ length: 9 }, (_, i) => i + 9);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeIndex = sortedAppointments.findIndex((apt) => apt.id === active.id);
    const overIndex = sortedAppointments.findIndex((apt) => apt.id === over.id);
    if (activeIndex === -1 || overIndex === -1) return;

    const newTime = sortedAppointments[overIndex].time;
    const updated = arrayMove(sortedAppointments, activeIndex, overIndex);
    setSortedAppointments(updated);
    await onAppointmentUpdate(active.id as string, newTime);
    toast.success('تم تحديث وقت الموعد');
  };

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">
        جدول المواعيد — {format(selectedDate, 'EEEE d MMMM', { locale: ar })}
      </h2>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="space-y-4">
          {workingHours.map((hour) => {
            const hourKey = `${hour.toString().padStart(2, '0')}:00`;
            const hourAppointments = appointmentsByHour[hour.toString().padStart(2, '0')] ?? [];

            return (
              <div key={hour} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <h3 className="font-semibold text-lg">{hourKey}</h3>
                  <span className="text-sm text-gray-500">({hourAppointments.length} موعد)</span>
                </div>

                {hourAppointments.length > 0 ? (
                  <SortableContext
                    items={hourAppointments.map((apt) => apt.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {hourAppointments.map((appointment) => (
                        <div
                          key={appointment.id}
                          onClick={() => navigate(`/app/visit/${appointment.id}`)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') navigate(`/app/visit/${appointment.id}`);
                          }}
                          role="button"
                          tabIndex={0}
                        >
                          <AppointmentCard
                            appointment={appointment}
                            patient={appointment.patient as Patient | undefined}
                          />
                        </div>
                      ))}
                    </div>
                  </SortableContext>
                ) : (
                  <p className="text-center py-4 text-gray-400 text-sm">
                    لا توجد مواعيد في هذه الساعة
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </DndContext>
    </div>
  );
}
