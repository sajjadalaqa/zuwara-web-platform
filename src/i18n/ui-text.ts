import arabic from '../../messages/ui-ar.json';

/** Translate presentation copy only; API values and submitted form data stay intact. */
export function createUiText(locale: string) {
  return (text: string): string => locale === 'ar'
    ? (arabic as Record<string, string>)[text] ?? text
    : text;
}
