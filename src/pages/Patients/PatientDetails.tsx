import { Link, useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { patientsApi } from '@/api/patients';
import {
  Phone,
  Calendar,
  MapPin,
  Baby,
  FileText,
  Calendar as CalendarIcon,
  FlaskConical,
  Pill,
} from 'lucide-react';
import { format } from 'date-fns';
import { MonthlyCareTask } from '@/types';
import MediaGallery from '@/components/Media/MediaGallery';
import MedicalFilePreview from '@/components/Media/MedicalFilePreview';

const careStatusClasses: Record<MonthlyCareTask['status'], string> = {
  pending: 'bg-yellow-50 text-yellow-700 border border-yellow-100',
  scheduled: 'bg-blue-50 text-blue-700 border border-blue-100',
  completed: 'bg-green-50 text-green-700 border border-green-100',
};

const careStatusText: Record<MonthlyCareTask['status'], string> = {
  pending: 'منتظر',
  scheduled: 'مجدول',
  completed: 'مكتمل',
};

const careTypeText: Record<MonthlyCareTask['type'], string> = {
  visit: 'زيارة',
  ultrasound: 'سونار',
  lab: 'تحليل',
  injection: 'حقنة',
  supplement: 'مكمل غذائي',
};

export default function PatientDetails() {
  const { id } = useParams();

  const { data: patient, isLoading } = useQuery(
    ['patient', id],
    () => patientsApi.get(id!).then((r) => r.data),
    { enabled: !!id }
  );

  const { data: timeline } = useQuery(
    ['timeline', id],
    () => patientsApi.timeline(id!).then((r) => r.data),
    { enabled: !!id }
  );

  const visits = timeline?.visits ?? [];
  const labTests = timeline?.labTests ?? [];
  const prescriptions = timeline?.prescriptions ?? [];
  const attachments = timeline?.attachments ?? [];

  const pregnancies = (patient as { pregnancies?: { dueDate: string; currentWeek: number; lmpDate: string }[] })?.pregnancies ?? [];
  const pregnancyProfile = pregnancies[0] as {
    currentWeek: number;
    dueDate: string;
    lmpDate: string;
    riskLevel?: string;
  } | undefined;
  const pregnancyTimeline = [] as {
    id: string;
    month: number;
    title: string;
    description: string;
    weekStart: number;
    weekEnd: number;
    fetalWeight: string;
    fetalLength: string;
    highlights: string[];
  }[];
  const carePlan = [] as MonthlyCareTask[];
  const currentMonth = pregnancyProfile?.currentWeek
    ? Math.ceil(pregnancyProfile.currentWeek / 4)
    : undefined;

  if (isLoading) {
    return <p className="text-gray-500 p-6">جاري التحميل...</p>;
  }

  if (!patient) {
    return (
      <div className="card">
        <p className="text-center text-gray-500 py-12">المريضة غير موجودة</p>
        <Link to="/app/patients" className="btn-primary mt-4 inline-block">
          العودة لقائمة المرضى
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/app/patients" className="text-primary-600 hover:text-primary-700 text-sm mb-2 inline-block">
            ← العودة لقائمة المرضى
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{patient.name}</h1>
          <p className="text-gray-600 mt-1">ملف المريضة الطبي</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={`/app/lab-tests?patientId=${patient.id}`} className="btn-secondary">
            التحاليل
          </Link>
          <Link to="/app/appointments" className="btn-primary">
            تسجيل كشف جديد
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* المعلومات الأساسية */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">المعلومات الأساسية</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">رقم الهاتف</p>
                  <p className="font-medium">{patient.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">تاريخ الميلاد</p>
                  <p className="font-medium">
                    {patient.dateOfBirth
                      ? format(new Date(patient.dateOfBirth), 'yyyy-MM-dd')
                      : '—'}
                  </p>
                </div>
              </div>

              {patient.address && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">العنوان</p>
                    <p className="font-medium">{patient.address}</p>
                  </div>
                </div>
              )}

              {patient.isPregnant && (
                <div className="flex items-center gap-3">
                  <Baby className="w-5 h-5 text-pink-400" />
                  <div>
                    <p className="text-sm text-gray-600">حالة الحمل</p>
                    <p className="font-medium text-pink-600">
                      أسبوع {patient.pregnancyWeek} من الحمل
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* جهة الاتصال للطوارئ */}
          {patient.emergencyContact && (
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">جهة الاتصال للطوارئ</h2>
              <div className="space-y-2">
                <p className="font-medium">{patient.emergencyContact.name}</p>
                <p className="text-sm text-gray-600">{patient.emergencyContact.relation}</p>
                <p className="text-sm text-gray-600">{patient.emergencyContact.phone}</p>
              </div>
            </div>
          )}

          {/* التاريخ المرضي */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">التاريخ المرضي</h2>
            <div className="space-y-3">
              {patient.medicalHistory?.previousSurgeries?.length ? (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">العمليات السابقة:</p>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {patient.medicalHistory.previousSurgeries.map((surgery, idx) => (
                      <li key={idx}>{surgery}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {patient.medicalHistory?.allergies?.length ? (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">الحساسيات:</p>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {patient.medicalHistory.allergies.map((allergy, idx) => (
                      <li key={idx}>{allergy}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div>
                <p className="text-sm font-medium text-gray-700">
                  حالات الحمل السابقة: {patient.medicalHistory?.previousPregnancies ?? 0}
                </p>
                <p className="text-sm font-medium text-gray-700">
                  حالات الولادة السابقة: {patient.medicalHistory?.previousDeliveries ?? 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* السجل الطبي */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">الصور والتحاليل المرفوعة</h2>
            <div className="space-y-4 mb-6">
              {labTests
                .filter((lab: { attachment?: string | null }) => lab.attachment)
                .map(
                  (lab: {
                    id: string;
                    testName: string;
                    attachment: string;
                    status: string;
                  }) => (
                    <div key={lab.id} className="border border-gray-200 rounded-xl p-4">
                      <p className="font-medium text-gray-900 mb-2">{lab.testName}</p>
                      <MedicalFilePreview filePath={lab.attachment} title={lab.testName} />
                    </div>
                  )
                )}
              {labTests.filter((lab: { attachment?: string | null }) => lab.attachment)
                .length === 0 && (
                <p className="text-sm text-gray-500">لا توجد صور تحاليل مرفوعة بعد</p>
              )}
            </div>
            <h3 className="text-lg font-semibold mb-3">كل الوسائط والسونار</h3>
            <MediaGallery patientId={patient.id} readOnly />
          </div>

          {/* الزيارات السابقة */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5" />
                الزيارات السابقة
              </h2>
              <span className="text-sm text-gray-500">{visits.length} زيارة</span>
            </div>

            <div className="space-y-4">
              {visits.length ? (
                visits.map((visit: { id: string; date: string; complaint?: string; diagnosis?: string }) => (
                  <div key={visit.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{visit.date}</span>
                      </div>
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                        مكتمل
                      </span>
                    </div>
                    <p className="font-medium mb-1">{visit.diagnosis || '—'}</p>
                    <p className="text-sm text-gray-600 mb-2">
                      الشكوى: {visit.complaint || 'غير محدد'}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <Link to="/app/prescriptions" className="text-primary-600 hover:text-primary-700 flex items-center gap-1">
                        <Pill className="w-4 h-4" />
                        الروشتة
                      </Link>
                      <Link to={`/app/lab-tests?patientId=${patient.id}`} className="text-primary-600 hover:text-primary-700 flex items-center gap-1">
                        <FlaskConical className="w-4 h-4" />
                        التحاليل
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">لا توجد زيارات مسجلة</p>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="card">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FlaskConical className="w-5 h-5" />
                التحاليل
              </h2>
              <div className="space-y-3">
                {labTests.length ? (
                  labTests.map(
                    (lab: {
                      id: string;
                      testName: string;
                      status: string;
                      requestedDate?: string;
                      attachment?: string | null;
                    }) => (
                    <div key={lab.id} className="border border-gray-200 rounded-lg p-3">
                      <p className="font-medium">{lab.testName}</p>
                      <p className="text-xs text-gray-500">{lab.requestedDate}</p>
                      <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                        {lab.status === 'completed' ? 'مكتمل' : lab.status === 'in_progress' ? 'قيد التنفيذ' : 'مطلوب'}
                      </span>
                      {lab.attachment && (
                        <div className="mt-2">
                          <MedicalFilePreview
                            filePath={lab.attachment}
                            maxHeight="max-h-32"
                          />
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">لا توجد تحاليل</p>
                )}
              </div>
            </div>

            <div className="card">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Pill className="w-5 h-5" />
                الروشتات
              </h2>
              <div className="space-y-3">
                {prescriptions.length ? (
                  prescriptions.map((pres: { id: string; createdAt: string; medications: { id: string; name: string; dosage: string; frequency: string }[] }) => (
                    <div key={pres.id} className="border border-gray-200 rounded-lg p-3">
                      <p className="font-medium">روشتة #{pres.id}</p>
                      <p className="text-xs text-gray-500">{pres.createdAt}</p>
                      <ul className="mt-2 list-disc list-inside text-sm text-gray-600">
                        {pres.medications.map((med) => (
                          <li key={med.id}>
                            {med.name} - {med.dosage} - {med.frequency}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">لا توجد روشتات</p>
                )}
              </div>
            </div>
          </div>

          {patient.isPregnant && (
            <div className="space-y-6">
              <div className="card">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Baby className="w-5 h-5 text-pink-600" />
                    <h2 className="text-xl font-semibold">متابعة الحمل</h2>
                  </div>
                  {pregnancyProfile && (
                    <div className="text-sm text-gray-500 flex flex-wrap gap-4">
                      <span>الأسبوع الحالي: {pregnancyProfile.currentWeek}</span>
                      <span>الموعد المتوقع: {format(new Date(pregnancyProfile.dueDate), 'yyyy-MM-dd')}</span>
                      <span>درجة الخطورة: {pregnancyProfile.riskLevel === 'low' ? 'منخفضة' : pregnancyProfile.riskLevel === 'medium' ? 'متوسطة' : 'مرتفعة'}</span>
                    </div>
                  )}
                </div>
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {pregnancyTimeline.map((stage) => (
                    <div
                      key={stage.id}
                      className={`border rounded-2xl p-4 bg-white shadow-sm ${
                        currentMonth === stage.month ? 'border-pink-500 shadow-pink-100 bg-pink-50' : 'border-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-500">الشهر {stage.month}</p>
                        <span className="text-xs px-2 py-1 rounded-full bg-pink-100 text-pink-800">
                          أسابيع {stage.weekStart}-{stage.weekEnd}
                        </span>
                      </div>
                      <p className="font-semibold text-gray-900 mb-2">{stage.title}</p>
                      <p className="text-sm text-gray-600 mb-2">{stage.description}</p>
                      <div className="text-xs text-gray-500 flex flex-wrap gap-2 mb-2">
                        <span>الوزن: {stage.fetalWeight}</span>
                        <span>الطول: {stage.fetalLength}</span>
                      </div>
                      <ul className="text-xs text-gray-500 list-disc list-inside space-y-1">
                        {stage.highlights.slice(0, 2).map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-pink-600" />
                    جدول الرعاية الشهرية
                  </h2>
                  <span className="text-sm text-gray-500">{carePlan.length} مهمة</span>
                </div>
                {carePlan.length ? (
                  <div className="space-y-3">
                    {carePlan.map((task) => (
                      <div
                        key={task.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-gray-100 rounded-2xl p-4"
                      >
                        <div>
                          <p className="text-sm text-gray-500">الشهر {task.month}</p>
                          <p className="text-lg font-semibold text-gray-900">{task.title}</p>
                          <p className="text-sm text-gray-600">
                            النوع: {careTypeText[task.type]} • الموعد: {format(new Date(task.dueDate), 'yyyy-MM-dd')}
                          </p>
                          {task.notes && <p className="text-xs text-gray-500 mt-1">{task.notes}</p>}
                        </div>
                        <span className={`text-xs font-medium px-3 py-1 rounded-full self-start ${careStatusClasses[task.status]}`}>
                          {careStatusText[task.status]}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-6">لا توجد مهام متابعة مسجلة.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

