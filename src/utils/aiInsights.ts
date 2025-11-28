
export const generateInsight = (
    income: number,
    expenses: number,
    savings: number,
    topCategory?: { name: string; amount: number }
): string => {
    if (income === 0 && expenses === 0) {
        return "Start adding your income and expenses to unlock personalized insights!";
    }

    const savingsRate = income > 0 ? (savings / income) * 100 : 0;
    const expenseRate = income > 0 ? (expenses / income) * 100 : 0;

    if (expenses > income) {
        return `⚠️ Alert: You're spending ${Math.round(expenseRate)}% of your income. Consider cutting back on ${topCategory ? topCategory.name : 'non-essentials'} to get back on track.`;
    }

    if (savingsRate > 20) {
        return `🚀 Excellent! You're saving ${Math.round(savingsRate)}% of your income. You're well on your way to financial freedom!`;
    }

    if (savingsRate > 0) {
        return `✅ Good start! You're saving ${Math.round(savingsRate)}%. Try to increase this to 20% for better financial health.`;
    }

    return "💡 Tip: Track every penny. Small expenses add up quickly!";
};
