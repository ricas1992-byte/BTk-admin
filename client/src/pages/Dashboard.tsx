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
  Pencil,
  TrendingUp,
  Calendar,
  ArrowRight,
  Flag
} from 'lucide-react';
import { Link } from 'wouter';
import { useMemo } from 'react';

function TaskItem({ task }: { task: Task }) {
  const { t, updateTask } = useApp();
  
  const statusColors = {
    OPEN: 'bg-pastel-beige text-foreground',
    IN_PROGRESS: 'bg-pastel-blue text-foreground',
    DONE: 'bg-pastel-green text-foreground',
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
      className="flex items-center gap-3 p-3.5 rounded-card bg-muted/40 hover:bg-muted/70  cursor-pointer touch-target"
      onClick={cycleStatus}
      data-testid={`task-item-${task.id}`}
    >
      <StatusIcon className="h-5 w-5 flex-shrink-0 text-primary" strokeWidth={1.75} />
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate text-[15px]">{task.title}</p>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
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

  const todayTasks = useMemo(() => tasks.filter(task => {
    if (task.status === 'DONE') return false;
    if (!task.dueDate) return true;
    const today = new Date().toDateString();
    const taskDate = new Date(task.dueDate).toDateString();
    return taskDate === today || new Date(task.dueDate) < new Date();
  }), [tasks]);

  const upcomingTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);
    
    return tasks
      .filter(task => {
        if (task.status === 'DONE') return false;
        if (!task.dueDate) return false;
        const taskDate = new Date(task.dueDate);
        return taskDate > today && taskDate <= weekEnd;
      })
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 5);
  }, [tasks]);

  const overdueTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return tasks.filter(task => {
      if (task.status === 'DONE') return false;
      if (!task.dueDate) return false;
      return new Date(task.dueDate) < today;
    }).length;
  }, [tasks]);

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
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-semibold tracking-tight" data-testid="text-dashboard-title">
          {t('dashboard.title')}
        </h1>
        <div className="flex gap-2">
          <Link href="/writing">
            <Button className="rounded-button touch-target" data-testid="button-new-document">
              <Plus className="h-4 w-4 me-2" />
              {t('documents.new')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards - Pastel colored */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-pastel-teal border-pastel-teal shadow-card rounded-card" data-testid="card-documents-count">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium text-foreground/80">
              {t('dashboard.documentsCount')}
            </CardTitle>
            <div className="p-2 rounded-full bg-background/50">
              <FileText className="h-4 w-4 text-primary" strokeWidth={1.75} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-documents-count">
              {documents.length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-pastel-blue border-pastel-blue shadow-card rounded-card" data-testid="card-courses-count">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium text-foreground/80">
              {t('dashboard.coursesCount')}
            </CardTitle>
            <div className="p-2 rounded-full bg-background/50">
              <BookOpen className="h-4 w-4 text-primary" strokeWidth={1.75} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-courses-count">
              {courses.length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-pastel-rose border-pastel-rose shadow-card rounded-card" data-testid="card-tasks-count">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium text-foreground/80">
              {t('dashboard.tasksCount')}
            </CardTitle>
            <div className="p-2 rounded-full bg-background/50">
              <AlertCircle className="h-4 w-4 text-primary" strokeWidth={1.75} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-tasks-count">
              {openTasks}
            </div>
            <p className="text-xs text-foreground/60 mt-1">
              {inProgressTasks} {t('status.in_progress')}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-pastel-green border-pastel-green shadow-card rounded-card" data-testid="card-learning-progress">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium text-foreground/80">
              {t('learning.progress')}
            </CardTitle>
            <div className="p-2 rounded-full bg-background/50">
              <TrendingUp className="h-4 w-4 text-primary" strokeWidth={1.75} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-learning-progress">
              {learningProgressPercent}%
            </div>
            <Progress value={learningProgressPercent} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Tasks */}
        <Card className="shadow-card rounded-card" data-testid="card-today-tasks">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{t('dashboard.todayTasks')}</CardTitle>
              <Badge variant="secondary" className="rounded-full px-3">
                {todayTasks.length}
              </Badge>
              {overdueTasks > 0 && (
                <Badge variant="destructive" className="rounded-full px-2">
                  <Flag className="h-3 w-3 me-1" />
                  {overdueTasks} {t('tasks.overdue')}
                </Badge>
              )}
            </div>
            <Link href="/tasks">
              <Button variant="ghost" size="sm" className="touch-target" data-testid="button-view-all-tasks">
                {t('dashboard.viewAllTasks')}
                <ArrowRight className="h-4 w-4 ms-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {todayTasks.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground" data-testid="text-no-tasks">
                <Clock className="h-10 w-10 mx-auto mb-3 opacity-40" strokeWidth={1.5} />
                <p>{t('dashboard.noTasks')}</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {todayTasks.slice(0, 5).map(task => (
                  <TaskItem key={task.id} task={task} />
                ))}
                {todayTasks.length > 5 && (
                  <Link href="/tasks?tab=today">
                    <Button variant="outline" size="sm" className="w-full">
                      {t('dashboard.viewAllTasks')} ({todayTasks.length})
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Documents */}
        <Card className="shadow-card rounded-card" data-testid="card-writing-status">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-lg">{t('dashboard.writingStatus')}</CardTitle>
            <Link href="/documents">
              <Button variant="ghost" size="icon" className="touch-target">
                <FileText className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentDocuments.length === 0 ? (
              <div className="text-center py-10">
                <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-40" strokeWidth={1.5} />
                <p className="text-muted-foreground mb-4">{t('documents.noDocuments')}</p>
                <Link href="/writing">
                  <Button className="rounded-button">
                    <Plus className="h-4 w-4 me-2" />
                    {t('documents.new')}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentDocuments.map(doc => (
                  <Link key={doc.id} href={`/writing/${doc.id}`}>
                    <div 
                      className="flex items-center gap-3 p-3.5 rounded-card bg-muted/40 hover:bg-muted/70  cursor-pointer touch-target"
                      data-testid={`recent-doc-${doc.id}`}
                    >
                      <div className="p-2 rounded-full bg-pastel-teal">
                        <Pencil className="h-3.5 w-3.5 text-primary" strokeWidth={1.75} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-[15px]">{doc.title}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
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

      {/* Upcoming Tasks This Week */}
      {upcomingTasks.length > 0 && (
        <Card className="shadow-card rounded-card" data-testid="card-upcoming-tasks">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{t('dashboard.upcomingTasks')}</CardTitle>
              <Badge variant="outline" className="rounded-full px-3">
                <Calendar className="h-3 w-3 me-1" />
                {t('tasks.week')}
              </Badge>
            </div>
            <Link href="/tasks?tab=week">
              <Button variant="ghost" size="sm" className="touch-target">
                {t('dashboard.viewAllTasks')}
                <ArrowRight className="h-4 w-4 ms-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingTasks.map(task => (
                <div 
                  key={task.id}
                  className="flex items-center gap-3 p-3 rounded-card bg-muted/40 hover:bg-muted/70  cursor-pointer touch-target"
                  data-testid={`upcoming-task-${task.id}`}
                >
                  <div className={`p-2 rounded-full ${
                    task.priority === 'HIGH' ? 'bg-pastel-rose' : 'bg-pastel-beige'
                  }`}>
                    {task.priority === 'HIGH' ? (
                      <Flag className="h-3.5 w-3.5 text-primary" strokeWidth={1.75} />
                    ) : (
                      <Calendar className="h-3.5 w-3.5 text-primary" strokeWidth={1.75} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-sm">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {new Date(task.dueDate!).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Work Journal Summary */}
      <Card className="shadow-card rounded-card" data-testid="card-work-journal">
        <CardHeader>
          <CardTitle className="text-lg">{t('dashboard.workJournal')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-4 p-4 rounded-card bg-pastel-green touch-target">
              <div className="p-3 rounded-full bg-background/60">
                <CheckCircle2 className="h-6 w-6 text-primary" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedTasks}</p>
                <p className="text-sm text-foreground/70">{t('status.done')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-card bg-pastel-blue touch-target">
              <div className="p-3 rounded-full bg-background/60">
                <Clock className="h-6 w-6 text-primary" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-2xl font-bold">{inProgressTasks}</p>
                <p className="text-sm text-foreground/70">{t('status.in_progress')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-card bg-pastel-beige touch-target">
              <div className="p-3 rounded-full bg-background/60">
                <AlertCircle className="h-6 w-6 text-primary" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-2xl font-bold">{openTasks}</p>
                <p className="text-sm text-foreground/70">{t('status.open')}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
