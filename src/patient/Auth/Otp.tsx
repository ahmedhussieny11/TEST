import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePatientAuthStore } from '../store/patientAuthStore';
import { ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';

export default function PatientOtp() {
  const navigate = useNavigate();
  const {
    pendingPhone,
    pendingName,
    lastOtp,
    otpExpiresAt,
    verifyOtp,
    resendOtp,
    error,
    resetError,
  } = usePatientAuthStore();
  const [code, setCode] = useState('');
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  useEffect(() => {
    resetError();
  }, [resetError]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;
    const success = verifyOtp(code);
    if (success) {
      navigate('/patient/dashboard');
    }
  };

  if (!pendingPhone) {
    navigate('/patient/login');
    return null;
  }

  const expiresLabel = useMemo(() => {
    if (!otpExpiresAt) return null;
    return new Date(otpExpiresAt).toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [otpExpiresAt]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-gray-100 text-right">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4">
            <ShieldCheck className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">رمز التحقق</h1>
          <p className="text-gray-500">
            تم إرسال الرمز إلى <span className="font-semibold">{pendingPhone}</span>
          </p>
          {pendingName && (
            <p className="text-xs text-gray-400 mt-1">مرحباً {pendingName}، أدخلي الرمز أدناه.</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              أدخلي الرمز المكون من 6 أرقام
            </label>
            <input
              type="tel"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              className="input-field text-center tracking-[1rem] text-2xl"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary w-full py-3 text-lg"
          >
            تأكيد
          </button>
        </form>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-2xl px-4 py-3 mt-4">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-6 text-sm text-gray-600 space-y-2">
          <button
            onClick={() => {
              const newOtp = resendOtp();
              if (newOtp) {
                setResendMessage(`تم إرسال رمز جديد: ${newOtp}`);
              }
            }}
            className="text-primary-600 font-semibold flex items-center gap-2 w-full justify-center"
            type="button"
          >
            <RefreshCw className="w-4 h-4" />
            لم يصلك الرمز؟ أعيدي الإرسال
          </button>
          {resendMessage && <p className="text-center text-xs text-primary-500">{resendMessage}</p>}
          {expiresLabel && (
            <p className="text-center text-xs text-gray-400">ينتهي الرمز في {expiresLabel}</p>
          )}
          {lastOtp && (
            <p className="text-center text-xs text-gray-400">
              (للتجربة فقط) الرمز الحالي: <span className="font-semibold text-primary-600">{lastOtp}</span>
            </p>
          )}
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            أدخلت رقم خاطئ؟{' '}
            <Link to="/patient/login" className="text-primary-600 font-semibold">
              عودي لاختيار رقم آخر
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

