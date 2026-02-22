import { Link } from 'react-router-dom';
import { FlaskConical, Clock } from 'lucide-react';
import { getPendingLabTests, getPatientById } from '@/data/mockData';
import { differenceInDays } from 'date-fns';

export default function PendingLabs() {
  const pendingLabs = getPendingLabTests().slice(0, 5);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <FlaskConical className="w-5 h-5" />
          تحاليل معلقة
        </h2>
        <Link
          to="/app/lab-tests"
          className="text-sm text-primary-600 hover:text-primary-700"
        >
          عرض الكل
        </Link>
      </div>

      <div className="space-y-3">
        {pendingLabs.length > 0 ? (
          pendingLabs.map((lab) => {
            const patient = getPatientById(lab.patientId);
            if (!patient) return null;

            const daysAgo = differenceInDays(new Date(), new Date(lab.requestedDate));

            return (
              <div
                key={lab.id}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{patient.name}</p>
                    <p className="text-sm text-gray-600">{lab.testName}</p>
                  </div>
                  <div className="flex items-center gap-2 text-yellow-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs">
                      {daysAgo === 0 ? 'اليوم' : `منذ ${daysAgo} يوم`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">لا توجد تحاليل معلقة</p>
          </div>
        )}
      </div>
    </div>
  );
}

