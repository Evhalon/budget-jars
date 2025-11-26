import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Smartphone, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useLanguage } from "@/contexts/LanguageContext";

const Install = () => {
  const { t } = useLanguage();
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
          ← {t('backToHome')}
        </Button>

        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-6 w-6" />
              {t('installBudgetManager')}
            </CardTitle>
            <CardDescription>
              {t('installAppOnDevice')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isInstalled ? (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 p-4 rounded-lg">
                <Check className="h-5 w-5" />
                <span className="font-medium">{t('alreadyInstalled')}</span>
              </div>
            ) : (
              <>
                {isInstallable ? (
                  <Button onClick={handleInstall} size="lg" className="w-full">
                    <Download className="mr-2 h-5 w-5" />
                    {t('installNow')}
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {t('toInstallThisApp')}
                    </p>

                    <div className="space-y-3">
                      <div className="border rounded-lg p-4">
                        <h3 className="font-medium mb-2">{t('onIPhoneIPad')}</h3>
                        <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                          <li>{t('openSafari')}</li>
                          <li>{t('tapShareButton')}</li>
                          <li>{t('scrollAndSelect')}</li>
                          <li>{t('tapAdd')}</li>
                        </ol>
                      </div>

                      <div className="border rounded-lg p-4">
                        <h3 className="font-medium mb-2">{t('onAndroid')}</h3>
                        <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                          <li>{t('openChrome')}</li>
                          <li>{t('tapMenu')}</li>
                          <li>{t('selectAddToHome')}</li>
                          <li>{t('tapAdd')}</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                )}

                <div className="border-t pt-6">
                  <h3 className="font-medium mb-3">{t('installationBenefits')}</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                      <span>{t('quickAccess')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                      <span>{t('worksOffline')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                      <span>{t('fasterLoading')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                      <span>{t('nativeAppExperience')}</span>
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
