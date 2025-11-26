import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/StatCard";
import { AISuggestions } from "@/components/AISuggestions";
import { TrendingUp, TrendingDown, Wallet, PiggyBank, LogOut, Plus, Receipt, Target, TrendingUpIcon, Calculator, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Session } from "@supabase/supabase-js";
import { ThemeToggle } from "@/components/ThemeToggle";

const Index = () => {
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">Benvenuto nel tuo budget manager</p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" size="icon" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Entrate Totali"
            value={`€${stats.totalIncome.toFixed(2)}`}
            icon={TrendingUp}
            variant="success"
            trend="Questo mese"
          />
          <StatCard
            title="Spese Totali"
            value={`€${stats.totalExpenses.toFixed(2)}`}
            icon={TrendingDown}
            variant="destructive"
            trend="Questo mese"
          />
          <StatCard
            title="Saldo Disponibile"
            value={`€${stats.balance.toFixed(2)}`}
            icon={Wallet}
            variant="default"
            trend="Disponibile"
          />
          <StatCard
            title="Risparmi"
            value={`€${stats.totalSavings.toFixed(2)}`}
            icon={PiggyBank}
            variant="default"
            trend="Negli obiettivi"
          />
        </div>

        {/* AI Suggestions */}
        <AISuggestions userId={session.user.id} />

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-4">
          <Link to="/expenses" className="block">
            <div className="p-6 text-center space-y-4 cursor-pointer h-full rounded-lg border border-border/50 shadow-sm hover:shadow-md hover:border-primary/30 transition-all">
              <div className="p-4 bg-red-500/10 rounded-full inline-block">
                <Receipt className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Gestisci Spese</h3>
                <p className="text-sm text-muted-foreground">
                  Traccia entrate e spese
                </p>
              </div>
            </div>
          </Link>

          <Link to="/jars" className="block">
            <div className="p-6 text-center space-y-4 cursor-pointer h-full rounded-lg border border-border/50 shadow-sm hover:shadow-md hover:border-primary/30 transition-all">
              <div className="p-4 bg-green-500/10 rounded-full inline-block">
                <Target className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Obiettivi di Risparmio</h3>
                <p className="text-sm text-muted-foreground">
                  I tuoi jars finanziari
                </p>
              </div>
            </div>
          </Link>



          <Link to="/budget" className="block">
            <div className="p-6 text-center space-y-4 cursor-pointer h-full rounded-lg border border-border/50 shadow-sm hover:shadow-md hover:border-primary/30 transition-all">
              <div className="p-4 bg-primary/10 rounded-full inline-block">
                <Calculator className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Budget</h3>
                <p className="text-sm text-muted-foreground">
                  Pianifica entrate e uscite
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Install App Banner */}
        {!isInstalled && (
          <Link to="/install">
            <div className="p-6 rounded-lg border border-primary/30 shadow-sm hover:shadow-md transition-all bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-1 flex items-center gap-2">
                    <Smartphone className="w-6 h-6" />
                    Installa l'App
                  </h3>
                  <p className="text-sm text-muted-foreground">Aggiungi Budget Manager alla tua schermata home per un accesso rapido</p>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Statistics Link */}
        <Link to="/statistics">
          <div className="p-6 rounded-lg border border-border/50 shadow-sm hover:shadow-md hover:border-primary/30 transition-all bg-gradient-to-r from-primary/5 to-accent/5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-1">Visualizza Statistiche</h3>
                <p className="text-sm text-muted-foreground">Analizza i tuoi dati finanziari con grafici dettagliati</p>
              </div>
              <TrendingUpIcon className="w-12 h-12 text-primary" />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Index;
