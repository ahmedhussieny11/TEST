import { useState } from 'react';
import { X, Banknote } from 'lucide-react';
import { toast } from 'react-toastify';
import { billingApi } from '@/api/billing';

type Props = {
  invoiceId: string;
  patientName: string;
  serviceLabel?: string;
  total: number;
  remaining: number;
  onClose: () => void;
  onPaid: () => void;
};

export default function CollectPaymentModal({
  invoiceId,
  patientName,
  serviceLabel,
  total,
  remaining,
  onClose,
  onPaid,
}: Props) {
  const [saving, setSaving] = useState(false);

  const handlePayFull = async () => {
    if (remaining <= 0) {
      toast.info('الفاتورة مدفوعة بالفعل');
      return;
    }
    setSaving(true);
    try {
      await billingApi.collectPayment(invoiceId, remaining, 'cash');
      toast.success('تم التحصيل بنجاح');
      onPaid();
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string | string[] } } })?.response?.data
          ?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || 'تعذر التحصيل');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-sm w-full border border-gray-100">
        <div className="flex justify-between items-center px-5 py-4 border-b">
          <h2 className="text-lg font-bold">تحصيل المبلغ</h2>
          <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <p className="text-sm text-gray-500">المريضة</p>
            <p className="font-semibold text-gray-900">{patientName}</p>
            {serviceLabel && (
              <p className="text-sm text-gray-600 mt-1">{serviceLabel}</p>
            )}
          </div>

          <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">الإجمالي</span>
              <span className="font-medium">{total.toLocaleString()} ج.م</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-primary-700">
              <span>المتبقي</span>
              <span>{remaining.toLocaleString()} ج.م</span>
            </div>
          </div>

          <button
            type="button"
            disabled={saving || remaining <= 0}
            onClick={handlePayFull}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Banknote className="w-5 h-5" />
            {saving ? 'جاري التحصيل...' : `دفع كامل (${remaining.toLocaleString()} ج.م) — نقدي`}
          </button>

          <p className="text-xs text-gray-500 text-center">
            بعد الدفع يمكن تسجيل وصول المريضة للطابور
          </p>
        </div>
      </div>
    </div>
  );
}
