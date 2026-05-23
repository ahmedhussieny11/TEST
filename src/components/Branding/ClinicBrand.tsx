import { Link } from 'react-router-dom';
import { HeartPulse } from 'lucide-react';
import type { ClinicBranding } from '@/constants/clinicBranding';

type ClinicBrandProps = {
  branding: ClinicBranding;
  to?: string;
  compact?: boolean;
};

export default function ClinicBrand({ branding, to = '/', compact = false }: ClinicBrandProps) {
  const content = (
    <>
      <span
        className={`shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-lg shadow-primary-500/25 ${
          compact ? 'w-9 h-9' : 'w-11 h-11'
        }`}
      >
        <HeartPulse className={compact ? 'w-4 h-4' : 'w-5 h-5'} />
      </span>
      <span className="min-w-0 text-right">
        <span
          className={`block font-bold bg-gradient-to-l from-primary-700 to-primary-500 bg-clip-text text-transparent leading-tight ${
            compact ? 'text-sm' : 'text-base sm:text-lg'
          }`}
        >
          {branding.name}
        </span>
        {branding.tagline && (
          <span className={`block text-gray-500 truncate ${compact ? 'text-[10px]' : 'text-xs'}`}>
            {branding.tagline}
          </span>
        )}
      </span>
    </>
  );

  const className = `flex items-center gap-2.5 sm:gap-3 group min-w-0 hover:opacity-90 transition-opacity`;

  if (to) {
    return (
      <Link to={to} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
