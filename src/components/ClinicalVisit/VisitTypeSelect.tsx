import { VisitType } from '@/types';

export const VISIT_TYPE_OPTIONS: { value: VisitType; label: string }[] = [
  { value: VisitType.NEW, label: 'كشف جديد' },
  { value: VisitType.FOLLOW_UP, label: 'متابعة' },
  { value: VisitType.PREGNANCY_CHECK, label: 'متابعة حمل' },
  { value: VisitType.POST_DELIVERY, label: 'بعد الولادة' },
];

type Props = {
  value: VisitType;
  onChange: (value: VisitType) => void;
  className?: string;
};

/** أزرار بدل select — يتجنب مشكلة نص أبيض غير مرئي في القائمة المنسدلة */
export default function VisitTypeSelect({ value, onChange, className = '' }: Props) {
  return (
    <div
      className={`flex flex-wrap gap-2 ${className}`}
      role="radiogroup"
      aria-label="نوع الكشف"
    >
      {VISIT_TYPE_OPTIONS.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.value)}
            className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
              selected
                ? 'border-primary-600 bg-primary-50 text-primary-900 shadow-sm'
                : 'border-gray-300 bg-white text-gray-800 hover:border-primary-300 hover:bg-gray-50'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
