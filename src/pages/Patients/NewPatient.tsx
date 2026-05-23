import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { ArrowRight, Zap, FileText, Search } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { UserRole } from '@/types';
import { patientsApi } from '@/api/patients';
import { Patient } from '@/types';

interface PatientFormData {
  name: string;
  phone: string;
  email?: string;
  dateOfBirth: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  previousSurgeries?: string;
  allergies?: string;
  chronicDiseases?: string;
  previousPregnancies?: string;
  previousDeliveries?: string;
  isPregnant: boolean;
  pregnancyWeek?: string;
}

export default function NewPatient() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<PatientFormData>();
  const isPregnant = watch('isPregnant');
  const [quickMode, setQuickMode] = useState(
    user?.role === UserRole.RECEPTION
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Patient[]>([]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      const { data } = await patientsApi.list(query);
      setSearchResults(data);
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectPatient = (patient: Patient) => {
    navigate(`/app/patients/${patient.id}`);
  };

  const onSubmit = async (data: PatientFormData) => {
    try {
      const { data: patient } = await patientsApi.create({
        name: data.name,
        phone: data.phone,
        email: data.email,
        dateOfBirth: data.dateOfBirth,
        address: data.address,
        isPregnant: data.isPregnant,
        pregnancyWeek: data.pregnancyWeek ? parseInt(data.pregnancyWeek, 10) : undefined,
        medicalHistory: {
          previousSurgeries: data.previousSurgeries?.split(',').map((s) => s.trim()),
          allergies: data.allergies?.split(',').map((s) => s.trim()),
          chronicDiseases: data.chronicDiseases?.split(',').map((s) => s.trim()),
          previousPregnancies: data.previousPregnancies ? parseInt(data.previousPregnancies, 10) : undefined,
          previousDeliveries: data.previousDeliveries ? parseInt(data.previousDeliveries, 10) : undefined,
        },
        emergencyContact: data.emergencyContactName
          ? {
              name: data.emergencyContactName,
              phone: data.emergencyContactPhone || '',
              relation: data.emergencyContactRelation || '',
            }
          : undefined,
      });
      toast.success('تم تسجيل المريضة بنجاح');
      navigate(`/app/patients/${patient.id}`);
    } catch {
      toast.error('تعذر تسجيل المريضة');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">تسجيل مريضة جديدة</h1>
          <p className="text-gray-600 mt-1">إضافة ملف مريضة جديد للنظام</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setQuickMode(!quickMode)}
            className={`btn-secondary flex items-center gap-2 ${
              quickMode ? 'bg-primary-100 text-primary-700' : ''
            }`}
          >
            {quickMode ? <FileText className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
            {quickMode ? 'الوضع الكامل' : 'تسجيل سريع'}
          </button>
        </div>
      </div>

      {/* بحث سريع */}
      {quickMode && (
        <div className="card bg-blue-50 border-blue-200">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Search className="w-5 h-5" />
            بحث عن مريضة موجودة
          </h2>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="ابحث بالاسم أو رقم الهاتف..."
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>
          {searchResults.length > 0 && (
            <div className="mt-3 border border-gray-200 rounded-lg bg-white max-h-60 overflow-y-auto">
              {searchResults.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => handleSelectPatient(patient)}
                  className="w-full text-right px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                >
                  <p className="font-medium">{patient.name}</p>
                  <p className="text-sm text-gray-500">{patient.phone}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* البيانات الشخصية */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">البيانات الشخصية</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الاسم الكامل *
              </label>
              <input
                {...register('name', { required: 'الاسم مطلوب' })}
                className="input-field"
                placeholder="اسم المريضة"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم الهاتف *
              </label>
              <input
                {...register('phone', { required: 'رقم الهاتف مطلوب' })}
                className="input-field"
                placeholder="01234567890"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
              )}
            </div>

            {!quickMode && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    {...register('email')}
                    className="input-field"
                    placeholder="example@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تاريخ الميلاد *
                  </label>
                  <input
                    type="date"
                    {...register('dateOfBirth', { required: !quickMode && 'تاريخ الميلاد مطلوب' })}
                    className="input-field"
                  />
                  {errors.dateOfBirth && (
                    <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    العنوان
                  </label>
                  <input
                    {...register('address')}
                    className="input-field"
                    placeholder="العنوان الكامل"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {!quickMode && (
          <>
            {/* جهة الاتصال للطوارئ */}
            <div className="card">
          <h2 className="text-xl font-semibold mb-4">جهة الاتصال للطوارئ</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الاسم
              </label>
              <input
                {...register('emergencyContactName')}
                className="input-field"
                placeholder="اسم جهة الاتصال"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم الهاتف
              </label>
              <input
                {...register('emergencyContactPhone')}
                className="input-field"
                placeholder="01234567890"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                صلة القرابة
              </label>
              <input
                {...register('emergencyContactRelation')}
                className="input-field"
                placeholder="زوج، أب، أخ..."
              />
            </div>
          </div>
        </div>

        {/* التاريخ المرضي */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">التاريخ المرضي</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                العمليات السابقة
              </label>
              <textarea
                {...register('previousSurgeries')}
                rows={3}
                className="input-field"
                placeholder="اذكر العمليات السابقة إن وجدت"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الحساسيات
              </label>
              <textarea
                {...register('allergies')}
                rows={3}
                className="input-field"
                placeholder="اذكر الحساسيات إن وجدت"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الأمراض المزمنة
              </label>
              <textarea
                {...register('chronicDiseases')}
                rows={3}
                className="input-field"
                placeholder="اذكر الأمراض المزمنة إن وجدت"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                حالات الحمل السابقة
              </label>
              <input
                type="number"
                {...register('previousPregnancies')}
                className="input-field"
                placeholder="عدد حالات الحمل"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                حالات الولادة السابقة
              </label>
              <input
                type="number"
                {...register('previousDeliveries')}
                className="input-field"
                placeholder="عدد حالات الولادة"
              />
            </div>
          </div>
        </div>

        {/* حالة الحمل */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">حالة الحمل</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isPregnant"
                {...register('isPregnant')}
                className="w-5 h-5 text-primary-600 rounded"
              />
              <label htmlFor="isPregnant" className="text-sm font-medium text-gray-700">
                المريضة حامل حالياً
              </label>
            </div>

            {isPregnant && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  أسبوع الحمل
                </label>
                <input
                  type="number"
                  min="1"
                  max="42"
                  {...register('pregnancyWeek')}
                  className="input-field"
                  placeholder="أدخل أسبوع الحمل"
                />
              </div>
            )}
          </div>
        </div>

            {/* أزرار */}
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/patients')}
                className="btn-secondary"
              >
                إلغاء
              </button>
              <button type="submit" className="btn-primary flex items-center gap-2">
                {quickMode ? 'تسجيل سريع' : 'حفظ البيانات'}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}

