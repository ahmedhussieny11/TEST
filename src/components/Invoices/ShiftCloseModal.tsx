import { useState } from 'react';
import { useQuery } from 'react-query';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import { shiftsApi } from '@/api/shifts';

interface Props {
  onClose: () => void;
}

export default function ShiftCloseModal({ onClose }: Props) {
  const [actualCash, setActualCash] = useState(0);
  const [notes, setNotes] = useState('');

  const { data: shift, refetch } = useQuery('open-shift', () =>
    shiftsApi.getOpen().then((r) => r.data)
  );

  const { data: report } = useQuery(
    ['shift-report', shift?.id],
    () => shiftsApi.dailyReport(shift!.id).then((r) => r.data),
    { enabled: !!shift?.id }
  );

  const openShift = async () => {
    try {
      await shiftsApi.open(0);
      refetch();
      toast.success('تم فتح الوردية');
    } catch {
      toast.error('تعذر فتح الوردية');
    }
  };

  const closeShift = async () => {
    if (!shift?.id) return;
    try {
      await shiftsApi.close(shift.id, actualCash, notes);
      toast.success('تم تقفيل اليومية');
      onClose();
    } catch {
      toast.error('تعذر إغلاق الوردية');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">تقفيل اليومية</h2>
          <button type="button" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {!shift ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">لا توجد وردية مفتوحة</p>
            <button type="button" onClick={openShift} className="btn-primary w-full">
              فتح وردية جديدة
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {report && (
              <div className="bg-slate-50 rounded-lg p-4 text-sm space-y-1">
                <p>عدد الفواتير: {report.invoiceCount}</p>
                <p>إجمالي الإيرادات: {report.totalRevenue?.toLocaleString()} ج.م</p>
                <p>رصيد الافتتاح: {shift.openingBalance} ج.م</p>
              </div>
            )}
            <div>
              <label className="text-sm text-gray-600">النقد الفعلي في الخزينة</label>
              <input
                type="number"
                className="input-field mt-1"
                value={actualCash}
                onChange={(e) => setActualCash(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">ملاحظات</label>
              <textarea
                className="input-field mt-1"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <button type="button" onClick={closeShift} className="btn-primary w-full">
              إغلاق الوردية وتقفيل اليوم
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
