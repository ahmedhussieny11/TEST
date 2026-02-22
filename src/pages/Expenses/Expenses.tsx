import { useState } from 'react';
import { Plus, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  createdBy: string;
}

const expenseCategories = [
  { id: 'cleaning', name: 'نظافة' },
  { id: 'hospitality', name: 'ضيافة' },
  { id: 'maintenance', name: 'صيانة' },
  { id: 'supplies', name: 'مستلزمات' },
  { id: 'other', name: 'أخرى' },
];

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    category: '',
    description: '',
    amount: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category || !formData.description || !formData.amount) {
      toast.error('يرجى إدخال جميع البيانات');
      return;
    }

    const newExpense: Expense = {
      id: Date.now().toString(),
      date: formData.date,
      category: formData.category,
      description: formData.description,
      amount: parseFloat(formData.amount),
      createdBy: '1',
    };

    setExpenses([...expenses, newExpense]);
    setFormData({
      date: format(new Date(), 'yyyy-MM-dd'),
      category: '',
      description: '',
      amount: '',
    });
    setShowAddModal(false);
    toast.success('تم تسجيل المصروف بنجاح');
  };

  const totalToday = expenses
    .filter((exp) => exp.date === format(new Date(), 'yyyy-MM-dd'))
    .reduce((sum, exp) => sum + exp.amount, 0);

  const totalByCategory = expenseCategories.map((cat) => ({
    category: cat.name,
    total: expenses
      .filter((exp) => exp.category === cat.id && exp.date === format(new Date(), 'yyyy-MM-dd'))
      .reduce((sum, exp) => sum + exp.amount, 0),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">المصروفات</h1>
          <p className="text-gray-600 mt-1">تسجيل ومتابعة المصروفات اليومية</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          إضافة مصروف
        </button>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card bg-red-50 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">إجمالي اليوم</p>
              <p className="text-2xl font-bold text-red-600">
                {totalToday.toLocaleString()} ج.م
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-red-400" />
          </div>
        </div>

        {totalByCategory.map((cat) => (
          <div key={cat.category} className="card">
            <p className="text-sm text-gray-600 mb-1">{cat.category}</p>
            <p className="text-xl font-bold text-gray-900">
              {cat.total.toLocaleString()} ج.م
            </p>
          </div>
        ))}
      </div>

      {/* قائمة المصروفات */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  التاريخ
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  التصنيف
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  الوصف
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  المبلغ
                </th>
              </tr>
            </thead>
            <tbody>
              {expenses.length > 0 ? (
                expenses.map((expense) => {
                  const category = expenseCategories.find((cat) => cat.id === expense.category);
                  return (
                    <tr
                      key={expense.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-4 px-4">{expense.date}</td>
                      <td className="py-4 px-4">{category?.name || expense.category}</td>
                      <td className="py-4 px-4">{expense.description}</td>
                      <td className="py-4 px-4 font-medium">
                        {expense.amount.toLocaleString()} ج.م
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-500">
                    لا توجد مصروفات مسجلة
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* نافذة إضافة مصروف */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">إضافة مصروف</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  التاريخ
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  التصنيف
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">اختر التصنيف</option>
                  {expenseCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الوصف
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="input-field"
                  placeholder="وصف المصروف"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المبلغ (ج.م)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="input-field"
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary"
                >
                  إلغاء
                </button>
                <button type="submit" className="btn-primary">
                  حفظ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

