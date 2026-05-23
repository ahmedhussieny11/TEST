import { useRef, useState } from 'react';
import { Upload, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import { useQueryClient } from 'react-query';
import { patientPortalApi } from '@/api/patientPortal';

type LabRow = {
  id: string;
  testName: string;
  status: string;
  attachment?: string | null;
};

const canUpload = (status: string) =>
  status === 'requested' || status === 'in_progress';

export default function PatientLabUpload({
  lab,
  patientId,
}: {
  lab: LabRow;
  patientId: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      toast.error('يرجى رفع صورة أو ملف PDF');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('حجم الملف كبير (الحد 10 ميجا)');
      return;
    }
    setUploading(true);
    try {
      await patientPortalApi.uploadLabImage(lab.id, file);
      toast.success('تم رفع صورة التحليل — سيراجعها الطبيب');
      queryClient.invalidateQueries(['patient-records', patientId]);
      queryClient.invalidateQueries(['patient-my-uploads', patientId]);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string | string[] } } })?.response?.data
          ?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || 'تعذر رفع الملف');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  if (lab.status === 'completed') {
    return null;
  }

  if (lab.attachment) {
    const src = lab.attachment;
    const isPdf = src.toLowerCase().endsWith('.pdf');
    return (
      <div className="mt-3 space-y-2">
        <p className="text-sm text-green-700 flex items-center gap-1">
          <CheckCircle2 className="w-4 h-4" />
          تم رفع الصورة — بانتظار مراجعة الطبيب
        </p>
        {!isPdf ? (
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-xl overflow-hidden border border-gray-200 max-w-xs"
          >
            <img src={src} alt={lab.testName} className="w-full h-auto object-cover" />
          </a>
        ) : (
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-primary-600 hover:underline"
          >
            <ImageIcon className="w-4 h-4" />
            عرض الملف المرفوع
          </a>
        )}
        {canUpload(lab.status) && (
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="text-sm text-primary-600 hover:underline disabled:opacity-50"
          >
            استبدال الصورة
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
    );
  }

  if (!canUpload(lab.status)) return null;

  return (
    <div className="mt-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-50 text-primary-700 hover:bg-primary-100 text-sm font-medium transition-colors disabled:opacity-50"
      >
        <Upload className="w-4 h-4" />
        {uploading ? 'جاري الرفع...' : 'رفع صورة التحليل'}
      </button>
      <p className="text-xs text-gray-500 mt-1">صورة أو PDF — حتى 10 ميجا</p>
    </div>
  );
}
