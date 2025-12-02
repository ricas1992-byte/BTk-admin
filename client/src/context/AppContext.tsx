import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export type DocumentType = 'BOOK' | 'COURSE' | 'DRAFT' | 'STUDY' | 'FOUNDATION' | 'PROMPT' | 'NOTE';
export type TaskType = 'WRITING' | 'TRANSLATION' | 'LEARNING' | 'TECH';
export type TaskStatus = 'OPEN' | 'IN_PROGRESS' | 'DONE';
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
    'toast.success': 'הצלחה',
    'toast.error': 'שגיאה',
    'toast.warning': 'אזהרה',
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
    'toast.success': 'Success',
    'toast.error': 'Error',
    'toast.warning': 'Warning',
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
    'task.type': 'Тип',
    'task.status': 'Статус',
    'task.dueDate': 'Срок',
    'task.new': 'Новая задача',
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
    'toast.success': 'Успех',
    'toast.error': 'Ошибка',
    'toast.warning': 'Предупреждение',
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
    'task.type': 'النوع',
    'task.status': 'الحالة',
    'task.dueDate': 'تاريخ الاستحقاق',
    'task.new': 'مهمة جديدة',
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
    'toast.success': 'نجاح',
    'toast.error': 'خطأ',
    'toast.warning': 'تحذير',
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
    'task.type': 'Tipo',
    'task.status': 'Estado',
    'task.dueDate': 'Fecha límite',
    'task.new': 'Nueva Tarea',
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
    'toast.success': 'Éxito',
    'toast.error': 'Error',
    'toast.warning': 'Advertencia',
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
    'task.type': 'Type',
    'task.status': 'Statut',
    'task.dueDate': 'Date Limite',
    'task.new': 'Nouvelle Tâche',
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
    'toast.success': 'Succès',
    'toast.error': 'Erreur',
    'toast.warning': 'Attention',
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
      }
      if (data.courses && Array.isArray(data.courses)) {
        setCourses(data.courses);
        saveToStorage(STORAGE_KEYS.courses, data.courses);
      }
      if (data.tasks && Array.isArray(data.tasks)) {
        setTasks(data.tasks);
        saveToStorage(STORAGE_KEYS.tasks, data.tasks);
      }
      if (data.learningProgress && Array.isArray(data.learningProgress)) {
        setLearningProgress(data.learningProgress);
        saveToStorage(STORAGE_KEYS.learning, data.learningProgress);
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
    setDocuments([]);
    setCourses([]);
    setTasks([]);
    setLearningProgress([]);
    saveToStorage(STORAGE_KEYS.documents, []);
    saveToStorage(STORAGE_KEYS.courses, []);
    saveToStorage(STORAGE_KEYS.tasks, []);
    saveToStorage(STORAGE_KEYS.learning, []);
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
