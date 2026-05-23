import { useState } from 'react';
import { X, Plus, Trash2, Printer } from 'lucide-react';
import { toast } from 'react-toastify';
import { prescriptionsApi } from '@/api/prescriptions';
import { printPrescription } from '@/utils/printPrescription';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface PrescriptionModalProps {
  onClose: () => void;
  onSaved?: () => void;
  visitId: string;
  patientId: string;
  patientName?: string;
}

export default function PrescriptionModal({
  onClose,
  onSaved,
  visitId,
  patientId,
  patientName,
}: PrescriptionModalProps) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
  });

  const handleAddMedication = () => {
    if (!formData.name || !formData.dosage || !formData.frequency) {
      toast.error('يرجى إدخال البيانات المطلوبة');
      return;
    }

    const newMedication: Medication = {
      id: Date.now().toString(),
      ...formData,
    };

    setMedications([...medications, newMedication]);
    setFormData({
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
    });
    setShowAddForm(false);
  };

  const handleRemoveMedication = (id: string) => {
    setMedications(medications.filter((m) => m.id !== id));
  };

  const handleSave = async (doPrint: boolean) => {
    if (medications.length === 0) {
      toast.error('أضف دواء واحداً على الأقل');
      return;
    }
    try {
      const { data } = await prescriptionsApi.create({
        visitId,
        patientId,
        medications,
      });
      toast.success('تم حفظ الروشتة بنجاح');
      onSaved?.();
      if (doPrint) {
        printPrescription({
          patientName: patientName ?? 'مريضة',
          createdAt: new Date(data.createdAt).toLocaleDateString('ar-EG'),
          medications,
        });
      }
      onClose();
    } catch {
      toast.error('تعذر حفظ الروشتة');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">كتابة الروشتة</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* قائمة الأدوية */}
          {medications.length > 0 && (
            <div className="space-y-3">
              {medications.map((med) => (
                <div
                  key={med.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{med.name}</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                        <p>
                          <span className="font-medium">الجرعة:</span> {med.dosage}
                        </p>
                        <p>
                          <span className="font-medium">التكرار:</span> {med.frequency}
                        </p>
                        <p>
                          <span className="font-medium">المدة:</span> {med.duration}
                        </p>
                      </div>
                      {med.instructions && (
                        <p className="text-sm text-gray-600 mt-2">
                          <span className="font-medium">تعليمات:</span> {med.instructions}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveMedication(med.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* إضافة دواء جديد */}
          {showAddForm ? (
            <div className="border border-gray-200 rounded-lg p-4 space-y-4">
              <h3 className="font-semibold">إضافة دواء جديد</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اسم الدواء *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="input-field"
                    placeholder="اسم الدواء"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الجرعة *
                  </label>
                  <input
                    type="text"
                    value={formData.dosage}
                    onChange={(e) =>
                      setFormData({ ...formData, dosage: e.target.value })
                    }
                    className="input-field"
                    placeholder="مثال: 500 مجم"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    التكرار *
                  </label>
                  <input
                    type="text"
                    value={formData.frequency}
                    onChange={(e) =>
                      setFormData({ ...formData, frequency: e.target.value })
                    }
                    className="input-field"
                    placeholder="مثال: 3 مرات يومياً"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المدة
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    className="input-field"
                    placeholder="مثال: 7 أيام"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تعليمات إضافية
                  </label>
                  <textarea
                    value={formData.instructions}
                    onChange={(e) =>
                      setFormData({ ...formData, instructions: e.target.value })
                    }
                    rows={2}
                    className="input-field"
                    placeholder="تعليمات خاصة..."
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleAddMedication}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  إضافة
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({
                      name: '',
                      dosage: '',
                      frequency: '',
                      duration: '',
                      instructions: '',
                    });
                  }}
                  className="btn-secondary"
                >
                  إلغاء
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full btn-secondary flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              إضافة دواء
            </button>
          )}

          {/* أزرار */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button onClick={onClose} className="btn-secondary">
              إلغاء
            </button>
            <button
              type="button"
              onClick={() => handleSave(false)}
              className="btn-secondary"
            >
              حفظ
            </button>
            <button
              type="button"
              onClick={() => handleSave(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Printer className="w-5 h-5" />
              حفظ وطباعة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

