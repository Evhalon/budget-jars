import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Smartphone, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";

const Install = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-4"
        >
          ← Torna alla Home
        </Button>

        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-6 w-6" />
              Installa Budget Manager
            </CardTitle>
            <CardDescription>
              Installa l'app sul tuo dispositivo per un accesso rapido e un'esperienza migliore
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isInstalled ? (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 p-4 rounded-lg">
                <Check className="h-5 w-5" />
                <span className="font-medium">App già installata!</span>
              </div>
            ) : (
              <>
                {isInstallable ? (
                  <Button onClick={handleInstall} size="lg" className="w-full">
                    <Download className="mr-2 h-5 w-5" />
                    Installa Ora
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Per installare questa app:
                    </p>

                    <div className="space-y-3">
                      <div className="border rounded-lg p-4">
                        <h3 className="font-medium mb-2">Su iPhone/iPad:</h3>
                        <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                          <li>Apri Safari</li>
                          <li>Tocca il pulsante Condividi (quadrato con freccia verso l'alto)</li>
                          <li>Scorri e seleziona "Aggiungi a Home"</li>
                          <li>Tocca "Aggiungi"</li>
                        </ol>
                      </div>

                      <div className="border rounded-lg p-4">
                        <h3 className="font-medium mb-2">Su Android:</h3>
                        <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                          <li>Apri Chrome</li>
                          <li>Tocca il menu (tre puntini in alto a destra)</li>
                          <li>Seleziona "Aggiungi a schermata Home" o "Installa app"</li>
                          <li>Tocca "Aggiungi"</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                )}

                <div className="border-t pt-6">
                  <h3 className="font-medium mb-3">Vantaggi dell'installazione:</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                      <span>Accesso rapido dalla schermata home</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                      <span>Funziona offline</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                      <span>Caricamento più veloce</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                      <span>Esperienza simile a un'app nativa</span>
                    </li>
                  </ul>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Install;
