interface TimeSlotButtonProps {
  time: string;
  remaining: number;
  isSelected?: boolean;
  disabled?: boolean;
  onSelect?: (time: string) => void;
}

export default function TimeSlotButton({
  time,
  remaining,
  isSelected,
  disabled,
  onSelect,
}: TimeSlotButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect?.(time)}
      className={`w-full border-2 rounded-2xl p-4 text-right transition-all ${
        disabled
          ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
          : isSelected
          ? 'border-primary-500 bg-primary-50 shadow-lg'
          : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50/50'
      }`}
    >
      <p className="text-lg font-semibold text-gray-900">{time}</p>
      <p className="text-sm text-gray-600">
        {disabled ? 'مكتمل' : remaining > 0 ? `متاح (${remaining} من 4)` : 'مكتمل'}
      </p>
    </button>
  );
}

