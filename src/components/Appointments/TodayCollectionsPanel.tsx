import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { Banknote, UserCheck, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { appointmentsApi } from '@/api/appointments';
import { queueApi } from '@/api/queue';
import { Appointment, AppointmentStatus } from '@/types';
import {
  appointmentNeedsPayment,
  appointmentIsPaid,
  mapApiAppointment,
} from '@/utils/appointments';
import CollectPaymentModal from '@/components/Invoices/CollectPaymentModal';

const statusLabel: Record<string, string> = {
  [AppointmentStatus.SCHEDULED]: 'مجدول',
  [AppointmentStatus.CONFIRMED]: 'مؤكد',
  [AppointmentStatus.IN_PROGRESS]: 'قيد الكشف',
  [AppointmentStatus.COMPLETED]: 'مكتمل',
  [AppointmentStatus.CANCELLED]: 'ملغي',
};

export default function TodayCollectionsPanel() {
  const queryClient = useQueryClient();
  const [payTarget, setPayTarget] = useState<Appointment | null>(null);
  const [checkingIn, setCheckingIn] = useState<string | null>(null);

  const { data: today = [], isLoading } = useQuery('appointments-today-collections', () =>
    appointmentsApi.today().then((r) => r.data.map(mapApiAppointment))
  );

  const sorted = useMemo(
    () =>
      [...today].sort(
        (a, b) =>
          a.time.localeCompare(b.time, 'ar') ||
          a.patient?.name?.localeCompare(b.patient?.name ?? '', 'ar') ||
          0
      ),
    [today]
  );

  const refresh = () => {
    queryClient.invalidateQueries('appointments-today-collections');
    queryClient.invalidateQueries('appointments-today-queue');
    queryClient.invalidateQueries('invoices');
  };

  const handleCheckIn = async (apt: Appointment) => {
    if (appointmentNeedsPayment(apt)) {
      toast.error('يجب تحصيل المبلغ أولاً');
      return;
    }
    setCheckingIn(apt.id);
    try {
      await queueApi.checkIn(apt.id);
      toast.success('تم تسجيل الوصول — صالة الانتظار');
      refresh();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'تعذر تسجيل الوصول');
    } finally {
      setCheckingIn(null);
    }
  };

  if (isLoading) {
    return <p className="text-gray-500 p-4">جاري التحميل...</p>;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
        مسار العمل: <strong>تحصيل</strong> ثم <strong>تسجيل وصول</strong> للطابور. الحجوزات
        الأونلاين تظهر هنا تلقائياً بفاتورة غير مدفوعة.
      </p>

      {sorted.length === 0 ? (
        <p className="text-center text-gray-500 py-12">لا توجد مواعيد اليوم</p>
      ) : (
        <div className="card overflow-x-auto border border-gray-100 p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b text-right text-sm text-gray-500 bg-slate-50">
                <th className="py-3 px-4">الوقت</th>
                <th className="py-3 px-4">المريضة</th>
                <th className="py-3 px-4">الخدمة</th>
                <th className="py-3 px-4">الحجز</th>
                <th className="py-3 px-4">الدفع</th>
                <th className="py-3 px-4">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((apt) => {
                const needsPay = appointmentNeedsPayment(apt);
                const paid = appointmentIsPaid(apt);
                const inQueue = !!apt.queueEntry;
                const inv = apt.invoice;

                return (
                  <tr key={apt.id} className="border-b border-gray-50 hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-medium">{apt.time}</td>
                    <td className="py-3 px-4">
                      <p className="font-medium">{apt.patient?.name}</p>
                      <p className="text-xs text-gray-500">{apt.patient?.phone}</p>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {apt.service?.name ?? apt.notes ?? '—'}
                      {inv && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {inv.total.toLocaleString()} ج.م
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs px-2 py-1 rounded-full bg-primary-50 text-primary-700">
                        {statusLabel[apt.status] ?? apt.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {needsPay ? (
                        <span className="text-xs px-2 py-1 rounded-full bg-red-50 text-red-700">
                          بانتظار الدفع
                        </span>
                      ) : paid && inv ? (
                        <span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-700 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          مدفوع
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-2">
                        {needsPay && inv && (
                          <button
                            type="button"
                            onClick={() => setPayTarget(apt)}
                            className="btn-primary text-xs py-1.5 px-3 inline-flex items-center gap-1"
                          >
                            <Banknote className="w-3.5 h-3.5" />
                            تحصيل
                          </button>
                        )}
                        {!inQueue && (
                          <button
                            type="button"
                            disabled={needsPay || checkingIn === apt.id}
                            onClick={() => handleCheckIn(apt)}
                            className="btn-secondary text-xs py-1.5 px-3 inline-flex items-center gap-1 disabled:opacity-40"
                            title={needsPay ? 'ادفعي أولاً' : undefined}
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            {checkingIn === apt.id ? '...' : 'تسجيل وصول'}
                          </button>
                        )}
                        {inQueue && (
                          <span className="text-xs text-green-600 self-center">في الطابور</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {payTarget?.invoice && (
        <CollectPaymentModal
          invoiceId={payTarget.invoice.id}
          patientName={payTarget.patient?.name ?? 'مريضة'}
          serviceLabel={payTarget.service?.name ?? payTarget.notes}
          total={payTarget.invoice.total}
          remaining={payTarget.invoice.remaining}
          onClose={() => setPayTarget(null)}
          onPaid={refresh}
        />
      )}
    </div>
  );
}
