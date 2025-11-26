-- Add English columns for multilingual support
-- Run this in your Supabase SQL Editor

-- Add English category column to expenses
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS category_en TEXT;

-- Add English category column to budget_items
ALTER TABLE budget_items 
ADD COLUMN IF NOT EXISTS category_en TEXT;

-- Add English suggestion text to ai_suggestions
ALTER TABLE ai_suggestions 
ADD COLUMN IF NOT EXISTS suggestion_text_en TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_expenses_category_en ON expenses(category_en);
CREATE INDEX IF NOT EXISTS idx_budget_items_category_en ON budget_items(category_en);

-- Add comment to document the change
COMMENT ON COLUMN expenses.category_en IS 'English translation of category';
COMMENT ON COLUMN budget_items.category_en IS 'English translation of category';
COMMENT ON COLUMN ai_suggestions.suggestion_text_en IS 'English translation of suggestion text';
