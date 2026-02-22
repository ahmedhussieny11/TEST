import { useMemo, useState } from 'react';
import { Plus, Search, FlaskConical, Upload, Eye } from 'lucide-react';
import { LabStatus, LabTest } from '@/types';
import { format } from 'date-fns';
import { mockLabTests, getPatientById } from '@/data/mockData';

interface PatientLabs {
  patientId: string;
  name: string;
  phone?: string;
  tests: LabTest[];
}

const getStatusColor = (status: LabStatus) => {
  switch (status) {
    case LabStatus.REQUESTED:
      return 'bg-yellow-100 text-yellow-800';
    case LabStatus.IN_PROGRESS:
      return 'bg-blue-100 text-blue-800';
    case LabStatus.COMPLETED:
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: LabStatus) => {
  switch (status) {
    case LabStatus.REQUESTED:
      return 'مطلوب';
    case LabStatus.IN_PROGRESS:
      return 'قيد التنفيذ';
    case LabStatus.COMPLETED:
      return 'مكتمل';
    default:
      return status;
  }
};

export default function LabTests() {
  const [searchQuery, setSearchQuery] = useState('');

  const grouped = useMemo<PatientLabs[]>(() => {
    const groups: Record<string, PatientLabs> = {};
    mockLabTests.forEach((test) => {
      const patient = getPatientById(test.patientId);
      if (!groups[test.patientId]) {
        groups[test.patientId] = {
          patientId: test.patientId,
          name: patient?.name ?? `مريضة #${test.patientId}`,
          phone: patient?.phone,
          tests: [],
        };
      }
      groups[test.patientId].tests.push(test);
    });
    const q = searchQuery.trim().toLowerCase();
    if (!q) return Object.values(groups);
    return Object.values(groups).filter(
      (group) =>
        group.name.toLowerCase().includes(q) ||
        group.phone?.includes(q) ||
        group.tests.some((test) => test.testName.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">التحاليل</h1>
          <p className="text-gray-600 mt-1">إدارة طلبات ونتائج التحاليل</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          طلب تحليل جديد
        </button>
      </div>

      {/* شريط البحث */}
      <div className="card">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="بحث عن تحليل..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* قائمة التحاليل */}
      <div className="space-y-6">
        {grouped.map((group) => (
          <div key={group.patientId} className="card border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500">المريضة</p>
                <h3 className="text-xl font-semibold text-gray-900">{group.name}</h3>
                {group.phone && <p className="text-sm text-gray-500 mt-1">{group.phone}</p>}
              </div>
              <span className="text-sm text-gray-500">{group.tests.length} تحليل</span>
            </div>

            <div className="space-y-4">
              {group.tests.map((test) => (
                <div
                  key={test.id}
                  className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FlaskConical className="w-5 h-5 text-primary-600" />
                      <div>
                        <p className="font-medium text-gray-900">{test.testName}</p>
                        <p className="text-xs text-gray-500">
                          تاريخ الطلب: {format(new Date(test.requestedDate), 'yyyy-MM-dd')}
                        </p>
                        {test.completedDate && (
                          <p className="text-xs text-gray-400">
                            تاريخ الإكمال: {format(new Date(test.completedDate), 'yyyy-MM-dd')}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(test.status)}`}>
                      {getStatusText(test.status)}
                    </span>
                  </div>

                  {test.results?.value && (
                    <div className="text-sm text-gray-600">
                      <p className="font-medium">النتيجة:</p>
                      <p>{test.results.value}</p>
                      {test.results.notes && (
                        <p className="text-xs text-gray-500 mt-1">{test.results.notes}</p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-3">
                    {test.status === LabStatus.COMPLETED ? (
                      <button className="btn-secondary text-sm py-1 px-3 flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        عرض النتيجة
                      </button>
                    ) : (
                      <button className="btn-secondary text-sm py-1 px-3 flex items-center gap-1">
                        <Upload className="w-4 h-4" />
                        رفع النتيجة
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {grouped.length === 0 && (
          <div className="card text-center py-12 text-gray-500">لا توجد تحاليل</div>
        )}
      </div>
    </div>
  );
}

