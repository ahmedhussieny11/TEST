import { Link } from 'react-router-dom';
import { Calendar, CheckCircle, HeartPulse, Shield, PhoneCall, Star } from 'lucide-react';
import {
  patientServices,
  patientTestimonials,
  patientFaqs,
  patientCardsSample,
} from '@/data/mockData';
import ServiceCard from './components/ServiceCard';
import PatientCard from './components/PatientCard';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Hero */}
      <header className="bg-gradient-to-b from-primary-50 to-white">
        <div className="max-w-6xl mx-auto px-6 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-right">
              <p className="text-primary-600 font-semibold">
                عيادة د. محمد عبدالحكيم لطب النساء والتوليد
              </p>
              <h1 className="text-4xl lg:text-5xl font-bold leading-snug">
                احجزي موعدك في دقائق وتابعي حملك من أي مكان
              </h1>
              <p className="text-gray-600 text-lg">
                نظام إلكتروني متكامل لحجز المواعيد ومتابعة الحمل والروشتات والتحاليل بكل سهولة وخصوصية.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <Link to="/book" className="btn-primary text-center text-lg py-3 px-8">
                  احجزي موعدك الآن
                </Link>
                <a
                  href="#services"
                  className="btn-secondary text-center text-lg py-3 px-8"
                >
                  تعرّفي على خدماتنا
                </a>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-500 justify-end">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary-500" />
                  بدون دفع أونلاين
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary-500" />
                  سرية تامة
                </div>
              </div>
            </div>
            <div className="bg-white shadow-2xl rounded-3xl p-6 border border-gray-100">
              <img
                src="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80"
                alt="عيادة د. محمد عبدالحكيم لطب النساء والتوليد"
                className="rounded-2xl w-full h-[420px] object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      {/* خدمات */}
      <section id="services" className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-primary-600 font-semibold">خدماتنا</p>
            <h2 className="text-3xl font-bold mt-2">كل ما تحتاجينه في مكان واحد</h2>
            <p className="text-gray-500 mt-3">
              اختاري الخدمة المناسبة واحجزيها في ثوانٍ
            </p>
          </div>
        <div className="grid md:grid-cols-3 gap-6">
            {patientServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      {/* خطوات الحجز */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-primary-600 font-semibold">خطوات بسيطة</p>
            <h2 className="text-3xl font-bold mt-2">كيف يتم الحجز؟</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'اختيار الخدمة',
                description: 'اختاري نوع الزيارة المناسبة (كشف، متابعة، سونار).',
                icon: HeartPulse,
              },
              {
                title: 'اختيار اليوم والساعة',
                description: 'اختاري الوقت المناسب لك واستعرضي الساعات المتاحة.',
                icon: Calendar,
              },
              {
                title: 'تأكيد الحجز',
                description: 'صلك رسالة تأكيد وتذكير قبل الموعد.',
                icon: CheckCircle,
              },
            ].map((step) => (
              <div
                key={step.title}
                className="bg-white border border-gray-200 rounded-3xl p-6 text-right"
              >
                <step.icon className="w-10 h-10 text-primary-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* كروت العميلات */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-primary-600 font-semibold">ملفات حية</p>
            <h2 className="text-3xl font-bold mt-2">كيف تظهر بيانات المريضة</h2>
            <p className="text-gray-500 mt-3">
              كل مريضة لها بطاقة ذكية تعرض الحالة، الموعد القادم، والملاحظات المهمة.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {patientCardsSample.map((card) => (
              <PatientCard key={card.id} data={card} highlight={card.id === '1'} />
            ))}
          </div>
        </div>
      </section>

      {/* شهادات */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="font-semibold">آراء المريضات</p>
            <h2 className="text-3xl font-bold mt-2">ثقة نعتز بها</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {patientTestimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white/10 rounded-3xl p-6 backdrop-blur"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-yellow-300" />
                  <Star className="w-5 h-5 text-yellow-300" />
                  <Star className="w-5 h-5 text-yellow-300" />
                  <Star className="w-5 h-5 text-yellow-300" />
                  <Star className="w-5 h-5 text-yellow-300" />
                </div>
                <p className="text-lg mb-4 leading-8">{testimonial.text}</p>
                <p className="font-semibold">{testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-primary-600 font-semibold">أسئلة شائعة</p>
            <h2 className="text-3xl font-bold mt-2">كل ما تحتاجين معرفته</h2>
          </div>
          <div className="space-y-4">
            {patientFaqs.map((faq, idx) => (
              <div
                key={idx}
                className="border border-gray-200 rounded-2xl p-5 bg-white"
              >
                <p className="font-semibold text-lg mb-2">{faq.question}</p>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-3xl font-bold">
            جاهزة للحجز؟ <span className="text-primary-300">موعدك بانتظارك</span>
          </h2>
          <p className="text-gray-300 text-lg">
            احجزي موعدك الآن واحصلي على تذكيرات تلقائية وملف طبي إلكتروني كامل.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/book" className="btn-primary text-lg px-10 py-3">
              احجزي الآن
            </Link>
            <a
              href="tel:01012345678"
              className="btn-secondary text-lg px-10 py-3 flex items-center justify-center gap-2"
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

