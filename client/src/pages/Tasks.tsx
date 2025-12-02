import { useState } from 'react';
import { useApp, type TaskType, type TaskStatus } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
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
} from '@/components/ui/alert-dialog';
import { 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Trash2,
  Calendar,
  Filter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const TASK_TYPES: TaskType[] = ['WRITING', 'TRANSLATION', 'LEARNING', 'TECH'];
const TASK_STATUSES: TaskStatus[] = ['OPEN', 'IN_PROGRESS', 'DONE'];

export default function Tasks() {
  const { t, uiLanguage, tasks, addTask, updateTask, deleteTask } = useApp();
  const { toast } = useToast();

  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskType, setNewTaskType] = useState<TaskType>('WRITING');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'ALL'>('ALL');
  const [filterType, setFilterType] = useState<TaskType | 'ALL'>('ALL');

  const statusColors: Record<TaskStatus, string> = {
    OPEN: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400',
    IN_PROGRESS: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
    DONE: 'bg-green-500/20 text-green-600 dark:text-green-400',
  };

  const statusIcons: Record<TaskStatus, typeof AlertCircle> = {
    OPEN: AlertCircle,
    IN_PROGRESS: Clock,
    DONE: CheckCircle2,
  };

  const typeColors: Record<TaskType, string> = {
    WRITING: 'bg-purple-500/20 text-purple-600 dark:text-purple-400',
    TRANSLATION: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
    LEARNING: 'bg-green-500/20 text-green-600 dark:text-green-400',
    TECH: 'bg-orange-500/20 text-orange-600 dark:text-orange-400',
  };

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = filterStatus === 'ALL' || task.status === filterStatus;
    const matchesType = filterType === 'ALL' || task.type === filterType;
    return matchesStatus && matchesType;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const statusOrder = { OPEN: 0, IN_PROGRESS: 1, DONE: 2 };
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return 0;
  });

  const handleCreateTask = () => {
    if (!newTaskTitle.trim()) return;
    
    addTask({
      title: newTaskTitle,
      type: newTaskType,
      status: 'OPEN',
      dueDate: newTaskDueDate || undefined,
    });
    
    setNewTaskTitle('');
    setNewTaskType('WRITING');
    setNewTaskDueDate('');
    setIsNewTaskDialogOpen(false);
    
    toast({
      title: uiLanguage === 'he' ? 'נוצר' : 'Created',
      description: uiLanguage === 'he' ? 'משימה חדשה נוצרה' : 'New task created',
    });
  };

  const cycleStatus = (taskId: string, currentStatus: TaskStatus) => {
    const statuses: TaskStatus[] = ['OPEN', 'IN_PROGRESS', 'DONE'];
    const currentIndex = statuses.indexOf(currentStatus);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    updateTask(taskId, { status: nextStatus });
  };

  return (
    <div className="space-y-6" data-testid="page-tasks">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold" data-testid="text-tasks-title">
          {uiLanguage === 'he' ? 'משימות' : 'Tasks'}
        </h1>
        
        <Dialog open={isNewTaskDialogOpen} onOpenChange={setIsNewTaskDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-task">
              <Plus className="h-4 w-4 me-2" />
              {t('task.new')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('task.new')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t('task.title')}</Label>
                <Input
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder={t('placeholder.title')}
                  data-testid="input-new-task-title"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('task.type')}</Label>
                <Select value={newTaskType} onValueChange={(v) => setNewTaskType(v as TaskType)}>
                  <SelectTrigger data-testid="select-new-task-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_TYPES.map(type => (
                      <SelectItem key={type} value={type}>
                        {t(`type.${type}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('task.dueDate')}</Label>
                <Input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  data-testid="input-new-task-date"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewTaskDialogOpen(false)}>
                {t('button.cancel')}
              </Button>
              <Button onClick={handleCreateTask} data-testid="button-create-task">
                {t('button.create')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card data-testid="card-filters">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as TaskStatus | 'ALL')}>
              <SelectTrigger className="w-[160px]" data-testid="select-filter-status">
                <Filter className="h-4 w-4 me-2" />
                <SelectValue placeholder={t('task.status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{uiLanguage === 'he' ? 'הכל' : 'All'}</SelectItem>
                {TASK_STATUSES.map(status => (
                  <SelectItem key={status} value={status}>
                    {t(`status.${status.toLowerCase()}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={(v) => setFilterType(v as TaskType | 'ALL')}>
              <SelectTrigger className="w-[160px]" data-testid="select-filter-type">
                <SelectValue placeholder={t('task.type')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{uiLanguage === 'he' ? 'הכל' : 'All'}</SelectItem>
                {TASK_TYPES.map(type => (
                  <SelectItem key={type} value={type}>
                    {t(`type.${type}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {sortedTasks.length === 0 ? (
        <Card data-testid="card-no-tasks">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground mb-4">
              {uiLanguage === 'he' ? 'אין משימות' : 'No tasks'}
            </p>
            <Button onClick={() => setIsNewTaskDialogOpen(true)}>
              <Plus className="h-4 w-4 me-2" />
              {t('task.new')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedTasks.map(task => {
            const StatusIcon = statusIcons[task.status];
            
            return (
              <Card 
                key={task.id} 
                className="hover-elevate"
                data-testid={`card-task-${task.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex-shrink-0"
                      onClick={() => cycleStatus(task.id, task.status)}
                      data-testid={`button-cycle-status-${task.id}`}
                    >
                      <StatusIcon className={`h-5 w-5 ${
                        task.status === 'DONE' ? 'text-green-500' :
                        task.status === 'IN_PROGRESS' ? 'text-blue-500' :
                        'text-yellow-500'
                      }`} />
                    </Button>

                    <div className="flex-1 min-w-0">
                      <p className={`font-medium ${
                        task.status === 'DONE' ? 'line-through text-muted-foreground' : ''
                      }`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge className={typeColors[task.type]}>
                          {t(`type.${task.type}`)}
                        </Badge>
                        {task.dueDate && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>

                    <Badge className={statusColors[task.status]}>
                      {t(`status.${task.status.toLowerCase()}`)}
                    </Badge>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-destructive hover:text-destructive flex-shrink-0"
                          data-testid={`button-delete-task-${task.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {uiLanguage === 'he' ? 'למחוק את המשימה?' : 'Delete task?'}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {uiLanguage === 'he' 
                              ? 'פעולה זו לא ניתנת לביטול.'
                              : 'This action cannot be undone.'}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('button.cancel')}</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deleteTask(task.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {t('button.delete')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
