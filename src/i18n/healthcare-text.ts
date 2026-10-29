import { createUiText } from './ui-text';

export function healthcareText<T extends object>(record: T, key: keyof T, locale: string): string {
  const values = record as Record<string, unknown>;
  const arabicKey = key === 'degrees' ? 'degreeAr' : String(key) + 'Ar';
  const value = locale === 'ar' ? values[arabicKey] || values[String(key)] : values[String(key)];
  return typeof value === 'string' ? createUiText(locale)(value) : '';
}
