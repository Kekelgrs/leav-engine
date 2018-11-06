import {i18n} from 'i18next';
import * as removeAccents from 'remove-accents';

/**
 * Return label matching user language (or default language) from an object containing all languages labels
 *
 * @param labels
 * @param i18next
 */
export const localizedLabel = (labels: any, i18next: i18n): string => {
    if (labels === null) {
        return '';
    }

    const userLang = i18next.language;
    const fallbackLang = i18next.options.fallbackLng ? i18next.options.fallbackLng[0] : '';

    return labels[userLang] || labels[fallbackLang] || labels[Object.keys(labels)[0]] || '';
};

export const getSysTranslationQueryLanguage = (i18next: i18n) => {
    const userLang = i18next.language.split('-')[0];
    const fallbackLang = i18next.options.fallbackLng ? i18next.options.fallbackLng[0] : '';

    return [userLang, fallbackLang];
};

export const formatIDString = (s: string): string => {
    return removeAccents(s)
        .toLowerCase()
        .replace(/\W/g, ' ') // Convert any non-word character to space (anything not a letter, a _ or a number)
        .trim() // Trim spaces
        .replace(/ /g, '_') // Convert spaces to _
        .replace(/(_){2,}/g, '_'); // Remove any __, ___, ....
};
