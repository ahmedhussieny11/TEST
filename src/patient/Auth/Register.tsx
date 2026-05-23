import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { UserPlus, ArrowLeft, AlertCircle } from 'lucide-react';
import { usePatientAuthStore } from '../store/patientAuthStore';
import {
  readRedirectParam,
  setPatientRedirect,
  getPatientRedirect,
  clearPatientRedirect,
} from '../utils/patientRedirect';
import PatientAuthShell from '../components/PatientAuthShell';

export default function PatientRegister() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { startRegistration, error, resetError, isAuthenticated } = usePatientAuthStore();
  const redirectTo = readRedirectParam(searchParams.toString()) || '/patient/dashboard';
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    resetError();
    setPatientRedirect(redirectTo);
  }, [resetError, redirectTo]);

  useEffect(() => {
    if (isAuthenticated) navigate(redirectTo, { replace: true });
  }, [isAuthenticated, navigate, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !age.trim() || !address.trim()) return;
    const ageNum = parseInt(age, 10);
    if (Number.isNaN(ageNum) || ageNum < 1 || ageNum > 120) return;
    setLoading(true);
    const success = await startRegistration(
      name.trim(),
      phone.trim(),
      email.trim() || undefined,
      ageNum,
      address.trim()
    );
    setLoading(false);
    if (success) {
      const target = getPatientRedirect(redirectTo);
      clearPatientRedirect();
      navigate(target, { replace: true });
    }
  };

  return (
    <PatientAuthShell
      title="إنشاء حساب"
      subtitle="بيانات بسيطة — دخول فوري بدون رمز تحقق"
      icon={<UserPlus className="w-7 h-7 text-white" />}
      footer={
        <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center text-sm text-gray-600">
          <p>
            لديك حساب بالفعل؟{' '}
            <Link
              to={`/patient/login?redirect=${encodeURIComponent(redirectTo)}`}
              className="text-primary-600 font-bold hover:underline"
            >
              سجّلي دخولك
            </Link>
          </p>
        </div>
      }
    >
      <ul className="text-xs text-gray-500 space-y-1.5 mb-6 bg-slate-50 rounded-xl p-4 border border-slate-100">
        <li>✓ حجز أسرع بدون إعادة كتابة بياناتك</li>
        <li>✓ متابعة المواعيد والروشتات</li>
        <li>✓ مجاني — بدون اشتراك</li>
      </ul>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الكامل</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثال: هدى علي"
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">رقم الجوال</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="01xxxxxxxxx"
            className="input-field"
            dir="ltr"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">العمر</label>
          <input
            type="number"
            min={1}
            max={120}
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="مثال: 28"
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">العنوان</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="مثال: القاهرة — المعادي"
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            البريد الإلكتروني <span className="text-gray-400 font-normal">(اختياري)</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@mail.com"
            className="input-field"
            dir="ltr"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3.5 text-lg flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
        >
          {loading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}
          <ArrowLeft className="w-5 h-5" />
        </button>
      </form>
    </PatientAuthShell>
  );
}
