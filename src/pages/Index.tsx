import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/StatCard";
import { TrendingUp, TrendingDown, Wallet, PiggyBank, LogOut, Plus } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <div className="container max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Benvenuto nel tuo budget manager</p>
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
            variant="success"
            trend="Negli obiettivi"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2">
          <Link to="/expenses" className="block">
            <div className="h-full p-6 bg-card rounded-xl border-2 border-border hover:border-primary transition-all hover:shadow-lg cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <TrendingDown className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Gestisci Spese</h3>
                  <p className="text-sm text-muted-foreground">Aggiungi e visualizza le tue spese</p>
                </div>
              </div>
            </div>
          </Link>

          <Link to="/jars" className="block">
            <div className="h-full p-6 bg-card rounded-xl border-2 border-border hover:border-success transition-all hover:shadow-lg cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-success/10 rounded-xl">
                  <PiggyBank className="w-6 h-6 text-success" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Obiettivi di Risparmio</h3>
                  <p className="text-sm text-muted-foreground">Gestisci i tuoi "jars"</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
