import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePatientAuthStore } from '../store/patientAuthStore';
import { Phone, ArrowRight, AlertCircle } from 'lucide-react';

export default function PatientLogin() {
  const navigate = useNavigate();
  const { startLogin, error, resetError } = usePatientAuthStore();
  const [phone, setPhone] = useState('');

  useEffect(() => {
    resetError();
  }, [resetError]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    const success = startLogin(phone);
    if (success) {
      navigate('/patient/otp');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-gray-100 text-right">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4">
            <Phone className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">أهلاً بك</h1>
          <p className="text-gray-500">أدخلي رقم جوالك لتأكيد الهوية</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رقم الجوال
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="01012345678"
              className="input-field text-right"
              required
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-lg">
            متابعة
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          ليس لديك حساب؟{' '}
          <Link to="/patient/register" className="text-primary-600 font-semibold">
            سجلي من هنا
          </Link>
        </p>
        <p className="text-center text-xs text-gray-400 mt-2">
          للاختبار يمكنك استخدام رقم <span className="font-semibold">01012345678</span>
        </p>
      </div>
    </div>
  );
}

