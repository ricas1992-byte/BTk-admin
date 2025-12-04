import { useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Download,
  Upload,
  Trash2,
  FileText,
  BookOpen,
  CheckSquare,
  Database,
  AlertTriangle,
  HardDrive,
  Cloud,
  Moon,
  Sun,
  Palette
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Settings() {
  const {
    t,
    documents,
    courses,
    tasks,
    exportAllData,
    importAllData,
    clearAllData
  } = useApp();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `btk-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: t('toast.success'),
      description: t('settings.exportSuccess'),
    });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importAllData(content);

      if (success) {
        toast({
          title: t('toast.success'),
          description: t('settings.importSuccess'),
        });
      } else {
        toast({
          title: t('toast.error'),
          description: t('settings.importError'),
          variant: 'destructive',
        });
      }
    };
    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClear = () => {
    clearAllData();
    toast({
      title: t('toast.success'),
      description: t('settings.clearSuccess'),
    });
  };

  return (
    <div className="space-y-6" data-testid="page-settings">
      <h1 className="text-2xl font-semibold tracking-tight" data-testid="text-settings-title">
        {t('settings.title')}
      </h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Appearance Card */}
        <Card className="shadow-card rounded-card" data-testid="card-appearance">
          <CardHeader>
            <CardTitle className="flex items-center gap-2.5 text-lg">
              <div className="p-2 rounded-full bg-pastel-rose">
                <Palette className="h-4 w-4 text-primary" strokeWidth={1.75} />
              </div>
              {t('settings.appearance')}
            </CardTitle>
            <CardDescription>
              {t('settings.appearanceDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-card bg-muted/50">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? (
                  <Moon className="h-5 w-5 text-primary" strokeWidth={1.75} />
                ) : (
                  <Sun className="h-5 w-5 text-primary" strokeWidth={1.75} />
                )}
                <div>
                  <Label className="font-medium text-base">
                    {t('settings.darkMode')}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.darkModeDescription')}
                  </p>
                </div>
              </div>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                data-testid="switch-dark-mode"
              />
            </div>
          </CardContent>
        </Card>

        {/* Statistics Card */}
        <Card className="shadow-card rounded-card" data-testid="card-statistics">
          <CardHeader>
            <CardTitle className="flex items-center gap-2.5 text-lg">
              <div className="p-2 rounded-full bg-pastel-teal">
                <Database className="h-4 w-4 text-primary" strokeWidth={1.75} />
              </div>
              {t('settings.statistics')}
            </CardTitle>
            <CardDescription>
              {t('settings.dataOverview')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-card bg-pastel-blue">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" strokeWidth={1.75} />
                  <span className="font-medium">{t('settings.totalDocuments')}</span>
                </div>
                <span className="text-xl font-bold text-primary" data-testid="text-doc-count">
                  {documents.length}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-card bg-pastel-green">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-primary" strokeWidth={1.75} />
                  <span className="font-medium">{t('settings.totalCourses')}</span>
                </div>
                <span className="text-xl font-bold text-primary" data-testid="text-course-count">
                  {courses.length}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-card bg-pastel-beige">
                <div className="flex items-center gap-3">
                  <CheckSquare className="h-5 w-5 text-primary" strokeWidth={1.75} />
                  <span className="font-medium">{t('settings.totalTasks')}</span>
                </div>
                <span className="text-xl font-bold text-primary" data-testid="text-task-count">
                  {tasks.length}
                </span>
              </div>
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4" />
                    <span>{t('settings.version')}</span>
                  </div>
                  <span className="font-medium">1.0.0</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Backup Card */}
        <Card className="shadow-card rounded-card" data-testid="card-backup">
          <CardHeader>
            <CardTitle className="flex items-center gap-2.5 text-lg">
              <div className="p-2 rounded-full bg-pastel-rose">
                <Cloud className="h-4 w-4 text-primary" strokeWidth={1.75} />
              </div>
              {t('settings.backup')}
            </CardTitle>
            <CardDescription>
              {t('settings.backupDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={handleExport} 
              className="w-full touch-target rounded-button"
              data-testid="button-export"
            >
              <Download className="h-4 w-4 me-2" />
              {t('settings.export')}
            </Button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
              data-testid="input-file-import"
            />
            <Button 
              variant="outline" 
              onClick={handleImportClick}
              className="w-full touch-target rounded-button"
              data-testid="button-import"
            >
              <Upload className="h-4 w-4 me-2" />
              {t('settings.import')}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  className="w-full touch-target rounded-button"
                  data-testid="button-clear"
                >
                  <Trash2 className="h-4 w-4 me-2" />
                  {t('settings.clear')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-card">
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    {t('toast.warning')}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('settings.clearConfirm')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="touch-target rounded-button" data-testid="button-cancel-clear">
                    {t('button.cancel')}
                  </AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleClear}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 touch-target rounded-button"
                    data-testid="button-confirm-clear"
                  >
                    {t('settings.clear')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
