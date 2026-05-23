export type ClinicRuntimeConfig = {
  apiUrl?: string;
  wsUrl?: string;
};

let loaded = false;
let config: ClinicRuntimeConfig = {};

/** يُحمَّل من public/config.json — يمكن تعديله على Hostinger بدون إعادة build */
export async function loadRuntimeConfig(): Promise<void> {
  if (loaded) return;
  try {
    const res = await fetch(`/config.json?ts=${Date.now()}`, { cache: 'no-store' });
    if (res.ok) {
      const data = (await res.json()) as ClinicRuntimeConfig;
      config = data;
    }
  } catch {
    // محلي أو بدون config.json
  }
  loaded = true;
}

function trimUrl(url: string | undefined): string | undefined {
  const u = url?.trim();
  return u || undefined;
}

/** أولوية: config.json ثم .env.production ثم /api (محلي فقط) */
export function getApiBaseUrl(): string {
  const fromFile = trimUrl(config.apiUrl);
  if (fromFile) return fromFile.replace(/\/$/, '');

  const fromEnv = trimUrl(import.meta.env.VITE_API_URL);
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  return '/api';
}

export function getWsBaseUrl(): string {
  const fromFile = trimUrl(config.wsUrl);
  if (fromFile) return fromFile.replace(/\/$/, '');

  const fromEnv = trimUrl(import.meta.env.VITE_WS_URL);
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  if (import.meta.env.DEV) return 'http://localhost:4000';
  return window.location.origin;
}
