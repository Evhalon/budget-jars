import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, TrendingUp, PieChart as PieChartIcon, BarChart3 } from "lucide-react";
import { Session } from "@supabase/supabase-js";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface BudgetItem {
  category: string;
  amount: number;
  monthly_amount: number;
  type: string;
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function Statistics() {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [incomes, setIncomes] = useState<any[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) navigate("/auth");
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (!session) navigate("/auth");
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (session?.user) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    if (!session?.user) return;
    setLoading(true);

    const [budgetRes, expensesRes, incomesRes] = await Promise.all([
      supabase.from("budget_items").select("*").eq("user_id", session.user.id).eq("is_active", true),
      supabase.from("expenses").select("*").eq("user_id", session.user.id).order("date", { ascending: false }).limit(50),
      supabase.from("incomes").select("*").eq("user_id", session.user.id).order("date", { ascending: false }).limit(50)
    ]);

    if (budgetRes.data) setBudgetItems(budgetRes.data);
    if (expensesRes.data) setExpenses(expensesRes.data);
    if (incomesRes.data) setIncomes(incomesRes.data);

    setLoading(false);
  };

  const getCategoryData = () => {
    const expensesByCategory: { [key: string]: number } = {};
    
    budgetItems
      .filter(item => item.type === "expense")
      .forEach(item => {
        expensesByCategory[item.category] = (expensesByCategory[item.category] || 0) + Number(item.amount);
      });

    expenses.forEach(expense => {
      expensesByCategory[expense.category] = (expensesByCategory[expense.category] || 0) + Number(expense.amount);
    });

    return Object.entries(expensesByCategory).map(([name, value]) => ({ name, value }));
  };

  const getMonthlyTrend = () => {
    const monthlyData: { [key: string]: { entrate: number; uscite: number } } = {};

    [...expenses, ...incomes].forEach(item => {
      const date = new Date(item.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { entrate: 0, uscite: 0 };
      }

      if ('category' in item && item.category) {
        monthlyData[monthKey].uscite += Number(item.amount);
      } else {
        monthlyData[monthKey].entrate += Number(item.amount);
      }
    });

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, data]) => ({
        month: new Date(month + "-01").toLocaleDateString('it-IT', { month: 'short', year: '2-digit' }),
        ...data
      }));
  };

  const getBudgetComparison = () => {
    const planned = budgetItems.filter(item => item.type === "expense");
    const actual = expenses;

    const comparison = planned.map(item => {
      const actualAmount = actual
        .filter(exp => exp.category === item.category)
        .reduce((sum, exp) => sum + Number(exp.amount), 0);
      
      return {
        category: item.category,
        pianificato: Number(item.monthly_amount),
        effettivo: actualAmount
      };
    });

    return comparison;
  };

  const getIncomeExpenseData = () => {
    const totalIncome = incomes.reduce((sum, income) => sum + Number(income.amount), 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
    const totalBudget = budgetItems.filter(item => item.type === "expense").reduce((sum, item) => sum + Number(item.monthly_amount), 0);

    return [
      { name: "Entrate", value: totalIncome },
      { name: "Spese Effettive", value: totalExpenses },
      { name: "Budget Pianificato", value: totalBudget }
    ];
  };

  if (!session || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/")}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Statistiche
            </h1>
            <p className="text-muted-foreground mt-1">Analisi dettagliata delle tue finanze</p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Panoramica</TabsTrigger>
            <TabsTrigger value="trends">Andamenti</TabsTrigger>
            <TabsTrigger value="categories">Categorie</TabsTrigger>
            <TabsTrigger value="budget">Budget vs Reale</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="w-5 h-5" />
                    Distribuzione Entrate/Uscite
                  </CardTitle>
                  <CardDescription>Confronto generale</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={getIncomeExpenseData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getIncomeExpenseData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `€${value.toFixed(2)}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Spese per Categoria
                  </CardTitle>
                  <CardDescription>Top spese</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getCategoryData().slice(0, 5)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip formatter={(value: number) => `€${value.toFixed(2)}`} />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Andamento Mensile
                </CardTitle>
                <CardDescription>Entrate e uscite negli ultimi 6 mesi</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={getMonthlyTrend()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `€${value.toFixed(2)}`} />
                    <Legend />
                    <Line type="monotone" dataKey="entrate" stroke="#10b981" strokeWidth={2} name="Entrate" />
                    <Line type="monotone" dataKey="uscite" stroke="#ef4444" strokeWidth={2} name="Uscite" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Distribuzione Spese</CardTitle>
                  <CardDescription>Ripartizione per categoria</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={getCategoryData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getCategoryData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `€${value.toFixed(2)}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Dettaglio Categorie</CardTitle>
                  <CardDescription>Importi per categoria</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getCategoryData().map((item, index) => (
                      <div key={item.name} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <span className="font-bold">€{item.value.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="budget" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Budget vs Spese Effettive</CardTitle>
                <CardDescription>Confronto tra budget pianificato e spese reali</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={getBudgetComparison()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `€${value.toFixed(2)}`} />
                    <Legend />
                    <Bar dataKey="pianificato" fill="#3b82f6" name="Pianificato" />
                    <Bar dataKey="effettivo" fill="#ef4444" name="Effettivo" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
