import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useQuery } from 'react-query';
import { usePatientAuthStore } from '../store/patientAuthStore';
import { patientPortalApi } from '@/api/patientPortal';
import MediaGallery from '@/components/Media/MediaGallery';
import PatientLabUpload from './PatientLabUpload';
import PatientMedicalUpload from '../components/PatientMedicalUpload';
import { normalizeMedications } from '@/utils/medications';
import { format } from 'date-fns';

export default function MyRecords() {
  const navigate = useNavigate();
  const { patient, isAuthenticated } = usePatientAuthStore();

  const { data: portalData, isLoading } = useQuery(
    ['patient-records', patient?.id],
    () => patientPortalApi.me().then((r) => r.data),
    { enabled: !!patient?.id }
  );

  useEffect(() => {
    if (!isAuthenticated || !patient) {
      navigate('/patient/login');
    }
  }, [isAuthenticated, patient, navigate]);

  if (!patient) return null;

  const prescriptions = portalData?.prescriptions ?? [];
  const labTests = portalData?.labTests ?? [];
  const pregnancies = portalData?.pregnancies ?? [];
  const activePregnancy = pregnancies[0];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-6 space-y-6">
        <header className="space-y-3">
          <Link
            to="/patient/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-xl transition-colors w-fit"
          >
            <ArrowRight className="w-4 h-4" />
            رجوع للوحة المتابعة
          </Link>
          <div>
            <h1 className="text-3xl font-bold">سجلك الطبي</h1>
            <p className="text-gray-500 mt-1">راجعي الروشتات، التحاليل، وصور السونار</p>
          </div>
        </header>

        {isLoading && <p className="text-gray-500">جاري التحميل...</p>}

        <PatientMedicalUpload patientId={patient.id} />

        {activePregnancy && (
          <section className="bg-white rounded-3xl border border-pink-100 p-6">
            <p className="text-sm text-gray-500">متابعة الحمل</p>
            <h2 className="text-2xl font-semibold text-pink-600">
              الأسبوع {activePregnancy.currentWeek ?? '—'}
            </h2>
            {activePregnancy.dueDate && (
              <p className="text-sm text-gray-500 mt-2">
                موعد الولادة المتوقع:{' '}
                {format(new Date(activePregnancy.dueDate), 'yyyy-MM-dd')}
              </p>
            )}
          </section>
        )}

        <section className="bg-white rounded-3xl border border-gray-100 p-6">
          <h2 className="text-xl font-semibold mb-4">الروشتات</h2>
          {prescriptions.length > 0 ? (
            <div className="space-y-4">
              {prescriptions.map(
                (prescription: {
                  id: string;
                  createdAt: string;
                  medications: unknown;
                }) => {
                  const meds = normalizeMedications(prescription.medications);
                  return (
                    <div key={prescription.id} className="border border-gray-200 rounded-2xl p-4">
                      <p className="text-sm text-gray-500 mb-2">
                        التاريخ:{' '}
                        {format(new Date(prescription.createdAt), 'yyyy-MM-dd')}
                      </p>
                      <ul className="list-disc list-inside text-gray-700 space-y-1">
                        {meds.map((med) => (
                          <li key={med.id}>
                            {med.name} - {med.dosage} - {med.frequency}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                }
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-6">لا توجد روشتات محفوظة</p>
          )}
        </section>

        <section className="bg-white rounded-3xl border border-gray-100 p-6">
          <h2 className="text-xl font-semibold mb-4">التحاليل</h2>
          {labTests.length > 0 ? (
            <div className="space-y-4">
              {labTests.map(
                (lab: {
                  id: string;
                  testName: string;
                  status: string;
                  attachment?: string | null;
                  results?: { value?: string; notes?: string };
                }) => (
                  <div key={lab.id} className="border border-gray-200 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold">{lab.testName}</p>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          lab.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : lab.status === 'in_progress'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {lab.status === 'completed'
                          ? 'مكتمل'
                          : lab.status === 'in_progress'
                            ? 'قيد التنفيذ'
                            : 'مطلوب'}
                      </span>
                    </div>
                    {lab.results?.value && (
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">النتيجة:</span> {lab.results.value}
                      </p>
                    )}
                    {lab.results?.notes && (
                      <p className="text-sm text-gray-500 mt-1">{lab.results.notes}</p>
                    )}
                    <PatientLabUpload lab={lab} patientId={patient.id} />
                  </div>
                )
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              لا توجد تحاليل مسجّلة من العيادة — يمكنك رفع نتائجك من الأعلى
            </p>
          )}
        </section>

        <section className="bg-white rounded-3xl border border-gray-100 p-6">
          <h2 className="text-xl font-semibold mb-4">صور السونار والملفات</h2>
          <MediaGallery patientId={patient.id} readOnly />
        </section>
      </div>
    </div>
  );
}
