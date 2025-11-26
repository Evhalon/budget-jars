import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/StatCard";
import { AISuggestions } from "@/components/AISuggestions";
import { TrendingUp, TrendingDown, Wallet, PiggyBank, LogOut, Plus, Download, BarChart3, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Session } from "@supabase/supabase-js";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const { t } = useLanguage();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    totalSavings: 0,
  });
  const [isInstalled, setIsInstalled] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (session?.user) {
      fetchStats();
    }

    // Check if app is installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }
  }, [session]);

  const fetchStats = async () => {
    if (!session?.user) return;

    setLoading(true);

    const { data: incomes } = await supabase
      .from("incomes")
      .select("amount")
      .eq("user_id", session.user.id);

    const { data: expenses } = await supabase
      .from("expenses")
      .select("amount")
      .eq("user_id", session.user.id);

    const { data: jars } = await supabase
      .from("jars")
      .select("current_amount")
      .eq("user_id", session.user.id);

    const totalIncome = incomes?.reduce((sum, income) => sum + Number(income.amount), 0) || 0;
    const totalExpenses = expenses?.reduce((sum, expense) => sum + Number(expense.amount), 0) || 0;
    const totalSavings = jars?.reduce((sum, jar) => sum + Number(jar.current_amount), 0) || 0;

    setStats({
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      totalSavings,
    });

    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logout effettuato",
      description: "A presto!",
    });
  };

  useEffect(() => {
    // Scroll restoration
    const scrollPosition = sessionStorage.getItem("dashboardScrollPosition");
    if (scrollPosition) {
      window.scrollTo(0, parseInt(scrollPosition));
    }

    const handleScroll = () => {
      sessionStorage.setItem("dashboardScrollPosition", window.scrollY.toString());
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto p-4 md:p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex justify-between items-center md:order-2">
            <ThemeToggle />
            <Button variant="outline" size="icon" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
          <div className="md:order-1">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              {t('appName')}
            </h1>
            <p className="text-muted-foreground mt-1">{t('welcomeMessage')}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title={t('totalIncome')}
            value={`€${stats.totalIncome.toFixed(2)} `}
            icon={TrendingUp}
            variant="success"
            trend={t('thisMonth')}
          />
          <StatCard
            title={t('totalExpenses')}
            value={`€${stats.totalExpenses.toFixed(2)} `}
            icon={TrendingDown}
            variant="destructive"
            trend={t('thisMonth')}
          />
          <StatCard
            title={t('availableBalance')}
            value={`€${stats.balance.toFixed(2)} `}
            icon={Wallet}
            variant="default"
            trend={t('available')}
          />
          <StatCard
            title={t('savings')}
            value={`€${stats.totalSavings.toFixed(2)} `}
            icon={PiggyBank}
            variant="default"
            trend={t('inGoals')}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 pt-4">
          <Link to="/expenses" className="block">
            <div className="p-6 text-center space-y-4 cursor-pointer h-full rounded-lg border border-border/50 shadow-sm hover:shadow-md hover:border-primary/30 transition-all">
              <div className="p-4 bg-red-500/10 rounded-full inline-block">
                <TrendingDown className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{t('manageExpenses')}</h3>
                <p className="text-sm text-muted-foreground">{t('trackIncomeExpenses')}</p>
              </div>
            </div>
          </Link>

          <Link to="/jars" className="block">
            <div className="p-6 text-center space-y-4 cursor-pointer h-full rounded-lg border border-border/50 shadow-sm hover:shadow-md hover:border-primary/30 transition-all">
              <div className="p-4 bg-primary/10 rounded-full inline-block">
                <PiggyBank className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{t('savingsGoals')}</h3>
                <p className="text-sm text-muted-foreground">{t('yourFinancialJars')}</p>
              </div>
            </div>
          </Link>

          <Link to="/budget" className="block">
            <div className="p-6 text-center space-y-4 cursor-pointer h-full rounded-lg border border-border/50 shadow-sm hover:shadow-md hover:border-primary/30 transition-all">
              <div className="p-4 bg-blue-500/10 rounded-full inline-block">
                <Wallet className="w-8 h-8 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{t('budget')}</h3>
                <p className="text-sm text-muted-foreground">{t('planIncomeExpenses')}</p>
              </div>
            </div>
          </Link>

          {isInstalled ? (
            <div className="p-6 text-center space-y-4 h-full rounded-lg border border-border/50 shadow-sm opacity-50">
              <div className="p-4 bg-green-500/10 rounded-full inline-block">
                <Download className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{t('install')}</h3>
                <p className="text-sm text-muted-foreground">{t('installAppDescription')}</p>
              </div>
            </div>
          ) : (
            <Link to="/install" className="block">
              <div className="p-6 text-center space-y-4 cursor-pointer h-full rounded-lg border border-border/50 shadow-sm hover:shadow-md hover:border-primary/30 transition-all">
                <div className="p-4 bg-green-500/10 rounded-full inline-block">
                  <Download className="w-8 h-8 text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{t('install')}</h3>
                  <p className="text-sm text-muted-foreground">{t('installAppDesc')}</p>
                </div>
              </div>
            </Link>
          )}
        </div>

        {/* AI Suggestions */}
        <AISuggestions userId={session.user.id} />

        {/* Statistics Link */}
        <div className="pt-8 pb-4">
          <Link to="/statistics" className="block">
            <div className="p-6 rounded-lg border border-border/50 shadow-sm hover:shadow-md hover:border-primary/30 transition-all bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-500/10 rounded-full">
                    <BarChart3 className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{t('viewStatistics')}</h3>
                    <p className="text-sm text-muted-foreground">{t('viewStatistics')}</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
