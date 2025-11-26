import { supabase } from "@/integrations/supabase/client";
import { translateCategory } from "./categoryTranslations";

/**
 * Migrate existing user data to populate English columns
 * This should be run once per user after the database migration
 */
export async function migrateUserCategories(userId: string): Promise<{
    success: boolean;
    expensesMigrated: number;
    budgetItemsMigrated: number;
    error?: string;
}> {
    try {
        let expensesMigrated = 0;
        let budgetItemsMigrated = 0;

        // Migrate expenses
        const { data: expenses, error: expensesError } = await supabase
            .from("expenses")
            .select("id, category, category_en")
            .eq("user_id", userId)
            .is("category_en", null);

        if (expensesError) throw expensesError;

        if (expenses && expenses.length > 0) {
            const updates = expenses.map((expense) => ({
                id: expense.id,
                category_en: translateCategory(expense.category, 'en'),
            }));

            for (const update of updates) {
                const { error } = await supabase
                    .from("expenses")
                    .update({ category_en: update.category_en })
                    .eq("id", update.id);

                if (!error) expensesMigrated++;
            }
        }

        // Migrate budget items
        const { data: budgetItems, error: budgetError } = await supabase
            .from("budget_items")
            .select("id, category, category_en")
            .eq("user_id", userId)
            .is("category_en", null);

        if (budgetError) throw budgetError;

        if (budgetItems && budgetItems.length > 0) {
            const updates = budgetItems.map((item) => ({
                id: item.id,
                category_en: translateCategory(item.category, 'en'),
            }));

            for (const update of updates) {
                const { error } = await supabase
                    .from("budget_items")
                    .update({ category_en: update.category_en })
                    .eq("id", update.id);

                if (!error) budgetItemsMigrated++;
            }
        }

        return {
            success: true,
            expensesMigrated,
            budgetItemsMigrated,
        };
    } catch (error: any) {
        return {
            success: false,
            expensesMigrated: 0,
            budgetItemsMigrated: 0,
            error: error.message,
        };
    }
}

/**
 * Check if user data needs migration
 */
export async function needsMigration(userId: string): Promise<boolean> {
    const { data: expenses } = await supabase
        .from("expenses")
        .select("id")
        .eq("user_id", userId)
        .is("category_en", null)
        .limit(1);

    const { data: budgetItems } = await supabase
        .from("budget_items")
        .select("id")
        .eq("user_id", userId)
        .is("category_en", null)
        .limit(1);

    return (expenses && expenses.length > 0) || (budgetItems && budgetItems.length > 0);
}
