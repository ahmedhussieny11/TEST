import { Calendar, Clock, Baby, ClipboardList } from 'lucide-react';
import { PatientCardData } from '@/types';

interface PatientCardProps {
  data: PatientCardData;
  highlight?: boolean;
}

export default function PatientCard({ data, highlight }: PatientCardProps) {
  return (
    <div
      className={`border rounded-3xl p-5 text-right transition-shadow ${
        highlight ? 'border-primary-400 bg-primary-50/60 shadow-lg' : 'border-gray-200 bg-white'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-gray-500">رقم الملف</p>
          <p className="text-sm font-semibold text-gray-900">{data.fileNumber}</p>
        </div>
        <span
          className={`text-xs px-3 py-1 rounded-full ${
            data.status === 'waiting'
              ? 'bg-yellow-100 text-yellow-800'
              : data.status === 'checked'
              ? 'bg-green-100 text-green-800'
              : 'bg-blue-100 text-blue-800'
          }`}
        >
          {data.status === 'waiting' ? 'في الانتظار' : data.status === 'checked' ? 'تم الكشف' : 'موعد جديد'}
        </span>
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-2">{data.name}</h3>

      <div className="space-y-2 text-sm text-gray-600">
        {data.pregnancyWeek && (
          <div className="flex items-center gap-2 justify-end">
            <Baby className="w-4 h-4 text-pink-500" />
            <span>أسبوع الحمل {data.pregnancyWeek}</span>
          </div>
        )}

        {data.nextAppointment && (
          <>
            <div className="flex items-center gap-2 justify-end">
              <Calendar className="w-4 h-4 text-primary-500" />
              <span>{data.nextAppointment.date}</span>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <Clock className="w-4 h-4 text-primary-500" />
              <span>{data.nextAppointment.time}</span>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <ClipboardList className="w-4 h-4 text-primary-500" />
              <span>{data.nextAppointment.service}</span>
            </div>
          </>
        )}
      </div>

      {data.notes && <p className="text-xs text-gray-500 mt-4">{data.notes}</p>}
    </div>
  );
}

