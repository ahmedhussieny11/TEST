import { useState } from 'react';
import { useQuery } from 'react-query';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import { labsApi } from '@/api/labs';
import { patientsApi } from '@/api/patients';
import { Patient } from '@/types';

const COMMON_TESTS = [
  'سكر صائم',
  'سكر بعد الأكل',
  'HbA1c',
  'صورة دم كاملة',
  'وظائف كلى',
  'وظائف كبد',
  'تحليل بول',
  'هرمون TSH',
  'فيتامين د',
  'حديد',
];

interface Props {
  onClose: () => void;
  onCreated: () => void;
  defaultPatientId?: string;
  visitId?: string;
}

export default function NewLabRequestModal({
  onClose,
  onCreated,
  defaultPatientId,
  visitId,
}: Props) {
  const [patientId, setPatientId] = useState(defaultPatientId ?? '');
  const [search, setSearch] = useState('');
  const [testName, setTestName] = useState('');
  const [saving, setSaving] = useState(false);

  const { data: patients = [] } = useQuery(
    ['patients-search-lab', search],
    () => patientsApi.list(search).then((r) => r.data),
    { enabled: !defaultPatientId && search.length > 1 }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !testName.trim()) {
      toast.error('اختر المريضة واسم التحليل');
      return;
    }
    setSaving(true);
    try {
      await labsApi.create({
        patientId,
        testName: testName.trim(),
        visitId,
      });
      toast.success('تم طلب التحليل');
      onCreated();
      onClose();
    } catch {
      toast.error('تعذر طلب التحليل');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full border border-gray-100">
        <div className="flex justify-between items-center px-5 py-4 border-b">
          <h2 className="text-lg font-bold">طلب تحليل جديد</h2>
          <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {!defaultPatientId && (
            <div>
              <label className="text-sm font-medium text-gray-700">بحث مريضة</label>
              <input
                className="input-field mt-1"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="الاسم أو الهاتف"
              />
              {patients.length > 0 && (
                <ul className="mt-2 border rounded-lg max-h-32 overflow-y-auto">
                  {patients.map((p: Patient) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        className={`w-full text-right px-3 py-2 text-sm hover:bg-primary-50 ${
                          patientId === p.id ? 'bg-primary-50 font-medium' : ''
                        }`}
                        onClick={() => {
                          setPatientId(p.id);
                          setSearch(p.name);
                        }}
                      >
                        {p.name} — {p.phone}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700">اسم التحليل *</label>
            <input
              className="input-field mt-1"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              placeholder="مثال: سكر صائم"
              list="common-lab-tests"
            />
            <datalist id="common-lab-tests">
              {COMMON_TESTS.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </div>

          <div className="flex flex-wrap gap-2">
            {COMMON_TESTS.slice(0, 6).map((t) => (
              <button
                key={t}
                type="button"
                className="text-xs px-2 py-1 rounded-full bg-slate-100 hover:bg-slate-200"
                onClick={() => setTestName(t)}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              إلغاء
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'جاري الحفظ...' : 'طلب التحليل'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
