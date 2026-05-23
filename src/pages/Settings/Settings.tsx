import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Save, Calendar, Eye, EyeOff, Stethoscope, Building2 } from 'lucide-react';
import { AppointmentSettings, BookingServiceSetting } from '@/types';
import { toast } from 'react-toastify';
import { settingsApi } from '@/api/settings';

const defaultSettings: AppointmentSettings = {
  slotsPerHour: 4,
  workingHours: { start: '09:00', end: '17:00' },
  workingDays: [0, 1, 2, 3, 4, 6],
  prices: {
    newVisit: 300,
    followUp: 200,
    pregnancyCheck: 250,
    sonar: 400,
  },
};

export default function Settings() {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<AppointmentSettings>(defaultSettings);
  const [clinicName, setClinicName] = useState('');
  const [clinicTagline, setClinicTagline] = useState('');
  const [bookingServices, setBookingServices] = useState<BookingServiceSetting[]>([]);

  const { data, isLoading } = useQuery('clinic-settings', () =>
    settingsApi.get().then((r) => r.data)
  );

  useEffect(() => {
    if (!data) return;
    setClinicName(data.clinicName ?? '');
    setClinicTagline(data.clinicTagline ?? '');
    setSettings({
      slotsPerHour: data.slotsPerHour,
      workingHours: data.workingHours as AppointmentSettings['workingHours'],
      workingDays: data.workingDays as number[],
      prices: data.prices as AppointmentSettings['prices'],
    });
    if (data.bookingServices?.length) {
      setBookingServices(data.bookingServices);
    }
  }, [data]);

  const saveMutation = useMutation(
    async () => {
      await settingsApi.update({
        ...settings,
        clinicName: clinicName.trim() || undefined,
        clinicTagline: clinicTagline.trim() || undefined,
        bookingServices,
      });
    },
    {
      onSuccess: () => {
        toast.success('تم حفظ الإعدادات — ستظهر في صفحة الحجز فوراً');
        queryClient.invalidateQueries('clinic-settings');
        queryClient.invalidateQueries('clinic-branding-public');
        queryClient.invalidateQueries('clinic-branding-staff');
        queryClient.invalidateQueries('booking-config');
        queryClient.invalidateQueries('booking-slots');
      },
      onError: () => {
        toast.error('تعذر حفظ الإعدادات');
      },
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(undefined);
  };

  const toggleService = (id: string) => {
    setBookingServices((list) =>
      list.map((s) => (s.id === id ? { ...s, showInBooking: !s.showInBooking } : s))
    );
  };

  const updateServicePrice = (id: string, price: number) => {
    setBookingServices((list) =>
      list.map((s) => (s.id === id ? { ...s, price } : s))
    );
  };

  if (isLoading) {
    return <p className="text-gray-500 p-6">جاري التحميل...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">إعدادات العيادة</h1>
        <p className="text-sm text-gray-500 mt-1">
          التغييرات هنا تنعكس مباشرة على صفحة حجز المريضات (/book)
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card border border-primary-100 bg-gradient-to-br from-white to-primary-50/40">
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2 text-primary-800">
            <Building2 className="w-5 h-5" />
            هوية العيادة
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            يظهر الاسم في صفحة المريضات، التسجيل، والقائمة الجانبية للعيادة
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                اسم العيادة / المركز
              </label>
              <input
                type="text"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                placeholder="مثال: عيادة د. سارة لطب النساء"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                وصف قصير (تحت الاسم)
              </label>
              <input
                type="text"
                value={clinicTagline}
                onChange={(e) => setClinicTagline(e.target.value)}
                placeholder="مثال: طب النساء والتوليد"
                className="input-field"
              />
            </div>
            {clinicName.trim() && (
              <div className="rounded-xl border border-primary-100 bg-white p-4">
                <p className="text-xs text-gray-500 mb-2">معاينة الشكل:</p>
                <p className="text-lg font-bold bg-gradient-to-l from-primary-700 to-primary-500 bg-clip-text text-transparent">
                  {clinicName}
                </p>
                {clinicTagline.trim() && (
                  <p className="text-sm text-gray-500 mt-0.5">{clinicTagline}</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="card border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            المواعيد
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                عدد الحالات في الساعة
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={settings.slotsPerHour}
                onChange={(e) =>
                  setSettings({ ...settings, slotsPerHour: parseInt(e.target.value, 10) || 1 })
                }
                className="input-field"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">من</label>
                <input
                  type="time"
                  value={settings.workingHours.start}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      workingHours: { ...settings.workingHours, start: e.target.value },
                    })
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">إلى</label>
                <input
                  type="time"
                  value={settings.workingHours.end}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      workingHours: { ...settings.workingHours, end: e.target.value },
                    })
                  }
                  className="input-field"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">أيام العمل</label>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {['أحد', 'إثن', 'ثلث', 'أربع', 'خميس', 'جمعة', 'سبت'].map((day, index) => (
                  <label
                    key={index}
                    className="flex items-center gap-1 p-2 border rounded-lg cursor-pointer text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={settings.workingDays.includes(index)}
                      onChange={(e) => {
                        setSettings({
                          ...settings,
                          workingDays: e.target.checked
                            ? [...settings.workingDays, index]
                            : settings.workingDays.filter((d) => d !== index),
                        });
                      }}
                      className="rounded"
                    />
                    {day}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="card border border-gray-100">
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Stethoscope className="w-5 h-5" />
            خدمات صفحة الحجز
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            اخفي أو اظهري أي خدمة في صفحة /book — السعر يظهر للمريضة مباشرة
          </p>
          <div className="space-y-3">
            {bookingServices.map((service) => (
              <div
                key={service.id}
                className={`flex flex-wrap items-center gap-3 p-3 rounded-xl border ${
                  service.showInBooking
                    ? 'border-gray-200 bg-white'
                    : 'border-gray-100 bg-gray-50 opacity-75'
                }`}
              >
                <div className="flex-1 min-w-[120px]">
                  <p className="font-medium text-gray-900">{service.name}</p>
                  <p className="text-xs text-gray-400">
                    {service.showInBooking ? 'ظاهرة للمرضى' : 'مخفية عن صفحة الحجز'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    value={service.price}
                    onChange={(e) =>
                      updateServicePrice(service.id, parseInt(e.target.value, 10) || 0)
                    }
                    className="input-field w-24 text-center"
                    dir="ltr"
                  />
                  <span className="text-sm text-gray-500">ج.م</span>
                </div>
                <button
                  type="button"
                  onClick={() => toggleService(service.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    service.showInBooking
                      ? 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {service.showInBooking ? (
                    <>
                      <Eye className="w-4 h-4" />
                      إخفاء
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-4 h-4" />
                      إظهار
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={saveMutation.isLoading}
          className="btn-primary flex items-center gap-2"
        >
          <Save className="w-5 h-5" />
          {saveMutation.isLoading ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </button>
      </form>
    </div>
  );
}
