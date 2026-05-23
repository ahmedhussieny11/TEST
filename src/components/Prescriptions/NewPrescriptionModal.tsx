import { useState } from 'react';
import { useQuery } from 'react-query';
import { X, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { prescriptionsApi } from '@/api/prescriptions';
import { visitsApi } from '@/api/visits';
import { patientsApi } from '@/api/patients';
import { patientPortalApi } from '@/api/patientPortal';
import { useAuthStore } from '@/store/authStore';
import { Patient, UserRole } from '@/types';
import { printPrescription } from '@/utils/printPrescription';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface Props {
  onClose: () => void;
  onCreated: () => void;
  defaultPatientId?: string;
}

export default function NewPrescriptionModal({
  onClose,
  onCreated,
  defaultPatientId,
}: Props) {
  const { user } = useAuthStore();
  const [patientId, setPatientId] = useState(defaultPatientId ?? '');
  const [doctorId, setDoctorId] = useState(user?.role === UserRole.DOCTOR ? user.id : '');
  const [search, setSearch] = useState('');
  const [medications, setMedications] = useState<Medication[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
  });
  const [saving, setSaving] = useState(false);

  const { data: patients = [] } = useQuery(
    ['patients-search-rx', search],
    () => patientsApi.list(search).then((r) => r.data),
    { enabled: !defaultPatientId && search.length > 1 }
  );

  const { data: doctors = [] } = useQuery('clinic-doctors-rx', () =>
    patientPortalApi.doctors().then((r) => r.data as { id: string; name: string }[])
  );

  const selectedPatient = patients.find((p: Patient) => p.id === patientId);

  const handleAddMedication = () => {
    if (!formData.name || !formData.dosage || !formData.frequency) {
      toast.error('أدخلي اسم الدواء والجرعة والتكرار');
      return;
    }
    setMedications([
      ...medications,
      { id: Date.now().toString(), ...formData },
    ]);
    setFormData({ name: '', dosage: '', frequency: '', duration: '', instructions: '' });
    setShowAddForm(false);
  };

  const handleSave = async (doPrint: boolean) => {
    const effectiveDoctorId =
      user?.role === UserRole.DOCTOR ? user.id : doctorId || doctors[0]?.id;
    if (!patientId || !effectiveDoctorId) {
      toast.error('اختر المريضة والطبيب');
      return;
    }
    if (medications.length === 0) {
      toast.error('أضيفي دواء واحداً على الأقل');
      return;
    }
    setSaving(true);
    try {
      const visitRes = await visitsApi.create({
        patientId,
        type: 'follow_up',
        doctorId: effectiveDoctorId,
      });
      const visit = visitRes.data;
      const rxRes = await prescriptionsApi.create({
        visitId: visit.id,
        patientId,
        medications,
        doctorId: effectiveDoctorId,
      });
      const rx = rxRes.data as {
        medications: Medication[];
        createdAt: string;
        notes?: string;
      };
      toast.success('تم حفظ الروشتة');
      onCreated();
      if (doPrint) {
        const patientName =
          selectedPatient?.name ?? patients.find((p: Patient) => p.id === patientId)?.name ?? '';
        printPrescription({
          patientName,
          patientPhone: selectedPatient?.phone,
          doctorName: doctors.find((d) => d.id === effectiveDoctorId)?.name ?? user?.name,
          createdAt: new Date(rx.createdAt).toLocaleDateString('ar-EG'),
          medications: rx.medications ?? medications,
          notes: rx.notes,
        });
      }
      onClose();
    } catch {
      toast.error('تعذر حفظ الروشتة');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-100">
        <div className="sticky top-0 bg-white border-b px-5 py-4 flex justify-between items-center">
          <h2 className="text-lg font-bold">روشتة جديدة</h2>
          <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
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
                <ul className="mt-2 border rounded-lg max-h-28 overflow-y-auto">
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

          {user?.role !== UserRole.DOCTOR && doctors.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-700">الطبيب</label>
              <select
                className="input-field mt-1"
                value={doctorId || doctors[0]?.id}
                onChange={(e) => setDoctorId(e.target.value)}
              >
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {medications.map((med) => (
            <div key={med.id} className="border rounded-lg p-3 flex justify-between gap-2">
              <div>
                <p className="font-medium">{med.name}</p>
                <p className="text-sm text-gray-600">
                  {med.dosage} — {med.frequency} — {med.duration || '—'}
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

          {showAddForm ? (
            <div className="border rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
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
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={handleAddMedication} className="btn-primary text-sm">
                  إضافة
                </button>
                <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary text-sm">
                  إلغاء
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              إضافة دواء
            </button>
          )}

          <div className="flex gap-2 justify-end pt-2 border-t">
            <button type="button" onClick={onClose} className="btn-secondary">
              إلغاء
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave(false)}
              className="btn-secondary"
            >
              حفظ
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave(true)}
              className="btn-primary"
            >
              {saving ? 'جاري الحفظ...' : 'حفظ وطباعة'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
