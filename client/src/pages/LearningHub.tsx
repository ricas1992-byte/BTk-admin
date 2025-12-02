import { useState, useRef, useEffect, useMemo } from 'react';
import { useApp, type Course, type Unit } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  BookOpen,
  CheckCircle2,
  Circle,
  Play,
  Square,
  Trash2,
  Pencil,
  ChevronDown,
  ChevronUp,
  Volume2,
  TrendingUp,
  Award,
  Target,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

interface CourseCardProps {
  course: Course;
  isExpanded: boolean;
  onToggle: () => void;
}

function CourseCard({ course, isExpanded, onToggle }: CourseCardProps) {
  const { 
    t, 
    uiLanguage, 
    updateCourse, 
    deleteCourse, 
    getLearningProgress, 
    updateLearningProgress 
  } = useApp();
  const { toast } = useToast();
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(course.title);
  const [isAddUnitDialogOpen, setIsAddUnitDialogOpen] = useState(false);
  const [newUnitTitle, setNewUnitTitle] = useState('');
  const [newUnitBody, setNewUnitBody] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingUnitId, setSpeakingUnitId] = useState<string | null>(null);
  
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  const progress = getLearningProgress(course.id);
  const completedUnits = progress?.completedUnits || [];
  const progressPercent = course.units.length > 0 
    ? Math.round((completedUnits.length / course.units.length) * 100)
    : 0;

  const toggleUnitComplete = (unitId: string) => {
    const newCompleted = completedUnits.includes(unitId)
      ? completedUnits.filter(id => id !== unitId)
      : [...completedUnits, unitId];
    updateLearningProgress(course.id, newCompleted);
  };

  const handleSaveEdit = () => {
    if (!editTitle.trim()) return;
    updateCourse(course.id, { title: editTitle });
    setIsEditDialogOpen(false);
    toast({
      title: uiLanguage === 'he' ? 'נשמר' : 'Saved',
      description: uiLanguage === 'he' ? 'הקורס עודכן' : 'Course updated',
    });
  };

  const handleAddUnit = () => {
    if (!newUnitTitle.trim()) return;
    const newUnit: Unit = {
      id: generateId(),
      title: newUnitTitle,
      body: newUnitBody,
    };
    updateCourse(course.id, { units: [...course.units, newUnit] });
    setNewUnitTitle('');
    setNewUnitBody('');
    setIsAddUnitDialogOpen(false);
    toast({
      title: uiLanguage === 'he' ? 'נוסף' : 'Added',
      description: uiLanguage === 'he' ? 'יחידה חדשה נוספה' : 'New unit added',
    });
  };

  const handleDeleteUnit = (unitId: string) => {
    updateCourse(course.id, { 
      units: course.units.filter(u => u.id !== unitId) 
    });
    const newCompleted = completedUnits.filter(id => id !== unitId);
    updateLearningProgress(course.id, newCompleted);
  };

  const speakText = (text: string, unitId: string) => {
    if (isSpeaking && speakingUnitId === unitId) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpeakingUnitId(null);
      return;
    }

    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'he-IL';
    utterance.rate = 0.9;
    
    const voices = window.speechSynthesis.getVoices();
    const hebrewVoice = voices.find(v => v.lang.startsWith('he'));
    if (hebrewVoice) {
      utterance.voice = hebrewVoice;
    }

    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingUnitId(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeakingUnitId(null);
    };

    speechRef.current = utterance;
    setIsSpeaking(true);
    setSpeakingUnitId(unitId);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <Card className="overflow-hidden" data-testid={`card-course-${course.id}`}>
      <CardHeader 
        className="cursor-pointer hover-elevate"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <BookOpen className="h-5 w-5 flex-shrink-0 text-primary" />
            <CardTitle className="text-lg truncate">{course.title}</CardTitle>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary">
              {completedUnits.length}/{course.units.length}
            </Badge>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </div>
        </div>
        <Progress value={progressPercent} className="mt-3 h-2" />
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="flex items-center justify-between gap-2 mb-4 pb-4 border-b">
            <span className="text-sm text-muted-foreground">
              {progressPercent}% {t('learning.completed')}
            </span>
            <div className="flex gap-2">
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" data-testid={`button-edit-course-${course.id}`}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {uiLanguage === 'he' ? 'ערוך קורס' : 'Edit Course'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>{t('task.title')}</Label>
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        data-testid="input-edit-course-title"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                      {t('button.cancel')}
                    </Button>
                    <Button onClick={handleSaveEdit} data-testid="button-save-course">
                      {t('button.save')}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    data-testid={`button-delete-course-${course.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {uiLanguage === 'he' ? 'למחוק את הקורס?' : 'Delete course?'}
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
                      onClick={() => deleteCourse(course.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {t('button.delete')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {course.units.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {t('learning.noUnits')}
            </p>
          ) : (
            <div className="space-y-3">
              {course.units.map((unit, index) => {
                const isCompleted = completedUnits.includes(unit.id);
                const isCurrentlySpeaking = isSpeaking && speakingUnitId === unit.id;

                return (
                  <div 
                    key={unit.id}
                    className={`p-4 rounded-lg border ${
                      isCompleted ? 'bg-green-500/10 border-green-500/30' : 'bg-muted/50'
                    }`}
                    data-testid={`unit-${unit.id}`}
                  >
                    <div className="flex items-start gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="flex-shrink-0 mt-0.5"
                        onClick={() => toggleUnitComplete(unit.id)}
                        data-testid={`button-toggle-unit-${unit.id}`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <Circle className="h-5 w-5" />
                        )}
                      </Button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-muted-foreground">
                            {index + 1}.
                          </span>
                          <h4 className={`font-medium ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                            {unit.title}
                          </h4>
                        </div>

                        {unit.body && (
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {unit.body}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-1 flex-shrink-0">
                        {unit.body && (
                          <Button
                            variant={isCurrentlySpeaking ? 'default' : 'ghost'}
                            size="icon"
                            onClick={() => speakText(unit.body, unit.id)}
                            data-testid={`button-speak-${unit.id}`}
                          >
                            {isCurrentlySpeaking ? (
                              <Square className="h-4 w-4" />
                            ) : (
                              <Volume2 className="h-4 w-4" />
                            )}
                          </Button>
                        )}

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              data-testid={`button-delete-unit-${unit.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                {uiLanguage === 'he' ? 'למחוק את היחידה?' : 'Delete unit?'}
                              </AlertDialogTitle>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t('button.cancel')}</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteUnit(unit.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                {t('button.delete')}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <Dialog open={isAddUnitDialogOpen} onOpenChange={setIsAddUnitDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full mt-4"
                data-testid={`button-add-unit-${course.id}`}
              >
                <Plus className="h-4 w-4 me-2" />
                {uiLanguage === 'he' ? 'הוסף יחידה' : 'Add Unit'}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {uiLanguage === 'he' ? 'יחידה חדשה' : 'New Unit'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>{t('task.title')}</Label>
                  <Input
                    value={newUnitTitle}
                    onChange={(e) => setNewUnitTitle(e.target.value)}
                    placeholder={t('placeholder.title')}
                    data-testid="input-new-unit-title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('writing.contentField')}</Label>
                  <Textarea
                    value={newUnitBody}
                    onChange={(e) => setNewUnitBody(e.target.value)}
                    placeholder={t('placeholder.content')}
                    rows={5}
                    data-testid="textarea-new-unit-body"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddUnitDialogOpen(false)}>
                  {t('button.cancel')}
                </Button>
                <Button onClick={handleAddUnit} data-testid="button-save-unit">
                  {t('button.add')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      )}
    </Card>
  );
}

const CHART_COLORS = ['#D4AF37', '#22c55e', '#3b82f6', '#a855f7', '#ef4444', '#14b8a6'];

function LearningAnalytics() {
  const { t, courses, learningProgress } = useApp();

  const stats = useMemo(() => {
    let totalUnits = 0;
    let completedUnits = 0;
    let completedCourses = 0;

    const courseData = courses.map(course => {
      const progress = learningProgress.find(p => p.courseId === course.id);
      const completed = progress?.completedUnits.length || 0;
      const total = course.units.length;
      
      totalUnits += total;
      completedUnits += completed;
      
      const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
      if (percent === 100 && total > 0) completedCourses++;
      
      return {
        name: course.title.length > 15 ? course.title.substring(0, 15) + '...' : course.title,
        fullName: course.title,
        completed,
        remaining: total - completed,
        total,
        percent,
      };
    });

    const overallPercent = totalUnits > 0 
      ? Math.round((completedUnits / totalUnits) * 100) 
      : 0;

    const pieData = [
      { name: t('learning.completed'), value: completedUnits },
      { name: t('analytics.remaining'), value: totalUnits - completedUnits },
    ];

    return {
      totalCourses: courses.length,
      completedCourses,
      totalUnits,
      completedUnits,
      overallPercent,
      courseData,
      pieData,
    };
  }, [courses, learningProgress, t]);

  if (courses.length === 0) {
    return (
      <Card data-testid="card-analytics-empty">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg text-muted-foreground">{t('analytics.noData')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" data-testid="section-analytics">
      <div className="grid gap-4 md:grid-cols-4">
        <Card data-testid="stat-total-courses">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalCourses}</p>
                <p className="text-sm text-muted-foreground">{t('analytics.totalCourses')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="stat-completed-courses">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Award className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completedCourses}</p>
                <p className="text-sm text-muted-foreground">{t('analytics.completedCourses')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="stat-total-units">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Target className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completedUnits}/{stats.totalUnits}</p>
                <p className="text-sm text-muted-foreground">{t('analytics.unitsCompleted')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="stat-overall-progress">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.overallPercent}%</p>
                <p className="text-sm text-muted-foreground">{t('analytics.overallProgress')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card data-testid="chart-progress-pie">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              {t('analytics.overallCompletion')}
            </CardTitle>
            <CardDescription>{t('analytics.completionDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {stats.pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#22c55e' : '#374151'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="chart-course-progress">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              {t('analytics.courseProgress')}
            </CardTitle>
            <CardDescription>{t('analytics.progressDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.courseData} layout="vertical">
                  <XAxis type="number" domain={[0, 'dataMax']} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={100}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-popover border rounded-lg p-3 shadow-lg">
                            <p className="font-medium">{data.fullName}</p>
                            <p className="text-sm text-muted-foreground">
                              {data.completed}/{data.total} ({data.percent}%)
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="completed" stackId="a" fill="#22c55e" name={t('learning.completed')} />
                  <Bar dataKey="remaining" stackId="a" fill="#374151" name={t('analytics.remaining')} />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-course-details">
        <CardHeader>
          <CardTitle>{t('analytics.detailedProgress')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.courseData.map((course, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium truncate flex-1">{course.fullName}</span>
                  <Badge variant={course.percent === 100 ? 'default' : 'secondary'}>
                    {course.completed}/{course.total}
                  </Badge>
                </div>
                <Progress value={course.percent} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LearningHub() {
  const { t, uiLanguage, courses, addCourse } = useApp();
  const { toast } = useToast();
  
  const [isNewCourseDialogOpen, setIsNewCourseDialogOpen] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);

  const handleCreateCourse = () => {
    if (!newCourseTitle.trim()) return;
    
    const newCourse = addCourse({
      documentId: '',
      title: newCourseTitle,
      units: [],
    });
    
    setNewCourseTitle('');
    setIsNewCourseDialogOpen(false);
    setExpandedCourseId(newCourse.id);
    
    toast({
      title: uiLanguage === 'he' ? 'נוצר' : 'Created',
      description: uiLanguage === 'he' ? 'קורס חדש נוצר' : 'New course created',
    });
  };

  return (
    <div className="space-y-6" data-testid="page-learning-hub">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold" data-testid="text-learning-title">
          {t('learning.title')}
        </h1>
        
        <Dialog open={isNewCourseDialogOpen} onOpenChange={setIsNewCourseDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-course">
              <Plus className="h-4 w-4 me-2" />
              {t('analytics.newCourse')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {t('analytics.newCourse')}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t('task.title')}</Label>
                <Input
                  value={newCourseTitle}
                  onChange={(e) => setNewCourseTitle(e.target.value)}
                  placeholder={t('placeholder.title')}
                  data-testid="input-new-course-title"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewCourseDialogOpen(false)}>
                {t('button.cancel')}
              </Button>
              <Button onClick={handleCreateCourse} data-testid="button-create-course">
                {t('button.create')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="courses" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="courses" className="gap-2" data-testid="tab-courses">
            <BookOpen className="h-4 w-4" />
            {t('learning.courses')}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2" data-testid="tab-analytics">
            <BarChart3 className="h-4 w-4" />
            {t('analytics.title')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="mt-6">
          {courses.length === 0 ? (
            <Card data-testid="card-no-courses">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg text-muted-foreground mb-4">{t('learning.noCourses')}</p>
                <Button onClick={() => setIsNewCourseDialogOpen(true)}>
                  <Plus className="h-4 w-4 me-2" />
                  {t('analytics.createFirst')}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {courses.map(course => (
                <CourseCard
                  key={course.id}
                  course={course}
                  isExpanded={expandedCourseId === course.id}
                  onToggle={() => setExpandedCourseId(
                    expandedCourseId === course.id ? null : course.id
                  )}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <LearningAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}
