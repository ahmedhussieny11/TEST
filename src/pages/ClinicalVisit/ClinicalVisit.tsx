import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Save, FileText, Upload, User, Calendar, AlertTriangle, Baby, History, FlaskConical, Image as ImageIcon } from 'lucide-react';
import { VisitType } from '@/types';
import PrescriptionModal from '@/components/ClinicalVisit/PrescriptionModal';
import VisitTemplates, { VisitTemplate } from '@/components/ClinicalVisit/VisitTemplates';
import PregnancyCalculator from '@/components/ClinicalVisit/PregnancyCalculator';
import MediaGallery from '@/components/Media/MediaGallery';
import { mockAppointments, getPatientById, getPatientVisits, mockLabTests } from '@/data/mockData';

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
  const { register, handleSubmit, setValue } = useForm<VisitFormData>();
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [activeTab, setActiveTab] = useState<'current' | 'history' | 'labs' | 'media'>('current');
  const [visitType, setVisitType] = useState<VisitType>(VisitType.FOLLOW_UP);
  const isPregnancyCheck = visitType === VisitType.PREGNANCY_CHECK;

  // الحصول على بيانات الموعد والمريضة
  const appointment = mockAppointments.find((apt) => apt.id === appointmentId);
  const patient = appointment ? getPatientById(appointment.patientId) : null;
  const patientVisits = patient ? getPatientVisits(patient.id) : [];
  const patientLabs = patient ? mockLabTests.filter((lab) => lab.patientId === patient.id) : [];

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
    // حفظ بيانات الكشف
    console.log(data);
    toast.success('تم حفظ الكشف بنجاح');
    setShowPrescriptionModal(true);
  };

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
            <select
              value={visitType}
              onChange={(e) => setVisitType(e.target.value as VisitType)}
              className="input-field"
            >
              <option value={VisitType.NEW}>كشف جديد</option>
              <option value={VisitType.FOLLOW_UP}>متابعة</option>
              <option value={VisitType.PREGNANCY_CHECK}>متابعة حمل</option>
              <option value={VisitType.POST_DELIVERY}>بعد الولادة</option>
            </select>
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
              patientVisits.map((visit) => (
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

      {activeTab === 'labs' && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">التحاليل</h2>
          <div className="space-y-4">
            {patientLabs.length > 0 ? (
              patientLabs.map((lab) => (
                <div key={lab.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{lab.testName}</h3>
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
                  {lab.results && (
                    <div className="mt-2">
                      <p className="text-sm">
                        <span className="font-medium">النتيجة:</span> {lab.results.value}
                      </p>
                      {lab.results.notes && (
                        <p className="text-sm text-gray-600 mt-1">{lab.results.notes}</p>
                      )}
                    </div>
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

      {showPrescriptionModal && (
        <PrescriptionModal
          onClose={() => {
            setShowPrescriptionModal(false);
            navigate('/appointments');
          }}
          visitId="1"
          patientId={patient.id}
        />
      )}
    </div>
  );
}

