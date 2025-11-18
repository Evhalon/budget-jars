import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, X, Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Suggestion {
  id: string;
  suggestion_text: string;
  category: string;
  priority: string;
  is_read: boolean;
  created_at: string;
}

export const AISuggestions = ({ userId }: { userId: string }) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSuggestions();
  }, [userId]);

  const fetchSuggestions = async () => {
    const { data, error } = await supabase
      .from("ai_suggestions")
      .select("*")
      .eq("user_id", userId)
      .eq("is_read", false)
      .order("created_at", { ascending: false })
      .limit(5);

    if (!error && data) setSuggestions(data);
  };

  const generateSuggestions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-suggestions", {
        body: { userId }
      });

      if (error) throw error;

      toast({
        title: "Suggerimenti generati!",
        description: "Nuovi consigli AI disponibili.",
      });
      fetchSuggestions();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    await supabase
      .from("ai_suggestions")
      .update({ is_read: true })
      .eq("id", id);
    fetchSuggestions();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "default";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "risparmio": return "💰";
      case "investimento": return "📈";
      case "ottimizzazione": return "⚡";
      default: return "💡";
    }
  };

  if (suggestions.length === 0) {
    return (
      <Card className="glass-card animate-float">
        <CardContent className="p-6 text-center space-y-4">
          <div className="p-4 bg-primary/10 rounded-full inline-block">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold mb-2">Suggerimenti AI</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Ottieni consigli personalizzati per risparmiare
            </p>
            <Button 
              onClick={generateSuggestions} 
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generazione...
                </>
              ) : (
                <>
                  <Lightbulb className="w-4 h-4" />
                  Genera Suggerimenti
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary animate-pulse-slow" />
            Suggerimenti AI
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={generateSuggestions}
            disabled={isLoading}
            className="glass"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Aggiorna"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.map((suggestion) => (
          <div 
            key={suggestion.id}
            className="p-4 glass rounded-lg space-y-2 transition-all hover:scale-[1.02]"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3 flex-1">
                <span className="text-2xl">{getCategoryIcon(suggestion.category)}</span>
                <div className="flex-1">
                  <p className="text-sm">{suggestion.suggestion_text}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant={getPriorityColor(suggestion.priority)} className="text-xs">
                      {suggestion.priority}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {suggestion.category}
                    </Badge>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => markAsRead(suggestion.id)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
