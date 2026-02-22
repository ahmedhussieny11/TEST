import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDays, format } from 'date-fns';
import { toast } from 'react-toastify';
import { Calendar, CheckCircle, ArrowRight } from 'lucide-react';
import { patientServices, getAvailableSlots } from '@/data/mockData';
import { VisitType } from '@/types';
import ServiceCard from '../components/ServiceCard';
import StepIndicator from '../components/StepIndicator';
import TimeSlotButton from '../components/TimeSlotButton';
import { usePatientAuthStore } from '../store/patientAuthStore';
import { usePatientDataStore } from '../store/patientDataStore';

const steps = ['اختيار الخدمة', 'اختيار اليوم', 'اختيار الساعة', 'تأكيد الحجز'];

export default function BookingWizard() {
  const navigate = useNavigate();
  const { patient, isAuthenticated } = usePatientAuthStore();
  const { setPatientId, bookAppointment } = usePatientDataStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState(patientServices[0]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const upcomingDays = useMemo(
    () => Array.from({ length: 7 }, (_, idx) => addDays(new Date(), idx)),
    []
  );

  const slots = useMemo(() => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return getAvailableSlots(dateStr);
  }, [selectedDate]);

  const handleNext = () => {
    if (currentStep === 1 && !selectedService) {
      toast.error('يرجى اختيار خدمة');
      return;
    }
    if (currentStep === 2 && !selectedDate) {
      toast.error('يرجى اختيار اليوم');
      return;
    }
    if (currentStep === 3 && !selectedSlot) {
      toast.error('يرجى اختيار الساعة');
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleConfirm = () => {
    if (!isAuthenticated) {
      toast.info('يرجى تسجيل الدخول أولاً');
      navigate('/patient/login');
      return;
    }

    if (!selectedService || !selectedSlot) return;

    setIsSubmitting(true);
    if (patient) {
      setPatientId(patient.id);
    }

    const appointment = bookAppointment({
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      date: format(selectedDate, 'yyyy-MM-dd'),
      time: selectedSlot,
      type: selectedService.type as VisitType,
    });

    if (appointment) {
      toast.success('تم حجز الموعد بنجاح');
      navigate('/patient/dashboard');
    } else {
      toast.error('حدث خطأ أثناء الحجز');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <div className="text-right mb-8">
          <p className="text-primary-600 font-semibold">حجز موعد جديد</p>
          <h1 className="text-3xl font-bold">معالج الحجز</h1>
        </div>

        <StepIndicator steps={steps} currentStep={currentStep} />

        {/* Step content */}
        <div className="space-y-8">
          {currentStep === 1 && (
            <div className="grid md:grid-cols-2 gap-6">
              {patientServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  isActive={service.id === selectedService.id}
                  onSelect={(srv) => {
                    setSelectedService(srv);
                    setSelectedSlot(null);
                  }}
                />
              ))}
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <p className="text-gray-600 mb-4">اختاري اليوم المناسب</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {upcomingDays.map((day) => {
                  const isSelected =
                    format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => {
                        setSelectedDate(day);
                        setSelectedSlot(null);
                      }}
                      className={`border rounded-2xl p-4 text-right ${
                        isSelected
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-200'
                      }`}
                    >
                      <p className="text-sm text-gray-500">{format(day, 'EEEE')}</p>
                      <p className="text-xl font-bold">{format(day, 'dd')}</p>
                      <p className="text-sm text-gray-500">{format(day, 'MMMM')}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <div className="flex items-center gap-2 mb-4 text-gray-600">
                <Calendar className="w-5 h-5" />
                <span>الساعات المتاحة في {format(selectedDate, 'yyyy-MM-dd')}</span>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {slots.map((slot) => (
                  <TimeSlotButton
                    key={slot.time}
                    time={slot.time}
                    remaining={slot.remaining}
                    disabled={slot.isFull}
                    isSelected={selectedSlot === slot.time}
                    onSelect={setSelectedSlot}
                  />
                ))}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="bg-gray-50 border border-gray-200 rounded-3xl p-6 space-y-4 text-right">
              <p className="text-primary-600 font-semibold">تأكيد الحجز</p>
              <h2 className="text-2xl font-bold text-gray-900">{selectedService.name}</h2>
              <div className="grid md:grid-cols-2 gap-4 text-gray-700">
                <div>
                  <p className="text-sm text-gray-500">التاريخ</p>
                  <p className="font-medium">{format(selectedDate, 'yyyy-MM-dd')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">الساعة</p>
                  <p className="font-medium">{selectedSlot}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">السعر</p>
                  <p className="font-medium">{selectedService.price} ج.م</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">نوع الخدمة</p>
                  <p className="font-medium">
                    {selectedService.type === VisitType.PREGNANCY_CHECK
                      ? 'متابعة حمل'
                      : 'كشف / استشارة'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <CheckCircle className="w-5 h-5 text-green-500" />
                الدفع يتم في العيادة، وسيتم إرسال تذكير قبل الموعد.
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          {currentStep > 1 && (
            <button onClick={handleBack} className="btn-secondary flex-1">
              رجوع
            </button>
          )}
          {currentStep < steps.length && (
            <button onClick={handleNext} className="btn-primary flex-1 flex items-center justify-center gap-2">
              التالي
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
          {currentStep === steps.length && (
            <button
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="btn-primary flex-1"
            >
              {isSubmitting ? 'جاري التأكيد...' : 'تأكيد الحجز'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

