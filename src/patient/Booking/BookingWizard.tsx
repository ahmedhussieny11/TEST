import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { addDays, format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from 'react-toastify';
import { Calendar, CheckCircle2, LogOut, Phone, User } from 'lucide-react';
import { publicBookingApi } from '@/api/publicBooking';
import { patientPortalApi } from '@/api/patientPortal';
import { usePatientAuthStore } from '../store/patientAuthStore';
import { setPatientRedirect } from '../utils/patientRedirect';
import PatientSiteHeader from '../components/PatientSiteHeader';

export default function BookingWizard() {
  const { patient, isAuthenticated, logout } = usePatientAuthStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (isAuthenticated && patient) {
      setName(patient.name);
      setPhone(patient.phone);
    }
  }, [isAuthenticated, patient]);

  const {
    data: config,
    isLoading: configLoading,
    isError: configError,
    refetch: refetchConfig,
  } = useQuery('booking-config', () => publicBookingApi.getConfig().then((r) => r.data), {
    retry: 2,
  });

  const services = config?.services ?? [];
  const doctors = config?.doctors ?? [];
  const doctorId = doctors[0]?.id;
  const selectedService = services.find((s) => s.id === serviceId);

  const { data: slotsData, isLoading: slotsLoading } = useQuery(
    ['booking-slots', selectedDate, doctorId],
    () => publicBookingApi.getSlots(selectedDate, doctorId).then((r) => r.data),
    { enabled: !!selectedDate && !!doctorId }
  );

  const upcomingDays = useMemo(() => {
    const days: {
      date: string;
      weekday: string;
      dateLabel: string;
      disabled: boolean;
    }[] = [];
    const workingDays = config?.settings.workingDays ?? [0, 1, 2, 3, 4, 6];
    for (let i = 0; i < 14; i++) {
      const d = addDays(new Date(), i);
      const dateStr = format(d, 'yyyy-MM-dd');
      days.push({
        date: dateStr,
        weekday: format(d, 'EEE', { locale: ar }),
        dateLabel: format(d, 'd MMM', { locale: ar }),
        disabled: !workingDays.includes(d.getDay()),
      });
    }
    return days;
  }, [config]);

  const handleBook = async () => {
    if (!isAuthenticated && (!name.trim() || !phone.trim())) {
      toast.error('اكتبي اسمك ورقم الموبايل');
      return;
    }
    if (!serviceId || !selectedTime || !doctorId) {
      toast.error('اختاري الخدمة والموعد');
      return;
    }
    setSubmitting(true);
    try {
      if (isAuthenticated && patient) {
        await patientPortalApi.book({
          doctorId,
          date: selectedDate,
          time: selectedTime,
          serviceId,
        });
      } else {
        await publicBookingApi.guestBook({
          name: name.trim(),
          phone: phone.trim(),
          serviceId,
          date: selectedDate,
          time: selectedTime,
          doctorId,
        });
      }
      setDone(true);
      toast.success('تم الحجز بنجاح!');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'تعذر إتمام الحجز';
      toast.error(typeof msg === 'string' ? msg : 'تعذر إتمام الحجز');
    } finally {
      setSubmitting(false);
    }
  };

  const loginHref = '/patient/login?redirect=/book';
  const registerHref = '/patient/register?redirect=/book';

  if (configLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <p className="text-gray-600">جاري تحميل بيانات الحجز...</p>
      </div>
    );
  }

  if (configError || !config) {
    return (
      <div className="min-h-screen bg-slate-50">
        <PatientSiteHeader />
        <div className="max-w-md mx-auto mt-16 p-6 card text-center space-y-4">
          <p className="text-red-600 font-medium">تعذر تحميل صفحة الحجز</p>
          <p className="text-sm text-gray-600">
            تأكدي أن السيرفر يعمل وأن الرابط يشير إلى الموقع الصحيح.
          </p>
          <button type="button" onClick={() => refetchConfig()} className="btn-primary">
            إعادة المحاولة
          </button>
          <Link to="/" className="btn-secondary inline-block">
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">تم تأكيد حجزك</h1>
          <p className="text-gray-600">
            {selectedService?.name} — {selectedDate} الساعة {selectedTime}
          </p>
          {selectedService && (
            <p className="mt-3 mb-6 text-primary-700 font-semibold bg-primary-50 rounded-xl px-4 py-3 text-sm">
              المبلغ المتوقع: {selectedService.price.toLocaleString()} ج.م
              <span className="block font-normal text-gray-600 mt-1">
                الدفع في العيادة عند الوصول — احتفظي برقم جوالك
              </span>
            </p>
          )}
          {!selectedService && <p className="mb-6" />}
          <div className="flex flex-col gap-3">
            {isAuthenticated ? (
              <Link to="/patient/dashboard" className="btn-primary inline-block">
                لوحة المتابعة
              </Link>
            ) : null}
            <Link to="/" className="btn-secondary inline-block">
              العودة للرئيسية
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PatientSiteHeader />
      <div className="max-w-lg mx-auto space-y-5 py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">حجز موعد</h1>
          <p className="text-sm text-gray-500 mt-1">
            {isAuthenticated
              ? `مرحباً ${patient?.name} — اختاري الخدمة والموعد`
              : 'بدون حساب أو سجّلي دخولك لحجز أسرع'}
          </p>
        </div>

        {isAuthenticated && patient ? (
          <section className="card border border-primary-100 bg-primary-50/50">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-gray-900 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {patient.name}
                </p>
                <p className="text-sm text-gray-600 mt-1" dir="ltr">
                  {patient.phone}
                </p>
              </div>
              <button
                type="button"
                onClick={() => logout()}
                className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1"
              >
                <LogOut className="w-3 h-3" />
                خروج
              </button>
            </div>
          </section>
        ) : (
          <section className="card border border-gray-100 space-y-3">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <User className="w-4 h-4" /> بياناتك
            </h2>
            <input
              className="input-field"
              placeholder="الاسم الكامل"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="input-field"
              placeholder="رقم الموبايل"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              dir="ltr"
            />
            <p className="text-xs text-gray-500 text-center pt-1">
              عندك حساب؟{' '}
              <Link
                to={loginHref}
                className="text-primary-600 font-medium"
                onClick={() => setPatientRedirect('/book')}
              >
                سجّلي دخول
              </Link>
              {' · '}
              <Link
                to={registerHref}
                className="text-primary-600 font-medium"
                onClick={() => setPatientRedirect('/book')}
              >
                إنشاء حساب
              </Link>
            </p>
          </section>
        )}

        <section className="card border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-3">نوع الزيارة</h2>
          <div className="space-y-2">
            {services.length === 0 ? (
              <p className="text-sm text-gray-500">لا توجد خدمات متاحة للحجز حالياً.</p>
            ) : (
            services.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setServiceId(s.id)}
                className={`w-full text-right p-3 rounded-xl border transition-colors ${
                  serviceId === s.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-200'
                }`}
              >
                <div className="flex justify-between items-center gap-2">
                  <span className="font-medium">{s.name}</span>
                  <span className="text-primary-600 font-semibold whitespace-nowrap">
                    {s.price} ج.م
                  </span>
                </div>
              </button>
            ))
            )}
          </div>
        </section>

        {!doctorId && (
          <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3">
            لا يوجد طبيب مسجّل للحجز الإلكتروني — تواصلي مع العيادة.
          </p>
        )}

        <section className="card border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> اليوم
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {upcomingDays.map((day) => (
              <button
                key={day.date}
                type="button"
                disabled={day.disabled}
                onClick={() => {
                  setSelectedDate(day.date);
                  setSelectedTime(null);
                }}
                className={`py-2 px-1 rounded-lg text-sm border text-center ${
                  day.disabled
                    ? 'opacity-40 cursor-not-allowed border-gray-100'
                    : selectedDate === day.date
                      ? 'border-primary-500 bg-primary-50 text-primary-700 font-semibold'
                      : 'border-gray-200 hover:border-primary-300'
                }`}
              >
                {day.weekday}
                <span className="block text-[10px] text-gray-500 font-normal">
                  {day.dateLabel}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="card border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Phone className="w-4 h-4" /> الساعة
            {slotsData?.slotsPerHour && (
              <span className="text-xs font-normal text-gray-400">
                (حتى {slotsData.slotsPerHour} حالات/ساعة)
              </span>
            )}
          </h2>
          {slotsLoading ? (
            <p className="text-sm text-gray-500">جاري تحميل المواعيد...</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {(slotsData?.slots ?? []).map((slot) => (
                <button
                  key={slot.time}
                  type="button"
                  disabled={slot.isFull}
                  onClick={() => setSelectedTime(slot.time)}
                  className={`py-2 px-1 rounded-lg text-sm border ${
                    slot.isFull
                      ? 'opacity-40 line-through border-gray-100'
                      : selectedTime === slot.time
                        ? 'border-primary-500 bg-primary-50 font-semibold'
                        : 'border-gray-200 hover:border-primary-300'
                  }`}
                >
                  {slot.time}
                  {!slot.isFull && (
                    <span className="block text-[10px] text-gray-400">
                      {slot.remaining} متاح
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </section>

        {selectedService && selectedTime && (
          <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 text-sm">
            <p>
              <strong>{selectedService.name}</strong> — {selectedService.price} ج.م
            </p>
            <p className="text-gray-600 mt-1">
              {selectedDate} الساعة {selectedTime}
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={handleBook}
          disabled={submitting}
          className="w-full btn-primary py-3 text-lg"
        >
          {submitting ? 'جاري الحجز...' : 'تأكيد الحجز'}
        </button>

        {!isAuthenticated && (
          <p className="text-center text-xs text-gray-400">
            الدفع في العيادة عند الوصول
          </p>
        )}
      </div>
    </div>
  );
}
