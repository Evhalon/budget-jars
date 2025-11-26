import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, TrendingUp, PieChart as PieChartIcon, BarChart3 } from "lucide-react";
import { Session } from "@supabase/supabase-js";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ThemeToggle } from "@/components/ThemeToggle";

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
        <div className="flex items-center justify-between">
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
          <ThemeToggle />
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
                <CardContent className="overflow-hidden">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={getIncomeExpenseData()}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                          const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                          const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                          const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                          return (
                            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-semibold">
                              {`${(percent * 100).toFixed(0)}%`}
                            </text>
                          );
                        }}
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="value"
                        stroke="none"
                      >
                        {getIncomeExpenseData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => `€${value.toFixed(2)}`}
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36}
                        wrapperStyle={{ fontSize: '12px' }}
                      />
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
                <CardContent className="overflow-hidden">
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={getCategoryData().slice(0, 5)} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis 
                        dataKey="name" 
                        angle={-35} 
                        textAnchor="end" 
                        height={80}
                        interval={0}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                      />
                      <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip 
                        formatter={(value: number) => `€${value.toFixed(2)}`}
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                      />
                      <Bar dataKey="value" fill="url(#colorValue)" radius={[8, 8, 0, 0]} />
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
              <CardContent className="overflow-hidden">
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={getMonthlyTrend()} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <defs>
                      <linearGradient id="colorEntrate" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorUscite" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip 
                      formatter={(value: number) => `€${value.toFixed(2)}`}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Line 
                      type="monotone" 
                      dataKey="entrate" 
                      stroke="#10b981" 
                      strokeWidth={3} 
                      name="Entrate"
                      dot={{ fill: '#10b981', r: 4 }}
                      activeDot={{ r: 6 }}
                      fill="url(#colorEntrate)"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="uscite" 
                      stroke="#ef4444" 
                      strokeWidth={3} 
                      name="Uscite"
                      dot={{ fill: '#ef4444', r: 4 }}
                      activeDot={{ r: 6 }}
                      fill="url(#colorUscite)"
                    />
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
                <CardContent className="overflow-hidden">
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={getCategoryData()}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                          const RADIAN = Math.PI / 180;
                          const radius = outerRadius + 25;
                          const x = cx + radius * Math.cos(-midAngle * RADIAN);
                          const y = cy + radius * Math.sin(-midAngle * RADIAN);
                          return (
                            <text 
                              x={x} 
                              y={y} 
                              fill="hsl(var(--foreground))" 
                              textAnchor={x > cx ? 'start' : 'end'} 
                              dominantBaseline="central"
                              className="text-xs font-medium"
                            >
                              {`${(percent * 100).toFixed(0)}%`}
                            </text>
                          );
                        }}
                        outerRadius={100}
                        innerRadius={50}
                        fill="#8884d8"
                        dataKey="value"
                        stroke="hsl(var(--background))"
                        strokeWidth={2}
                      >
                        {getCategoryData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => `€${value.toFixed(2)}`}
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36}
                        wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
                      />
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
              <CardContent className="overflow-hidden">
                <ResponsiveContainer width="100%" height={450}>
                  <BarChart data={getBudgetComparison()} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                    <defs>
                      <linearGradient id="colorPianificato" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      </linearGradient>
                      <linearGradient id="colorEffettivo" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.3}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis 
                      dataKey="category" 
                      angle={-35} 
                      textAnchor="end" 
                      height={80}
                      interval={0}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                    />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip 
                      formatter={(value: number) => `€${value.toFixed(2)}`}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    <Bar dataKey="pianificato" fill="url(#colorPianificato)" name="Pianificato" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="effettivo" fill="url(#colorEffettivo)" name="Effettivo" radius={[8, 8, 0, 0]} />
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
