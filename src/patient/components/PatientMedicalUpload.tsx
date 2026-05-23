import { useRef, useState } from 'react';
import { FlaskConical, Scan, Upload } from 'lucide-react';
import { toast } from 'react-toastify';
import { useQueryClient } from 'react-query';
import { patientPortalApi } from '@/api/patientPortal';
import PatientUploadGallery from './PatientUploadGallery';

type Category = 'lab' | 'sonar';

export default function PatientMedicalUpload({ patientId }: { patientId: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const [category, setCategory] = useState<Category>('lab');
  const [testName, setTestName] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      toast.error('يرجى رفع صورة أو PDF');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('حجم الملف كبير (الحد 10 ميجا)');
      return;
    }

    setUploading(true);
    try {
      await patientPortalApi.uploadMedical(
        file,
        category,
        testName.trim() || undefined
      );
      toast.success(
        category === 'lab'
          ? 'تم رفع التحليل — سيصل إشعار للطبيب فوراً'
          : 'تم رفع الأشعة — سيصل إشعار للطبيب فوراً'
      );
      setTestName('');
      queryClient.invalidateQueries(['patient-portal', patientId]);
      queryClient.invalidateQueries(['patient-records', patientId]);
      queryClient.invalidateQueries(['patient-my-uploads', patientId]);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string | string[] } } })?.response
          ?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || 'تعذر رفع الملف');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <section className="bg-white rounded-3xl border border-primary-100 p-6 shadow-sm">
      <div className="flex items-start gap-3 mb-4">
        <Upload className="w-6 h-6 text-primary-600 shrink-0 mt-0.5" />
        <div>
          <h2 className="text-lg font-semibold text-gray-900">رفع تحاليل أو أشعة</h2>
          <p className="text-sm text-gray-500 mt-1">
            ارفعي صور النتائج قبل موعد الكشف — يصل إشعار للطبيب فوراً ويظهر في ملفك عند
            الزيارة القادمة
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setCategory('lab')}
          className={`flex-1 py-2.5 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 ${
            category === 'lab'
              ? 'border-primary-600 bg-primary-50 text-primary-700'
              : 'border-gray-200 text-gray-600'
          }`}
        >
          <FlaskConical className="w-4 h-4" />
          تحليل
        </button>
        <button
          type="button"
          onClick={() => setCategory('sonar')}
          className={`flex-1 py-2.5 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 ${
            category === 'sonar'
              ? 'border-primary-600 bg-primary-50 text-primary-700'
              : 'border-gray-200 text-gray-600'
          }`}
        >
          <Scan className="w-4 h-4" />
          أشعة / سونار
        </button>
      </div>

      <label className="block text-sm font-medium text-gray-700 mb-1">
        {category === 'lab' ? 'اسم التحليل (اختياري)' : 'نوع الأشعة (اختياري)'}
      </label>
      <input
        type="text"
        value={testName}
        onChange={(e) => setTestName(e.target.value)}
        className="input-field mb-4"
        placeholder={
          category === 'lab' ? 'مثال: صورة دم كاملة' : 'مثال: سونار 4D'
        }
      />

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
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        <Upload className="w-5 h-5" />
        {uploading ? 'جاري الرفع...' : 'اختيار صورة ورفعها'}
      </button>
      <p className="text-xs text-gray-500 mt-2 text-center">صورة أو PDF — حتى 10 ميجا</p>

      <PatientUploadGallery patientId={patientId} />
    </section>
  );
}
