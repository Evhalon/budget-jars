import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Trash2, TrendingDown } from "lucide-react";
import { Session } from "@supabase/supabase-js";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import { Pencil } from "lucide-react";

interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  is_recurring: boolean;
  date: string;
}

interface Income {
  id: string;
  amount: number;
  description: string;
  date: string;
}

const categories = [
  "Affitto",
  "Bollette",
  "Spesa",
  "Trasporti",
  "Salute",
  "Svago",
  "Altro",
];

const Expenses = () => {
  const { t } = useLanguage();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (session?.user) {
      fetchData();
    }
  }, [session]);

  const fetchExpenses = async () => {
    if (!session?.user) return;

    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", session.user.id)
      .order("date", { ascending: false });

    if (!error && data) {
      setExpenses(data);
    }
  };

  const fetchIncomes = async () => {
    if (!session?.user) return;

    const { data, error } = await supabase
      .from("incomes")
      .select("*")
      .eq("user_id", session.user.id)
      .order("date", { ascending: false });

    if (!error && data) {
      setIncomes(data);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchExpenses(), fetchIncomes()]);
    setLoading(false);
  };

  const handleAddExpense = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session?.user) return;

    const formData = new FormData(e.currentTarget);
    const { error } = await supabase.from("expenses").insert({
      user_id: session.user.id,
      amount: Number(formData.get("amount")),
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      is_recurring: formData.get("is_recurring") === "on",
      date: formData.get("date") as string,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: error.message,
      });
    } else {
      toast({
        title: "Spesa aggiunta!",
        description: "La spesa è stata salvata con successo.",
      });
      setIsExpenseDialogOpen(false);
      fetchExpenses();
    }
  };

  const handleEditExpense = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session?.user || !editingExpense) return;

    const formData = new FormData(e.currentTarget);
    const { error } = await supabase.from("expenses").update({
      amount: Number(formData.get("amount")),
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      is_recurring: formData.get("is_recurring") === "on",
      date: formData.get("date") as string,
    }).eq("id", editingExpense.id);

    if (error) {
      toast({ variant: "destructive", title: t('error'), description: error.message });
    } else {
      toast({ title: t('saved'), description: t('success') });
      setIsExpenseDialogOpen(false);
      setEditingExpense(null);
      fetchExpenses();
    }
  };

  const handleEditIncome = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session?.user || !editingIncome) return;

    const formData = new FormData(e.currentTarget);
    const { error } = await supabase.from("incomes").update({
      amount: Number(formData.get("amount")),
      description: formData.get("description") as string,
      date: formData.get("date") as string,
    }).eq("id", editingIncome.id);

    if (error) {
      toast({ variant: "destructive", title: t('error'), description: error.message });
    } else {
      toast({ title: t('saved'), description: t('success') });
      setIsIncomeDialogOpen(false);
      setEditingIncome(null);
      fetchIncomes();
    }
  };

  const handleAddIncome = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session?.user) return;

    const formData = new FormData(e.currentTarget);
    const { error } = await supabase.from("incomes").insert({
      user_id: session.user.id,
      amount: Number(formData.get("amount")),
      description: formData.get("description") as string,
      date: formData.get("date") as string,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: error.message,
      });
    } else {
      toast({
        title: "Entrata aggiunta!",
        description: "L'entrata è stata salvata con successo.",
      });
      setIsIncomeDialogOpen(false);
      fetchIncomes();
    }
  };

  const openEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsExpenseDialogOpen(true);
  };

  const openEditIncome = (income: Income) => {
    setEditingIncome(income);
    setIsIncomeDialogOpen(true);
  };

  const handleDeleteExpense = async (id: string) => {
    const { error } = await supabase.from("expenses").delete().eq("id", id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: error.message,
      });
    } else {
      toast({
        title: "Spesa eliminata",
        description: "La spesa è stata rimossa.",
      });
      fetchExpenses();
    }
  };

  const handleDeleteIncome = async (id: string) => {
    const { error } = await supabase.from("incomes").delete().eq("id", id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: error.message,
      });
    } else {
      toast({
        title: "Entrata eliminata",
        description: "L'entrata è stata rimossa.",
      });
      fetchIncomes();
    }
  };

  if (!session) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-start">
            <Link to="/">
              <Button variant="outline" size="icon" className="rounded-full">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <ThemeToggle />
          </div>

          <div>
            <h1 className="text-3xl md:text-4xl font-bold">{t('appName')}</h1>
            <p className="text-muted-foreground mt-1">{t('welcomeMessage')}</p>
          </div>
        </div>

        {/* Income Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">{t('income')}</CardTitle>
            <Dialog open={isIncomeDialogOpen} onOpenChange={(open) => {
              setIsIncomeDialogOpen(open);
              if (!open) setEditingIncome(null);
            }}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  {t('addIncome')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingIncome ? t('editIncome') : t('addIncome')}</DialogTitle>
                </DialogHeader>
                <form onSubmit={editingIncome ? handleEditIncome : handleAddIncome} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="income-amount">{t('amount')} (€)</Label>
                    <Input
                      id="income-amount"
                      name="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      defaultValue={editingIncome?.amount}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="income-description">{t('description')}</Label>
                    <Input
                      id="income-description"
                      name="description"
                      placeholder="es. Stipendio mensile"
                      defaultValue={editingIncome?.description}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="income-date">{t('date')}</Label>
                    <Input
                      id="income-date"
                      name="date"
                      type="date"
                      defaultValue={editingIncome?.date || new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">{t('save')}</Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {incomes.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t('noIncomesRecorded')}
                </p>
              ) : (
                incomes.map((income) => (
                  <div
                    key={income.id}
                    className="flex items-center justify-between p-3 bg-card rounded-lg border shadow-sm"
                  >
                    <div className="flex-1">
                      <p className="font-medium">€{Number(income.amount).toFixed(2)}</p>
                      {income.description && (
                        <p className="text-sm text-muted-foreground">{income.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground">{income.date}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditIncome(income)}
                      >
                        <Pencil className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteIncome(income.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Expense Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">{t('expense')}</CardTitle>
            <Dialog open={isExpenseDialogOpen} onOpenChange={(open) => {
              setIsExpenseDialogOpen(open);
              if (!open) setEditingExpense(null);
            }}>
              <DialogTrigger asChild>
                <Button size="sm" variant="destructive" className="gap-2">
                  <Plus className="w-4 h-4" />
                  {t('addExpense')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingExpense ? t('editExpense') : t('addExpense')}</DialogTitle>
                </DialogHeader>
                <form onSubmit={editingExpense ? handleEditExpense : handleAddExpense} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="expense-amount">{t('amount')} (€)</Label>
                    <Input
                      id="expense-amount"
                      name="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      defaultValue={editingExpense?.amount}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expense-description">{t('description')}</Label>
                    <Input
                      id="expense-description"
                      name="description"
                      placeholder="es. Spesa al supermercato"
                      required
                      defaultValue={editingExpense?.description}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expense-category">{t('category')}</Label>
                    <Select name="category" required defaultValue={editingExpense?.category}>
                      <SelectTrigger id="expense-category">
                        <SelectValue placeholder={t('category')} />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="is-recurring" name="is_recurring" defaultChecked={editingExpense?.is_recurring} />
                    <Label htmlFor="is-recurring">{t('recurring')}</Label>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expense-date">{t('date')}</Label>
                    <Input
                      id="expense-date"
                      name="date"
                      type="date"
                      defaultValue={editingExpense?.date || new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">{t('save')}</Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expenses.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t('noExpensesRecorded')}
                </p>
              ) : (
                expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-3 bg-card rounded-lg border shadow-sm"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">€{Number(expense.amount).toFixed(2)}</p>
                        <span className="px-2 py-0.5 bg-muted rounded text-xs text-muted-foreground">
                          {expense.category}
                        </span>
                        {expense.is_recurring && (
                          <span className="px-2 py-0.5 bg-accent/10 text-accent-foreground rounded text-xs">
                            {t('recurring')}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{expense.description}</p>
                      <p className="text-xs text-muted-foreground">{expense.date}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditExpense(expense)}
                      >
                        <Pencil className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteExpense(expense.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Expenses;
