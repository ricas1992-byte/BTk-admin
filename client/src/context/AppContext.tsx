import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export type DocumentType = 'BOOK' | 'COURSE' | 'DRAFT' | 'STUDY' | 'FOUNDATION' | 'PROMPT' | 'NOTE';
export type TaskType = 'WRITING' | 'TRANSLATION' | 'LEARNING' | 'TECH';
export type TaskStatus = 'OPEN' | 'IN_PROGRESS' | 'DONE';
export type Language = 'he' | 'en';

export interface Document {
  id: string;
  title: string;
  type: DocumentType;
  language: Language;
  tags: string[];
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Unit {
  id: string;
  title: string;
  body: string;
}

export interface Course {
  id: string;
  documentId: string;
  title: string;
  units: Unit[];
}

export interface Task {
  id: string;
  title: string;
  type: TaskType;
  status: TaskStatus;
  dueDate?: string;
}

export interface LearningProgress {
  courseId: string;
  completedUnits: string[];
}

interface AppState {
  documents: Document[];
  courses: Course[];
  tasks: Task[];
  learningProgress: LearningProgress[];
  uiLanguage: Language;
}

interface AppContextType extends AppState {
  addDocument: (doc: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>) => Document;
  updateDocument: (id: string, updates: Partial<Omit<Document, 'id' | 'createdAt'>>) => void;
  deleteDocument: (id: string) => void;
  getDocument: (id: string) => Document | undefined;
  
  addCourse: (course: Omit<Course, 'id'>) => Course;
  updateCourse: (id: string, updates: Partial<Omit<Course, 'id'>>) => void;
  deleteCourse: (id: string) => void;
  getCourse: (id: string) => Course | undefined;
  
  addTask: (task: Omit<Task, 'id'>) => Task;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id'>>) => void;
  deleteTask: (id: string) => void;
  
  updateLearningProgress: (courseId: string, completedUnits: string[]) => void;
  getLearningProgress: (courseId: string) => LearningProgress | undefined;
  
  setUiLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const STORAGE_KEYS = {
  documents: 'btk_documents',
  courses: 'btk_courses',
  tasks: 'btk_tasks',
  learning: 'btk_learning',
  language: 'btk_language',
};

const translations: Record<Language, Record<string, string>> = {
  he: {
    'app.title': 'מערכת ניהול Beyond the Keys',
    'nav.dashboard': 'לוח בקרה',
    'nav.documents': 'מסמכים',
    'nav.writing': 'סטודיו כתיבה',
    'nav.learning': 'מרכז למידה',
    'nav.language': 'שפה',
    'button.save': 'שמור',
    'button.create': 'צור',
    'button.delete': 'מחק',
    'button.edit': 'ערוך',
    'button.export': 'ייצוא',
    'button.cancel': 'ביטול',
    'button.close': 'סגור',
    'button.add': 'הוסף',
    'button.new': 'חדש',
    'button.back': 'חזור',
    'button.readAloud': 'הקראה',
    'button.stop': 'עצור',
    'status.open': 'פתוחה',
    'status.in_progress': 'בתהליך',
    'status.done': 'הושלמה',
    'type.BOOK': 'ספר',
    'type.COURSE': 'קורס',
    'type.DRAFT': 'טיוטה',
    'type.STUDY': 'לימוד',
    'type.FOUNDATION': 'יסודות',
    'type.PROMPT': 'פרומפט',
    'type.NOTE': 'הערה',
    'type.WRITING': 'כתיבה',
    'type.TRANSLATION': 'תרגום',
    'type.LEARNING': 'למידה',
    'type.TECH': 'טכנולוגיה',
    'dashboard.title': 'לוח בקרה',
    'dashboard.todayTasks': 'משימות היום',
    'dashboard.writingStatus': 'מצב כתיבה',
    'dashboard.workJournal': 'יומן עבודה',
    'dashboard.noTasks': 'אין משימות להיום',
    'dashboard.documentsCount': 'סה"כ מסמכים',
    'dashboard.coursesCount': 'סה"כ קורסים',
    'dashboard.tasksCount': 'משימות פתוחות',
    'documents.title': 'מסמכים',
    'documents.new': 'מסמך חדש',
    'documents.filter': 'סינון',
    'documents.filterByType': 'לפי סוג',
    'documents.filterByLanguage': 'לפי שפה',
    'documents.filterByTags': 'לפי תגיות',
    'documents.noDocuments': 'אין מסמכים',
    'documents.all': 'הכל',
    'writing.title': 'סטודיו כתיבה',
    'writing.titleField': 'כותרת',
    'writing.typeField': 'סוג',
    'writing.languageField': 'שפה',
    'writing.tagsField': 'תגיות',
    'writing.contentField': 'תוכן',
    'writing.autoSave': 'שמירה אוטומטית',
    'writing.lastSaved': 'נשמר לאחרונה',
    'writing.selectDocument': 'בחר מסמך לעריכה או צור חדש',
    'learning.title': 'מרכז למידה',
    'learning.courses': 'קורסים',
    'learning.progress': 'התקדמות',
    'learning.units': 'יחידות',
    'learning.completed': 'הושלם',
    'learning.noCourses': 'אין קורסים',
    'learning.noUnits': 'אין יחידות',
    'learning.markComplete': 'סמן כהושלם',
    'learning.unmarkComplete': 'בטל סימון',
    'task.title': 'כותרת',
    'task.type': 'סוג',
    'task.status': 'סטטוס',
    'task.dueDate': 'תאריך יעד',
    'task.new': 'משימה חדשה',
    'lang.he': 'עברית',
    'lang.en': 'English',
    'placeholder.title': 'הזן כותרת...',
    'placeholder.content': 'התחל לכתוב...',
    'placeholder.tags': 'הוסף תגית...',
    'placeholder.search': 'חיפוש...',
  },
  en: {
    'app.title': 'BTK Management System',
    'nav.dashboard': 'Dashboard',
    'nav.documents': 'Documents',
    'nav.writing': 'Writing Studio',
    'nav.learning': 'Learning Hub',
    'nav.language': 'Language',
    'button.save': 'Save',
    'button.create': 'Create',
    'button.delete': 'Delete',
    'button.edit': 'Edit',
    'button.export': 'Export',
    'button.cancel': 'Cancel',
    'button.close': 'Close',
    'button.add': 'Add',
    'button.new': 'New',
    'button.back': 'Back',
    'button.readAloud': 'Read Aloud',
    'button.stop': 'Stop',
    'status.open': 'Open',
    'status.in_progress': 'In Progress',
    'status.done': 'Done',
    'type.BOOK': 'Book',
    'type.COURSE': 'Course',
    'type.DRAFT': 'Draft',
    'type.STUDY': 'Study',
    'type.FOUNDATION': 'Foundation',
    'type.PROMPT': 'Prompt',
    'type.NOTE': 'Note',
    'type.WRITING': 'Writing',
    'type.TRANSLATION': 'Translation',
    'type.LEARNING': 'Learning',
    'type.TECH': 'Tech',
    'dashboard.title': 'Dashboard',
    'dashboard.todayTasks': "Today's Tasks",
    'dashboard.writingStatus': 'Writing Status',
    'dashboard.workJournal': 'Work Journal',
    'dashboard.noTasks': 'No tasks for today',
    'dashboard.documentsCount': 'Total Documents',
    'dashboard.coursesCount': 'Total Courses',
    'dashboard.tasksCount': 'Open Tasks',
    'documents.title': 'Documents',
    'documents.new': 'New Document',
    'documents.filter': 'Filter',
    'documents.filterByType': 'By Type',
    'documents.filterByLanguage': 'By Language',
    'documents.filterByTags': 'By Tags',
    'documents.noDocuments': 'No documents',
    'documents.all': 'All',
    'writing.title': 'Writing Studio',
    'writing.titleField': 'Title',
    'writing.typeField': 'Type',
    'writing.languageField': 'Language',
    'writing.tagsField': 'Tags',
    'writing.contentField': 'Content',
    'writing.autoSave': 'Auto Save',
    'writing.lastSaved': 'Last Saved',
    'writing.selectDocument': 'Select a document to edit or create new',
    'learning.title': 'Learning Hub',
    'learning.courses': 'Courses',
    'learning.progress': 'Progress',
    'learning.units': 'Units',
    'learning.completed': 'Completed',
    'learning.noCourses': 'No courses',
    'learning.noUnits': 'No units',
    'learning.markComplete': 'Mark Complete',
    'learning.unmarkComplete': 'Unmark',
    'task.title': 'Title',
    'task.type': 'Type',
    'task.status': 'Status',
    'task.dueDate': 'Due Date',
    'task.new': 'New Task',
    'lang.he': 'עברית',
    'lang.en': 'English',
    'placeholder.title': 'Enter title...',
    'placeholder.content': 'Start writing...',
    'placeholder.tags': 'Add tag...',
    'placeholder.search': 'Search...',
  },
};

const AppContext = createContext<AppContextType | null>(null);

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

function loadFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<Document[]>(() => 
    loadFromStorage(STORAGE_KEYS.documents, [])
  );
  const [courses, setCourses] = useState<Course[]>(() => 
    loadFromStorage(STORAGE_KEYS.courses, [])
  );
  const [tasks, setTasks] = useState<Task[]>(() => 
    loadFromStorage(STORAGE_KEYS.tasks, [])
  );
  const [learningProgress, setLearningProgress] = useState<LearningProgress[]>(() => 
    loadFromStorage(STORAGE_KEYS.learning, [])
  );
  const [uiLanguage, setUiLanguageState] = useState<Language>(() => 
    loadFromStorage(STORAGE_KEYS.language, 'he' as Language)
  );

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.documents, documents);
  }, [documents]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.courses, courses);
  }, [courses]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.tasks, tasks);
  }, [tasks]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.learning, learningProgress);
  }, [learningProgress]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.language, uiLanguage);
    const html = document.documentElement;
    if (uiLanguage === 'he') {
      html.setAttribute('dir', 'rtl');
      html.setAttribute('lang', 'he');
      html.classList.remove('ltr');
      html.classList.add('rtl');
    } else {
      html.setAttribute('dir', 'ltr');
      html.setAttribute('lang', 'en');
      html.classList.remove('rtl');
      html.classList.add('ltr');
    }
  }, [uiLanguage]);

  const t = useCallback((key: string): string => {
    return translations[uiLanguage][key] || key;
  }, [uiLanguage]);

  const addDocument = useCallback((doc: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>): Document => {
    const now = new Date().toISOString();
    const newDoc: Document = {
      ...doc,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    setDocuments(prev => [...prev, newDoc]);
    return newDoc;
  }, []);

  const updateDocument = useCallback((id: string, updates: Partial<Omit<Document, 'id' | 'createdAt'>>) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === id ? { ...doc, ...updates, updatedAt: new Date().toISOString() } : doc
    ));
  }, []);

  const deleteDocument = useCallback((id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  }, []);

  const getDocument = useCallback((id: string) => {
    return documents.find(doc => doc.id === id);
  }, [documents]);

  const addCourse = useCallback((course: Omit<Course, 'id'>): Course => {
    const newCourse: Course = {
      ...course,
      id: generateId(),
    };
    setCourses(prev => [...prev, newCourse]);
    return newCourse;
  }, []);

  const updateCourse = useCallback((id: string, updates: Partial<Omit<Course, 'id'>>) => {
    setCourses(prev => prev.map(course => 
      course.id === id ? { ...course, ...updates } : course
    ));
  }, []);

  const deleteCourse = useCallback((id: string) => {
    setCourses(prev => prev.filter(course => course.id !== id));
    setLearningProgress(prev => prev.filter(lp => lp.courseId !== id));
  }, []);

  const getCourse = useCallback((id: string) => {
    return courses.find(course => course.id === id);
  }, [courses]);

  const addTask = useCallback((task: Omit<Task, 'id'>): Task => {
    const newTask: Task = {
      ...task,
      id: generateId(),
    };
    setTasks(prev => [...prev, newTask]);
    return newTask;
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Omit<Task, 'id'>>) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  }, []);

  const updateLearningProgress = useCallback((courseId: string, completedUnits: string[]) => {
    setLearningProgress(prev => {
      const existing = prev.find(lp => lp.courseId === courseId);
      if (existing) {
        return prev.map(lp => 
          lp.courseId === courseId ? { ...lp, completedUnits } : lp
        );
      }
      return [...prev, { courseId, completedUnits }];
    });
  }, []);

  const getLearningProgress = useCallback((courseId: string) => {
    return learningProgress.find(lp => lp.courseId === courseId);
  }, [learningProgress]);

  const setUiLanguage = useCallback((lang: Language) => {
    setUiLanguageState(lang);
  }, []);

  const value: AppContextType = {
    documents,
    courses,
    tasks,
    learningProgress,
    uiLanguage,
    addDocument,
    updateDocument,
    deleteDocument,
    getDocument,
    addCourse,
    updateCourse,
    deleteCourse,
    getCourse,
    addTask,
    updateTask,
    deleteTask,
    updateLearningProgress,
    getLearningProgress,
    setUiLanguage,
    t,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
