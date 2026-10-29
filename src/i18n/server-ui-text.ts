import { getLocale } from 'next-intl/server';
import { createUiText } from './ui-text';

export async function getUiText() {
  return createUiText(await getLocale());
}
