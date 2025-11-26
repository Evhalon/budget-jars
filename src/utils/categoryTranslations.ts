// Category translations mapping: Italian -> English
export const categoryTranslations: { [key: string]: string } = {
    // Common expense categories
    "Alimentari": "Groceries",
    "Trasporti": "Transportation",
    "Casa e Servizi": "Home & Utilities",
    "Salute": "Health",
    "Intrattenimento": "Entertainment",
    "Abbigliamento": "Clothing",
    "Istruzione": "Education",
    "Ristoranti": "Restaurants",
    "Shopping": "Shopping",
    "Viaggi": "Travel",
    "Sport": "Sports",
    "Tecnologia": "Technology",
    "Regali": "Gifts",
    "Assicurazione": "Insurance",
    "Tasse": "Taxes",
    "Investimenti": "Investments",
    "Risparmi": "Savings",
    "Altro": "Other",

    // Common income categories
    "Stipendio": "Salary",
    "Freelance": "Freelance",
    "Investimenti": "Investments",
    "Bonus": "Bonus",
    "Regalo": "Gift",
    "Vendita": "Sale",
    "Affitto": "Rent",
    "Dividendi": "Dividends",
    "Interessi": "Interest",
    "Rimborso": "Refund",
};

// Reverse mapping for English -> Italian
export const categoryTranslationsReverse: { [key: string]: string } = Object.fromEntries(
    Object.entries(categoryTranslations).map(([it, en]) => [en, it])
);

// Function to translate category
export function translateCategory(category: string, toLanguage: 'it' | 'en'): string {
    if (toLanguage === 'en') {
        return categoryTranslations[category] || category;
    } else {
        return categoryTranslationsReverse[category] || category;
    }
}

// Function to get category in both languages
export function getCategoryBothLanguages(category: string): { it: string; en: string } {
    // If it's in Italian, translate to English
    if (categoryTranslations[category]) {
        return { it: category, en: categoryTranslations[category] };
    }
    // If it's in English, translate to Italian
    if (categoryTranslationsReverse[category]) {
        return { it: categoryTranslationsReverse[category], en: category };
    }
    // If no translation found, return same for both
    return { it: category, en: category };
}
