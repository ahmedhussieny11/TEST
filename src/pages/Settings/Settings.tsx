import { useState } from 'react';
import { Save, DollarSign, Calendar } from 'lucide-react';
import { AppointmentSettings } from '@/types';
import { toast } from 'react-toastify';

const defaultSettings: AppointmentSettings = {
  slotsPerHour: 4,
  workingHours: {
    start: '09:00',
    end: '17:00',
  },
  workingDays: [0, 1, 2, 3, 4, 5], // الأحد إلى الجمعة
  prices: {
    newVisit: 200,
    followUp: 150,
    pregnancyCheck: 250,
    sonar: 300,
  },
};

export default function Settings() {
  const [settings, setSettings] = useState<AppointmentSettings>(defaultSettings);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // حفظ الإعدادات
    console.log(settings);
    toast.success('تم حفظ الإعدادات بنجاح');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">الإعدادات</h1>
        <p className="text-gray-600 mt-1">إعدادات النظام العامة</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* إعدادات المواعيد */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            إعدادات المواعيد
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                عدد الحالات في الساعة
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={settings.slotsPerHour}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    slotsPerHour: parseInt(e.target.value),
                  })
                }
                className="input-field"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ساعة البدء
                </label>
                <input
                  type="time"
                  value={settings.workingHours.start}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      workingHours: {
                        ...settings.workingHours,
                        start: e.target.value,
                      },
                    })
                  }
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ساعة الانتهاء
                </label>
                <input
                  type="time"
                  value={settings.workingHours.end}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      workingHours: {
                        ...settings.workingHours,
                        end: e.target.value,
                      },
                    })
                  }
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                أيام العمل
              </label>
              <div className="grid grid-cols-7 gap-2">
                {[
                  'الأحد',
                  'الإثنين',
                  'الثلاثاء',
                  'الأربعاء',
                  'الخميس',
                  'الجمعة',
                  'السبت',
                ].map((day, index) => (
                  <label
                    key={index}
                    className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={settings.workingDays.includes(index)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSettings({
                            ...settings,
                            workingDays: [...settings.workingDays, index],
                          });
                        } else {
                          setSettings({
                            ...settings,
                            workingDays: settings.workingDays.filter(
                              (d) => d !== index
                            ),
                          });
                        }
                      }}
                      className="w-4 h-4 text-primary-600 rounded"
                    />
                    <span className="text-sm">{day}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* الأسعار */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            الأسعار
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                سعر الكشف الجديد (ج.م)
              </label>
              <input
                type="number"
                min="0"
                value={settings.prices.newVisit}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    prices: {
                      ...settings.prices,
                      newVisit: parseInt(e.target.value),
                    },
                  })
                }
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                سعر المتابعة (ج.م)
              </label>
              <input
                type="number"
                min="0"
                value={settings.prices.followUp}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    prices: {
                      ...settings.prices,
                      followUp: parseInt(e.target.value),
                    },
                  })
                }
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                سعر متابعة الحمل (ج.م)
              </label>
              <input
                type="number"
                min="0"
                value={settings.prices.pregnancyCheck}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    prices: {
                      ...settings.prices,
                      pregnancyCheck: parseInt(e.target.value),
                    },
                  })
                }
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                سعر السونار (ج.م)
              </label>
              <input
                type="number"
                min="0"
                value={settings.prices.sonar}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    prices: {
                      ...settings.prices,
                      sonar: parseInt(e.target.value),
                    },
                  })
                }
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* زر الحفظ */}
        <div className="flex items-center justify-end">
          <button type="submit" className="btn-primary flex items-center gap-2">
            <Save className="w-5 h-5" />
            حفظ الإعدادات
          </button>
        </div>
      </form>
    </div>
  );
}

