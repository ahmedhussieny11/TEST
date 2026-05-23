import { useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { Plus, Pencil, Trash2, Pill, Sparkles } from 'lucide-react';
import { toast } from 'react-toastify';
import { prescriptionsApi } from '@/api/prescriptions';
import { patientPortalApi } from '@/api/patientPortal';
import { useAuthStore } from '@/store/authStore';
import { UserRole } from '@/types';
import { normalizeMedications } from '@/utils/medications';
import { pregnancyMonthRangeLabel } from '@/utils/pregnancy';
import PrescriptionTemplateFormModal, {
  TemplateFormValues,
} from './PrescriptionTemplateFormModal';

type RxTemplate = {
  id: string;
  name: string;
  notes?: string | null;
  medications: unknown;
  pregnancyMonthMin?: number | null;
  pregnancyMonthMax?: number | null;
  doctor?: { id: string; name: string };
};

function buildPayload(values: TemplateFormValues) {
  return {
    name: values.name,
    notes: values.notes || undefined,
    medications: values.medications.map(({ id, ...m }) => m),
    pregnancyMonthMin: values.pregnancyMonthMin
      ? Number(values.pregnancyMonthMin)
      : undefined,
    pregnancyMonthMax: values.pregnancyMonthMax
      ? Number(values.pregnancyMonthMax)
      : undefined,
    doctorId: values.doctorId,
  };
}

export default function PrescriptionTemplatesTab() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isAdmin = user?.role === UserRole.ADMIN;
  const [filterDoctorId, setFilterDoctorId] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<RxTemplate | null>(null);

  const { data: doctors = [] } = useQuery('clinic-doctors-rx', () =>
    patientPortalApi.doctors().then((r) => r.data as { id: string; name: string }[])
  );

  const { data: templates = [], isLoading } = useQuery(
    ['prescription-templates', filterDoctorId, user?.id],
    () =>
      prescriptionsApi
        .templates(isAdmin && filterDoctorId ? filterDoctorId : undefined)
        .then((r) => r.data as RxTemplate[]),
    { enabled: !!user }
  );

  const refresh = () => {
    queryClient.invalidateQueries(['prescription-templates']);
    queryClient.invalidateQueries('rx-templates-suggested');
  };

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (tpl: RxTemplate) => {
    setEditing(tpl);
    setModalOpen(true);
  };

  const handleSave = async (values: TemplateFormValues) => {
    const payload = buildPayload(values);
    if (editing) {
      await prescriptionsApi.updateTemplate(editing.id, payload);
      toast.success('تم تحديث القالب');
    } else {
      await prescriptionsApi.createTemplate(payload);
      toast.success('تم إضافة القالب');
    }
    refresh();
  };

  const handleDelete = async (tpl: RxTemplate) => {
    if (!window.confirm(`حذف قالب «${tpl.name}»؟`)) return;
    try {
      await prescriptionsApi.deleteTemplate(tpl.id);
      toast.success('تم الحذف');
      refresh();
    } catch {
      toast.error('تعذر الحذف');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-500" />
            قوالب الروشتات الجاهزة
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            أضيفي قوالب بأسماء وأدوية جاهزة — تظهر تلقائياً أثناء الكشف حسب شهر الحمل
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="btn-primary inline-flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          قالب جديد
        </button>
      </div>

      {isAdmin && (
        <div className="card py-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            عرض قوالب طبيب
          </label>
          <select
            value={filterDoctorId}
            onChange={(e) => setFilterDoctorId(e.target.value)}
            className="input-field max-w-md"
          >
            <option value="">كل الأطباء</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {isLoading ? (
        <p className="text-gray-500">جاري التحميل...</p>
      ) : templates.length === 0 ? (
        <div className="card text-center py-12 text-gray-500">
          <Pill className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p>لا توجد قوالب بعد — اضغطي «قالب جديد» لإنشاء أول روشتة جاهزة</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {templates.map((tpl) => {
            const meds = normalizeMedications(tpl.medications);
            const monthLabel = pregnancyMonthRangeLabel(
              tpl.pregnancyMonthMin,
              tpl.pregnancyMonthMax
            );
            return (
              <div
                key={tpl.id}
                className="card border border-pink-100 hover:border-pink-200 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{tpl.name}</h3>
                    {monthLabel && (
                      <p className="text-xs text-pink-600 mt-1">{monthLabel}</p>
                    )}
                    {isAdmin && tpl.doctor && (
                      <p className="text-xs text-gray-400 mt-0.5">{tpl.doctor.name}</p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEdit(tpl)}
                      className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"
                      title="تعديل"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(tpl)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {tpl.notes && (
                  <p className="text-sm text-gray-600 mb-3 bg-gray-50 rounded-lg p-2">
                    {tpl.notes}
                  </p>
                )}

                <p className="text-xs font-medium text-gray-500 mb-2">
                  {meds.length} دواء
                </p>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  {meds.map((m) => (
                    <li key={m.id}>
                      <span className="font-medium">{m.name}</span> — {m.dosage} —{' '}
                      {m.frequency}
                      {m.duration ? ` (${m.duration})` : ''}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}

      <PrescriptionTemplateFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
        title={editing ? 'تعديل قالب روشتة' : 'قالب روشتة جديد'}
        showDoctorSelect={isAdmin && !editing}
        doctors={doctors}
        initial={
          editing
            ? {
                name: editing.name,
                notes: editing.notes ?? '',
                pregnancyMonthMin:
                  editing.pregnancyMonthMin != null
                    ? String(editing.pregnancyMonthMin)
                    : '',
                pregnancyMonthMax:
                  editing.pregnancyMonthMax != null
                    ? String(editing.pregnancyMonthMax)
                    : '',
                medications: normalizeMedications(editing.medications),
              }
            : undefined
        }
      />
    </div>
  );
}
