import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, startingAmount, monthlySavings, months, saveName } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Calculate projection with compound interest (assuming 2% annual return)
    const annualRate = 0.02;
    const monthlyRate = annualRate / 12;
    
    // Future value of series formula: FV = P * ((1 + r)^n - 1) / r + PV * (1 + r)^n
    const futureValueOfDeposits = monthlySavings * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
    const futureValueOfPrincipal = startingAmount * Math.pow(1 + monthlyRate, months);
    const finalAmount = futureValueOfDeposits + futureValueOfPrincipal;

    // Get AI analysis
    const systemPrompt = `Sei un consulente finanziario esperto. Analizza questa proiezione di risparmio e fornisci un'analisi dettagliata:

Importo iniziale: €${startingAmount}
Risparmio mensile: €${monthlySavings}
Periodo: ${months} mesi (${(months/12).toFixed(1)} anni)
Importo finale stimato: €${finalAmount.toFixed(2)}
Rendimento totale: €${(finalAmount - startingAmount - (monthlySavings * months)).toFixed(2)}

Fornisci un'analisi che includa:
1. Valutazione della sostenibilità del piano
2. Suggerimenti per ottimizzare il risparmio
3. Rischi e considerazioni
4. Milestone intermedi consigliati`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Analizza questa proiezione finanziaria e fornisci consigli." }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    return new Response(JSON.stringify({ 
      finalAmount: finalAmount.toFixed(2),
      totalDeposits: (startingAmount + (monthlySavings * months)).toFixed(2),
      totalReturn: (finalAmount - startingAmount - (monthlySavings * months)).toFixed(2),
      analysis 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
