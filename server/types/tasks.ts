export type TaskType = 'WRITING' | 'TRANSLATION' | 'LEARNING' | 'TECH';
export type TaskCategory = 'WORK' | 'PERSONAL' | 'STUDY' | 'PROJECT' | 'MEETING' | 'OTHER';
export type TaskStatus = 'OPEN' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface TaskAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: string;
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

export interface CreateTaskRequest {
  title: string;
  description?: string;
  type: TaskType;
  category?: TaskCategory;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  tags?: string[];
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  type?: TaskType;
  category?: TaskCategory;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  tags?: string[];
}
