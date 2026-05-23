import { Link } from 'react-router-dom';
import { CalendarPlus } from 'lucide-react';

type BookAppointmentButtonProps = {
  to?: string;
  className?: string;
};

export default function BookAppointmentButton({
  to = '/book',
  className = '',
}: BookAppointmentButtonProps) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-l from-emerald-500 via-teal-500 to-primary-600 shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all ${className}`}
    >
      <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/20">
        <CalendarPlus className="w-4 h-4" />
      </span>
      <span>حجز موعد</span>
    </Link>
  );
}
