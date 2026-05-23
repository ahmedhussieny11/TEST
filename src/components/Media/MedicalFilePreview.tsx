import { FileText } from 'lucide-react';

type Props = {
  filePath: string;
  title?: string;
  alt?: string;
  className?: string;
  maxHeight?: string;
};

export function isPdfPath(path: string) {
  return path.toLowerCase().endsWith('.pdf');
}

export default function MedicalFilePreview({
  filePath,
  title,
  alt,
  className = '',
  maxHeight = 'max-h-48',
}: Props) {
  if (isPdfPath(filePath)) {
    return (
      <a
        href={filePath}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center gap-3 p-4 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 ${className}`}
      >
        <FileText className="w-8 h-8 text-primary-600 shrink-0" />
        <span className="text-sm text-primary-700 font-medium">
          {title || 'عرض ملف PDF'}
        </span>
      </a>
    );
  }

  return (
    <a
      href={filePath}
      target="_blank"
      rel="noopener noreferrer"
      className={`block rounded-xl overflow-hidden border border-gray-200 bg-gray-50 ${className}`}
    >
      <img
        src={filePath}
        alt={alt || title || 'صورة طبية'}
        className={`w-full h-auto ${maxHeight} object-contain mx-auto`}
      />
    </a>
  );
}
