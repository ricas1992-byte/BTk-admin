import { useState, useMemo } from 'react';
import { useApp, type Task, type TaskType, type TaskStatus, type TaskPriority, type TaskCategory } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Trash2,
  Calendar,
  Search,
  List,
  LayoutGrid,
  Edit2,
  Tag,
  Flag,
  Folder,
  GripVertical,
  ChevronDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const TASK_TYPES: TaskType[] = ['WRITING', 'TRANSLATION', 'LEARNING', 'TECH'];
const TASK_STATUSES: TaskStatus[] = ['OPEN', 'IN_PROGRESS', 'DONE'];
const TASK_PRIORITIES: TaskPriority[] = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];
const TASK_CATEGORIES: TaskCategory[] = ['WORK', 'PERSONAL', 'STUDY', 'PROJECT', 'MEETING', 'OTHER'];

function SortableTaskCard({ task, onEdit, onDelete }: { task: Task; onEdit: (task: Task) => void; onDelete: (id: string) => void }) {
  const { t, updateTask } = useApp();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const priorityColors: Record<TaskPriority, string> = {
    LOW: 'bg-pastel-green text-foreground',
    NORMAL: 'bg-pastel-blue text-foreground',
    HIGH: 'bg-pastel-rose text-foreground',
    URGENT: 'bg-red-500/80 text-white',
  };

  const typeColors: Record<TaskType, string> = {
    WRITING: 'bg-purple-500/20 text-purple-600 dark:text-purple-400',
    TRANSLATION: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
    LEARNING: 'bg-green-500/20 text-green-600 dark:text-green-400',
    TECH: 'bg-orange-500/20 text-orange-600 dark:text-orange-400',
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-card border rounded-card p-3 shadow-sm hover-elevate cursor-grab active:cursor-grabbing"
      data-testid={`kanban-task-${task.id}`}
    >
      <div className="flex items-start gap-2">
        <div {...attributes} {...listeners} className="mt-1 cursor-grab">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-medium text-sm truncate ${task.status === 'DONE' ? 'line-through text-muted-foreground' : ''}`}>
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {task.description}
            </p>
          )}
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <Badge className={`text-xs ${typeColors[task.type]}`}>
              {t(`type.${task.type}`)}
            </Badge>
            {task.priority && task.priority !== 'NORMAL' && (
              <Badge className={`text-xs ${priorityColors[task.priority]}`}>
                {t(`priority.${task.priority.toLowerCase()}`)}
              </Badge>
            )}
            {task.dueDate && (
              <span className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                <Calendar className="h-3 w-3" />
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
          {task.tags && task.tags.length > 0 && (
            <div className="flex items-center gap-1 mt-2 flex-wrap">
              {task.tags.slice(0, 3).map((tag, i) => (
                <Badge key={i} variant="outline" className="text-xs px-1.5 py-0">
                  {tag}
                </Badge>
              ))}
              {task.tags.length > 3 && (
                <span className="text-xs text-muted-foreground">+{task.tags.length - 3}</span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onEdit(task)}
            data-testid={`button-edit-task-${task.id}`}
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function KanbanColumn({ 
  status, 
  tasks, 
  onEdit, 
  onDelete 
}: { 
  status: TaskStatus; 
  tasks: Task[]; 
  onEdit: (task: Task) => void; 
  onDelete: (id: string) => void;
}) {
  const { t } = useApp();
  
  const statusLabels: Record<TaskStatus, string> = {
    OPEN: t('kanban.open'),
    IN_PROGRESS: t('kanban.inProgress'),
    DONE: t('kanban.done'),
  };

  const statusColors: Record<TaskStatus, string> = {
    OPEN: 'bg-yellow-500',
    IN_PROGRESS: 'bg-blue-500',
    DONE: 'bg-green-500',
  };

  return (
    <div className="flex-1 min-w-[280px] max-w-[350px]">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-3 h-3 rounded-full ${statusColors[status]}`} />
        <h3 className="font-medium text-sm">{statusLabels[status]}</h3>
        <Badge variant="secondary" className="text-xs px-2">{tasks.length}</Badge>
      </div>
      <div className="bg-muted/30 rounded-card p-2 min-h-[400px]">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {tasks.map(task => (
              <SortableTaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </div>
        </SortableContext>
        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">
            {t('tasks.noTasks')}
          </div>
        )}
      </div>
    </div>
  );
}

function TaskListItem({ task, onEdit, onDelete }: { task: Task; onEdit: (task: Task) => void; onDelete: (id: string) => void }) {
  const { t, updateTask } = useApp();

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

  const priorityColors: Record<TaskPriority, string> = {
    LOW: 'text-green-500',
    NORMAL: 'text-blue-500',
    HIGH: 'text-orange-500',
    URGENT: 'text-red-500',
  };

  const typeColors: Record<TaskType, string> = {
    WRITING: 'bg-purple-500/20 text-purple-600 dark:text-purple-400',
    TRANSLATION: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
    LEARNING: 'bg-green-500/20 text-green-600 dark:text-green-400',
    TECH: 'bg-orange-500/20 text-orange-600 dark:text-orange-400',
  };

  const StatusIcon = statusIcons[task.status];
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';

  const cycleStatus = () => {
    const statuses: TaskStatus[] = ['OPEN', 'IN_PROGRESS', 'DONE'];
    const currentIndex = statuses.indexOf(task.status);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    updateTask(task.id, { status: nextStatus });
  };

  return (
    <Card className="hover-elevate" data-testid={`card-task-${task.id}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0"
            onClick={cycleStatus}
            data-testid={`button-cycle-status-${task.id}`}
          >
            <StatusIcon className={`h-5 w-5 ${
              task.status === 'DONE' ? 'text-green-500' :
              task.status === 'IN_PROGRESS' ? 'text-blue-500' :
              'text-yellow-500'
            }`} />
          </Button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className={`font-medium ${
                task.status === 'DONE' ? 'line-through text-muted-foreground' : ''
              }`}>
                {task.title}
              </p>
              {task.priority === 'HIGH' && (
                <Flag className={`h-4 w-4 ${priorityColors[task.priority]}`} />
              )}
            </div>
            {task.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                {task.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge className={typeColors[task.type]}>
                {t(`type.${task.type}`)}
              </Badge>
              {task.category && (
                <Badge variant="outline" className="text-xs">
                  <Folder className="h-3 w-3 me-1" />
                  {t(`category.${task.category.toLowerCase()}`)}
                </Badge>
              )}
              {task.dueDate && (
                <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                  <Calendar className="h-3 w-3" />
                  {new Date(task.dueDate).toLocaleDateString()}
                  {isOverdue && <span className="ms-1">({t('tasks.overdue')})</span>}
                </div>
              )}
            </div>
            {task.tags && task.tags.length > 0 && (
              <div className="flex items-center gap-1 mt-2">
                <Tag className="h-3 w-3 text-muted-foreground" />
                {task.tags.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="text-xs px-1.5 py-0">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Badge className={statusColors[task.status]}>
            {t(`status.${task.status.toLowerCase()}`)}
          </Badge>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(task)}
              data-testid={`button-edit-task-${task.id}`}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  data-testid={`button-delete-task-${task.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('task.deleteConfirm')}</AlertDialogTitle>
                  <AlertDialogDescription>{t('task.deleteWarning')}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('button.cancel')}</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => onDelete(task.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {t('button.delete')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Tasks() {
  const { t, uiLanguage, tasks, addTask, updateTask, deleteTask } = useApp();
  const { toast } = useToast();

  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [activeTab, setActiveTab] = useState<'all' | 'today' | 'week'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'ALL'>('ALL');
  const [filterType, setFilterType] = useState<TaskType | 'ALL'>('ALL');
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'ALL'>('ALL');
  const [filterCategory, setFilterCategory] = useState<TaskCategory | 'ALL'>('ALL');
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskType, setNewTaskType] = useState<TaskType>('WRITING');
  const [newTaskCategory, setNewTaskCategory] = useState<TaskCategory | ''>('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('NORMAL');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskTags, setNewTaskTags] = useState('');
  
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          task.title.toLowerCase().includes(query) ||
          (task.description?.toLowerCase().includes(query)) ||
          (task.tags?.some(tag => tag.toLowerCase().includes(query)));
        if (!matchesSearch) return false;
      }
      
      if (filterStatus !== 'ALL' && task.status !== filterStatus) return false;
      if (filterType !== 'ALL' && task.type !== filterType) return false;
      if (filterPriority !== 'ALL' && task.priority !== filterPriority) return false;
      if (filterCategory !== 'ALL' && task.category !== filterCategory) return false;
      
      if (activeTab === 'today') {
        if (!task.dueDate) return false;
        const taskDate = new Date(task.dueDate);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() === today.getTime() || (taskDate < today && task.status !== 'DONE');
      }
      
      if (activeTab === 'week') {
        if (!task.dueDate) return false;
        const taskDate = new Date(task.dueDate);
        return taskDate >= today && taskDate <= weekEnd;
      }
      
      return true;
    });
  }, [tasks, searchQuery, filterStatus, filterType, filterPriority, filterCategory, activeTab, today, weekEnd]);

  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      const statusOrder = { OPEN: 0, IN_PROGRESS: 1, DONE: 2 };
      const priorityOrder = { URGENT: 0, HIGH: 1, NORMAL: 2, LOW: 3 };
      
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      if ((a.priority || 'NORMAL') !== (b.priority || 'NORMAL')) {
        return priorityOrder[a.priority || 'NORMAL'] - priorityOrder[b.priority || 'NORMAL'];
      }
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return 0;
    });
  }, [filteredTasks]);

  const tasksByStatus = useMemo(() => ({
    OPEN: sortedTasks.filter(t => t.status === 'OPEN'),
    IN_PROGRESS: sortedTasks.filter(t => t.status === 'IN_PROGRESS'),
    DONE: sortedTasks.filter(t => t.status === 'DONE'),
  }), [sortedTasks]);

  const openDialog = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setNewTaskTitle(task.title);
      setNewTaskDescription(task.description || '');
      setNewTaskType(task.type);
      setNewTaskCategory(task.category || '');
      setNewTaskPriority(task.priority || 'NORMAL');
      setNewTaskDueDate(task.dueDate || '');
      setNewTaskTags(task.tags?.join(', ') || '');
    } else {
      setEditingTask(null);
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskType('WRITING');
      setNewTaskCategory('');
      setNewTaskPriority('NORMAL');
      setNewTaskDueDate('');
      setNewTaskTags('');
    }
    setIsDialogOpen(true);
  };

  const handleSaveTask = () => {
    if (!newTaskTitle.trim()) return;
    
    const taskData = {
      title: newTaskTitle,
      description: newTaskDescription || undefined,
      type: newTaskType,
      category: newTaskCategory || undefined,
      priority: newTaskPriority,
      status: editingTask?.status || 'OPEN' as TaskStatus,
      dueDate: newTaskDueDate || undefined,
      tags: newTaskTags ? newTaskTags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
    };
    
    if (editingTask) {
      updateTask(editingTask.id, taskData);
    } else {
      addTask(taskData);
    }
    
    setIsDialogOpen(false);
    toast({
      title: t('toast.success'),
      description: t('task.saved'),
    });
  };

  const handleDeleteTask = (id: string) => {
    deleteTask(id);
    toast({
      title: t('toast.success'),
      description: t('task.deleted'),
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    
    if (!over) return;
    
    const activeTask = tasks.find(t => t.id === active.id);
    if (!activeTask) return;
    
    let newStatus: TaskStatus | null = null;
    
    if (over.id === 'OPEN' || over.id === 'IN_PROGRESS' || over.id === 'DONE') {
      newStatus = over.id;
    } else {
      const overTask = tasks.find(t => t.id === over.id);
      if (overTask) {
        newStatus = overTask.status;
      }
    }
    
    if (newStatus && newStatus !== activeTask.status) {
      updateTask(activeTask.id, { status: newStatus });
    }
  };

  const draggedTask = activeId ? tasks.find(t => t.id === activeId) : null;

  return (
    <div className="space-y-6" data-testid="page-tasks">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-semibold tracking-tight" data-testid="text-tasks-title">
          {t('tasks.title')}
        </h1>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
            data-testid="button-list-view"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'kanban' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('kanban')}
            data-testid="button-kanban-view"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button onClick={() => openDialog()} data-testid="button-new-task">
            <Plus className="h-4 w-4 me-2" />
            {t('task.new')}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'all' | 'today' | 'week')}>
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-all">{t('tasks.all')}</TabsTrigger>
          <TabsTrigger value="today" data-testid="tab-today">{t('tasks.today')}</TabsTrigger>
          <TabsTrigger value="week" data-testid="tab-week">{t('tasks.week')}</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card data-testid="card-filters">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('tasks.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-10"
                data-testid="input-search-tasks"
              />
            </div>
            
            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as TaskStatus | 'ALL')}>
              <SelectTrigger className="w-[140px]" data-testid="select-filter-status">
                <SelectValue placeholder={t('tasks.filterByStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t('documents.all')}</SelectItem>
                {TASK_STATUSES.map(status => (
                  <SelectItem key={status} value={status}>
                    {t(`status.${status.toLowerCase()}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={(v) => setFilterType(v as TaskType | 'ALL')}>
              <SelectTrigger className="w-[140px]" data-testid="select-filter-type">
                <SelectValue placeholder={t('task.type')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t('documents.all')}</SelectItem>
                {TASK_TYPES.map(type => (
                  <SelectItem key={type} value={type}>
                    {t(`type.${type}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterPriority} onValueChange={(v) => setFilterPriority(v as TaskPriority | 'ALL')}>
              <SelectTrigger className="w-[140px]" data-testid="select-filter-priority">
                <SelectValue placeholder={t('tasks.filterByPriority')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t('documents.all')}</SelectItem>
                {TASK_PRIORITIES.map(priority => (
                  <SelectItem key={priority} value={priority}>
                    {t(`priority.${priority.toLowerCase()}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v as TaskCategory | 'ALL')}>
              <SelectTrigger className="w-[140px]" data-testid="select-filter-category">
                <SelectValue placeholder={t('tasks.filterByCategory')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t('documents.all')}</SelectItem>
                {TASK_CATEGORIES.map(category => (
                  <SelectItem key={category} value={category}>
                    {t(`category.${category.toLowerCase()}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {viewMode === 'list' ? (
        sortedTasks.length === 0 ? (
          <Card data-testid="card-no-tasks">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground mb-4">{t('tasks.noTasks')}</p>
              <Button onClick={() => openDialog()}>
                <Plus className="h-4 w-4 me-2" />
                {t('task.new')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {sortedTasks.map(task => (
              <TaskListItem
                key={task.id}
                task={task}
                onEdit={openDialog}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
        )
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 overflow-x-auto pb-4">
            {TASK_STATUSES.map(status => (
              <KanbanColumn
                key={status}
                status={status}
                tasks={tasksByStatus[status]}
                onEdit={openDialog}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
          <DragOverlay>
            {draggedTask ? (
              <div className="bg-card border rounded-card p-3 shadow-lg opacity-90">
                <p className="font-medium text-sm">{draggedTask.title}</p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingTask ? t('task.edit') : t('task.new')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label>{t('task.title')}</Label>
              <Input
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder={t('placeholder.title')}
                data-testid="input-task-title"
              />
            </div>
            
            <div className="space-y-2">
              <Label>{t('task.description')}</Label>
              <Textarea
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                placeholder={t('placeholder.content')}
                rows={3}
                data-testid="input-task-description"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('task.type')}</Label>
                <Select value={newTaskType} onValueChange={(v) => setNewTaskType(v as TaskType)}>
                  <SelectTrigger data-testid="select-task-type">
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
                <Label>{t('task.category')}</Label>
                <Select value={newTaskCategory} onValueChange={(v) => setNewTaskCategory(v as TaskCategory)}>
                  <SelectTrigger data-testid="select-task-category">
                    <SelectValue placeholder={t('category.other')} />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_CATEGORIES.map(category => (
                      <SelectItem key={category} value={category}>
                        {t(`category.${category.toLowerCase()}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('task.priority')}</Label>
                <Select value={newTaskPriority} onValueChange={(v) => setNewTaskPriority(v as TaskPriority)}>
                  <SelectTrigger data-testid="select-task-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_PRIORITIES.map(priority => (
                      <SelectItem key={priority} value={priority}>
                        {t(`priority.${priority.toLowerCase()}`)}
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
                  data-testid="input-task-date"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>{t('task.tags')}</Label>
              <Input
                value={newTaskTags}
                onChange={(e) => setNewTaskTags(e.target.value)}
                placeholder={t('placeholder.tags')}
                data-testid="input-task-tags"
              />
              <p className="text-xs text-muted-foreground">{uiLanguage === 'he' ? 'הפרד תגיות בפסיק' : 'Separate tags with commas'}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t('button.cancel')}
            </Button>
            <Button onClick={handleSaveTask} data-testid="button-save-task">
              {t('button.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
