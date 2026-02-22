import { useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { differenceInHours, format, differenceInMinutes } from 'date-fns';
import { Calendar, Bell, ArrowLeft, XCircle, Baby, Phone, MapPin, Users } from 'lucide-react';
import { usePatientAuthStore } from '../store/patientAuthStore';
import { usePatientDataStore } from '../store/patientDataStore';
import {
  getPatientVisits,
  mockPrescriptions,
  getPregnancyTimeline,
  getMonthlyCarePlan,
  getPregnancyProfile,
  getPatientById,
} from '@/data/mockData';
import { AppointmentStatus, MonthlyCareTask } from '@/types';
import { toast } from 'react-toastify';
import PatientCard from '../components/PatientCard';

const careStatusText: Record<MonthlyCareTask['status'], string> = {
  pending: 'منتظر',
  scheduled: 'مجدول',
  completed: 'مكتمل',
};

const careBadgeClass: Record<MonthlyCareTask['status'], string> = {
  pending: 'bg-yellow-50 text-yellow-700',
  scheduled: 'bg-blue-50 text-blue-700',
  completed: 'bg-green-50 text-green-700',
};

const careTypeText: Record<MonthlyCareTask['type'], string> = {
  visit: 'زيارة',
  ultrasound: 'سونار',
  lab: 'تحليل',
  injection: 'حقنة',
  supplement: 'مكمل غذائي',
};

export default function PatientDashboard() {
  const navigate = useNavigate();
  const { patient, isAuthenticated, logout } = usePatientAuthStore();
  const { appointments, setPatientId, refreshAppointments, cancelAppointment } =
    usePatientDataStore();

  useEffect(() => {
    if (!isAuthenticated || !patient) {
      navigate('/patient/login');
      return;
    }
    setPatientId(patient.id);
    refreshAppointments();
  }, [isAuthenticated, patient, navigate, setPatientId, refreshAppointments]);

  const nextAppointment = useMemo(() => {
    return appointments
      .filter((apt) => apt.status !== AppointmentStatus.CANCELLED)
      .sort((a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime())[0];
  }, [appointments]);

  const patientDetails = patient ? getPatientById(patient.id) : undefined;
  const displayName = patientDetails?.name ?? patient?.name ?? '';
  const patientPhone = patientDetails?.phone ?? patient?.phone ?? '';
  const patientEmail = patientDetails?.email ?? patient?.email ?? 'لم يتم إدخاله بعد';
  const patientAddress = patientDetails?.address ?? 'لم يتم تسجيل عنوان، يمكنك إضافته من خلال العيادة.';
  const isPregnant = Boolean(patientDetails?.isPregnant);
  const visits = patient ? getPatientVisits(patient.id) : [];
  const prescriptions = mockPrescriptions.filter((pres) => pres.patientId === patient?.id);
  const cardDataForPatient = nextAppointment && patient
    ? {
        id: patient.id,
        name: patientDetails?.name ?? patient.name,
        fileNumber: `CL-${patient.id.toString().padStart(4, '0')}`,
        pregnancyWeek: patientDetails?.pregnancyWeek,
        nextAppointment: {
          date: nextAppointment.date,
          time: nextAppointment.time,
          service: nextAppointment.notes || 'موعد عادي',
        },
        status: (
          nextAppointment.status === AppointmentStatus.IN_PROGRESS
            ? 'waiting'
            : nextAppointment.status === AppointmentStatus.SCHEDULED
            ? 'new'
            : 'checked'
        ) as 'new' | 'waiting' | 'checked',
        notes: patientDetails?.medicalHistory?.allergies?.join(', '),
      }
    : null;
  const pregnancyProfile = patient ? getPregnancyProfile(patient.id) : undefined;
  const pregnancyTimeline = patientDetails?.isPregnant && patient ? getPregnancyTimeline(patient.id) : [];
  const carePlan = patientDetails?.isPregnant && patient ? getMonthlyCarePlan(patient.id) : [];
  const currentMonth = pregnancyProfile ? Math.ceil(pregnancyProfile.currentWeek / 4) : undefined;

  const countdown = useMemo(() => {
    if (!nextAppointment) return null;
    const appointmentDate = new Date(`${nextAppointment.date}T${nextAppointment.time}`);
    const now = new Date();
    const hours = differenceInHours(appointmentDate, now);
    const minutes = differenceInMinutes(appointmentDate, now) % 60;
    if (hours < 0) return 'الموعد بدأ أو انتهى';
    return `متبقي ${hours} ساعة و ${minutes} دقيقة`;
  }, [nextAppointment]);

  const handleCancel = (appointmentId: string) => {
    cancelAppointment(appointmentId);
    toast.success('تم إلغاء الموعد');
  };

  if (!isAuthenticated || !patient) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-6 space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">سعيدة برؤيتك مجدداً</p>
            <h1 className="text-3xl font-bold">مرحباً، {displayName}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/book" className="btn-primary">
              حجز موعد جديد
            </Link>
            <button onClick={logout} className="btn-secondary">
              تسجيل خروج
            </button>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="bg-white rounded-3xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary-500" />
              معلوماتي الأساسية
            </h2>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center justify-between">
                <span>رقم الملف</span>
                <span className="font-semibold text-gray-900">
                  CL-{patient.id.toString().padStart(4, '0')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>رقم الجوال</span>
                <span className="font-semibold text-gray-900">{patientPhone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>البريد الإلكتروني</span>
                <span className="font-semibold text-gray-900">{patientEmail}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>تاريخ الميلاد</span>
                <span className="font-semibold text-gray-900">
                  {patientDetails?.dateOfBirth
                    ? format(new Date(patientDetails.dateOfBirth), 'yyyy-MM-dd')
                    : '—'}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{patientAddress}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-500" />
              جهة الاتصال للطوارئ
            </h2>
            {patientDetails?.emergencyContact ? (
              <div className="space-y-2 text-sm text-gray-700">
                <p className="font-semibold text-gray-900">
                  {patientDetails.emergencyContact.name}
                </p>
                <p className="text-gray-500">{patientDetails.emergencyContact.relation}</p>
                <p>{patientDetails.emergencyContact.phone}</p>
                <p className="text-xs text-gray-400 mt-2">
                  سيتم التواصل مع هذه الجهة تلقائياً في حال الطوارئ.
                </p>
              </div>
            ) : (
              <div className="text-sm text-gray-600 space-y-2">
                <p className="font-semibold text-gray-900">لم يتم حفظ جهة اتصال بعد</p>
                <p>يمكنك تزويد الاستقبال باسم ورقم الشخص الذي يجب التواصل معه عند الطوارئ.</p>
                <div className="bg-primary-50 text-primary-700 rounded-2xl px-4 py-3 text-xs">
                  مثال تجريبي: آية خالد – 01000000000 – أخت
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold mb-4">التاريخ المرضي</h2>
            {patientDetails?.medicalHistory ? (
              <div className="space-y-3 text-sm text-gray-700">
                <div>
                  <p className="text-gray-500 mb-1">العمليات السابقة</p>
                  {patientDetails.medicalHistory.previousSurgeries?.length ? (
                    <ul className="list-disc list-inside text-gray-700">
                      {patientDetails.medicalHistory.previousSurgeries.map((surgery, idx) => (
                        <li key={idx}>{surgery}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-400">لا توجد عمليات مسجلة</p>
                  )}
                </div>
                <div>
                  <p className="text-gray-500 mb-1">الحساسيات</p>
                  {patientDetails.medicalHistory.allergies?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {patientDetails.medicalHistory.allergies.map((allergy, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs">
                          {allergy}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">لا توجد حساسية معروفة</p>
                  )}
                </div>
                <div>
                  <p className="text-gray-500 mb-1">أمراض مزمنة</p>
                  {patientDetails.medicalHistory.chronicDiseases?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {patientDetails.medicalHistory.chronicDiseases.map((disease, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs">
                          {disease}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">لا توجد أمراض مزمنة مسجلة</p>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>حالات حمل سابقة: {patientDetails.medicalHistory.previousPregnancies ?? 0}</span>
                  <span>حالات ولادة: {patientDetails.medicalHistory.previousDeliveries ?? 0}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                لم يتم إدخال تاريخ مرضي بعد، سيتم تحديثه تلقائياً مع أول زيارة للطبيب.
              </p>
            )}
          </div>
        </section>

        {cardDataForPatient && (
          <section className="grid md:grid-cols-3 gap-6">
            <PatientCard data={cardDataForPatient} highlight />
          </section>
        )}

        {isPregnant && (
          <>
            <section className="bg-white rounded-3xl border border-pink-100 p-6 space-y-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm text-gray-500">رحلة طفلك</p>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Baby className="w-6 h-6 text-pink-500" />
                    الأسبوع {pregnancyProfile?.currentWeek || patientDetails?.pregnancyWeek}
                  </h2>
                </div>
                {pregnancyProfile && (
                  <div className="text-sm text-gray-500 flex flex-wrap gap-4">
                    <span>ثلث رقم {pregnancyProfile.trimester}</span>
                    <span>موعد الولادة المتوقع: {format(new Date(pregnancyProfile.dueDate), 'yyyy-MM-dd')}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {pregnancyTimeline.map((stage) => (
                  <div
                    key={stage.id}
                    className={`min-w-[220px] border rounded-2xl p-4 flex-1 ${
                      currentMonth === stage.month ? 'border-pink-500 bg-pink-50 shadow shadow-pink-100' : 'border-gray-100 bg-white'
                    }`}
                  >
                    <p className="text-xs text-gray-500 mb-1">الشهر {stage.month}</p>
                    <p className="font-semibold text-gray-900">{stage.title}</p>
                    <p className="text-xs text-gray-500 my-1">
                      أسابيع {stage.weekStart}-{stage.weekEnd}
                    </p>
                    <p className="text-sm text-gray-600 line-clamp-3">{stage.description}</p>
                    <div className="text-xs text-gray-500 mt-3 flex flex-wrap gap-2">
                      <span>وزن: {stage.fetalWeight}</span>
                      <span>طول: {stage.fetalLength}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white rounded-3xl border border-gray-100 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">جدول الرعاية لهذا الشهر</h2>
                <span className="text-sm text-gray-500">{carePlan.length} مهمة</span>
              </div>
              {carePlan.length ? (
                <div className="space-y-3">
                  {carePlan.map((task) => (
                    <div key={task.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border border-gray-100 rounded-2xl p-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">الشهر {task.month}</p>
                        <p className="font-semibold text-gray-900">{task.title}</p>
                        <p className="text-sm text-gray-600">
                          النوع: {careTypeText[task.type]} • الموعد: {format(new Date(task.dueDate), 'yyyy-MM-dd')}
                        </p>
                        {task.notes && <p className="text-xs text-gray-500 mt-1">{task.notes}</p>}
                      </div>
                      <span className={`text-xs font-medium px-3 py-1 rounded-full ${careBadgeClass[task.status]}`}>
                        {careStatusText[task.status]}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-6">لا توجد مهام لهذا الشهر</p>
              )}
            </section>
          </>
        )}

        {nextAppointment ? (
          <div className="bg-white border border-primary-100 rounded-3xl p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3 text-primary-600">
              <Bell className="w-6 h-6" />
              <p className="font-semibold">موعدك القادم</p>
            </div>
            <div className="grid md:grid-cols-3 gap-4 text-right">
              <div>
                <p className="text-sm text-gray-500">التاريخ</p>
                <p className="text-lg font-semibold">
                  {format(new Date(nextAppointment.date), 'yyyy-MM-dd')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">الوقت</p>
                <p className="text-lg font-semibold">{nextAppointment.time}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">الحالة</p>
                <p className="text-lg font-semibold text-primary-600">مؤكد</p>
              </div>
            </div>
            <p className="text-gray-600">{countdown}</p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleCancel(nextAppointment.id)}
                className="btn-secondary flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                إلغاء الموعد
              </button>
              <Link to="/book" className="btn-secondary flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                تغيير الموعد
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-dashed border-gray-300 rounded-3xl p-8 text-center">
            <p className="text-gray-500 mb-4">لا توجد مواعيد حالية</p>
            <Link to="/book" className="btn-primary">
              احجزي موعدك الآن
            </Link>
          </div>
        )}

        {appointments.length > 1 && (
          <div className="bg-white rounded-3xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">مواعيدي القادمة</h2>
              <span className="text-sm text-gray-500">{appointments.length} موعد</span>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {appointments.slice(0, 4).map((apt) => (
                <div key={apt.id} className="border border-gray-200 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500">{apt.date}</p>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary-50 text-primary-600">
                      {apt.status === AppointmentStatus.CONFIRMED
                        ? 'مؤكد'
                        : apt.status === AppointmentStatus.SCHEDULED
                        ? 'قيد التأكيد'
                        : apt.status === AppointmentStatus.CANCELLED
                        ? 'ملغي'
                        : 'مكتمل'}
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{apt.time}</p>
                  <p className="text-sm text-gray-600">{apt.notes || 'زيارة عادية'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* زيارات سابقة */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">زياراتك السابقة</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              {visits.length} زيارة
            </div>
          </div>
          {visits.length > 0 ? (
            <div className="space-y-4">
              {visits.map((visit) => (
                <div
                  key={visit.id}
                  className="border border-gray-200 rounded-2xl p-4 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">{visit.date}</p>
                    <span className="text-xs px-3 py-1 bg-primary-50 text-primary-600 rounded-full">
                      {visit.type === 'pregnancy_check' ? 'متابعة حمل' : 'كشف'}
                    </span>
                  </div>
                  <p className="text-gray-700">
                    <span className="font-semibold">الشكوى:</span> {visit.complaint || '---'}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">التشخيص:</span> {visit.diagnosis || '---'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-6">لا توجد زيارات مسجلة</p>
          )}
        </div>

        {/* الروشتات */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">روشتاتك</h2>
            <Link to="/patient/records" className="text-primary-600 text-sm">
              عرض السجل الطبي
            </Link>
          </div>
          {prescriptions.length > 0 ? (
            <div className="space-y-4">
              {prescriptions.map((prescription) => (
                <div key={prescription.id} className="border border-gray-200 rounded-2xl p-4">
                  <p className="text-sm text-gray-500 mb-2">{prescription.createdAt}</p>
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
        </div>
      </div>
    </div>
  );
}

