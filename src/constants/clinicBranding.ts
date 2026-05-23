export const DEFAULT_CLINIC_NAME = 'عيادة د. محمد عبدالحكيم';
export const DEFAULT_CLINIC_TAGLINE = 'طب النساء والتوليد';

export type ClinicBranding = {
  name: string;
  tagline: string;
};

export const DEFAULT_CLINIC_BRANDING: ClinicBranding = {
  name: DEFAULT_CLINIC_NAME,
  tagline: DEFAULT_CLINIC_TAGLINE,
};
