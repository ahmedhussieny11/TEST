import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

export default function OverdueFollowUps({ count = 0 }: { count?: number }) {
  return (
    <div className="card border border-gray-100">
      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-amber-500" />
        متابعات متأخرة
      </h3>
      {count > 0 ? (
        <>
          <p className="text-sm text-gray-600">{count} موعد مجدول لم يُنفَّذ بعد موعده</p>
          <Link to="/app/appointments" className="text-primary-600 text-sm mt-2 inline-block">
            عرض المواعيد
          </Link>
        </>
      ) : (
        <p className="text-sm text-gray-500">لا توجد متابعات متأخرة</p>
      )}
    </div>
  );
}
