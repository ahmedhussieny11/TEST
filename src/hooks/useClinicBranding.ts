import { useQuery } from 'react-query';
import { publicBookingApi } from '@/api/publicBooking';
import { settingsApi } from '@/api/settings';
import {
  DEFAULT_CLINIC_BRANDING,
  type ClinicBranding,
} from '@/constants/clinicBranding';

function mapBranding(data?: { clinicName?: string; clinicTagline?: string | null }): ClinicBranding {
  return {
    name: data?.clinicName?.trim() || DEFAULT_CLINIC_BRANDING.name,
    tagline: data?.clinicTagline?.trim() || DEFAULT_CLINIC_BRANDING.tagline,
  };
}

/** للصفحات العامة (مريضات) — بدون تسجيل دخول */
export function usePublicClinicBranding() {
  const { data, isLoading } = useQuery(
    'clinic-branding-public',
    async () => {
      const { data: config } = await publicBookingApi.getConfig();
      return config.branding ?? DEFAULT_CLINIC_BRANDING;
    },
    { staleTime: 5 * 60_000 }
  );
  return { branding: data ?? DEFAULT_CLINIC_BRANDING, isLoading };
}

/** للوحة العيادة — من إعدادات مسجّل الدخول */
export function useStaffClinicBranding() {
  const { data, isLoading } = useQuery(
    'clinic-branding-staff',
    () => settingsApi.get().then((r) => mapBranding(r.data)),
    { staleTime: 60_000 }
  );
  return { branding: data ?? DEFAULT_CLINIC_BRANDING, isLoading };
}
