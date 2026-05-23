import { useRef, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { format } from 'date-fns';
import { FlaskConical, Scan, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import { patientPortalApi, PatientUploadItem } from '@/api/patientPortal';
import MedicalFilePreview from '@/components/Media/MedicalFilePreview';

export default function PatientUploadGallery({ patientId }: { patientId: string }) {
  const queryClient = useQueryClient();
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [replacing, setReplacing] = useState<PatientUploadItem | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const { data: items = [], isLoading } = useQuery(
    ['patient-my-uploads', patientId],
    () => patientPortalApi.myUploads().then((r) => r.data),
    { enabled: !!patientId }
  );

  const refresh = () => {
    queryClient.invalidateQueries(['patient-my-uploads', patientId]);
    queryClient.invalidateQueries(['patient-portal', patientId]);
    queryClient.invalidateQueries(['patient-records', patientId]);
  };

  const handleDelete = async (item: PatientUploadItem) => {
    if (!window.confirm('حذف هذا الملف؟')) return;
    setBusyId(item.id);
    try {
      if (item.kind === 'lab' && item.labId) {
        await patientPortalApi.deleteLabUpload(item.labId);
      } else if (item.attachmentId) {
        await patientPortalApi.deleteAttachment(item.attachmentId);
      }
      toast.success('تم الحذف');
      refresh();
    } catch {
      toast.error('تعذر الحذف');
    } finally {
      setBusyId(null);
    }
  };

  const handleReplacePick = (item: PatientUploadItem) => {
    setReplacing(item);
    replaceInputRef.current?.click();
  };

  const handleReplaceFile = async (file: File | undefined) => {
    if (!file || !replacing) return;
    setBusyId(replacing.id);
    try {
      if (replacing.kind === 'lab' && replacing.labId) {
        await patientPortalApi.replaceLabUpload(replacing.labId, file);
      } else if (replacing.attachmentId) {
        await patientPortalApi.replaceAttachment(replacing.attachmentId, file);
      }
      toast.success('تم استبدال الصورة');
      refresh();
    } catch {
      toast.error('تعذر استبدال الملف');
    } finally {
      setBusyId(null);
      setReplacing(null);
      if (replaceInputRef.current) replaceInputRef.current.value = '';
    }
  };

  if (isLoading) {
    return <p className="text-sm text-gray-500 py-2">جاري تحميل الملفات...</p>;
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 space-y-4">
      <h3 className="text-sm font-semibold text-gray-800">ملفاتك المرفوعة</h3>
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => handleReplaceFile(e.target.files?.[0])}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-gray-200 p-3 bg-gray-50/50 space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                {item.kind === 'lab' ? (
                  <FlaskConical className="w-4 h-4 text-primary-600 shrink-0" />
                ) : (
                  <Scan className="w-4 h-4 text-primary-600 shrink-0" />
                )}
                <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
              </div>
              <span className="text-xs text-gray-400 shrink-0">
                {format(new Date(item.createdAt), 'yyyy-MM-dd')}
              </span>
            </div>
            <MedicalFilePreview filePath={item.filePath} title={item.title} maxHeight="max-h-40" />
            <div className="flex gap-2">
              <button
                type="button"
                disabled={busyId === item.id}
                onClick={() => handleReplacePick(item)}
                className="flex-1 btn-secondary text-xs py-2 inline-flex items-center justify-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                تغيير
              </button>
              <button
                type="button"
                disabled={busyId === item.id}
                onClick={() => handleDelete(item)}
                className="flex-1 text-xs py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 inline-flex items-center justify-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                حذف
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
