import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Calculator, TrendingUp, Save, Trash2, Loader2 } from "lucide-react";
import { Session } from "@supabase/supabase-js";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/ThemeToggle";

interface Projection {
  id: string;
  name: string;
  description: string;
  starting_amount: number;
  monthly_savings: number;
  months: number;
  final_amount: number;
  interest_rate: number;
  created_at: string;
}

const Projections = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [projections, setProjections] = useState<Projection[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [result, setResult] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

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
    if (session?.user) fetchProjections();
  }, [session]);

  const fetchProjections = async () => {
    if (!session?.user) return;
    
    setLoading(true);

    const { data, error } = await supabase
      .from("projections")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (!error && data) setProjections(data);
    
    setLoading(false);
  };

  const handleCalculate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session?.user) return;

    setIsCalculating(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      const { data, error } = await supabase.functions.invoke("ai-projection", {
        body: {
          userId: session.user.id,
          startingAmount: Number(formData.get("starting_amount")),
          monthlySavings: Number(formData.get("monthly_savings")),
          months: Number(formData.get("months")),
          saveName: null
        }
      });

      if (error) throw error;

      setResult(data);
      toast({
        title: "Proiezione calcolata!",
        description: "Analisi AI completata con successo.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: error.message,
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSaveProjection = async () => {
    if (!session?.user || !result) return;

    const name = prompt("Nome della proiezione:");
    if (!name) return;

    try {
      const { error } = await supabase.from("projections").insert({
        user_id: session.user.id,
        name,
        description: result.analysis,
        starting_amount: 0, // Will be updated from form
        monthly_savings: 0,
        months: 0,
        final_amount: Number(result.finalAmount),
        interest_rate: 0.02
      });

      if (error) throw error;

      toast({
        title: "Proiezione salvata!",
        description: "La proiezione è stata salvata con successo.",
      });
      fetchProjections();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: error.message,
      });
    }
  };

  const handleDeleteProjection = async (id: string) => {
    const { error } = await supabase.from("projections").delete().eq("id", id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: error.message,
      });
    } else {
      toast({
        title: "Proiezione eliminata",
        description: "La proiezione è stata rimossa.",
      });
      fetchProjections();
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="icon" className="rounded-full">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Proiezioni Finanziarie</h1>
              <p className="text-muted-foreground">Calcola il futuro dei tuoi risparmi con AI</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Calculator className="w-4 h-4" />
                  Nuova Proiezione
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Calcola Proiezione Finanziaria</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCalculate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="starting_amount">Importo Iniziale (€)</Label>
                    <Input
                      id="starting_amount"
                      name="starting_amount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="1000.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monthly_savings">Risparmio Mensile (€)</Label>
                    <Input
                      id="monthly_savings"
                      name="monthly_savings"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="200.00"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="months">Periodo (mesi)</Label>
                  <Input
                    id="months"
                    name="months"
                    type="number"
                    min="1"
                    max="600"
                    placeholder="12"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isCalculating}>
                  {isCalculating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Calcolo in corso...
                    </>
                  ) : (
                    <>
                      <Calculator className="w-4 h-4 mr-2" />
                      Calcola Proiezione
                    </>
                  )}
                </Button>

                {result && (
                  <div className="mt-6 space-y-4 p-4 border rounded-lg bg-muted/30">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Importo Finale</p>
                        <p className="text-2xl font-bold text-success">€{result.finalAmount}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Depositi Totali</p>
                        <p className="text-xl font-semibold">€{result.totalDeposits}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Rendimento</p>
                        <p className="text-xl font-semibold text-primary">€{result.totalReturn}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Analisi AI</Label>
                      <Textarea
                        value={result.analysis}
                        readOnly
                        className="min-h-[200px]"
                      />
                    </div>

                    <Button onClick={handleSaveProjection} className="w-full" variant="outline">
                      <Save className="w-4 h-4 mr-2" />
                      Salva Proiezione
                    </Button>
                  </div>
                )}
              </form>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        {/* Projections Grid */}
        {projections.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-6 bg-primary/10 rounded-full">
                <TrendingUp className="w-12 h-12 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Nessuna proiezione ancora</h3>
                <p className="text-muted-foreground mb-4">
                  Crea la tua prima proiezione finanziaria!
                </p>
                <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                  <Calculator className="w-4 h-4" />
                  Crea Proiezione
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {projections.map((projection) => (
              <Card key={projection.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{projection.name}</CardTitle>
                      <CardDescription>
                        {new Date(projection.created_at).toLocaleDateString("it-IT")}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteProjection(projection.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Importo Finale</p>
                      <p className="text-xl font-bold text-success">
                        €{Number(projection.final_amount).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Periodo</p>
                      <p className="text-lg font-medium">
                        {projection.months} mesi
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Analisi</p>
                    <p className="text-sm line-clamp-3">{projection.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Projections;
