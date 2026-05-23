import { useEffect, useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { normalizeMedications } from '@/utils/medications';

export type TemplateMedication = {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
};

export type TemplateFormValues = {
  name: string;
  notes: string;
  pregnancyMonthMin: string;
  pregnancyMonthMax: string;
  medications: TemplateMedication[];
  doctorId?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (values: TemplateFormValues) => Promise<void>;
  initial?: Partial<TemplateFormValues> & { id?: string };
  title: string;
  showDoctorSelect?: boolean;
  doctors?: { id: string; name: string }[];
};

const emptyMed = (): TemplateMedication => ({
  id: `${Date.now()}-${Math.random()}`,
  name: '',
  dosage: '',
  frequency: '',
  duration: '',
  instructions: '',
});

export default function PrescriptionTemplateFormModal({
  open,
  onClose,
  onSave,
  initial,
  title,
  showDoctorSelect,
  doctors = [],
}: Props) {
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [pregnancyMonthMin, setPregnancyMonthMin] = useState('');
  const [pregnancyMonthMax, setPregnancyMonthMax] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [medications, setMedications] = useState<TemplateMedication[]>([emptyMed()]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? '');
    setNotes(initial?.notes ?? '');
    setPregnancyMonthMin(
      initial?.pregnancyMonthMin != null && initial.pregnancyMonthMin !== ''
        ? String(initial.pregnancyMonthMin)
        : ''
    );
    setPregnancyMonthMax(
      initial?.pregnancyMonthMax != null && initial.pregnancyMonthMax !== ''
        ? String(initial.pregnancyMonthMax)
        : ''
    );
    setDoctorId(initial?.doctorId ?? doctors[0]?.id ?? '');
    const meds = initial?.medications?.length
      ? initial.medications.map((m) => ({ ...m, id: m.id || `${Date.now()}-${Math.random()}` }))
      : normalizeMedications(initial?.medications as unknown).map((m) => ({
          ...m,
          id: m.id || `${Date.now()}-${Math.random()}`,
        }));
    setMedications(meds.length ? meds : [emptyMed()]);
  }, [open, initial, doctors]);

  if (!open) return null;

  const updateMed = (id: string, field: keyof TemplateMedication, value: string) => {
    setMedications((list) =>
      list.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('أدخلي اسم القالب');
      return;
    }
    const validMeds = medications.filter(
      (m) => m.name.trim() && m.dosage.trim() && m.frequency.trim()
    );
    if (validMeds.length === 0) {
      toast.error('أضيفي دواءً واحداً على الأقل (الاسم، الجرعة، التكرار)');
      return;
    }
    if (showDoctorSelect && !doctorId) {
      toast.error('اختاري الطبيب');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        notes: notes.trim(),
        pregnancyMonthMin,
        pregnancyMonthMax,
        medications: validMeds,
        doctorId: showDoctorSelect ? doctorId : undefined,
      });
      onClose();
    } catch {
      toast.error('تعذر حفظ القالب');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{title}</h2>
          <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {showDoctorSelect && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الطبيب</label>
              <select
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                className="input-field"
              >
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              اسم القالب *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="مثال: الثلث الأول — أشهر 1-3"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                من شهر حمل (اختياري)
              </label>
              <select
                value={pregnancyMonthMin}
                onChange={(e) => setPregnancyMonthMin(e.target.value)}
                className="input-field"
              >
                <option value="">كل الأشهر</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((m) => (
                  <option key={m} value={m}>
                    شهر {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                إلى شهر حمل (اختياري)
              </label>
              <select
                value={pregnancyMonthMax}
                onChange={(e) => setPregnancyMonthMax(e.target.value)}
                className="input-field"
              >
                <option value="">كل الأشهر</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((m) => (
                  <option key={m} value={m}>
                    شهر {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ملاحظات على الروشتة (اختياري)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="input-field"
              placeholder="مثال: مكملات أساسية بداية الحمل"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">الأدوية *</label>
              <button
                type="button"
                onClick={() => setMedications([...medications, emptyMed()])}
                className="text-sm text-primary-600 inline-flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                إضافة دواء
              </button>
            </div>

            <div className="space-y-4">
              {medications.map((med, index) => (
                <div
                  key={med.id}
                  className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      دواء {index + 1}
                    </span>
                    {medications.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setMedications(medications.filter((m) => m.id !== med.id))
                        }
                        className="text-red-500 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={med.name}
                    onChange={(e) => updateMed(med.id, 'name', e.target.value)}
                    className="input-field"
                    placeholder="اسم الدواء"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={med.dosage}
                      onChange={(e) => updateMed(med.id, 'dosage', e.target.value)}
                      className="input-field"
                      placeholder="الجرعة"
                    />
                    <input
                      type="text"
                      value={med.frequency}
                      onChange={(e) => updateMed(med.id, 'frequency', e.target.value)}
                      className="input-field"
                      placeholder="التكرار"
                    />
                  </div>
                  <input
                    type="text"
                    value={med.duration}
                    onChange={(e) => updateMed(med.id, 'duration', e.target.value)}
                    className="input-field"
                    placeholder="المدة (اختياري)"
                  />
                  <input
                    type="text"
                    value={med.instructions ?? ''}
                    onChange={(e) => updateMed(med.id, 'instructions', e.target.value)}
                    className="input-field"
                    placeholder="تعليمات (اختياري)"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2 border-t">
            <button type="button" onClick={onClose} className="btn-secondary">
              إلغاء
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'جاري الحفظ...' : 'حفظ القالب'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
