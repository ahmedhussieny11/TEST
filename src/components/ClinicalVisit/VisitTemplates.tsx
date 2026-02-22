import { FileText, X } from 'lucide-react';
import { VisitType } from '@/types';

export interface VisitTemplate {
  id: string;
  name: string;
  type: VisitType;
  complaint: string;
  examination: string;
  diagnosis: string;
  treatmentPlan: string;
}

export const visitTemplates: VisitTemplate[] = [
  {
    id: '1',
    name: 'متابعة حمل روتينية',
    type: VisitType.PREGNANCY_CHECK,
    complaint: 'متابعة روتينية للحمل',
    examination: 'الضغط: طبيعي، الوزن: طبيعي، نبض الجنين: طبيعي',
    diagnosis: 'حمل طبيعي',
    treatmentPlan: 'متابعة روتينية، فيتامينات، حديد',
  },
  {
    id: '2',
    name: 'تأخر إنجاب',
    type: VisitType.NEW,
    complaint: 'تأخر في الإنجاب',
    examination: 'فحص الحوض: طبيعي، فحص الثدي: طبيعي',
    diagnosis: 'تأخر إنجاب - يحتاج فحوصات',
    treatmentPlan: 'تحاليل هرمونات، سونار، متابعة',
  },
  {
    id: '3',
    name: 'التهابات نسائية',
    type: VisitType.FOLLOW_UP,
    complaint: 'إفرازات وألم',
    examination: 'فحص الحوض: التهابات',
    diagnosis: 'التهاب نسائي',
    treatmentPlan: 'مضاد حيوي، تحاليل، متابعة',
  },
  {
    id: '4',
    name: 'متابعة بعد الولادة',
    type: VisitType.POST_DELIVERY,
    complaint: 'متابعة بعد الولادة',
    examination: 'فحص طبيعي',
    diagnosis: 'حالة طبيعية بعد الولادة',
    treatmentPlan: 'متابعة، نصائح غذائية',
  },
];

interface VisitTemplatesProps {
  onSelectTemplate: (template: VisitTemplate) => void;
  onClose: () => void;
}

export default function VisitTemplates({ onSelectTemplate, onClose }: VisitTemplatesProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6" />
            قوالب الكشف الجاهزة
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visitTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => {
                  onSelectTemplate(template);
                  onClose();
                }}
                className="text-right p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
              >
                <h3 className="font-semibold text-lg mb-2">{template.name}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {template.complaint}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

