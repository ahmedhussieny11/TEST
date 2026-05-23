import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { usePatientAuthStore } from '../store/patientAuthStore';
import { LogIn, ArrowLeft, AlertCircle } from 'lucide-react';
import {
  readRedirectParam,
  setPatientRedirect,
  getPatientRedirect,
  clearPatientRedirect,
} from '../utils/patientRedirect';
import PatientAuthShell from '../components/PatientAuthShell';

export default function PatientLogin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { startLogin, error, resetError, isAuthenticated } = usePatientAuthStore();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectTo = readRedirectParam(searchParams.toString()) || '/patient/dashboard';

  useEffect(() => {
    resetError();
    setPatientRedirect(redirectTo);
  }, [resetError, redirectTo]);

  useEffect(() => {
    if (isAuthenticated) navigate(redirectTo, { replace: true });
  }, [isAuthenticated, navigate, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);
    const success = await startLogin(phone.trim());
    setLoading(false);
    if (success) {
      const target = getPatientRedirect(redirectTo);
      clearPatientRedirect();
      navigate(target, { replace: true });
    }
  };

  return (
    <PatientAuthShell
      title="تسجيل الدخول"
      subtitle="أدخلي رقم الجوال المسجّل في العيادة — دخول مباشر بدون رمز"
      icon={<LogIn className="w-7 h-7 text-white" />}
      footer={
        <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center text-sm text-gray-600">
          <p>
            ليس لديك حساب؟{' '}
            <Link
              to={`/patient/register?redirect=${encodeURIComponent(redirectTo)}`}
              className="text-primary-600 font-bold hover:underline"
            >
              أنشئي حساباً مجاناً
            </Link>
          </p>
          <p className="text-xs text-gray-400 mt-3">
            للتجربة: رقم <span className="font-semibold text-gray-600">01012345678</span>
          </p>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">رقم الجوال</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="01xxxxxxxxx"
            className="input-field text-lg"
            dir="ltr"
            required
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
          className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-lg disabled:opacity-60"
        >
          {loading ? 'جاري الدخول...' : 'تسجيل الدخول'}
          <ArrowLeft className="w-5 h-5" />
        </button>
      </form>
    </PatientAuthShell>
  );
}
