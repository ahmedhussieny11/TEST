import { Invoice } from '@/types';
import { getPatientById } from '@/data/mockData';
import { format } from 'date-fns';
import './InvoicePrint.css';

interface InvoicePrintProps {
  invoice: Invoice;
  onClose: () => void;
}

export default function InvoicePrint({ invoice, onClose }: InvoicePrintProps) {
  const patient = getPatientById(invoice.patientId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="no-print border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">إيصال الدفع</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <span className="text-2xl">&times;</span>
          </button>
        </div>

        <div className="invoice-print p-6">
          <div className="header">
            <h1 className="text-xl font-bold mb-2">عيادة د. محمد عبدالحكيم</h1>
            <p className="text-sm">إيصال دفع</p>
            <p className="text-xs mt-2">#{invoice.id}</p>
          </div>

          <div className="mb-4">
            <p className="text-sm">
              <strong>المريضة:</strong> {patient?.name || `مريضة #${invoice.patientId}`}
            </p>
            <p className="text-sm">
              <strong>التاريخ:</strong> {format(new Date(invoice.createdAt), 'yyyy-MM-dd HH:mm')}
            </p>
          </div>

          <div className="items">
            <div className="item font-bold border-b-2 border-black pb-1 mb-1">
              <span>الخدمة</span>
              <span>المبلغ</span>
            </div>
            {invoice.items.map((item) => (
              <div key={item.id} className="item">
                <span>{item.description} × {item.quantity}</span>
                <span>{item.total.toLocaleString()} ج.م</span>
              </div>
            ))}
          </div>

          <div className="total">
            <div className="flex justify-between mb-2">
              <span>الإجمالي:</span>
              <span>{invoice.total.toLocaleString()} ج.م</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>المدفوع:</span>
              <span>{invoice.paid.toLocaleString()} ج.م</span>
            </div>
            {invoice.remaining > 0 && (
              <div className="flex justify-between">
                <span>المتبقي:</span>
                <span>{invoice.remaining.toLocaleString()} ج.م</span>
              </div>
            )}
          </div>

          <div className="footer">
            <p>شكراً لزيارتكم</p>
            <p className="text-xs mt-2">هذا إيصال إلكتروني</p>
          </div>
        </div>

        <div className="no-print border-t px-6 py-4 flex items-center justify-end gap-3">
          <button onClick={onClose} className="btn-secondary">
            إلغاء
          </button>
          <button onClick={handlePrint} className="btn-primary">
            طباعة
          </button>
        </div>
      </div>
    </div>
  );
}

