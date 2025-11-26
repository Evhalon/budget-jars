import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={() => setLanguage(language === 'it' ? 'en' : 'it')}
            className="w-9 px-0 font-bold"
        >
            {language.toUpperCase()}
        </Button>
    );
}
