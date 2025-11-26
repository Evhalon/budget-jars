import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Trash2, PiggyBank, TrendingUp } from "lucide-react";
import { Session } from "@supabase/supabase-js";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import { Pencil } from "lucide-react";

interface Jar {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  created_at: string;
}

const Jars = () => {
  const { t } = useLanguage();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [jars, setJars] = useState<Jar[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDepositDialogOpen, setIsDepositDialogOpen] = useState(false);
  const [isDepositDialogOpen, setIsDepositDialogOpen] = useState(false);
  const [selectedJar, setSelectedJar] = useState<Jar | null>(null);
  const [editingJar, setEditingJar] = useState<Jar | null>(null);
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
      fetchJars();
    }
  }, [session]);

  const fetchJars = async () => {
    if (!session?.user) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("jars")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setJars(data);
    }

    setLoading(false);
  };

  const handleCreateJar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session?.user) return;

    const formData = new FormData(e.currentTarget);
    const { error } = await supabase.from("jars").insert({
      user_id: session.user.id,
      name: formData.get("name") as string,
      target_amount: Number(formData.get("target_amount")),
      current_amount: 0,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: error.message,
      });
    } else {
      toast({
        title: "Obiettivo creato!",
        description: "Il tuo jar è stato creato con successo.",
      });
      setIsCreateDialogOpen(false);
      fetchJars();
    }
  };

  const handleEditJar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session?.user || !editingJar) return;

    const formData = new FormData(e.currentTarget);
    const { error } = await supabase.from("jars").update({
      name: formData.get("name") as string,
      target_amount: Number(formData.get("target_amount")),
    }).eq("id", editingJar.id);

    if (error) {
      toast({ variant: "destructive", title: t('error'), description: error.message });
    } else {
      toast({ title: t('saved'), description: t('success') });
      setIsCreateDialogOpen(false);
      setEditingJar(null);
      fetchJars();
    }
  };

  const handleDeposit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedJar) return;

    const formData = new FormData(e.currentTarget);
    const depositAmount = Number(formData.get("amount"));
    const newAmount = selectedJar.current_amount + depositAmount;

    const { error } = await supabase
      .from("jars")
      .update({ current_amount: newAmount })
      .eq("id", selectedJar.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: error.message,
      });
    } else {
      const { error: txError } = await supabase.from("jar_transactions").insert({
        jar_id: selectedJar.id,
        amount: depositAmount,
        description: formData.get("description") as string || "Deposito",
        date: new Date().toISOString().split("T")[0],
      });

      if (!txError) {
        toast({
          title: "Deposito effettuato!",
          description: `Hai aggiunto €${depositAmount.toFixed(2)} al tuo obiettivo.`,
        });
        setIsDepositDialogOpen(false);
        setSelectedJar(null);
        fetchJars();
      }
    }
  };

  const handleDeleteJar = async (id: string) => {
    const { error } = await supabase.from("jars").delete().eq("id", id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: error.message,
      });
    } else {
      toast({
        title: "Obiettivo eliminato",
        description: "Il jar è stato rimosso.",
      });
      fetchJars();
    }
  };

  const openDepositDialog = (jar: Jar) => {
    setSelectedJar(jar);
    setIsDepositDialogOpen(true);
  };

  const openEditJar = (jar: Jar) => {
    setEditingJar(jar);
    setIsCreateDialogOpen(true);
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
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="icon" className="rounded-full">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">{t('jars')}</h1>
              <p className="text-muted-foreground">{t('welcomeMessage')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
              setIsCreateDialogOpen(open);
              if (!open) setEditingJar(null);
            }}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  {t('newJar')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingJar ? t('editJar') : t('createJar')}</DialogTitle>
                </DialogHeader>
                <form onSubmit={editingJar ? handleEditJar : handleCreateJar} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="jar-name">{t('jarName')}</Label>
                    <Input
                      id="jar-name"
                      name="name"
                      placeholder="es. Viaggio a Parigi"
                      required
                      defaultValue={editingJar?.name}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jar-target">{t('targetAmount')} (€)</Label>
                    <Input
                      id="jar-target"
                      name="target_amount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="4000.00"
                      required
                      defaultValue={editingJar?.target_amount}
                    />
                  </div>
                  <Button type="submit" className="w-full">{t('save')}</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Jars Grid */}
        {jars.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-6 bg-success/10 rounded-full">
                <PiggyBank className="w-12 h-12 text-success" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">{t('noJars')}</h3>
                <p className="text-muted-foreground mb-4">
                  {t('welcomeMessage')}
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  {t('createJar')}
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jars.map((jar) => {
              const progress = (jar.current_amount / jar.target_amount) * 100;
              const isCompleted = progress >= 100;

              return (
                <Card key={jar.id} className="overflow-hidden hover:border-success/50 transition-all">
                  <CardHeader className="bg-success/5 pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{jar.name}</CardTitle>
                        {isCompleted && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-success text-success-foreground rounded-full text-xs font-medium">
                            <TrendingUp className="w-3 h-3" />
                            {t('goalReached')}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditJar(jar)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteJar(jar.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t('progress')}</span>
                        <span className="font-medium">{progress.toFixed(1)}%</span>
                      </div>
                      <Progress value={progress} className="h-3" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm text-muted-foreground">{t('currentAmount')}</span>
                        <span className="text-2xl font-bold text-success">
                          €{Number(jar.current_amount).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm text-muted-foreground">{t('targetAmount')}</span>
                        <span className="text-lg font-medium">
                          €{Number(jar.target_amount).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline pt-2 border-t">
                        <span className="text-sm text-muted-foreground">{t('remaining')}</span>
                        <span className="text-lg font-medium text-primary">
                          €{Math.max(0, jar.target_amount - jar.current_amount).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={() => openDepositDialog(jar)}
                      className="w-full"
                      disabled={isCompleted}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {t('addFunds')}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Deposit Dialog */}
        <Dialog open={isDepositDialogOpen} onOpenChange={(open) => {
          setIsDepositDialogOpen(open);
          if (!open) setSelectedJar(null);
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('addFunds')}</DialogTitle>
            </DialogHeader>
            {selectedJar && (
              <form onSubmit={handleDeposit} className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Obiettivo</p>
                  <p className="font-semibold text-lg">{selectedJar.name}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Attuale: €{Number(selectedJar.current_amount).toFixed(2)} / €{Number(selectedJar.target_amount).toFixed(2)}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deposit-amount">{t('amount')} (€)</Label>
                  <Input
                    id="deposit-amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="50.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deposit-description">{t('description')}</Label>
                  <Input
                    id="deposit-description"
                    name="description"
                    placeholder="es. Risparmio mensile"
                  />
                </div>
                <Button type="submit" className="w-full">{t('confirm')}</Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Jars;
