import { useMemo, useState } from 'react';
import { Plus, Search, Printer, Eye } from 'lucide-react';
import { format } from 'date-fns';
import InvoicePrint from '@/components/Invoices/InvoicePrint';
import { mockInvoices, getPatientById } from '@/data/mockData';
import { Invoice } from '@/types';

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
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return mockInvoices;
    return mockInvoices.filter((invoice) => {
      const patient = getPatientById(invoice.patientId);
      return (
        invoice.id.includes(q) ||
        patient?.name?.toLowerCase().includes(q) ||
        patient?.phone?.includes(q)
      );
    });
  }, [searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">الفواتير</h1>
          <p className="text-gray-600 mt-1">إدارة الفواتير والإيصالات</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          فاتورة جديدة
        </button>
      </div>

      {/* شريط البحث */}
      <div className="card">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="بحث عن فاتورة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* قائمة الفواتير */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  رقم الفاتورة
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  المريضة
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  الإجمالي
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  المدفوع
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  المتبقي
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  الحالة
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  التاريخ
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  إجراءات
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((invoice) => {
                const patient = getPatientById(invoice.patientId);
                return (
                  <tr
                    key={invoice.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-4 px-4">
                      <span className="font-medium">#{invoice.id}</span>
                    </td>
                    <td className="py-4 px-4">
                      {patient ? patient.name : `مريضة #${invoice.patientId}`}
                    </td>
                    <td className="py-4 px-4">
                      {invoice.total.toLocaleString()} ج.م
                    </td>
                    <td className="py-4 px-4">
                      {invoice.paid.toLocaleString()} ج.م
                    </td>
                    <td className="py-4 px-4">
                      {invoice.remaining.toLocaleString()} ج.م
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`text-xs px-3 py-1 rounded-full ${getStatusColor(
                          invoice.status
                        )}`}
                      >
                        {getStatusText(invoice.status)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {format(new Date(invoice.createdAt), 'yyyy-MM-dd')}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button className="btn-secondary text-sm py-1 px-3 flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          عرض
                        </button>
                        <button
                          onClick={() => setSelectedInvoice(invoice)}
                          className="btn-secondary text-sm py-1 px-3 flex items-center gap-1"
                        >
                          <Printer className="w-4 h-4" />
                          طباعة
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedInvoice && (
        <InvoicePrint
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
}

