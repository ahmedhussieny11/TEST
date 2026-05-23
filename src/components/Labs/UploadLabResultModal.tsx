import { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import { labsApi } from '@/api/labs';
import { LabTest } from '@/types';

interface Props {
  lab: LabTest & { patient?: { name: string } };
  onClose: () => void;
  onSaved: () => void;
}

export default function UploadLabResultModal({ lab, onClose, onSaved }: Props) {
  const [value, setValue] = useState(lab.results?.value ?? '');
  const [unit, setUnit] = useState(lab.results?.unit ?? '');
  const [normalRange, setNormalRange] = useState(lab.results?.normalRange ?? '');
  const [notes, setNotes] = useState(lab.results?.notes ?? '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) {
      toast.error('أدخلي قيمة النتيجة');
      return;
    }
    setSaving(true);
    try {
      await labsApi.updateResults(lab.id, {
        value: value.trim(),
        unit: unit.trim() || undefined,
        normalRange: normalRange.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      toast.success('تم حفظ النتيجة');
      onSaved();
      onClose();
    } catch {
      toast.error('تعذر حفظ النتيجة');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full border border-gray-100">
        <div className="flex justify-between items-center px-5 py-4 border-b">
          <h2 className="text-lg font-bold">رفع نتيجة — {lab.testName}</h2>
          <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {lab.patient?.name && (
            <p className="text-sm text-gray-600">المريضة: {lab.patient.name}</p>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700">النتيجة *</label>
            <input
              className="input-field mt-1"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="مثال: 95"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700">الوحدة</label>
              <input
                className="input-field mt-1"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="mg/dL"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">المعدل الطبيعي</label>
              <input
                className="input-field mt-1"
                value={normalRange}
                onChange={(e) => setNormalRange(e.target.value)}
                placeholder="70-100"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">ملاحظات</label>
            <textarea
              className="input-field mt-1"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose} className="btn-secondary">
              إلغاء
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'جاري الحفظ...' : 'حفظ النتيجة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
