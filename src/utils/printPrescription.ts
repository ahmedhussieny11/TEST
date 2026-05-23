import { Medication } from '@/types';

type PrintPayload = {
  patientName: string;
  patientPhone?: string;
  doctorName?: string;
  createdAt: string;
  medications: Medication[];
  notes?: string;
};

export function printPrescription(data: PrintPayload) {
  const medsHtml = data.medications
    .map(
      (m) =>
        `<tr><td>${m.name}</td><td>${m.dosage}</td><td>${m.frequency}</td><td>${m.duration || '—'}</td></tr>`
    )
    .join('');

  const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8" />
  <title>روشتة — ${data.patientName}</title>
  <style>
    body { font-family: Tahoma, Arial, sans-serif; padding: 24px; color: #111; }
    h1 { font-size: 20px; margin-bottom: 4px; }
    .meta { color: #555; font-size: 13px; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: right; font-size: 14px; }
    th { background: #f3f4f6; }
    .notes { margin-top: 16px; font-size: 13px; }
    @media print { button { display: none; } }
  </style>
</head>
<body>
  <h1>عيادة د. محمد عبدالحكيم</h1>
  <p class="meta">روشتة طبية — ${data.createdAt}</p>
  <p><strong>المريضة:</strong> ${data.patientName}${data.patientPhone ? ` — ${data.patientPhone}` : ''}</p>
  ${data.doctorName ? `<p><strong>الطبيب:</strong> ${data.doctorName}</p>` : ''}
  <table>
    <thead><tr><th>الدواء</th><th>الجرعة</th><th>التكرار</th><th>المدة</th></tr></thead>
    <tbody>${medsHtml}</tbody>
  </table>
  ${data.notes ? `<p class="notes"><strong>ملاحظات:</strong> ${data.notes}</p>` : ''}
  <script>window.onload = () => { window.print(); }</script>
</body>
</html>`;

  const w = window.open('', '_blank', 'width=800,height=700');
  if (!w) return;
  w.document.write(html);
  w.document.close();
}
