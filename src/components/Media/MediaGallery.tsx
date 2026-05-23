import { useCallback, useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { io } from 'socket.io-client';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import { filesApi } from '@/api/files';

const SOCKET_URL =
  import.meta.env.VITE_WS_URL ||
  (import.meta.env.DEV ? 'http://localhost:4000' : window.location.origin);

interface MediaGalleryProps {
  patientId: string;
  readOnly?: boolean;
}

export default function MediaGallery({ patientId, readOnly }: MediaGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: items = [], refetch } = useQuery(
    ['attachments', patientId],
    () => filesApi.byPatient(patientId).then((r) => r.data)
  );

  const refresh = useCallback(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    const socket = io(`${SOCKET_URL}/files`, { transports: ['websocket'] });
    socket.on('files.updated', (payload: { patientId?: string }) => {
      if (!payload?.patientId || payload.patientId === patientId) {
        refresh();
        toast.info('صورة جديدة — تم التحديث', { autoClose: 2000 });
      }
    });
    return () => {
      socket.disconnect();
    };
  }, [patientId, refresh]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || readOnly) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        await filesApi.upload(file, patientId);
      }
      toast.success('تم رفع الملفات');
      refetch();
    } catch {
      toast.error('تعذر رفع الملف');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {!readOnly && (
        <div className="card border border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            رفع صور سونار أو تقارير
          </label>
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <input
              type="file"
              multiple
              accept="image/*,.pdf"
              onChange={handleFileUpload}
              disabled={uploading}
              className="text-sm"
            />
            {uploading && <p className="text-sm text-gray-500 mt-2">جاري الرفع...</p>}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(items as { id: string; fileName: string; filePath: string; type: string }[]).map(
          (item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedImage(item.filePath)}
              className="card border border-gray-100 p-3 text-center hover:shadow-md transition-shadow"
            >
              <ImageIcon className="w-8 h-8 text-primary-500 mx-auto mb-2" />
              <p className="text-xs text-gray-700 truncate">{item.fileName}</p>
            </button>
          )
        )}
      </div>

      {selectedImage && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <button
            type="button"
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 left-4 text-white"
          >
            <X className="w-8 h-8" />
          </button>
          {selectedImage.match(/\.(jpg|jpeg|png|webp)/i) ? (
            <img src={selectedImage} alt="" className="max-h-[90vh] max-w-full rounded-lg" />
          ) : (
            <a href={selectedImage} target="_blank" rel="noreferrer" className="text-white underline">
              فتح الملف
            </a>
          )}
        </div>
      )}
    </div>
  );
}
