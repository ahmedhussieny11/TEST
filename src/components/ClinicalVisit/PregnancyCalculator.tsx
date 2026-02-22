import { useState } from 'react';
import { Calendar, Calculator, AlertCircle } from 'lucide-react';
import { differenceInWeeks, addWeeks, format } from 'date-fns';

interface PregnancyCalculatorProps {
  onWeekCalculated: (week: number) => void;
  initialWeek?: number;
}

export default function PregnancyCalculator({
  onWeekCalculated,
  initialWeek,
}: PregnancyCalculatorProps) {
  const [lastPeriodDate, setLastPeriodDate] = useState<string>('');
  const [calculatedWeek, setCalculatedWeek] = useState<number | null>(initialWeek || null);

  const calculatePregnancyWeek = () => {
    if (!lastPeriodDate) return;

    const periodDate = new Date(lastPeriodDate);
    const today = new Date();
    const weeks = differenceInWeeks(today, periodDate);

    if (weeks < 0 || weeks > 42) {
      alert('تاريخ آخر دورة غير صحيح');
      return;
    }

    setCalculatedWeek(weeks);
    onWeekCalculated(weeks);
  };

  const getDueDate = () => {
    if (!lastPeriodDate) return null;
    const periodDate = new Date(lastPeriodDate);
    return addWeeks(periodDate, 40);
  };

  const getTrimester = (week: number) => {
    if (week <= 13) return 'الأول';
    if (week <= 27) return 'الثاني';
    return 'الثالث';
  };

  const getRequiredTests = (week: number) => {
    const tests: string[] = [];
    if (week >= 8 && week <= 12) {
      tests.push('سونار تحديد التاريخ');
    }
    if (week >= 11 && week <= 14) {
      tests.push('تحليل الشفافية القفوية (NT Scan)');
    }
    if (week >= 15 && week <= 20) {
      tests.push('تحليل رباعي (Quad Screen)');
    }
    if (week >= 18 && week <= 22) {
      tests.push('سونار تفصيلي (Anomaly Scan)');
    }
    if (week >= 24 && week <= 28) {
      tests.push('تحليل سكر الحمل');
    }
    if (week >= 28) {
      tests.push('متابعة أسبوعية');
    }
    return tests;
  };

  return (
    <div className="card bg-pink-50 border-pink-200">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="w-5 h-5 text-pink-600" />
        <h3 className="text-lg font-semibold text-pink-900">حاسبة الحمل</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            تاريخ آخر دورة شهرية
          </label>
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={lastPeriodDate}
              onChange={(e) => setLastPeriodDate(e.target.value)}
              className="input-field flex-1"
            />
            <button
              onClick={calculatePregnancyWeek}
              className="btn-primary"
            >
              احسب
            </button>
          </div>
        </div>

        {calculatedWeek !== null && (
          <div className="bg-white rounded-lg p-4 border border-pink-200">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">أسبوع الحمل</p>
                <p className="text-2xl font-bold text-pink-600">{calculatedWeek} أسبوع</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">الثلث</p>
                <p className="text-2xl font-bold text-pink-600">
                  {getTrimester(calculatedWeek)}
                </p>
              </div>
            </div>

            {getDueDate() && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">تاريخ الولادة المتوقع:</span>
                </div>
                <p className="text-lg font-semibold text-blue-900 mt-1">
                  {format(getDueDate()!, 'yyyy-MM-dd')}
                </p>
              </div>
            )}

            {getRequiredTests(calculatedWeek).length > 0 && (
              <div className="border-t border-pink-200 pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <p className="text-sm font-medium text-gray-700">الفحوصات المطلوبة:</p>
                </div>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {getRequiredTests(calculatedWeek).map((test, idx) => (
                    <li key={idx}>{test}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

