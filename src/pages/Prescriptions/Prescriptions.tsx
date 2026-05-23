import { useMemo, useState } from 'react';
import PrescriptionTemplatesTab from '@/components/Prescriptions/PrescriptionTemplatesTab';
import { Search, Printer, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { useQuery, useQueryClient } from 'react-query';
import { prescriptionsApi } from '@/api/prescriptions';
import { Prescription } from '@/types';
import { normalizeMedications } from '@/utils/medications';
import { printPrescription } from '@/utils/printPrescription';
import NewPrescriptionModal from '@/components/Prescriptions/NewPrescriptionModal';
import { useAuthStore } from '@/store/authStore';
import { UserRole } from '@/types';

interface PatientPrescriptions {
  patientId: string;
  name: string;
  phone?: string;
  prescriptions: (Prescription & {
    patient?: { name: string; phone: string };
    doctor?: { name: string };
  })[];
}

export default function Prescriptions() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [tab, setTab] = useState<'saved' | 'templates'>('saved');

  const canCreate =
    user?.role === UserRole.DOCTOR || user?.role === UserRole.ADMIN;
  const canManageTemplates =
    user?.role === UserRole.DOCTOR || user?.role === UserRole.ADMIN;

  const { data: prescriptions = [], isLoading } = useQuery('prescriptions', () =>
    prescriptionsApi.list().then((r) => r.data)
  );

  const refresh = () => queryClient.invalidateQueries('prescriptions');

  const grouped = useMemo<PatientPrescriptions[]>(() => {
    const groups: Record<string, PatientPrescriptions> = {};
    (
      prescriptions as (Prescription & {
        patient?: { name: string; phone: string };
        doctor?: { name: string };
      })[]
    ).forEach((pres) => {
      const patient = pres.patient;
      if (!groups[pres.patientId]) {
        groups[pres.patientId] = {
          patientId: pres.patientId,
          name: patient?.name ?? `مريضة #${pres.patientId}`,
          phone: patient?.phone,
          prescriptions: [],
        };
      }
      groups[pres.patientId].prescriptions.push(pres);
    });

    const q = searchQuery.trim().toLowerCase();
    if (!q) return Object.values(groups);

    return Object.values(groups).filter(
      (group) =>
        group.name.toLowerCase().includes(q) ||
        group.phone?.includes(q) ||
        group.prescriptions.some((pres) => pres.id.includes(q))
    );
  }, [searchQuery, prescriptions]);

  const handlePrint = (
    prescription: Prescription & {
      patient?: { name: string; phone: string };
      doctor?: { name: string };
    },
    patientName: string,
    patientPhone?: string
  ) => {
    printPrescription({
      patientName,
      patientPhone,
      doctorName: prescription.doctor?.name,
      createdAt: format(new Date(prescription.createdAt), 'yyyy-MM-dd'),
      medications: normalizeMedications(prescription.medications),
      notes: prescription.notes,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">الروشتات</h1>
          <p className="text-gray-600 mt-1">عرض وإدارة الروشتات الطبية</p>
        </div>
        {tab === 'saved' && canCreate && (
          <button
            type="button"
            onClick={() => setShowNewModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            روشتة جديدة
          </button>
        )}
      </div>

      {canManageTemplates && (
        <div className="flex gap-2 border-b border-gray-200">
          <button
            type="button"
            onClick={() => setTab('saved')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === 'saved'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            روشتات محفوظة
          </button>
          <button
            type="button"
            onClick={() => setTab('templates')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === 'templates'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            قوالب جاهزة
          </button>
        </div>
      )}

      {tab === 'templates' && canManageTemplates ? (
        <PrescriptionTemplatesTab />
      ) : (
        <>
      <div className="card">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="بحث عن روشتة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {isLoading ? (
        <p className="text-gray-500">جاري التحميل...</p>
      ) : (
        <div className="space-y-6">
          {grouped.map((group) => (
            <div key={group.patientId} className="card border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500">المريضة</p>
                  <h3 className="text-xl font-semibold text-gray-900">{group.name}</h3>
                  {group.phone && <p className="text-sm text-gray-500 mt-1">{group.phone}</p>}
                </div>
                <span className="text-sm text-gray-500">
                  {group.prescriptions.length} روشتة
                </span>
              </div>

              <div className="space-y-4">
                {group.prescriptions.map((prescription) => {
                  const meds = normalizeMedications(prescription.medications);
                  return (
                    <div
                      key={prescription.id}
                      className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-sm text-gray-500">رقم الروشتة</p>
                          <p className="font-semibold text-gray-900">
                            #{prescription.id.slice(0, 8)}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500">
                          {format(new Date(prescription.createdAt), 'yyyy-MM-dd')}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-gray-700 mb-2">الأدوية:</p>
                      <ul className="list-disc list-inside text-sm text-gray-600 mb-3">
                        {meds.map((med) => (
                          <li key={med.id}>
                            {med.name} - {med.dosage} - {med.frequency}
                            {med.duration ? ` — ${med.duration}` : ''}
                          </li>
                        ))}
                      </ul>
                      <button
                        type="button"
                        onClick={() => handlePrint(prescription, group.name, group.phone)}
                        className="btn-secondary text-sm py-1 px-3 flex items-center gap-1"
                      >
                        <Printer className="w-4 h-4" />
                        طباعة
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {grouped.length === 0 && (
            <div className="card text-center py-12 text-gray-500">لا توجد روشتات</div>
          )}
        </div>
      )}

      {showNewModal && (
        <NewPrescriptionModal
          onClose={() => setShowNewModal(false)}
          onCreated={refresh}
        />
      )}
        </>
      )}
    </div>
  );
}
