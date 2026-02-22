import { useState } from 'react';
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
import { Appointment, AppointmentStatus, VisitType } from '@/types';
import { getPatientById } from '@/data/mockData';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

interface InteractiveCalendarProps {
  appointments: Appointment[];
  selectedDate: Date;
  onAppointmentUpdate: (appointmentId: string, newTime: string) => void;
}

interface AppointmentCardProps {
  appointment: Appointment;
  patient: ReturnType<typeof getPatientById>;
}

function AppointmentCard({ appointment, patient }: AppointmentCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: appointment.id });

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
      className={`border-2 rounded-lg p-3 mb-2 cursor-move ${getStatusColor(
        appointment.status
      )}`}
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
          <div className="flex items-center gap-2 mt-1 text-xs">
            <Clock className="w-3 h-3" />
            <span>{appointment.time}</span>
            <span className="px-1">•</span>
            <span>{getTypeText(appointment.type)}</span>
            {patient.isPregnant && (
              <>
                <span className="px-1">•</span>
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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // تجميع المواعيد حسب الساعة
  const appointmentsByHour: Record<string, Appointment[]> = {};
  sortedAppointments.forEach((apt) => {
    const hour = apt.time.split(':')[0];
    if (!appointmentsByHour[hour]) {
      appointmentsByHour[hour] = [];
    }
    appointmentsByHour[hour].push(apt);
  });

  // ساعات العمل (9 صباحاً - 5 مساءً)
  const workingHours = Array.from({ length: 9 }, (_, i) => i + 9);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    // البحث عن الموعدين
    const activeIndex = sortedAppointments.findIndex((apt) => apt.id === activeId);
    const overIndex = sortedAppointments.findIndex((apt) => apt.id === overId);

    if (activeIndex === -1 || overIndex === -1) return;

    // الحصول على الوقت الجديد من الموعد المستهدف
    const newTime = sortedAppointments[overIndex].time;

    // تحديث الموعد
    const updatedAppointments = arrayMove(sortedAppointments, activeIndex, overIndex);
    setSortedAppointments(updatedAppointments);

    // تحديث الوقت
    onAppointmentUpdate(activeId, newTime);
    toast.success('تم تغيير موعد الموعد بنجاح');
  };

  const handleAppointmentClick = (appointmentId: string) => {
    navigate(`/visit/${appointmentId}`);
  };

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">
        جدول المواعيد - {format(selectedDate, 'yyyy-MM-dd')}
      </h2>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-4">
          {workingHours.map((hour) => {
            const hourKey = `${hour.toString().padStart(2, '0')}:00`;
            const hourAppointments = appointmentsByHour[hour] || [];

            return (
              <div key={hour} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <h3 className="font-semibold text-lg">
                      {hourKey} - {hour + 1}:00
                    </h3>
                    <span className="text-sm text-gray-500">
                      ({hourAppointments.length} موعد)
                    </span>
                  </div>
                </div>

                {hourAppointments.length > 0 ? (
                  <SortableContext
                    items={hourAppointments.map((apt) => apt.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {hourAppointments.map((appointment) => {
                        const patient = getPatientById(appointment.patientId);
                        if (!patient) return null;

                        return (
                          <div
                            key={appointment.id}
                            onClick={() => handleAppointmentClick(appointment.id)}
                          >
                            <AppointmentCard
                              appointment={appointment}
                              patient={patient}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </SortableContext>
                ) : (
                  <div className="text-center py-4 text-gray-400 text-sm">
                    لا توجد مواعيد في هذه الساعة
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </DndContext>
    </div>
  );
}

