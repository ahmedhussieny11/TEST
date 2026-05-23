import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import {
  Save,
  FileText,
  Upload,
  User,
  Calendar,
  AlertTriangle,
  Baby,
  History,
  FlaskConical,
  Image as ImageIcon,
  Plus,
  Pill,
} from 'lucide-react';
import { VisitType } from '@/types';
import VisitPrescriptionsPanel from '@/components/ClinicalVisit/VisitPrescriptionsPanel';
import VisitTypeSelect from '@/components/ClinicalVisit/VisitTypeSelect';
import VisitTemplates, { VisitTemplate } from '@/components/ClinicalVisit/VisitTemplates';
import PregnancyCalculator from '@/components/ClinicalVisit/PregnancyCalculator';
import MediaGallery from '@/components/Media/MediaGallery';
import { appointmentsApi } from '@/api/appointments';
import { patientsApi } from '@/api/patients';
import { visitsApi } from '@/api/visits';
import NewLabRequestModal from '@/components/Labs/NewLabRequestModal';
import UploadLabResultModal from '@/components/Labs/UploadLabResultModal';
import { LabTest } from '@/types';

interface VisitFormData {
  complaint: string;
  examination: string;
  diagnosis: string;
  treatmentPlan: string;
  pregnancyWeek?: number;
  weight?: number;
  bloodPressure?: string;
  fetalHeartRate?: number;
  pregnancyNotes?: string;
}

export default function ClinicalVisit() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { register, handleSubmit, setValue } = useForm<VisitFormData>();
  const [showTemplates, setShowTemplates] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'current' | 'history' | 'prescriptions' | 'labs' | 'media'
  >('current');
  const [visitType, setVisitType] = useState<VisitType>(VisitType.FOLLOW_UP);
  const [savedVisitId, setSavedVisitId] = useState<string | null>(null);
  const [showLabModal, setShowLabModal] = useState(false);
  const [uploadLab, setUploadLab] = useState<LabTest | null>(null);

  const refreshTimeline = () => {
    if (patientId) queryClient.invalidateQueries(['timeline', patientId]);
    queryClient.invalidateQueries('lab-tests');
    queryClient.invalidateQueries('prescriptions');
  };
  const isPregnancyCheck = visitType === VisitType.PREGNANCY_CHECK;

  const { data: appointment, isLoading } = useQuery(
    ['appointment', appointmentId],
    () => appointmentsApi.get(appointmentId!).then((r) => r.data),
    { enabled: !!appointmentId }
  );

  const patient = appointment?.patient ?? null;
  const patientId = appointment?.patientId ?? patient?.id;

  const { data: timeline } = useQuery(
    ['timeline', patientId],
    () => patientsApi.timeline(patientId!).then((r) => r.data),
    { enabled: !!patientId }
  );

  const patientVisits = timeline?.visits ?? [];
  const patientLabs = timeline?.labTests ?? [];
  const patientPrescriptions = timeline?.prescriptions ?? [];
  const patientAttachments = timeline?.attachments ?? [];
  const prescriptionImages = (patientAttachments as { type: string; visitId?: string }[]).filter(
    (a) => a.type === 'prescription'
  );
  const visitPrescriptions = savedVisitId
    ? (patientPrescriptions as { visitId?: string }[]).filter((p) => p.visitId === savedVisitId)
    : [];

  const handleTemplateSelect = (template: VisitTemplate) => {
    setValue('complaint', template.complaint);
    setValue('examination', template.examination);
    setValue('diagnosis', template.diagnosis);
    setValue('treatmentPlan', template.treatmentPlan);
    setVisitType(template.type);
    toast.success('تم تطبيق القالب بنجاح');
  };

  const handlePregnancyWeekCalculated = (week: number) => {
    setValue('pregnancyWeek', week);
  };

  const onSubmit = async (data: VisitFormData) => {
    if (!patientId) return;
    try {
      const { data: visit } = await visitsApi.create({
        patientId,
        appointmentId,
        type: visitType,
        complaint: data.complaint,
        examination: data.examination,
        diagnosis: data.diagnosis,
        treatmentPlan: data.treatmentPlan,
        pregnancyNotes: isPregnancyCheck
          ? {
              week: data.pregnancyWeek,
              weight: data.weight,
              bloodPressure: data.bloodPressure,
              fetalHeartRate: data.fetalHeartRate,
              notes: data.pregnancyNotes,
            }
          : undefined,
      });
      setSavedVisitId(visit.id);
      toast.success('تم حفظ الكشف — يمكنك إضافة الروشتة من تبويب «الروشتة»');
      setActiveTab('prescriptions');
    } catch {
      toast.error('تعذر حفظ الكشف');
    }
  };

  if (isLoading) {
    return <p className="text-gray-500 p-6">جاري التحميل...</p>;
  }

  if (!patient || !appointment) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="card text-center py-12">
          <p className="text-gray-500">الموعد غير موجود</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header مع معلومات المريضة */}
      <div className="card bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
              <User className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{patient.name}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} سنة
                  </span>
                </div>
                {patient.medicalHistory?.allergies && patient.medicalHistory.allergies.length > 0 && (
                  <div className="flex items-center gap-1 text-red-600">
                    <AlertTriangle className="w-4 h-4" />
                    <span>حساسية: {patient.medicalHistory.allergies.join(', ')}</span>
                  </div>
                )}
                {patient.medicalHistory?.previousDeliveries !== undefined && (
                  <div className="flex items-center gap-1">
                    <Baby className="w-4 h-4" />
                    <span>ولادات سابقة: {patient.medicalHistory.previousDeliveries}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowTemplates(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            قوالب جاهزة
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="card p-0">
        <div className="flex border-b">
          <button
            type="button"
            onClick={() => setActiveTab('current')}
            className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
              activeTab === 'current'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            الزيارة الحالية
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
              activeTab === 'history'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <History className="w-4 h-4 inline-block ml-2" />
            التاريخ السابق
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('prescriptions')}
            className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
              activeTab === 'prescriptions'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Pill className="w-4 h-4 inline-block ml-2" />
            الروشتة
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('labs')}
            className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
              activeTab === 'labs'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FlaskConical className="w-4 h-4 inline-block ml-2" />
            التحاليل
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('media')}
            className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
              activeTab === 'media'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ImageIcon className="w-4 h-4 inline-block ml-2" />
            السونار
          </button>
        </div>
      </div>

      {/* محتوى Tabs */}
      {activeTab === 'current' && (

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* حاسبة الحمل */}
          {isPregnancyCheck && (
            <PregnancyCalculator
              onWeekCalculated={handlePregnancyWeekCalculated}
              initialWeek={patient.pregnancyWeek}
            />
          )}

          {/* نوع الكشف */}
          <div className="card">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نوع الكشف
            </label>
            <VisitTypeSelect value={visitType} onChange={setVisitType} />
          </div>

        {/* الشكوى */}
        <div className="card">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            الشكوى الرئيسية
          </label>
          <textarea
            {...register('complaint')}
            rows={4}
            className="input-field"
            placeholder="وصف شكوى المريضة..."
          />
        </div>

        {/* الفحص */}
        <div className="card">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            الفحص السريري
          </label>
          <textarea
            {...register('examination')}
            rows={4}
            className="input-field"
            placeholder="نتائج الفحص السريري..."
          />
        </div>

        {/* التشخيص */}
        <div className="card">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            التشخيص
          </label>
          <textarea
            {...register('diagnosis')}
            rows={3}
            className="input-field"
            placeholder="التشخيص..."
          />
        </div>

        {/* متابعة الحمل */}
        {isPregnancyCheck && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">متابعة الحمل</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  أسبوع الحمل
                </label>
                <input
                  type="number"
                  min="1"
                  max="42"
                  {...register('pregnancyWeek')}
                  className="input-field"
                  placeholder="أسبوع الحمل"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الوزن (كجم)
                </label>
                <input
                  type="number"
                  step="0.1"
                  {...register('weight')}
                  className="input-field"
                  placeholder="الوزن"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ضغط الدم
                </label>
                <input
                  {...register('bloodPressure')}
                  className="input-field"
                  placeholder="120/80"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نبض الجنين
                </label>
                <input
                  type="number"
                  {...register('fetalHeartRate')}
                  className="input-field"
                  placeholder="نبضات في الدقيقة"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ملاحظات الحمل
                </label>
                <textarea
                  {...register('pregnancyNotes')}
                  rows={3}
                  className="input-field"
                  placeholder="ملاحظات إضافية عن حالة الحمل..."
                />
              </div>
            </div>
          </div>
        )}

        {/* الخطة العلاجية */}
        <div className="card">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            الخطة العلاجية
          </label>
          <textarea
            {...register('treatmentPlan')}
            rows={4}
            className="input-field"
            placeholder="الخطة العلاجية الموصى بها..."
          />
        </div>

        {/* رفع ملفات */}
        <div className="card">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            رفع ملفات (سونار، تحاليل، صور)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">
              اسحب الملفات هنا أو اضغط للرفع
            </p>
            <input
              type="file"
              multiple
              accept="image/*,.pdf"
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="btn-secondary inline-block cursor-pointer"
            >
              اختيار ملفات
            </label>
          </div>
        </div>

          {/* أزرار */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary"
            >
              إلغاء
            </button>
            <button type="submit" className="btn-primary flex items-center gap-2">
              <Save className="w-5 h-5" />
              حفظ الكشف
            </button>
          </div>
        </form>
      )}

      {activeTab === 'history' && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">الزيارات السابقة</h2>
          <div className="space-y-4">
            {patientVisits.length > 0 ? (
              patientVisits.map((visit: { id: string; date: string; type?: string; complaint?: string; diagnosis?: string }) => (
                <div key={visit.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">{visit.date}</span>
                    <span className="text-xs px-2 py-1 bg-primary-100 text-primary-800 rounded">
                      {visit.type === VisitType.PREGNANCY_CHECK && 'متابعة حمل'}
                      {visit.type === VisitType.NEW && 'كشف جديد'}
                      {visit.type === VisitType.FOLLOW_UP && 'متابعة'}
                    </span>
                  </div>
                  {visit.complaint && (
                    <p className="text-sm mb-1">
                      <span className="font-medium">الشكوى:</span> {visit.complaint}
                    </p>
                  )}
                  {visit.diagnosis && (
                    <p className="text-sm">
                      <span className="font-medium">التشخيص:</span> {visit.diagnosis}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">لا توجد زيارات سابقة</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'prescriptions' && patient && (
        <>
          {!savedVisitId ? (
            <div className="card bg-amber-50 border-amber-200">
              <p className="text-amber-900 mb-3">
                احفظي الكشف أولاً من تبويب «الزيارة الحالية»، ثم أضيفي الروشتة هنا (كتابة يدوية أو
                رفع صورة).
              </p>
              <button
                type="button"
                onClick={handleSubmit(onSubmit)}
                className="btn-primary flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                حفظ الكشف الآن
              </button>
            </div>
          ) : (
            <VisitPrescriptionsPanel
              visitId={savedVisitId}
              patientId={patient.id}
              patientName={patient.name}
              doctorId={appointment.doctorId}
              pregnancyWeek={patient.pregnancyWeek}
              visitPrescriptions={visitPrescriptions as never[]}
              prescriptionImages={prescriptionImages as never[]}
              onSaved={refreshTimeline}
            />
          )}
        </>
      )}

      {activeTab === 'labs' && patient && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">التحاليل</h2>
            <button
              type="button"
              onClick={() => setShowLabModal(true)}
              className="btn-primary text-sm flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              طلب تحليل
            </button>
          </div>
          <div className="space-y-4">
            {patientLabs.length > 0 ? (
              patientLabs.map((lab: {
                id: string;
                testName: string;
                status: string;
                attachment?: string | null;
                results?: { value?: string; notes?: string };
              }) => (
                <div key={lab.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <h3 className="font-medium">{lab.testName}</h3>
                    {(lab.results?.value?.includes('مرفوعة من المريضة') ||
                      lab.results?.notes?.includes('بانتظار مراجعة')) && (
                      <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800 order-last sm:order-none">
                        مرفوع من المريضة
                      </span>
                    )}
                    <span className={`text-xs px-2 py-1 rounded ${
                      lab.status === 'completed' ? 'bg-green-100 text-green-800' :
                      lab.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {lab.status === 'completed' && 'مكتمل'}
                      {lab.status === 'in_progress' && 'قيد التنفيذ'}
                      {lab.status === 'requested' && 'مطلوب'}
                    </span>
                  </div>
                  {lab.attachment && (
                    <div className="mt-3">
                      {lab.attachment.toLowerCase().endsWith('.pdf') ? (
                        <a
                          href={lab.attachment}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary-600 hover:underline"
                        >
                          عرض ملف التحليل المرفوع
                        </a>
                      ) : (
                        <a
                          href={lab.attachment}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block rounded-lg overflow-hidden border border-gray-200 max-w-sm"
                        >
                          <img
                            src={lab.attachment}
                            alt={lab.testName}
                            className="w-full h-auto max-h-64 object-contain bg-gray-50"
                          />
                        </a>
                      )}
                    </div>
                  )}
                  {lab.results?.value && (
                    <div className="mt-2">
                      <p className="text-sm">
                        <span className="font-medium">النتيجة:</span> {lab.results.value}
                      </p>
                      {lab.results.notes && (
                        <p className="text-sm text-gray-600 mt-1">{lab.results.notes}</p>
                      )}
                    </div>
                  )}
                  {lab.status !== 'completed' &&
                    !lab.results?.value?.includes('مرفوعة من المريضة') && (
                    <button
                      type="button"
                      onClick={() => setUploadLab(lab as LabTest)}
                      className="btn-secondary text-xs mt-2 py-1 px-2"
                    >
                      رفع النتيجة
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">لا توجد تحاليل</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'media' && patient && (
        <MediaGallery patientId={patient.id} />
      )}

      {showTemplates && (
        <VisitTemplates
          onSelectTemplate={handleTemplateSelect}
          onClose={() => setShowTemplates(false)}
        />
      )}

      {showLabModal && patient && (
        <NewLabRequestModal
          defaultPatientId={patient.id}
          visitId={savedVisitId ?? undefined}
          onClose={() => setShowLabModal(false)}
          onCreated={refreshTimeline}
        />
      )}

      {uploadLab && (
        <UploadLabResultModal
          lab={{ ...uploadLab, patient: { name: patient?.name ?? '' } }}
          onClose={() => setUploadLab(null)}
          onSaved={refreshTimeline}
        />
      )}
    </div>
  );
}

