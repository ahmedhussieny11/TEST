import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatientAuthStore } from '../store/patientAuthStore';
import {
  mockPrescriptions,
  mockLabTests,
  getPatientById,
  getMonthlyCarePlan,
  getPregnancyTimeline,
  getPregnancyProfile,
} from '@/data/mockData';
import MediaGallery from '@/components/Media/MediaGallery';
import { MonthlyCareTask } from '@/types';

const careTypeText: Record<MonthlyCareTask['type'], string> = {
  visit: 'زيارة',
  ultrasound: 'سونار',
  lab: 'تحليل',
  injection: 'حقنة',
  supplement: 'مكمل غذائي',
};

export default function MyRecords() {
  const navigate = useNavigate();
  const { patient, isAuthenticated } = usePatientAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !patient) {
      navigate('/patient/login');
    }
  }, [isAuthenticated, patient, navigate]);

  if (!patient) return null;

  const fullPatient = getPatientById(patient.id);
  const prescriptions = mockPrescriptions.filter((pres) => pres.patientId === patient.id);
  const labTests = mockLabTests.filter((lab) => lab.patientId === patient.id);
  const pregnancyProfile = getPregnancyProfile(patient.id);
  const pregnancyTimeline = fullPatient?.isPregnant ? getPregnancyTimeline(patient.id) : [];
  const carePlan = fullPatient?.isPregnant ? getMonthlyCarePlan(patient.id) : [];
  const mediaItems = labTests
    .filter((lab) => lab.attachment)
    .map((lab) => ({
      id: lab.id,
      type: 'sonar' as const,
      url: lab.attachment as string,
      name: lab.testName,
      date: lab.completedDate || lab.requestedDate,
    }));

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-6 space-y-6">
        <header>
          <h1 className="text-3xl font-bold">سجلك الطبي</h1>
          <p className="text-gray-500">راجعي الروشتات، التحاليل، وصور السونار</p>
        </header>

        {fullPatient?.isPregnant && (
          <>
            <section className="bg-white rounded-3xl border border-pink-100 p-6 space-y-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm text-gray-500">أين وصل طفلك؟</p>
                  <h2 className="text-2xl font-semibold text-pink-600">
                    الأسبوع {pregnancyProfile?.currentWeek ?? fullPatient?.pregnancyWeek}
                  </h2>
                </div>
                {pregnancyProfile && (
                  <div className="text-sm text-gray-500 flex flex-wrap gap-4">
                    <span>ثلث رقم {pregnancyProfile.trimester}</span>
                    <span>موعد الولادة المتوقع: {pregnancyProfile.dueDate}</span>
                  </div>
                )}
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {pregnancyTimeline.map((stage) => (
                  <div key={stage.id} className="border border-gray-100 rounded-2xl p-4 bg-pink-50/50">
                    <p className="text-xs text-gray-500">الشهر {stage.month}</p>
                    <p className="font-semibold text-gray-900">{stage.title}</p>
                    <p className="text-sm text-gray-600 mt-2">{stage.description}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      الوزن المتوقع: {stage.fetalWeight} • الطول: {stage.fetalLength}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white rounded-3xl border border-gray-100 p-6">
              <h2 className="text-xl font-semibold mb-4">مهامي لهذا الشهر</h2>
              {carePlan.length ? (
                <div className="space-y-3">
                  {carePlan.map((task) => (
                    <div key={task.id} className="border border-gray-100 rounded-2xl p-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">الشهر {task.month}</p>
                      <p className="font-semibold text-gray-900">{task.title}</p>
                      <p className="text-sm text-gray-600">
                        الموعد: {task.dueDate} • النوع: {careTypeText[task.type]}
                      </p>
                      {task.notes && <p className="text-xs text-gray-500 mt-1">{task.notes}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">لا توجد مهام مسجلة حالياً.</p>
              )}
            </section>
          </>
        )}

        {/* الروشتات */}
        <section className="bg-white rounded-3xl border border-gray-100 p-6">
          <h2 className="text-xl font-semibold mb-4">الروشتات</h2>
          {prescriptions.length > 0 ? (
            <div className="space-y-4">
              {prescriptions.map((prescription) => (
                <div key={prescription.id} className="border border-gray-200 rounded-2xl p-4">
                  <p className="text-sm text-gray-500 mb-2">التاريخ: {prescription.createdAt}</p>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {prescription.medications.map((med) => (
                      <li key={med.id}>
                        {med.name} - {med.dosage} - {med.frequency}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-6">لا توجد روشتات محفوظة</p>
          )}
        </section>

        {/* التحاليل */}
        <section className="bg-white rounded-3xl border border-gray-100 p-6">
          <h2 className="text-xl font-semibold mb-4">التحاليل</h2>
          {labTests.length > 0 ? (
            <div className="space-y-4">
              {labTests.map((lab) => (
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
                      {lab.status === 'completed' ? 'مكتمل' : lab.status === 'in_progress' ? 'قيد التنفيذ' : 'مطلوب'}
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
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-6">لا توجد تحاليل</p>
          )}
        </section>

        {/* صور السونار */}
        <section className="bg-white rounded-3xl border border-gray-100 p-6">
          <h2 className="text-xl font-semibold mb-4">صور السونار والملفات</h2>
          <MediaGallery patientId={patient.id} mediaItems={mediaItems} readOnly />
        </section>
      </div>
    </div>
  );
}

