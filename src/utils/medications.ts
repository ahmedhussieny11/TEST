import { Medication } from '@/types';

export function normalizeMedications(raw: unknown): Medication[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item, index) => {
    const m = item as Partial<Medication>;
    return {
      id: m.id ?? `med-${index}`,
      name: m.name ?? '',
      dosage: m.dosage ?? '',
      frequency: m.frequency ?? '',
      duration: m.duration ?? '',
      instructions: m.instructions,
    };
  });
}
