import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/StatCard";
import { AISuggestions } from "@/components/AISuggestions";
import { TrendingUp, TrendingDown, Wallet, PiggyBank, LogOut, Plus, Receipt, Target, TrendingUpIcon, Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Session } from "@supabase/supabase-js";

const Index = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    totalSavings: 0,
  });
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
  }, [session]);

  const fetchStats = async () => {
    if (!session?.user) return;

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
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logout effettuato",
      description: "A presto!",
    });
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">Benvenuto nel tuo budget manager</p>
          </div>
          <Button variant="outline" size="icon" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
          </Button>
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

          <Link to="/projections" className="block">
            <div className="p-6 text-center space-y-4 cursor-pointer h-full rounded-lg border border-border/50 shadow-sm hover:shadow-md hover:border-primary/30 transition-all">
              <div className="p-4 bg-primary/10 rounded-full inline-block">
                <TrendingUpIcon className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Proiezioni</h3>
                <p className="text-sm text-muted-foreground">
                  Calcola il futuro
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
      </div>
    </div>
  );
};

export default Index;
