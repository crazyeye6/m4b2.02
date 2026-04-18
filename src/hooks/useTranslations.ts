import { useLocale } from '../context/LocaleContext';
import { getTranslations, type Translations } from '../lib/i18n';

export function useTranslations(): Translations {
  const { language } = useLocale();
  return getTranslations(language.code);
}
