import { useEffect, useState, useCallback } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import { io } from 'socket.io-client';
import { queueApi } from '@/api/queue';
import { appointmentsApi } from '@/api/appointments';
import { toast } from 'react-toastify';
import { Clock, User, Stethoscope, CheckCircle, RefreshCw } from 'lucide-react';
import { mapApiAppointment, appointmentNeedsPayment } from '@/utils/appointments';
import { Appointment } from '@/types';

type QueueStatus = 'waiting_room' | 'in_exam' | 'done';

interface QueueItem {
  id: string;
  status: QueueStatus;
  appointment: {
    id: string;
    time: string;
    patient?: { id: string; name: string; phone: string; isPregnant?: boolean };
    doctor?: { name: string };
  };
}

const statusConfig: Record<
  QueueStatus,
  { label: string; color: string; icon: typeof Clock }
> = {
  waiting_room: {
    label: 'صالة الانتظار',
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: Clock,
  },
  in_exam: {
    label: 'داخل الكشف',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Stethoscope,
  },
  done: {
    label: 'انتهت',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
  },
};

const SOCKET_URL =
  import.meta.env.VITE_WS_URL ||
  (import.meta.env.DEV ? 'http://localhost:4000' : window.location.origin);

export default function LiveQueueTracker() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  const { data: todayAppointments = [] } = useQuery('appointments-today-queue', () =>
    appointmentsApi.today().then((r) => r.data.map(mapApiAppointment))
  );

  const load = useCallback(async () => {
    try {
      const { data } = await queueApi.today();
      setQueue(data);
    } catch (err: unknown) {
      const offline = axios.isAxiosError(err) && !err.response;
      toast.error(
        offline
          ? 'تعذر الاتصال بالسيرفر — شغّلي الـ Backend ثم حدّثي الصفحة'
          : 'تعذر تحميل الطابور'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const socket = io(`${SOCKET_URL}/queue`, { transports: ['websocket'] });
    socket.on('queue.updated', load);
    return () => {
      socket.disconnect();
    };
  }, [load]);

  const updateStatus = async (id: string, status: QueueStatus) => {
    try {
      await queueApi.updateStatus(id, status);
      await load();
      toast.success('تم تحديث الحالة');
    } catch {
      toast.error('تعذر تحديث الحالة');
    }
  };

  const checkIn = async (appointmentId: string) => {
    try {
      await queueApi.checkIn(appointmentId);
      await load();
      toast.success('تمت إضافة المريضة لصالة الانتظار');
    } catch {
      toast.error('تعذر تسجيل الوصول');
    }
  };

  const columns: QueueStatus[] = ['waiting_room', 'in_exam', 'done'];
  const waitingCount = queue.filter((q) => q.status === 'waiting_room').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">تتبع الطابور الحي</h1>
          <p className="text-sm text-gray-500 mt-1">
            التحصيل أولاً من «تحصيل اليوم» — ثم تسجيل الوصول للطابور
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            load();
          }}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          تحديث
        </button>
      </div>

      {!loading && waitingCount === 0 && todayAppointments.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900">
          يوجد {todayAppointments.length} موعد اليوم. اضغطي «تحديث» — أو أعدي تشغيل الـ Backend إن
          لزم.
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">جاري التحميل...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {columns.map((col) => {
            const cfg = statusConfig[col];
            const items = queue.filter((q) => q.status === col);
            const Icon = cfg.icon;
            return (
              <div key={col} className="card border border-gray-100">
                <div
                  className={`flex items-center gap-2 mb-4 px-3 py-2 rounded-lg border ${cfg.color}`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-semibold">{cfg.label}</span>
                  <span className="mr-auto text-sm">({items.length})</span>
                </div>
                <div className="space-y-3 min-h-[120px]">
                  {items.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-6">لا يوجد</p>
                  ) : (
                    items.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-lg border border-gray-100 bg-slate-50"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-primary-600" />
                          <span className="font-medium text-gray-900">
                            {item.appointment.patient?.name}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">
                          {item.appointment.time} — {item.appointment.doctor?.name}
                        </p>
                        {col === 'waiting_room' && (
                          <button
                            type="button"
                            onClick={() => updateStatus(item.id, 'in_exam')}
                            className="btn-primary text-xs w-full py-1.5"
                          >
                            بدء الكشف
                          </button>
                        )}
                        {col === 'in_exam' && (
                          <button
                            type="button"
                            onClick={() => updateStatus(item.id, 'done')}
                            className="btn-secondary text-xs w-full py-1.5"
                          >
                            إنهاء
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {todayAppointments.length > 0 && (
        <div className="card border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-3">كل مواعيد اليوم</h2>
          <div className="space-y-2">
            {todayAppointments.map((apt: Appointment) => {
                const inQueue = queue.some((q) => q.appointment.id === apt.id);
                const needsPay = appointmentNeedsPayment(apt);
                return (
                  <div
                    key={apt.id}
                    className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-slate-50 border border-gray-100"
                  >
                    <span className="text-sm">
                      <strong>{apt.patient?.name ?? 'مريضة'}</strong> — {apt.time}
                      {needsPay && (
                        <span className="text-red-600 mr-2 text-xs">(بانتظار الدفع)</span>
                      )}
                      {!needsPay && apt.invoice && (
                        <span className="text-green-600 mr-2 text-xs">(مدفوع)</span>
                      )}
                      {inQueue && <span className="text-green-600 mr-2">(في الطابور)</span>}
                    </span>
                    {!inQueue && (
                      <button
                        type="button"
                        disabled={needsPay}
                        onClick={() => checkIn(apt.id)}
                        className="text-xs btn-primary py-1 px-3 disabled:opacity-40"
                        title={needsPay ? 'حصّلي المبلغ من تحصيل اليوم أولاً' : undefined}
                      >
                        تسجيل وصول
                      </button>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
