import { Router, Request, Response } from 'express';

const router = Router();

/**
 * POST /api/incoming-webhook?secret=VALUE
 * Receive incoming webhooks from Make.com
 * Requires WEBHOOK_SECRET authentication via query parameter
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    console.log('[INCOMING WEBHOOK] Received webhook request');

    // Get secret from query parameter
    const providedSecret = req.query.secret;
    const expectedSecret = process.env.WEBHOOK_SECRET;

    // Validate secret exists in environment
    if (!expectedSecret) {
      console.error('[INCOMING WEBHOOK] WEBHOOK_SECRET not configured in environment');
      return res.status(500).json({ error: 'Webhook secret not configured on server' });
    }

    // Validate secret was provided
    if (!providedSecret) {
      console.error('[INCOMING WEBHOOK] No secret provided in query parameter');
      return res.status(401).json({ error: 'Unauthorized: Missing secret parameter' });
    }

    // Validate secret matches
    if (providedSecret !== expectedSecret) {
      console.error('[INCOMING WEBHOOK] Invalid secret provided');
      return res.status(401).json({ error: 'Unauthorized: Invalid secret' });
    }

    // Secret is valid, process webhook
    const payload = req.body;
    console.log('[INCOMING WEBHOOK] Authenticated webhook received:', {
      event: payload.event,
      taskId: payload.task?.id,
      timestamp: new Date().toISOString()
    });

    // Log full payload for debugging
    console.log('[INCOMING WEBHOOK] Full payload:', JSON.stringify(payload, null, 2));

    // Process webhook based on event type
    if (payload.event) {
      console.log(`[INCOMING WEBHOOK] Processing ${payload.event} event`);

      // Here you can add custom logic to process different event types
      switch (payload.event) {
        case 'task_created':
          console.log('[INCOMING WEBHOOK] Task created notification received');
          break;
        case 'task_updated':
          console.log('[INCOMING WEBHOOK] Task updated notification received');
          break;
        case 'task_deleted':
          console.log('[INCOMING WEBHOOK] Task deleted notification received');
          break;
        case 'task_status_changed':
          console.log('[INCOMING WEBHOOK] Task status changed notification received');
          break;
        default:
          console.log(`[INCOMING WEBHOOK] Unknown event type: ${payload.event}`);
      }
    }

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Webhook received successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('[INCOMING WEBHOOK] Error processing webhook:', error);
    res.status(500).json({
      error: 'Failed to process webhook',
      message: error.message
    });
  }
});

/**
 * GET /api/incoming-webhook
 * Health check endpoint (doesn't require authentication)
 */
router.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'ready',
    message: 'Incoming webhook endpoint is active. Use POST with ?secret=VALUE to send webhooks.',
    timestamp: new Date().toISOString()
  });
});

export default router;
