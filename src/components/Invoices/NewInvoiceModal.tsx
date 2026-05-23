import { useState } from 'react';
import { useQuery } from 'react-query';
import { X, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { billingApi } from '@/api/billing';
import { patientsApi } from '@/api/patients';
import { Patient } from '@/types';

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

interface LineItem {
  description: string;
  quantity: number;
  price: number;
}

export default function NewInvoiceModal({ onClose, onCreated }: Props) {
  const [patientId, setPatientId] = useState('');
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<LineItem[]>([
    { description: 'كشف', quantity: 1, price: 300 },
  ]);
  const [paidAmount, setPaidAmount] = useState(0);

  const { data: patients = [] } = useQuery(
    ['patients-search', search],
    () => patientsApi.list(search).then((r) => r.data),
    { enabled: search.length > 1 }
  );

  const { data: services = [] } = useQuery('services', () =>
    billingApi.services().then((r) => r.data)
  );

  const total = items.reduce((s, i) => s + i.quantity * i.price, 0);

  const addService = (name: string, price: number) => {
    setItems([...items, { description: name, quantity: 1, price }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) {
      toast.error('اختر المريضة');
      return;
    }
    try {
      await billingApi.createInvoice({
        patientId,
        items,
        paidAmount: paidAmount || total,
      });
      toast.success('تم إنشاء الفاتورة');
      onCreated();
      onClose();
    } catch {
      toast.error('تعذر إنشاء الفاتورة');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-100">
        <div className="sticky top-0 bg-white border-b px-5 py-4 flex justify-between items-center">
          <h2 className="text-lg font-bold">فاتورة جديدة (POS)</h2>
          <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">بحث مريضة</label>
            <input
              className="input-field mt-1"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="اسم أو هاتف"
            />
            {patients.length > 0 && (
              <div className="mt-2 border rounded-lg max-h-32 overflow-y-auto">
                {(patients as Patient[]).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setPatientId(p.id);
                      setSearch(p.name);
                    }}
                    className={`w-full text-right px-3 py-2 text-sm hover:bg-gray-50 ${
                      patientId === p.id ? 'bg-primary-50' : ''
                    }`}
                  >
                    {p.name} — {p.phone}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {(services as { name: string; price: number }[]).map((s) => (
              <button
                key={s.name}
                type="button"
                onClick={() => addService(s.name, s.price)}
                className="text-xs px-2 py-1 bg-slate-100 rounded-lg hover:bg-slate-200"
              >
                + {s.name}
              </button>
            ))}
          </div>

          {items.map((item, idx) => (
            <div key={idx} className="flex gap-2 items-end">
              <input
                className="input-field flex-1"
                value={item.description}
                onChange={(e) => {
                  const next = [...items];
                  next[idx].description = e.target.value;
                  setItems(next);
                }}
                placeholder="البند"
              />
              <input
                type="number"
                className="input-field w-16"
                value={item.quantity}
                onChange={(e) => {
                  const next = [...items];
                  next[idx].quantity = Number(e.target.value);
                  setItems(next);
                }}
              />
              <input
                type="number"
                className="input-field w-24"
                value={item.price}
                onChange={(e) => {
                  const next = [...items];
                  next[idx].price = Number(e.target.value);
                  setItems(next);
                }}
              />
              <button
                type="button"
                onClick={() => setItems(items.filter((_, i) => i !== idx))}
                className="p-2 text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => setItems([...items, { description: '', quantity: 1, price: 0 }])}
            className="btn-secondary text-sm flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> بند
          </button>

          <p className="font-semibold">الإجمالي: {total.toLocaleString()} ج.م</p>

          <div>
            <label className="text-sm text-gray-600">المبلغ المدفوع</label>
            <input
              type="number"
              className="input-field mt-1"
              value={paidAmount || total}
              onChange={(e) => setPaidAmount(Number(e.target.value))}
            />
          </div>

          <button type="submit" className="w-full btn-primary">
            إصدار الفاتورة
          </button>
        </form>
      </div>
    </div>
  );
}

