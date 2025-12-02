import { useApp, type Task } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Plus,
  Pencil
} from 'lucide-react';
import { Link } from 'wouter';

function TaskItem({ task }: { task: Task }) {
  const { t, updateTask } = useApp();
  
  const statusColors = {
    OPEN: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400',
    IN_PROGRESS: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
    DONE: 'bg-green-500/20 text-green-600 dark:text-green-400',
  };

  const statusIcons = {
    OPEN: AlertCircle,
    IN_PROGRESS: Clock,
    DONE: CheckCircle2,
  };

  const StatusIcon = statusIcons[task.status];

  const cycleStatus = () => {
    const statuses: Task['status'][] = ['OPEN', 'IN_PROGRESS', 'DONE'];
    const currentIndex = statuses.indexOf(task.status);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    updateTask(task.id, { status: nextStatus });
  };

  return (
    <div 
      className="flex items-center gap-3 p-3 rounded-md bg-muted/50 hover-elevate cursor-pointer"
      onClick={cycleStatus}
      data-testid={`task-item-${task.id}`}
    >
      <StatusIcon className="h-5 w-5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{task.title}</p>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="secondary" className="text-xs">
            {t(`type.${task.type}`)}
          </Badge>
          {task.dueDate && (
            <span className="text-xs text-muted-foreground">
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
      <Badge className={statusColors[task.status]}>
        {t(`status.${task.status.toLowerCase()}`)}
      </Badge>
    </div>
  );
}

export default function Dashboard() {
  const { t, documents, courses, tasks, learningProgress } = useApp();

  const todayTasks = tasks.filter(task => {
    if (task.status === 'DONE') return false;
    if (!task.dueDate) return true;
    const today = new Date().toDateString();
    const taskDate = new Date(task.dueDate).toDateString();
    return taskDate === today || new Date(task.dueDate) < new Date();
  });

  const openTasks = tasks.filter(t => t.status !== 'DONE').length;
  const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const completedTasks = tasks.filter(t => t.status === 'DONE').length;

  const totalUnits = courses.reduce((acc, course) => acc + course.units.length, 0);
  const completedUnits = learningProgress.reduce((acc, lp) => acc + lp.completedUnits.length, 0);
  const learningProgressPercent = totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0;

  const recentDocuments = [...documents]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6" data-testid="page-dashboard">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold" data-testid="text-dashboard-title">
          {t('dashboard.title')}
        </h1>
        <div className="flex gap-2">
          <Link href="/writing">
            <Button data-testid="button-new-document">
              <Plus className="h-4 w-4 me-2" />
              {t('documents.new')}
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card data-testid="card-documents-count">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('dashboard.documentsCount')}
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-documents-count">
              {documents.length}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-courses-count">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('dashboard.coursesCount')}
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-courses-count">
              {courses.length}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-tasks-count">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('dashboard.tasksCount')}
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-tasks-count">
              {openTasks}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {inProgressTasks} {t('status.in_progress')}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-learning-progress">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('learning.progress')}
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-learning-progress">
              {learningProgressPercent}%
            </div>
            <Progress value={learningProgressPercent} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="lg:col-span-1" data-testid="card-today-tasks">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle>{t('dashboard.todayTasks')}</CardTitle>
            <Badge variant="secondary">{todayTasks.length}</Badge>
          </CardHeader>
          <CardContent>
            {todayTasks.length === 0 ? (
              <p className="text-muted-foreground text-center py-8" data-testid="text-no-tasks">
                {t('dashboard.noTasks')}
              </p>
            ) : (
              <div className="space-y-3">
                {todayTasks.slice(0, 5).map(task => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1" data-testid="card-writing-status">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle>{t('dashboard.writingStatus')}</CardTitle>
            <Link href="/documents">
              <Button variant="ghost" size="sm">
                <FileText className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentDocuments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">{t('documents.noDocuments')}</p>
                <Link href="/writing">
                  <Button>
                    <Plus className="h-4 w-4 me-2" />
                    {t('documents.new')}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentDocuments.map(doc => (
                  <Link key={doc.id} href={`/writing/${doc.id}`}>
                    <div 
                      className="flex items-center gap-3 p-3 rounded-md bg-muted/50 hover-elevate cursor-pointer"
                      data-testid={`recent-doc-${doc.id}`}
                    >
                      <Pencil className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{doc.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {t(`type.${doc.type}`)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(doc.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-work-journal">
        <CardHeader>
          <CardTitle>{t('dashboard.workJournal')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{completedTasks}</p>
                <p className="text-sm text-muted-foreground">{t('status.done')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-500/10">
              <Clock className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{inProgressTasks}</p>
                <p className="text-sm text-muted-foreground">{t('status.in_progress')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-yellow-500/10">
              <AlertCircle className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{openTasks}</p>
                <p className="text-sm text-muted-foreground">{t('status.open')}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
