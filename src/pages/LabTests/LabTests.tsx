import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, FlaskConical, Upload, Eye, User } from 'lucide-react';
import { LabStatus, LabTest } from '@/types';
import { format } from 'date-fns';
import { useQuery, useQueryClient } from 'react-query';
import { useSearchParams } from 'react-router-dom';
import { labsApi } from '@/api/labs';
import NewLabRequestModal from '@/components/Labs/NewLabRequestModal';
import UploadLabResultModal from '@/components/Labs/UploadLabResultModal';
import MedicalFilePreview from '@/components/Media/MedicalFilePreview';

interface PatientLabs {
  patientId: string;
  name: string;
  phone?: string;
  tests: (LabTest & { patient?: { name: string; phone: string } })[];
}

const getStatusColor = (status: LabStatus | string) => {
  switch (status) {
    case LabStatus.REQUESTED:
    case 'requested':
      return 'bg-yellow-100 text-yellow-800';
    case LabStatus.IN_PROGRESS:
    case 'in_progress':
      return 'bg-blue-100 text-blue-800';
    case LabStatus.COMPLETED:
    case 'completed':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: LabStatus | string) => {
  switch (status) {
    case LabStatus.REQUESTED:
    case 'requested':
      return 'مطلوب';
    case LabStatus.IN_PROGRESS:
    case 'in_progress':
      return 'قيد التنفيذ';
    case LabStatus.COMPLETED:
    case 'completed':
      return 'مكتمل';
    default:
      return String(status);
  }
};

export default function LabTests() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const filterPatientId = searchParams.get('patientId') ?? undefined;

  const [searchQuery, setSearchQuery] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [uploadLab, setUploadLab] = useState<
    (LabTest & { patient?: { name: string; phone: string } }) | null
  >(null);

  type LabRow = LabTest & { patient?: { name: string; phone: string } };

  const { data: labTests = [], isLoading } = useQuery(
    ['lab-tests', filterPatientId],
    () => labsApi.list({ patientId: filterPatientId }).then((r) => r.data as LabRow[])
  );

  const refresh = () => queryClient.invalidateQueries(['lab-tests']);

  const grouped = useMemo<PatientLabs[]>(() => {
    const groups: Record<string, PatientLabs> = {};
    labTests.forEach((test) => {
      const patient = test.patient;
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
  }, [searchQuery, labTests]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">التحاليل</h1>
          <p className="text-gray-600 mt-1">إدارة طلبات ونتائج التحاليل</p>
        </div>
        <button
          type="button"
          onClick={() => setShowNewModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          طلب تحليل جديد
        </button>
      </div>

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

      {isLoading ? (
        <p className="text-gray-500">جاري التحميل...</p>
      ) : (
        <div className="space-y-6">
          {grouped.map((group) => (
            <div key={group.patientId} className="card border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500">المريضة</p>
                  <h3 className="text-xl font-semibold text-gray-900">{group.name}</h3>
                  {group.phone && <p className="text-sm text-gray-500 mt-1">{group.phone}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    to={`/app/patients/${group.patientId}`}
                    className="btn-secondary text-sm py-1.5 px-3 inline-flex items-center gap-1"
                  >
                    <User className="w-4 h-4" />
                    ملف المريضة
                  </Link>
                  <span className="text-sm text-gray-500">{group.tests.length} تحليل</span>
                </div>
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
                            تاريخ الطلب:{' '}
                            {format(new Date(test.requestedDate), 'yyyy-MM-dd')}
                          </p>
                          {test.completedDate && (
                            <p className="text-xs text-gray-400">
                              تاريخ الإكمال:{' '}
                              {format(new Date(test.completedDate), 'yyyy-MM-dd')}
                            </p>
                          )}
                        </div>
                      </div>
                      <span
                        className={`text-xs px-3 py-1 rounded-full ${getStatusColor(test.status)}`}
                      >
                        {getStatusText(test.status)}
                      </span>
                    </div>

                    {test.attachment && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs text-blue-700 font-medium flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          مرفوع من المريضة
                        </p>
                        <MedicalFilePreview
                          filePath={test.attachment}
                          title={test.testName}
                          maxHeight="max-h-56"
                        />
                      </div>
                    )}

                    {test.results?.value && (
                      <div className="text-sm text-gray-600">
                        <p className="font-medium">النتيجة:</p>
                        <p>
                          {test.results.value}
                          {test.results.unit ? ` ${test.results.unit}` : ''}
                        </p>
                        {test.results.normalRange && (
                          <p className="text-xs text-gray-500">
                            المعدل الطبيعي: {test.results.normalRange}
                          </p>
                        )}
                        {test.results.notes && (
                          <p className="text-xs text-gray-500 mt-1">{test.results.notes}</p>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-3">
                      <button
                        type="button"
                        onClick={() => setUploadLab(test)}
                        className="btn-secondary text-sm py-1 px-3 flex items-center gap-1"
                      >
                        {String(test.status) === LabStatus.COMPLETED ||
                        String(test.status) === 'completed' ? (
                          <>
                            <Eye className="w-4 h-4" />
                            {test.results?.value ? 'تعديل النتيجة' : 'إكمال النتيجة'}
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            رفع النتيجة
                          </>
                        )}
                      </button>
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
      )}

      {showNewModal && (
        <NewLabRequestModal
          defaultPatientId={filterPatientId}
          onClose={() => setShowNewModal(false)}
          onCreated={refresh}
        />
      )}

      {uploadLab && (
        <UploadLabResultModal
          lab={uploadLab}
          onClose={() => setUploadLab(null)}
          onSaved={refresh}
        />
      )}
    </div>
  );
}
