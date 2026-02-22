import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { UserRole } from '@/types';
import { toast } from 'react-toastify';
import { Stethoscope } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // محاكاة تسجيل الدخول - في التطبيق الحقيقي سيتم الاتصال بالـ API
    setTimeout(() => {
      // بيانات تجريبية
      const mockUser = {
        id: '1',
        name: 'د. محمد عبدالحكيم',
        email: formData.email,
        phone: '01234567890',
        role: formData.email.includes('admin') 
          ? UserRole.ADMIN 
          : formData.email.includes('reception')
          ? UserRole.RECEPTION
          : UserRole.DOCTOR,
        createdAt: new Date().toISOString(),
      };

      login(mockUser, 'mock-token');
      toast.success('تم تسجيل الدخول بنجاح');
      navigate('/app');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
              <Stethoscope className="w-8 h-8 text-primary-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              نظام عيادة د. محمد عبدالحكيم
            </h1>
            <p className="text-gray-600">عيادة د. محمد عبدالحكيم لطب النساء والتوليد</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="input-field"
                placeholder="example@clinic.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                كلمة المرور
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="input-field"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-lg"
            >
              {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-2">بيانات تجريبية:</p>
            <p className="text-xs text-gray-500">
              دكتور: doctor@clinic.com<br />
              استقبال: reception@clinic.com<br />
              مشرف: admin@clinic.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

