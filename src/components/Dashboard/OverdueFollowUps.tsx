import { Link } from 'react-router-dom';
import { AlertCircle, Calendar } from 'lucide-react';
import { mockPatients, getPatientVisits } from '@/data/mockData';
import { differenceInDays } from 'date-fns';

export default function OverdueFollowUps() {
  // حساب المرضى المتأخرين في المتابعة
  const overdue = mockPatients
    .map((patient) => {
      const visits = getPatientVisits(patient.id);
      if (visits.length === 0) return null;

      const lastVisit = visits[0];
      const daysOverdue = differenceInDays(new Date(), new Date(lastVisit.date));

      // إذا كانت آخر زيارة منذ أكثر من 30 يوم
      if (daysOverdue > 30) {
        return {
          id: patient.id,
          patientName: patient.name,
          lastVisit: lastVisit.date,
          daysOverdue,
        };
      }
      return null;
    })
    .filter((item) => item !== null)
    .slice(0, 5) as Array<{
    id: string;
    patientName: string;
    lastVisit: string;
    daysOverdue: number;
  }>;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          متابعات متأخرة
        </h2>
        <Link
          to="/app/patients"
          className="text-sm text-primary-600 hover:text-primary-700"
        >
          عرض الكل
        </Link>
      </div>

      <div className="space-y-3">
        {overdue.map((item) => (
          <div
            key={item.id}
            className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{item.patientName}</p>
                <p className="text-sm text-gray-600">
                  آخر زيارة: {item.lastVisit}
                </p>
              </div>
              <div className="flex items-center gap-2 text-red-600">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">
                  متأخر {item.daysOverdue} يوم
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

