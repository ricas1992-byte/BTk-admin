import { useState, useCallback, useMemo } from 'react';
import { Link, useLocation } from 'wouter';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  LayoutDashboard, 
  FileText, 
  Pencil, 
  BookOpen, 
  Globe, 
  Menu,
  X,
  Settings,
  Search,
  ChevronRight,
  CheckSquare
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface LayoutProps {
  children: React.ReactNode;
}

interface SearchResult {
  id: string;
  title: string;
  type: 'document' | 'course';
  path: string;
}

export function Layout({ children }: LayoutProps) {
  const { t, uiLanguage, setUiLanguage, documents, courses } = useApp();
  const [location, navigate] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navItems = [
    { path: '/', label: t('nav.dashboard'), icon: LayoutDashboard },
    { path: '/documents', label: t('nav.documents'), icon: FileText },
    { path: '/writing', label: t('nav.writing'), icon: Pencil },
    { path: '/learning', label: t('nav.learning'), icon: BookOpen },
    { path: '/tasks', label: t('tasks.title'), icon: CheckSquare },
    { path: '/settings', label: t('nav.settings'), icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location === '/';
    return location.startsWith(path);
  };

  const isRTL = uiLanguage === 'he' || uiLanguage === 'ar';

  const searchResults = useMemo((): SearchResult[] => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    
    const docResults: SearchResult[] = documents
      .filter(doc => doc.title.toLowerCase().includes(query))
      .slice(0, 5)
      .map(doc => ({
        id: doc.id,
        title: doc.title,
        type: 'document' as const,
        path: `/writing/${doc.id}`
      }));
    
    const courseResults: SearchResult[] = courses
      .filter(course => course.title.toLowerCase().includes(query))
      .slice(0, 3)
      .map(course => ({
        id: course.id,
        title: course.title,
        type: 'course' as const,
        path: '/learning'
      }));
    
    return [...docResults, ...courseResults];
  }, [searchQuery, documents, courses]);

  const handleSearchSelect = useCallback((result: SearchResult) => {
    navigate(result.path);
    setSearchOpen(false);
    setSearchQuery('');
  }, [navigate]);

  const getBreadcrumbs = useCallback(() => {
    const paths = location.split('/').filter(Boolean);
    if (paths.length === 0) return null;
    
    const breadcrumbs: { label: string; path: string }[] = [
      { label: t('nav.dashboard'), path: '/' }
    ];
    
    let currentPath = '';
    for (const segment of paths) {
      currentPath += `/${segment}`;
      const navItem = navItems.find(item => item.path === currentPath);
      if (navItem) {
        breadcrumbs.push({ label: navItem.label, path: currentPath });
      } else if (segment !== paths[paths.length - 1]) {
        breadcrumbs.push({ label: segment, path: currentPath });
      }
    }
    
    return breadcrumbs.length > 1 ? breadcrumbs : null;
  }, [location, t, navItems]);

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar */}
      <aside 
        className={`
          fixed inset-y-0 z-50 flex w-64 flex-col bg-sidebar text-sidebar-foreground
          transition-transform duration-300 ease-in-out
          ${isRTL ? 'right-0 border-l border-sidebar-border' : 'left-0 border-r border-sidebar-border'}
          ${sidebarOpen ? 'translate-x-0' : (isRTL ? 'translate-x-full' : '-translate-x-full')}
          lg:relative lg:translate-x-0
        `}
        data-testid="sidebar"
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 pb-6">
            <img 
              src="/logo.png" 
              alt="Beyond the Keys" 
              className="h-16 w-auto mx-auto transition-transform hover:scale-105"
              data-testid="img-logo-sidebar"
            />
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-sidebar-foreground absolute top-4 right-4"
              onClick={() => setSidebarOpen(false)}
              data-testid="button-close-sidebar"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setSidebarOpen(false)}
              >
                <div
                  className={`
                    flex items-center gap-3 px-4 py-3.5 mb-1 rounded-md  cursor-pointer
                    touch-target
                    ${isActive(item.path) 
                      ? `bg-sidebar-accent text-sidebar-accent-foreground ${isRTL ? 'border-l-4 border-l-primary' : 'border-r-4 border-r-primary'}`
                      : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                    }
                  `}
                  data-testid={`link-nav-${item.path.replace('/', '') || 'dashboard'}`}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" strokeWidth={1.75} />
                  <span className="font-medium text-[15px]">{item.label}</span>
                </div>
              </Link>
            ))}
          </nav>

          {/* Language Selector */}
          <div className="mt-auto p-4 border-t border-sidebar-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-3 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 touch-target"
                  data-testid="button-language-toggle"
                >
                  <Globe className="h-5 w-5" strokeWidth={1.75} />
                  <span className="text-[15px]">{t('nav.language')}: {t(`lang.${uiLanguage}`)}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isRTL ? 'end' : 'start'} className="w-48">
                <DropdownMenuItem onClick={() => setUiLanguage('he')} data-testid="button-lang-he">
                  עברית
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setUiLanguage('en')} data-testid="button-lang-en">
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setUiLanguage('ru')} data-testid="button-lang-ru">
                  Русский
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setUiLanguage('ar')} data-testid="button-lang-ar">
                  العربية
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setUiLanguage('es')} data-testid="button-lang-es">
                  Español
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setUiLanguage('fr')} data-testid="button-lang-fr">
                  Français
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden "
          onClick={() => setSidebarOpen(false)}
          data-testid="sidebar-overlay"
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header 
          className="flex items-center justify-between gap-4 px-4 py-3 bg-background border-b border-border lg:px-6"
          style={{ boxShadow: 'var(--shadow-header)' }}
        >
          {/* Left: Menu Button & Logo */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden touch-target"
              onClick={() => setSidebarOpen(true)}
              data-testid="button-open-sidebar"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <img 
              src="/logo.png" 
              alt="Beyond the Keys" 
              className="h-10 w-auto hidden md:block"
              data-testid="img-logo-header"
            />
            <h1 className="text-lg font-semibold truncate hidden sm:block" data-testid="text-app-title">
              {t('app.title')}
            </h1>
          </div>

          {/* Center: Global Search */}
          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <button
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center gap-2 px-4 py-2.5 rounded-full bg-muted/50 border border-border hover:border-primary/30 hover:bg-muted  text-muted-foreground text-sm"
              data-testid="button-global-search"
            >
              <Search className="h-4 w-4" />
              <span>{t('placeholder.search')}</span>
            </button>
          </div>

          {/* Right: Language & Search (mobile) */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden touch-target"
              onClick={() => setSearchOpen(true)}
              data-testid="button-search-mobile"
            >
              <Search className="h-5 w-5" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="gap-2 touch-target rounded-button"
                  data-testid="button-header-language"
                >
                  <Globe className="h-4 w-4" />
                  <span className="hidden sm:inline">{t(`lang.${uiLanguage}`)}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isRTL ? 'start' : 'end'} className="w-48">
                <DropdownMenuItem onClick={() => setUiLanguage('he')} data-testid="button-header-lang-he">
                  עברית
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setUiLanguage('en')} data-testid="button-header-lang-en">
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setUiLanguage('ru')} data-testid="button-header-lang-ru">
                  Русский
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setUiLanguage('ar')} data-testid="button-header-lang-ar">
                  العربية
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setUiLanguage('es')} data-testid="button-header-lang-es">
                  Español
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setUiLanguage('fr')} data-testid="button-header-lang-fr">
                  Français
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Breadcrumbs */}
        {breadcrumbs && location !== '/' && (
          <div className="px-4 lg:px-6 py-2 border-b border-border/50 bg-muted/30">
            <nav 
              className={`flex items-center gap-1.5 text-sm text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}
              dir={isRTL ? 'rtl' : 'ltr'}
              data-testid="nav-breadcrumb"
            >
              {breadcrumbs.map((crumb, index) => (
                <span key={crumb.path} className={`flex items-center gap-1.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  {index > 0 && (
                    <ChevronRight className={`h-3.5 w-3.5 ${isRTL ? 'rotate-180' : ''}`} />
                  )}
                  {index === breadcrumbs.length - 1 ? (
                    <span className="text-foreground font-medium">{crumb.label}</span>
                  ) : (
                    <Link href={crumb.path}>
                      <span className="hover:text-foreground  cursor-pointer">
                        {crumb.label}
                      </span>
                    </Link>
                  )}
                </span>
              ))}
            </nav>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <div className="">
            {children}
          </div>
        </main>
      </div>

      {/* Global Search Dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('placeholder.search')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('placeholder.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-full"
                autoFocus
                data-testid="input-global-search"
              />
            </div>
            
            {searchResults.length > 0 && (
              <div className="space-y-1 max-h-64 overflow-auto">
                {searchResults.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleSearchSelect(result)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted  text-left"
                    data-testid={`search-result-${result.id}`}
                  >
                    {result.type === 'document' ? (
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="flex-1 truncate">{result.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {result.type === 'document' ? t('nav.documents') : t('nav.learning')}
                    </span>
                  </button>
                ))}
              </div>
            )}
            
            {searchQuery && searchResults.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                {t('documents.noDocuments')}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
