import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { UserRole } from '@/types';
import { toast } from 'react-toastify';
import { Stethoscope } from 'lucide-react';
import { authApi } from '@/api/auth';

function redirectByRole(role: UserRole, navigate: ReturnType<typeof useNavigate>) {
  if (role === UserRole.RECEPTION) {
    navigate('/app/queue');
  } else {
    navigate('/app');
  }
}

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const email = formData.email.trim().toLowerCase();
      const password = formData.password.trim();
      const { data } = await authApi.login(email, password);
      const user = {
        ...data.user,
        role: data.user.role as UserRole,
        createdAt: String(data.user.createdAt),
      };
      login(user, data.token);
      toast.success('تم تسجيل الدخول بنجاح');
      redirectByRole(user.role, navigate);
    } catch (err: unknown) {
      const axiosErr = err as {
        code?: string;
        response?: { data?: { message?: string | string[] } };
      };
      let msg = 'بيانات الدخول غير صحيحة';
      if (axiosErr?.code === 'ERR_NETWORK') {
        msg = 'تعذر الاتصال بالخادم — شغّل الـ Backend أولاً: cd backend ثم npm run start:dev';
      } else if (axiosErr?.response?.data?.message) {
        const m = axiosErr.response.data.message;
        msg = Array.isArray(m) ? m[0] : m;
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-primary-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-50 rounded-xl mb-4">
              <Stethoscope className="w-7 h-7 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">نظام العيادة</h1>
            <p className="text-sm text-gray-500">طب النساء والتوليد</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field"
                placeholder="doctor@clinic.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                كلمة المرور
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input-field"
                placeholder="••••••••"
              />
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary py-2.5">
              {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </button>
          </form>

          <div className="mt-6 p-3 bg-slate-50 rounded-lg text-xs text-gray-500 space-y-1">
            <p className="font-medium text-gray-600">حسابات التجربة — كلمة المرور: clinic123</p>
            <p>doctor@clinic.com · reception@clinic.com · admin@clinic.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}