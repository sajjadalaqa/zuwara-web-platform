import { useLocale } from 'next-intl';
import { useMemo } from 'react';
import { createUiText } from './ui-text';

export function useUiText() {
  const locale = useLocale();
  return useMemo(() => createUiText(locale), [locale]);
}
