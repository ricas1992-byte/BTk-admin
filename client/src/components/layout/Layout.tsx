import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  FileText, 
  Pencil, 
  BookOpen, 
  Globe, 
  Menu,
  X
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { t, uiLanguage, setUiLanguage } = useApp();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { path: '/', label: t('nav.dashboard'), icon: LayoutDashboard },
    { path: '/documents', label: t('nav.documents'), icon: FileText },
    { path: '/writing', label: t('nav.writing'), icon: Pencil },
    { path: '/learning', label: t('nav.learning'), icon: BookOpen },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location === '/';
    return location.startsWith(path);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <aside 
        className={`
          fixed inset-y-0 z-50 flex w-64 flex-col bg-sidebar text-sidebar-foreground
          transition-transform duration-300 ease-in-out
          ${uiLanguage === 'he' ? 'right-0' : 'left-0'}
          ${sidebarOpen ? 'translate-x-0' : (uiLanguage === 'he' ? 'translate-x-full' : '-translate-x-full')}
          lg:relative lg:translate-x-0
        `}
        data-testid="sidebar"
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center justify-between mb-8">
            <img 
              src="/logo.png" 
              alt="Beyond the Keys" 
              className="h-20 w-auto mx-auto"
              data-testid="img-logo-sidebar"
            />
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-sidebar-foreground"
              onClick={() => setSidebarOpen(false)}
              data-testid="button-close-sidebar"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setSidebarOpen(false)}
              >
                <div
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-md transition-colors cursor-pointer
                    touch-target
                    ${isActive(item.path) 
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                      : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                    }
                  `}
                  data-testid={`link-nav-${item.path.replace('/', '') || 'dashboard'}`}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium">{item.label}</span>
                </div>
              </Link>
            ))}
          </nav>

          <div className="mt-auto pt-4 border-t border-sidebar-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-3 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                  data-testid="button-language-toggle"
                >
                  <Globe className="h-5 w-5" />
                  <span>{t('nav.language')}: {uiLanguage === 'he' ? 'עברית' : 'English'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={uiLanguage === 'he' ? 'end' : 'start'}>
                <DropdownMenuItem 
                  onClick={() => setUiLanguage('he')}
                  data-testid="button-lang-he"
                >
                  עברית
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setUiLanguage('en')}
                  data-testid="button-lang-en"
                >
                  English
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          data-testid="sidebar-overlay"
        />
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center justify-between gap-4 px-4 py-3 bg-accent border-b border-border lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
            data-testid="button-open-sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="Beyond the Keys" 
              className="h-10 w-auto hidden md:block"
              data-testid="img-logo-header"
            />
            <h1 className="text-lg font-semibold truncate" data-testid="text-app-title">
              {t('app.title')}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="gap-2"
                  data-testid="button-header-language"
                >
                  <Globe className="h-4 w-4" />
                  <span className="hidden sm:inline">{uiLanguage === 'he' ? 'עברית' : 'EN'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={uiLanguage === 'he' ? 'start' : 'end'}>
                <DropdownMenuItem 
                  onClick={() => setUiLanguage('he')}
                  data-testid="button-header-lang-he"
                >
                  עברית
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setUiLanguage('en')}
                  data-testid="button-header-lang-en"
                >
                  English
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
