import { Link } from 'react-router-dom';
import { ReactNode } from 'react';
import PatientSiteHeader from './PatientSiteHeader';

type PatientAuthShellProps = {
  children: ReactNode;
  title: string;
  subtitle: string;
  icon: ReactNode;
  footer?: ReactNode;
};

export default function PatientAuthShell({
  children,
  title,
  subtitle,
  icon,
  footer,
}: PatientAuthShellProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-slate-50">
      <PatientSiteHeader />
      <div className="flex items-center justify-center px-4 py-10 sm:py-14">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-l from-primary-600 to-primary-500 px-8 py-8 text-center text-white">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 backdrop-blur mb-4">
                {icon}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold">{title}</h1>
              <p className="text-primary-100 text-sm mt-2 leading-relaxed">{subtitle}</p>
            </div>
            <div className="p-8 text-right">{children}</div>
          </div>
          {footer && <div className="mt-6">{footer}</div>}
          <p className="text-center mt-6">
            <Link to="/" className="text-sm text-gray-500 hover:text-primary-600">
              ← العودة للصفحة الرئيسية
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
