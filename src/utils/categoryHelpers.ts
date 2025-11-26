import { getCategoryBothLanguages } from "./categoryTranslations";

/**
 * Helper to get the correct category based on language
 */
export function getLocalizedCategory(
    categoryIt: string,
    categoryEn: string | null | undefined,
    language: 'it' | 'en'
): string {
    if (language === 'en' && categoryEn) {
        return categoryEn;
    }
    return categoryIt;
}

/**
 * Prepare category data for saving (both IT and EN)
 */
export function prepareCategoryForSave(category: string): { category: string; category_en: string } {
    const both = getCategoryBothLanguages(category);
    return {
        category: both.it,
        category_en: both.en,
    };
}
