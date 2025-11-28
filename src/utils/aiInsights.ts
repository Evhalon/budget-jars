
export const generateInsight = (
    income: number,
    expenses: number,
    savings: number,
    topCategory?: { name: string; amount: number }
): string => {
    if (income === 0 && expenses === 0) {
        return "Start adding your income and expenses to unlock personalized insights!";
    }

    const balance = income - expenses;
    const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;
    const expenseRate = income > 0 ? (expenses / income) * 100 : 0;

    // Critical: Spending more than earning
    if (expenses > income) {
        const overspend = expenses - income;
        if (topCategory && topCategory.amount > overspend) {
            return `⚠️ Alert: You're spending €${overspend.toFixed(2)} more than you earn! Your top expense is ${topCategory.name} (€${topCategory.amount.toFixed(2)}). Consider reducing this category.`;
        }
        return `⚠️ Alert: You're overspending by €${overspend.toFixed(2)}. Review your expenses and cut back on non-essentials to get back on track.`;
    }

    // Excellent savings rate
    if (savingsRate > 30) {
        return `🚀 Outstanding! You're saving ${Math.round(savingsRate)}% of your income (€${balance.toFixed(2)}). You're on the fast track to financial freedom!`;
    }

    // Good savings rate
    if (savingsRate > 20) {
        return `✅ Excellent! You're saving ${Math.round(savingsRate)}% of your income. Keep up this great habit!`;
    }

    // Moderate savings
    if (savingsRate > 10) {
        return `💪 Good progress! You're saving ${Math.round(savingsRate)}% of your income. Try to reach 20% for optimal financial health.`;
    }

    // Low savings
    if (savingsRate > 0) {
        if (topCategory) {
            return `💡 You're saving ${Math.round(savingsRate)}% (€${balance.toFixed(2)}). Your biggest expense is ${topCategory.name} (€${topCategory.amount.toFixed(2)}). Could you reduce it by 10%?`;
        }
        return `💡 You're saving ${Math.round(savingsRate)}%. Try to increase this to at least 10% by reviewing your expenses.`;
    }

    // Breaking even
    return "⚖️ You're breaking even. Start by saving just 5% of your income - small steps lead to big results!";
};
