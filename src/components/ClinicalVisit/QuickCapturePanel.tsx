import { useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import { Camera, Copy, RefreshCw, Smartphone } from 'lucide-react';
import { toast } from 'react-toastify';
import { quickCaptureApi } from '@/api/quickCapture';

type Props = {
  patientId: string;
  visitId?: string;
  patientName?: string;
};

export default function QuickCapturePanel({ patientId, visitId, patientName }: Props) {
  const [session, setSession] = useState<{
    code: string;
    expiresAt: string;
    patientName?: string;
  } | null>(null);

  const createSession = useMutation(
    () => quickCaptureApi.createSession(patientId, visitId).then((r) => r.data),
    {
      onSuccess: (data) => {
        setSession({
          code: data.code,
          expiresAt: data.expiresAt,
          patientName: data.patientName,
        });
        void toast.success('تم إنشاء جلسة الرفع');
      },
      onError: () => {
        void toast.error('تعذر إنشاء جلسة الرفع');
      },
    }
  );

  useEffect(() => {
    createSession.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId, visitId]);

  const captureUrl =
    typeof window !== 'undefined' && session
      ? `${window.location.origin}/capture/${session.code}`
      : '';

  const qrUrl = session
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(captureUrl)}`
    : '';

  const copyLink = () => {
    if (!captureUrl) return;
    navigator.clipboard.writeText(captureUrl);
    toast.success('تم نسخ الرابط');
  };

  return (
    <div className="rounded-xl border border-primary-200 bg-primary-50/50 p-4 space-y-4">
      <div className="flex items-start gap-3">
        <Smartphone className="w-6 h-6 text-primary-600 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-gray-900">رفع سريع من موبايل العيادة</h3>
          <p className="text-sm text-gray-600 mt-1">
            افتحي الرابط أو امسحي QR من هاتف المساعدة — الصور تظهر فوراً في ملف{' '}
            {patientName ?? 'المريضة'}
          </p>
        </div>
      </div>

      {createSession.isLoading && (
        <p className="text-sm text-gray-500">جاري تجهيز الرمز...</p>
      )}

      {session && (
        <div className="flex flex-wrap gap-4 items-start">
          <div className="bg-white p-2 rounded-xl border border-gray-200 shrink-0">
            <img src={qrUrl} alt="QR" className="w-[180px] h-[180px]" />
          </div>
          <div className="flex-1 min-w-[200px] space-y-3">
            <div>
              <p className="text-xs text-gray-500">رمز الجلسة</p>
              <p className="text-3xl font-black tracking-widest text-primary-700">
                {session.code}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">رابط الموبايل</p>
              <p className="text-xs break-all bg-white border rounded-lg p-2 dir-ltr text-left">
                {captureUrl}
              </p>
              <button
                type="button"
                onClick={copyLink}
                className="mt-2 text-sm text-primary-600 inline-flex items-center gap-1"
              >
                <Copy className="w-4 h-4" />
                نسخ الرابط
              </button>
            </div>
            <button
              type="button"
              onClick={() => createSession.mutate()}
              className="btn-secondary text-sm inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              رمز جديد
            </button>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 flex items-center gap-1">
        <Camera className="w-3.5 h-3.5" />
        الصور المرفوعة تظهر تلقائياً في تبويب الوسائط أدناه
      </p>
    </div>
  );
}
