import { useMemo, useState } from 'react';
import { Calendar, FileText, FlaskConical, Pill, Clock, User } from 'lucide-react';
import { AppointmentStatus, VisitType } from '@/types';
import { format } from 'date-fns';
import {
  mockAppointments,
  mockLabTests,
  mockPrescriptions,
  getPatientById,
} from '@/data/mockData';

export default function PatientPortal() {
  const [activeTab, setActiveTab] = useState<'appointments' | 'prescriptions' | 'labs'>('appointments');
  const patientId = '6';
  const patient = getPatientById(patientId);

  const appointments = useMemo(
    () =>
      mockAppointments
        .filter((apt) => apt.patientId === patientId)
        .sort(
          (a, b) =>
            new Date(`${b.date}T${b.time}`).getTime() -
            new Date(`${a.date}T${a.time}`).getTime()
        ),
    [patientId]
  );

  const prescriptions = mockPrescriptions.filter((pres) => pres.patientId === patientId);
  const labTests = mockLabTests.filter((lab) => lab.patientId === patientId);

  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">يرجى إعداد بيانات المريضة أولاً.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">بوابة المريضة</h1>
              <p className="text-gray-600 text-sm">عيادة د. محمد عبدالحكيم لطب النساء والتوليد</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <User className="w-5 h-5 text-primary-600" />
              </div>
              <span className="font-medium">{patient?.name ?? 'مريضة البوابة'}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('appointments')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'appointments'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar className="w-5 h-5 inline-block ml-2" />
              المواعيد
            </button>
            <button
              onClick={() => setActiveTab('prescriptions')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'prescriptions'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Pill className="w-5 h-5 inline-block ml-2" />
              الروشتات
            </button>
            <button
              onClick={() => setActiveTab('labs')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'labs'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FlaskConical className="w-5 h-5 inline-block ml-2" />
              التحاليل
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'appointments' && (
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">مواعيدي القادمة</h2>
              <div className="space-y-4">
                {appointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary-100 rounded-lg">
                          <Calendar className="w-6 h-6 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-lg">
                            {format(new Date(apt.date), 'yyyy-MM-dd')}
                          </p>
                          <p className="text-gray-600 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {apt.time}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {apt.type === VisitType.PREGNANCY_CHECK
                              ? 'متابعة حمل'
                              : apt.type === VisitType.NEW
                              ? 'كشف جديد'
                              : 'زيارة'}
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        {apt.status === AppointmentStatus.CONFIRMED
                          ? 'مؤكد'
                          : apt.status === AppointmentStatus.SCHEDULED
                          ? 'مجدول'
                          : apt.status === AppointmentStatus.CANCELLED
                          ? 'ملغي'
                          : 'مكتمل'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'prescriptions' && (
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">روشتاتي</h2>
              <div className="space-y-4">
                {prescriptions.map((pres) => (
                  <div
                    key={pres.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary-600" />
                        <span className="font-medium">روشتة #{pres.id}</span>
                      </div>
                      <span className="text-sm text-gray-500">{pres.createdAt}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">الأدوية:</p>
                      <ul className="list-disc list-inside text-sm text-gray-600">
                        {pres.medications.map((med) => (
                          <li key={med.id}>{med.name} — {med.dosage}، {med.frequency}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'labs' && (
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">تحاليل</h2>
              <div className="space-y-4">
                {labTests.map((lab) => (
                  <div
                    key={lab.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{lab.testName}</p>
                        <p className="text-sm text-gray-600">{lab.completedDate || lab.requestedDate}</p>
                        {lab.results?.value && (
                          <p className="text-sm text-green-600 mt-1">
                            النتيجة: {lab.results.value}
                          </p>
                        )}
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        مكتمل
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

