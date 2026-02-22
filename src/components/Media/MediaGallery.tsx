import { useState, useEffect } from 'react';
import { X, Upload, Image as ImageIcon, Download } from 'lucide-react';

interface MediaItem {
  id: string;
  type: 'image' | 'document' | 'sonar';
  url: string;
  name: string;
  date: string;
}

interface MediaGalleryProps {
  patientId: string;
  mediaItems?: MediaItem[];
  readOnly?: boolean;
}

export default function MediaGallery({ patientId, mediaItems = [], readOnly }: MediaGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [items, setItems] = useState<MediaItem[]>(mediaItems);

  useEffect(() => {
    setItems(mediaItems);
  }, [mediaItems]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    if (readOnly) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newItem: MediaItem = {
          id: Date.now().toString() + Math.random(),
          type: file.type.startsWith('image/') ? 'image' : 'document',
          url: event.target?.result as string,
          name: file.name,
          date: new Date().toISOString(),
        };
        setItems((prev) => [newItem, ...prev]);
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="space-y-6">
      {/* زر رفع */}
      {!readOnly && (
        <div className="card">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            رفع صور سونار أو ملفات
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">
              اسحب الملفات هنا أو اضغط للرفع
            </p>
            <input
              type="file"
              multiple
              accept="image/*,.pdf"
              onChange={handleFileUpload}
              className="hidden"
              id={`media-upload-${patientId}`}
            />
            <label
              htmlFor={`media-upload-${patientId}`}
              className="btn-secondary inline-block cursor-pointer"
            >
              اختيار ملفات
            </label>
          </div>
        </div>
      )}

      {/* معرض الصور */}
      {items.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="relative group border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => item.type === 'image' && setSelectedImage(item.url)}
            >
              {item.type === 'image' ? (
                <img
                  src={item.url}
                  alt={item.name}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-gray-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Download className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-2">
                <p className="text-xs truncate">{item.name}</p>
                <p className="text-xs text-gray-300">
                  {new Date(item.date).toLocaleDateString('ar-EG')}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">لا توجد صور أو ملفات</p>
        </div>
      )}

      {/* Lightbox للصورة المحددة */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 left-4 bg-white rounded-full p-2 hover:bg-gray-100 z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={selectedImage}
              alt="معاينة"
              className="max-w-full max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}

