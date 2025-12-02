import { useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  Upload, 
  Trash2, 
  FileText, 
  BookOpen, 
  CheckSquare,
  Database,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
      <h1 className="text-2xl font-bold" data-testid="text-settings-title">
        {t('settings.title')}
      </h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card data-testid="card-statistics">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              {t('settings.statistics')}
            </CardTitle>
            <CardDescription>
              {t('settings.dataOverview')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>{t('settings.totalDocuments')}</span>
                </div>
                <span className="font-semibold text-primary" data-testid="text-doc-count">
                  {documents.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span>{t('settings.totalCourses')}</span>
                </div>
                <span className="font-semibold text-primary" data-testid="text-course-count">
                  {courses.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-muted-foreground" />
                  <span>{t('settings.totalTasks')}</span>
                </div>
                <span className="font-semibold text-primary" data-testid="text-task-count">
                  {tasks.length}
                </span>
              </div>
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{t('settings.version')}</span>
                  <span>1.0.0</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-backup">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              {t('settings.backup')}
            </CardTitle>
            <CardDescription>
              {t('settings.backupDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleExport} 
              className="w-full"
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
              className="w-full"
              data-testid="button-import"
            >
              <Upload className="h-4 w-4 me-2" />
              {t('settings.import')}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  className="w-full"
                  data-testid="button-clear"
                >
                  <Trash2 className="h-4 w-4 me-2" />
                  {t('settings.clear')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
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
                  <AlertDialogCancel data-testid="button-cancel-clear">
                    {t('button.cancel')}
                  </AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleClear}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
