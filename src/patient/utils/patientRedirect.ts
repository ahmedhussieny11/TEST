const REDIRECT_KEY = 'patient-auth-redirect';

export function setPatientRedirect(path: string) {
  sessionStorage.setItem(REDIRECT_KEY, path);
}

export function getPatientRedirect(fallback = '/patient/dashboard'): string {
  return sessionStorage.getItem(REDIRECT_KEY) || fallback;
}

export function clearPatientRedirect() {
  sessionStorage.removeItem(REDIRECT_KEY);
}

export function readRedirectParam(search: string): string | null {
  const value = new URLSearchParams(search).get('redirect');
  if (!value || !value.startsWith('/')) return null;
  return value;
}
