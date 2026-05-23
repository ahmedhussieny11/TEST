import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Camera, CheckCircle2, Upload } from 'lucide-react';
import { toast } from 'react-toastify';
import { quickCaptureApi } from '@/api/quickCapture';

export default function MobileCapturePage() {
  const { code } = useParams<{ code: string }>();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [lastPreview, setLastPreview] = useState<string | null>(null);

  const { data: info, error } = useQuery(
    ['capture-info', code],
    () => quickCaptureApi.getSessionInfo(code!).then((r) => r.data),
    { enabled: !!code, retry: false }
  );

  useEffect(() => {
    if (error) toast.error('رمز غير صالح أو منتهي');
  }, [error]);

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !code) return;
    setUploading(true);
    try {
      await quickCaptureApi.upload(code, file);
      setLastPreview(URL.createObjectURL(file));
      toast.success('تم رفع الصورة لملف المريضة');
    } catch {
      toast.error('تعذر الرفع');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <header className="p-4 text-center border-b border-gray-700">
        <h1 className="text-lg font-bold">رفع سونار سريع</h1>
        {info && (
          <p className="text-sm text-gray-400 mt-1">
            ملف: <span className="text-white">{info.patientName}</span>
          </p>
        )}
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
        {lastPreview && (
          <div className="relative w-full max-w-sm">
            <img
              src={lastPreview}
              alt="آخر صورة"
              className="w-full rounded-xl border-2 border-green-500"
            />
            <span className="absolute top-2 right-2 bg-green-600 text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              تم الرفع
            </span>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleCapture}
        />

        <button
          type="button"
          disabled={uploading || !info}
          onClick={() => inputRef.current?.click()}
          className="w-full max-w-sm py-6 rounded-2xl bg-primary-500 hover:bg-primary-600 disabled:opacity-50 flex flex-col items-center gap-3 text-lg font-bold shadow-lg"
        >
          {uploading ? (
            <>
              <Upload className="w-10 h-10 animate-pulse" />
              جاري الرفع...
            </>
          ) : (
            <>
              <Camera className="w-12 h-12" />
              تصوير ورفع فوري
            </>
          )}
        </button>

        <p className="text-xs text-gray-500 text-center max-w-xs">
          افتحي الكاميرا، صوّري السونار، وستظهر الصورة مباشرة على شاشة الكشف في العيادة
        </p>
      </div>
    </div>
  );
}
