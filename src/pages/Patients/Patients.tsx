import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, User, Phone, Calendar, Baby, MapPin } from 'lucide-react';
import { mockPatients } from '@/data/mockData';

export default function Patients() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPatients = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return mockPatients;
    return mockPatients.filter(
      (patient) =>
        patient.name.toLowerCase().includes(q) ||
        patient.phone.includes(q) ||
        (patient.address?.toLowerCase().includes(q) ?? false)
    );
  }, [searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">المرضى</h1>
          <p className="text-gray-600 mt-1">إدارة ملفات المرضى</p>
        </div>
        <Link to="/app/patients/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          مريضة جديدة
        </Link>
      </div>

      {/* شريط البحث */}
      <div className="card">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="بحث عن مريضة بالاسم أو رقم الهاتف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* قائمة المرضى */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.map((patient) => (
          <Link
            key={patient.id}
            to={`/app/patients/${patient.id}`}
            className="card hover:shadow-lg transition-shadow border border-gray-100"
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <User className="w-8 h-8 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {patient.name}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {new Date(patient.createdAt).toLocaleDateString('ar-EG')}
                  </p>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {patient.phone}
                  </p>
                  <p className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(patient.dateOfBirth).toLocaleDateString('ar-EG')}
                  </p>
                  {patient.address && (
                    <p className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {patient.address}
                    </p>
                  )}
                  {patient.isPregnant && (
                    <p className="flex items-center gap-2 text-pink-600">
                      <Baby className="w-4 h-4" />
                      أسبوع {patient.pregnancyWeek} من الحمل
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredPatients.length === 0 && (
        <div className="card text-center py-12">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">لا توجد مرضى</p>
        </div>
      )}
    </div>
  );
}

