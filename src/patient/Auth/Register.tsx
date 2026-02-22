import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Phone, ClipboardCheck } from 'lucide-react';
import { usePatientAuthStore } from '../store/patientAuthStore';

export default function PatientRegister() {
  const navigate = useNavigate();
  const { startRegistration, error, resetError } = usePatientAuthStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);

  useEffect(() => {
    resetError();
  }, [resetError]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    const result = startRegistration(name, phone, email || undefined);
    setDevOtp(result.otp);
    navigate('/patient/otp');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl p-8 border border-gray-100 text-right">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4">
            <UserPlus className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">إنشاء حساب للمتابعة</h1>
          <p className="text-gray-500">
            سجلي بياناتك الأساسية لتحصلي على لوحة متابعة مخصصة وكل الزيارات والتحاليل في مكان واحد.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الكامل</label>
            <div className="relative">
              <UserPlus className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: هدى علي"
                className="input-field text-right"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">رقم الجوال</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01012345678"
                className="input-field text-right"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني (اختياري)</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@mail.com"
                className="input-field text-right"
              />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full py-3 text-lg flex items-center justify-center gap-2">
            إنشاء الحساب
            <ClipboardCheck className="w-5 h-5" />
          </button>
        </form>

        {error && (
          <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
            {error}
          </div>
        )}

        {devOtp && (
          <div className="mt-4 text-xs text-primary-600 bg-primary-50 border border-primary-100 rounded-2xl px-4 py-3 text-center">
            (للتجربة) رمز OTP الحالي: <span className="font-semibold">{devOtp}</span>
          </div>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          لديك حساب بالفعل؟{' '}
          <Link to="/patient/login" className="text-primary-600 font-semibold">
            سجلي الدخول
          </Link>
        </p>
      </div>
    </div>
  );
}

