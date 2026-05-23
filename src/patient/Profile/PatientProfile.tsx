import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { ArrowRight, Save, User } from 'lucide-react';
import { toast } from 'react-toastify';
import { patientPortalApi } from '@/api/patientPortal';
import { usePatientAuthStore } from '../store/patientAuthStore';

function ageFromDateOfBirth(dob?: string | null): string {
  if (!dob) return '';
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return '';
  const age = new Date().getFullYear() - birth.getFullYear();
  return String(age);
}

export default function PatientProfile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { patient, isAuthenticated } = usePatientAuthStore();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [age, setAge] = useState('');

  const { data, isLoading } = useQuery(
    ['patient-profile', patient?.id],
    () => patientPortalApi.me().then((r) => r.data),
    { enabled: !!patient?.id }
  );

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/patient/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const p = data?.patient ?? patient;
    if (!p) return;
    setName(p.name ?? '');
    setPhone(p.phone ?? '');
    setEmail(p.email ?? '');
    setAddress((p as { address?: string }).address ?? '');
    setAge(ageFromDateOfBirth((p as { dateOfBirth?: string }).dateOfBirth));
  }, [data, patient]);

  const saveMutation = useMutation(
    () =>
      patientPortalApi.updateProfile({
        name: name.trim(),
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        age: age ? Number(age) : undefined,
      }),
    {
      onSuccess: (res) => {
        const updated = res.data;
        usePatientAuthStore.setState({
          patient: {
            id: updated.id,
            name: updated.name,
            phone: updated.phone,
            email: updated.email ?? undefined,
          },
        });
        void queryClient.invalidateQueries(['patient-profile']);
        void queryClient.invalidateQueries(['patient-portal']);
        void toast.success('تم حفظ بياناتك');
      },
      onError: () => {
        void toast.error('تعذر حفظ البيانات');
      },
    }
  );

  if (isLoading && !patient) {
    return <p className="text-center py-12 text-gray-500">جاري التحميل...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-lg mx-auto px-6">
        <Link
          to="/patient/dashboard"
          className="inline-flex items-center gap-2 text-primary-600 mb-6 text-sm"
        >
          <ArrowRight className="w-4 h-4" />
          العودة للوحة التحكم
        </Link>

        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
              <User className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold">بياناتي الشخصية</h1>
              <p className="text-sm text-gray-500">عدّلي اسمك، عمرك، عنوانك، والبريد</p>
            </div>
          </div>

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              saveMutation.mutate();
            }}
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                رقم الموبايل (للدخول)
              </label>
              <input
                type="tel"
                value={phone}
                readOnly
                className="input-field bg-gray-50 text-gray-600"
                dir="ltr"
              />
              <p className="text-xs text-gray-500 mt-1">
                للدخول استخدمي هذا الرقم من صفحة تسجيل الدخول
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">العمر (سنة)</label>
              <input
                type="number"
                min={1}
                max={120}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="input-field"
                placeholder="مثال: 28"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="input-field"
                placeholder="المدينة، الحي..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                البريد الإلكتروني (اختياري)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                dir="ltr"
              />
            </div>

            <button
              type="submit"
              disabled={saveMutation.isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saveMutation.isLoading ? 'جاري الحفظ...' : 'حفظ التعديلات'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
