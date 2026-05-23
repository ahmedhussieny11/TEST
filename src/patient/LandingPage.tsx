import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  Calendar,
  CheckCircle,
  HeartPulse,
  LogIn,
  PhoneCall,
  UserPlus,
  FileText,
  CalendarCheck,
} from 'lucide-react';
import { publicBookingApi } from '@/api/publicBooking';
import ServiceCard from './components/ServiceCard';
import PatientSiteHeader from './components/PatientSiteHeader';
import BookAppointmentButton from '@/components/Branding/BookAppointmentButton';
import { usePatientAuthStore } from './store/patientAuthStore';

export default function LandingPage() {
  const { isAuthenticated, patient } = usePatientAuthStore();
  const { data: config, isLoading } = useQuery('booking-config', () =>
    publicBookingApi.getConfig().then((r) => r.data)
  );

  const services = config?.services ?? [];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <PatientSiteHeader />

      <header className="bg-gradient-to-b from-primary-50 to-white border-b border-primary-100/50">
        <div className="max-w-4xl mx-auto px-6 py-12 lg:py-16 text-center">
          <p className="text-primary-600 font-semibold text-sm sm:text-base">
            {config?.branding?.name ?? 'عيادة د. محمد عبدالحكيم'}
            {config?.branding?.tagline ? ` — ${config.branding.tagline}` : ''}
          </p>
          <h1 className="text-4xl lg:text-5xl font-bold leading-snug mt-3 text-gray-900">
            احجزي موعدك بسهولة
          </h1>
          <p className="text-gray-600 text-lg mt-4 max-w-xl mx-auto">
            احجزي فوراً كضيفة، أو أنشئي حساباً لمتابعة مواعيدك وروشتك في أي وقت.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mt-8">
            <BookAppointmentButton to="/book" className="text-base px-6 py-3.5" />
            <a href="#services" className="btn-secondary text-lg py-3.5 px-8">
              الخدمات والأسعار
            </a>
          </div>

          {!isAuthenticated && (
            <div className="mt-10 max-w-lg mx-auto bg-white rounded-2xl border-2 border-primary-100 shadow-lg shadow-primary-900/5 p-6 sm:p-7 text-right">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center shrink-0">
                  <UserPlus className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">حساب المريضة</h2>
                  <p className="text-sm text-gray-500">مجاني — للمتابعة والحجز الأسرع</p>
                </div>
              </div>
              <ul className="text-sm text-gray-600 space-y-2 mb-5">
                <li className="flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-primary-500 shrink-0" />
                  متابعة مواعيدك القادمة
                </li>
                <li className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary-500 shrink-0" />
                  الروشتات والتحاليل في مكان واحد
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary-500 shrink-0" />
                  حجز بدون إعادة كتابة بياناتك
                </li>
              </ul>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/patient/register"
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-primary-600 text-white font-semibold py-3 px-5 rounded-xl hover:bg-primary-700 transition-colors"
                >
                  <UserPlus className="w-5 h-5" />
                  إنشاء حساب مجاني
                </Link>
                <Link
                  to="/patient/login"
                  className="flex-1 inline-flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-700 font-semibold py-3 px-5 rounded-xl hover:border-primary-400 hover:text-primary-700 transition-colors bg-white"
                >
                  <LogIn className="w-5 h-5" />
                  تسجيل الدخول
                </Link>
              </div>
            </div>
          )}

          {isAuthenticated && patient && (
            <div className="mt-8 inline-flex items-center gap-3 bg-primary-50 border border-primary-200 rounded-2xl px-6 py-4">
              <p className="text-gray-700">
                أهلاً <strong>{patient.name}</strong> — حسابك نشط
              </p>
              <Link
                to="/patient/dashboard"
                className="text-sm font-semibold text-primary-600 hover:underline"
              >
                لوحة المتابعة
              </Link>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 justify-center mt-8">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary-500" />
              بدون دفع أونلاين
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary-500" />
              حجز بدون حساب متاح
            </span>
          </div>
        </div>
      </header>

      <section id="services" className="py-14 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold">الخدمات والأسعار</h2>
            <p className="text-gray-500 mt-2">نفس الأسعار في صفحة الحجز</p>
          </div>
          {isLoading ? (
            <p className="text-center text-gray-500">جاري التحميل...</p>
          ) : services.length === 0 ? (
            <div className="text-center bg-white rounded-2xl border border-gray-200 p-8">
              <p className="text-gray-500 mb-4">لا توجد خدمات معروضة حالياً</p>
              <Link to="/book" className="btn-primary inline-block">
                جرّبي صفحة الحجز
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  name={service.name}
                  price={service.price}
                  description={service.description || undefined}
                />
              ))}
            </div>
          )}
          <div className="text-center mt-8">
            <Link to="/book" className="text-primary-600 font-semibold hover:underline">
              انتقلي لصفحة الحجز ←
            </Link>
          </div>
        </div>
      </section>

      <section className="py-14 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-10">كيف تحجزين؟</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                title: 'اختاري الخدمة',
                description: 'كشف، متابعة، سونار — حسب ما تحتاجينه.',
                icon: HeartPulse,
              },
              {
                title: 'اختاري اليوم والساعة',
                description: 'شوفي المواعيد المتاحة واحجزي الوقت المناسب.',
                icon: Calendar,
              },
              {
                title: 'أكّدي الحجز',
                description: 'ضيفة أو بحسابك — والدفع في العيادة.',
                icon: CheckCircle,
              },
            ].map((step) => (
              <div
                key={step.title}
                className="bg-white border border-gray-200 rounded-2xl p-5 text-right shadow-sm"
              >
                <step.icon className="w-9 h-9 text-primary-500 mb-3" />
                <h3 className="text-lg font-semibold mb-1">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 bg-gray-900 text-white">
        <div className="max-w-xl mx-auto px-6 text-center space-y-5">
          <h2 className="text-2xl font-bold">جاهزة للحجز؟</h2>
          <p className="text-gray-300">موعدك بانتظارك — من الموبايل أو الكمبيوتر.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/book" className="btn-primary text-lg px-8 py-3">
              احجزي الآن
            </Link>
            {!isAuthenticated && (
              <Link
                to="/patient/register"
                className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/30 text-white text-lg px-8 py-3 rounded-xl hover:bg-white/20 transition-colors"
              >
                <UserPlus className="w-5 h-5" />
                إنشاء حساب
              </Link>
            )}
            <a
              href="tel:01012345678"
              className="btn-secondary text-lg px-8 py-3 flex items-center justify-center gap-2"
            >
              <PhoneCall className="w-5 h-5" />
              اتصلي بنا
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
