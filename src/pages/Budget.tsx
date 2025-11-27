import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, TrendingUp, TrendingDown, Trash2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import { Pencil } from "lucide-react";
import { getBudgetExpenseCategories, getBudgetIncomeCategories, getFrequencies } from "@/utils/categoryUtils";

interface BudgetItem {
  id: string;
  type: "income" | "expense";
  category: string;
  description: string;
  amount: number;
  frequency: string;
  monthly_amount: number;
  annual_amount: number;
}

export default function Budget() {
  const { t } = useLanguage();
  const EXPENSE_CATEGORIES = getBudgetExpenseCategories(t);
  const INCOME_CATEGORIES = getBudgetIncomeCategories(t);
  const FREQUENCIES = getFrequencies(t);
  const navigate = useNavigate();
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [userId, setUserId] = useState<string>("");
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({
    type: "expense" as "income" | "expense",
    category: "",
    description: "",
    amount: "",
    frequency: "monthly"
  });
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (userId) fetchItems();
  }, [userId]);

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setUserId(user.id);
  };

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("budget_items")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("type", { ascending: true })
      .order("category", { ascending: true });

    if (!error && data) {
      setItems(data.map(item => ({
        ...item,
        type: item.type as "income" | "expense"
      })));
    }
    setLoading(false);
  };

  const calculateAmounts = (amount: number, frequency: string) => {
    const freq = FREQUENCIES.find(f => f.value === frequency);
    const annualAmount = amount * (freq?.multiplier || 12);
    const monthlyAmount = annualAmount / 12;
    return { monthlyAmount, annualAmount };
  };

  const addItem = async () => {
    if (!newItem.description || !newItem.amount || !newItem.category) {
      toast({ variant: "destructive", title: "Compila tutti i campi" });
      return;
    }

    const amount = parseFloat(newItem.amount);
    const { monthlyAmount, annualAmount } = calculateAmounts(amount, newItem.frequency);

    const { error } = await supabase.from("budget_items").insert({
      user_id: userId,
      type: newItem.type,
      category: newItem.category,
      description: newItem.description,
      amount,
      frequency: newItem.frequency,
      monthly_amount: monthlyAmount,
      annual_amount: annualAmount
    });

    if (error) {
      toast({ variant: "destructive", title: "Errore nell'aggiunta" });
    } else {
      toast({ title: "Voce aggiunta" });
      setNewItem({ type: "expense", category: "", description: "", amount: "", frequency: "monthly" });
      setIsAdding(false);
      fetchItems();
    }
  };

  const handleEditItem = async () => {
    if (!newItem.description || !newItem.amount || !newItem.category || !editingItem) {
      toast({ variant: "destructive", title: t('fillAllFields') });
      return;
    }

    const amount = parseFloat(newItem.amount);
    const { monthlyAmount, annualAmount } = calculateAmounts(amount, newItem.frequency);

    const { error } = await supabase.from("budget_items").update({
      type: newItem.type,
      category: newItem.category,
      description: newItem.description,
      amount,
      frequency: newItem.frequency,
      monthly_amount: monthlyAmount,
      annual_amount: annualAmount
    }).eq("id", editingItem.id);

    if (error) {
      toast({ variant: "destructive", title: t('error') });
    } else {
      toast({ title: t('saved') });
      setNewItem({ type: "expense", category: "", description: "", amount: "", frequency: "monthly" });
      setIsAdding(false);
      setEditingItem(null);
      fetchItems();
    }
  };

  const openEdit = (item: BudgetItem) => {
    setEditingItem(item);
    setNewItem({
      type: item.type,
      category: item.category,
      description: item.description,
      amount: item.amount.toString(),
      frequency: item.frequency
    });
    setIsAdding(true);
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase
      .from("budget_items")
      .update({ is_active: false })
      .eq("id", id);

    if (!error) {
      toast({ title: "Voce eliminata" });
      fetchItems();
    }
  };

  const totals = items.reduce((acc, item) => {
    if (item.type === "income") {
      acc.income += item.monthly_amount;
    } else {
      acc.expenses += item.monthly_amount;
    }
    return acc;
  }, { income: 0, expenses: 0 });

  const savings = totals.income - totals.expenses;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-start">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <ThemeToggle />
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                {t('budget')}
              </h1>
              <p className="text-muted-foreground mt-1">{t('welcomeMessage')}</p>
            </div>
            <Button onClick={() => {
              setEditingItem(null);
              setNewItem({ type: "expense", category: "", description: "", amount: "", frequency: "monthly" });
              setIsAdding(!isAdding);
            }} className="gap-2 w-full md:w-auto">
              <Plus className="w-4 h-4" />
              {t('add')}
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-green-500/10">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('totalIncome')}</p>
                  <p className="text-2xl font-bold">€{totals.income.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-red-500/10">
                  <TrendingDown className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('totalExpenses')}</p>
                  <p className="text-2xl font-bold">€{totals.expenses.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`border-none shadow-lg ${savings >= 0 ? 'bg-gradient-to-br from-green-500/10 to-green-500/5' : 'bg-gradient-to-br from-red-500/10 to-red-500/5'}`}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${savings >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                  <TrendingUp className={`w-6 h-6 ${savings >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('savings')}</p>
                  <p className={`text-2xl font-bold ${savings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    €{Math.abs(savings).toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add Item Form */}
        {isAdding && (
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle>{editingItem ? t('editItem') : t('newItem')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select value={newItem.type} onValueChange={(v) => setNewItem({ ...newItem, type: v as "income" | "expense", category: "" })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">{t('income')}</SelectItem>
                    <SelectItem value="expense">{t('expense')}</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={newItem.category} onValueChange={(v) => setNewItem({ ...newItem, category: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('category')} />
                  </SelectTrigger>
                  <SelectContent>
                    {(newItem.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  placeholder={t('description')}
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                />

                <Input
                  type="number"
                  placeholder={t('amount')}
                  value={newItem.amount}
                  onChange={(e) => setNewItem({ ...newItem, amount: e.target.value })}
                />

                <Select value={newItem.frequency} onValueChange={(v) => setNewItem({ ...newItem, frequency: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FREQUENCIES.map(f => (
                      <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button onClick={editingItem ? handleEditItem : addItem} className="flex-1">{t('save')}</Button>
                <Button variant="outline" onClick={() => setIsAdding(false)} className="flex-1">{t('cancel')}</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Items List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Income */}
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <TrendingUp className="w-5 h-5" />
                {t('income')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {items.filter(i => i.type === "income").map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex-1">
                    <p className="font-medium">{item.description}</p>
                    <p className="text-xs text-muted-foreground">{item.category} • {FREQUENCIES.find(f => f.value === item.frequency)?.label}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="font-semibold">€{item.monthly_amount.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">/{t('monthly')}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteItem(item.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {items.filter(i => i.type === "income").length === 0 && (
                <p className="text-center text-muted-foreground py-8">{t('noIncomes')}</p>
              )}
            </CardContent>
          </Card>

          {/* Expenses */}
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <TrendingDown className="w-5 h-5" />
                {t('expense')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {items.filter(i => i.type === "expense").map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex-1">
                    <p className="font-medium">{item.description}</p>
                    <p className="text-xs text-muted-foreground">{item.category} • {FREQUENCIES.find(f => f.value === item.frequency)?.label}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="font-semibold">€{item.monthly_amount.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">/{t('monthly')}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteItem(item.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {items.filter(i => i.type === "expense").length === 0 && (
                <p className="text-center text-muted-foreground py-8">{t('noExpenses')}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
