import { Link } from 'react-router-dom';
import { LogIn, UserPlus, LayoutDashboard } from 'lucide-react';
import { usePatientAuthStore } from '../store/patientAuthStore';
import { usePublicClinicBranding } from '@/hooks/useClinicBranding';
import ClinicBrand from '@/components/Branding/ClinicBrand';
import BookAppointmentButton from '@/components/Branding/BookAppointmentButton';

type PatientSiteHeaderProps = {
  variant?: 'light' | 'solid';
};

export default function PatientSiteHeader({ variant = 'light' }: PatientSiteHeaderProps) {
  const { isAuthenticated, patient } = usePatientAuthStore();
  const { branding } = usePublicClinicBranding();
  const isSolid = variant === 'solid';

  return (
    <header
      className={`sticky top-0 z-50 border-b backdrop-blur-md ${
        isSolid
          ? 'bg-white/95 border-gray-200 shadow-sm'
          : 'bg-white/80 border-gray-100'
      }`}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <ClinicBrand branding={branding} to="/" compact />

        <nav className="flex items-center gap-2 sm:gap-3 shrink-0">
          <BookAppointmentButton />

          {isAuthenticated && patient ? (
            <Link
              to="/patient/dashboard"
              className="inline-flex items-center gap-2 bg-primary-600 text-white text-sm font-medium px-3 sm:px-4 py-2.5 rounded-xl hover:bg-primary-700 transition-colors shadow-sm max-w-[140px]"
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span className="truncate max-w-[80px] sm:max-w-[120px]">{patient.name}</span>
            </Link>
          ) : (
            <>
              <Link
                to="/patient/login"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700 border border-gray-300 bg-white px-3 sm:px-4 py-2.5 rounded-xl hover:border-primary-400 hover:text-primary-700 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">تسجيل الدخول</span>
              </Link>
              <Link
                to="/patient/register"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-primary-600 px-3 sm:px-4 py-2.5 rounded-xl hover:bg-primary-700 transition-colors shadow-md shadow-primary-600/20"
              >
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">إنشاء حساب</span>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
