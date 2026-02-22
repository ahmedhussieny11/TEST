import { useMemo, useState } from 'react';
import { Search, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { mockPrescriptions, getPatientById } from '@/data/mockData';
import { Prescription } from '@/types';

interface PatientPrescriptions {
  patientId: string;
  name: string;
  phone?: string;
  prescriptions: Prescription[];
}

export default function Prescriptions() {
  const [searchQuery, setSearchQuery] = useState('');

  const grouped = useMemo<PatientPrescriptions[]>(() => {
    const groups: Record<string, PatientPrescriptions> = {};
    mockPrescriptions.forEach((pres) => {
      const patient = getPatientById(pres.patientId);
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
  }, [searchQuery]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">الروشتات</h1>
        <p className="text-gray-600 mt-1">عرض وإدارة الروشتات الطبية</p>
      </div>

      {/* شريط البحث */}
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

      {/* قائمة الروشتات */}
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
              {group.prescriptions.map((prescription) => (
                <div
                  key={prescription.id}
                  className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm text-gray-500">رقم الروشتة</p>
                      <p className="font-semibold text-gray-900">#{prescription.id}</p>
                    </div>
                    <p className="text-sm text-gray-500">
                      {format(new Date(prescription.createdAt), 'yyyy-MM-dd')}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-gray-700 mb-2">الأدوية:</p>
                  <ul className="list-disc list-inside text-sm text-gray-600 mb-3">
                    {prescription.medications.map((med) => (
                      <li key={med.id}>
                        {med.name} - {med.dosage} - {med.frequency}
                      </li>
                    ))}
                  </ul>
                  <button className="btn-secondary text-sm py-1 px-3 flex items-center gap-1">
                    <Printer className="w-4 h-4" />
                    طباعة
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

        {grouped.length === 0 && (
          <div className="card text-center py-12 text-gray-500">لا توجد روشتات</div>
        )}
      </div>
    </div>
  );
}

