import { useEffect, useMemo, useState } from 'react';
import { X, Search, Clock, User } from 'lucide-react';
import { VisitType } from '@/types';
import { format } from 'date-fns';
import { mockPatients, getAvailableSlots, clinicSlotsPerHour } from '@/data/mockData';

interface BookAppointmentModalProps {
  onClose: () => void;
  selectedDate?: Date;
}

export default function BookAppointmentModal({
  onClose,
  selectedDate = new Date(),
}: BookAppointmentModalProps) {
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [searchPatient, setSearchPatient] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [visitType, setVisitType] = useState<VisitType>(VisitType.NEW);
  const [notes, setNotes] = useState('');

  const filteredPatients = useMemo(
    () =>
      mockPatients.filter(
        (p) =>
          p.name.includes(searchPatient) ||
          p.phone.includes(searchPatient)
      ),
    [searchPatient]
  );

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const slots = useMemo(() => getAvailableSlots(selectedDateStr), [selectedDateStr]);

  useEffect(() => {
    setSelectedTime('');
  }, [selectedDateStr]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // هنا سيتم إرسال البيانات للـ API
    console.log({
      patientId: selectedPatient,
      date: format(selectedDate, 'yyyy-MM-dd'),
      time: selectedTime,
      type: visitType,
      notes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">حجز موعد جديد</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* اختيار المريضة */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              البحث عن مريضة
            </label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchPatient}
                onChange={(e) => setSearchPatient(e.target.value)}
                placeholder="اسم المريضة أو رقم الهاتف..."
                className="input-field pr-10"
              />
            </div>
            {searchPatient && (
              <div className="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                {filteredPatients.map((patient) => (
                  <button
                    key={patient.id}
                    type="button"
                    onClick={() => {
                      setSelectedPatient(patient.id);
                      setSearchPatient(patient.name);
                    }}
                    className={`w-full text-right px-4 py-3 hover:bg-gray-50 flex items-center gap-3 ${
                      selectedPatient === patient.id ? 'bg-primary-50' : ''
                    }`}
                  >
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{patient.name}</p>
                      <p className="text-sm text-gray-500">{patient.phone}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* التاريخ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              التاريخ
            </label>
            <input
              type="date"
              value={format(selectedDate, 'yyyy-MM-dd')}
              readOnly
              className="input-field bg-gray-50"
            />
          </div>

          {/* اختيار الوقت */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اختيار الوقت
            </label>
            <div className="grid grid-cols-4 gap-3">
              {slots.map((slot) => {
                const available = !slot.isFull;
                const status = slot.isFull
                  ? 'مكتمل'
                  : slot.remaining === clinicSlotsPerHour
                  ? 'متاح'
                  : `${clinicSlotsPerHour - slot.remaining} من ${clinicSlotsPerHour}`;
                return (
                  <button
                    key={slot.time}
                    type="button"
                    onClick={() => available && setSelectedTime(slot.time)}
                    disabled={!available}
                    className={`p-3 border-2 rounded-lg text-center transition-colors ${
                      selectedTime === slot.time
                        ? 'border-primary-600 bg-primary-50'
                        : available
                        ? 'border-gray-300 hover:border-primary-300 hover:bg-primary-50'
                        : 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <Clock className="w-4 h-4 mx-auto mb-1" />
                    <p className="text-sm font-medium">{slot.time}</p>
                    <p className="text-xs text-gray-500">{status}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* نوع الكشف */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نوع الكشف
            </label>
            <select
              value={visitType}
              onChange={(e) => setVisitType(e.target.value as VisitType)}
              className="input-field"
            >
              <option value={VisitType.NEW}>كشف جديد</option>
              <option value={VisitType.FOLLOW_UP}>متابعة</option>
              <option value={VisitType.PREGNANCY_CHECK}>متابعة حمل</option>
              <option value={VisitType.POST_DELIVERY}>بعد الولادة</option>
            </select>
          </div>

          {/* ملاحظات */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ملاحظات (اختياري)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="input-field"
              placeholder="أي ملاحظات إضافية..."
            />
          </div>

          {/* أزرار */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={!selectedPatient || !selectedTime}
              className="btn-primary"
            >
              حجز الموعد
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

