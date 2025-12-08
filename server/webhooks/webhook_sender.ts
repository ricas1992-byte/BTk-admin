import axios from 'axios';

interface WebhookPayload {
  event: 'task_created' | 'task_updated' | 'task_deleted' | 'task_status_changed';
  task: {
    id: string;
    title: string;
    description?: string;
    type: string;
    category?: string;
    status: string;
    priority: string;
    dueDate?: string;
    tags?: string[];
    attachments?: any[];
    createdAt?: string;
    updatedAt?: string;
    [key: string]: any;
  };
}

interface WebhookResult {
  success: boolean;
  attempts: number;
  error?: string;
}

const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff: 1s, 2s, 4s

/**
 * Unified webhook sender with retry logic and error handling
 */
export async function sendWebhook(payload: WebhookPayload): Promise<WebhookResult> {
  const webhookUrl = process.env.WEBHOOK_URL;

  if (!webhookUrl) {
    console.error('[WEBHOOK] WEBHOOK_URL not configured in environment');
    return {
      success: false,
      attempts: 0,
      error: 'WEBHOOK_URL not configured'
    };
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      console.log(`[WEBHOOK] Sending ${payload.event} for task ${payload.task.id} (attempt ${attempt + 1}/${MAX_RETRIES})`);

      const response = await axios.post(webhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      });

      if (response.status >= 200 && response.status < 300) {
        console.log(`[WEBHOOK] Successfully sent ${payload.event} for task ${payload.task.id}`);
        return {
          success: true,
          attempts: attempt + 1
        };
      }

      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error: any) {
      lastError = error;
      console.error(`[WEBHOOK] Attempt ${attempt + 1}/${MAX_RETRIES} failed:`, error.message);

      // Don't retry on 4xx errors (except 429 rate limit)
      if (error.response?.status && error.response.status >= 400 && error.response.status < 500 && error.response.status !== 429) {
        console.error(`[WEBHOOK] Client error ${error.response.status}, not retrying`);
        return {
          success: false,
          attempts: attempt + 1,
          error: `HTTP ${error.response.status}: ${error.message}`
        };
      }

      // Wait before retry (except on last attempt)
      if (attempt < MAX_RETRIES - 1) {
        const delay = RETRY_DELAYS[attempt];
        console.log(`[WEBHOOK] Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // All retries failed
  console.error(`[WEBHOOK] All ${MAX_RETRIES} attempts failed for ${payload.event}`);
  return {
    success: false,
    attempts: MAX_RETRIES,
    error: lastError?.message || 'Unknown error'
  };
}

/**
 * Helper functions for specific webhook events
 */

export async function sendTaskCreatedWebhook(task: any): Promise<WebhookResult> {
  return sendWebhook({
    event: 'task_created',
    task
  });
}

export async function sendTaskUpdatedWebhook(task: any): Promise<WebhookResult> {
  return sendWebhook({
    event: 'task_updated',
    task
  });
}

export async function sendTaskDeletedWebhook(task: any): Promise<WebhookResult> {
  return sendWebhook({
    event: 'task_deleted',
    task
  });
}

export async function sendTaskStatusChangedWebhook(task: any): Promise<WebhookResult> {
  return sendWebhook({
    event: 'task_status_changed',
    task
  });
}
