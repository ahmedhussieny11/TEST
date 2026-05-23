import { useState } from 'react';
import { useQuery } from 'react-query';
import {
  Plus,
  Trash2,
  Printer,
  Upload,
  Pill,
  Sparkles,
  Image as ImageIcon,
  Save,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { prescriptionsApi } from '@/api/prescriptions';
import { filesApi } from '@/api/files';
import { normalizeMedications } from '@/utils/medications';
import { printPrescription } from '@/utils/printPrescription';
import { weekToPregnancyMonth, pregnancyMonthLabel } from '@/utils/pregnancy';
import { format } from 'date-fns';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

interface RxTemplate {
  id: string;
  name: string;
  medications: Medication[];
  notes?: string;
  pregnancyMonthMin?: number | null;
  pregnancyMonthMax?: number | null;
}

interface Props {
  visitId: string;
  patientId: string;
  patientName: string;
  doctorId?: string;
  pregnancyWeek?: number | null;
  visitPrescriptions?: Array<{
    id: string;
    visitId?: string;
    createdAt: string;
    medications: unknown;
    notes?: string;
  }>;
  prescriptionImages?: Array<{
    id: string;
    fileName: string;
    filePath: string;
    visitId?: string | null;
  }>;
  onSaved: () => void;
}

export default function VisitPrescriptionsPanel({
  visitId,
  patientId,
  patientName,
  doctorId,
  pregnancyWeek,
  visitPrescriptions = [],
  prescriptionImages = [],
  onSaved,
}: Props) {
  const pregnancyMonth = weekToPregnancyMonth(pregnancyWeek ?? undefined);

  const [medications, setMedications] = useState<Medication[]>([]);
  const [notes, setNotes] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
  });

  const { data: suggestedTemplates = [] } = useQuery(
    ['rx-templates-suggested', pregnancyMonth, doctorId],
    () =>
      prescriptionsApi
        .suggestedTemplates({
          pregnancyMonth,
          doctorId,
        })
        .then((r) => r.data as RxTemplate[]),
    { enabled: true }
  );

  const visitRx = visitPrescriptions.filter((rx) => rx.visitId === visitId);
  const visitImages = prescriptionImages.filter((img) => img.visitId === visitId);

  const handleAddMedication = () => {
    if (!formData.name || !formData.dosage || !formData.frequency) {
      toast.error('أدخلي اسم الدواء والجرعة والتكرار');
      return;
    }
    setMedications([
      ...medications,
      { id: `${Date.now()}`, ...formData },
    ]);
    setFormData({ name: '', dosage: '', frequency: '', duration: '', instructions: '' });
    setShowAddForm(false);
  };

  const applyTemplate = (tpl: RxTemplate) => {
    const meds = normalizeMedications(tpl.medications).map((m) => ({
      ...m,
      id: `${m.id}-${Date.now()}`,
    }));
    setMedications(meds);
    if (tpl.notes) setNotes(tpl.notes);
    toast.success(`تم تطبيق قالب: ${tpl.name}`);
  };

  const handleSaveRx = async (doPrint: boolean) => {
    if (medications.length === 0) {
      toast.error('أضيفي دواء واحداً على الأقل');
      return;
    }
    setSaving(true);
    try {
      const { data } = await prescriptionsApi.create({
        visitId,
        patientId,
        medications,
        notes: notes || undefined,
        doctorId,
      });
      toast.success('تم حفظ الروشتة');
      setMedications([]);
      setNotes('');
      onSaved();
      if (doPrint) {
        printPrescription({
          patientName,
          createdAt: format(new Date(data.createdAt), 'yyyy-MM-dd'),
          medications: normalizeMedications(data.medications ?? medications),
          notes: data.notes ?? notes,
        });
      }
    } catch {
      toast.error('تعذر حفظ الروشتة');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        await filesApi.upload(file, patientId, visitId, 'prescription');
      }
      toast.success('تم رفع صور الروشتة');
      onSaved();
    } catch {
      toast.error('تعذر رفع الصور');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="card bg-pink-50 border-pink-100">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-pink-600" />
          <h3 className="font-semibold text-gray-900">
            {pregnancyMonth
              ? `قوالب روشتات — ${pregnancyMonthLabel(pregnancyMonth)} (أسبوع ${pregnancyWeek})`
              : 'قوالب روشتات جاهزة'}
          </h3>
        </div>
        <p className="text-sm text-gray-600 mb-3">
            اضغطي على قالب لملء الأدوية تلقائياً، ثم عدّلي واحفظي.
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedTemplates.length > 0 ? (
              suggestedTemplates.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => applyTemplate(tpl)}
                  className="text-sm px-3 py-2 rounded-lg border border-pink-200 bg-white hover:bg-pink-100 transition-colors"
                >
                  {tpl.name}
                  {tpl.pregnancyMonthMin != null && tpl.pregnancyMonthMax != null && (
                    <span className="text-xs text-gray-500 block">
                      شهر {tpl.pregnancyMonthMin}
                      {tpl.pregnancyMonthMax !== tpl.pregnancyMonthMin
                        ? `–${tpl.pregnancyMonthMax}`
                        : ''}
                    </span>
                  )}
                </button>
              ))
            ) : (
              <p className="text-sm text-gray-500">لا توجد قوالب لهذا الشهر — اكتبي الروشتة يدوياً.</p>
            )}
          </div>
      </div>

      <div className="card border border-gray-100">
        <h3 className="font-semibold flex items-center gap-2 mb-4">
          <Pill className="w-5 h-5 text-primary-600" />
          كتابة روشتة يدوياً
        </h3>

        {medications.length > 0 && (
          <div className="space-y-2 mb-4">
            {medications.map((med) => (
              <div
                key={med.id}
                className="flex justify-between items-start border rounded-lg p-3 bg-slate-50"
              >
                <div>
                  <p className="font-medium">{med.name}</p>
                  <p className="text-sm text-gray-600">
                    {med.dosage} — {med.frequency}
                    {med.duration ? ` — ${med.duration}` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMedications(medications.filter((m) => m.id !== med.id))}
                  className="text-red-600 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {showAddForm ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <input
              className="input-field"
              placeholder="اسم الدواء *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <input
              className="input-field"
              placeholder="الجرعة *"
              value={formData.dosage}
              onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
            />
            <input
              className="input-field"
              placeholder="التكرار *"
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
            />
            <input
              className="input-field"
              placeholder="المدة"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            />
            <div className="md:col-span-2 flex gap-2">
              <button type="button" onClick={handleAddMedication} className="btn-primary text-sm">
                إضافة
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="btn-secondary text-sm"
              >
                إلغاء
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="btn-secondary w-full flex items-center justify-center gap-2 mb-4"
          >
            <Plus className="w-4 h-4" />
            إضافة دواء
          </button>
        )}

        <textarea
          className="input-field mb-4"
          rows={2}
          placeholder="ملاحظات على الروشتة..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="flex flex-wrap gap-2 justify-end">
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSaveRx(false)}
            className="btn-secondary flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            حفظ الروشتة
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSaveRx(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            حفظ وطباعة
          </button>
        </div>
      </div>

      <div className="card border border-gray-100">
        <h3 className="font-semibold flex items-center gap-2 mb-3">
          <Upload className="w-5 h-5" />
          رفع صورة روشتة (مكتوبة أو مصورة)
        </h3>
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
          <ImageIcon className="w-10 h-10 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-2">صورة من الروشتة الورقية أو PDF</p>
          <input
            type="file"
            multiple
            accept="image/*,.pdf"
            onChange={handleUploadImages}
            disabled={uploading}
            className="text-sm"
          />
          {uploading && <p className="text-sm text-gray-500 mt-2">جاري الرفع...</p>}
        </div>
        {visitImages.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            {visitImages.map((img) => (
              <a
                key={img.id}
                href={img.filePath}
                target="_blank"
                rel="noreferrer"
                className="border rounded-lg p-2 text-center hover:bg-gray-50"
              >
                <ImageIcon className="w-6 h-6 mx-auto text-primary-500" />
                <p className="text-xs truncate mt-1">{img.fileName}</p>
              </a>
            ))}
          </div>
        )}
      </div>

      {visitRx.length > 0 && (
        <div className="card">
          <h3 className="font-semibold mb-3">روشتات هذه الزيارة</h3>
          <div className="space-y-3">
            {visitRx.map((rx) => {
              const meds = normalizeMedications(rx.medications);
              return (
                <div key={rx.id} className="border rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-2">
                    {format(new Date(rx.createdAt), 'yyyy-MM-dd HH:mm')}
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-700">
                    {meds.map((m) => (
                      <li key={m.id}>
                        {m.name} — {m.dosage} — {m.frequency}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
