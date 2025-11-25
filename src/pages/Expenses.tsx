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
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false);
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
        <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="icon" className="rounded-full">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Gestione Finanziaria</h1>
            <p className="text-muted-foreground">Traccia entrate e spese</p>
          </div>
        </div>

        {/* Income Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">Entrate</CardTitle>
            <Dialog open={isIncomeDialogOpen} onOpenChange={setIsIncomeDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Aggiungi Entrata
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nuova Entrata</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddIncome} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="income-amount">Importo (€)</Label>
                    <Input
                      id="income-amount"
                      name="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="income-description">Descrizione</Label>
                    <Input
                      id="income-description"
                      name="description"
                      placeholder="es. Stipendio mensile"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="income-date">Data</Label>
                    <Input
                      id="income-date"
                      name="date"
                      type="date"
                      defaultValue={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">Salva Entrata</Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {incomes.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nessuna entrata registrata
                </p>
              ) : (
                incomes.map((income) => (
                  <div
                    key={income.id}
                    className="flex items-center justify-between p-3 bg-success/5 rounded-lg border border-success/20"
                  >
                    <div className="flex-1">
                      <p className="font-medium">€{Number(income.amount).toFixed(2)}</p>
                      {income.description && (
                        <p className="text-sm text-muted-foreground">{income.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground">{income.date}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteIncome(income.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Expense Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">Spese</CardTitle>
            <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="destructive" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Aggiungi Spesa
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nuova Spesa</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddExpense} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="expense-amount">Importo (€)</Label>
                    <Input
                      id="expense-amount"
                      name="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expense-description">Descrizione</Label>
                    <Input
                      id="expense-description"
                      name="description"
                      placeholder="es. Spesa al supermercato"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expense-category">Categoria</Label>
                    <Select name="category" required>
                      <SelectTrigger id="expense-category">
                        <SelectValue placeholder="Seleziona categoria" />
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
                    <Switch id="is-recurring" name="is_recurring" />
                    <Label htmlFor="is-recurring">Spesa ricorrente</Label>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expense-date">Data</Label>
                    <Input
                      id="expense-date"
                      name="date"
                      type="date"
                      defaultValue={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">Salva Spesa</Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expenses.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nessuna spesa registrata
                </p>
              ) : (
                expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg border border-destructive/20"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">€{Number(expense.amount).toFixed(2)}</p>
                        <span className="px-2 py-0.5 bg-muted rounded text-xs">
                          {expense.category}
                        </span>
                        {expense.is_recurring && (
                          <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs">
                            Ricorrente
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{expense.description}</p>
                      <p className="text-xs text-muted-foreground">{expense.date}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteExpense(expense.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
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
