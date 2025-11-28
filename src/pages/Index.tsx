import { useEffect, useState, useLayoutEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Wallet, PiggyBank, LogOut, Download, CreditCard, User, Sparkles, PieChart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Session } from "@supabase/supabase-js";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { generateInsight } from "@/utils/aiInsights";

const Index = () => {
  const { t } = useLanguage();
  const [session, setSession] = useState<Session | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (!session) {
        navigate("/landing");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/landing");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const { data: stats = {
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    totalSavings: 0,
    jars: [],
    insight: ""
  }, isLoading: loading } = useQuery({
    queryKey: ['dashboardStats', session?.user?.id],
    queryFn: async () => {
      if (!session?.user) throw new Error('No session');

      const [incomesRes, expensesRes, jarsRes] = await Promise.all([
        supabase.from("incomes").select("amount").eq("user_id", session.user.id),
        supabase.from("expenses").select("amount, date, category").eq("user_id", session.user.id),
        supabase.from("jars").select("*").eq("user_id", session.user.id),
      ]);

      const totalIncome = incomesRes.data?.reduce((sum, income) => sum + Number(income.amount), 0) || 0;
      const totalExpenses = expensesRes.data?.reduce((sum, expense) => sum + Number(expense.amount), 0) || 0;
      const totalSavings = jarsRes.data?.reduce((sum, jar) => sum + Number(jar.current_amount), 0) || 0;

      // Find top category
      const categoryTotals: Record<string, number> = {};
      expensesRes.data?.forEach(e => {
        categoryTotals[e.category] = (categoryTotals[e.category] || 0) + Number(e.amount);
      });
      const topCategoryEntry = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
      const topCategory = topCategoryEntry ? { name: topCategoryEntry[0], amount: topCategoryEntry[1] } : undefined;

      const insight = generateInsight(totalIncome, totalExpenses, totalSavings, topCategory);

      return {
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
        totalSavings,
        jars: jarsRes.data || [],
        insight
      };
    },
    enabled: !!session?.user,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  // Check if app is installed
  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logout effettuato",
      description: "A presto!",
    });
  };

  // Scroll restoration
  useLayoutEffect(() => {
    const scrollPosition = sessionStorage.getItem("dashboardScrollPosition");
    if (scrollPosition) {
      window.scrollTo(0, parseInt(scrollPosition, 10));
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      sessionStorage.setItem("dashboardScrollPosition", window.scrollY.toString());
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      sessionStorage.setItem("dashboardScrollPosition", window.scrollY.toString());
    };
  }, []);

  if (!session) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden selection:bg-primary/20">
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-accent/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="container max-w-7xl mx-auto p-4 md:p-8 space-y-8 relative z-10">
        {/* Header Section */}
        <header className="flex items-center justify-between gap-4 pb-6">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            {t('appName')}
          </h1>
          <div className="flex items-center gap-3 bg-card/50 backdrop-blur-sm p-2 rounded-full border border-border/50 shadow-sm shrink-0">
            <ThemeToggle />
            <Link to="/profile">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors">
                <User className="w-5 h-5" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* Main Balance Card */}
          <div className="md:col-span-8 lg:col-span-6 relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-[2rem] blur-xl opacity-50 group-hover:opacity-75 transition-all duration-500" />
            <div className="relative h-full bg-card/80 backdrop-blur-xl border border-white/10 dark:border-white/5 p-8 rounded-[2rem] shadow-2xl flex flex-col justify-between overflow-hidden hover:scale-[1.02] transition-transform duration-500">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
                <Wallet className="w-48 h-48" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Wallet className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-medium">{t('availableBalance')}</span>
                </div>
                <h2 className="text-5xl md:text-6xl font-bold tracking-tighter text-foreground">
                  €{stats.balance.toFixed(2)}
                </h2>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-semibold text-sm">Active</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground bg-secondary/50 px-4 py-2 rounded-full border border-border/50">
                  <span className="text-sm">Updated just now</span>
                </div>
              </div>
            </div>
          </div>

          {/* Automatic Insights (Prominent) */}
          <div className="md:col-span-4 lg:col-span-6">
            <div className="h-full bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-md border border-cyan-500/20 p-8 rounded-[2rem] hover:border-cyan-500/40 transition-all duration-300 group hover:shadow-lg flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 bg-cyan-500/10 rounded-full blur-3xl" />
              <div className="relative z-10 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-cyan-500/20 rounded-2xl text-cyan-500 shrink-0 animate-pulse-slow">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-xl">{t('landingFeatureInsightsTitle')}</h3>
                </div>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  "{stats.insight}"
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats Column */}
          <div className="md:col-span-4 lg:col-span-3 flex flex-col gap-6">
            {/* Income Card */}
            <div className="flex-1 bg-card/50 backdrop-blur-md border border-border/50 p-6 rounded-[2rem] hover:bg-card/80 transition-all duration-300 group hover:shadow-lg hover:-translate-y-1">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
              <p className="text-muted-foreground text-sm font-medium">{t('totalIncome')}</p>
              <p className="text-2xl font-bold mt-1 text-foreground">€{stats.totalIncome.toFixed(2)}</p>
            </div>

            {/* Expenses Card */}
            <div className="flex-1 bg-card/50 backdrop-blur-md border border-border/50 p-6 rounded-[2rem] hover:bg-card/80 transition-all duration-300 group hover:shadow-lg hover:-translate-y-1">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-500 group-hover:scale-110 transition-transform duration-300">
                  <TrendingDown className="w-6 h-6" />
                </div>
              </div>
              <p className="text-muted-foreground text-sm font-medium">{t('totalExpenses')}</p>
              <p className="text-2xl font-bold mt-1 text-foreground">€{stats.totalExpenses.toFixed(2)}</p>
            </div>
          </div>

          {/* Savings / Jars Preview (Enhanced) */}
          <div className="md:col-span-8 lg:col-span-9">
            <div className="h-full bg-gradient-to-br from-indigo-500/5 to-purple-500/5 backdrop-blur-md border border-indigo-500/10 p-8 rounded-[2rem] flex flex-col justify-between group hover:border-indigo-500/30 transition-all duration-300 hover:shadow-lg">
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-500 group-hover:rotate-12 transition-transform duration-300">
                      <PiggyBank className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-xl">{t('landingFeatureGoalsTitle')}</h3>
                  </div>
                  <Link to="/jars" className="text-sm font-medium text-indigo-500 hover:text-indigo-600 bg-indigo-500/10 px-4 py-2 rounded-full transition-colors">
                    View All
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {stats.jars.length > 0 ? stats.jars.slice(0, 4).map((jar: any) => (
                    <div key={jar.id} className="space-y-3">
                      <div className="flex justify-between text-base font-medium">
                        <span>{jar.name}</span>
                        <span className="text-indigo-500">{Math.round((jar.current_amount / jar.target_amount) * 100)}%</span>
                      </div>
                      <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000"
                          style={{ width: `${Math.min(100, (jar.current_amount / jar.target_amount) * 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground text-right">€{jar.current_amount} / €{jar.target_amount}</p>
                    </div>
                  )) : (
                    // Mock data if no jars
                    <>
                      <div className="space-y-3">
                        <div className="flex justify-between text-base font-medium">
                          <span>New Car</span>
                          <span className="text-indigo-500">75%</span>
                        </div>
                        <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 w-[75%]" />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between text-base font-medium">
                          <span>Holiday</span>
                          <span className="text-indigo-500">30%</span>
                        </div>
                        <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 w-[30%]" />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Grid */}
          <div className="md:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
            <Link to="/expenses" className="group">
              <div className="h-full bg-card/50 hover:bg-card border border-border/50 hover:border-primary/20 p-6 rounded-[2rem] transition-all duration-300 flex flex-col items-center justify-center text-center gap-4 hover:shadow-xl hover:-translate-y-1">
                <div className="p-4 bg-background rounded-2xl shadow-sm group-hover:scale-110 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300">
                  <CreditCard className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{t('manageExpenses')}</h3>
                  <p className="text-xs text-muted-foreground mt-1 opacity-60 group-hover:opacity-100 transition-opacity">{t('trackIncomeExpenses')}</p>
                </div>
              </div>
            </Link>

            <Link to="/budget" className="group">
              <div className="h-full bg-card/50 hover:bg-card border border-border/50 hover:border-blue-500/20 p-6 rounded-[2rem] transition-all duration-300 flex flex-col items-center justify-center text-center gap-4 hover:shadow-xl hover:-translate-y-1">
                <div className="p-4 bg-background rounded-2xl shadow-sm group-hover:scale-110 group-hover:bg-blue-500/10 group-hover:text-blue-500 transition-all duration-300">
                  <Wallet className="w-8 h-8 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{t('budget')}</h3>
                  <p className="text-xs text-muted-foreground mt-1 opacity-60 group-hover:opacity-100 transition-opacity">{t('planIncomeExpenses')}</p>
                </div>
              </div>
            </Link>

            <Link to="/statistics" className="group">
              <div className="h-full bg-card/50 hover:bg-card border border-border/50 hover:border-purple-500/20 p-6 rounded-[2rem] transition-all duration-300 flex flex-col items-center justify-center text-center gap-4 hover:shadow-xl hover:-translate-y-1">
                <div className="p-4 bg-background rounded-2xl shadow-sm group-hover:scale-110 group-hover:bg-purple-500/10 group-hover:text-purple-500 transition-all duration-300">
                  <PieChart className="w-8 h-8 text-muted-foreground group-hover:text-purple-500 transition-colors" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{t('viewStatistics')}</h3>
                  <p className="text-xs text-muted-foreground mt-1 opacity-60 group-hover:opacity-100 transition-opacity">Analyze trends</p>
                </div>
              </div>
            </Link>

            {!isInstalled && (
              <Link to="/install" className="group">
                <div className="h-full bg-card/50 hover:bg-card border border-border/50 hover:border-green-500/20 p-6 rounded-[2rem] transition-all duration-300 flex flex-col items-center justify-center text-center gap-4 hover:shadow-xl hover:-translate-y-1">
                  <div className="p-4 bg-background rounded-2xl shadow-sm group-hover:scale-110 group-hover:bg-green-500/10 group-hover:text-green-500 transition-all duration-300">
                    <Download className="w-8 h-8 text-muted-foreground group-hover:text-green-500 transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{t('install')}</h3>
                    <p className="text-xs text-muted-foreground mt-1 opacity-60 group-hover:opacity-100 transition-opacity">{t('installAppDesc')}</p>
                  </div>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
