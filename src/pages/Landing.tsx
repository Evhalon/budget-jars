import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
    ArrowRight,
    Check,
    Zap,
    Shield,
    LayoutDashboard,
    TrendingUp,
    PiggyBank,
    PieChart,
    Sparkles,
    Menu,
    X,
    Globe,
    ChevronDown
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

const Landing = () => {
    const { t, language, setLanguage } = useLanguage();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const toggleLanguage = () => {
        setLanguage(language === 'it' ? 'en' : 'it');
    };

    return (
        <div className="min-h-screen bg-background text-foreground overflow-x-hidden font-sans selection:bg-primary/20">

            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
                <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-xl">
                            B
                        </div>
                        <span className="text-xl font-bold tracking-tight">BrokeMe</span>
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-6">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="gap-2">
                                    <Globe className="w-4 h-4" />
                                    {language === 'it' ? 'IT' : 'EN'}
                                    <ChevronDown className="w-3 h-3 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setLanguage('it')} className="gap-2">
                                    <span className={language === 'it' ? 'font-bold' : ''}>🇮🇹 Italiano</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setLanguage('en')} className="gap-2">
                                    <span className={language === 'en' ? 'font-bold' : ''}>🇬🇧 English</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <ThemeToggle />
                        <Link to="/auth?mode=login">
                            <Button variant="ghost">{t('login')}</Button>
                        </Link>
                        <Link to="/auth?mode=register">
                            <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
                                {t('register')}
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="md:hidden flex items-center gap-4">
                        <ThemeToggle />
                        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                            {mobileMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>

                {/* Mobile Nav */}
                {mobileMenuOpen && (
                    <div className="md:hidden absolute top-16 left-0 w-full bg-background border-b border-border/50 p-4 flex flex-col gap-4 animate-in slide-in-from-top-5">
                        <div className="flex flex-col gap-2">
                            <Button variant={language === 'it' ? 'default' : 'ghost'} onClick={() => setLanguage('it')} className="justify-start gap-2">
                                🇮🇹 Italiano
                            </Button>
                            <Button variant={language === 'en' ? 'default' : 'ghost'} onClick={() => setLanguage('en')} className="justify-start gap-2">
                                🇬🇧 English
                            </Button>
                        </div>
                        <Link to="/auth?mode=login" onClick={() => setMobileMenuOpen(false)}>
                            <Button variant="ghost" className="w-full justify-start">{t('login')}</Button>
                        </Link>
                        <Link to="/auth?mode=register" onClick={() => setMobileMenuOpen(false)}>
                            <Button className="w-full">{t('register')}</Button>
                        </Link>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] animate-pulse-slow" />
                    <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-accent/20 rounded-full blur-[100px] animate-pulse-slow delay-1000" />
                </div>

                <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 border border-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Sparkles className="w-4 h-4" />
                        <span>v2.0 Now Available</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70 animate-in fade-in slide-in-from-bottom-6 duration-700">
                        {t('landingHeroTitle')}
                    </h1>

                    <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                        {t('landingHeroSubtitle')}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-200">
                        <Link to="/auth?mode=register">
                            <Button size="lg" className="h-12 px-8 text-lg rounded-full bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:scale-105">
                                {t('landingStartNow')} <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>
                        <Link to="/auth?mode=login">
                            <Button size="lg" variant="outline" className="h-12 px-8 text-lg rounded-full border-border/50 bg-background/50 backdrop-blur-sm hover:bg-accent/10 hover:border-accent/50 transition-all">
                                {t('landingViewDashboard')}
                            </Button>
                        </Link>
                    </div>

                    {/* Hero Image / Mockup */}
                    <div className="mt-20 relative max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 h-full w-full pointer-events-none" />
                        <div className="rounded-xl border border-border/50 shadow-2xl overflow-hidden bg-card/50 backdrop-blur-sm ring-1 ring-white/10 p-4">
                            <img
                                src="/hero-dashboard-real.png"
                                alt="BrokeMe Dashboard"
                                className="w-full h-auto object-cover rounded-lg"
                                onError={(e) => {
                                    // Fallback if image fails
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement!.classList.add('h-[500px]', 'flex', 'items-center', 'justify-center', 'bg-card');
                                    e.currentTarget.parentElement!.innerHTML = '<div class="text-center p-10"><h3 class="text-2xl font-bold text-muted-foreground">Dashboard Preview</h3><p class="text-muted-foreground">High-quality mockup would appear here.</p></div>';
                                }}
                            />
                        </div>
                        {/* Floating Elements */}
                        <div className="absolute -right-4 top-10 hidden md:block p-4 bg-card/80 backdrop-blur-md border border-border/50 rounded-2xl shadow-xl animate-float z-20">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-500/20 rounded-lg text-green-500">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Savings</p>
                                    <p className="text-lg font-bold">+€1,250.00</p>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -left-4 bottom-20 hidden md:block p-4 bg-card/80 backdrop-blur-md border border-border/50 rounded-2xl shadow-xl animate-float z-20" style={{ animationDelay: '2s' }}>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-500/20 rounded-lg text-purple-500">
                                    <PiggyBank className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">New Goal</p>
                                    <p className="text-lg font-bold">Vacation 🌴</p>
                                </div>
                            </div>
                        </div>                </div>
                </div>
            </section>

            {/* Value Proposition */}
            <section className="py-20 bg-secondary/30 border-y border-border/50">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-8 rounded-3xl bg-card/50 border border-border/50 hover:bg-card hover:border-primary/20 transition-all duration-300 group">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                                <LayoutDashboard className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">{t('landingFeatureSimpleTitle')}</h3>
                            <p className="text-muted-foreground">{t('landingFeatureSimpleDesc')}</p>
                        </div>
                        <div className="p-8 rounded-3xl bg-card/50 border border-border/50 hover:bg-card hover:border-accent/20 transition-all duration-300 group">
                            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mb-6 group-hover:scale-110 transition-transform">
                                <Zap className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">{t('landingFeatureSpeedTitle')}</h3>
                            <p className="text-muted-foreground">{t('landingFeatureSpeedDesc')}</p>
                        </div>
                        <div className="p-8 rounded-3xl bg-card/50 border border-border/50 hover:bg-card hover:border-purple-500/20 transition-all duration-300 group">
                            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 mb-6 group-hover:scale-110 transition-transform">
                                <Shield className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">{t('landingFeatureFrictionTitle')}</h3>
                            <p className="text-muted-foreground">{t('landingFeatureFrictionDesc')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Showcase */}
            <section className="py-32 relative overflow-hidden">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">Everything you need, nothing you don't</h2>
                        <p className="text-xl text-muted-foreground">Powerful features wrapped in a beautiful interface.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="group relative overflow-hidden rounded-3xl bg-card border border-border/50 p-8 hover:border-primary/50 transition-all duration-500">
                            <div className="absolute top-0 right-0 p-20 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
                            <div className="relative z-10">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white mb-6 shadow-lg shadow-primary/20">
                                    <LayoutDashboard className="w-7 h-7" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3">{t('landingFeatureExpensesTitle')}</h3>
                                <p className="text-muted-foreground mb-6">{t('landingFeatureExpensesDesc')}</p>
                                <div className="h-40 bg-background/50 rounded-xl border border-border/50 p-4 flex flex-col gap-3 overflow-hidden">
                                    <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-border/50 shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-500">🍔</div>
                                            <div className="text-sm font-medium">Lunch</div>
                                        </div>
                                        <span className="text-sm font-bold text-red-500">-€12.50</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-border/50 shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-500">🚌</div>
                                            <div className="text-sm font-medium">Transport</div>
                                        </div>
                                        <span className="text-sm font-bold text-red-500">-€2.00</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="group relative overflow-hidden rounded-3xl bg-card border border-border/50 p-8 hover:border-accent/50 transition-all duration-500">
                            <div className="absolute top-0 right-0 p-20 bg-accent/5 rounded-full blur-3xl group-hover:bg-accent/10 transition-colors" />
                            <div className="relative z-10">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-emerald-600 flex items-center justify-center text-white mb-6 shadow-lg shadow-accent/20">
                                    <TrendingUp className="w-7 h-7" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3">{t('landingFeatureTrendsTitle')}</h3>
                                <p className="text-muted-foreground mb-6">{t('landingFeatureTrendsDesc')}</p>
                                <div className="h-40 bg-background/50 rounded-xl border border-border/50 p-4 flex items-end justify-between gap-2">
                                    <div className="w-full bg-primary/20 rounded-t-lg h-[40%]" />
                                    <div className="w-full bg-primary/40 rounded-t-lg h-[70%]" />
                                    <div className="w-full bg-primary/60 rounded-t-lg h-[50%]" />
                                    <div className="w-full bg-primary rounded-t-lg h-[80%]" />
                                    <div className="w-full bg-accent rounded-t-lg h-[90%]" />
                                </div>
                            </div>
                        </div>

                        {/* Feature 3 */}
                        <div className="group relative overflow-hidden rounded-3xl bg-card border border-border/50 p-8 hover:border-purple-500/50 transition-all duration-500">
                            <div className="absolute top-0 right-0 p-20 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-colors" />
                            <div className="relative z-10">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white mb-6 shadow-lg shadow-purple-500/20">
                                    <PiggyBank className="w-7 h-7" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3">{t('landingFeatureGoalsTitle')}</h3>
                                <p className="text-muted-foreground mb-6">{t('landingFeatureGoalsDesc')}</p>
                                <div className="h-40 bg-background/50 rounded-xl border border-border/50 p-4 flex flex-col justify-center gap-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-medium">
                                            <span>New Car</span>
                                            <span>75%</span>
                                        </div>
                                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                            <div className="h-full bg-purple-500 w-[75%]" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-medium">
                                            <span>Holiday</span>
                                            <span>30%</span>
                                        </div>
                                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                            <div className="h-full bg-indigo-500 w-[30%]" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Feature 4 */}
                        <div className="group relative overflow-hidden rounded-3xl bg-card border border-border/50 p-8 hover:border-orange-500/50 transition-all duration-500">
                            <div className="absolute top-0 right-0 p-20 bg-orange-500/5 rounded-full blur-3xl group-hover:bg-orange-500/10 transition-colors" />
                            <div className="relative z-10">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white mb-6 shadow-lg shadow-orange-500/20">
                                    <PieChart className="w-7 h-7" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3">{t('landingFeatureBudgetTitle')}</h3>
                                <p className="text-muted-foreground mb-6">{t('landingFeatureBudgetDesc')}</p>
                                <div className="h-40 bg-background/50 rounded-xl border border-border/50 p-4 flex items-center justify-center">
                                    <div className="relative w-24 h-24 rounded-full border-8 border-secondary flex items-center justify-center">
                                        <div className="absolute inset-0 rounded-full border-8 border-orange-500 border-t-transparent rotate-45" />
                                        <span className="text-sm font-bold">€500</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Feature 5 */}
                        <div className="group relative overflow-hidden rounded-3xl bg-card border border-border/50 p-8 hover:border-cyan-500/50 transition-all duration-500 md:col-span-2 lg:col-span-2">
                            <div className="absolute top-0 right-0 p-20 bg-cyan-500/5 rounded-full blur-3xl group-hover:bg-cyan-500/10 transition-colors" />
                            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                                <div className="flex-1">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white mb-6 shadow-lg shadow-cyan-500/20">
                                        <Sparkles className="w-7 h-7" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-3">{t('landingFeatureInsightsTitle')}</h3>
                                    <p className="text-muted-foreground mb-6">{t('landingFeatureInsightsDesc')}</p>
                                    <Button variant="outline" className="rounded-full">Learn more</Button>
                                </div>
                                <div className="flex-1 w-full">
                                    <div className="bg-background/50 rounded-xl border border-border/50 p-6">
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-500 shrink-0">
                                                <Sparkles className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium mb-1">Smart Tip</p>
                                                <p className="text-xs text-muted-foreground">You spent 20% more on dining out this week. Try cooking at home to save ~€50.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Different */}
            <section className="py-24 bg-card border-y border-border/50">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="flex-1">
                            <h2 className="text-3xl md:text-5xl font-bold mb-6">{t('landingWhyDifferentTitle')}</h2>
                            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                                {t('landingWhyDifferentDesc')}
                            </p>
                            <ul className="space-y-4">
                                {[
                                    "No ads, no clutter",
                                    "Bank-level security",
                                    "Offline first",
                                    "Export data anytime"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                                            <Check className="w-4 h-4" />
                                        </div>
                                        <span className="font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="flex-1 relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-full blur-[100px]" />
                            <div className="grid grid-cols-3 gap-4 relative z-10 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                                <div className="rounded-[1.5rem] overflow-hidden shadow-xl border border-border/50 bg-card/50 backdrop-blur-sm mt-12">
                                    <img src="/mobile-expenses-real.png" alt="Expenses" className="w-full h-auto object-cover" />
                                </div>
                                <div className="rounded-[1.5rem] overflow-hidden shadow-2xl border border-border/50 bg-card/50 backdrop-blur-sm z-20 scale-110">
                                    <img src="/mobile-dashboard-real.png" alt="Dashboard" className="w-full h-auto object-cover" />
                                </div>
                                <div className="rounded-[1.5rem] overflow-hidden shadow-xl border border-border/50 bg-card/50 backdrop-blur-sm mt-12">
                                    <img src="/mobile-jars-real.png" alt="Jars" className="w-full h-auto object-cover" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-24 bg-secondary/30">
                <div className="container mx-auto px-4 md:px-6">
                    <h2 className="text-3xl md:text-5xl font-bold mb-16 text-center">Loved by thousands</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                text: t('landingTestimonial1'),
                                author: "Marco R.",
                                role: "Freelancer"
                            },
                            {
                                text: t('landingTestimonial2'),
                                author: "Giulia B.",
                                role: "Student"
                            },
                            {
                                text: t('landingTestimonial3'),
                                author: "Davide L.",
                                role: "Developer"
                            }
                        ].map((t, i) => (
                            <div key={i} className="p-8 rounded-3xl bg-card border border-border/50 shadow-sm">
                                <div className="flex gap-1 text-yellow-500 mb-4">
                                    {[1, 2, 3, 4, 5].map(s => <span key={s}>★</span>)}
                                </div>
                                <p className="text-lg mb-6">"{t.text}"</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-400" />
                                    <div>
                                        <p className="font-bold">{t.author}</p>
                                        <p className="text-xs text-muted-foreground">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-32 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/5" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px]" />

                <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
                    <h2 className="text-4xl md:text-6xl font-bold mb-8">{t('landingCtaTitle')}</h2>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/auth?mode=register">
                            <Button size="lg" className="h-14 px-10 text-lg rounded-full bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20">
                                {t('landingCtaFree')}
                            </Button>
                        </Link>
                        <Link to="/auth?mode=login">
                            <Button size="lg" variant="outline" className="h-14 px-10 text-lg rounded-full bg-background/50 backdrop-blur-sm">
                                {t('landingCtaLogin')}
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-border/50 bg-card/50">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                        <div className="col-span-2 md:col-span-1">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-6 h-6 rounded bg-primary flex items-center justify-center text-white font-bold text-xs">B</div>
                                <span className="font-bold">BrokeMe</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                The budget tracker for people who hate trackers.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Product</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><a href="#" className="hover:text-foreground">Features</a></li>
                                <li><a href="#" className="hover:text-foreground">Pricing</a></li>
                                <li><a href="#" className="hover:text-foreground">Download</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Company</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><a href="#" className="hover:text-foreground">About</a></li>
                                <li><a href="#" className="hover:text-foreground">Blog</a></li>
                                <li><a href="#" className="hover:text-foreground">Careers</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><a href="#" className="hover:text-foreground">{t('landingFooterPrivacy')}</a></li>
                                <li><a href="#" className="hover:text-foreground">{t('landingFooterTerms')}</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-border/50 text-sm text-muted-foreground">
                        <p>© 2024 BrokeMe. All rights reserved.</p>
                        <div className="flex gap-4 mt-4 md:mt-0">
                            {/* Social placeholders */}
                            <div className="w-5 h-5 bg-muted rounded-full" />
                            <div className="w-5 h-5 bg-muted rounded-full" />
                            <div className="w-5 h-5 bg-muted rounded-full" />
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
