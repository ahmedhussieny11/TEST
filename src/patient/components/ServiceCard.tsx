import { PatientService } from '@/data/mockData';
import { VisitType } from '@/types';

interface ServiceCardProps {
  service: PatientService;
  isActive?: boolean;
  onSelect?: (service: PatientService) => void;
}

export default function ServiceCard({ service, isActive, onSelect }: ServiceCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(service)}
      className={`text-right border rounded-2xl p-5 transition-all text-start ${
        isActive
          ? 'border-primary-500 bg-primary-50 shadow-lg'
          : 'border-gray-200 hover:border-primary-200 hover:bg-primary-50/50'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
        <span className="text-primary-600 font-bold">{service.price} ج.م</span>
      </div>
      <p className="text-sm text-gray-600 mb-4">{service.description}</p>
      <div className="text-xs text-gray-500">
        مدة الجلسة: {service.duration} دقيقة • نوع الخدمة:{' '}
        {service.type === VisitType.PREGNANCY_CHECK ? 'متابعة حمل' : 'كشف / استشارة'}
      </div>
    </button>
  );
}

