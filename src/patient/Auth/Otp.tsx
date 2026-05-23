import { Navigate } from 'react-router-dom';

/** لم يعد OTP مستخدماً — إعادة توجيه لتسجيل الدخول */
export default function PatientOtp() {
  return <Navigate to="/patient/login" replace />;
}
