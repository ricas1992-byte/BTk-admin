import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { db, isConfigured as isFirebaseConfigured } from '../firebaseConfig';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc,
  onSnapshot,
  type Unsubscribe
} from 'firebase/firestore';

export type DocumentType = 'BOOK' | 'COURSE' | 'DRAFT' | 'STUDY' | 'FOUNDATION' | 'PROMPT' | 'NOTE';
export type TaskType = 'WRITING' | 'TRANSLATION' | 'LEARNING' | 'TECH';
export type TaskStatus = 'OPEN' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
export type TaskCategory = 'WORK' | 'PERSONAL' | 'STUDY' | 'PROJECT' | 'MEETING' | 'OTHER';
export type Language = 'he' | 'en' | 'ru' | 'ar' | 'es' | 'fr';

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

export interface TaskAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  type: TaskType;
  category?: TaskCategory;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  tags?: string[];
  attachments?: TaskAttachment[];
  createdAt?: string;
  updatedAt?: string;
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
  
  exportAllData: () => string;
  importAllData: (data: string) => boolean;
  clearAllData: () => void;
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
    'task.description': 'תיאור',
    'task.type': 'סוג',
    'task.category': 'קטגוריה',
    'task.status': 'סטטוס',
    'task.priority': 'עדיפות',
    'task.dueDate': 'תאריך יעד',
    'task.tags': 'תגיות',
    'task.attachments': 'קבצים מצורפים',
    'task.new': 'משימה חדשה',
    'task.edit': 'עריכת משימה',
    'task.delete': 'מחיקת משימה',
    'task.deleteConfirm': 'האם למחוק את המשימה?',
    'task.deleteWarning': 'פעולה זו אינה ניתנת לביטול.',
    'task.saved': 'המשימה נשמרה בהצלחה',
    'task.deleted': 'המשימה נמחקה',
    'tasks.title': 'משימות',
    'tasks.all': 'כל המשימות',
    'tasks.today': 'משימות היום',
    'tasks.week': 'משימות השבוע',
    'tasks.upcoming': 'משימות קרובות',
    'tasks.overdue': 'באיחור',
    'tasks.noTasks': 'אין משימות',
    'tasks.noTasksToday': 'אין משימות להיום',
    'tasks.noTasksWeek': 'אין משימות לשבוע',
    'tasks.search': 'חיפוש משימות...',
    'tasks.filter': 'סינון',
    'tasks.filterByStatus': 'לפי סטטוס',
    'tasks.filterByCategory': 'לפי קטגוריה',
    'tasks.filterByPriority': 'לפי עדיפות',
    'tasks.filterByTags': 'לפי תגיות',
    'tasks.listView': 'תצוגת רשימה',
    'tasks.kanbanView': 'תצוגת קנבן',
    'priority.low': 'נמוכה',
    'priority.normal': 'רגילה',
    'priority.high': 'גבוהה',
    'priority.urgent': 'דחופה',
    'category.work': 'עבודה',
    'category.personal': 'אישי',
    'category.study': 'לימודים',
    'category.project': 'פרויקט',
    'category.meeting': 'פגישה',
    'category.other': 'אחר',
    'kanban.open': 'פתוח',
    'kanban.inProgress': 'בתהליך',
    'kanban.done': 'הושלם',
    'kanban.dragHint': 'גרור משימות בין עמודות',
    'dashboard.upcomingTasks': 'משימות קרובות',
    'dashboard.viewAllTasks': 'צפה בכל המשימות',
    'dashboard.continueLearning': 'המשך למידה',
    'lang.he': 'עברית',
    'lang.en': 'English',
    'placeholder.title': 'הזן כותרת...',
    'placeholder.content': 'התחל לכתוב...',
    'placeholder.tags': 'הוסף תגית...',
    'placeholder.search': 'חיפוש...',
    'nav.settings': 'הגדרות',
    'settings.title': 'הגדרות',
    'settings.backup': 'גיבוי נתונים',
    'settings.export': 'ייצוא כל הנתונים',
    'settings.import': 'ייבוא נתונים',
    'settings.clear': 'מחק את כל הנתונים',
    'settings.exportSuccess': 'הנתונים יוצאו בהצלחה',
    'settings.importSuccess': 'הנתונים יובאו בהצלחה',
    'settings.importError': 'שגיאה בייבוא הנתונים',
    'settings.clearConfirm': 'האם אתה בטוח? פעולה זו תמחק את כל הנתונים!',
    'settings.clearSuccess': 'כל הנתונים נמחקו',
    'settings.statistics': 'סטטיסטיקות',
    'settings.totalDocuments': 'סה"כ מסמכים',
    'settings.totalCourses': 'סה"כ קורסים',
    'settings.totalTasks': 'סה"כ משימות',
    'settings.version': 'גרסה',
    'settings.dataOverview': 'סקירת נתונים',
    'settings.backupDescription': 'ייצוא וייבוא נתונים לגיבוי',
    'settings.appearance': 'מראה',
    'settings.appearanceDescription': 'התאם את הטמפרטורה וצבעי הממשק',
    'settings.darkMode': 'מצב כהה',
    'settings.darkModeDescription': 'שנה בין מצב בהיר לכהה',
    'toast.success': 'הצלחה',
    'toast.error': 'שגיאה',
    'toast.warning': 'אזהרה',
    'analytics.title': 'ניתוח',
    'analytics.totalCourses': 'סה"כ קורסים',
    'analytics.completedCourses': 'קורסים שהושלמו',
    'analytics.unitsCompleted': 'יחידות שהושלמו',
    'analytics.overallProgress': 'התקדמות כללית',
    'analytics.overallCompletion': 'השלמה כללית',
    'analytics.completionDescription': 'התקדמות הלמידה הכוללת שלך',
    'analytics.courseProgress': 'התקדמות לפי קורס',
    'analytics.progressDescription': 'יחידות שהושלמו בכל קורס',
    'analytics.detailedProgress': 'התקדמות מפורטת',
    'analytics.remaining': 'נותר',
    'analytics.noData': 'אין נתונים להצגה',
    'analytics.newCourse': 'קורס חדש',
    'analytics.createFirst': 'צור קורס ראשון',
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
    'task.description': 'Description',
    'task.type': 'Type',
    'task.category': 'Category',
    'task.status': 'Status',
    'task.priority': 'Priority',
    'task.dueDate': 'Due Date',
    'task.tags': 'Tags',
    'task.attachments': 'Attachments',
    'task.new': 'New Task',
    'task.edit': 'Edit Task',
    'task.delete': 'Delete Task',
    'task.deleteConfirm': 'Delete this task?',
    'task.deleteWarning': 'This action cannot be undone.',
    'task.saved': 'Task saved successfully',
    'task.deleted': 'Task deleted',
    'tasks.title': 'Tasks',
    'tasks.all': 'All Tasks',
    'tasks.today': "Today's Tasks",
    'tasks.week': "This Week's Tasks",
    'tasks.upcoming': 'Upcoming Tasks',
    'tasks.overdue': 'Overdue',
    'tasks.noTasks': 'No tasks',
    'tasks.noTasksToday': 'No tasks for today',
    'tasks.noTasksWeek': 'No tasks for this week',
    'tasks.search': 'Search tasks...',
    'tasks.filter': 'Filter',
    'tasks.filterByStatus': 'By Status',
    'tasks.filterByCategory': 'By Category',
    'tasks.filterByPriority': 'By Priority',
    'tasks.filterByTags': 'By Tags',
    'tasks.listView': 'List View',
    'tasks.kanbanView': 'Kanban View',
    'priority.low': 'Low',
    'priority.normal': 'Normal',
    'priority.high': 'High',
    'priority.urgent': 'Urgent',
    'category.work': 'Work',
    'category.personal': 'Personal',
    'category.study': 'Study',
    'category.project': 'Project',
    'category.meeting': 'Meeting',
    'category.other': 'Other',
    'kanban.open': 'Open',
    'kanban.inProgress': 'In Progress',
    'kanban.done': 'Done',
    'kanban.dragHint': 'Drag tasks between columns',
    'dashboard.upcomingTasks': 'Upcoming Tasks',
    'dashboard.viewAllTasks': 'View All Tasks',
    'dashboard.continueLearning': 'Continue Learning',
    'lang.he': 'עברית',
    'lang.en': 'English',
    'placeholder.title': 'Enter title...',
    'placeholder.content': 'Start writing...',
    'placeholder.tags': 'Add tag...',
    'placeholder.search': 'Search...',
    'nav.settings': 'Settings',
    'settings.title': 'Settings',
    'settings.backup': 'Data Backup',
    'settings.export': 'Export All Data',
    'settings.import': 'Import Data',
    'settings.clear': 'Clear All Data',
    'settings.exportSuccess': 'Data exported successfully',
    'settings.importSuccess': 'Data imported successfully',
    'settings.importError': 'Error importing data',
    'settings.clearConfirm': 'Are you sure? This will delete all data!',
    'settings.clearSuccess': 'All data cleared',
    'settings.statistics': 'Statistics',
    'settings.totalDocuments': 'Total Documents',
    'settings.totalCourses': 'Total Courses',
    'settings.totalTasks': 'Total Tasks',
    'settings.version': 'Version',
    'settings.dataOverview': 'Data Overview',
    'settings.backupDescription': 'Export and import data for backup',
    'settings.appearance': 'Appearance',
    'settings.appearanceDescription': 'Customize the look and feel of the interface',
    'settings.darkMode': 'Dark Mode',
    'settings.darkModeDescription': 'Switch between light and dark theme',
    'toast.success': 'Success',
    'toast.error': 'Error',
    'toast.warning': 'Warning',
    'analytics.title': 'Analytics',
    'analytics.totalCourses': 'Total Courses',
    'analytics.completedCourses': 'Completed Courses',
    'analytics.unitsCompleted': 'Units Completed',
    'analytics.overallProgress': 'Overall Progress',
    'analytics.overallCompletion': 'Overall Completion',
    'analytics.completionDescription': 'Your total learning progress',
    'analytics.courseProgress': 'Progress by Course',
    'analytics.progressDescription': 'Units completed per course',
    'analytics.detailedProgress': 'Detailed Progress',
    'analytics.remaining': 'Remaining',
    'analytics.noData': 'No data to display',
    'analytics.newCourse': 'New Course',
    'analytics.createFirst': 'Create First Course',
    'lang.ru': 'Русский',
    'lang.ar': 'العربية',
    'lang.es': 'Español',
    'lang.fr': 'Français',
  },
  ru: {
    'app.title': 'Система управления BTK',
    'nav.dashboard': 'Панель',
    'nav.documents': 'Документы',
    'nav.writing': 'Студия письма',
    'nav.learning': 'Учебный центр',
    'nav.language': 'Язык',
    'button.save': 'Сохранить',
    'button.create': 'Создать',
    'button.delete': 'Удалить',
    'button.edit': 'Редактировать',
    'button.export': 'Экспорт',
    'button.cancel': 'Отмена',
    'button.close': 'Закрыть',
    'button.add': 'Добавить',
    'button.new': 'Новый',
    'button.back': 'Назад',
    'button.readAloud': 'Читать вслух',
    'button.stop': 'Стоп',
    'status.open': 'Открыто',
    'status.in_progress': 'В процессе',
    'status.done': 'Выполнено',
    'type.BOOK': 'Книга',
    'type.COURSE': 'Курс',
    'type.DRAFT': 'Черновик',
    'type.STUDY': 'Учеба',
    'type.FOUNDATION': 'Основы',
    'type.PROMPT': 'Промпт',
    'type.NOTE': 'Заметка',
    'type.WRITING': 'Письмо',
    'type.TRANSLATION': 'Перевод',
    'type.LEARNING': 'Обучение',
    'type.TECH': 'Технологии',
    'dashboard.title': 'Панель',
    'dashboard.todayTasks': 'Задачи на сегодня',
    'dashboard.writingStatus': 'Статус написания',
    'dashboard.workJournal': 'Рабочий журнал',
    'dashboard.noTasks': 'Нет задач на сегодня',
    'dashboard.documentsCount': 'Всего документов',
    'dashboard.coursesCount': 'Всего курсов',
    'dashboard.tasksCount': 'Открытые задачи',
    'documents.title': 'Документы',
    'documents.new': 'Новый документ',
    'documents.filter': 'Фильтр',
    'documents.filterByType': 'По типу',
    'documents.filterByLanguage': 'По языку',
    'documents.filterByTags': 'По тегам',
    'documents.noDocuments': 'Нет документов',
    'documents.all': 'Все',
    'writing.title': 'Студия письма',
    'writing.titleField': 'Заголовок',
    'writing.typeField': 'Тип',
    'writing.languageField': 'Язык',
    'writing.tagsField': 'Теги',
    'writing.contentField': 'Содержание',
    'writing.autoSave': 'Автосохранение',
    'writing.lastSaved': 'Последнее сохранение',
    'writing.selectDocument': 'Выберите документ для редактирования или создайте новый',
    'learning.title': 'Учебный центр',
    'learning.courses': 'Курсы',
    'learning.progress': 'Прогресс',
    'learning.units': 'Разделы',
    'learning.completed': 'Завершено',
    'learning.noCourses': 'Нет курсов',
    'learning.noUnits': 'Нет разделов',
    'learning.markComplete': 'Отметить выполненным',
    'learning.unmarkComplete': 'Снять отметку',
    'task.title': 'Заголовок',
    'task.description': 'Описание',
    'task.type': 'Тип',
    'task.category': 'Категория',
    'task.status': 'Статус',
    'task.priority': 'Приоритет',
    'task.dueDate': 'Срок',
    'task.tags': 'Теги',
    'task.attachments': 'Вложения',
    'task.new': 'Новая задача',
    'task.edit': 'Редактировать задачу',
    'task.delete': 'Удалить задачу',
    'task.deleteConfirm': 'Удалить эту задачу?',
    'task.deleteWarning': 'Это действие нельзя отменить.',
    'task.saved': 'Задача сохранена',
    'task.deleted': 'Задача удалена',
    'tasks.title': 'Задачи',
    'tasks.all': 'Все задачи',
    'tasks.today': 'Задачи на сегодня',
    'tasks.week': 'Задачи на неделю',
    'tasks.upcoming': 'Предстоящие задачи',
    'tasks.overdue': 'Просроченные',
    'tasks.noTasks': 'Нет задач',
    'tasks.noTasksToday': 'Нет задач на сегодня',
    'tasks.noTasksWeek': 'Нет задач на эту неделю',
    'tasks.search': 'Поиск задач...',
    'tasks.filter': 'Фильтр',
    'tasks.filterByStatus': 'По статусу',
    'tasks.filterByCategory': 'По категории',
    'tasks.filterByPriority': 'По приоритету',
    'tasks.filterByTags': 'По тегам',
    'tasks.listView': 'Список',
    'tasks.kanbanView': 'Канбан',
    'priority.low': 'Низкий',
    'priority.normal': 'Обычный',
    'priority.high': 'Высокий',
    'priority.urgent': 'Срочный',
    'category.work': 'Работа',
    'category.personal': 'Личное',
    'category.study': 'Учёба',
    'category.project': 'Проект',
    'category.meeting': 'Встреча',
    'category.other': 'Другое',
    'kanban.open': 'Открыто',
    'kanban.inProgress': 'В процессе',
    'kanban.done': 'Выполнено',
    'kanban.dragHint': 'Перетащите задачи между колонками',
    'dashboard.upcomingTasks': 'Предстоящие задачи',
    'dashboard.viewAllTasks': 'Все задачи',
    'dashboard.continueLearning': 'Продолжить обучение',
    'lang.he': 'עברית',
    'lang.en': 'English',
    'lang.ru': 'Русский',
    'lang.ar': 'العربية',
    'lang.es': 'Español',
    'lang.fr': 'Français',
    'placeholder.title': 'Введите заголовок...',
    'placeholder.content': 'Начните писать...',
    'placeholder.tags': 'Добавить тег...',
    'placeholder.search': 'Поиск...',
    'nav.settings': 'Настройки',
    'settings.title': 'Настройки',
    'settings.backup': 'Резервное копирование',
    'settings.export': 'Экспорт всех данных',
    'settings.import': 'Импорт данных',
    'settings.clear': 'Очистить все данные',
    'settings.exportSuccess': 'Данные экспортированы',
    'settings.importSuccess': 'Данные импортированы',
    'settings.importError': 'Ошибка импорта данных',
    'settings.clearConfirm': 'Вы уверены? Это удалит все данные!',
    'settings.clearSuccess': 'Все данные очищены',
    'settings.statistics': 'Статистика',
    'settings.totalDocuments': 'Всего документов',
    'settings.totalCourses': 'Всего курсов',
    'settings.totalTasks': 'Всего задач',
    'settings.version': 'Версия',
    'settings.dataOverview': 'Обзор данных',
    'settings.backupDescription': 'Экспорт и импорт данных для резервного копирования',
    'settings.appearance': 'Внешний вид',
    'settings.appearanceDescription': 'Настройте внешний вид интерфейса',
    'settings.darkMode': 'Темный режим',
    'settings.darkModeDescription': 'Переключение между светлой и темной темой',
    'toast.success': 'Успех',
    'toast.error': 'Ошибка',
    'toast.warning': 'Предупреждение',
    'analytics.title': 'Аналитика',
    'analytics.totalCourses': 'Всего курсов',
    'analytics.completedCourses': 'Завершённые курсы',
    'analytics.unitsCompleted': 'Завершённые разделы',
    'analytics.overallProgress': 'Общий прогресс',
    'analytics.overallCompletion': 'Общее завершение',
    'analytics.completionDescription': 'Ваш общий прогресс обучения',
    'analytics.courseProgress': 'Прогресс по курсам',
    'analytics.progressDescription': 'Разделы, завершённые по каждому курсу',
    'analytics.detailedProgress': 'Детальный прогресс',
    'analytics.remaining': 'Осталось',
    'analytics.noData': 'Нет данных для отображения',
    'analytics.newCourse': 'Новый курс',
    'analytics.createFirst': 'Создать первый курс',
  },
  ar: {
    'app.title': 'نظام إدارة BTK',
    'nav.dashboard': 'لوحة التحكم',
    'nav.documents': 'المستندات',
    'nav.writing': 'استوديو الكتابة',
    'nav.learning': 'مركز التعلم',
    'nav.language': 'اللغة',
    'button.save': 'حفظ',
    'button.create': 'إنشاء',
    'button.delete': 'حذف',
    'button.edit': 'تحرير',
    'button.export': 'تصدير',
    'button.cancel': 'إلغاء',
    'button.close': 'إغلاق',
    'button.add': 'إضافة',
    'button.new': 'جديد',
    'button.back': 'رجوع',
    'button.readAloud': 'قراءة بصوت عالٍ',
    'button.stop': 'إيقاف',
    'status.open': 'مفتوح',
    'status.in_progress': 'قيد التنفيذ',
    'status.done': 'تم',
    'type.BOOK': 'كتاب',
    'type.COURSE': 'دورة',
    'type.DRAFT': 'مسودة',
    'type.STUDY': 'دراسة',
    'type.FOUNDATION': 'أساسيات',
    'type.PROMPT': 'موجه',
    'type.NOTE': 'ملاحظة',
    'type.WRITING': 'كتابة',
    'type.TRANSLATION': 'ترجمة',
    'type.LEARNING': 'تعلم',
    'type.TECH': 'تقنية',
    'dashboard.title': 'لوحة التحكم',
    'dashboard.todayTasks': 'مهام اليوم',
    'dashboard.writingStatus': 'حالة الكتابة',
    'dashboard.workJournal': 'سجل العمل',
    'dashboard.noTasks': 'لا توجد مهام لليوم',
    'dashboard.documentsCount': 'إجمالي المستندات',
    'dashboard.coursesCount': 'إجمالي الدورات',
    'dashboard.tasksCount': 'المهام المفتوحة',
    'documents.title': 'المستندات',
    'documents.new': 'مستند جديد',
    'documents.filter': 'تصفية',
    'documents.filterByType': 'حسب النوع',
    'documents.filterByLanguage': 'حسب اللغة',
    'documents.filterByTags': 'حسب الوسوم',
    'documents.noDocuments': 'لا توجد مستندات',
    'documents.all': 'الكل',
    'writing.title': 'استوديو الكتابة',
    'writing.titleField': 'العنوان',
    'writing.typeField': 'النوع',
    'writing.languageField': 'اللغة',
    'writing.tagsField': 'الوسوم',
    'writing.contentField': 'المحتوى',
    'writing.autoSave': 'حفظ تلقائي',
    'writing.lastSaved': 'آخر حفظ',
    'writing.selectDocument': 'اختر مستنداً للتحرير أو أنشئ جديداً',
    'learning.title': 'مركز التعلم',
    'learning.courses': 'الدورات',
    'learning.progress': 'التقدم',
    'learning.units': 'الوحدات',
    'learning.completed': 'مكتمل',
    'learning.noCourses': 'لا توجد دورات',
    'learning.noUnits': 'لا توجد وحدات',
    'learning.markComplete': 'تحديد كمكتمل',
    'learning.unmarkComplete': 'إلغاء التحديد',
    'task.title': 'العنوان',
    'task.description': 'الوصف',
    'task.type': 'النوع',
    'task.category': 'الفئة',
    'task.status': 'الحالة',
    'task.priority': 'الأولوية',
    'task.dueDate': 'تاريخ الاستحقاق',
    'task.tags': 'الوسوم',
    'task.attachments': 'المرفقات',
    'task.new': 'مهمة جديدة',
    'task.edit': 'تعديل المهمة',
    'task.delete': 'حذف المهمة',
    'task.deleteConfirm': 'هل تريد حذف هذه المهمة؟',
    'task.deleteWarning': 'لا يمكن التراجع عن هذا الإجراء.',
    'task.saved': 'تم حفظ المهمة بنجاح',
    'task.deleted': 'تم حذف المهمة',
    'tasks.title': 'المهام',
    'tasks.all': 'جميع المهام',
    'tasks.today': 'مهام اليوم',
    'tasks.week': 'مهام الأسبوع',
    'tasks.upcoming': 'المهام القادمة',
    'tasks.overdue': 'متأخرة',
    'tasks.noTasks': 'لا توجد مهام',
    'tasks.noTasksToday': 'لا توجد مهام لليوم',
    'tasks.noTasksWeek': 'لا توجد مهام لهذا الأسبوع',
    'tasks.search': 'البحث عن مهام...',
    'tasks.filter': 'تصفية',
    'tasks.filterByStatus': 'حسب الحالة',
    'tasks.filterByCategory': 'حسب الفئة',
    'tasks.filterByPriority': 'حسب الأولوية',
    'tasks.filterByTags': 'حسب الوسوم',
    'tasks.listView': 'عرض القائمة',
    'tasks.kanbanView': 'عرض كانبان',
    'priority.low': 'منخفضة',
    'priority.normal': 'عادية',
    'priority.high': 'عالية',
    'priority.urgent': 'عاجلة',
    'category.work': 'عمل',
    'category.personal': 'شخصي',
    'category.study': 'دراسة',
    'category.project': 'مشروع',
    'category.meeting': 'اجتماع',
    'category.other': 'أخرى',
    'kanban.open': 'مفتوح',
    'kanban.inProgress': 'قيد التنفيذ',
    'kanban.done': 'تم',
    'kanban.dragHint': 'اسحب المهام بين الأعمدة',
    'dashboard.upcomingTasks': 'المهام القادمة',
    'dashboard.viewAllTasks': 'عرض جميع المهام',
    'dashboard.continueLearning': 'متابعة التعلم',
    'lang.he': 'עברית',
    'lang.en': 'English',
    'lang.ru': 'Русский',
    'lang.ar': 'العربية',
    'lang.es': 'Español',
    'lang.fr': 'Français',
    'placeholder.title': 'أدخل العنوان...',
    'placeholder.content': 'ابدأ الكتابة...',
    'placeholder.tags': 'إضافة وسم...',
    'placeholder.search': 'بحث...',
    'nav.settings': 'الإعدادات',
    'settings.title': 'الإعدادات',
    'settings.backup': 'النسخ الاحتياطي',
    'settings.export': 'تصدير جميع البيانات',
    'settings.import': 'استيراد البيانات',
    'settings.clear': 'مسح جميع البيانات',
    'settings.exportSuccess': 'تم تصدير البيانات بنجاح',
    'settings.importSuccess': 'تم استيراد البيانات بنجاح',
    'settings.importError': 'خطأ في استيراد البيانات',
    'settings.clearConfirm': 'هل أنت متأكد؟ سيتم حذف جميع البيانات!',
    'settings.clearSuccess': 'تم مسح جميع البيانات',
    'settings.statistics': 'الإحصائيات',
    'settings.totalDocuments': 'إجمالي المستندات',
    'settings.totalCourses': 'إجمالي الدورات',
    'settings.totalTasks': 'إجمالي المهام',
    'settings.version': 'الإصدار',
    'settings.dataOverview': 'نظرة عامة على البيانات',
    'settings.backupDescription': 'تصدير واستيراد البيانات للنسخ الاحتياطي',
    'settings.appearance': 'المظهر',
    'settings.appearanceDescription': 'تخصيص مظهر الواجهة',
    'settings.darkMode': 'الوضع الداكن',
    'settings.darkModeDescription': 'التبديل بين السمة الفاتحة والداكنة',
    'toast.success': 'نجاح',
    'toast.error': 'خطأ',
    'toast.warning': 'تحذير',
    'analytics.title': 'التحليلات',
    'analytics.totalCourses': 'إجمالي الدورات',
    'analytics.completedCourses': 'الدورات المكتملة',
    'analytics.unitsCompleted': 'الوحدات المكتملة',
    'analytics.overallProgress': 'التقدم الكلي',
    'analytics.overallCompletion': 'الإنجاز الكلي',
    'analytics.completionDescription': 'تقدم التعلم الكلي الخاص بك',
    'analytics.courseProgress': 'التقدم حسب الدورة',
    'analytics.progressDescription': 'الوحدات المكتملة لكل دورة',
    'analytics.detailedProgress': 'التقدم المفصل',
    'analytics.remaining': 'المتبقي',
    'analytics.noData': 'لا توجد بيانات للعرض',
    'analytics.newCourse': 'دورة جديدة',
    'analytics.createFirst': 'إنشاء أول دورة',
  },
  es: {
    'app.title': 'Sistema de Gestión BTK',
    'nav.dashboard': 'Panel',
    'nav.documents': 'Documentos',
    'nav.writing': 'Estudio de Escritura',
    'nav.learning': 'Centro de Aprendizaje',
    'nav.language': 'Idioma',
    'button.save': 'Guardar',
    'button.create': 'Crear',
    'button.delete': 'Eliminar',
    'button.edit': 'Editar',
    'button.export': 'Exportar',
    'button.cancel': 'Cancelar',
    'button.close': 'Cerrar',
    'button.add': 'Añadir',
    'button.new': 'Nuevo',
    'button.back': 'Atrás',
    'button.readAloud': 'Leer en voz alta',
    'button.stop': 'Detener',
    'status.open': 'Abierta',
    'status.in_progress': 'En progreso',
    'status.done': 'Completada',
    'type.BOOK': 'Libro',
    'type.COURSE': 'Curso',
    'type.DRAFT': 'Borrador',
    'type.STUDY': 'Estudio',
    'type.FOUNDATION': 'Fundamentos',
    'type.PROMPT': 'Prompt',
    'type.NOTE': 'Nota',
    'type.WRITING': 'Escritura',
    'type.TRANSLATION': 'Traducción',
    'type.LEARNING': 'Aprendizaje',
    'type.TECH': 'Tecnología',
    'dashboard.title': 'Panel',
    'dashboard.todayTasks': 'Tareas de Hoy',
    'dashboard.writingStatus': 'Estado de Escritura',
    'dashboard.workJournal': 'Diario de Trabajo',
    'dashboard.noTasks': 'No hay tareas para hoy',
    'dashboard.documentsCount': 'Total de Documentos',
    'dashboard.coursesCount': 'Total de Cursos',
    'dashboard.tasksCount': 'Tareas Abiertas',
    'documents.title': 'Documentos',
    'documents.new': 'Nuevo Documento',
    'documents.filter': 'Filtrar',
    'documents.filterByType': 'Por Tipo',
    'documents.filterByLanguage': 'Por Idioma',
    'documents.filterByTags': 'Por Etiquetas',
    'documents.noDocuments': 'No hay documentos',
    'documents.all': 'Todos',
    'writing.title': 'Estudio de Escritura',
    'writing.titleField': 'Título',
    'writing.typeField': 'Tipo',
    'writing.languageField': 'Idioma',
    'writing.tagsField': 'Etiquetas',
    'writing.contentField': 'Contenido',
    'writing.autoSave': 'Guardado Automático',
    'writing.lastSaved': 'Último Guardado',
    'writing.selectDocument': 'Selecciona un documento para editar o crea uno nuevo',
    'learning.title': 'Centro de Aprendizaje',
    'learning.courses': 'Cursos',
    'learning.progress': 'Progreso',
    'learning.units': 'Unidades',
    'learning.completed': 'Completado',
    'learning.noCourses': 'No hay cursos',
    'learning.noUnits': 'No hay unidades',
    'learning.markComplete': 'Marcar como completado',
    'learning.unmarkComplete': 'Desmarcar',
    'task.title': 'Título',
    'task.description': 'Descripción',
    'task.type': 'Tipo',
    'task.category': 'Categoría',
    'task.status': 'Estado',
    'task.priority': 'Prioridad',
    'task.dueDate': 'Fecha límite',
    'task.tags': 'Etiquetas',
    'task.attachments': 'Adjuntos',
    'task.new': 'Nueva Tarea',
    'task.edit': 'Editar Tarea',
    'task.delete': 'Eliminar Tarea',
    'task.deleteConfirm': '¿Eliminar esta tarea?',
    'task.deleteWarning': 'Esta acción no se puede deshacer.',
    'task.saved': 'Tarea guardada con éxito',
    'task.deleted': 'Tarea eliminada',
    'tasks.title': 'Tareas',
    'tasks.all': 'Todas las Tareas',
    'tasks.today': 'Tareas de Hoy',
    'tasks.week': 'Tareas de la Semana',
    'tasks.upcoming': 'Próximas Tareas',
    'tasks.overdue': 'Vencidas',
    'tasks.noTasks': 'No hay tareas',
    'tasks.noTasksToday': 'No hay tareas para hoy',
    'tasks.noTasksWeek': 'No hay tareas esta semana',
    'tasks.search': 'Buscar tareas...',
    'tasks.filter': 'Filtrar',
    'tasks.filterByStatus': 'Por Estado',
    'tasks.filterByCategory': 'Por Categoría',
    'tasks.filterByPriority': 'Por Prioridad',
    'tasks.filterByTags': 'Por Etiquetas',
    'tasks.listView': 'Vista de Lista',
    'tasks.kanbanView': 'Vista Kanban',
    'priority.low': 'Baja',
    'priority.normal': 'Normal',
    'priority.high': 'Alta',
    'priority.urgent': 'Urgente',
    'category.work': 'Trabajo',
    'category.personal': 'Personal',
    'category.study': 'Estudio',
    'category.project': 'Proyecto',
    'category.meeting': 'Reunión',
    'category.other': 'Otro',
    'kanban.open': 'Abierto',
    'kanban.inProgress': 'En Proceso',
    'kanban.done': 'Hecho',
    'kanban.dragHint': 'Arrastra tareas entre columnas',
    'dashboard.upcomingTasks': 'Próximas Tareas',
    'dashboard.viewAllTasks': 'Ver Todas las Tareas',
    'dashboard.continueLearning': 'Continuar Aprendiendo',
    'lang.he': 'עברית',
    'lang.en': 'English',
    'lang.ru': 'Русский',
    'lang.ar': 'العربية',
    'lang.es': 'Español',
    'lang.fr': 'Français',
    'placeholder.title': 'Ingrese título...',
    'placeholder.content': 'Comience a escribir...',
    'placeholder.tags': 'Añadir etiqueta...',
    'placeholder.search': 'Buscar...',
    'nav.settings': 'Configuración',
    'settings.title': 'Configuración',
    'settings.backup': 'Copia de Seguridad',
    'settings.export': 'Exportar Todos los Datos',
    'settings.import': 'Importar Datos',
    'settings.clear': 'Borrar Todos los Datos',
    'settings.exportSuccess': 'Datos exportados exitosamente',
    'settings.importSuccess': 'Datos importados exitosamente',
    'settings.importError': 'Error al importar datos',
    'settings.clearConfirm': '¿Estás seguro? ¡Esto eliminará todos los datos!',
    'settings.clearSuccess': 'Todos los datos borrados',
    'settings.statistics': 'Estadísticas',
    'settings.totalDocuments': 'Total de Documentos',
    'settings.totalCourses': 'Total de Cursos',
    'settings.totalTasks': 'Total de Tareas',
    'settings.version': 'Versión',
    'settings.dataOverview': 'Resumen de Datos',
    'settings.backupDescription': 'Exportar e importar datos para copia de seguridad',
    'settings.appearance': 'Apariencia',
    'settings.appearanceDescription': 'Personaliza el aspecto de la interfaz',
    'settings.darkMode': 'Modo Oscuro',
    'settings.darkModeDescription': 'Cambia entre tema claro y oscuro',
    'toast.success': 'Éxito',
    'toast.error': 'Error',
    'toast.warning': 'Advertencia',
    'analytics.title': 'Analíticas',
    'analytics.totalCourses': 'Total de Cursos',
    'analytics.completedCourses': 'Cursos Completados',
    'analytics.unitsCompleted': 'Unidades Completadas',
    'analytics.overallProgress': 'Progreso General',
    'analytics.overallCompletion': 'Finalización General',
    'analytics.completionDescription': 'Tu progreso total de aprendizaje',
    'analytics.courseProgress': 'Progreso por Curso',
    'analytics.progressDescription': 'Unidades completadas por curso',
    'analytics.detailedProgress': 'Progreso Detallado',
    'analytics.remaining': 'Restante',
    'analytics.noData': 'No hay datos para mostrar',
    'analytics.newCourse': 'Nuevo Curso',
    'analytics.createFirst': 'Crear Primer Curso',
  },
  fr: {
    'app.title': 'Système de Gestion BTK',
    'nav.dashboard': 'Tableau de Bord',
    'nav.documents': 'Documents',
    'nav.writing': 'Studio d\'Écriture',
    'nav.learning': 'Centre d\'Apprentissage',
    'nav.language': 'Langue',
    'button.save': 'Enregistrer',
    'button.create': 'Créer',
    'button.delete': 'Supprimer',
    'button.edit': 'Modifier',
    'button.export': 'Exporter',
    'button.cancel': 'Annuler',
    'button.close': 'Fermer',
    'button.add': 'Ajouter',
    'button.new': 'Nouveau',
    'button.back': 'Retour',
    'button.readAloud': 'Lire à voix haute',
    'button.stop': 'Arrêter',
    'status.open': 'Ouvert',
    'status.in_progress': 'En cours',
    'status.done': 'Terminé',
    'type.BOOK': 'Livre',
    'type.COURSE': 'Cours',
    'type.DRAFT': 'Brouillon',
    'type.STUDY': 'Étude',
    'type.FOUNDATION': 'Fondamentaux',
    'type.PROMPT': 'Prompt',
    'type.NOTE': 'Note',
    'type.WRITING': 'Écriture',
    'type.TRANSLATION': 'Traduction',
    'type.LEARNING': 'Apprentissage',
    'type.TECH': 'Technologie',
    'dashboard.title': 'Tableau de Bord',
    'dashboard.todayTasks': 'Tâches du Jour',
    'dashboard.writingStatus': 'Statut d\'Écriture',
    'dashboard.workJournal': 'Journal de Travail',
    'dashboard.noTasks': 'Pas de tâches pour aujourd\'hui',
    'dashboard.documentsCount': 'Total des Documents',
    'dashboard.coursesCount': 'Total des Cours',
    'dashboard.tasksCount': 'Tâches Ouvertes',
    'documents.title': 'Documents',
    'documents.new': 'Nouveau Document',
    'documents.filter': 'Filtrer',
    'documents.filterByType': 'Par Type',
    'documents.filterByLanguage': 'Par Langue',
    'documents.filterByTags': 'Par Tags',
    'documents.noDocuments': 'Aucun document',
    'documents.all': 'Tous',
    'writing.title': 'Studio d\'Écriture',
    'writing.titleField': 'Titre',
    'writing.typeField': 'Type',
    'writing.languageField': 'Langue',
    'writing.tagsField': 'Tags',
    'writing.contentField': 'Contenu',
    'writing.autoSave': 'Sauvegarde Auto',
    'writing.lastSaved': 'Dernière Sauvegarde',
    'writing.selectDocument': 'Sélectionnez un document à modifier ou créez-en un nouveau',
    'learning.title': 'Centre d\'Apprentissage',
    'learning.courses': 'Cours',
    'learning.progress': 'Progression',
    'learning.units': 'Unités',
    'learning.completed': 'Terminé',
    'learning.noCourses': 'Aucun cours',
    'learning.noUnits': 'Aucune unité',
    'learning.markComplete': 'Marquer comme terminé',
    'learning.unmarkComplete': 'Décocher',
    'task.title': 'Titre',
    'task.description': 'Description',
    'task.type': 'Type',
    'task.category': 'Catégorie',
    'task.status': 'Statut',
    'task.priority': 'Priorité',
    'task.dueDate': 'Date Limite',
    'task.tags': 'Tags',
    'task.attachments': 'Pièces jointes',
    'task.new': 'Nouvelle Tâche',
    'task.edit': 'Modifier la Tâche',
    'task.delete': 'Supprimer la Tâche',
    'task.deleteConfirm': 'Supprimer cette tâche?',
    'task.deleteWarning': 'Cette action est irréversible.',
    'task.saved': 'Tâche enregistrée avec succès',
    'task.deleted': 'Tâche supprimée',
    'tasks.title': 'Tâches',
    'tasks.all': 'Toutes les Tâches',
    'tasks.today': 'Tâches du Jour',
    'tasks.week': 'Tâches de la Semaine',
    'tasks.upcoming': 'Tâches à Venir',
    'tasks.overdue': 'En retard',
    'tasks.noTasks': 'Pas de tâches',
    'tasks.noTasksToday': 'Pas de tâches pour aujourd\'hui',
    'tasks.noTasksWeek': 'Pas de tâches cette semaine',
    'tasks.search': 'Rechercher des tâches...',
    'tasks.filter': 'Filtrer',
    'tasks.filterByStatus': 'Par Statut',
    'tasks.filterByCategory': 'Par Catégorie',
    'tasks.filterByPriority': 'Par Priorité',
    'tasks.filterByTags': 'Par Tags',
    'tasks.listView': 'Vue Liste',
    'tasks.kanbanView': 'Vue Kanban',
    'priority.low': 'Basse',
    'priority.normal': 'Normale',
    'priority.high': 'Haute',
    'priority.urgent': 'Urgente',
    'category.work': 'Travail',
    'category.personal': 'Personnel',
    'category.study': 'Études',
    'category.project': 'Projet',
    'category.meeting': 'Réunion',
    'category.other': 'Autre',
    'kanban.open': 'Ouvert',
    'kanban.inProgress': 'En Cours',
    'kanban.done': 'Terminé',
    'kanban.dragHint': 'Glissez les tâches entre les colonnes',
    'dashboard.upcomingTasks': 'Tâches à Venir',
    'dashboard.viewAllTasks': 'Voir Toutes les Tâches',
    'dashboard.continueLearning': 'Continuer à Apprendre',
    'lang.he': 'עברית',
    'lang.en': 'English',
    'lang.ru': 'Русский',
    'lang.ar': 'العربية',
    'lang.es': 'Español',
    'lang.fr': 'Français',
    'placeholder.title': 'Entrez le titre...',
    'placeholder.content': 'Commencez à écrire...',
    'placeholder.tags': 'Ajouter un tag...',
    'placeholder.search': 'Rechercher...',
    'nav.settings': 'Paramètres',
    'settings.title': 'Paramètres',
    'settings.backup': 'Sauvegarde des Données',
    'settings.export': 'Exporter Toutes les Données',
    'settings.import': 'Importer des Données',
    'settings.clear': 'Effacer Toutes les Données',
    'settings.exportSuccess': 'Données exportées avec succès',
    'settings.importSuccess': 'Données importées avec succès',
    'settings.importError': 'Erreur lors de l\'import',
    'settings.clearConfirm': 'Êtes-vous sûr? Cela supprimera toutes les données!',
    'settings.clearSuccess': 'Toutes les données effacées',
    'settings.statistics': 'Statistiques',
    'settings.totalDocuments': 'Total des Documents',
    'settings.totalCourses': 'Total des Cours',
    'settings.totalTasks': 'Total des Tâches',
    'settings.version': 'Version',
    'settings.dataOverview': 'Aperçu des Données',
    'settings.backupDescription': 'Exporter et importer des données pour la sauvegarde',
    'settings.appearance': 'Apparence',
    'settings.appearanceDescription': 'Personnalisez l\'apparence de l\'interface',
    'settings.darkMode': 'Mode Sombre',
    'settings.darkModeDescription': 'Basculer entre thème clair et sombre',
    'toast.success': 'Succès',
    'toast.error': 'Erreur',
    'toast.warning': 'Attention',
    'analytics.title': 'Analytique',
    'analytics.totalCourses': 'Total des Cours',
    'analytics.completedCourses': 'Cours Terminés',
    'analytics.unitsCompleted': 'Unités Terminées',
    'analytics.overallProgress': 'Progression Globale',
    'analytics.overallCompletion': 'Achèvement Global',
    'analytics.completionDescription': 'Votre progression totale d\'apprentissage',
    'analytics.courseProgress': 'Progression par Cours',
    'analytics.progressDescription': 'Unités terminées par cours',
    'analytics.detailedProgress': 'Progression Détaillée',
    'analytics.remaining': 'Restant',
    'analytics.noData': 'Aucune donnée à afficher',
    'analytics.newCourse': 'Nouveau Cours',
    'analytics.createFirst': 'Créer le Premier Cours',
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

async function syncItemToFirestore<T extends { id: string }>(
  collectionName: string, 
  item: T
): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  try {
    await setDoc(doc(db, collectionName, item.id), item, { merge: true });
  } catch (error) {
    console.warn(`Failed to sync ${collectionName} item to Firestore:`, error);
  }
}

async function deleteFromFirestore(
  collectionName: string, 
  itemId: string
): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  try {
    await deleteDoc(doc(db, collectionName, itemId));
  } catch (error) {
    console.warn(`Failed to delete from Firestore ${collectionName}:`, error);
  }
}

async function syncCollectionToFirestore<T extends { id: string }>(
  collectionName: string, 
  items: T[]
): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  try {
    for (const item of items) {
      await setDoc(doc(db, collectionName, item.id), item, { merge: true });
    }
  } catch (error) {
    console.warn(`Failed to sync ${collectionName} to Firestore:`, error);
  }
}

function subscribeToFirestore<T>(
  collectionName: string, 
  setter: (items: T[]) => void,
  localStorageKey: string
): Unsubscribe | null {
  if (!isFirebaseConfigured || !db) return null;
  try {
    const colRef = collection(db, collectionName);
    return onSnapshot(colRef, (snapshot) => {
      if (!snapshot.empty) {
        const items = snapshot.docs.map(doc => doc.data() as T);
        setter(items);
        saveToStorage(localStorageKey, items);
      }
    }, (error) => {
      console.warn(`Firestore subscription error for ${collectionName}:`, error);
    });
  } catch (error) {
    console.warn(`Failed to subscribe to ${collectionName}:`, error);
    return null;
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
  
  const initialSyncDone = useRef(false);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    
    const unsubscribers: (Unsubscribe | null)[] = [];
    
    unsubscribers.push(
      subscribeToFirestore<Document>('documents', setDocuments, STORAGE_KEYS.documents)
    );
    unsubscribers.push(
      subscribeToFirestore<Course>('courses', setCourses, STORAGE_KEYS.courses)
    );
    unsubscribers.push(
      subscribeToFirestore<Task>('tasks', setTasks, STORAGE_KEYS.tasks)
    );
    unsubscribers.push(
      subscribeToFirestore<LearningProgress>('learning', setLearningProgress, STORAGE_KEYS.learning)
    );
    
    if (!initialSyncDone.current) {
      initialSyncDone.current = true;
      const localDocs = loadFromStorage<Document[]>(STORAGE_KEYS.documents, []);
      const localCourses = loadFromStorage<Course[]>(STORAGE_KEYS.courses, []);
      const localTasks = loadFromStorage<Task[]>(STORAGE_KEYS.tasks, []);
      const localLearning = loadFromStorage<LearningProgress[]>(STORAGE_KEYS.learning, []);
      
      if (localDocs.length > 0) {
        syncCollectionToFirestore('documents', localDocs);
      }
      if (localCourses.length > 0) {
        syncCollectionToFirestore('courses', localCourses);
      }
      if (localTasks.length > 0) {
        syncCollectionToFirestore('tasks', localTasks);
      }
      if (localLearning.length > 0) {
        syncCollectionToFirestore('learning', localLearning.map(lp => ({ ...lp, id: lp.courseId })));
      }
    }
    
    return () => {
      unsubscribers.forEach(unsub => unsub?.());
    };
  }, []);

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
    const isRTL = uiLanguage === 'he' || uiLanguage === 'ar';
    
    if (isRTL) {
      html.setAttribute('dir', 'rtl');
      html.classList.remove('ltr');
      html.classList.add('rtl');
    } else {
      html.setAttribute('dir', 'ltr');
      html.classList.remove('rtl');
      html.classList.add('ltr');
    }
    html.setAttribute('lang', uiLanguage);
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
    syncItemToFirestore('documents', newDoc);
    return newDoc;
  }, []);

  const updateDocument = useCallback((id: string, updates: Partial<Omit<Document, 'id' | 'createdAt'>>) => {
    setDocuments(prev => {
      const updated = prev.map(doc => 
        doc.id === id ? { ...doc, ...updates, updatedAt: new Date().toISOString() } : doc
      );
      const updatedDoc = updated.find(d => d.id === id);
      if (updatedDoc) {
        syncItemToFirestore('documents', updatedDoc);
      }
      return updated;
    });
  }, []);

  const deleteDocument = useCallback((id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    deleteFromFirestore('documents', id);
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
    syncItemToFirestore('courses', newCourse);
    return newCourse;
  }, []);

  const updateCourse = useCallback((id: string, updates: Partial<Omit<Course, 'id'>>) => {
    setCourses(prev => {
      const updated = prev.map(course => 
        course.id === id ? { ...course, ...updates } : course
      );
      const updatedCourse = updated.find(c => c.id === id);
      if (updatedCourse) {
        syncItemToFirestore('courses', updatedCourse);
      }
      return updated;
    });
  }, []);

  const deleteCourse = useCallback((id: string) => {
    setCourses(prev => prev.filter(course => course.id !== id));
    setLearningProgress(prev => prev.filter(lp => lp.courseId !== id));
    deleteFromFirestore('courses', id);
    deleteFromFirestore('learning', id);
  }, []);

  const getCourse = useCallback((id: string) => {
    return courses.find(course => course.id === id);
  }, [courses]);

  const addTask = useCallback((task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task => {
    const now = new Date().toISOString();
    const newTask: Task = {
      ...task,
      id: generateId(),
      priority: task.priority || 'NORMAL',
      createdAt: now,
      updatedAt: now,
    };
    setTasks(prev => [...prev, newTask]);
    syncItemToFirestore('tasks', newTask);
    return newTask;
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
    setTasks(prev => {
      const updated = prev.map(task => 
        task.id === id ? { ...task, ...updates, updatedAt: new Date().toISOString() } : task
      );
      const updatedTask = updated.find(t => t.id === id);
      if (updatedTask) {
        syncItemToFirestore('tasks', updatedTask);
      }
      return updated;
    });
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
    deleteFromFirestore('tasks', id);
  }, []);

  const updateLearningProgress = useCallback((courseId: string, completedUnits: string[]) => {
    setLearningProgress(prev => {
      const existing = prev.find(lp => lp.courseId === courseId);
      const updatedProgress = { courseId, completedUnits, id: courseId };
      if (existing) {
        const updated = prev.map(lp => 
          lp.courseId === courseId ? { ...lp, completedUnits } : lp
        );
        syncItemToFirestore('learning', updatedProgress);
        return updated;
      }
      syncItemToFirestore('learning', updatedProgress);
      return [...prev, { courseId, completedUnits }];
    });
  }, []);

  const getLearningProgress = useCallback((courseId: string) => {
    return learningProgress.find(lp => lp.courseId === courseId);
  }, [learningProgress]);

  const setUiLanguage = useCallback((lang: Language) => {
    setUiLanguageState(lang);
  }, []);

  const exportAllData = useCallback(() => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      documents,
      courses,
      tasks,
      learningProgress,
      uiLanguage,
    };
    return JSON.stringify(data, null, 2);
  }, [documents, courses, tasks, learningProgress, uiLanguage]);

  const importAllData = useCallback((jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData);
      if (!data.version) {
        return false;
      }
      if (data.documents && Array.isArray(data.documents)) {
        setDocuments(data.documents);
        saveToStorage(STORAGE_KEYS.documents, data.documents);
        syncCollectionToFirestore('documents', data.documents);
      }
      if (data.courses && Array.isArray(data.courses)) {
        setCourses(data.courses);
        saveToStorage(STORAGE_KEYS.courses, data.courses);
        syncCollectionToFirestore('courses', data.courses);
      }
      if (data.tasks && Array.isArray(data.tasks)) {
        setTasks(data.tasks);
        saveToStorage(STORAGE_KEYS.tasks, data.tasks);
        syncCollectionToFirestore('tasks', data.tasks);
      }
      if (data.learningProgress && Array.isArray(data.learningProgress)) {
        setLearningProgress(data.learningProgress);
        saveToStorage(STORAGE_KEYS.learning, data.learningProgress);
        syncCollectionToFirestore('learning', data.learningProgress.map((lp: LearningProgress) => ({ ...lp, id: lp.courseId })));
      }
      if (data.uiLanguage && (data.uiLanguage === 'he' || data.uiLanguage === 'en')) {
        setUiLanguageState(data.uiLanguage);
        saveToStorage(STORAGE_KEYS.language, data.uiLanguage);
      }
      return true;
    } catch (e) {
      console.error('Failed to import data:', e);
      return false;
    }
  }, []);

  const clearAllData = useCallback(() => {
    documents.forEach(doc => deleteFromFirestore('documents', doc.id));
    courses.forEach(course => {
      deleteFromFirestore('courses', course.id);
      deleteFromFirestore('learning', course.id);
    });
    tasks.forEach(task => deleteFromFirestore('tasks', task.id));
    
    setDocuments([]);
    setCourses([]);
    setTasks([]);
    setLearningProgress([]);
    saveToStorage(STORAGE_KEYS.documents, []);
    saveToStorage(STORAGE_KEYS.courses, []);
    saveToStorage(STORAGE_KEYS.tasks, []);
    saveToStorage(STORAGE_KEYS.learning, []);
  }, [documents, courses, tasks]);

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
    exportAllData,
    importAllData,
    clearAllData,
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
