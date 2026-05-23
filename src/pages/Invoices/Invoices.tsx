import { useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { Plus, Search, Eye, Lock, Banknote } from 'lucide-react';
import { format, startOfDay, isSameDay } from 'date-fns';
import InvoicePrint from '@/components/Invoices/InvoicePrint';
import NewInvoiceModal from '@/components/Invoices/NewInvoiceModal';
import ShiftCloseModal from '@/components/Invoices/ShiftCloseModal';
import CollectPaymentModal from '@/components/Invoices/CollectPaymentModal';
import { billingApi } from '@/api/billing';
import { Invoice } from '@/types';

type InvoiceFilter = 'all' | 'unpaid' | 'paid' | 'today';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-800';
    case 'partial':
      return 'bg-yellow-100 text-yellow-800';
    case 'unpaid':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'paid':
      return 'مدفوع';
    case 'partial':
      return 'مدفوع جزئياً';
    case 'unpaid':
      return 'غير مدفوع';
    default:
      return status;
  }
};

export default function Invoices() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<InvoiceFilter>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [collectInvoice, setCollectInvoice] = useState<Invoice | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [showShift, setShowShift] = useState(false);

  const { data: invoices = [], refetch } = useQuery('invoices', () =>
    billingApi.invoices().then((r) => r.data)
  );

  const filtered = useMemo(() => {
    const today = startOfDay(new Date());
    let list = invoices as (Invoice & {
      patient?: { name: string; phone: string };
      appointment?: { date: string; time: string; notes?: string };
    })[];

    if (filter === 'unpaid') {
      list = list.filter((i) => i.status === 'unpaid' || i.status === 'partial');
    } else if (filter === 'paid') {
      list = list.filter((i) => i.status === 'paid');
    } else if (filter === 'today') {
      list = list.filter((i) => {
        const d = i.appointment?.date
          ? new Date(i.appointment.date)
          : new Date(i.createdAt);
        return isSameDay(d, today);
      });
    }

    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (invoice) =>
        invoice.id.includes(q) ||
        invoice.patient?.name?.toLowerCase().includes(q) ||
        invoice.patient?.phone?.includes(q)
    );
  }, [searchQuery, invoices, filter]);

  const filterTabs: { id: InvoiceFilter; label: string }[] = [
    { id: 'all', label: 'الكل' },
    { id: 'unpaid', label: 'بانتظار الدفع' },
    { id: 'paid', label: 'مدفوع' },
    { id: 'today', label: 'حجوزات اليوم' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الفواتير</h1>
          <p className="text-sm text-gray-500 mt-1">
            فواتير الحجز الأونلاين تُنشأ تلقائياً — التحصيل من هنا أو من «تحصيل اليوم»
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowShift(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <Lock className="w-4 h-4" />
            تقفيل اليومية
          </button>
          <button
            type="button"
            onClick={() => setShowNew(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            فاتورة يدوية
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === tab.id
                ? 'bg-primary-600 text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:border-primary-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="card border border-gray-100">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="بحث عن فاتورة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pr-10"
          />
        </div>
      </div>

      <div className="card border border-gray-100 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b text-right text-sm text-gray-500">
              <th className="py-3 px-4">المريضة</th>
              <th className="py-3 px-4">الموعد</th>
              <th className="py-3 px-4">التاريخ</th>
              <th className="py-3 px-4">الإجمالي</th>
              <th className="py-3 px-4">المدفوع</th>
              <th className="py-3 px-4">الحالة</th>
              <th className="py-3 px-4">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((invoice) => (
              <tr key={invoice.id} className="border-b border-gray-50 hover:bg-slate-50">
                <td className="py-3 px-4 font-medium">
                  {invoice.patient?.name ?? invoice.patientId}
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  {invoice.appointment
                    ? `${format(new Date(invoice.appointment.date), 'yyyy-MM-dd')} ${invoice.appointment.time}`
                    : '—'}
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  {format(new Date(invoice.createdAt), 'yyyy-MM-dd')}
                </td>
                <td className="py-3 px-4">{invoice.total.toLocaleString()} ج.م</td>
                <td className="py-3 px-4">{invoice.paid.toLocaleString()} ج.م</td>
                <td className="py-3 px-4">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${getStatusColor(invoice.status)}`}
                  >
                    {getStatusText(invoice.status)}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    {(invoice.status === 'unpaid' || invoice.status === 'partial') && (
                      <button
                        type="button"
                        onClick={() => setCollectInvoice(invoice)}
                        className="text-xs btn-primary py-1 px-2 inline-flex items-center gap-1"
                      >
                        <Banknote className="w-3.5 h-3.5" />
                        تحصيل
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setSelectedInvoice(invoice)}
                      className="text-primary-600 hover:text-primary-700 p-1 text-sm"
                    >
                      <Eye className="w-4 h-4 inline ml-1" />
                      عرض
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center py-8 text-gray-500">لا توجد فواتير</p>
        )}
      </div>

      {showNew && (
        <NewInvoiceModal onClose={() => setShowNew(false)} onCreated={() => refetch()} />
      )}
      {showShift && <ShiftCloseModal onClose={() => setShowShift(false)} />}
      {selectedInvoice && (
        <InvoicePrint invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
      )}
      {collectInvoice && (
        <CollectPaymentModal
          invoiceId={collectInvoice.id}
          patientName={collectInvoice.patient?.name ?? 'مريضة'}
          serviceLabel={collectInvoice.appointment?.notes}
          total={collectInvoice.total}
          remaining={collectInvoice.remaining}
          onClose={() => setCollectInvoice(null)}
          onPaid={() => refetch()}
        />
      )}
    </div>
  );
}
