import { Router, Request, Response } from 'express';
import { Task, CreateTaskRequest, UpdateTaskRequest, TaskStatus } from '../types/tasks';
import {
  sendTaskCreatedWebhook,
  sendTaskUpdatedWebhook,
  sendTaskDeletedWebhook,
  sendTaskStatusChangedWebhook
} from '../webhooks/webhook_sender';

const router = Router();

// In-memory task storage (can be replaced with database later)
let tasks: Task[] = [];

/**
 * Generate unique task ID
 */
function generateTaskId(): string {
  return `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * GET /api/tasks
 * Get all tasks
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    console.log('[TASKS API] GET /api/tasks - Fetching all tasks');
    res.json(tasks);
  } catch (error: any) {
    console.error('[TASKS API] Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks', message: error.message });
  }
});

/**
 * GET /api/tasks/:id
 * Get a specific task by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`[TASKS API] GET /api/tasks/${id}`);

    const task = tasks.find(t => t.id === id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error: any) {
    console.error('[TASKS API] Error fetching task:', error);
    res.status(500).json({ error: 'Failed to fetch task', message: error.message });
  }
});

/**
 * POST /api/tasks
 * Create a new task
 * Sends task_created webhook
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const taskData: CreateTaskRequest = req.body;
    console.log('[TASKS API] POST /api/tasks - Creating new task:', taskData.title);

    // Validate required fields
    if (!taskData.title || !taskData.type) {
      return res.status(400).json({ error: 'Missing required fields: title and type' });
    }

    // Create new task
    const now = new Date().toISOString();
    const newTask: Task = {
      id: generateTaskId(),
      title: taskData.title,
      description: taskData.description,
      type: taskData.type,
      category: taskData.category,
      status: taskData.status || 'OPEN',
      priority: taskData.priority || 'NORMAL',
      dueDate: taskData.dueDate,
      tags: taskData.tags || [],
      attachments: [],
      createdAt: now,
      updatedAt: now
    };

    // Add to storage
    tasks.push(newTask);

    console.log(`[TASKS API] Task created successfully: ${newTask.id}`);

    // Send webhook asynchronously (don't block response)
    sendTaskCreatedWebhook(newTask).catch(err => {
      console.error('[TASKS API] Webhook failed but task created:', err);
    });

    // Return created task
    res.status(201).json(newTask);
  } catch (error: any) {
    console.error('[TASKS API] Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task', message: error.message });
  }
});

/**
 * PUT /api/tasks/:id
 * Update an existing task
 * Sends task_updated or task_status_changed webhook
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates: UpdateTaskRequest = req.body;
    console.log(`[TASKS API] PUT /api/tasks/${id} - Updating task`);

    // Find task
    const taskIndex = tasks.findIndex(t => t.id === id);

    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const originalTask = tasks[taskIndex];
    const originalStatus = originalTask.status;

    // Update task
    const updatedTask: Task = {
      ...originalTask,
      ...updates,
      id: originalTask.id, // Preserve ID
      createdAt: originalTask.createdAt, // Preserve creation date
      updatedAt: new Date().toISOString()
    };

    tasks[taskIndex] = updatedTask;

    console.log(`[TASKS API] Task updated successfully: ${id}`);

    // Determine which webhook to send
    const statusChanged = updates.status && updates.status !== originalStatus;

    if (statusChanged) {
      console.log(`[TASKS API] Status changed from ${originalStatus} to ${updates.status}`);
      sendTaskStatusChangedWebhook(updatedTask).catch(err => {
        console.error('[TASKS API] Status change webhook failed:', err);
      });
    } else {
      sendTaskUpdatedWebhook(updatedTask).catch(err => {
        console.error('[TASKS API] Update webhook failed:', err);
      });
    }

    res.json(updatedTask);
  } catch (error: any) {
    console.error('[TASKS API] Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task', message: error.message });
  }
});

/**
 * DELETE /api/tasks/:id
 * Delete a task
 * Sends task_deleted webhook
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`[TASKS API] DELETE /api/tasks/${id}`);

    // Find task
    const taskIndex = tasks.findIndex(t => t.id === id);

    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const deletedTask = tasks[taskIndex];

    // Remove task
    tasks.splice(taskIndex, 1);

    console.log(`[TASKS API] Task deleted successfully: ${id}`);

    // Send webhook asynchronously
    sendTaskDeletedWebhook(deletedTask).catch(err => {
      console.error('[TASKS API] Delete webhook failed:', err);
    });

    res.json({ message: 'Task deleted successfully', task: deletedTask });
  } catch (error: any) {
    console.error('[TASKS API] Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task', message: error.message });
  }
});

export default router;
