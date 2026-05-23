import { useEffect, useState } from 'react';
import { X, Search, Clock, User, UserPlus } from 'lucide-react';
import { UserRole, VisitType } from '@/types';
import { format } from 'date-fns';
import { useQuery } from 'react-query';
import { patientsApi } from '@/api/patients';
import { appointmentsApi } from '@/api/appointments';
import { patientPortalApi } from '@/api/patientPortal';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'react-toastify';
import VisitTypeSelect from '@/components/ClinicalVisit/VisitTypeSelect';

const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00',
];

type PatientMode = 'search' | 'new';

interface BookAppointmentModalProps {
  onClose: () => void;
  selectedDate?: Date;
  onSuccess?: () => void;
}

export default function BookAppointmentModal({
  onClose,
  selectedDate = new Date(),
  onSuccess,
}: BookAppointmentModalProps) {
  const [patientMode, setPatientMode] = useState<PatientMode>('search');
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [searchPatient, setSearchPatient] = useState('');
  const [quickName, setQuickName] = useState('');
  const [quickPhone, setQuickPhone] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [visitType, setVisitType] = useState<VisitType>(VisitType.NEW);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { user } = useAuthStore();

  const { data: doctors = [] } = useQuery('clinic-doctors', () =>
    patientPortalApi.doctors().then((r) => r.data)
  );

  const { data: patientsList = [] } = useQuery(
    ['patients-book', searchPatient],
    () => patientsApi.list(searchPatient).then((r) => r.data),
    { enabled: patientMode === 'search' && searchPatient.length > 1 }
  );

  const slots = TIME_SLOTS;

  useEffect(() => {
    setSelectedTime('');
  }, [selectedDate]);

  const resolvePatientId = async (): Promise<string | null> => {
    if (patientMode === 'search') {
      return selectedPatient || null;
    }
    if (!quickName.trim() || !quickPhone.trim()) {
      toast.error('أدخلي اسم المريضة ورقم الموبايل');
      return null;
    }
    const { data: patient } = await patientsApi.quickRegister({
      name: quickName.trim(),
      phone: quickPhone.trim(),
    });
    return patient.id;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const doctorId =
      user?.role === UserRole.DOCTOR ? user.id : doctors[0]?.id;
    if (!selectedTime || !doctorId) {
      toast.error('أكملي البيانات المطلوبة');
      return;
    }

    setSubmitting(true);
    try {
      const patientId = await resolvePatientId();
      if (!patientId) {
        setSubmitting(false);
        return;
      }

      await appointmentsApi.create({
        patientId,
        doctorId,
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
        type: visitType,
        notes,
      });
      toast.success(
        patientMode === 'new'
          ? 'تم تسجيل المريضة وحجز الموعد — يمكنها الدخول برقم الموبايل'
          : 'تم حجز الموعد'
      );
      onSuccess?.();
      onClose();
    } catch {
      toast.error('تعذر حجز الموعد — قد يكون الوقت محجوزاً');
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit =
    selectedTime &&
    (patientMode === 'search'
      ? !!selectedPatient
      : quickName.trim().length >= 2 && quickPhone.trim().length >= 8);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">حجز موعد جديد</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              المريضة
            </label>
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setPatientMode('search')}
                className={`flex-1 py-2 rounded-lg border text-sm font-medium flex items-center justify-center gap-2 ${
                  patientMode === 'search'
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'border-gray-200'
                }`}
              >
                <Search className="w-4 h-4" />
                بحث
              </button>
              <button
                type="button"
                onClick={() => {
                  setPatientMode('new');
                  setSelectedPatient('');
                }}
                className={`flex-1 py-2 rounded-lg border text-sm font-medium flex items-center justify-center gap-2 ${
                  patientMode === 'new'
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'border-gray-200'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                تسجيل سريع
              </button>
            </div>

            {patientMode === 'search' ? (
              <>
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchPatient}
                    onChange={(e) => setSearchPatient(e.target.value)}
                    placeholder="اسم المريضة أو رقم الهاتف..."
                    className="input-field pr-10"
                  />
                </div>
                {searchPatient.length > 1 && (
                  <div className="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                    {patientsList.length === 0 ? (
                      <p className="p-4 text-sm text-gray-500 text-center">
                        لا نتائج — جرّبي «تسجيل سريع»
                      </p>
                    ) : (
                      patientsList.map((patient) => (
                        <button
                          key={patient.id}
                          type="button"
                          onClick={() => {
                            setSelectedPatient(patient.id);
                            setSearchPatient(patient.name);
                          }}
                          className={`w-full text-right px-4 py-3 hover:bg-gray-50 flex items-center gap-3 ${
                            selectedPatient === patient.id ? 'bg-primary-50' : ''
                          }`}
                        >
                          <User className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="font-medium">{patient.name}</p>
                            <p className="text-sm text-gray-500">{patient.phone}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">اسم المريضة</label>
                  <input
                    type="text"
                    value={quickName}
                    onChange={(e) => setQuickName(e.target.value)}
                    className="input-field"
                    placeholder="الاسم الكامل"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">رقم الموبايل</label>
                  <input
                    type="tel"
                    value={quickPhone}
                    onChange={(e) => setQuickPhone(e.target.value)}
                    className="input-field"
                    placeholder="01xxxxxxxxx"
                    dir="ltr"
                    required
                  />
                </div>
                <p className="sm:col-span-2 text-xs text-primary-700 bg-primary-50 rounded-lg p-3">
                  يُنشأ حساب تلقائياً — تستطيع الدخول لاحقاً بنفس رقم الموبايل من بوابة المريضة
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              التاريخ
            </label>
            <input
              type="date"
              value={format(selectedDate, 'yyyy-MM-dd')}
              readOnly
              className="input-field bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اختيار الوقت
            </label>
            <div className="grid grid-cols-4 gap-3">
              {slots.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setSelectedTime(time)}
                  className={`p-3 border-2 rounded-lg text-center transition-colors ${
                    selectedTime === time
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-300 hover:border-primary-300'
                  }`}
                >
                  <Clock className="w-4 h-4 mx-auto mb-1" />
                  <p className="text-sm font-medium">{time}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نوع الكشف
            </label>
            <VisitTypeSelect value={visitType} onChange={setVisitType} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ملاحظات (اختياري)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="input-field"
              placeholder="أي ملاحظات إضافية..."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="btn-secondary">
              إلغاء
            </button>
            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="btn-primary"
            >
              {submitting ? 'جاري الحجز...' : 'حجز الموعد'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
